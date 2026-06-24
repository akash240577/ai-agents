# MedHub Integration Test Patterns — Annotated Reference

## Pattern 1: Domain Model Test

Test that a domain model loads correctly from a real DB row.

```php
#[Group('integration')]
class ResponseModelTest extends IntegrationTestCase
{
    /**
     * @given a seeded evaluation response row in the database
     * @when  the domain model is loaded via Response::get() with the seeded ID
     * @then  a non-null model is returned and its ID matches the seeded row
     */
    public function testModelLoadsFromSeededRow(): void
    {
        // 1. Seed a fresh row — get back its primary key.
        $responseID = Seeder::evaluationResponse(self::$db);

        // 2. Satisfy any session dependencies the model's lazy loaders expect.
        $_SESSION['programID'] = 1;
        $_SESSION['userID']    = 100;

        // 3. Call the static factory on the domain model.
        $response = \app\domainModels\Evaluation\Response::get($responseID);

        // 4. Assert against the seeded ID, not an absolute value.
        $this->assertNotNull($response);
        $this->assertEquals($responseID, $response->getId());
    }
}
```

Key points:
- Use `Seeder` overrides to control exactly what the domain model will see.
- Assert only the properties your test cares about.
- Never call `Response::getAll()` and count; count only within your seeded scope.

---

## Pattern 2: Service with DB Side-Effects

Test that a service method correctly writes to / reads from the database.

```php
#[Group('integration')]
class SomeServiceTest extends IntegrationTestCase
{
    private SomeService $service;

    protected function setUp(): void
    {
        parent::setUp();    // handles skip-if-unavailable
        $this->service = new SomeService(self::$db, Settings::getInstance());
    }

    /**
     * @given a seeded resident user and an instantiated SomeService
     * @when  doSomething() is called with the resident's ID and a target value
     * @then  a row with the expected field value exists in target_table for that userID
     */
    public function testMethodWritesExpectedRow(): void
    {
        $userID = Seeder::resident(self::$db, Seeder::institution(self::$db));

        $this->service->doSomething($userID, 'value');

        $row = self::$db->query_fetch_row(
            'SELECT field FROM target_table WHERE userID = ' . $userID,
            'w'
        );
        $this->assertIsArray($row);
        $this->assertSame('value', $row['field']);
    }
}
```

---

## Pattern 3: Legacy `.mh` Include (Separate Process)

For `.mh` scripts that rely on global state (`$settings`, `$db`, `$_SESSION`, etc.), use a separate process to prevent state leakage between tests and to let `define()` calls succeed.

```php
/**
 * @given a seeded resident with program and a valid request with the given params
 * @when  the legacy include is executed in a separate process
 * @then  the expected DB row is written and the output contains the success message
 */
#[RunInSeparateProcess]
#[PreserveGlobalState(false)]
public function testIncludeHappyPath(): void
{
    [$iID, $programID, $residentID] = Seeder::residentWithProgram(self::$db);

    // Set up variables the include reads from the caller's scope.
    $db       = self::$db;
    $request  = new \app\core\Request(['param' => 'value']);
    $settings = new stdClass();
    $settings->iID = $iID;
    $_SESSION['programID'] = $programID;

    ob_start();
    try {
        include dirname(__DIR__, 2) . '/app/includes/path/to/include.mh';
    } finally {
        $output = ob_get_clean();
    }

    // Assert DB changes.
    $row = self::$db->query_fetch_row(
        'SELECT col FROM some_table WHERE userID = ' . $residentID, 'w'
    );
    $this->assertIsArray($row);
    $this->assertEquals('expected', $row['col']);

    // Assert output.
    $this->assertStringContainsString('success message', $output);
}
```

Key points:
- Variables bound in the test method ARE visible to the `include` (same PHP scope).
- `self::$db` is still accessible after the include returns because `IntegrationTestCase`
  re-binds the handles in `setUpBeforeClass()`.
- Always wrap `include` in `try/finally` so `ob_get_clean()` runs even on exceptions.

---

## Pattern 4: Rollback / Error Path

Verify transactional correctness by forcing a failure with a DB trigger.

```php
/**
 * @given a seeded resident with program and a DB trigger that forces the transaction to fail
 * @when  the code under test attempts to write to the DB
 * @then  the row count in target_table is unchanged and no orphaned rows are left
 */
public function testTransactionRollsBackOnError(): void
{
    [$iID, $programID, $userID] = Seeder::residentWithProgram(self::$db);

    // Count before so we can assert delta = 0.
    $before = (int) self::$db->query_fetch_row(
        'SELECT COUNT(*) AS cnt FROM target_table', 'w'
    )['cnt'];

    // Force the INSERT to fail.
    self::$db->query('DROP TRIGGER IF EXISTS trg_test_force_fail', 'w');
    self::$db->query(
        "CREATE TRIGGER trg_test_force_fail BEFORE INSERT ON target_table "
        . "FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'forced failure'",
        'w'
    );

    // Run the code under test (expect it to handle the error).
    $result = $this->runSubject($userID, $iID);

    // Assert nothing leaked.
    $after = (int) self::$db->query_fetch_row(
        'SELECT COUNT(*) AS cnt FROM target_table', 'w'
    )['cnt'];
    $this->assertEquals($before, $after, 'Rolled-back transaction must not leave orphaned rows');

    // Clean up the trigger so tearDown / other tests are not affected.
    self::$db->query('DROP TRIGGER IF EXISTS trg_test_force_fail', 'w');
}
```

---

## Pattern 5: Out-of-Process Runner (for code that calls exit())

When the code under test calls `exit()` or `header('Location: ...')`:

1. Create `tests/integration/support/your_runner.php`:
   ```php
   <?php
   declare(strict_types=1);
   require_once dirname(__DIR__, 3) . '/vendor/autoload.php';

   // Bootstrap DB + constants (mirrors bootstrap.integration.php).
   if (!defined('DB_TLS')) { define('DB_TLS', false); }
   mysqli_report(MYSQLI_REPORT_OFF);

   // Read args from argv or env, set up globals, then call the code.
   $userID = (int)($argv[1] ?? 0);
   // ... set up $db, $settings, $_SESSION ...

   ob_start();
   try {
       include '/path/to/the/file.mh';
   } catch (\Throwable $e) {
       // capture redirect before exit
   } finally {
       $output = ob_get_clean();
   }
   echo $output;
   ```

2. In the test, `exec()` the runner and query the DB:
   ```php
   $cmd = sprintf(
       'php %s %d 2>&1',
       escapeshellarg(self::$runner),
       $userID
   );
   exec($cmd, $lines, $exitCode);
   $output = implode("\n", $lines);
   // assert DB state + $output
   ```

---

## Adding a New Seeder Method

When no existing `Seeder::*` method covers your use case, add one to
`tests/integration/support/Seeder.php`:

```php
/**
 * Insert a fresh X row and return its xID.
 *
 * @param array<string,mixed> $overrides Column overrides merged onto defaults.
 */
public static function someEntity(Database $db, array $overrides = []): int
{
    $suffix = self::suffix();   // collision-free random suffix
    $values = array_merge([
        'name'   => 'Test Entity ' . $suffix,
        'status' => 1,
        // ... required columns with sensible defaults ...
    ], $overrides);

    return (int) $db->insert('some_table', $values);
}
```

Rules for new Seeder methods:
- Always use `self::suffix()` for string values that must be unique.
- Return the new primary key (or an array of keys for composite fixtures).
- Accept an `$overrides` array so callers can customise specific columns.
- Only insert the minimum required columns; let DB defaults handle the rest.

---
name: medhub-integration-test
description: Create PHPUnit integration tests for MedHub PHP files and classes. Use when the user asks to write integration tests, add test coverage, or create a test for a given controller, service, domain model, gateway, or legacy .mh include file in the MedHub project.
---

# MedHub Integration Test Creator

Generates PHPUnit integration tests that run against a real MariaDB test database loaded from the gold schema.

## Infrastructure Overview

| File | Purpose |
|------|---------|
| `tests/integration/support/IntegrationTestCase.php` | Base class — handles DB connection, gold-schema load, Logger wiring, skip-if-unavailable |
| `tests/integration/support/Seeder.php` | Object-mother helpers that insert fresh, collision-free rows and return their IDs |
| `tests/integration/bootstrap.integration.php` | PHPUnit bootstrap — Composer autoload, `INCLUDES` constant, `DB_TLS`, `MYSQLI_REPORT_OFF` |
| `phpunit.integration.xml` | Integration suite config — run with `vendor/bin/phpunit -c phpunit.integration.xml` |

## Test File Conventions

- **Extend** `IntegrationTestCase` (namespace `integration\support`).
- **Annotate** the class with `#[Group('integration')]`.
- **Place** the file in `tests/integration/` (or `tests/integration/app/services/` for service-layer tests).
- **Name** it `{ClassName}Test.php`.
- Use `#[RunInSeparateProcess]` + `#[PreserveGlobalState(false)]` on any test that `include`s a legacy `.mh` file.

## Seeding Rules

- **Always** seed fresh, unique rows via `Seeder::*` methods.
- **Never** assert on absolute table-wide counts — assert on before/after deltas or on the specific IDs you seeded.
- If no suitable `Seeder` method exists, add one following the existing pattern: use `$db->insert()`, generate a unique suffix via `substr(md5(uniqid('', true)), 0, 10)`, return the new primary key(s).

## Existing Seeder Methods

| Method | Returns | Notes |
|--------|---------|-------|
| `Seeder::institution($db)` | `int $iID` | Minimal `i` row |
| `Seeder::program($db, $iID)` | `int $programID` | Minimal `i_programs` row |
| `Seeder::resident($db, $iID)` | `int $residentID` | `users` + `users_residents` + `users_portal` |
| `Seeder::residentWithProgram($db)` | `[iID, programID, residentID]` | All three in one call |
| `Seeder::evaluationResponse($db, $overrides)` | `int $responseID` | `eh_responses` row |
| `Seeder::applicationForm($db, $opts)` | `array` of all IDs | Full app-form structure |

## Step-by-Step Workflow

### 1. Classify the target

| Target type | Strategy |
|------------|----------|
| **Domain model** (`app/domainModels/`) | Call static factory (`::get()`, `::getOrNew()`) against a seeded row; assert returned object state |
| **Service** (`app/services/`) | Instantiate with real DB + Settings; call method; assert DB side-effects |
| **Gateway** (`app/gateways/`) | Instantiate directly; call query methods; seed input rows; assert results |
| **Legacy `.mh` include** (`app/includes/`, `public/`) | Use `#[RunInSeparateProcess]` + `ob_start()`/`include`; capture output; assert DB state + output |
| **Controller** (`app/controllers/`) | Prefer testing the service/gateway it delegates to; only test the controller directly if it has unique orchestration logic |

### 2. Identify what to seed

- Read the target file to find which tables it reads/writes.
- Check `ref_database.md` for exact column names.
- Reuse `Seeder::*` where possible; add a new method if needed.

### 3. Write the test class

```php
<?php

declare(strict_types=1);

use integration\support\IntegrationTestCase;
use integration\support\Seeder;
use PHPUnit\Framework\Attributes\Group;

#[Group('integration')]
class {ClassName}Test extends IntegrationTestCase
{
    /**
     * @given [describe the seeded state / preconditions]
     * @when  [describe the action being exercised]
     * @then  [describe the expected DB side-effects and/or return values]
     */
    public function test{HappyPath}(): void
    {
        // Arrange: seed fresh data
        $ids = Seeder::someHelper(self::$db);

        // Act: call the code under test
        $result = ...;

        // Assert: verify DB side-effects and/or return values
        $this->assert...(...);
    }

    /**
     * @given [describe the edge-case / error preconditions]
     * @when  [describe the action being exercised]
     * @then  [describe the expected outcome for the error path]
     */
    public function test{ErrorOrEdgePath}(): void
    {
        // ...
    }
}
```

### 4. For legacy includes — use separate process

```php
/**
 * @given [describe the seeded state and any session/global variables]
 * @when  the include is executed with the given request parameters
 * @then  [describe the expected DB changes and output]
 */
#[RunInSeparateProcess]
#[PreserveGlobalState(false)]
public function testIncludeDoesX(): void
{
    [$iID, $programID, $residentID] = Seeder::residentWithProgram(self::$db);

    // Bind variables the include expects (runs in THIS method's scope via include).
    $request  = new \app\core\Request(['step' => '3', ...]);
    $db       = self::$db;
    $settings = new stdClass();
    $settings->iID = $iID;
    $_SESSION['programID'] = $programID;

    ob_start();
    try {
        include '/path/to/the/include.mh';
    } finally {
        $output = ob_get_clean();
    }

    // Assert DB state and output.
    $row = self::$db->query_fetch_row('SELECT ... WHERE userID = ' . $residentID, 'w');
    $this->assertIsArray($row);
    $this->assertStringContainsString('expected text', $output);
}
```

### 5. For services that exit() — run out-of-process

If the code under test calls `exit()` or `header()`, it cannot return to an assertion. Create a thin runner script in `tests/integration/support/` that bootstraps the minimum environment, calls the method, and writes its redirect `Location` to stdout. The test invokes it with `exec()` and asserts on DB state + captured output (see `UserFormSaveTest.php` + `user_form_save_runner.php` for the pattern).

### 6. Run and verify

Always run with code coverage so the terminal shows which lines are exercised:

```bash
# Inside the mh-php-fpm container:
docker exec mh-php-fpm sh -lc \
  'cd /var/www/html && vendor/bin/phpunit -c phpunit.integration.xml \
     --coverage-text tests/integration/YourTest.php'
```

The `--coverage-text` flag prints a per-class/per-method coverage summary directly in the terminal after the test run completes. Review it before considering the test done — aim to cover all branches added or changed by your work.

## Important Invariants

- **`self::$db`** is the shared, bound `Database` instance — use it for all assertions.
- **`'w'` handle** for writes and assertions that must be fully committed; `'r'` for reads.
- **`self::$available`** is `false` if the test DB is unreachable; `setUp()` in `IntegrationTestCase` skips automatically.
- **No cleanup required** — each test seeds unique rows, so tests are independent on the shared gold database.
- **Never** use `empty()`; use `=== null`, `=== ''`, `count($x) === 0`, etc.
- **Parameterize** queries when using dynamic values (or use `Database::insert()`).
- **`declare(strict_types=1)`** at the top of every new test file.

## Reference Files

- Patterns & annotated examples: [references/integration-test-patterns.md](references/integration-test-patterns.md)
- Domain model test sample: [sample_codes/domain-model-test.php](sample_codes/domain-model-test.php)
- Legacy include test sample: [sample_codes/legacy-include-test.php](sample_codes/legacy-include-test.php)

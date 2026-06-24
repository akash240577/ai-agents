# MedHub PHPUnit — Reference & Gotchas

## Bootstrap / autoloading

- `phpunit.xml` declares no `bootstrap`. PHPUnit discovers test files by scanning
  `./tests/unit`, and Composer's autoloader resolves `app\...` classes. Test-class namespaces
  (`unit\...`) do not need to be Composer-autoloadable because PHPUnit includes the files directly.
- `tests/unit/_bootstrap.php` exists (registers `Medhub\services\Autoloader` and mocks a CLI
  `$_SESSION`) but is a Codeception-era artifact; the PHPUnit unit suite runs without it. If a unit
  under test reads `$_SESSION`, set the keys you need directly in the test instead of relying on it.

## Database wrapper cheat-sheet

Class: `app\services\core\Database`. Common methods seen in models/gateways (real
signatures take optional `$dbStr` and `$params` args — production code passes `$params`
for parameterized SQL, the MedHub standard; mocks ignore the extra args by default):

| Method | Real signature | Returns | Stub with |
|--------|----------------|---------|-----------|
| `query_fetch_value` | `($sql, $dbStr = '', $params = null)` | single scalar | `willReturn(5)` / `willReturnOnConsecutiveCalls(...)` |
| `query_fetch_row` | `($sql, $dbStr = '', $index = 'assoc', $params = null)` | one assoc row (array) | `willReturn(['col' => 'v'])` |
| `query` | `($sql, $dbStr = '', $params = null)` | result object with `fetch_assoc()` | return a mock/stub object |
| `getInstance` | `($dbStr = '')` | singleton | avoid — prefer injecting `$db`; if a collaborator calls it internally, mock that collaborator instead |

Notes:
- You usually stub on method name only (`->method('query_fetch_value')`), so the extra
  `$dbStr`/`$params` args don't matter. Only add `->with(...)` argument matchers when the
  test specifically needs to assert the SQL or bound params.
- `query_fetch_value` is frequently called multiple times in one method (e.g. a COUNT then a
  date). Order matters — use `willReturnOnConsecutiveCalls(first, second, ...)`.
- Some classes (e.g. `PortfolioDashboardTrainingHistory`) call `Database::getInstance()` in their
  constructor. Do NOT instantiate them for real in a unit test — mock them with
  `disableOriginalConstructor()` and stub only the methods used.

## Mocking patterns

```php
// Bare mock, no real constructor
$mock = $this->getMockBuilder(SomeClass::class)
    ->disableOriginalConstructor()
    ->getMock();
$mock->method('foo')->willReturn('bar');

// Different return per call
$mock->method('foo')->willReturnOnConsecutiveCalls('a', 'b');

// Data providers for table-driven cases (see MHProgramTest.php)
/** @dataProvider casesProvider */
public function testThing(string $in, string $expected): void { ... }
public function casesProvider(): array { return ['label' => ['in', 'expected']]; }
```

## Reflection helpers

```php
// Read a protected/private property
function readProp(object $o, string $name) {
    $p = (new \ReflectionClass($o))->getProperty($name);
    $p->setAccessible(true);
    return $p->getValue($o);
}

// Set a protected/private property (e.g. inject a mock db)
function writeProp(object $o, string $name, $value): void {
    $p = (new \ReflectionClass($o))->getProperty($name);
    $p->setAccessible(true);
    $p->setValue($o, $value);
}
```

## Date-range edge cases (PortfolioDashboard channels)

`PDCAbstract::_getDateRange($effDate)`:
- With no `date_list` option set (default), takes the "entire training in program" branch:
  `start = trainingHistory->getProgramStart($programID)`, `end = $effDate`.
- `PDCLoginStatistics::calculate()` then clamps `[start,end]` to the PG appointment window from
  `query_fetch_row` (`pg_start_date`/`pg_end_date`). Return a wide window
  (`2000-01-01`..`2099-12-31`) to disable clamping and control the range purely via
  `getProgramStart` + `effDate`.
- To force a zero-week range (the AMBS-20060 bug): `getProgramStart` == `effDate` →
  `start === end` → `round((end-start)/604800) == 0`. The fix uses `max(1, ...)`.

## Running & interpreting output

- `OK (3 tests, 6 assertions)` → all pass.
- `OK, but there were issues!` with Deprecations / PHPUnit Notices → still passing (exit 0).
  These come from PHPUnit 12 deprecations, not your assertions. Don't chase them unless the task
  is specifically about them.
- Failures print the assertion diff and a non-zero exit code.

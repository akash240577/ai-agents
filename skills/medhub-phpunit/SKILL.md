---
name: medhub-phpunit
description: Write and run PHPUnit unit tests for the MedHub PHP monolith. Use when asked to add test coverage, write a unit test, or verify a fix/behaviour for any class under app/ (models, domainModels, services, gateways, controllers, enums). Covers test placement, namespace conventions, mocking the Database wrapper, reading protected state via Reflection, and the exact Docker command to run tests. Distinct from the medhub-integration-test skill (which targets DB-backed integration tests via phpunit.integration.xml).
---

# Write PHPUnit (MedHub)

How to add and run **unit** tests in the MedHub monolith without re-investigating the codebase each time.

## Environment facts (verified)

- **PHP is NOT on the host PATH.** Run everything inside the running `php` service container
  (container name `mh-php-fpm`). Docker must be up (`docker compose up -d`).
- Runner: `vendor/phpunit/phpunit/phpunit` (PHPUnit 12.x, PHP 8.3 in-container).
- Unit config: `phpunit.xml` (testsuite "MedHub Unit Tests", directory `./tests/unit`).
- Integration config: `phpunit.integration.xml` (separate — DB-backed; use the
  `medhub-integration-test` skill for those, not this one).
- No `bootstrap` attribute in `phpunit.xml`; Composer autoloading + PHPUnit's directory scan
  load test files. Class autoloading resolves the `app\` namespace via Composer.

## Run tests

```powershell
# Single test file
docker compose exec -T php vendor/phpunit/phpunit/phpunit --configuration phpunit.xml tests/unit/app/models/Foo/BarTest.php

# Filter by method name
docker compose exec -T php vendor/phpunit/phpunit/phpunit --configuration phpunit.xml --filter testSomething tests/unit/app/models/Foo/BarTest.php

# Whole unit suite
docker compose exec -T php vendor/phpunit/phpunit/phpunit --configuration phpunit.xml
```

Use `-T` (no TTY) so it works from non-interactive shells. `OK` = pass. A run can report
`OK, but there were issues!` with Deprecations/Notices and still exit 0 (pass) — those are
PHPUnit deprecations, not test failures.

## Placement & naming conventions

- Tests mirror the `app/` tree under `tests/unit/`. Example:
  `app/models/PortfolioDashboard/Channel/PDCLoginStatistics.php`
  → `tests/unit/app/models/PortfolioDashboard/Channel/PDCLoginStatisticsTest.php`.
- File/class name: `<ClassUnderTest>Test`, extends `PHPUnit\Framework\TestCase`.
- Namespace: prefer `unit\` mirroring the path, e.g.
  `namespace unit\app\models\PortfolioDashboard\Channel;`. This is the dominant
  convention (~56 of 96 unit test files) — match it for new tests.
  **Heads-up:** the suite is not consistent. You will also see `tests\unit\app\...`,
  the class's own namespace (`app\services\...`), `tests\app\...`, and some files with
  no namespace at all. None of these affect test discovery — PHPUnit includes the files
  directly and Composer resolves the `app\` classes under test — so the namespace is a
  style choice, not a functional requirement. Default to `unit\` unless a sibling test in
  the same folder clearly uses another convention.
- Method names: `test<Behaviour>(): void`, camelCase, no abbreviations (per AGENTS.md).
- Create missing directories first — the `create` tool will not make parent dirs.

## The core pattern: mock the Database wrapper

The DB wrapper is `app\services\core\Database`. It is duck-typed where passed as `$db`, and
also injected as a `db` property on some models. Mock it with `disableOriginalConstructor()`.

Key methods you will stub: `query_fetch_value` (scalar), `query_fetch_row` (assoc array),
`query` (result object). For multiple calls to the same method returning different values, use
`willReturnOnConsecutiveCalls(...)`.

```php
$databaseMock = $this->getMockBuilder(\app\services\core\Database::class)
    ->disableOriginalConstructor()
    ->getMock();
$databaseMock->method('query_fetch_row')->willReturn(['col' => 'val']);
$databaseMock->method('query_fetch_value')->willReturnOnConsecutiveCalls(5, '2026-06-22 09:00:00');
```

### Injecting the mock

- **Constructor/method arg** (preferred): pass the mock straight into the method, e.g.
  `$obj->calculate($databaseMock, $effDate)`.
- **Private/protected `db` property**: set it via Reflection (pattern from
  `tests/unit/app/models/MHProgramTest.php`):

```php
$ref = new \ReflectionClass($obj);
$p = $ref->getProperty('db');
$p->setAccessible(true);
$p->setValue($obj, $databaseMock);
```

## Reading protected/private state in assertions

Many MedHub classes expose results only through protected fields (e.g. `_elements`, `_pairs`).
Read them with Reflection rather than adding production getters:

```php
$p = (new \ReflectionClass($obj))->getProperty('_elements');
$p->setAccessible(true);
$elements = $p->getValue($obj);
```

Prefer existing public getters when they exist (e.g. `getKey()`/`getValue()` on
`PDCElementKeyValuePair`) before reflecting.

## Mocking collaborators

Mock domain collaborators the same way (builder + `disableOriginalConstructor()`) and stub only
the methods the unit under test calls. Example: a channel needs a
`PortfolioDashboardTrainingHistory` whose `getProgramStart()` you control to drive a date range.

## Worked examples

- Full reference, gotchas, and DB method cheat-sheet: [references/medhub-testing.md](references/medhub-testing.md)
- A complete, passing test (mock DB + mock collaborator + Reflection assertions):
  [sample_codes/ChannelCalculateTest.php](sample_codes/ChannelCalculateTest.php)

## Checklist before declaring done

- [ ] Test file placed under `tests/unit/` mirroring the `app/` path, `unit\...` namespace.
- [ ] Extends `PHPUnit\Framework\TestCase`; methods `test*(): void`.
- [ ] DB and collaborators mocked with `disableOriginalConstructor()`.
- [ ] Covers the fix/edge case AND a regression (unchanged behaviour) case.
- [ ] Ran in the `php` container against `phpunit.xml`; output shows `OK` (exit 0).

# PHP / MedHub Code Review Best Practices

Default checklist for PHP projects. Used by `/review-mr` when no project-specific `best-practices.md` exists.

---

## SQL / Database

- [ ] **Use parameterized queries** — All SQL must use PDO `prepare()`/`execute()` or equivalent. No string concatenation or variable interpolation in query strings.
- [ ] **Argument count matches placeholders** — The number of values in the `execute()` array must match the number of `?` placeholders in the prepared statement.
- [ ] **Named parameters match bound keys** — `:param` names in the query must exactly match the keys in the bound parameter array.
- [ ] **No raw superglobals in queries** — Never use `$_GET`, `$_POST`, `$_REQUEST` values directly in queries without sanitization.
- [ ] **No query()/exec() with user input** — If the input is user-controlled, `prepare()` must be used instead.

## PHP 8 Best Practices

- [ ] **Use match expressions** — Prefer `match` over `switch` when returning a value and no fall-through is needed.
- [ ] **Use named arguments** — For functions with 3+ parameters where the purpose of arguments is unclear from context.
- [ ] **Declare types in signatures** — Use union types or nullable types in function signatures instead of docblock-only type hints.
- [ ] **Use null-safe operator** — `?->` instead of explicit null checks before method chains.
- [ ] **Constructor promotion** — Use promoted parameters for simple DTOs and value objects.
- [ ] **Modern string functions** — Use `str_contains()`, `str_starts_with()`, `str_ends_with()` instead of `strpos() !== false`.
- [ ] **Use enums** — For fixed sets of values instead of class constants or string comparisons.

## PSR-12 / Formatting

- [ ] **Brace placement** — Same line for control structures (`if`, `for`, `while`), next line for classes and methods.
- [ ] **One class per file** — Namespace declaration present.
- [ ] **Use statements** — Grouped and sorted: classes, then functions, then constants.
- [ ] **No closing tag** — No `?>` in pure PHP files.
- [ ] **Explicit visibility** — `public`, `protected`, `private` declared on all methods and properties.

## Security

- [ ] **No hardcoded credentials** — No API keys, passwords, or tokens in source code.
- [ ] **Output escaping** — User-controlled data in HTML must be escaped (`htmlspecialchars()` or equivalent).
- [ ] **CSRF protection** — Forms that modify state must include CSRF tokens.
- [ ] **No eval()** — Never use `eval()` or dynamic code generation with user input.
- [ ] **Strict comparison** — Use `===` for security-sensitive checks; never rely on loose `==` comparison.

## Legacy Patterns (flag for discussion)

- [ ] **No new global variables** — Use dependency injection or method parameters instead of `global $var`.
- [ ] **No extract()** — Use explicit variable assignment for safety and readability.
- [ ] **No mixed HTML/PHP** — Use templates, view layer, or response builders for output.
- [ ] **No direct superglobal access** — `$_SESSION`, `$_COOKIE`, `$_SERVER` should only be accessed in entry points or middleware.
- [ ] **Exceptions over suppression** — Use exceptions for errors, not `@` operator or `die()`/`exit()` in library code.

## Function Call Safety

- [ ] **Correct argument count** — Function/method calls must match the signature parameter count.
- [ ] **Check default values** — Optional parameters should not be accidentally omitted when the default is unsuitable.
- [ ] **Callback signatures** — `array_map`, `array_filter`, `usort`, `array_walk` callbacks must have correct parameter signatures.
- [ ] **Explicit type coercion** — Cast explicitly when converting between types; don't rely on implicit coercion.

---

## HTML (View) Coding Standards

- [ ] **Double-quotes on attributes** — Use `"` (not `'`) around all HTML attribute values.
- [ ] **Lowercase HTML tags** — All HTML element names must be lowercase (e.g., `<div>`, `<span>`, not `<DIV>`).
- [ ] **Avoid ID attributes** — Do not add `id` attributes to HTML elements; use classes or `data-*` attributes for targeting.
- [ ] **Separation of layers** — Keep HTML (structure), CSS (presentation), and JavaScript (behavior) properly separated; no inline styles or inline event handlers.
- [ ] **Use latest library versions** — Reference the latest approved versions of jQuery, jQueryUI, and KnockoutJS.
- [ ] **ASP.Net MVC for initial load** — Use ASP.Net MVC to render the initial page state; do not build the full page client-side on first load.
- [ ] **Razor engine in .cshtml** — All `.cshtml` pages must use the Razor templating engine.
- [ ] **`customScripts` section** — Page-specific scripts must be rendered via the Razor `customScripts` section, not inline at the bottom of the body.
- [ ] **Shared Views have leading underscore** — Shared/partial views must be named with a leading underscore (e.g., `_MyPartial.cshtml`).
- [ ] **Common JS in `_Layout.cshtml`** — Load shared `.js` files (jQuery, KnockoutJS, etc.) in `_Layout.cshtml`, not in individual views.
- [ ] **Single-line HTML elements** — Constrain HTML elements to one line where possible; only break to multiple lines when the element has significant child content.
- [ ] **`data-bind` naming conventions** — Follow the project naming conventions for KnockoutJS `data-bind` attribute values.
- [ ] **Use blockUI.js for loading screens** — Display loading/busy states via `blockUI.js`; do not roll custom loading overlays.

---

## JavaScript Coding Standards

- [ ] **Camel casing** — All properties and methods in JavaScript code must use camelCase (e.g., `myMethod`, `itemCount`).
- [ ] **ViewModel structure pattern** — Organize ViewModel code using the established project pattern (self-referencing variable, observables, init, etc.).
- [ ] **Use `#region` tags** — Group related code blocks with `//#region` … `//#endregion` tags for readability.
- [ ] **ViewModel naming** — ViewModels must follow the `<Name>ViewModel` naming pattern (e.g., `HomeViewModel`).
- [ ] **Knockout bindings in the View** — Apply KnockoutJS `data-bind` attributes in the `.cshtml` view rather than in the ViewModel, to support automated unit testing of the ViewModel.
- [ ] **Common.js for shared logic** — Isolate reusable/utility JavaScript functionality into a `Common.js` file rather than duplicating across ViewModels.
- [ ] **Separate file for custom bindings** — KnockoutJS custom binding handlers must live in their own dedicated file, not inline in a ViewModel.
- [ ] **Extract large JS blocks** — Large chunks of JavaScript must be factored into separate files rather than embedded in views.
- [ ] **Anonymous functions for scoping** — Use anonymous/IIFE functions to control variable scoping instead of polluting the global scope with separately named functions.

---

## MedHub Review Learnings (from GitLab MR review comments, 2025-12 → 2026-06)

> Synthesized from ~236 resolved review comments across `services/medhub`, `services/support`,
> and `services/app-server` (reviewers: Jacob Moote, Ben Sayer, Akhilesh Bisht, Kyle Andrews).
> These are the patterns reviewers repeatedly flag — apply them proactively in new MedHub code.
> Source data: `tools/ambs-metrics/output/review-comments-raw.json`
> (regenerate via `tools/ambs-metrics/fetch-reviews.cmd --months=6`).

### Output & Templating (most-flagged HTML issue)

- [ ] **Close the PHP tag and output HTML directly** — Do NOT build HTML by concatenating strings into a variable and `echo`-ing it, and do NOT echo HTML line by line. Close `?>`, write the HTML markup, then reopen `<?php`. This gives proper syntax highlighting, autocomplete, and static analysis in PhpStorm. If you truly cannot break out of PHP, use output buffering (`ob_*`) rather than string concatenation. *(Jake, MR!2410, !2262)*
- [ ] **Lowercase HTML tags** — Use lowercase tags (`<br>`, `<select>`, `<table>`). Never explicitly change existing tags TO uppercase; leaving pre-existing uppercase as-is is acceptable, but new/edited markup must be lowercase.
- [ ] **Consistent, modern tags** — Don't mix `<span>` and `<font>` for the same purpose; drop `<font>` entirely. Avoid legacy table attributes (`cellspacing`, `cellpadding`, `border`, `valign`) — move them to CSS classes. *(Jake, MR!2410)*
- [ ] **Utility CSS classes over inline styles** — Replace inline styles with existing utility classes wherever possible: `style="display:inline-block;"` → `class="d-inline-block"`, `style="display:inline;"` → `class="d-inline"`, `style="margin:0;"` → `class="m-0"`, flex layouts → `class="d-flex justify-content-between align-items-center"`. Avoid one-off CSS unless absolutely necessary.
- [ ] **Keep HTML/CSS out of backend PHP** — Don't bake status→HTML/color logic into controllers/services. Push presentation to the view/front end.

### Use Domain Models / Gateways for Data Access

- [ ] **Prefer domain models over raw SQL in view/include code** — Replace ad-hoc `SELECT ... mysqli_fetch_assoc` loops with the domain-model layer (e.g. `UserFactory::makeCollection($userIds)` → iterate `AbstractDomainUser` objects). *(Jake, MR!2410)*
- [ ] **DB access belongs in gateways** — Not in active-record models, not in domain models, not inline in scripts/cron/task files. Models/scripts that need data should call a service which calls gateway methods.
- [ ] **One gateway per table** — Don't create operation-specific gateways (e.g. `PlaDeletionGateway` → just `PlaGateway`). Cross-table queries are fine; it's an organizational guideline.
- [ ] **Gateways are stateless** — No instance properties/state on gateways. Each method takes the variables it needs (duplication is acceptable). If state is genuinely required, use a service, not a gateway.
- [ ] **Don't duplicate a method in both model and gateway** — It belongs in the gateway only.

### Dependency Injection & Service Container

- [ ] **No `new` for one-offs that belong in the container** — Register the class in `app/services.php` / `config/services.php` and resolve it from the container. Don't `new` services inline in scripts, controllers, or other services.
- [ ] **Reuse already-registered container entries** — Don't construct a second instance of something already in the container (e.g. `VaultHandler`); pull the registered one.
- [ ] **Separate container resolution from the call** — For PhpStorm static analysis, don't chain `$container[X::class]->method()` on one line. Use two lines with a `/** @var X $x */` docblock so the IDE can autocomplete and navigate. *(Jake, MR!2371)*
- [ ] **Inject dependencies, never use `global`** — `global` should essentially never appear in new code (and is a no-op in already-global scope). Pass the specific service(s) you need as arguments — prefer the concrete service over the whole `$container`.
- [ ] **Inject deps via constructor for routed controllers** — e.g. `$settings`, builders, loaders injected in `__construct()` rather than passed to each private method or new'd up.
- [ ] **Classes get their own file** — Don't declare classes inline in a script/cron; put them in their own file and (usually) register in the container.

### Types, Enums & Comparisons

- [ ] **Use real PHP `enum` types** — Convert "enum-like" classes (constants + static helpers) into actual backed `enum`s. Replace magic ints/strings (status codes, types) with enum cases, and type-hint method args against the enum (`fn(StatusEnum $status)`) instead of `int`/`string`.
- [ ] **Strict comparison everywhere** — Use `===`/`!==` (cast to `int` first if needed). Reviewers flag every loose `==`, even where `declare(strict_types=1)` is present.
- [ ] **No `empty()`** — Conflates `0`, `''`, `null`, `'0'`, `[]` and hides bugs. Use the narrowest explicit check (`=== null`, `=== ''`, `count(...) === 0`, `=== 0`). Be consistent — don't mix `is_null()` in one branch and `empty()` in the next.
- [ ] **Add types to everything new** — Property types, parameter types, and return types on all new code (gateways, services, DTOs, models).
- [ ] **Don't make required args nullable/optional** — If a method always needs `$session` / `$container` / a value, make it a required, typed parameter. Nullable defaults obscure intent.
- [ ] **Array-shape docblocks for array returns** — When a method must return an array, document it: `@return array{statusWhere: string, having: string}`.
- [ ] **Don't return arbitrary status arrays** — Avoid `['status' => 'Error', 'message' => ...]`. Prefer a `bool` (`'success' => false`), an associative array with meaningful keys, or — for genuine failures — throw an exception instead of returning a soft error.

### PHP Style & Cleanliness

- [ ] **No MedHub `PhpHelperMethods` / php8 helper methods in new code** — Use native functions: `in_array()`, `str_contains()`, etc. *(Kyle, Akhilesh)*
- [ ] **`(int)$num` over `intval($num)`** — Shorter and idiomatic.
- [ ] **No error suppression `@`** — Don't silence errors; handle them.
- [ ] **No assignment inside `if`** — Assign on the previous line, then test (`$error = $this->verify(...); if ($error) {`). Avoids `=` vs `==`/`===` confusion.
- [ ] **Remove debug leftovers** — Strip debug `echo`/`exit`, commented-out code, "leftover debug" comments, and low-value comments before merge.
- [ ] **No unnecessary parentheses** — e.g. `if (!is_null($x))` not `if ((!is_null($x)))`; `if ($programID > 0)` not `if (($programID > 0))`.
- [ ] **No empty constructor that only calls parent** — PHP calls the parent constructor automatically; delete it.
- [ ] **Don't declare single-use / conditional-only variables** — If a value is used in exactly one place (often inside one `if`), inline the call instead of declaring a variable up front.
- [ ] **Early-return / invert to avoid nesting** — Prefer `if (!$x) { return; }` guard clauses over nested `if` inside `if`.
- [ ] **`{ }` braces over `:`/`endif` alternative syntax** — For consistency, use brace-style control structures.
- [ ] **`require_once` + `__DIR__`** — Prefer `require_once` over `include`, and `__DIR__` over the `INCLUDES` constant (better PhpStorm static analysis).
- [ ] **Avoid static methods & singletons** — Especially on stateful classes; they limit reuse and testability. Prefer instances pulled from the container.
- [ ] **Keep `services.php` / `gateways.php` imports sorted** — Use `use` aliases, not inline backslash-prefixed FQCNs as array keys.

### Naming

- [ ] **No abbreviations** — In variables, functions, classes, methods, CSS classes, routes, and directory names. e.g. `ldfeatures` → `launchdarkly_features`; `whrpProgramID` → spell it out; `loadWHRPDataTable` → `loadWorkHourReviewPeriodDataTable`.
- [ ] **No "Info" in names** — Ambiguous abbreviation. Name what it actually is: `getPlaRequestProgramIdAndSiteId`, `$plaData`.
- [ ] **Services don't contain the word "Service"** — Name by what it does: `EmailSender`, not `EmailService`.
- [ ] **No "get" in non-getter variable names** — `$residencyAndIrpCodeRecord`, not `$getResidencyAndIrpCode`.
- [ ] **camelCase, no pseudo-Hungarian** — No type-suffix array names like `$failed_usersA`; use `$failedUsers`. Method/variable acronyms capitalize only the first letter (`getId()` not `getID()`).
- [ ] **Names reflect the feature/flag** — Boolean flags read like `$isWorkHoursReviewPeriodsUpgradesEnabled`; lowercase `true`/`false`.
- [ ] **Dates as objects** — Prefer `DateTime`/`DateTimeImmutable` over date strings so you can type-hint `DateTimeInterface` and avoid invalid input; name them clearly (`$sunsetReviewDate`).

### MedHub Architecture & Legacy Patterns

- [ ] **Use the `$session` object, not `$_SESSION`** — `$session` is globally available after `include_initialize.mh` (unless explicitly disabled). Use `$session->getUser()`, `$session->getUser()->getUserType()`, `instanceof GmeOffice`, etc. Drop redundant `$authUser` wrappers.
- [ ] **Parameterize all queries — even ints** — Use `?` placeholders and a params array even when a value is explicitly cast to `int`. Never interpolate, even "safe" values.
- [ ] **Array lookup over `switch` for simple maps** — e.g. map a sort key to an `ORDER BY` fragment via an array, not a `switch`.
- [ ] **Crons live on the app server; new on-demand scripts are task scripts** — Don't add crons under the web `public/functions/cron/`. Task scripts go in `public/functions/tasks/`, follow `_task-template.mh`, and use `app/includes/common/include_security_tasks.mh` (CLI / support-site / logged-in-support compatible).
- [ ] **New features follow the routed MVC pattern** — Brand-new functionality should be a clean routed URL + controller, not a new legacy `.mh` script.
- [ ] **Keep platform-specific code out of the Framework** — Only generic infrastructure (Database, router, controller, etc.) belongs in `MedHub\Framework`; platform/business specifics stay in the app (unless a shared service is explicitly agreed).
- [ ] **Don't put config or test-only values in enums** — Enums are for fixed value sets, not configuration (use config/root settings) or test fixtures.

### Accessibility (aria-label) — flagged heavily on MEDM-9835

- [ ] **No `aria-label` on hidden inputs** — Hidden inputs aren't in the accessibility tree; the label is never announced. It's pure noise/regression risk.
- [ ] **No `aria-label` when a `<label for>` already exists** — It can incorrectly override the real label.
- [ ] **Describe, don't instruct, and don't over-verbose** — `aria-label="Mandatory"`, not `"Please check the mandatory option"`. Screen readers already announce the role.
- [ ] **No non-English / element-name values** — Don't dump an element id/name into `aria-label`.
- [ ] **Guard against quote-breaking** — If an `aria-label` (or any attribute) interpolates a DB/request value, ensure a `'`/`"` in the value can't break the attribute's HTML.

### JavaScript

- [ ] **`let`/`const`, never `var`** — No reason to use `var` in new JS.
- [ ] **No inline JS in PHP/markup** — Add new JS to an external `.js` file and include it via `<script src="...js">`.
- [ ] **Keep meaningful error handling** — Don't silently swallow errors in JS callbacks; surface them usefully (e.g. an alert/message).

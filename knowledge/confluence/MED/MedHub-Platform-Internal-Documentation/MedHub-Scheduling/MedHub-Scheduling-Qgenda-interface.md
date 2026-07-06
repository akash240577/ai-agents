# MedHub - Scheduling - Qgenda interface

_May 2026 • Internal Use • Covers QGenda REST API v2_

# 1\. Integration Overview

MedHub integrates with QGenda's REST API (v2) to import scheduling data for residency and fellowship programs. The integration is a one-way, polling-based sync: MedHub pulls data from QGenda on a scheduled cadence, adopts it into MedHub's scheduling model, and distributes it to downstream automations (evaluations, curriculum delivery, work hours, IRIS reporting, etc.).

## 1.1 Data Flow Summary

1.  MedHub's cron job fires three times daily (3:00 AM, 11:00 AM, 7:00 PM Eastern), institution-wide.
    
2.  For each QGenda-enabled program, MedHub iterates the Task Wizard mappings and queries the QGenda API—one request per mapped Task.
    
    1.  link to Qgenda’s API documentation: [https://restapi.qgenda.com/#7ee7b3e2-f323-4f0c-845d-5e59931084e3](https://restapi.qgenda.com/#7ee7b3e2-f323-4f0c-845d-5e59931084e3)
        
3.  QGenda returns schedule entries filtered to the requested TaskKey, date range, and publish/strike status.
    
4.  MedHub adopts the returned entries into its scheduling model: rotation assignments are split to align with MedHub's block boundaries; shifts and clinics are stored roughly 1:1.
    
5.  Manual edits inside the sync window are overwritten on the next cycle. Edits outside the window (beyond qgenda\_forward\_days) are preserved.
    

## 1.2 Sync Window Parameters

Parameter

Default

Notes

`qgenda_back_days`

14

How many days in the past the sync will update. Setting to 0 falls back to default. Minimum meaningful value is 1.

`qgenda_forward_days`

70

How many days in the future the sync will update. Setting to 0 falls back to default. Minimum meaningful value is 1.

## 1.3 Import Rules

*   **Published only:** Only entries with IsPublished=true are imported (since the 1/15/2026 fix; see AMBS-18594). For rotation blocks, ALL days within the block must be published in QGenda—even one unpublished day causes the API to report the block as unpublished, and MedHub skips it. (Confirmed by QGenda in Ticket #260575.)
    
*   **Strikethrough excluded:** Entries with IsStruck=true are treated as non-existent. If a previously imported assignment is struck in QGenda, MedHub removes it on the next sync within the back-days window. (Confirmed in AMBS-8767 and AMBS-2557.)
    
*   **Force pull:** Available via the QGenda 2.0 Debug tool (root-side access). Important: a force pull for one program triggers a pull for ALL QGenda-synced programs at the institution. (Confirmed by Clark R, 12/16/2020.)
    
*   **Manual edits:** Assignments imported via QGenda must be edited via QGenda when within the forward/back-days window. Editing manually demotes the assignment to "manual"; the next sync re-adds the QGenda copy, producing a duplicate. As of 1/22/2026 (AMBS-14786), the root task script now correctly identifies and removes manual schedule entries first whenever duplicate assignments exist, preserving interface-imported entries.
    
*   **Resident-initiated swaps:** Swaps made by residents in QGenda do NOT flow to MedHub. Only coordinator-made changes are reflected.
    

# 2\. Identity Model

QGenda's API uses a hierarchy of GUIDs to scope data. Understanding these is critical for setup and troubleshooting.

## 2.1 Key Identifiers

Identifier

Scope

How It's Used

Company Key (CompKey)

Institution-wide

The true GUID for the entire QGenda instance. Always returned in API responses regardless of which tag was used in the request. Not entered in MedHub Program Settings for tag-enabled institutions.

Tag GUID

Per-program

Generated on the QGenda side for each MedHub program. Entered in MedHub's Program Settings ("Enable QGenda Interface" field). Passed as the companyKey parameter in API requests. The API first checks Company Keys, then falls through to Tag GUIDs.

TaskKey

Per-task definition

UUID identifying a specific task (rotation, shift, clinic) in QGenda. Used in the $filter parameter to query schedule entries for that task. Mapped to MedHub services/shifts/clinics via the Task Wizard.

StaffKey

Per-staff member

UUID identifying a person in QGenda. Appears in /schedule, /staffmember, and /schedule/rotations responses. Mapped to MedHub trainees/faculty via the wizard.

ScheduleKey

Per-schedule entry

UUID for each individual schedule assignment. Returned by /v2/schedule on every entry. **Not stored by MedHub on import** (confirmed by dev in AMBS-22083).

RotationHashKey

Per-rotation entry

Base64 hash returned by /v2/schedule/rotations. Likely used for change detection/deduplication. Different from ScheduleKey. Not stored by MedHub.

## 2.2 The 1:1 Mapping Rule for Tasks

Each QGenda Task (identified by TaskKey) maps to exactly one MedHub program. If two MedHub programs both map the same QGenda Task, only one will receive the import—once MedHub processes the mapping for one program, it is marked processed and will not import to the other. (Confirmed current as of AMBS-10279, March 2024.)

**This rule applies to task mappings (services, shifts, clinics), not to user mappings.** Multiple programs can share the same faculty or trainee user mappings without issue. The problem only arises when one QGenda task/service is mapped to two different MedHub programs. (Ticket #229808.)

**Workaround for releases:** Add the receiving program's tag to the trainee on the QGenda side. Trainees can carry multiple program tags without negative impact. QGenda recommends using effective-dated tags so the released program's tag activates only when the trainee will be scheduled there. (Confirmed in AMBS-9976, 12/8/2023.)

**Best practice:** Each MedHub program should use a unique QGenda tag key, and each QGenda task should be mapped to only one MedHub program. If two programs need the same scheduling activity, create distinct tasks in QGenda for each program.

# 3\. QGenda REST API v2 – Endpoints Reference

Base URL: `https://api.qgenda.com/v2`

Authentication: Bearer token (JWT) in `Authorization` header.

## 3.1 GET /schedule

Returns individual, day-level schedule entries with fully denormalized staff, task, and location data. This is the primary endpoint MedHub uses for importing shifts and clinics.

### Request

wide760

Parameter

Required

Description

`companyKey`

Yes

Tag GUID for the program (or Company Key for institution-level queries).

`startDate`

Yes

Start of date range (URL-encoded M/D/YYYY, e.g. 5%2F5%2F2026).

`endDate`

Yes

End of date range.

`$filter`

No

OData filter. Common: `IsPublished and not IsStruck and TaskKey eq guid'{uuid}'`. Boolean fields referenced directly; GUIDs use guid'...' syntax; joined with and/or.

### Response Fields (Key Subset)

Returns a flat JSON array. Each object is one person, one day, one task.

Field

Type

Description

`ScheduleKey`

UUID

Unique ID for this schedule entry. Not currently stored by MedHub.

`Date`

datetime

Calendar date of the entry.

`StartTime / EndTime`

time

Local time strings (e.g. 13:30:00, 17:00:00).

`StartDateUTC / EndDateUTC`

datetime

Full UTC datetime of the shift.

`ScheduleEntryDuration`

decimal

Shift length in hours (e.g. 3.5).

`CompKey / CompName`

UUID / string

Institution-level Company Key and name (always the same regardless of tag used).

`StaffKey`

UUID

Staff member identifier. Matches /staffmember StaffKey.

`StaffFName / StaffLName`

string

Staff name fields (fully resolved—no lookup needed).

`StaffAbbrev`

string

Display abbreviation, format: LastName, FirstInitial.

`StaffEmail`

string

Email address.

`StaffEmrId`

string

EMR system ID (used for staff matching).

`StaffInternalId`

string

Internal ID (e.g. M317355).

`TaskKey`

UUID

Task identifier. Matches /task TaskKey and wizard mappings.

`TaskName / TaskAbbrev`

string

Task name and abbreviation (often identical). Format: DESCRIPTION \[numeric\_id\].

`TaskType`

string

E.g. Working.

`TaskShiftKey`

UUID

Shift template identifier.

`IsPublished`

bool

Whether the entry is published.

`IsStruck`

bool

Whether the entry is struck through (cancelled).

`IsRotationTask`

bool

Distinguishes rotation-generated vs manually scheduled entries.

`SourceType`

string

E.g. Manual.

`LocationName / LocationID`

string

Location details (fully resolved).

`TimeZone`

string

E.g. (UTC-05:00) Eastern Time (US & Canada).

`LastModifiedDateUTC`

datetime

Last modification timestamp.

`Credit / IsCred`

int / bool

Crediting flags.

`Notes / IsNotePrivate`

string / bool

Per-entry notes.

### MedHub Usage Pattern

MedHub queries this endpoint once per mapped Task in the wizard, using a filter like:

wide760

The companyKey in the URL is the program's tag GUID (not the institution-level CompKey). The date range spans from (today - qgenda\_back\_days) to (today + qgenda\_forward\_days).

## 3.2 GET /schedule/rotations

Returns rotation assignments as date ranges (not individual days). This is the endpoint used for importing rotation/service data.

### Request

wide760

**Note:** Date parameter names differ from /schedule: this endpoint uses `rangeStartDate` / `rangeEndDate` instead of `startDate` / `endDate`.

### Response Fields

Returns a flat JSON array. Each object represents a continuous rotation assignment spanning a date range.

Field

Type

Description

`StartDate`

datetime

Start of the rotation assignment (time component always T00:00:00).

`EndDate`

datetime

End of the rotation assignment.

`StaffKey`

UUID

Staff member identifier.

`TaskKey`

UUID

Task identifier.

`IsPublished`

bool

Publish status. ALL days must be published for the block to show as published.

`IsLocked`

bool

Lock status.

`Timezone`

string

Timezone string.

`RotationHashKey`

string (base64)

Hash for change detection/deduplication. NOT a ScheduleKey.

### Key Differences from /schedule

*   **Date ranges, not individual days.** A 31-day rotation is one entry with StartDate/EndDate spanning the full range. /schedule would return 31 individual entries.
    
*   **Minimal payload.** Only StaffKey and TaskKey are returned—no staff names, contact info, task names, or location data. Requires /staffmember and /task lookups to resolve.
    
*   **No ScheduleKey.** Uses RotationHashKey instead.
    
*   **One staff member can have multiple overlapping entries** with different TaskKeys for the same date range.
    

### MedHub Data Model Implications

When MedHub receives a continuous rotation entry from QGenda (e.g., May 2–May 29), it splits it into block-aligned records to match the program's rotation block structure. A single QGenda rotation entry becomes N MedHub sh\_tracks\_slots records. This split is required because 10 downstream automations depend on block-aligned data:

*   Automated evaluations (fires at block end)
    
*   Curriculum Goals & Objectives delivery (N days before rotation start)
    
*   Work Hour Review Periods (mapped to rotation blocks)
    
*   RIS timing (sent prior to rotation end date)
    
*   Schedule Confirmation (monthly admin attestation)
    
*   Block-end Primary service designation
    
*   Releases (N records per overlapping released-program block)
    
*   Schedule lockout (operates per-day)
    
*   Schedule Validation / IRIS reporting (block-aligned per-trainee)
    
*   GME Schedule Changes audit (delete-all/reinsert-survivors mechanic)
    

## 3.3 GET /task

Returns all task definitions for a company. This is a reference/lookup endpoint—called to populate the wizard's mapping options and to build a TaskKey → task metadata map.

### Request

wide760

No date parameters. Returns all tasks for the company.

### Response Fields (Key Subset)

Field

Type

Description

`TaskKey`

UUID

Primary identifier. Matches TaskKey in /schedule and /rotations.

`TaskId`

string

Human-readable ID (e.g. "ADMIN AM \[33914\]"). Note: can differ in case from Abbrev.

`Name / Abbrev`

string

Full name and abbreviation (often identical).

`Type`

string

Task type: Working, TimeOff, etc.

`IsRotationTask`

bool

Distinguishes rotation tasks from shift/clinic tasks. Rotation tasks must be continuous in QGenda.

`BgColor`

hex string

Background color (no # prefix, e.g. ccccff).

`Manual`

bool

Whether task supports manual assignment.

`CompKey`

UUID

Company (institution) this task belongs to.

`StartDate / EndDate`

datetime

Task validity window (empty = no restriction).

`TaskShifts`

array

Associated shift templates (can be null).

`Profiles`

array

Associated profiles (can be null).

`TaskVisibility`

string

E.g. Show Everywhere.

`PayrollId / EmrId`

string

External system identifiers.

`LastModifiedDateUtc`

datetime

Audit timestamp.

## 3.4 GET /staffmember

Returns all staff members for a company. Reference/lookup endpoint for building a StaffKey → staff metadata map.

### Request

wide760

No date parameters. Returns all staff for the company.

### Response Fields (Key Subset)

Field

Type

Description

`StaffKey`

UUID

Primary identifier. Matches StaffKey across all other endpoints.

`StaffId`

numeric

Numeric ID (can be empty for incoming residents).

`FirstName / LastName`

string

Name fields.

`Abbrev`

string

Display format: LastName, FirstInitial. Matches StaffAbbrev in /schedule.

`Email`

string

Email address.

`EmrId`

string

EMR system ID.

`StaffInternalId`

string

Internal ID string (e.g. M298880).

`PayrollId`

string

Payroll system ID.

`StaffClassification`

string

E.g. Resident / Fellow. Not available on /schedule—only here.

`IsActive`

bool

Active status.

`StartDate`

datetime

When staff member entered the system.

`EndDate`

datetime

Employment end. Sentinel value 2100-01-01 = no end date.

`DeactivationDateUtc`

datetime

When account deactivates (most reliable departing-staff signal).

`UserProfile`

string

QGenda user role (e.g. FLA End User, FLA Schedule Owner).

`MobilePhone / Pager`

string

Contact numbers.

`Tags / TTCMTags`

string/array

Tagging systems. Tags include program-level identifiers.

`Skillset / Profiles`

array

Skill and profile assignments (can be null).

`Fte`

decimal

FTE value.

`LastModifiedDateUtc`

datetime

Audit timestamp.

`CalSyncKey`

UUID

Calendar sync identifier.

# 4\. OData Filter Syntax

The $filter parameter uses OData syntax. Key patterns observed in MedHub's integration:

## 4.1 Common Filter Patterns

wide760

## 4.2 GUID Syntax

GUIDs must be wrapped in `guid'...'` syntax: `TaskKey eq guid'850da673-b752-4684-9cfe-1018827a89ca'`. Omitting the guid prefix will cause a parse error.

## 4.3 URL Encoding

The `$filter` parameter is URL-encoded as `%24filter`. Spaces in the filter expression become `+`. Single quotes around GUIDs are encoded as `%27`.

# 5\. Data Model Mapping: QGenda → MedHub

## 5.1 Activity Type Mapping

Activity

QGenda Endpoint

MedHub Target

Cardinality

Rotations

/schedule/rotations

sh\_tracks\_slots

1 QGenda entry → N MedHub records (split to rotation blocks)

Shifts/Calls

/schedule (per-day)

Shift assignments

~1:1 (per-day entries)

Clinics

/schedule (per-day)

Clinic assignments

~1:1 (per-day entries)

Faculty

/schedule (filtered)

Faculty assignments

Mapped via wizard

## 5.2 ScheduleKey Reconciliation

MedHub does **not** store the QGenda ScheduleKey on imported records. (Confirmed by dev in AMBS-22083, April 2026.) Although the `qgendaScheduleKey` field exists on `sh_tracks_slots` and `sh_faculty`, dev has confirmed that this value is **computed by MedHub internally** and is **not** the ScheduleKey UUID from the QGenda API response. It cannot be used to trace an assignment back to a specific QGenda schedule entry.

This means there is no direct foreign key from any MedHub assignment table back to a specific QGenda schedule entry. Reconciliation between the two systems must be done indirectly through the wizard mapping tables (matching on staff + task + date), as described in the Reconciliation Guide.

# 6\. Releases & Cross-Program Scheduling

## 6.1 How Releases Work

When a trainee rotates through a program outside their primary program, MedHub uses a "releasing program" function. From the QGenda integration perspective:

*   Trainees must have a tag corresponding to each program they are scheduled in.
    
*   The Task must also carry the matching program tag.
    
*   MedHub's sync determines which program receives an assignment based on which program's tag GUID was used in the API request (the companyKey parameter) and which Task is being queried.
    

## 6.2 QGenda's Recommendation

Use effective-dated program tags on trainees, so the released program's tag activates only during the dates the trainee will be scheduled there. This avoids permanently tagging every trainee with every program they might rotate through.

## 6.3 Data Model Under a Release

*   1 release record in sh\_tracks\_releases (the logical release record).
    
*   N records in sh\_tracks\_slots—one per overlapping rotation block on the released program's side, plus the home program's view.
    
*   The scheduled\_flag on sh\_tracks\_releases flips when the released program's admin completes scheduling.
    

**Implication:** Editing or deleting one piece of a released assignment triggers a delete-all-related + reinsert-survivors operation to maintain integrity between the home-side single-record view and the released-side N-record view. This is why the audit log may show activity on records the user didn't explicitly touch.

# 7\. Known Integration Behaviors & Gotchas

*   **Clinic work period mismatch (#1 cause of missing clinic imports):** MedHub matches QGenda clinic entries to MedHub clinic work periods based on timestamps. The start and end times of the QGenda clinic entry must match the start and end times of a defined clinic work period in MedHub exactly. If they do not match exactly, the clinic silently fails to import—no error is logged, and nothing appears in MedHub. This is the most common reason clinics don't import when users expect them to. To troubleshoot: compare the `StartTime`/`EndTime` on the QGenda `/schedule` response against the clinic work period definitions in the MedHub program. Work period names (AM, PM, etc.) do not matter for QGenda matching—only the timestamps matter. (Confirmed in AMBS-17161, AMBS-18381, and AMBS-13420.) Note: this is different from Amion, where work period names must be exactly "AM", "PM", "AM/PM", or "EVE".
    
*   **Evaluation triggering threshold:** QGenda-imported assignments fail automated evaluations when QGenda has trainees in 1–2 day increments. The minimum-day threshold (typically 6 days) is never hit. Fix: build services in continuous blocks on the QGenda side.
    
*   **Faculty matching collision (resolved):** Previously (Ticket #174419, AMBS-6607), when a faculty member had a prior resident account on the same MedHub site, the system defaulted to the older inactive resident account. This has been fixed—the system now searches for faculty accounts first, then resident, then student accounts. (See Sprint Review Notes for MHDP-1602.)
    
*   **Same-name user matching (still active):** Two different staff members with the same last name can cause cross-assignment. For example, AMBS-19324 documented a case at Mayo where Amanda Hill and Kasey Hill had clinic assignments swapped because the system matched on the wrong "Hill." This is a separate issue from the faculty matching collision above and has not been resolved by the order-of-operations fix. Verify user mappings in sh\_qgenda\_users when cross-assignment is suspected.
    
*   **Overnight shifts:** Shifts spanning midnight (e.g. 6pm–6am) display as two days in MedHub with a +1 indicator. This is a known display difference, not a bug.
    
*   **Primary service designation:** NOT imported. Must be set manually in MedHub after import. Subsequent syncs will not overwrite manual Primary settings.
    
*   **Manual edits inside sync window:** Editing a QGenda-imported assignment manually within the forward/back-days window demotes it to manual. The next sync re-adds the QGenda copy, producing an apparent duplicate.
    
*   **Duplicate cleanup:** As of 1/22/2026 (AMBS-14786), the root task script now correctly identifies and removes manual schedule entries first whenever duplicate assignments exist. Interface-imported entries (from QGenda, Amion, etc.) are preserved over manual ones. The Remove Duplicate Service Assignments utility on the root side can also be used to clean up existing duplicates.
    
*   **Unpublished partial blocks:** For rotation blocks, even one unpublished day causes the entire block to be reported as unpublished by the API, and MedHub skips it entirely.
    
*   **CompKey in response vs. request:** The CompKey in the response is always the institution-level Company Key, even when the request used a program-level tag GUID. The tag GUID is NOT reflected back in the response.
    
*   **Cross-academic-year rotations:** If a service assignment spans academic years, the users and services must be mapped in both academic years' wizard configurations. (Ticket #153697.)
    
*   **Test sites:** Test/sandbox sites generally cannot import QGenda schedules. Only live sites have the import functionality enabled. (Ticket #218318.)
    

# 8\. Endpoint Cross-Reference

How key fields appear across endpoints:

Field

/schedule

/rotations

/task

/staffmember

StaffKey

✓

✓

—

✓

TaskKey

✓

✓

✓

—

CompKey

✓

—

✓

✓

ScheduleKey

✓

—

—

—

RotationHashKey

—

✓

—

—

Staff names/contact

Full

—

—

Full

Task names/config

Full

—

Full

—

Location data

Full

—

—

—

IsRotationTask

✓

(implicit)

✓

—

IsPublished

✓

✓

—

—

Shift times (UTC)

✓

—

—

—

**Key takeaway:** /schedule is the richest endpoint with fully denormalized data—no secondary lookups needed. /schedule/rotations is minimal (StaffKey + TaskKey + date range only) and requires /staffmember and /task to resolve human-readable names. /task and /staffmember are reference endpoints called once to build lookup maps.

# 9\. MedHub Database Schema – QGenda Tables

The following tables in MedHub's database store QGenda integration configuration and imported data. Understanding these is essential for troubleshooting sync issues and data reconciliation.

## 9.1 i\_programs (Program Settings)

Two QGenda-specific columns on the main programs table enable the integration per-program:

Column

Data Type

Description

`setting_schedule_qgenda`

tinyint(1)

Enable QGenda interface. 0=Disabled, 1=Enabled.

`setting_schedule_qgenda_companykey`

varchar(50)

Stores the program's tag GUID (not the institution CompKey). Passed as companyKey in all API requests for this program.

## 9.2 sh\_qgenda (Interface Configuration)

Central config table for each QGenda interface instance. One record per program per academic year.

Column

Data Type

Description

`qgendaID`

smallint(6) PK

Unique identifier. Referenced by all mapping tables.

`programID`

smallint(6) FK

FK → i\_programs.programID

`rotationsetID`

smallint(6) FK

FK → i\_rotationsets. Scopes to academic year.

`import_shifts`

tinyint(1)

Import shifts flag. 0=Disabled, 1=Enabled.

`import_clinics`

tinyint(1)

Import clinics flag.

`import_services`

tinyint(1)

Import services (rotations) flag.

`update_users`

date

User mapping last updated date.

`update_shifts`

date

Shift mapping last updated date.

`update_clinics`

datetime

Clinic mapping last updated.

`update_services`

datetime

Service mapping last updated.

## 9.3 Wizard Mapping Tables

These tables store Task Wizard mappings—the link between QGenda TaskKeys/StaffKeys and MedHub entities.

### sh\_qgenda\_services (Service/Rotation Mappings)

Column

Data Type

Description

`refID`

smallint(6) PK

Unique record identifier.

`qgendaID`

smallint(6) FK

FK → sh\_qgenda.qgendaID

`serviceID`

mediumint(9) FK

FK → sh\_schedules\_services.serviceID. MedHub rotation this maps to.

`qgenda_taskkey`

varchar(50)

QGenda TaskKey UUID. Matches /task and /schedule/rotations.

`status`

tinyint(1)

Mapping status.

### sh\_qgenda\_shifts (Shift/Call Mappings)

Column

Data Type

Description

`refID`

smallint(6) PK

Unique record identifier.

`qgendaID`

smallint(6) FK

FK → sh\_qgenda.qgendaID

`shiftnameID`

mediumint(9) FK

FK → sh\_schedules\_services\_shiftnames. MedHub shift definition.

`qgenda_taskkey`

varchar(50)

QGenda TaskKey UUID. Matches /task and /schedule.

`status`

tinyint(1)

0=Inactive, 1=Active.

### sh\_qgenda\_clinics (Clinic Mappings)

Column

Data Type

Description

`refID`

mediumint(9) PK

Unique record identifier.

`qgendaID`

smallint(6) FK

FK → sh\_qgenda.qgendaID

`clinicnameID`

mediumint(9) FK

FK → clinic name definition. MedHub clinic this maps to.

`qgenda_taskkey`

varchar(50)

QGenda TaskKey UUID.

`status`

tinyint(1)

Mapping status.

`last_modified_utc`

datetime

Last modification timestamp.

### sh\_qgenda\_users (User/Staff Mappings)

Column

Data Type

Description

`refID`

smallint(6) PK

Unique record identifier.

`qgendaID`

smallint(6) FK

FK → sh\_qgenda.qgendaID

`userID`

int(11) FK

FK → users.userID. MedHub user this QGenda staff maps to.

`qgenda_staffkey`

varchar(50)

QGenda StaffKey UUID. Matches /staffmember and /schedule.

`status`

tinyint(1)

0=Inactive, 1=Active.

## 9.4 sh\_qgenda\_programs (Releasing Programs)

Tracks releasing program relationships for cross-program QGenda scheduling, scoped by academic year.

Column

Data Type

Description

`refID`

smallint(6) PK

Unique record identifier.

`rotationsetID`

smallint(6) FK

FK → i\_rotationsets. Academic year scope.

`programID`

smallint(6) FK

FK → i\_programs. The home program.

`release_programID`

smallint(6) FK

FK → i\_programs. The program being released to.

## 9.5 QGenda Fields on Assignment Tables

Imported data lands in MedHub's standard scheduling tables. There is **no QGenda-sourced identifier stored on any assignment record** — MedHub does not persist the QGenda ScheduleKey from the API response. (Confirmed by dev in AMBS-22083, April 2026.)

### The qgendaScheduleKey field (misleading name)

The `qgendaScheduleKey` field exists on two tables:

*   **sh\_tracks\_slots** (Trainee Service/Rotation Assignments) — `qgendaScheduleKey` (text)
    
*   **sh\_faculty** (Faculty Service/Clinic Assignments) — `qgendaScheduleKey` (text)
    

Despite its name, **this is a value computed internally by MedHub, not the ScheduleKey from QGenda's API.** It cannot be used to trace an assignment back to a specific QGenda schedule entry. (Per Jeff Stevens, AMBS-22083: "This is something that is computed by MedHub and not the Schedule Key from QGenda.")

### Tables with no QGenda-specific field at all

*   **sh\_tracks\_shifts** (Trainee Shift/Call Assignments) — No QGenda-specific field. The `via_api` flag indicates whether the record was created via MedHub's own external API—it is unrelated to QGenda.
    
*   **sh\_faculty\_shifts** (Faculty Shift Assignments) — Same. No QGenda field; `via_api` refers to MedHub's API, not QGenda.
    
*   **sh\_clinics** (Clinic Assignments) — Same. Has `amion_flag` (values: 0=None, 1=Amion, 2=SpinFusion, 3=OpenTempo, 4=Momentum) but no QGenda-specific value. `via_api` refers to MedHub's own API.
    

### Implications

There is no field on any MedHub assignment record that can be used to directly identify it as QGenda-sourced or to trace it back to a specific QGenda entry. The Schedule Changes Audit in MedHub does display shift and clinic changes as "via QGenda," but this is **inferred** at display time (likely from the combination of sync timing, wizard mapping status, and absence of a user session)—not read from a stored flag.

Reconciliation between QGenda and MedHub must be done indirectly through the wizard mapping tables (matching on staff + task + date). See the separate Reconciliation Guide for query patterns.

**Note on via\_api:** The `via_api` field (tinyint, 0=No, 1=Yes) appears on `sh_tracks_slots`, `sh_tracks_shifts`, `sh_faculty`, `sh_faculty_shifts`, and `sh_clinics`. It indicates whether the record was created through MedHub's own generic external API (used by third-party consumers calling MedHub endpoints). It does NOT indicate QGenda or any other scheduling interface integration.

## 9.6 Entity Relationship Summary

*   `i_programs` → `sh_qgenda` (via programID): one QGenda config per program per academic year.
    
*   `sh_qgenda` → `sh_qgenda_services` / `sh_qgenda_shifts` / `sh_qgenda_clinics` / `sh_qgenda_users` (via qgendaID): each config has N mapping records.
    
*   Mapping tables bridge QGenda UUIDs (`qgenda_taskkey`, `qgenda_staffkey`) to MedHub entity IDs (`serviceID`, `shiftnameID`, `clinicnameID`, `userID`).
    
*   Imported assignments land in standard scheduling tables (`sh_tracks_slots`, `sh_tracks_shifts`, `sh_faculty`, `sh_faculty_shifts`, `sh_clinics`) with **no QGenda-sourced foreign key** stored on the records.
    
*   `sh_qgenda_programs` tracks cross-program release relationships, scoped by academic year.

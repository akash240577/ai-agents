# MedHub - Curriculum Mapping (UME) - markdown

# MedHub - Curriculum Mapping (UME)

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

> **Coming changes.** This functionality has product changes planned for later this year as MedHub continues work on AI-assisted Automated Curriculum Mapping (the Board Vitals integration). This document covers the **current state** as of the April 2026 baseline. Changes coming later this year include AI-assisted session-objective extraction and automated mapping; details and timing are not finalized. **Document the current state when troubleshooting; do not speculate about coming behavior.**

## Overview

Curriculum Mapping is a UME-only feature (medical school side) that captures the structural relationship between a school's high-level program objectives, its course-level objectives, the sessions taught in each course, and the assessment methods used to measure them. Its primary purpose is to produce the **AAMC Curriculum Inventory (CI) Medbiquitous XML export** — the standardized data submission that LCME-accredited medical schools file annually.

The mapping is hierarchical:

*   **Educational Program Objectives (EPOs)** — the top-level outcomes the institution expects all graduates to demonstrate. Sometimes called "Program Objectives" or "Institutional Objectives." Tagged to ACGME-style competencies.
    
*   **Course Objectives (COs)** — the outcomes a specific course expects students to demonstrate. Each course has its own list. Course objectives roll up to one or more EPOs.
    
*   **Course Sessions** — the actual teaching events within a course (lectures, labs, small groups, clinical experiences). Each session has educational methods, resources, and topics.
    
*   **Session Objectives** — the outcomes a specific session expects students to demonstrate. Session objectives roll up to one or more course objectives.
    

The "ideal" linking pattern is **Session → Session Objective → Course Objective → EPO** — every session objective rolls up through a course objective to an EPO, and no level is skipped. Linking patterns that skip levels (Session directly to Course Objective; Session Objective directly to EPO; "orphan" sessions with no links at all) are tracked but flagged as undesirable.

This document covers Curriculum Mapping as a feature: the four-tab structure, the Course Sessions and their educational methods/resources/topics, the AAMC Medbiquitous export, the desirable vs. undesirable linking framework, the December 2023 enhancements to undesirable-link tracking, the academic year copy logic, search behavior, faculty access controls, and the operational patterns that come up in support tickets.

It does not cover: Curriculum Goals & Objectives (the daily-operational rotation/course curriculum delivery feature — see **MedHub - Curriculum Goals & Objectives**); Course List structure (see **MedHub - Course List**); or the Board Vitals AI integration coming later this year.

## Where it lives

Accessed from the Student Administrator's homepage → **Curriculum Mapping** (or, for clients with custom labels, the institution's term for it). The page has four primary tabs (in linking-flow order):

1.  **Educational Program Objectives (EPO)** — list of EPOs with linked Assessment Methods, Sessions, Session Objectives, and Course Objectives counts.
    
2.  **Course Objectives (CO)** — list of COs by course, with linked Sessions and Session Objectives counts.
    
3.  **Course Sessions** — list of sessions with their educational methods, resources, topics, and the warning indicator for undesirable linking.
    
4.  **Session Management** — alternate view of sessions used for bulk edits, including the **Order column** showing session number.
    

The four tabs all show the same underlying data viewed from different starting points. Edits in any tab flow to the others.

### Access requirements

> **Student Administrators need at least 'Reports' access to see the Curriculum Mapping link on the Home page.** This is the minimum access. (Confirmed Jenny 11/15/19.)

> **Faculty access is gated by** `curriculum_faculty_view` root setting. Default = 0 (disabled). When enabled (= 1), faculty members who are not Course Directors or Associate Course Directors can access **read-only** Curriculum Mapping for the courses they have access to. They must be tied to at least one Course/Clerkship to see anything. They cannot modify or export — only view and search. (Confirmed BG, edited LS/HN.)

> **Course Admins and Faculty cannot see the entire curriculum map — only their own courses.** There is no root setting to grant access beyond assigned courses. The only workarounds: (a) add them to the additional courses they need to view, or (b) link a limited Course Admin profile to specific Faculty users with only lists/settings access. (Ticket 239768, AMBS-11654.)

## The Educational Program Objectives (EPO) tab

The EPO tab is the highest level of the curriculum map. Each EPO has:

*   **Objective Name** (full text)
    
*   **Short Name** (used for export and display)
    
*   **Tagged Competency** — the ACGME-style competency this EPO maps to (e.g., Patient Care, Medical Knowledge, Practice-Based Learning, etc.)
    
*   **Domain** (used for the AAMC import template — "categories" within the curriculum map)
    
*   **Assessment Methods column** — Lists all linked assessment methods regardless of whether the link is desirable or undesirable. If a given assessment method is associated with both desirably and undesirably linked sessions, it displays only once. Includes both formative and summative assessment methods.
    
*   **Sessions column** — Count of desirably and undesirably linked sessions. Undesirable count is hidden if none exist; warning icon displayed next to undesirable count when present.
    
*   **Session Objectives column** — Count of desirably and undesirably linked session objectives. Same display logic.
    
*   **Course Objectives column** — Count of linked course objectives. No undesirable count (it's only possible to create desirable links to EPOs from course objectives).
    

> **The Tagged Competency cannot be changed once created.** When an EPO is created or copied from a previous academic year, the competency tagged to it is hardcoded and cannot be modified. Workaround: inactivate the EPO and re-enter it with the correct competency. After re-entering, ensure any previously-linked Course Objectives are re-tied to the new EPO. (Ticket 164058, confirmed BG/KA/Andy 11/11/20.)

> **The EPO tab's "Linked Sessions" count only reflects sessions DIRECTLY linked to the EPO.** This is by design — and a known display gap. Sessions should be linked through Session Objectives → Course Objectives → EPO, not directly to the EPO. The display has not yet been enhanced to show the recommended (transitive) linking structure. The EPO tab will be updated to show counts including indirect links once MEDM-3365 is completed; until then, the EPO tab's Sessions column undercounts the actual session coverage. (Ticket 208575, AMBS-9059, confirmed BS/ML 11/4/2022.)

## The Course Objectives (CO) tab

Each course's CO list is shown here. Course Objectives can be linked to one or more EPOs (only desirable links are possible from CO → EPO). Each CO row shows:

*   **Course / Clerkship** — the course this CO belongs to
    
*   **Objective Name**
    
*   **Short Name**
    
*   **EPOs** — list of EPOs the CO is linked to
    
*   **Sessions column** — count of desirably and undesirably linked sessions
    
*   **Session Objectives column** — count of session objectives linked to the CO
    

### Inactivating Course Objectives — what carries over

Inactivating a CO is a more complex operation than it looks because of the cascading effect on Session Objectives.

The intended behavior is:

> **If session objectives linked to the CO are NOT linked to OTHER course objectives**: those session objectives are also inactivated (treated as orphaned).
> 
> **If session objectives linked to the CO ARE linked to OTHER course objectives**: those session objectives remain active.

(Confirmed Product Team via Andy on Teams, 3/5/2021.)

Specific behaviors observed:

*   **Inactivating a CO when sessions are linked to other COs**: only the CO is deactivated; sessions and session objectives remain active.
    
*   **Inactivating multiple COs at once**: 0 inactivated if all selected COs have session objectives linked to OTHER active COs. (Ticket 164489.)
    
*   **A reported but resolved issue**: in 2020-2021, inactivating COs in some cases also removed visible course sessions even when the sessions were linked to other COs. The behavior was clarified above; the underlying issue is that the inactivate-cascade was working as designed but the UX was unclear. (Ticket 170198.)
    

> **A "0 inactivated" result usually means the CO's session objectives are linked to other active COs.** Check the linking before assuming the inactivate failed.

## The Course Sessions tab

Sessions are the actual teaching events. Each session has:

*   **Session Title**
    
*   **Session Number / Order** — display order within the course
    
*   **Date** — when the session occurs
    
*   **Educational Methods** — pulled from a hardcoded MedBiquitous-aligned list (Lecture, Small Group, Lab, Clinical Experience, etc.)
    
*   **Resources** — items in the **MedBiquitous Resources** UME demographics list (must be exactly named "MedBiquitous Resources")
    
*   **Topics** — items in the **Session Topics** list (configured in List Management as Student Administrator)
    
*   **Assessment Methods** — items in the **Curriculum - Assessment Methods** list (configured in List Management as Student Administrator)
    
*   **Session Objectives** — list of objectives for the session, with their linked Course Objectives
    
*   **Linked Course Objectives** — separate from Session Objectives; legacy direct-link path now flagged as undesirable
    
*   **Linked EPOs** — separate from Session Objective routing; also flagged as undesirable
    
*   **"Include in export" toggle** — controls whether the session is included in the AAMC Curriculum Inventory XML export
    

### Educational Methods configuration

The Educational Methods list is institution-wide and aligned with MedBiquitous standards. Adding/removing methods requires Support involvement to maintain MedBiquitous compliance. **Removing a non-standard method** (e.g., "Clinical Correlation" in 2015 was removed because it wasn't in the MedBiquitous standardized vocabulary) requires a Support ticket. (Ticket 86084.)

### The "Include in export" / Curriculum Map field

Each session has a dropdown setting in **Curriculum Map field** that determines whether the session is included in the AAMC export. Two values:

*   **Include in export** — session is included
    
*   **Exclude from map** — session is excluded
    

Used when an institution must duplicate a session for student-group scheduling (e.g., one session for Group A, one for Group B), and only one of the duplicates should be exported to AAMC.

> **The Course also has a "Add to Curriculum Inventory" toggle.** This is set in the Course/Clerkship List, not in Curriculum Mapping. Both the course-level toggle and the session-level "Include in export" must be set for the session to appear in the export. (Ticket 84142.)

### Warning indicators on the Course Sessions tab

A warning indicator (typically a small triangle/exclamation icon) on a session row indicates an **undesirable link** in the session's details. The link is one of:

*   **An EPO is tagged at the Session Objective level.** Session Objectives should only link to Course Objectives, not directly to EPOs. To fix: edit the session, remove the EPO tag from each Session Objective, save.
    
*   **A Course Objective is tagged at the bottom of the full session detail page (direct CO link, not via Session Objective).** Session Objectives should be the path to Course Objectives. To fix: detag the redundant CO links at the bottom of the modify-session page, save.
    

(Ticket 230857, documented LS 12/11/2023.)

> **The fix is to ensure the only path is Session → Session Objective → Course Objective → EPO.** Direct CO or EPO links at the session level (or EPO at the session-objective level) are the undesirable patterns the warning catches. The MedHub UME Industry Consultant Meggi Platt has presentation materials that explain this with screenshots — request from Support if needed.

## The Session Management tab

Alternate session list with sortable columns, designed for bulk operations. Includes the **Order column** showing session number — added in the December 2023 release for visibility.

### Session order behavior

*   When a session is **inactivated**, it becomes unnumbered; all subsequent sessions' numbers adjust accordingly. (December 2023 release.)
    
*   When a session is **reactivated**, it's renumbered based on its position in the active sequence.
    

### Session calendar behavior

> **Sessions appear on each enrolled student's personal calendar.** Adding a session schedules it on the calendar of every student enrolled in the course. (Tested by Jenny 10/7/20.)

> **Pre-populated future sessions don't auto-update when recurrence changes.** When the recurrence interval of a session is changed (e.g., from weekly to bi-weekly), already-scheduled future sessions on the calendar are NOT updated. To clean up, manually delete the pre-populated future sessions that no longer align with the new interval. There is no script to bulk-remove these. Product is not planning an enhancement in the foreseeable future. Clients can discuss with their CSM. (Ticket 231129, AMBS-10325.)

### Adding a new session — common error

> **"Error: missing location" when adding a session.** The error message doesn't say which location is missing, but the cause is that the school has no Locations or Campuses defined. Locations are set in **List Management → Locations/Campuses** by Student Administrators. Add at least one location to resolve. (Ticket 185845, AMBS-7762.)

## December 2023 release — undesirable link tracking

The December 2023 release made the curriculum map's tabs accurately reflect both **desirable** and **undesirable** links across all four tabs:

> **Desirable** = links that follow the ideal hierarchy (Session → Session Objective → Course Objective → EPO).
> 
> **Undesirable** = links that skip one or more levels:
> 
> *   Session → Course Objective → EPO (skips Session Objective level)
>     
> *   Session → Session Objective → EPO (skips Course Objective level)
>     
> *   "Orphan" Session (no links at all)
>     
> *   Session → Session Objective (no further links)
>     
> *   Session → Session Objective → Course Objective (no link to EPO)
>     

What changed on each tab:

*   **EPO tab**: Sessions and Session Objectives columns now include both desirable and undesirable counts. Undesirable count hidden if none exist; warning icon shown next to undesirable count.
    
*   **Course Objectives tab**: Sessions column now includes both desirable and undesirable counts. Same display logic.
    
*   **Course Session tab**: Order column added; session inactivation now produces clean renumbering.
    
*   **No changes to Course Objectives column on EPO tab and Session Objectives column on CO tab**: these only support desirable links by design.
    

(ES 12/13/2023.)

## Search

Two search modes — **Global Search** and **Advanced Search** — with specific scope.

### What's actually searched

Global and Advanced Search (under "search terms") only search these specific fields:

*   **EPO** — Objective Name field and Short Name field
    
*   **Course Objective** — Objective name
    
*   **Course Session** — Session name and Session Summary & Objectives
    

### What's NOT searched by default

The **Topics** field on a Course Session is **not searched** by either Global Search or Advanced Search using the regular search-term box. To search by Topics:

1.  Open Advanced Search.
    
2.  Change the **Topics** field from "(all topics)" to the specific topic.
    
3.  Run the search.
    

(Ticket 182626, confirmed CD/HN 9/2/2021.)

### Export Mapped Search Results

The **Export Mapped Search Results** function on Advanced Search produces a different output than the regular results. Instead of a narrow set, it exports **all upstream and downstream connections** within the curriculum map for the keyword. For example, if a search returns a Session Objective, the mapped export will include the EPOs, Course Objectives, and Course Sessions tied to that result.

(Ticket 158912, confirmed HN/SR/AV/BG 10/15/2020.)

> **A known limitation: Export Mapped Search Results may fail.** A complex script generates this report; if it errors, the function needs to be corrected. Data and Development cannot pull this for clients. (Ticket 209004, MHDP-2043, AMBS-8930, MHDP-1375.)

## Academic year copy

A new academic year's curriculum map can be created by **copying from the prior year**. The default flow:

1.  Click **Curriculum Mapping** on the homepage.
    
2.  Select the new academic year (e.g., 2025-26) from the dropdown.
    
3.  Click the **(none — copy from last year)** link that appears.
    
4.  The copy creates an exact duplicate of the prior year's map: EPOs, Course Objectives, Sessions, Session Objectives, Educational Methods, Resources, Topics, Assessment Methods.
    

### What does NOT carry forward

*   **Inactive items** — Inactive EPOs and other inactive objectives do **not** copy over. The new academic year's map starts with only active items from the source year. (Ticket 164965, AMBS-6282, confirmed Ben S.)
    

### Cannot copy a single course or specific portions

> **The Copy from prior year is all-or-nothing.** The "Copy Clerkship Objectives & Sessions" button (within Session Management) is for copying within the same year — from one course to another. The cross-year copy is the entire map, not specific courses. To bring a single course's prior-year sessions into the new year, the entire map must be copied first; then changes can be made to other courses. (Ticket 220808, documented LS 6/15/2023.)

### Cannot skip years

The cross-year copy moves from one year to the immediate next. To populate 2025-26 from 2022-23, the map must be copied 2022-23 → 2023-24 → 2024-25 → 2025-26, or built fresh from 2025-26.

## AAMC Curriculum Inventory (CI) Medbiquitous Export

The primary external use of Curriculum Mapping is generating the **AAMC Curriculum Inventory** XML for annual submission. The export is a complex, MedBiquitous-standardized XML file.

### Conditions for a course/clerkship to appear in the export

5 conditions must be true:

1.  The **course must be Active** in the Course/Clerkship List.
    
2.  The course/clerkship must be marked as **"Add to Curriculum Inventory"** in the Course/Clerkship List.
    
3.  The course must have **Sessions**.
    
4.  The course Sessions must be **Active**.
    
5.  The course sessions must be set to **"Include in export"** in the Curriculum Map field.
    

(Conditions 3, 4, 5 are set in Curriculum Mapping → Course Sessions.)

(Ticket 185568, confirmed Ben Sayer 10/20/2021.)

### School address and AAMC school ID required

Before submission, the school's address must be populated:

*   As Student Administrator, go to **Site Management → School Settings**.
    
*   Populate the school address.
    
*   Without this, the export will fail with `cvc-minLength-valid: Value '' with length = '0' is not facet-valid with respect to minLength '1' for type 'NonNullString'`.
    

(AMBS-7671, confirmed Ben Sayer 10/13/2021.)

### Curriculum Mapping by Location (Mayo and similar split-campus institutions)

A multi-campus institution can have separate curriculum maps per location. Enabled by `setting_students_curriculum_location` = 1. Once enabled, the EPO tab includes a Location dropdown, and the map can be filtered by location starting at the Course Objectives tab.

> **EPOs are NOT split by location.** EPOs apply across the entire school, regardless of location. Only the lower levels (Course Objectives, Sessions) can vary by location. (Ticket 84906, confirmed TR.)

### Two types of submission errors

When uploading the XML to AAMC's CI portal, two error categories:

**1\. XML file failed to upload (validation error)** — The file did not meet the minimum standards of the MedBiquitous Curriculum Inventory Data Exchange Standard. This error is thrown at upload time. Common causes: empty required fields, school address not populated, malformed structure. Send to Tier 2 to escalate to Development if MedHub-side; provide:

*   Full text of the error
    
*   Copy of the XML file
    
*   Client contact info
    

**2\. Curriculum Inventory errors/warnings** — The file uploaded but content has errors/warnings. These are typically business-rule issues that the client works directly with AAMC to resolve. If the client traces the issue back to a MedHub data export problem, escalate to MedHub Development. (Ben Sayer 10/13/2021.)

### MedHub does NOT pre-test or upload on the client's behalf

> **Clients should export and upload themselves.** MedHub does not perform CI submission for clients — they should run the export, attempt the upload, and open a support ticket if errors occur. MedHub will assist with validation errors or business rule violations, but does not test or upload. (Confirmed ML/Ben Sayer 10/20/2022.)

> **Data and Dev cannot pull CI data for clients.** The export is a complex tool. Even if the export is unavailable, MedHub does not accept requests for Data or Dev to pull the data manually. The export tool must be corrected. (Ticket 206480, AMBS-8930.)

## Importing Curriculum Mapping data via template

The root-side **Import Curriculum Mapping tool** allows bulk import of curriculum data via Excel template.

Configuration steps:

1.  Use the **template provided in the root-side Import Curriculum Mapping tool**.
    
2.  Match column headers exactly when populating the template.
    
3.  All courses in the template must match an existing course in the Course List.
    
4.  Add Domains before running the import (the 4th column on the EPOs tab refers to "domains" within the curriculum map).
    
5.  Run the import in **test mode first**. Errors appear in different colors so the client can correct them.
    
6.  Once test mode shows no errors, uncheck test mode and run the import for real.
    

> **The import reads session abbreviations, not session numbers.** This is a code change made for the import tool — sessions in the template should be referenced by abbreviation, not by their order number in the existing map. (Ticket 117894, confirmed BS.)

## Common scenarios

### "Linked Sessions on the EPO tab is showing 0 even though sessions roll up to it"

The EPO tab's Sessions column only counts sessions DIRECTLY linked to the EPO. Sessions linked through the recommended path (Session → SO → CO → EPO) are not counted in this column. Working as designed pending MEDM-3365.

### "I want to inactivate a Course Objective but the inactivate result says 0"

The CO's session objectives are linked to other active COs. The system protects the linked SOs from cascading inactivation. Confirm by checking each session objective.

### "Warning indicators on the Course Sessions tab — what do they mean?"

An undesirable link exists in the session details. Either an EPO is tagged at the Session Objective level (only COs should be), or a CO is tagged at the bottom of the session details (only SOs should link to COs). Edit the session and remove the redundant tags.

### "I copied the curriculum map but inactive items aren't there"

Working as designed. Inactive items don't carry over from year to year.

### "I changed an EPO's competency but it's grayed out"

Competency tagged to an EPO is hardcoded after creation. The fix is to inactivate the EPO and re-create with the correct competency, then re-tie linked Course Objectives.

### "Search for 'cooking' returns nothing but I know it's a Session topic"

The Topics field is not in the default search scope. Use Advanced Search → set Topics to "cooking" → run.

### "I need to copy a single course's sessions to next year, not the whole map"

Not possible. The cross-year copy is all-or-nothing. Either copy the entire map and adjust other courses, or use "Copy Clerkship Objectives & Sessions" within the same year to copy from another course.

### "AAMC submission failed with cvc-minLength-valid error"

School address is not populated. Set in Site Management → School Settings.

### "Export Mapped Search Results function isn't working / errors out"

This is a known limitation in the current code. Cannot be pulled by Data or Dev — the function must be corrected. Open an enhancement ticket; AMBS-8930 and MHDP-2043 are existing references.

### "Faculty Director needs read-only access to courses outside their assignment"

There is no setting for this. Either add the Faculty Director to additional courses or use a limited Course Admin profile. The `curriculum_faculty_view` setting only enables read-only access for courses the faculty is already tied to.

### "Pre-populated future sessions don't reflect a recurrence change I made"

There is no script to clean these up. Manually delete the misaligned future sessions.

### "Sessions are showing as undesirable links on the EPO tab — how do I fix?"

Open each flagged session, remove the EPO tag at the Session Objective level (link only to Course Objectives at that level), and save. Repeat for any redundant CO links at the session-detail bottom.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`curriculum_faculty_view`

Enables read-only Curriculum Mapping access for non-Director / non-Associate-Director faculty. Default 0 (disabled); set to 1 to enable. Faculty must be tied to at least one course.

`setting_students_curriculum_location`

Enables location-split curriculum mapping (multi-campus institutions). Default 0; set to 1 to enable. EPOs are not split by location, only Course Objectives and Sessions.

`setting_curriculum_*`

Misc curriculum map settings (varies by institution and version).

UME demographics list and List Management entries:

*   **MedBiquitous Resources** — UME demographics list (must be exactly named "MedBiquitous Resources") that populates the Resources dropdown on Course Sessions.
    
*   **Curriculum - Assessment Methods** — List Management list, configured by Student Administrator. Populates the Assessment Methods dropdown.
    
*   **Session Topics** — List Management list, configured by Student Administrator. Populates the Topics dropdown on Course Sessions.
    

School Settings (Site Management):

*   **School Address** — required for AAMC CI submission. The XML export will fail without this.
    
*   **AAMC School ID** — required for AAMC CI submission.
    

## Database tables appendix

Table

Purpose

`curriculum_epos`

Educational Program Objectives. Tagged to competencies; cannot be re-tagged after creation.

`curriculum_epos_competencies`

EPO → Competency mappings.

`curriculum_course_objectives`

Course Objectives, scoped to a course and academic year.

`curriculum_course_objectives_epos`

CO → EPO linkages (only desirable links exist here).

`curriculum_sessions`

Course Sessions — title, date, description, "Include in export" toggle.

`curriculum_sessions_objectives`

Session Objectives, scoped to a session.

`curriculum_sessions_objectives_cos`

Session Objective → Course Objective linkages (the desirable path).

`curriculum_sessions_objectives_epos`

Session Objective → EPO direct linkages (the undesirable path; tracked for warning indicator).

`curriculum_sessions_cos`

Session → Course Objective direct linkages (also undesirable; tracked for warning).

`curriculum_sessions_methods`

Session → Educational Method links.

`curriculum_sessions_resources`

Session → Resource links (MedBiquitous Resources).

`curriculum_sessions_topics`

Session → Topic links (Session Topics list).

`curriculum_sessions_assessments`

Session → Assessment Method links.

`curriculum_export_log`

Audit of AAMC CI XML export attempts.

`curriculum_locations`

Per-location curriculum map data when `setting_students_curriculum_location` is enabled.

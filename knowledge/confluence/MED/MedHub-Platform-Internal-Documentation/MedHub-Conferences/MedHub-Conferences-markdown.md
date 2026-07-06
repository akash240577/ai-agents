# MedHub - Conferences - markdown

# MedHub - Conferences

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Conferences in MedHub are the scheduled didactic events — grand rounds, morning report, lectures, journal club, tumor boards, M&M conferences, and so on — that programs offer to their trainees and faculty. The Conferences module covers the full lifecycle: scheduling individual or recurring conferences, configuring requirements and exemptions, recording attendance, sharing across programs, and reporting on attendance.

Conferences sit at the intersection of several other features:

*   **Scheduling** drives who is eligible to attend (trainees scheduled to a service may be required to attend conferences associated with that service)
    
*   **Evaluations** can be triggered from conference attendance sheets
    
*   **Work Hours** can be auto-populated from recorded conference attendance
    
*   **CME tracking** for faculty attendance can flow from in-house conferences
    

This document covers conferences as a feature: scheduling, attendance tracking, requirements, sharing, codeREADr integration, the Conferences Import Wizard, common operational patterns, and the settings that control conference behavior. It does not cover evaluation form configuration (see **MedHub - Evaluations - GME / UME**), CME tracking (see **MedHub - Faculty CME**), or work hour auto-population logic (see **MedHub - Work Hours**), except where those features intersect with conference attendance directly.

The terminology in MedHub uses "Conference" as the user-facing label and `lectures` in many database table names (a legacy of earlier terminology). Both refer to the same feature.

## Where it lives

Conferences are accessed from the **Conferences** tab in the global navigation. Within that tab, the Program Administrator (or Course Coordinator on the UME side) sees:

*   **Update Conference Schedule** — view, add, modify, batch-modify conferences
    
*   **Record Conference Attendance** — drop-down list of attendance sheets to record
    
*   **Define Conference Requirements** — set attendance requirements per trainee level and exemptions
    
*   **Define Conference Groups** — create groupings used for requirements and shared schedules
    
*   **Conference Schedule/Attendance Access** — grant individual trainees or faculty write access
    
*   **Mobile Scanning - codeREADr** — codeREADr integration for institutions using it
    
*   **Conference Locations** — view/manage location text values (only visible if `settings_billing_didactics` is enabled)
    
*   **Define Conference Locations** — Mayo-specific link, only enabled if `interface_conferences_flag` is on
    

The Program Settings → Conferences tab controls conference-related program-level behavior (faculty attendance, student attendance, asynchronous credit, etc.).

## Conference structure

A conference is a single discrete event with a date, time, and location, with optional metadata for credits, lecturer, presenter, materials, and attendees. Each conference has:

*   **Title**
    
*   **Date / Time** (start time only — no end time on the conference itself)
    
*   **Place / Location** (free text or selected from a dropdown of previously-used locations)
    
*   **Credits** (used in attendance reports — defaults to 1 when creating a conference)
    
*   **Mandatory** flag
    
*   **Post to Calendar** flag
    
*   **Conference Group** (used for requirements aggregation and sharing)
    
*   **Competencies**
    
*   **CME Tracking**
    
*   **Share with programs**
    
*   **Levels** (PGY-level designation)
    
*   **Service** (when posting to a specific service)
    
*   **Lecturer / Presenter**
    
*   **Materials** (uploaded files or external links)
    

A conference may be linked to a **service**, in which case attendance requirements can flow from service assignments. It may also be shared with other programs, in which case attendance is tracked separately by each program (more on this in "Sharing").

### Recurring conferences

To set up a recurring conference, create a new conference and check the box "Create multiple lectures using the following rules." This exposes options for:

*   **Day of the week** the conference will take place
    
*   **Frequency** — Every Week, Every Other Week, or Every 1st/2nd/3rd/4th/5th week of the month
    
*   **End date** for the recurrence
    

Recurring conferences are created as a **series of individual conferences** at submit time. Each instance is its own conference record — modifying one does not modify the others. Lecturer is typically left blank when creating the series and assigned per-instance.

There is an important caveat for recurring conferences that are also **service-specific**: when a series is created with a service-specific designation, the service-specific selection does not always carry to each instance. The series creation interface accepts the service, but each instance may need to be re-verified after creation (Ticket 133433).

## Conference Groups

Conference Groups are program-level groupings used for two purposes:

1.  **Requirements** — attendance requirements are defined per group, not per individual conference (e.g., "PGY-1 must attend 60% of Morning Report")
    
2.  **Sharing** — when a conference is shared with another program, the receiving program assigns it to one of its groups
    

Groups are created from the Conferences tab → Define Conference Groups. **Each program defines its own conference groups** — when a conference is shared, the receiving program decides which of its existing groups to place the shared conference in. Modifying a group in the source program does not flow to the receiving program (this is by design).

## Attendance

Attendance can be recorded several ways:

*   **Manual** — the Program Administrator (or designated trainee/faculty with access) opens the attendance sheet and checks attendees off
    
*   **Excel upload** — bulk upload from a `.xls` file
    
*   **codeREADr** — third-party barcode/QR scanning app (see codeREADr section below)
    
*   **Asynchronous credit** — for trainees who didn't attend in real time
    

### Attendance sheet display

The attendance sheet shows all possible attendees for the program, regardless of whether a specific conference applies to all of them. The criteria for who the conference applies to (PGY level, service, etc.) does _not_ remove non-applicable people from the attendance sheet — it only excludes the conference from their personal calendars and conference requirements (Ticket 225420, AMBS-9930).

This produces a recurring confusion: a service-specific or PGY-specific conference shows residents on the attendance sheet who aren't required to attend. They are still listed but don't appear in bold; the bold formatting indicates who the conference actually applies to.

### Recording absence on the attendance sheet

Absence indicators on the attendance sheet:

*   **V** — vacation
    
*   **C** — conference (away)
    
*   **L** — LOA
    
*   **E** — Excused
    
*   _Gray with letter_ — recorded absence (when the program setting "Identify residents with recorded absences" is enabled)
    

The absence display is controlled per-program via the **Identify residents with recorded absences** setting in the source program's Conferences → Attendance Sheet Settings. If your program is showing conferences shared from another program, the attendance sheet for those shared conferences uses the _source program's_ setting, which may differ from yours (Ticket 163359).

The system does **not** automatically mark a trainee as Excused (E) when they have a V or C marker. The administrator has discretion to mark a trainee as attended if they actually showed up despite having an approved absence. To allow trainees with approved absences to receive credit if they attend, enable Program Settings → Conferences → "Credit for Attending Exempt Conference."

The "Excused" option is **not available** for residents listed under "Other Programs (rotating residents)" on the attendance sheet. While home program conference requirements follow a released resident, the host program cannot mark the resident as Excused or Late. The home program retains that authority.

### Attendance sheet upload from Excel

Excel upload is enabled by Program Settings → Conferences → "Upload Attendance (Card Reader)". The file requirements:

*   `.xls` format (not .xlsx)
    
*   **Column labels** for Date, Time, and Location (in any order)
    
*   Plus one of: Employee ID, Username, or Email Address (for matching to the user)
    

The Location column data must **exactly match** the conference Location as entered in MedHub. The Time field must use 24-hour format or the proper time format (e.g., "8:00 AM"); "Noon" instead of "12:00" will fail. Time should be the start time only — not a range, not an end time.

The import relies on the unique user ID. If a user has multiple MedHub accounts (e.g., faculty and administrator), check that the unique ID matches; the import won't proceed if there's ambiguity.

**Excel upload overwrites previously-entered manual attendance.** This is by design but worth knowing before running an import on a sheet that already has manual attendance.

If a conference is **shared with multiple programs**, only the **authoring program** can complete the Excel import. The import can include attendees from any program (anyone on the attendance sheet), but only the authoring program runs it.

### Bulk-printing attendance sheets

There is no bulk-print option for attendance sheets. Each attendance sheet must be printed individually.

### Notes recorded on the attendance sheet

Notes recorded in the "Record Attendance Notes/Comments" section at the bottom of an attendance sheet are visible to:

*   Administrative users with access to conferences
    
*   Residents and faculty with Conference Schedule/Attendance Access (Conferences tab → Conference Functions → Conference Schedule/Attendance Access)
    

(Ticket 190012)

## Conference Requirements

Requirements are defined per Conference Group, per trainee level. The Define Conference Requirements link sets:

*   Required percentage attendance per group, per level
    
*   Exemptions (Vacation, Post Call, etc.)
    

### How requirements flow when settings change

The system uses **current** requirements for all calculations. There is no versioning of requirements. If you change a requirement (e.g., PGY-2 from 60% to 67% for next year), the change applies retroactively to current PGY-2s — and when those residents become PGY-3s, they'll be measured against the current PGY-3 requirements at that time, not the PGY-2 requirements they were under before.

If you need to preserve historical reporting under the old requirements, run and save reports _before_ making the change (Ticket 152379).

### Excused vs. Exempt

These are different concepts that often get confused:

*   **Excused (E)** is a per-conference, manually-applied marker. The Administrator marks a specific trainee as Excused for a specific conference when they had to miss it for an approved reason.
    
*   **Exempt** is a _category_ defined in Define Conference Requirements. Exemptions like Vacation, Post Call, etc., are automatic — when a trainee is on vacation during a conference, they're considered exempt for it (visible only in reports, not on the attendance sheet).
    

The attendance sheet does not show "Exempt" — it only shows "Excused" if you've manually marked it. Exemption status is reflected in the Conference Reports.

### Post Call exemption details

The Post Call exemption is configured in Define Conference Requirements. Specific timing rules:

*   **Regular (non-24-hour) on-site shift** scheduled 10 hours or less before a conference: exempt
    
*   **24-hour on-site shift/call** that takes place up to 14 hours before a conference: exempt (i.e., anything 0-14 hours before is exempt for a 24-hour shift)
    
*   **24-hour home call**, regardless of timing: not exempt
    
*   **Anything after a conference** (24-hour home call, 24-hour on-site, less than 24-hour on-site): not exempt (the conference is in the past relative to the shift)
    

These rules are confirmed and documented (Ticket 235836, ES 9/4/2024).

If trainees attend a conference they would have been exempt for, they receive credit for the attendance — and the "exempt" status only kicks in for conferences they did not attend, so they are not penalized for missing one.

## Sharing conferences across programs

A program can share its conferences with other programs to allow trainees released to that program (or programs whose trainees rotate through this one) to count attendance.

### How to share

Use **Batch Modify Conferences** at the bottom of the conference schedule. Define the conferences to share, then choose "Share with Other Programs (defined in next step)" from the Share with Program dropdown. Select the receiving programs.

Alternatively, share an individual conference by editing it and selecting programs in the "Post to programs" field at the bottom.

A Program Administrator can only share with programs they have access to. To share with a program the Administrator does not have access to, the GME Office (whose admin account is linked to all programs) must do the sharing.

If a shared conference is **updated**, the conference must be **un-shared and re-shared** to reflect the updates. The receiving program does not auto-receive subsequent edits.

### What happens on the receiving side

When a conference is shared with a program:

*   It appears on the receiving program's calendars and is available on its attendance sheets
    
*   The receiving program assigns it to one of _their_ conference groups
    
*   The receiving program's Define Conference Requirements settings determine how it counts toward attendance percentages
    
*   The receiving program records its own attendance separately
    

A few specific behaviors when sharing:

*   **Attendance already recorded prevents re-sharing.** For conferences where attendance has already been recorded, the conference cannot be re-posted to additional programs. Sharing must happen before attendance is taken.
    
*   **Service-specific designations don't carry on share.** If a conference is set up to require a specific service, the option to post the service-specific designation does not activate when the conference is also shared (Ticket 178592).
    
*   **The PGY-level designation behavior on share** — the user-facing behavior here may have shifted; check current product behavior before stating a definitive answer.
    
*   **Delete restriction.** If a shared conference has had attendance recorded by both the authoring program and the receiving program, the authoring program cannot delete it. Deletion requires Tier 2 data work (Ticket 171761).
    

### Rotating residents and excused status

Trainees released to a program from another (rotating residents) appear on attendance sheets but cannot be marked as Excused or Late by the host. The home program retains that authority.

## Conference Schedule/Attendance Access

The Program Administrator can grant individual trainees or faculty members write access to:

*   **Modify the conference schedule**
    
*   **Batch modify conferences by group**
    
*   **Record conference attendance** (without delivering evaluations or learning modules)
    

Access is granted from Conferences tab → Conference Functions → Conference Schedule/Attendance Access. Click +Add Access, choose the trainee or faculty member from the dropdown, and select what access to grant (Attendance and/or Conference Schedule).

When access is granted to a trainee, the relevant links appear in the **Tasks** box on the trainee's myHome page. For faculty, they appear in the **Faculty Access** box.

**Granting attendance access does not allow delivery of evaluations from the attendance sheet.** Conference evaluation delivery from the attendance sheet is restricted to Administrator roles. This is an intentional limitation — trainees and faculty with attendance access can record who attended but cannot trigger evaluations to be sent based on attendance.

## codeREADr integration

codeREADr is a third-party paid mobile app that allows the Administrator (or designated chief resident) to scan barcodes/QR codes of trainees as they enter a conference, recording attendance in real time. The institution subscribes to codeREADr separately (typically just one or two licenses for the people taking attendance). The Resident does not scan with their own phone.

### Setup

Set up requires configuring a "postback URL" in codeREADr that points back to the institution's MedHub site. The URL pattern:

`https://{client}.medhub.com/functions/apps/codereadr/index.mh`

The URL must use **https**, not http. If a connection error like "Read Error" or "Connection reset by peer" appears when scanning, check the postback URL — http vs https is the most common cause (Ticket from Geisinger, AMBS-7707).

To configure: navigate to [codereadr.com](http://codereadr.com) → Services → existing MedHub postback service → update the postback URL → click Type subtab → click Save and Continue.

### Printing barcodes/QR codes

Barcodes and QR codes are printed from MedHub at: Conferences tab → Mobile Scanning - codeREADr → Print Barcodes tab.

**Trainees do not appear in the printed QR codes until the first day of their training history record.** Incoming trainees with start dates of 7/1 will not be included in QR code printouts until that date (Ticket 220801).

### Time window for scanning

A scan must be performed **within 20 minutes of the conference start time** for codeREADr to successfully record attendance. Outside this window, an error appears. The 20-minute window is hardcoded (Ticket 155889).

### Time zone

The conference start time and the codeREADr scan time are compared against the institution's `global_timezone` setting. If this is misconfigured (e.g., a US institution with a non-US-time-zone setting), codeREADr will fail to validate scans within the 20-minute window. The timezone setting affects:

*   codeREADr conference attendance
    
*   Calendar sync
    
*   Reports (the date/time displayed in report headers)
    

It does not affect the date display elsewhere in MedHub. International institutions (e.g., Singapore) cannot get their local date to appear in the upper-left date display through this setting.

### What QR codes do (not the same as scanning to mark attendance)

Conference attendance sheets can have QR codes printed on them, but those QR codes are **for trainees to access conference materials** — not for them to mark themselves as attending. There is no feature where trainees scan their own QR code from their phone to record attendance. codeREADr is the only barcode-based attendance method, and it requires the Administrator (or chief) to do the scanning (Ticket 207186).

## Asynchronous credit

A program can grant a trainee credit for a conference they did not attend in real time. The Asynchronous Conference Credit setting must be enabled in Program Settings → Conferences.

Two important constraints:

*   **180-day hard limit.** Trainees can only log asynchronous credit for conferences within the past **180 days**. The dropdown of available conferences is hardcoded to this range (Ticket 85788).
    
*   **Cannot log async credit for conferences attended.** A trainee cannot retroactively log async credit for a conference where their attendance was already recorded (Sam 5/31).
    

For programs that schedule conferences solely for asynchronous learning, the attendance sheet must still be **submitted** by the Administrator before the conference can appear in attendance reports. Even if all credit is asynchronous, the sheet itself isn't finalized until submitted (Ticket 156630).

## Specific attendance scenarios

### Faculty attendance

Faculty conference attendance is enabled per-program via Program Settings → Conferences → "Faculty Conference Attendance." When enabled, faculty members appear on attendance sheets and can be marked attended.

To set faculty conference requirements, go to Conferences → Define Conference Requirements and scroll to the Faculty Conference Requirements section.

If "Mark Excused Residents/Faculty" is enabled in Program Settings, faculty can be excused from individual conferences directly on the attendance sheet.

A faculty member who was on the attendance sheet yesterday but is missing today: check Faculty Demographics for an institutional end date that has now passed. Faculty don't appear on attendance sheets after their institutional end date.

### Student attendance

Medical student attendance at conferences is controlled by the root setting `settings_students`. If `settings_students = 1`, the program-level setting "Student Conference Attendance" becomes available; programs can then enable student attendance per-program (Ticket 72710).

If a medical student is scheduled to a GME service, and that service has shared conferences, the student will see those conferences on their UME calendar (Confirmed Bill M.).

For UME-side pre-population of conferences to student timesheets in clerkships: this is controlled by the GME-side Medical School program, not by UME course settings (Ticket 121235).

### Outside Evaluator attendance

Outside Evaluators can be added to attendance sheets via Program Settings → Conferences → "Track Outside Evaluator Attendance." If a specific Outside Evaluator should not appear, go to Outside Evaluator settings (under Evaluations tab), check the evaluator's name, and use the action menu to disable Conference attendance.

The Conference Attendance Report will pull data for Outside Evaluators when this is enabled and attendance has been tracked.

### Visiting trainees

Visiting trainees can be added to attendance sheets via Program Settings → Conferences → "Visiting Trainee Conference Attendance."

### Pre-populate consecutive conferences

When one conference starts within 30 minutes of the end of a previous conference, and the dates, programs, and locations (same or undefined) are the same, a "pre-populate attendance for consecutive conferences" setting appears on the second conference's attendance sheet. When checked, attendance is mirrored from the first conference. Useful for Grand Rounds → Q&A type sequences.

## Lecturer dropdown

The lecturer dropdown when adding a conference shows residents available based on a multi-step lookup:

1.  Identify all courses associated with the current Course Coordinator (UME) or programs available to the Administrator (GME)
    
2.  Identify residency programs associated with those courses (via Supervising Program list in Procedures and/or linked services on the schedule)
    
3.  Show all active residents assigned to those identified programs
    

This means two coordinators with the same course access can see different residents in the lecturer dropdown if their procedure-side or schedule-side associations differ. To make residents from a specific program appear in another coordinator's dropdown, add that program to the Supervising Program list in Procedures (Ticket 133299).

**Only active residents appear in the dropdown.** Incoming residents (whose start date is in the future) will not appear in the lecturer dropdown until their start date arrives (Ticket 176303).

## Conference Locations

Conference Locations are created automatically by their use. When you add a new conference and select "Place: (Other - specify)," entering a new location string creates that location. After creating the conference, you can go to the Conference Locations page to assign a Site to that location for billing purposes (Ticket 244609).

The Conference Locations link on the right side of the Conferences page is enabled by `settings_billing_didactics`. The "Define Conference Locations" link on the left side is a Mayo-specific feature enabled by `interface_conferences_flag`.

> **Limitation**: Conference Locations cannot be deleted from the dropdown without removing all historical conferences that used them. Because locations are created by use, deleting a location requires removing the data tied to every past conference at that location. Tier 2 / Data team can delete requested locations, but only with full client awareness that historical conference data will be removed in the process. There is no in-product way to retire a location while keeping its historical data (Ticket 256118, MHDP-4082).

## Conference materials

Conferences can have materials attached — uploaded files or external links. The presenter receives an automated email reminder to upload materials before the conference, with a link to upload directly.

**Material download statistics work for files but not links.** When the Administrator views a conference and clicks the materials link, they see download counts for uploaded files, but not for materials added as external links — the system can only count downloads it directly serves. (Confirmed HN/LS 5/22/2025)

## Email and notifications

A few notification behaviors:

*   **Conference cancellation:** When a conference is cancelled, **no email or alert is sent.** The conference shows "cancelled" on calendars, but attendees are not actively notified.
    
*   **Conference modification:** When a conference's date, time, or location is updated, the Administrator is given the option to send an email notification to the presenter, the faculty, and/or the residents. Faculty notifications only go out if Faculty Conference Attendance is enabled in program settings.
    
*   **Lecturer reminder:** A presenter receives a reminder email a configurable number of days before the conference, including a link to upload materials.
    

## Reporting

Conference reports live under the Reports tab → Conference Attendance section. The most commonly used:

*   **Conference Attendance Report** — attendance counts/percentages per resident
    
*   **Conference Requirements Summary** — measures attendance against defined requirements
    
*   **Conferences Attended/Missed** — list view of attendance with detail
    
*   **Conference Schedule Details** — list view of scheduled conferences
    

A few reporting behaviors:

*   **Conferences with 0 credits don't count toward totals.** A conference set up with 0 credits will show as attended on the attendance sheet, but will produce a 1(1) display in reports because the credits — not the count — drive the totals. Recommend always setting at least 1 credit on every conference (Ticket 82498).
    
*   **Aggregate Evaluations Report has a 2-year window.** The Aggregate Evaluations Report only shows conferences from the last two years. For older conferences, evaluations must be viewed through View Completed Evaluations, which has no aggregation feature (Ticket 225729).
    
*   **Duplicate attendance display.** Rare appearance of duplicate conference attendance on Conference Attendance by Resident is a display issue caused by multi-server data reads during high latency. The data is correct on each server. Two task scripts can resolve duplicate display (Ticket 208176):
    
    *   `Remove Duplicate Conference Program Associations`
        
    *   `Remove Duplicate Entries For Conference Attendance`
        
*   **0% attendance percentages for fellowship.** Some institutions have observed missing attendance percentages on fellowship reports vs. residency. The most common cause is a difference in how the conference is configured at the program level — verify that requirements are defined at the fellowship program level.
    
*   **Comments on attendance not in reports.** Notes/comments recorded on attendance sheets are not pulled into the standard attendance reports; this would require a product enhancement.
    

## Public conference schedule

Programs can share their conference schedule publicly without requiring a MedHub login through Program Settings → Conferences → "Public Conference Schedule View." When enabled, a copyable link is provided that displays the program's conference schedule to anyone with the link.

A related setting, "Public Conference RSS Feed," generates an RSS feed for use with third-party RSS readers — though RSS use is rare today.

## Calendar sync

Users can sync their MedHub calendar (which includes their conferences) with Outlook, Google, iPhone, or Android via the "View myCalendar" → "Sync Calendar" link. The sync pulls **1 month backward and 3 months forward**.

There is no way to download a one-time export of the conference calendar with all details (title, speaker, Zoom link, etc.) other than this calendar sync. For external sharing, the Public Conference Schedule View link is the recommended approach (Ticket 200753).

## CME certificates

When CME certificates are generated for a conference, the institution-wide logo must be in use for signatures to display correctly. If a program has chosen a program-specific logo, signatures will not appear on the certificate.

This issue tends to recur annually as program-specific logo settings are modified. The fix is to verify that the source program's CME Certificates setting "CME Certificates (Program Logo) - Use program-specific file" is **unchecked** on the originating program's list settings (Tickets 195833, AMBS-4796, AMBS-8401).

## Conferences Import Wizard

The **Conferences Import Wizard** is the supported way to bring an existing set of conferences from a previous time period into the current academic year. Available under **Home > Task Wizards > Conferences Import Wizard** (`setting_wizardA` index 10).

The wizard works through three filter steps:

**Step 1 — Identify the source.** Choose the academic year or date range to import from, the conference groups to include, and the start date that should be used for the imported conferences.

**Step 2 — Choose what content carries over.** Select which attributes of each conference should be imported:

*   Lecturers/presenters
    
*   Conference locations
    
*   Conference materials
    

Anything not selected here is left blank on the imported conferences and can be filled in later.

**Step 3 — Select the conferences to import.** A list of conferences matching the filters from Step 1 is displayed. Check the ones to import and submit. The wizard creates new conference records for the current year based on the selections.

A few behaviors worth knowing:

*   **Imports do not preserve attendance records.** Only the conference structure carries over. This is by design — attendance is a per-event record.
    
*   **Imports do not preserve sharing.** If the source conferences were shared with other programs, the imports start as not-shared. Sharing must be re-applied via Batch Modify Conferences if needed.
    
*   **Recurring conferences import as discrete records.** If the source year had a series of weekly conferences (each a separate record per "Recurring conferences" above), each individual record imports separately. The wizard does not re-create a recurrence rule.
    
*   **Conference Group references must exist on both sides.** If the source year used a conference group that has since been renamed or removed, the wizard will surface that mismatch — resolve by ensuring the same groups exist before importing.
    

The wizard is most useful at the start of an academic year when the program's conference structure is largely unchanged from the prior year. For programs whose curriculum changes significantly, manual entry is often comparable in effort.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_students`

If 1, enables the program-level "Student Conference Attendance" setting. Required for medical students to appear on conference attendance sheets.

`settings_billing_didactics`

Enables the Conference Locations link on the right side of the Conferences page.

`interface_conferences_flag`

Enables the "Define Conference Locations" link on the left side. Mayo-specific.

`interface_conferences_late_minutes`

Window (minutes) for marking attendance as Late.

`interface_conferences_post_minutes`

Post-conference attendance window.

`interface_conferences_pre_minutes`

Pre-conference attendance window.

`interface_conferences_locations_help`

Help text shown on conference locations.

`setting_conferences_place_list`

Conference place list configuration.

`setting_conferences_upload`

Enables/configures Excel attendance upload.

`setting_conferences_upload_methodA`

Methods array for attendance upload.

`settings_billing_conferences`

Conference billing configuration.

`settings_costcenters_awayconference_costcenterID`

Cost center for away conferences.

`conference_siteID`

Default site ID for conferences.

`global_timezone`

Institution-wide time zone. Affects codeREADr conference attendance window, calendar sync, and report headers only. Does not affect general date display in MedHub.

`setting_wizardA` (index 10)

Per-user-type access to the Conferences Import Wizard.

Program-level settings (configured in Program Settings → Conferences):

*   Faculty Conference Attendance
    
*   Student Conference Attendance (gated by `settings_students` root setting)
    
*   Visiting Trainee Conference Attendance
    
*   Track Outside Evaluator Attendance
    
*   Mark Excused Residents/Faculty
    
*   Identify residents with recorded absences
    
*   Credit for Attending Exempt Conference
    
*   Enable Asynchronous Conference Credit
    
*   Display Conference Times (am/pm or military)
    
*   Conference Presenter Name Display
    
*   Conference change notifications (email)
    
*   Public Conference Schedule View
    
*   Public Conference RSS Feed
    
*   Pre-populate Conference Attendance (Work Hours)
    
*   Upload Attendance (Card Reader) — gates the Excel upload feature
    

## Database tables appendix

Table

Purpose

`ch_lectures`

Primary conference records. One row per individual conference (recurring conferences produce multiple rows).

`ch_lectures_attendance`

Recorded attendance per conference per attendee.

`ch_lectures_attendance_codereadr`

codeREADr-specific attendance tracking.

`ch_lectures_attendance_staging`

Staging table for attendance imports.

`ch_lectures_async`

Asynchronous credit records for conferences.

`ch_lectures_async_files`

Files associated with async credit.

`ch_lectures_curriculum`

Curriculum/competency mappings for conferences.

`ch_lectures_excused`

Excused (E) marker records.

`ch_lectures_exempt_services`

Service-based exemption rules.

`ch_lectures_faculty_requirements`

Faculty-side conference requirements.

`ch_lectures_permissions`

Conference Schedule/Attendance Access grants.

`ch_lectures_posts`

Conference posting/sharing relationships.

`ch_lectures_programs`

Program associations for shared conferences.

`ch_lectures_requirements`

Resident-side conference requirements per group/level.

`ch_lectures_threads`

Discussion thread association.

`ref_conferences_locations`

Conference locations (created by use).

`ref_requests_conference`

Away conference absence requests (note: this is the "away conference" absence type, not the standard conferences module).

`stats_materials_views`

Materials view statistics (counts downloads of uploaded files only, not external links).

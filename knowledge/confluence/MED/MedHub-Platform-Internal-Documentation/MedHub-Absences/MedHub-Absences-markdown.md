# MedHub - Absences - markdown

# MedHub - Absences

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Absences in MedHub are how programs record and approve time away from training — vacation, sick days, away conferences, and leaves of absence. This is a GME-side feature; trainees are the subject of the records, and Program Administrators (with optional middle approvers) own the workflow. The feature touches scheduling, work hours, training history, certificates, IRIS reimbursement, and reporting, which is why an absence problem can show up in many different places.

This document covers absences end-to-end: the absence types and their differences, who initiates and approves them, what happens when a request is approved, the LOA workflow and its impact on training history, the Block Dates feature, and the operational patterns that come up repeatedly in support tickets. It does not cover how absences _display_ on the rotation schedule (covered in **MedHub - Scheduling** §10), how the absence approval workflow alerts route to chiefs and service heads (covered briefly here, with cross-reference to **MedHub - Alert Recipients**), or how IRIS attributes time during LOA (see **MedHub - IRIS**).

UME has no equivalent absence feature. Extended student time away is documented through the student's training history records (a **Lapse in Training** type) rather than through a separate request workflow. See **MedHub - Training History** for that pattern.

## Absence types

MedHub supports four absence types. The types are hardcoded — institutions cannot add, remove, or rename them, though the **LOA reasons** sub-list within Leave of Absence is configurable (see "Configuring LOA reasons" below).

Type

What it is

Approval workflow

Notes

**Vacation**

Trainee paid time off

Optional middle approvers (PD, Chief, Service Head); Administrator finalizes

Has tally tracking per academic year

**Sick day**

Trainee out sick

No approval workflow — recorded only

Affects work hours calculations

**Conference (away)**

Training-related conference attendance

Optional middle approvers (PD, Chief, Service Head); Administrator finalizes

Trainee can still log work hours during conference attendance

**Leave of Absence (LOA)**

Extended absence — paid, unpaid, or training-extending

Hardcoded: Program Administrator → GME Office

Most complex — see "Leaves of Absence" below

A few cross-cutting behaviors worth knowing up front:

*   **Sick days do not follow the absence approval workflow.** They go straight to recorded; there is no pending state. This is by design.
    
*   **Absence type customization is not supported.** Clients cannot rename, add, or remove the four core types. They _can_ configure the LOA reasons sub-list (the dropdown of LOA reasons within the Leave of Absence type).
    
*   **Days recorded tally is hard-coded by academic year (7/1 – 6/30).** The "days recorded" total displayed when submitting a request is calculated by academic year boundaries, even for off-cycle trainees. This was confirmed in AMBS-9764 (Ticket — confirmed 8/29/2024).
    
*   **The history of an absence type is by academic year, not by program.** If a trainee switches programs mid-year, their tally for that academic year is preserved.
    

## Who initiates and who approves

There are two methods for an absence to be initiated:

1.  **Trainee-initiated.** Trainee submits a request from their MedHub home page. An email alert and urgent task go to the Administrator (and any middle approvers configured in the workflow). The default for trainee-initiated absence functionality is **on**, configured per-program under Program Settings → Schedules.
    
2.  **Administrator-initiated.** A Program Administrator (or back-up administrators — see below) records the absence directly. No request/approval cycle.
    

Once an absence is approved (or recorded by an admin), three things happen automatically:

*   The activity is reflected on the master rotation schedule.
    
*   The activity is reflected on the trainee's work hours timesheet (and trainees are blocked from logging work hours for absence periods, with the exception of "Conference (away)" — see below).
    
*   The activity is reflected on the trainee's personal calendar.
    

### Who can approve as the Administrator

Three administrator-tier user types can approve absence requests:

*   **Primary Program Administrator**
    
*   **Backup Primary Administrator**
    
*   **Backup Secondary Administrator**
    

All three have the same approval authority.

### The approval workflow — middle approvers

Programs can optionally route vacation and away-conference requests through middle approvers before the Administrator finalizes. **Sick days and LOAs do not flow through middle approvers** — sick days have no approval workflow; LOAs are hardcoded to Program Administrator → GME Office.

Configured under Resident Absences → Absence Approval Process tab. Available middle approvers:

*   **Program Director** (or any Faculty member)
    
*   **Chief Resident**
    
*   **Service Head**
    

Programs can specify the order (first approver, second approver) and which absence types each step applies to. Middle approvers receive both an email alert and an urgent task when a request is pending their action.

A few specific behaviors:

*   **If the Administrator is the only approver in the workflow, no email is generated** — only an urgent task. This is intentional to reduce email fatigue. The only Administrator-bound email notification is when a Chief Resident _rejects_ a vacation request. (AMBS-9970, manual section 12.1.)
    
    *   This can be overridden per program with a SQL data ticket setting `setting_notify_request_vacation = 1` on the program record.
        
*   **Service Head step on a release.** When a trainee is on release to another program at the time the absence is requested, the Service Head step in the home program's workflow is **skipped** — only the Administrator receives the request.
    
*   **Service Head step with multiple service heads.** When multiple service heads are configured, all of them receive the request. The first to approve or deny removes the request from the others' queues. There is no way to route specific requests to specific service heads. (
    
*   **Service Head step when the PD is also a service head.** If the program director is also configured as a service head, and the PD approves the request via their PD role, _no other service heads will see the urgent task_. The PD's approval satisfies the service-head step. (AMBS-3869, ticket 120016.)
    
*   **Service Head step with overlapping service assignments.** If a trainee is scheduled to two services simultaneously, the request goes only to the service head of the _primary_ service. The other service's head receives nothing. If the request spans multiple non-overlapping services, only the _first_ service's head receives it.
    
*   **Released trainees: home program processes the request.** When a trainee on release submits an absence request, the _home_ program receives and processes it — not the released-to program.
    

### Configuring chiefs as middle approvers

For chiefs to approve absences as part of the workflow, they must be designated in **three** places (Ticket 149887):

1.  **Absence Approval Process** must include "Chief Resident."
    
2.  **Program Settings → General tab**, the chiefs need to be added for the relevant academic year.
    
3.  **In the chief's training history record**, they need to be checked as chief.
    

The designated chiefs for a given academic year approve requests _for_ that academic year — regardless of when the request is made. So if it's currently April 2024 and a trainee submits a request for September 2024, the 2024–2025 academic year's chiefs receive the alert (assuming all three configurations are correct).

### Notes during approval/rejection

When middle approvers (PD, chief, service head) add notes when approving or rejecting, those notes appear on the **Pending Absence Requests** page (Admin view) and the **View/Record Absences** page (Resident view). They are _not_ sent through email and not included in any reports.

When an Administrator rejects a request, two text fields are offered:

*   **Purpose** — appears in absence reports and on the request itself
    
*   **Response** — appears in the rejection email to the trainee, but does _not_ appear in any reports or in the Audit Trail Query
    

(Ticket 256417, AMBS-17094.)

The character limit for the chief's note when approving/denying is **50 characters** (Ticket 237673).

## Vacation

The simplest of the absence types with a workflow.

When recording a vacation:

*   Date range is required.
    
*   Optional comments.
    
*   The system will alert the Administrator if approving the request creates a hole in the shift/call schedule that may need to be filled by another trainee.
    
*   If continuity clinics are assigned for the trainee during the vacation period, the Administrator is prompted to optionally delete those clinic assignments when the absence is approved.
    

A few behaviors specific to vacation:

*   **A trainee on vacation should still be scheduled to a service.** Best practice — vacation gets recorded _on top of_ the service assignment. The service is what attributes the time for billing/IRIS purposes. Without the service assignment, vacation time gets attributed to the program's default site (or the institution's default site).
    
*   **Do not create a service literally named "Vacation."** Some programs have done this and scheduled trainees to it during vacation periods. CMS may view this as gaming, since vacation should be attributed to the rotation the trainee was actually on. (Same guidance applies in the Scheduling doc §10.4.)
    
*   **Vacation tally is per academic year, hard-coded 7/1 – 6/30.** Off-cycle trainees see their vacation count by academic year boundaries, not by training history record.
    

## Sick day

Sick days are recorded but do not flow through any approval workflow. They appear immediately on the schedule and timesheet.

A few specific behaviors:

*   **Sick days affect work hours calculations.** A sick day is _not_ equivalent to a "day off" for ACGME work hours compliance — the system distinguishes between them. (See **MedHub - Work Hours** for how this affects 1-day-off-in-7 calculations.)
    
*   **Sick day cannot be scheduled over an existing shift assignment without removing the shift first.** When trying to record a sick day that overlaps a shift, MedHub will not allow the sick day to be saved without either removing the trainee from the shift or assigning someone else to cover. Clinic assignments behave differently — sick day over a clinic gives the option to override the warning without removing the clinic. This pattern has held for several years (Ticket 248396, AMBS-13440, confirmed 3/25/2025).
    

## Conference (away)

Away conferences are training-related conference attendance off-site. The form behaves similarly to vacation but adds two fields:

*   **Conference name**
    
*   **Location**
    

Both fields can be customized per program through **Site Navigation → Program Management → Away Conference Fields** on the root side. Programs can add custom fields specific to their workflow.

A few behaviors specific to away conferences:

*   **The trainee can still log work hours during a recorded away conference.** Unlike vacation and LOA, the timesheet is not blocked. Trainees are expected to log hours for the conference attendance time.
    
*   **Custom field naming rules are strict.** Field titles can have spaces; **field names cannot**. Field names must start with a letter, can only contain alphanumeric characters and underscores, and are case-sensitive (Ticket 187835, 239824, AMBS-7939, AMBS-11610). If a custom field's data isn't saving, this is the most common cause.
    
*   **Duplicate Conference and Location fields** can appear on the form when away conference fields have been mis-configured or accidentally duplicated. Fix is on the root side: Program Management → Away Conference Fields → inactivate one of each duplicate (Ticket 225033, 232153).
    

## Leaves of Absence

LOAs are the most complex absence type and the source of the most support tickets. They have their own approval workflow, their own configuration surface (LOA reasons), specific interaction with training history, and more behavioral edge cases than the other types combined.

### LOA approval workflow

LOAs are hardcoded to flow Program Administrator → GME Office. This cannot be reconfigured.

*   **Trainee-submitted LOA**: trainee → Program Administrator → GME Office.
    
*   **Administrator-submitted LOA**: Program Administrator → GME Office (skips trainee step).
    

The justification for hardcoding the GME step is that LOAs typically involve internal processes and paperwork outside MedHub. The Program Administrator usually enters the LOA into MedHub once they've initiated or finished that internal process.

> **GME approval flow nuance.** When a Program Administrator approves an LOA, the LOA flows to the training history record and the schedule _immediately_ — before GME's final approval. GME then has final approval/rejection power. If GME rejects, the LOA is removed from training history and the schedule. If GME approves, it remains in place and the GME urgent task is cleared.

### LOA form fields

*   **Reason** (configurable per institution — see below)
    
*   **Date range** (full LOA period — required)
    
*   **Unpaid period** (optional — must fall within the LOA period; skipped if the LOA is fully paid)
    
*   **Training extension days** (optional — number of days to extend training)
    
*   **Notes** (optional)
    
*   **File upload** (optional — uploaded LOA documentation appears with an attachment icon in Resident Demographics)
    

### Configuring LOA reasons

LOA reasons are the dropdown values shown in the Reason field. They are configured via the root setting `loa_typeA`, an indexed array of LOA reason values.

A few rules for managing the array:

*   **The row with index value 0 must remain blank.** MedHub skips that row and only targets values of 1 or greater. If a value is added at index 0, it won't appear in the dropdown. (Ticket 136478.)
    
*   **Existing LOA reasons should never be deleted.** Even if a row is removed from the array, the underlying data remains tied to that row's ID. Deleting causes data integrity issues. The supported way to remove a reason from active use is to **inactivate** it. (Ticket 254054, documented 7/24/2025.)
    
*   **Inactivated LOA reasons still appear in reports.** The Resident Absence Details report still lists them historically — only the dropdown for new entries is affected.
    
*   **LOA reasons can be added** to new (never-used) rows at the end of the list.
    
*   **LOA reasons cannot be reordered.** The display order is the array order, and once values are assigned, they cannot be rearranged. Renaming an existing reason is possible but has the side effect of re-labeling all historical records that used it.
    

### Training history extension via LOA

This is the single most consequential interaction in the absence system. When the Extend Training History checkbox is checked along with a number of extension days, MedHub:

*   Automatically creates a new training history record for the LOA period.
    
*   Moves the trainee off-cycle.
    
*   Pushes the original training history end date back by the extension length.
    

For details on what this looks like in the training history record itself (the new record, certificate gap behavior, the manual nature of post-modification adjustments), see **MedHub - Training History** §LOA mechanics.

Two behaviors worth calling out from the absence side:

*   **If the LOA dates are later modified, the training history extension does not automatically recalculate.** GME has to update the extension manually.
    
*   **If an LOA request is deleted, the training history end date is not automatically reversed.** GME must manually modify the training history end date.
    

### Modifying an approved LOA after the fact

A common scenario: a trainee returns from maternity leave early and the approved LOA still displays on each day of their timesheet, blocking work hours entry.

The fix (Ticket 183059, confirmed 9/10/2021):

1.  From GME homepage center column, choose **Absence Requests**.
    
2.  Select the program (top right).
    
3.  Select **Leave of Absence** and the resident.
    
4.  Click the dates of the LOA under **LOA Request History** to open the previously approved LOA.
    
5.  Update the **From** and **To** date fields. Ensure Status remains **Approved**. Click **Send Request**.
    
6.  On the LOA Request screen, click **Process Request**.
    
7.  Scroll to bottom and **Approve**.
    

Note: when LOAs are adjusted or re-added, the system doesn't always immediately reflect changes on timesheets, the rotation schedule, etc. There's an overnight script that fixes these discrepancies. Tier 2 can manually run the script if the trainee needs to log hours immediately.

### Approval checkbox absence for LOAs

Unlike other absence types, LOAs do not display an **Approve Selected Requests** batch checkbox on the approval page. Each LOA must be opened and processed individually. This is **as designed** — the code includes an explicit condition that hides the batch checkbox for LOAs only, to prevent erroneous batch modification of training history periods. The code hasn't changed since 2014. (Ticket 191168, AMBS-8222.)

### LOA paperwork text on the request form

When a trainee submits an LOA, the Administrator's view of the request displays the red-text message:

> _Please submit required LOA paperwork to the GME or other office as appropriate._

**This text is hardcoded.** It cannot be changed institution-side or per-program. (Ticket 170267, confirmed 3/8/21.) Programs that need different verbiage can add their own internal documentation/notification process; the form's red text remains.

### LOA and trainee access

When a trainee is on an LOA, they appear as **Inactive**, which in turn means their MedHub access is automatically removed overnight. When their LOA ends and their next training history period begins, access is restored.

This is **as designed**. LOA indicates the trainee is not participating in training; they are also removed from needing to be scheduled. If the institution wants the trainee to retain access during the LOA, they should reconsider whether LOA is the right status — manual access grants persist only one day before being removed in the overnight cycle. (Ticket 210739, AMBS-9159.)

### LOA + vacation/sick assignment overlap

It is possible — with configuration — to have an LOA overlap with a recorded vacation or sick day, with the time counted as both. The configuration:

1.  Enable root setting `loa_vacation_assign`.
    
2.  Add a 3rd column to the array in `loa_typeA`.
    
3.  Add `'1'` to LOA types eligible for assigning sick time and vacation time.
    

Once configured, the LOA request form will show **Assign Vacation Days** and **Assign Sick Days** fields visible to GME at approval time. Counts appear on the Resident Absence Summary report.

**This does not flow to the "# days off so far this year" count** displayed when submitting other absence requests. (AMBS-10490, ticket 232172, confirmed 8/29/2024.)

## Block Dates

The Block Dates feature lets programs prevent trainee-initiated absence requests from overlapping specific date periods — for instance, blocking vacation requests during board exam week or during a critical rotation.

### Enabling and configuring

1.  Enable the program setting **Block Dates for Vacations/Away Conferences** (Program Settings → Schedules tab).
    
2.  Define the blocked date periods on the **Block Dates** tab within Resident Absences.
    

Each blocked period can specify:

*   Date range
    
*   Absence types blocked (vacation, away conference, or both)
    
*   Applicable PGY levels
    
*   Applicable services
    

### What block dates actually do

When a trainee tries to submit a request that overlaps a blocked period, they see a message like:

> _Note, the following dates have been blocked from trainee-initiated absence requests. Please contact your program coordinator if an absence is needed for an overlapping date period._
> 
> _(list of blocked dates)_

**Block dates only block trainee-initiated requests.** Program Administrators can still record vacations and away conferences for trainees on blocked dates without restriction. The setting is for trainee self-service, not for absolute blocking.

## Access control: `setting_resident_absences`

The root setting `setting_resident_absences` governs trainee access to the request-absence functionality across the entire institution. Five values:

Value

Behavior

`0`

**Off** — no request-absence option at all. Trainees cannot submit any absence type.

`1`

**Program choice (all types)** — every absence type is available to trainees, but only in programs that opt in via the program-level setting.

`2`

**On (institutionally, all types)** — every absence type is available to trainees in every program. Cannot be disabled per-program.

`3`

**Program choice (vacation & away conference only)** — only vacation and away conference are available, and only in programs that opt in. Sick days and LOAs are not trainee-initiable in any program.

`4`

**On (vacation & away conference only)** — vacation and away conference are available to trainees in every program. Sick days and LOAs are not trainee-initiable.

The setting is institution-wide. There is no way to mix — for example, allowing one program to permit LOAs while another doesn't. The granularity is binary at the institution level, with optional program-level opt-in only at values 1 and 3.

A related setting `absences_approveFlag` controls whether the GME urgent task appears for trainee LOAs. If the urgent task is not appearing for LOAs, confirm `absences_approveFlag = 1`

## Editing absences in locked periods

Absence requests follow the same lockout rules as other scheduling activities. Program Administrators are locked out on the 15th of each month for the prior month's data; GME has unlock authority. (See **MedHub - Scheduling** §12 for full lockout mechanics.)

A specific edge case: **partial-block lockout interaction with absence requests.** When an absence request spans dates that are partially locked and partially unlocked (e.g., a request for 8/30 – 9/1 attempted on 10/14, when the lockout has just rolled past 9/30), both Program Administrators and GME hit different errors:

*   The Administrator gets an error for the locked portion.
    
*   GME gets an error for the unlocked portion (because GME can only edit _locked_ dates, not unlocked ones).
    

The fix is for GME to use **Unlock Rotations** to unlock all the affected days, then for the Administrator to complete the request. Alternatively, wait until the lockout has rolled past all the dates (then GME can complete it) or all dates are still unlocked (then the Administrator can complete it).

(Ticket 152743, confirmed ES/BG 10/16/2020.)

> **GME's special access window after departure.** GME has the ability to approve or log absence requests for trainees who have left the program for **at most 30 days**. After that window, requests cannot be processed.

## Work hours interaction

Brief reference; full mechanics in **MedHub - Work Hours**.

*   **Auto-submit on full-week absence.** If an absence is approved before the timesheet generates and covers the entire 7-day timesheet period, MedHub automatically submits the timesheet on Saturday at 11:59 PM. The trainee won't receive a Late Work Hours Reminder.
    
*   `setting_dh_log_on_absence` allows trainees to log moonlighting and work-from-home hours during an absence. Even with this setting on, the auto-submit behavior on full-week absence still applies — the trainee just has the option to resubmit afterward with moonlighting/WFH recorded.
    
*   **LOA and timesheets:**
    
    *   LOA covering an entire work hour period inactivates the timesheet.
        
    *   LOA covering only part of a work hour period leaves the timesheet active, and the system still calculates compliance checks for that period (even if some are irrelevant).
        
*   **Sick day vs. day off** — a sick day is not equivalent to a day off for ACGME purposes. Affects 1-day-off-in-7 calculations.
    
*   **Conference (away)** — work hours can be logged on conference days. The timesheet is not auto-submitted.
    

## Reporting

The most relevant absence-related reports:

*   **Resident Absence Summary** — counts by trainee per academic year, by absence type. Includes vacation/sick assignment values from `loa_vacation_assign` configuration if enabled.
    
*   **Resident Absence Details** — line-item view of absences. Historical inactivated LOA types still appear here.
    
*   **Audit Trail Query → Absence Request (any option)** — shows the _date the request was submitted_ (not the absence date itself). Use this to find when a request was created vs. when the absence period was.
    

A few specific report behaviors:

*   **Notes on chief approval are not in reports.** Notes added by chiefs/PDs/service heads when approving or rejecting only appear in the UI, not in any export.
    
*   **Rejection responses are not emailed and not in reports.** When an Administrator rejects with the **Response** field populated, only the email to the trainee includes it. The Purpose field shows in reports; the Response field does not.
    

## Fix Absences script and related cleanup scripts

Absences can occasionally drift out of sync between the request record, the rotation schedule, the timesheet, and the personal calendar. Several support-side scripts exist to repair these states.

### Fix Absences script

Re-syncs approved absences across the rotation schedule, timesheet, and calendar. Has no date limitations — it processes all current trainees (active, incoming, and graduates within a year).

### For new clients — run two prerequisites first

If Fix Absences isn't producing the expected effect for a new client, run these first:

1.  **Insert needed timesheets**
    
2.  **Remove duplicate timesheets**
    

Then run **Fix Absences**. Approved absences should then display correctly on the schedule.

### Approved absence not showing on schedule + days recorded = 0

If an approved absence is showing days recorded = 0 and isn't appearing on the schedule, **check that the trainee's IRIS code is entered in their training history.** Without an IRIS code, the absence won't propagate.

### Approving an absence triggers "Potential Scheduling Conflicts" but no obvious conflict

Two scripts can resolve this:

*   **Remove lost shifts** (root-side task script)
    
*   Manually go to the shift/call schedule for the conflicting date and remove the trainee from the schedule, complete the absence approval, then re-add them to the shift afterward.
    

### Permission error for Coordinator on absence over Amion-imported shift

When a coordinator records a vacation that overlaps an Amion-imported shift, they receive: _"you do not have permission to schedule shifts in the program."_ Cause: shifts imported via Amion can't be modified directly in MedHub.

Fix: delete the shifts in Amion first, then use the Amion task wizard's force-pull to bring the change in immediately. (The setting `setting_amion_backdays` may need to be temporarily extended if the shift falls outside the standard import window — see **MedHub - Scheduling** §12.4.)

## Common scenarios

### A program admin can't approve an absence in a partially-locked block

The block spans the lockout boundary. The fix is for GME to unlock all the affected days via Unlock Rotations, then the Administrator processes the absence.

### A chief can't approve absences for the upcoming academic year

Three configurations need to be in place: (1) Absence Approval Process includes "Chief Resident"; (2) the chief is added to the relevant academic year in Program Settings → General; (3) the chief is checked as chief in their training history record.

### Service head not getting the absence request

Walk through (a) is the program director also a service head and approving as PD?; (b) is the trainee on release?; (c) does the trainee have multiple overlapping service assignments and the service head isn't on the primary?

### LOA is approved but timesheets still blocked after trainee returns early

Modify the LOA dates from the GME absence requests page, send the request, process and re-approve. There's an overnight script that fixes residual timesheet display issues — Tier 2 can run it manually.

### Trainee is on LOA but their account keeps re-deactivating overnight

This is by design. Trainees on LOA are inactive and lose access overnight. Manual access grants only persist one day. If they need to log in during the LOA, the institution should reconsider whether LOA is the right status.

### Custom away conference fields don't save data

The field name probably has spaces or special characters. Field names must start with a letter, contain only alphanumerics and underscores, and have no spaces. (Field titles can have spaces and special characters — only field names are restricted.)

### Duplicate Conference/Location fields on away conference form

A duplicate root-side field has been created. Fix on the root side under Program Management → Away Conference Fields → inactivate one of each duplicate.

### Need to delete an absence request that's locked

Locked absence requests can't be deleted by an admin — GME can delete via the Audit Trail. If the locked request was for a trainee who wasn't yet active (e.g., they hadn't started yet), this is the path. (Ticket 128037 pattern.)

### Half-day absence

Not supported. There is no feature for half-day absences — this is a known enhancement request.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_resident_absences`

Master toggle for trainee absence-request access. 0=off, 1=program choice (all types), 2=on institutionally (all types), 3=program choice (vac+conf only), 4=on institutionally (vac+conf only).

`absences_approveFlag`

Controls whether the GME urgent task appears for trainee LOAs. 1=task appears.

`loa_typeA`

Array of LOA reasons available in the LOA dropdown. Index 0 must be blank. Modifications should be add or inactivate only — never delete.

`loa_vacation_assign`

When enabled with a 3rd column added to `loa_typeA` rows (value 1), permits an LOA to also assign vacation/sick days.

`setting_dh_log_on_absence`

Allows trainees to log moonlighting and work-from-home hours during an approved absence.

`settings_iris_loa_overlap`

LOA time attribution when not extending training: 0 = default site, 1 = overlapping service. (See Scheduling §10.)

`setting_notify_request_vacation` (per-program, on `i_programs`)

Override for the "no email when admin is sole approver" behavior. SQL data ticket only — not surfaced in standard config.

`setting_amion_backdays`

When Amion is involved, controls how far back the sync may pull/push. Affects shift-removal flow during absence approval. (See Scheduling §12.)

Block Dates is a program-level setting (Program Settings → Schedules → "Block Dates for Vacations/Away Conferences"), not a root setting.

## Database tables appendix

Table

Purpose

`users_residents_loa`

LOA records — request, approval status, dates, reason, extension days, paid/unpaid period, attached file references.

`users_residents_vacations`

Vacation records — dates, comments, approval status.

`users_residents_sick`

Sick day records.

`users_residents_conferences`

Away conference records — including conference name, location, custom field data.

`i_programs_workflow`

Per-program absence approval workflow configuration (middle approvers and order).

`i_programs_block_dates`

Block Dates configuration per program.

`audit_request_*`

Audit records for request submission, approval, rejection. Surfaced in Audit Trail Query.

LOA-extended training history records live in `users_residents_pg` (the same table as standard training history). See **MedHub - Training History** for that schema.

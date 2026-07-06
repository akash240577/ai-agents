# MedHub - Resident Dashboards - markdown

# MedHub - Resident Dashboards

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The **Resident Dashboard** is a configurable, per-trainee summary report that pulls data from across MedHub — rotations, evaluations, milestones, work hours, portfolio entries, absences, conferences, test scores, procedures, and login activity — into a single PDF. The dashboard is the canonical artifact a Clinical Competency Committee (CCC) reviews when evaluating a trainee for promotion, and it's the primary semi-annual review document many programs use with their residents and fellows.

Dashboards are GME-only. They are configured per-program — each program builds its own dashboard template (which channels to include, what date range each channel covers, when to auto-generate, who can view, who to email) and runs it against its trainees. A single program can have multiple dashboard templates for different purposes (CCC review, advisor meetings, semi-annual reviews, year-end summaries).

This document covers Resident Dashboards as a feature: dashboard setup via the Modify Resident Dashboard page, the channel catalog with what each channel produces, channel date-range scoping, the recurring annual schedule via Report Date(s), the immediate-generate vs. cron-deliver distinction, the two background processes that drive auto-generation and email delivery, the distinction between Dashboard Access and Email Recipients, access paths for trainees and faculty mentors, the Progress Report linkage, archival and cleanup, and the operational patterns that come up in support tickets.

It does not cover: the underlying evaluation data model that drives Aggregate Evaluation Comments and Evaluation Completion Summary (see **MedHub - Evaluations — GME**); the milestones tracking model (see **MedHub - Evaluations — GME** §"Milestones" when drafted); work hours calculations (see **MedHub - Work Hours**); or the Progress Report itself (see **MedHub - Evaluations — GME** §"Progress Report").

## Where it lives

For Program Administrators, Resident Dashboards are accessed from:

> **Home → Resident Dashboards** (or via the Evaluations or Reports menu, depending on client navigation configuration)

The page has two primary subtabs:

*   **Dashboard Setup** — manage dashboard templates, channels, date ranges, access lists, recipients, and trigger Generate manually.
    
*   **View Dashboards** — see all generated dashboards by trainee, with Regenerate, Archive, and View options.
    

For **GME Office**, dashboards are visible across all programs from the same surface, with program filtering.

For **Faculty Mentors** with Mentor access enabled (see "Faculty Mentor access" below), dashboards appear in the trainee's Resident Demographics view under "Resident Dashboards."

For **Trainees**, dashboards appear in **Home → Tasks → Review Records**, in a "Resident Dashboards" section at the bottom of the page, with an eye icon to view.

### Access points that grant dashboard creation

A Coordinator must have **at least one of the following access points** to create and generate dashboards (per BG):

*   Resident Demographics
    
*   Work Hours
    
*   Resident Absences
    
*   Schedules — Definition
    
*   Schedules — Rotations
    
*   Schedules — Shifts/Calls/Clinics
    
*   Procedures
    
*   Conferences
    
*   Evaluations — Viewing
    
*   Evaluations — Forms
    
*   Evaluations — Delivery
    

Without at least one of these, the Resident Dashboards link doesn't appear in the user's portal.

## Modify Resident Dashboard — the configuration page

When an admin opens an existing dashboard for editing (or creates a new one), they land on the **Modify Resident Dashboard** page. This page has two regions: the top-level configuration block, and the Dashboard Channels block below it.

### Top-level configuration

Field

Behavior

**Dashboard Title**

Required. Appears in the PDF header and in the View Dashboards list.

**Introduction**

Free text. Appears at the top of the generated PDF before any channel content. Optional.

**Status**

Active or Inactive. Inactive dashboards stop auto-generating but existing PDFs remain accessible.

**Report Date(s)**

Required. A list of dates in **M/D format** (e.g., `1/1, 4/1, 7/1, 10/1`). These are the **recurring annual schedule** — the dashboard auto-generates and emails on each of these dates every year. The program enters month/day only and never has to update them year over year.

**Levels**

The PGY levels included. Click `[ UPDATE LEVELS ]` to modify. Defaults to "(all levels)."

**Dashboard Access**

The list of user types who can **view the dashboard through the UI at any time** (e.g., Resident, Program Director, Associate Directors, Faculty Mentors, Program Administrators). Click `[ UPDATE ACCESS ]` to modify. **Distinct from Email Recipients** — see "Dashboard Access vs. Email Recipients" below.

**Email Recipients**

The list of recipients who get the dashboard PDF **delivered via email** when it auto-generates on a Report Date. Click `[ UPDATE RECIPIENTS ]` to modify. May be set to "(none)" — in that case, dashboards still generate on schedule but no emails go out, and viewers must access through the UI.

**Link from Progress Report**

Checkbox. When checked, generated dashboards become accessible from the Progress Report for the matching time period. (Ticket 211071, LS 12/15/2022.)

The **Update Dashboard** button saves changes to the top-level config.

### Dashboard Channels block

Below the top-level config is the channel list, displayed as a table with columns:

*   **Order** — drag handle. Channels appear in the PDF in the order shown here; drag to reorder.
    
*   **Channel** — the channel name (e.g., "Aggregate Evaluation Comments," "Procedures Logged").
    
*   **Options** — the channel-specific configuration summary. For most channels this includes the date range (e.g., "Date Range: Entire training in program") and any channel-specific filters (e.g., "Portfolio Entry Types: All Types").
    
*   **Status** — Active or Inactive. Inactive channels stay configured but don't appear in generated PDFs.
    
*   **Actions** — **Options** button (opens the channel's full configuration), **Delete** button.
    

To add channels, click **Add Dashboard Channel(s)** below the channel list. The channel picker opens (see "Adding channels" below).

### Dashboard Access vs. Email Recipients

These are two independent lists controlling two different things:

*   **Dashboard Access** = "who can pull this dashboard up in the UI any time after it's generated." This is a permission list — anyone on it sees the latest generated dashboard for trainees they have visibility into. Includes user types like Resident, Program Director, Associate Directors, Faculty Mentors, Program Administrators.
    
*   **Email Recipients** = "who gets the dashboard delivered to their inbox when it auto-generates on a Report Date." This is a delivery list. May overlap with Dashboard Access, but doesn't have to.
    

Both lists are independently configured. A program can have a dashboard accessible to many roles in the UI but only emailed to the PD; or one that's emailed to many recipients but only viewable through the UI by Program Administrators.

When a user with Dashboard Access opens the dashboard through the UI, they see the **most recent** generated copy — whether that came from a scheduled Report Date run or from a manual Generate.

## The two background processes

Resident Dashboards are produced by **two separate cron jobs** that run sequentially each night:

Cron

Runs at

What it does

**Generate Resident Dashboards**

Daily 3:35 a.m. ET

Builds the PDF for every dashboard whose Report Date(s) include today. Writes the PDF to the trainee's record and to the View Dashboards list. **No emails are sent at this stage.**

**Deliver Resident Dashboard Email** (also called "Portfolio Dashboard - Notify")

Daily 4:45 a.m. ET

Iterates the dashboards generated overnight and sends the email notification (with PDF attached) to the configured Email Recipients.

The 70-minute gap between Generate and Deliver is intentional — it gives the Generate cron time to fully complete writing PDFs before the Delivery cron starts assembling and sending emails.

> **What the order means in practice.** A dashboard scheduled to generate today is built between 3:35–4:30 a.m. and emailed between 4:45–5:30 a.m. (timing varies by institution size and queue). Recipients see the email mid-morning at the latest.

> **If the Generate cron fails, the Delivery cron can't deliver.** When a client reports "the dashboard didn't generate at all," check whether the Generate cron ran successfully. When the client reports "the dashboard generated but no email arrived," the Delivery cron is the suspect.

## Manual generation — Generate vs. Regenerate

The Dashboard Setup page exposes two manual triggers for dashboards. They behave differently:

### Generate (new dashboard)

The **Generate button** on the Dashboard Setup tab creates a brand-new dashboard PDF for each selected trainee, **using the current date as the report date**. The data pulled into each channel reflects the channel's date range relative to today.

*   **Use when**: an admin wants a fresh dashboard for an off-cycle review (mid-block check-in, mentor meeting, urgent trainee discussion).
    
*   **Email behavior**: emails are sent if the dashboard is configured for email delivery. The PDF is attached. (BG confirmation.)
    
*   **Result**: a new dashboard appears on the View Dashboards tab, dated today.
    

### Regenerate (existing dashboard)

The **Regenerate button** next to a previously-generated dashboard on the View Dashboards tab **rebuilds an existing dashboard**, refreshing its data based on the **original Report Date** (not today).

*   **Use when**: data was missing or wrong when the dashboard was first generated, and the underlying records have since been corrected.
    
*   **Email behavior**: **emails are NOT resent.** Emails only go out on the initial generation. (Ticket 176971, ES 6/17/2021. Confirmed TM.)
    
*   **Result**: the existing dashboard's PDF is updated in place, retaining its original Report Date.
    

> **You can't run a brand-new dashboard "for last March."** Dashboards always look at the date they generate and pull data based on each channel's date setting, calculated relative to that generate date. To get a dashboard reflecting an earlier period, use Regenerate on a dashboard that was originally generated on or near that period — the Report Date is the anchor for the data window. (Ticket 176971.)

### Two definitions worth pinning down

*   **Report date** = the **effective date** of the dashboard. The data shown is what was available as of the Report Date. (TM confirmation.)
    
*   **Regenerate date** = the date the dashboard was rebuilt. Distinct from Report Date — Regenerate doesn't change the Report Date. (BG confirmation.)
    

This is why the PDF header reads `Effective 5/4/2026` (the Report Date) but the footer reads `Generated 5/4/2026` — the footer reflects when the file was actually built, the header reflects what date the data is anchored to.

## Adding channels

The **Add Dashboard Channel(s)** button below the Dashboard Channels list opens a multi-select channel picker. The picker is organized into **categories**, with channels grouped by data domain. The full picker contents:

*   **Conferences**
    
    *   Conference Requirements Summary
        
    *   Conferences Presented
        
*   **Demographics**
    
    *   Test Scores
        
*   **Evaluations**
    
    *   Aggregate Evaluation Comments
        
    *   Evaluation Completion Summary
        
    *   Milestones Summary
        
*   **General/Other**
    
    *   Login Statistics
        
*   **Portfolios**
    
    *   Portfolio Entries
        
*   **Procedures**
    
    *   Procedure Requirements Summary
        
    *   Procedures Logged
        
*   **Schedules**
    
    *   Absence Summary
        
    *   Rotations/Clinics Completed
        
*   **Work Hours**
    
    *   Work Hour Submissions
        

> **Channels already used in this dashboard are disabled in the picker.** Each channel can be added to a given dashboard template **only once**. If a program needs the same channel with two different date ranges or filter configurations, they must build a second dashboard template — there's no way to include, e.g., two Aggregate Evaluation Comments sections in one PDF.
> 
> Programs can build as many dashboard templates as they need. There's no system limit. (Confirmed TM.)

## Channel catalog

The complete catalog, grouped by the categories shown in the picker. Each channel section describes what the channel produces, its date-range scope, and any structural notes worth knowing.

### Conferences → Conference Requirements Summary

**Produces**: a per-PGY-level summary of the trainee's progress against the program's conference attendance requirements. Columns:

*   **PGY Levels** — the PGY level the requirement applies to (e.g., 1, 2, 3). A trainee at PGY-3 will see rows for PGY-1, PGY-2, and PGY-3 each, showing their performance at each prior level.
    
*   **Requirement Name/Groups** — the requirement label (e.g., "PGY1 50 Conferences," "Intern IMPACT 80% Conference Attendance (PGY 1)") followed by the underlying **conference groups** that count toward it (e.g., "Academic Half Day, ACLS Sessions, Clinical Case Conference, Grand Rounds, Journal Club…").
    
*   **Required** — the threshold (e.g., `80%`, `50 credits`).
    
*   **Total** — the trainee's actual performance against the threshold (e.g., `92.3% (18/19.5)`, `46 credits (92%)`).
    

**Date range options**: typically tied to the trainee's training history; the channel computes per PGY level.

**Notes**:

*   Parallel structure to the Procedure Requirements Summary — both summarize counts/percentages against program-defined thresholds.
    
*   Conference groups are configured at the program level (see **MedHub - Conferences** §"Conference groups").
    
*   When a trainee has not yet reached a given PGY level, that row doesn't appear.
    

### Conferences → Conferences Presented

**Produces**: a list of conferences the trainee personally presented (as faculty or as a presenter, NOT as an attendee).

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   **Empty section displays "(no conferences presented)"** when the trainee hasn't been a presenter — this is by design and confirms the system checked.
    
*   This channel pulls from the conference faculty/presenter records, NOT attendance records.
    

### Demographics → Test Scores

**Produces**: rows for every test score recorded in the trainee's Demographics → Certifications/Test Scores tab. The format varies by test type:

*   **In-Service Exam** entries display `Percentile: NN Year: YYYY` per attempt (numbered if multiple — e.g., "In-Service Exam (1)," "In-Service Exam (2)").
    
*   **USMLE Step 1** displays `3-Digit: NNN 2-Digit: NA Test Date: M/D/YYYY`.
    
*   **USMLE Step 2** displays `3-Digit (CK): NNN 2-Digit: NA Test Date (CK): M/D/YYYY`.
    
*   Other custom test fields display per the program's configuration.
    

**Date range options**: typically fixed to entire training (test scores don't filter by recent activity).

**Notes**:

*   Includes COMLEX, USMLE, In-Service Exam, ACIO In-Service Exam, and any program-defined custom test fields.
    
*   **Inactive Test Score fields with data still appear.** If a program inactivates a test score field, the field moves to the bottom of the Test Scores tab as "Test Scores recorded by other programs." Any test score with data entered will show on the dashboard regardless. (Ticket 151460, ES.)
    

### Evaluations → Aggregate Evaluation Comments

**Produces**: free-text comments from completed evaluations of the trainee, **grouped by evaluation question**. Each question header appears once, with all responses to that question listed beneath it across every evaluation in the date range.

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   **Confidential Comments are EXCLUDED.** Removed from this channel for all dashboards generated 3/19/2018 onward. (Ticket 96004, AMBS-2456, TM confirmation.)
    
*   **Low Score Alert comments are EXCLUDED.** Because dashboards may be visible to the trainee, low-score alert comments (which often contain remediation language not intended for trainee viewing) are filtered out. (Ticket 151303, SS confirmation.)
    
*   **Procedure evaluation scaled-question comment requirements are EXCLUDED.** Even when "of procedure" eval type is selected for the channel, comment requirements within scaled questions on procedure evaluations don't flow to the dashboard. By design. (Ticket 121260, JS.)
    
*   **All other evaluation types' comments DO flow** — including "Patient/Staff evaluation of resident" and "Resident peer evaluation" forms. Comments are pulled from any completed evaluation in the date range, regardless of the program's "Resident Access to Patient/Staff/Peer Evaluations" or "Resident Access to Aggregate View" thresholds. Those thresholds gate the trainee's own aggregate view inside MedHub — they're not applied to the dashboard PDF. Even one completed eval with comments will appear. (Ticket 215937, ELD/MC 3/28/2023, AMBS-9494.)
    
*   Comments are listed in the order the evaluations were completed.
    

### Evaluations → Evaluation Completion Summary

**Produces**: counts of evaluations the trainee was asked to complete and how many they did complete during the date range. Three lines:

*   **Evaluations Delivered** — total issued to the trainee within the channel date range.
    
*   **Completed Evaluations** — count + percentage (e.g., `55 (39.57%)`).
    
*   **Average Days to Complete** — mean turnaround time across completed evaluations.
    

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   `[VERIFY]` Per Ticket 138458 (JS confirmation), Resident-of-Student evaluation types are included in this summary. This was last confirmed in 2021 — confirming the current behavior would require live testing or dev research, so it's deferred for now.
    
*   **"Evaluations Delivered" vs. "Evaluations Completed" can differ** — and the difference is by design but trips up users:
    
    *   **Delivered** = evaluations issued to the trainee within the channel date range. Includes Expired evaluations and queued-but-not-yet-delivered evaluations within the range.
        
    *   **Completed** = evaluations the trainee completed within the channel date range. May include evaluations issued _outside_ the range (e.g., a trainee finishing in August an evaluation issued in June).
        
    *   Discrepancy causes: cross-academic-year completions, transferred trainees (delivered evals from previous program don't show in new program's dashboard), expired evaluations counted as delivered. (Tickets 141474, 163628, JS/ES confirmation.)
        

### Evaluations → Milestones Summary

**Produces**: a table of milestone subcompetencies with Average score, Range (min-max), and # Questions answered. The PDF lists the subcompetency ID (e.g., PC-1, MK-2, SBP-3), description text (truncated — see below), and the three numeric columns. Above the table is an **Evaluations** count (the number of evaluations contributing to the data — a sample-size indicator).

**Date range options**: typically a 6-month rolling window. Configured per-program.

**Notes**:

*   **Milestone Subcompetencies only — NOT Milestone Elements.** If a program tracks Elements, those are NOT captured in this channel. (BG confirmation.)
    
*   **Header description character limit: 41 characters.** The full subcompetency description gets truncated mid-word — e.g., "Develops and achieves comprehensive managemen" rather than "…comprehensive management." (Ticket 164385, tested by JS 11/17/20.)
    
*   **Subcompetencies displayed in duplicate when v1 and v2 versions both exist** for the institution. The channel does not filter by which version applies during the date range — it shows both. The v1 row typically shows `- -` for Average / Range / # Questions if no current evaluations target it; the v2 row shows the actual data (or vice versa). This is a **standing structural gap** in the channel — not a bug being actively fixed. The only workaround today is a per-evaluation data team request to remove outdated v1 evaluation IDs from a program. (Ticket 153419, CB 10/29/2020.)
    
*   **Empty-data rows show "- -"** in all three columns when no evaluation captured that subcompetency.
    

### General/Other → Login Statistics

**Produces**: a summary of the trainee's MedHub login activity over the date range. Three lines:

*   **Last Login** — date and time of the most recent login (e.g., `11/23/2025 9:49am`).
    
*   **Total Logins** — count of logins within the date range.
    
*   **Logins per Week** — average login frequency.
    

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   Useful for CCC review when a trainee's documentation engagement is in question (e.g., they're behind on evaluations and the program wants to see whether they're logging in at all).
    
*   Counts only count logins to the full website (and SSO-mediated logins). Mobile app launches are NOT counted as sessions — see **MedHub - Mobile App** §"Session timeout."
    

### Portfolios → Portfolio Entries

**Produces**: a table of portfolio entries for the trainee. Columns: Date, Entry Type, Title, # Files, # Links, # Notes.

**Options** include a **Portfolio Entry Types** filter (defaults to "All Types") that lets the program limit the channel to specific entry types.

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   The channel produces **entry type, title of the entry, and entry date** plus the file/link/note counts (Ticket 121260, JS confirmation).
    
*   Files, Links, and Notes columns are counts only — the actual content is not embedded in the dashboard PDF.
    
*   Common entry types: General Entry, Quality Improvement, Research Project, Committee Involvement, Presentation - National, Publication, Award.
    

### Procedures → Procedure Requirements Summary

**Produces**: a summary of the trainee's progress against the program's procedure certification requirements. Columns:

*   **Procedure / Procedure Group(s)** — the requirement name. Procedures can be defined as **groups** that roll up multiple individual procedure types into one count (e.g., a "PROGRAM REQUIRED procedures" group might roll up "Central Venous Catheter — Internal Jugular," "Central Venous Catheter — Femoral," "Central Venous Catheter — Subclavian" into a single requirement). The group name appears as the row header with member procedures listed beneath.
    
*   **Level(s)** — the PGY range the requirement applies to (e.g., `1-10`, `1-8`, `2-4`).
    
*   **Required** — the threshold, expressed as a count plus a verb describing the action required:
    
    *   `5 Performed` — the trainee must have performed 5 of these procedures.
        
    *   `9 Read & Interpreted` — for read-and-interpret requirements like ECG/imaging quizzes.
        
    *   `1 Total Logged` — minimum count regardless of role.
        
*   **Comp.** — the trainee's completed count.
    
*   **Perc.** — percentage complete (e.g., `100%`, `80%`, `0%`).
    

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   Distinct from **Procedures Logged** — that channel lists individual procedure entries; this channel summarizes counts against requirements.
    
*   Both channels can be enabled together on the same dashboard, and many CCC dashboards include both.
    
*   Group definitions and thresholds come from the program's Procedure Requirements configuration (see **MedHub - Procedures** §"Requirements").
    

### Procedures → Procedures Logged

**Produces**: a row-level list of procedures the trainee logged during the channel's date range. Columns:

*   **Date** — when the procedure was performed.
    
*   **Procedure** — the procedure type (e.g., "Endotracheal intubation," "Central Venous Catheter — Internal Jugular").
    
*   **Role** — the trainee's role (e.g., Performed, Assisted, Observed).
    
*   **Supervisor** — last name of the supervising faculty.
    
*   **Verified** — Yes / No / N/A. Reflects the procedure verification workflow (see **MedHub - Procedures** §"Verification"). `Yes` when verified per the program's verification rules; `No` when pending verification; `N/A` when verification doesn't apply (e.g., the program has verification disabled or the procedure type is not configured to require verification).
    

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   This is a **detail-level listing**, not a summary by procedure type. Each logged procedure is its own row.
    
*   The channel supports a **custom subheader / instructions** field — free text the program enters during dashboard setup. This text appears at the top of the channel section. Common usage is to remind reviewers of certification thresholds (e.g., `Required of Graduation: 5 PAP/Pelvic and 5 CVC`).
    

### Schedules → Absence Summary

**Produces**: a summary of absences taken during the date range, with day counts and date ranges. Categories:

*   **Vacation** — total days plus the actual date ranges (e.g., `77 days (8/12/23-8/18/23, 10/4/23-10/17/23, 4/3/24-4/9/24, …)`).
    
*   **Excluding Weekends/Holidays** — the working-day count, calculated separately from Vacation total days.
    
*   **Sick Days** — total days.
    
*   **Away Conference** — total days.
    
*   **Leave Of Absence** — total days plus date list (e.g., `8 days (11/16/23, 1/5/24, 4/26/24, …)`).
    

**Date range options**: typically the same as the Milestones/Work Hours range.

### Schedules → Rotations/Clinics Completed

**Produces**: a table of every service and continuity clinic the trainee was scheduled to during the channel's date range. Columns: Service/Clinic Name, PGY level, Start Date, End Date, # Days.

**Date range options**: Current academic year, custom range, entire training in program.

**Notes**:

*   Pulls from `sh_tracks_slots` (services) and `sh_clinics` (clinics).
    
*   Both services AND continuity clinics flow to this channel; they're not separated by sub-section.
    
*   **Continuity clinics appear at the bottom of the table** with no Start/End dates (`- -`) and a total `# Days` count rolled up across the whole training period. Services display with their actual rotation date ranges; clinics display as cumulative totals.
    

### Work Hours → Work Hour Submissions

**Produces**: summary statistics for the trainee's work hour timesheets in the date range. Five lines:

*   **Total Timesheets** — count of timesheets in the range.
    
*   **Percent Submitted** — percentage of weeks with a submitted timesheet.
    
*   **Submitted On Time** — count + percentage submitted by the program's deadline.
    
*   **Average Hours** — mean hours per submitted timesheet.
    
*   **Average Days Off** — see calculation note below.
    

**Date range options**: typically matches Milestones Summary (6-month rolling window).

**Notes**:

*   **"Average Days Off" calculation differs from the standard work hours calculation.** The dashboard uses `number of days off ÷ number of timesheets`, not the standard average. (Ticket 140619, SS confirmation.) Important to flag for clients comparing dashboard numbers to other reports.
    
*   **"Ignoring unlocked timesheets"** appears in the date range header — only locked, finalized timesheets are counted.
    

## Dashboard header — trainee photo

The trainee's profile photo appears in the dashboard PDF header — this is a built-in element of every dashboard, not a channel that needs to be added.

*   **Only JPG photos flow to the dashboard.** PNGs and GIFs uploaded to the trainee's demographics profile display fine in the demographic profile view, but they do NOT flow to the Resident Dashboard. The trainee will appear without a photo on the PDF.
    
*   **Diagnostic step**: in Demographics → Resident Summary tab, right-click the photo and Save As — the dialog reveals the actual file format (the "Upload" panel always says "JPG" regardless of the actual file type).
    
*   **Fix**: re-upload the photo as a JPG, then **Regenerate** the dashboard to refresh the photo. (Tickets 164921 and 220059, CD/L 12/3/2020 and ML 2/7/2024, AMBS-9721.)
    
*   **This is a standing gap** — the dashboard renderer only handles JPG. PNG/GIF support has not been added.
    

## Email behavior nuances

*   **One email per dashboard, even when multiple trainees are included.** A dashboard set up to run for 20 residents and email the PD generates 20 PDFs but sends ONE email to the PD with all 20 attached. (Confirmed TM.)
    
*   **The PDF is attached to the email** — recipients don't have to log into MedHub to see it. (BG confirmation.)
    
*   **Emails only fire on initial generation.** Regenerate does not resend the email. (Ticket 176971.) If a regenerated dashboard needs to reach the recipients, the admin must manually share the updated PDF outside MedHub.
    
*   **Only Primary Administrator and Backup Administrator (Primary) receive the email when "Program Administrator" is selected as a recipient type.** Even if 5 program admins exist, only those two roles get the email. Other program admins can still view the dashboard through the UI if they're on the Dashboard Access list. (Ticket 181158, ES/JS 8/10/21.)
    

## Trainee delivery — what's filtered automatically

When a dashboard is configured to email the trainee, MedHub applies these automatic filters before generating the PDF:

*   **Confidential Comments** — removed (3/19/2018 onward, AMBS-2456).
    
*   **Low Score Alert comments** — removed (per SS, since dashboards may go to trainees).
    
*   **Procedure scaled-question comment requirements** — excluded by design.
    

What is **NOT** filtered:

*   Patient/Staff evaluation comments
    
*   Peer evaluation comments
    
*   Faculty evaluation comments
    
*   All milestone scores and ranges
    
*   All procedure logs
    
*   All work hours data
    
*   Login statistics
    

> **The "Resident Access to Patient/Staff/Peer Evaluations" threshold (e.g., "Hide until 3 completed") gates the trainee's own aggregate view inside MedHub — it does NOT gate the dashboard PDF.** Any completed evaluation in the channel's date range flows to the dashboard regardless of how many of that form have been completed.

> **Recommendation for programs delivering to trainees**: The automatic filters cover the most sensitive content (confidential and low-score alerts), but programs should still review channel selection. If a program wants to hide certain content from trainees specifically, the cleanest pattern is to build two dashboard templates: one full-featured for CCC use only, and a slimmer version with only the safe channels for trainee delivery.

## Faculty Mentor access path

For Program Directors and faculty mentors who don't have direct admin access, the recommended access pattern (BG confirmation):

1.  **Program Administrator sets the Faculty as Mentor** of all residents in the program (or the residents the Faculty mentors specifically).
    
2.  **Program Administrator gives the Mentor "Resident Demographics" access.**
    
3.  **Faculty Mentor logs in** → middle column of Home tab → **Mentor Access** → **Resident Demographics**.
    
4.  Inside the trainee's Demographics view, scroll down to the **Resident Dashboards** section.
    
5.  Click **View Report** to open any generated dashboard.
    

This is the cleanest path for PDs who want to review trainee dashboards without going through the Program Coordinator.

## Trainee access path

A trainee accesses their own dashboards via:

1.  **Home → Tasks → Review Records**.
    
2.  Scroll to the bottom of the page.
    
3.  **Resident Dashboards** section lists every generated dashboard for the trainee.
    
4.  Click the **eye icon (View Report)** to open the PDF.
    

This is the same path whether the dashboard was emailed to them or not. The Review Records page is the trainee's archive of their own dashboards.

## Progress Report linkage

The **"Link from Progress Report"** checkbox in Modify Resident Dashboard creates a connection between the dashboard and the Progress Report:

*   When checked, generated dashboards become accessible from inside the Progress Report for the same time period.
    
*   Faculty already inside the Progress Report (typically CCC members during a review) can download the dashboard directly without navigating to a separate Resident Dashboards page.
    
*   This does NOT mean the milestones progress report content gets pulled into the dashboard. The dashboard remains its own artifact; the linkage just provides a navigational bridge from Progress Report → dashboard PDF.
    

(Ticket 211071, LS 12/15/2022.)

## Archival and cleanup

Generated dashboards persist indefinitely by default — they're stored as PDFs and accumulate over years. Programs that want to clean up old dashboards have a few options:

*   **Inactivate (set Status to Inactive)** on a dashboard from Modify Resident Dashboard. This stops future generation but keeps existing PDFs accessible.
    
*   **Delete** an individual dashboard PDF from the View Dashboards tab.
    

> **Permanently removing all archived/inactive dashboards in bulk** requires a Support ticket. The data team can run a SQL cleanup to permanently delete all archived dashboards or all inactive dashboards for a specific program — this isn't exposed in the UI. (Tickets 235737, MHDP-2987 and MHDP-3022 at Dartmouth-Hitchcock, Pathology - Anatomic and Clinical.)

## Performance considerations

Generation is data-heavy — each dashboard runs queries across evaluations, milestones, schedules, work hours, absences, portfolio, procedures, conferences, and login activity. For programs with 50+ trainees and dashboards configured to generate weekly, the Generate cron can take 30+ minutes to complete on a single program.

*   **Schedule Report Date(s) strategically.** Programs with large rosters should stagger their Report Dates across the month rather than all running on the same day. The Generate cron processes all dashboards scheduled for the same date in sequence.
    
*   **Limit channel selection to what's needed.** Adding all channels when only Milestones and Aggregate Comments are reviewed in CCC just adds query load.
    

## Common scenarios

### "Our dashboards generated but no emails arrived"

Two crons are involved. The Generate cron runs at 3:35 a.m.; the Delivery cron runs at 4:45 a.m. If the dashboard is on the View Dashboards list (it generated successfully), the Delivery cron is the suspect. Possible causes:

1.  Delivery cron failed or was delayed.
    
2.  Recipient email addresses are missing or malformed (check semicolons vs. commas — see **MedHub - Demographics — Faculty**).
    
3.  Recipient was deactivated.
    
4.  Email is in spam — check the recipient's spam folder.
    

If none of these resolve, escalate to data team — manual re-trigger of the Delivery cron may be needed.

### "I regenerated the dashboard but the email didn't resend"

By design. Emails only go out on initial generation. Regenerate updates the PDF in place but doesn't trigger email delivery. (Ticket 176971.) To get the updated PDF to recipients, manually attach it to an email outside MedHub.

### "The trainee's photo isn't showing on the dashboard"

The photo in their Demographics profile is uploaded as PNG or GIF instead of JPG. Even though all formats display in Demographics, only JPG flows to the dashboard. Right-click the photo in Demographics → Save As to confirm format. Re-upload as JPG, then Regenerate the dashboard. (Tickets 164921, 220059, AMBS-9721.)

### "The Milestones channel is showing every subcompetency twice"

The institution has v1 and v2 milestone versions both active. The channel doesn't filter by version applicability — it shows both. **Standing structural gap**, not a bug being actively fixed. The only current workaround is a per-evaluation data team request to remove outdated v1 evaluations from a program. (Ticket 153419.)

### "The Milestones description text is cut off mid-word"

41-character header description limit. Hard-coded, not configurable. (Ticket 164385.)

### "Evaluations Delivered is higher than Evaluations Completed and the trainee says they finished everything"

Delivered includes expired evaluations and evaluations queued for delivery within the date range. Completed counts only completed evaluations. The discrepancy isn't necessarily an error — see the Evaluation Completion Summary notes above for the cross-academic-year and transferred-trainee cases. (Ticket 141474.)

### "An old test score field still appears on the dashboard even though we inactivated it"

By design. Inactive test score fields with data still flow to the dashboard, displayed at the bottom of the Test Scores section as "Test Scores recorded by other programs." (Ticket 151460.)

### "The Average Days Off number doesn't match what we see in Work Hours reports"

Different calculation. Dashboard uses `days off ÷ # timesheets`. Work hours reports use a different formula. Both are correct for their respective contexts. (Ticket 140619.)

### "Confidential comments showed on a dashboard"

Should not happen for any dashboard generated 3/19/2018 or later. If it does, escalate immediately — likely a regression. (Ticket 96004, AMBS-2456.)

### "All my Program Admins should be receiving the dashboard email but only two are"

By design — only Primary Administrator and Backup Administrator (Primary) receive the email when "Program Administrator" is the recipient type. Other program admins can still view the dashboard in the View Dashboards list (assuming Program Administrators is on the Dashboard Access list) but don't get the email. (Ticket 181158.)

### "I want to remove all the inactive dashboards from a program"

Not exposed in the UI for bulk delete. Open a Support ticket; the data team can run a SQL cleanup to permanently remove all archived/inactive dashboards for the program. (Tickets 235737, MHDP-2987, MHDP-3022.)

### "The aggregate comments aren't showing all the eval types I expect"

Three filters apply: (1) Confidential Comments excluded, (2) Low Score Alert comments excluded, (3) Procedure scaled-question comment-requirement responses excluded. Other eval types should all flow. (Tickets 96004, 151303, 121260.)

### "Patient/Staff evaluation comments are showing on the dashboard before the 3-evaluation threshold"

This is how the channel works. The "Resident Access to Patient/Staff/Peer Evaluations" Program Setting (with thresholds like "Hide until 3 completed") gates the trainee's own aggregate view in MedHub — it doesn't gate the dashboard PDF. The dashboard pulls from any completed eval in the channel's date range. (Ticket 215937, AMBS-9494.)

### "I want to generate a dashboard for last March specifically"

Not possible directly. Dashboards always use the current generate date as the Report Date. Workaround: find a dashboard that was originally generated near that period and use Regenerate to refresh it (the original Report Date is preserved). If no historical dashboard exists for that period, that data window is not retrievable as a dashboard. (Ticket 176971.)

### "I want to add the same channel twice with different date ranges"

Not possible. Each channel can only be added once per dashboard template — channels already used are disabled in the Add Dashboard Channel(s) picker. The supported pattern is to build two separate dashboard templates, each with its own configuration of that channel.

### "We want to remind reviewers of certification thresholds in the procedures section"

Use the **Procedures Logged** channel's custom subheader / instructions field. Free text — common usage is `Required of Graduation: 5 PAP/Pelvic and 5 CVC` or similar. Set during dashboard setup; appears at the top of the Procedures Logged section in the PDF.

### "We want a quick check on whether a trainee is logging in"

Add the **Login Statistics** channel. It produces Last Login (timestamp), Total Logins, and Logins per Week over the configured date range — useful when CCC is reviewing a trainee whose evaluation completion or documentation engagement is a concern.

## Open questions for Emma

*   `[VERIFY]` **Resident-of-Student evaluation types in Evaluation Completion Summary** (Ticket 138458) — the original confirmation is from 2021. Verifying current behavior would require dedicated testing or dev research, so it's deferred. The channel is documented as including these types until verified otherwise.
    

### Resolved during verify pass

*   Whether the Milestones v1/v2 duplicate-display limitation has been addressed — **No.** Standing structural gap. Documented as such.
    
*   Whether dashboards delivered to trainees flag specific privacy concerns — **Yes, captured.** "Trainee delivery — what's filtered automatically" section added.
    
*   Whether the "Photo must be JPG" limitation has been resolved — **No.** Standing gap. Photo reframed as a built-in dashboard header element rather than a channel.
    
*   Confirm the 41-character Milestone header description limit hasn't been increased — **Persistent.** Visible in the live PDF.
    
*   Procedures channel output detail — **Confirmed**: TWO Procedures channels — Procedures Logged (row-level: Date, Procedure Type, Role, Supervisor, Verified Yes/No/N/A, with optional custom subheader) and Procedure Requirements Summary (counts vs. requirements with Procedure/Group, Levels, Required+verb, Comp., Perc.). Channel catalog updated.
    
*   Conference Requirements Summary contents — **Confirmed**: parallel structure to Procedure Requirements Summary; per-PGY-level rows with Required threshold and Total achieved, plus the constituent conference groups beneath.
    
*   Login Statistics contents — **Confirmed**: Last Login, Total Logins, Logins per Week for the date range.
    
*   Channel can be added more than once per template — **No.** Each channel can only be added once. Multiple templates is the supported pattern.
    
*   Report Date(s) format and meaning — **Confirmed**: M/D format only, recurring annual schedule. Set-and-forget; auto-generates and emails on each date every year.
    
*   Dashboard Access vs. Email Recipients — **Confirmed**: distinct lists. Access controls UI viewing; Email Recipients controls delivery.
    
*   "Duty Hour Submissions" channel naming — **Confirmed**: the channel is labeled **Work Hour Submissions** in current UI. Doc updated; "duty hours" no longer appears anywhere.
    
*   Channels picker categorization — **Confirmed**: 8 categories (Conferences, Demographics, Evaluations, General/Other, Portfolios, Procedures, Schedules, Work Hours). Channel catalog restructured to match.
    
*   "Add Dashboard Channel(s)" multi-add — **Confirmed**: button label + multi-select picker behavior.
    
*   AMBS-12100 PDF formatting issues — **Removed from doc.** Per editorial principle: bugs go in Jira, not in the global how-it-should-work doc.
    
*   Patient/Staff/Peer evaluation threshold gating — **Confirmed**: this is how the channel works, not a gap. The threshold gates the trainee's own aggregate view inside MedHub; the dashboard PDF is a separate surface that pulls from all completed evals in the date range. Reframed throughout.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_dashboards`

Master switch for the Resident Dashboards feature. Default 1.

`setting_dashboards_milestone_charlimit`

The 41-character truncation limit on milestone header descriptions. Hard-coded; no UI override.

(Most dashboard behavior is configured per-template via the Modify Resident Dashboard UI, not via root settings. The two crons are configured at the institution level by the Customer Operations team during initial enablement.)

Per-program settings (configured via Program Settings):

*   **Primary Administrator** and **Backup Administrator (Primary)** — drive who receives email when "Program Administrator" is selected as a recipient on a dashboard.
    
*   **Resident Access to Aggregate View** thresholds — gate the trainee's aggregate view inside MedHub. Do not apply to dashboard PDF content.
    
*   **Resident Access to Patient/Staff/Peer Evaluations** — same as above. Gates the trainee's aggregate view, not the dashboard PDF.
    

## Database tables appendix

Table

Purpose

`dashboards`

Dashboard template definitions — title, introduction, status, Report Dates, channels, access list, recipients.

`dashboards_channels`

Per-template list of channels included, with channel-specific date range and filter configuration.

`dashboards_generated`

Generated dashboard records — one per trainee per generation event. Stores Report Date, Generate Date, and PDF reference.

`dashboards_access`

Per-template UI access list (who can view through the UI).

`dashboards_recipients`

Per-template email recipient list.

`dashboards_log`

Audit of generation and delivery events — useful when investigating "the dashboard didn't run."

`users_residents`

Resident profile — photo (JPG-only), name, demographics.

`users_residents_pg`

Training history — drives PGY level on Rotations channel.

`sh_tracks_slots`

Service assignments — drives Rotations/Clinics Completed.

`sh_clinics`

Clinic assignments — also drives Rotations/Clinics Completed.

`eval_results`

Evaluation completion records — drives Aggregate Evaluation Comments and Evaluation Completion Summary.

`eval_milestones`

Milestone score records — drives Milestones Summary.

`dh_timesheets`

Work hours timesheets — drives Work Hour Submissions channel.

`portfolio_entries`

Portfolio entries — drives Portfolio Entries channel.

`absences`

Absence records — drives Absence Summary.

`ch_lectures_presenters`

Conference presenter assignments — drives Conferences Presented channel.

`ch_lectures_attendance`

Conference attendance — drives Conference Requirements Summary.

`ch_requirements`

Per-program conference attendance requirements — drives Conference Requirements Summary thresholds.

`procedures_log`

Procedure log records — drives Procedures Logged channel.

`procedures_requirements`

Per-program procedure certification thresholds and groupings — drives Procedure Requirements Summary.

`users_residents_certifications`

Test scores — drives Test Scores channel.

`users_login_log`

Login activity — drives Login Statistics channel.

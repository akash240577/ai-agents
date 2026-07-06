# MedHub - Work Hours Analytics Report - markdown

# MedHub - Work Hours Analytics Report

> **Purpose.** Captures the current state of the Work Hours Analytics Report: what GME users can do today, how the report is structured, how its calculations work, the architectural pipeline that delivers data into it, the known issues being remediated, and the export functionality that is planned but not yet released.
> 
> **Audience.** Internal MedHub Support, Product, Engineering, Analytics, and CS team members. Technical detail is concentrated in clearly marked subsections so non-technical readers can skip past.
> 
> **Status of the report.** Released in **beta** in July 2025. The "BETA" label is intentional and signals that the report is not finalized — feedback is still being incorporated, several enhancements (notably submissions-only view, search, and export) are in progress, and a UME version is in development but not yet available.
> 
> **Why this lives under Work Hours, not under Reports.** The Work Hours Analytics Report lives in the new Analytics platform (a separate Snowflake-backed surface), not in the legacy Reports tab. It is intentionally placed as a child of **MedHub - Work Hours** rather than under the Reports parent because (a) it is the canonical companion to the Work Hours platform documentation and (b) the Reports parent is reserved for the legacy report categories.

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export and the consolidated Work Hours documentation. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

> **In active development.** This report is changing. Sections marked **"In progress"** or **"Planned (not yet released)"** describe behavior that does not exist in production today. The Phase 1 and Phase 2 export features (§6) are not yet live; the UME version is not yet released; the AG Grid rendering performance issues (§8) are being addressed. Treat this document as a snapshot of the late-2025 / early-2026 state.

## 1\. Where the report lives and how access is granted

### 1.1 Surface

The Work Hours Analytics Report is accessed through the **Analytics global tab** on the homepage. The tab itself appears only for users granted access; within the tab, users see tiles for each analytics report they have access to. The Work Hours tile carries a "BETA" label and an "Open" button.

For institutions with both UME and GME, GME users see only the GME report. The UME version is **not yet available** — Faculty users with both UME and GME access see "Open GME" and a grayed-out "Open UME."

### 1.2 Two root settings control whether the tab and report appear

Setting

Effect

`analytics_tab_enabled`

Institution-wide. When `true`, the Analytics tab is enabled for any user whose role grants access. When `false`, the tab is hidden for everyone except users explicitly listed in `analytics_tab_users`.

`analytics_tab_users`

List of MedHub user IDs that should see the Analytics tab even when `analytics_tab_enabled` is `false`. Used to give a small group (typically ≤10) early access in production for testing or pre-rollout review. **If a user has multiple linked accounts, each user ID must be listed individually.**

The two settings work together: the per-user list is meant for limited internal or client-side testing while institution-wide enablement is held back.

### 1.3 User types and access permissions

Once `analytics_tab_enabled` is `true`, the following user types should see the Analytics tab:

*   **GME Office users** with **Reports** access (assigned in GME Office → GME Staff Members). Can run the report for all programs and trainees at the institution. For split institutions, scoped to the institutions the user has access to.
    
*   **Program Administrators** with any Reports access point enabled. To see the Work Hours tile specifically, they need **Reports → Compliance Reports** access for at least one program. They can run the report for any program where they have that access; the program selector on their homepage does not constrain which programs they can include.
    
*   **Faculty** in two paths:
    
    *   **Faculty Reports Access → Compliance** for one or more programs (assigned via GME Office → Faculty Reports Access). Gives access to all trainees in those programs.
        
    *   **Mentor with Work Hours access** to one or more trainees (assigned via Program Administrator → Mentors/Mentees). Gives access only to the specific mentees with that flag.
        
    *   When both apply, access is combined: the user can include programs from either path, with mentor-restricted programs scoped to just the relevant mentees.
        
*   **Student Administrators** see the Analytics tab. The Work Hours tile is currently grayed-out for UME users since the UME report has not been released.
    
*   **Course Coordinators** with Reports access — same as Student Administrators.
    

### 1.4 Why Program Directors don't have automatic access

Program Directors and Associate Program Directors are expected to be configured as **Mentors** to all residents in their programs. Mentor configuration is how they get access to demographics, procedures, work hours, evaluations, conferences, and portfolio data — work hours analytics access follows the same pattern.

This pattern is consistent with the existing PD access doctrine documented in **MedHub - Security & User Management** §"Risky access points" — PDs should not have direct admin access to evaluation data because of ACGME confidentiality concerns, so the Mentor pathway is the canonical route for PD access to trainee data including work hours.

## 2\. Running a report — three input sections

Running the Work Hours Analytics Report requires selections from three sections: **Primary Selections**, **Report Dates**, and **Secondary Filters**. None auto-populate beyond defaults; the user must explicitly select programs and click Generate Report.

### 2.1 Primary Selections

Defines the scope of who is in the report. Persists within a session — reopening the editor pre-populates the previous selections.

*   **Programs** — selected from a table of all programs the user has access to. Selections start empty for each session. The table shows program name, department, institution (depending on settings), default site, program director, program administrator, and accreditation organization. Each column has a search/filter input; filters stack and are case-sensitive with partial-match behavior. A "Selected Programs" indicator at the top filters the visible table to just selected programs.
    
*   **Program Type** — Accredited, Non-Accredited, or both. Accredited is selected by default. Determined by the program's designation in the Program List.
    
*   **Program Status** — Active, Inactive, or both. Active is selected by default. Determined in the Program List.
    
*   **Trainee Type** — selected from the institution's configured list of trainee types (managed in List Management).
    
*   **PGY Level** — selected from the institution's configured PGY levels. The label "PGY" is replaced by the client's configured term where applicable.
    

### 2.2 Report Dates

Defines the date range the report runs over.

*   **Start Date and End Date** — default to "28 days before today" through "today." End Date must be after Start Date.
    
*   **Maximum span: 366 days.** Reports may include multiple academic years.
    

### 2.3 Secondary Filters

Detailed reporting options, organized into Timesheet Submissions, Work Hours Violations, and Other Options. Once configured, the entire filter set can be saved as a named template, retrieved from a dropdown, edited, or deleted.

#### 2.3.1 Timesheet Submissions filters

*   **Define "Late" Submissions** — number of days after the week's end date at which a timesheet is considered late. Default 7 days; configurable 0–365.
    
*   **Timesheets Submitted by Administrator** — when on, treats timesheets where the earliest submission was by an administrator as late. Off by default.
    
*   **Limit to Timesheets with an Absence Threshold** — when on, restricts results to timesheets with fewer than the chosen number of absence days. Default 5 days; configurable 0–7. Default behavior (off) is "include all."
    
*   **Include Trainees based on Submission Rate** — when on, includes only trainees whose submission rate exceeds the chosen percentage. Default 50%. Default behavior (off) is "include all."
    
*   **Include Programs based on Submission Rate** — same logic at the program level.
    

#### 2.3.2 Work Hours Violations filters

*   **Calculation Method** — controls how averaged violations (average hours per week, average days off) are calculated and how violations are summarized. Four options:
    
    *   **Work Hour Review Periods (recommended)** — uses each program/schedule's configured work hour review periods. Any review period that ends within the report dates is included.
        
    *   **Rotation Periods** — uses program schedule block dates. Any rotation period ending within the report dates is included.
        
    *   **Custom Periods** — user defines start and end dates for the calculation periods, applied uniformly across all included programs. Pre-populated with 28–31 day periods to match ACGME guidance. Custom periods cannot overlap or contain gaps; the UI warns when they exceed 31 days or fall short of 28 days.
        
    *   **Report Dates** — uses the entire report date range as a single calculation period. Only recommended when the report itself is for a 28–31 day window.
        
    *   **Smart Assignment / Fallback** — when the chosen method is not configured for a program (e.g., program has no review periods), the report falls back to Rotation Periods, then to Custom Periods.
        
*   **Week Start Day** — Sunday through Saturday. Default Sunday. Affects how weekly data is laid out in the calendar view. Particularly relevant for clients calculating against NYS 405 / 10 NYCRR Part 405, since the day-off rule is evaluated per week and the week boundary matters for compliance.
    
*   **Include Schedule Details** — when on, the calendar view shows shifts/calls, clinics, and conferences alongside hours. None selected by default.
    
*   **Potential Work Hours Violation Indicators** — when on, an orange icon appears on rows where a violation is potential rather than confirmed (e.g., when not all timesheets have been submitted, or when 8-hour break is excluded from totals). Off by default.
    
*   **Include 8-Hour Break in Total Violation Count** — when on, 8-hour break violations roll up into Total Violations. Off by default — reflects ACGME's post-2017 stance that 8-hour break is a recommendation, not a requirement.
    
*   **Include Trainees based on Violation Count** — when set to a number, restricts results to trainees with that many or more total violations. Default 1; default behavior (off) is "include all."
    
*   **Include Programs based on Violation Count** — same logic at the program level.
    
*   **(New York only) Calculate Using NYS 405 Regulations** — enabled by default if the institution has the underlying NYS 405 setting (`enable_nys405_rules`) enabled. Should be requested as part of enabling the Analytics tab for NYS clients.
    

#### 2.3.3 Other Options

*   **Include Non-Reimbursable Trainees** — included by default.
    
*   **Include Visiting Trainees** — included by default. May not display for all institutions; when not displayed, the Trainee Type filter is the way to exclude visitors.
    

### 2.4 Saved filter templates

Filter sets in the Secondary Filters can be saved as named templates and reused. Saved templates can be edited or deleted from a dropdown.

> **What's saved vs. not saved.** Only the **Secondary Filters** are saved in a template. Primary Selections (programs, trainee types, PGY) and Report Dates are NOT part of the saved template — they must be selected fresh each session.

### 2.5 Generating

After making changes to any input, the **Generate Report** button activates. Clicking it produces the report. The button disables again until the next change. A warning banner appears when displayed report results no longer match the current filter selections.

The main report typically takes 1–2 minutes to generate, occasionally longer for large data sets. Subsequent runs of the same report load faster (caching).

> **Generation is NOT asynchronous.** Navigating away from the loading page loses progress. Users are also warned not to use the browser back button — the in-report navigation should be used instead, since browser navigation reverts inputs to defaults.

## 3\. Report output — three views

The report output is hierarchical: **Institutional View → Program-Specific View → Trainee Calendar View**. Users drill down by clicking row items.

### 3.1 Institutional View (primary page)

The first page contains:

*   **All Program Summary** — top row, aggregating across every program included.
    
*   **Program-Level rows** — one per included program.
    
*   **Period-Level rows** — one per unique program-schedule-period combination.
    

All rows include the same column structure:

*   **Trainees** — total trainee count.
    
*   **Timesheets** — total possible timesheets, submitted timesheets, on-time timesheets, average hours per seven days, average days off per seven days.
    
*   **Submission Information** — submission percentage (submitted / possible).
    
*   **Violations** — six columns:
    
    *   Average Hours Maximum
        
    *   Average Days Off
        
    *   Maximum Work Period Length
        
    *   Break After a 24-Hour Call
        
    *   Break Between Work Periods (encouraged but not required — controlled by the 8-hour break filter)
        
    *   Total Violations
        

Visual indicators in the violation cells:

*   **Red exclamation point** — confirmed work hours violation. The Total Violations column displays in red when the count is greater than zero.
    
*   **Orange exclamation point** — potential violation. Surfaces when not all timesheets have been submitted, or when the 8-hour break setting excludes that violation from the total. Only appears when the "Potential Work Hours Violation Indicators" filter is on.
    
*   **Grayed-out text** — a violation rule is disabled for the program in question.
    

### 3.2 Program-Specific View (second page)

Reached by clicking any Program-Level row. Provides a more granular breakdown for the selected program.

Two organizational toggles:

*   **View by Period (default for violation information)** — Schedule → PGY level → Periods → Trainees.
    
*   **View by Trainees** — Schedule → PGY level → Trainee → Periods.
    

In both views, period rows do not appear if the report is run with calculation method "Report Dates." A search bar above the data filters trainee rows by name, employee ID, PGY level, service assignment, or schedule name.

The hierarchical rows on this page:

*   **Program-Level row** — same summary as the primary page, displayed for context.
    
*   **Schedule-Level row(s)** — same summary scoped to the schedule.
    
*   **PGY Level row(s)** — beneath each schedule, summarizing data for trainees at each PGY level.
    
*   **Individual Trainee Summary row(s)** — one per trainee per period, showing:
    
    *   Last Name, First Name, PGY Level, Employee ID
        
    *   Service Assignment(s), with dates
        
    *   Submitted Timesheets (submitted/possible) and number of late timesheets
        
    *   Average Hours per 7 Days, Average Days Off per 7 Days
        
    *   Maximum Work Period Length, Break After 24-Call, Break Between Work Periods
        
    *   Total Violations
        

#### 3.2.1 View Details panel

Each individual trainee row has an expandable **View Details** panel containing three tabs:

*   **Timesheets tab** — a tile per timesheet within the period, with dates, submission details, potential violations, and any trainee-entered comments.
    
*   **Reviews tab** — work hours reviews for the period: program name, schedule, period dates, the program director, and any review comments.
    
*   **Contacts tab** — Mentors and Associate Directors associated with the trainee, with an option to send them an email.
    

#### 3.2.2 Column header behavior on the Program-Specific View

> **The column headers on the second page use the exact threshold being calculated for that program**, not generic ACGME labels. If a program uses Custom Rules in the Program List with a 75-hour weekly maximum, the column reads "75 hours max" rather than "80 hours max." The first page uses generic language because thresholds can vary program-to-program.
> 
> If a program has a violation rule disabled altogether, that column is grayed out on the Program-Specific View.

**Historical caveat (September 2025):** when `CONST_HOURS_BREAK` was set to 10 (a pre-2017 value), the 8-hour break column header displayed "10 hour break." This was identified for change so the setting only affects pre-2017 calculations.

### 3.3 Trainee Calendar View

Reached by clicking an Individual Trainee or Period-Level row. Shows the trainee's full schedule and work hours for the period in calendar layout.

*   **Left cell** — date range for the week, total hours worked, number of days off. If the Potential Violation Indicators filter is on, an orange indicator appears next to total hours over 80 (or program threshold) and days-off counts of zero.
    
*   **Day columns** — one per day, with the configured Week Start Day as the leftmost column. Each cell displays:
    
    *   Calendar date.
        
    *   **Hours**: total entered for the day with start/end times; non-standard schedule entries (Clinical Work from Home, Moonlighting) are labeled by type. Standard work hours are not labeled.
        
    *   **Absences**: vacation, sick, leave of absence, conference (away).
        
    *   **Submission Status**: zero hours when no entry is logged; "Not Submitted" when the timesheet is unsubmitted; "No Timesheet" for days outside the trainee's training history (e.g., started training mid-period).
        
    *   **Schedule Details** — if enabled in Secondary Filters, shift/call assignments, clinics, conferences appear here.
        
*   **Out-of-period and PGY-change days** are grayed out.
    
*   **Violation icons** appear in this view; hovering over them shows a hint with the violation type(s).
    

## 4\. How calculations differ from older work hours reports

The Analytics report intentionally calculates some things differently than the older Work Hours Summary, Work Hours Compliance, and Work Hours Institutional Summary reports. This produces user questions when numbers don't match.

The most common differences:

Metric

Older reports

Analytics report

**Average Hours/Week and Average Days Off/Week**

Averaged over the entire report date range

Averaged over the **calculation period selected** (review period, rotation period, custom period, or report dates)

**14-Hour Break After 24-Hour Call**

Looked only at scheduled items (program-side responsibility)

Incorporates **logged work hours** as well — addresses programs that don't use shift/call functionality and instances where trainees returned outside scheduled time

**Home Call (Called In) hours**

Excluded from most violation calculations

Counted similarly to Standard Hours — based on updated ACGME consultant guidance that this represents actual on-site / in-hospital work

These changes are deliberate. They are also an evolution of how the platform calculates violations, which is why the Work Hours platform doc notes that this area is "evolving."

> **What this means for support tickets.** Expect "the Analytics report shows different numbers than the Work Hours Compliance Report" tickets. The answer is generally: yes, by design — the Analytics report is the new canonical calculation, the older reports use older logic. Once the centralized violation calculation work (MED-814) lands, all consumers will share a single calculation source and these differences will resolve.

## 5\. Calculation period selection and inclusion logic

The **Calculation Method** filter in Secondary Filters is the most consequential selection in the report. It governs both how averaged violations are calculated and how violations are summarized into rows.

For **Work Hour Review Periods** and **Rotation Periods**, the inclusion rule is consistent: **any period that ends within the report dates is included.** A review period that started outside the report range but ends inside it is included; a period that started inside but ends outside is not. This is the same date-attribution principle as the platform-side violation date logic — the period's end date is what governs.

When a program included in the report has not been configured for the chosen method, **Smart Assignment / Fallback** takes over: Work Hour Review Periods → Rotation Periods → Custom Periods.

## 6\. Planned but not yet released

Per the support knowledge base (last updated November 2025), the following Analytics report features are in active development but **not yet shipped**.

### 6.1 Timesheet Submissions view (in progress)

A submissions-focused view of the report that omits violation information entirely. Users will be able to filter to:

*   Unsubmitted timesheets
    
*   Unsubmitted timesheets that are also late
    

Useful for programs and GME offices whose primary concern is submission compliance rather than violation counts.

### 6.2 Search (in progress)

A search function that filters the data rows in the resulting report by string match. Will allow users to find rows associated with specific trainees, schedules, services, or other schedule assignments without re-running the report.

### 6.3 Export — Phase 1 (MED-754)

The Phase 1 export feature is scoped as follows:

*   **Export the full first page** (Institutional View) as PDF or CSV.
    
*   **Send Email with attachment**: from the first page, attach program-level and schedule-level summary rows as PDF or CSV.
    
*   **Export the full second page** (Program-Specific View — program, schedule, PGY, individual rows) as PDF or CSV.
    
*   **Send Email with attachment**: from a program row on the second page, attach program, schedule, PGY, and individual rows as PDF or CSV.
    
*   **Export currently-expanded rows** on the second page as PDF.
    
*   **Send Email with attachment**: from the View Details panel, attach individual trainee summary row plus calendar as PDF.
    
*   All PDFs include the MedHub logo and report name in the header.
    

Phase 1 is closed (specification-wise); engineering work is in flight.

### 6.4 Export — Phase 2 (MED-768)

The Phase 2 export expands on Phase 1 with structured period-level exports particularly useful for **ACGME re-accreditation site visits**. Highlights:

*   **Actions menu on first-page program rows**: Send Email, Export Full Program Report (PDF), Export Period Report (PDF), Export Period Report (CSV), Export Trainee Report (CSV). The "PGY" label uses the client's configured term.
    
*   **Export Period Report (PDF)** delivers a re-accreditation-friendly view including: column headers, program information, program-level row, schedule/period-level rows. When the schedule/period row represents a Work Hour Review Period, it includes the period's review status (e.g., reviewed, partially reviewed, no violations, future, unreviewed), the director's overall comment, and the date the director reviewed the period.
    
*   For each schedule/period that contains trainees with violations, the trainee's individual summary row is listed, including the trainee's reason and comment for each violation. When this is a Work Hour Review Period, the director's comment specific to that trainee's violations is also included.
    
*   **Export Period Report (CSV)** delivers the same data in flat-file form, one row per trainee with violations. Columns include program name, trainee name, employee ID, PGY level (client term), schedule name, period start and end dates, service assignment(s), submitted timesheets, average hours per 7 days, average days off per 7 days, the five averaged/shift violation counts, total violations, trainee reason and comment, review status, director review comment, and director overall comment.
    
*   **Export Trainee Report (CSV)** is structurally identical to the Period Report CSV but includes a row for **every trainee in the report**, not just those with violations.
    
*   **In-row exports** are added on the Program-Specific View. In View by Period, an export icon next to View Details exports a PDF of the individual trainee row and calendar. In View by Trainee, an export icon next to the employee ID exports the trainee's summary row, all period-level rows, and the associated calendars.
    

Phase 2 is in PI as of last update.

### 6.5 UME version

The UME Work Hours Analytics report is in development but not yet released. Faculty users with both UME and GME access see "Open UME" displayed but grayed out. The UME version was discussed in two design sessions (July and September 2025).

## 7\. Pipeline and architecture (technical detail)

This section is technical — non-technical readers can skip to §8.

### 7.1 Data flow

The report is delivered out of a Snowflake-based analytics layer that consumes change-data-capture events from MedHub's per-client SQL Server databases:

1.  **SQL Server → CDC.** Each per-client SQL Server instance emits change events via CDC.
    
2.  **Kafka captures change events.** Kafka connectors read CDC events and stream them to Azure Blob Storage in AVRO format.
    
3.  **Snowpipes auto-ingest.** Notification-driven Snowpipes copy AVRO files into Snowflake's raw layer using `COPY INTO`.
    
4.  **Transformations in Snowflake.** Two schemas exist:
    
    *   **Raw layer** (`MEDDATAMART_STAGE` in test, `MEDDATMART_STAGE` in prod) — receives raw JSON from Kafka events, preserving record history.
        
    *   **Reporting layer** (`MEDDAMART_STG` in test, `MEDDATAMART` in prod) — parsed and validated data ready for reporting.
        
5.  **Reporting layer refresh** — target lag of 2–3 minutes.
    

### 7.2 Environments

Source/Sink

Test/Dev

Production

SQL Server

`10.200.128.73`

Six instances (`10.200.149.11`, `.110`, `.111`, `.118`, `.119`, `.120`)

Azure Blob Storage

`azure://ascanastorageeastus2stg.blob.core.windows.net/medicine/`

`azure://ascanastorageeastus2prd.blob.core.windows.net/medicine/`

Snowflake database

`MH_PLATFORM_WORKHOURSREPORT_POC`

`MH_PLATFORM_ANALYTICS_PRD`

Kafka Connectors

Staging cluster

Production cluster

### 7.3 Refresh mechanism difference between environments

> **This is one of the active reliability concerns.** The mechanism that promotes data from the raw layer to the reporting layer differs between environments:
> 
> *   **Staging** uses **Snowflake Dynamic Tables** — event-driven, refreshes only when changes are detected. Target lag of 2 minutes.
>     
> *   **Production** uses **scheduled tasks** running every 10–20 seconds regardless of whether changes have occurred.
>     
> 
> The production approach has produced three problems:
> 
> *   **Inconsistency** — occasional missing records during merge.
>     
> *   **Inefficiency** — continuous execution without change detection consumes resources unnecessarily.
>     
> *   **High cost** — elevated compute usage from constant polling.
>     
> 
> Aligning production to dynamic tables is part of the analytics platform's roadmap.

### 7.4 Monitoring

Kafka connector health and throughput are monitored via a Datadog dashboard ("MedHub Analytics Kafka Dashboard").

## 8\. Known issues being remediated (technical detail)

The Analytics team identified a substantial set of issues in fall 2025. Many were missed during UAT because UAT coincided with the academic year changeover and few clients participated. The following are tracked and being addressed.

### 8.1 Data layer (Snowflake)

*   **Incomplete CDC handling for delete events.** The original ETL/ELT did not account for delete events emitted by Kafka. Deleted or stale records persist in tables — for example, deleted work hour review periods, deleted user records, deleted service definitions. The reporting layer reflects records that no longer exist on the source. **Tracked under MED-601** and being addressed in the current PI.
    
*   **Incremental data update issues.** Cases where a timesheet is updated to status 1 on the platform but the reporting layer continues to display status 0. Caused by gaps in how incremental updates are handled by the merge logic.
    
*   **Insufficient metadata on records.** Tables don't carry enough metadata to identify the source of a record when something looks faulty. With six production SQL Server instances, knowing which file or which staging location produced a record is necessary for diagnosis. Today only `site_name` and `system_created_date` are reliable, and that's not enough.
    

### 8.2 API layer

The `getIndividualTraineeTimesheet` method (the core of timesheet data assembly for the UI) has become a 1,000+ line monolith with several maintainability issues:

*   **Excessive method size and scope** — combines fetching, filtering, transformation, aggregation, and formatting in one method.
    
*   **Redundant logic blocks** — repeated patterns particularly in filtering and custom period key assignments.
    
*   **Synchronous server load during API calls** — all calculations happen during the API call, degrading performance under load.
    
*   **Logical errors in conditional assignments** that produce incorrect data handling in some cases.
    
*   **Lack of modularization** — large logic blocks not abstracted into helper methods.
    
*   **Debugging complexity** — deeply nested logic, reused variables.
    

API repository and controller-level concerns:

*   A single repository method handles all stored procedures, creating tight coupling and difficult debugging.
    
*   Exceptions are not logged or propagated correctly; failures silently return incorrect data.
    
*   Exception handling is performed at the controller layer instead of the service or repository layer, hiding failures.
    

A specific severe bug: a **broken Comparator in TreeMap** caused infinite loops in the trim logic, spiking CPU to maximum, leaving requests in `RUNNABLE` state indefinitely, producing memory leaks and preventing report generation.

API code refactoring is being addressed as **MED-560** in the current PI.

### 8.3 UI layer

Two APIs are observably slow:

*   `/workhours/v1/individual-trainee-timesheet` — 1–3 minute delays in some cases.
    
*   `/workhours/v1/individual-trainee-timesheet-by-trainee` — 1–3 minute delays in some cases.
    

Temporary UI mitigation: distinct loading progress bars with messages like "Identifying appropriate trainees…", "Gathering timesheet data…", "Reviewing audit records for submissions…" — these are not real progress indicators, but they keep users from assuming the page has broken. Permanent fix is API performance improvement.

### 8.4 AG Grid rendering on the second page

The Program-Specific View uses AG Grid with a deep master-detail hierarchy across **seven nested levels**: Program → Schedule → Date Range → PGY → Trainee → Services → Calendar View. Each level instantiates its own AG Grid with Angular cellRenderer and detailCellRenderer components. This produces high DOM complexity and many Angular change detection cycles, especially during search filtering when matched rows are dynamically expanded across levels.

Render time today (averages):

Page

Data load

Min (sec)

Max (sec)

Main page

—

5

35

Second page

Light

5

15

Second page

Moderate nested

30

60

Second page

Heavy nested

120

240

### 8.5 Acceptance criteria gaps from original MVP

Some MVP behavior was not implemented correctly:

*   **PGY-0 was not included** in filters.
    
*   **Services information slipped to the next month** in some views.
    
*   **Calculation method "Work Hour Review Period" was not always honored** — Rotation/Custom Period rows could appear alongside Review Period rows for the same program/schedule.
    
*   **On-Time vs. Late timesheet calculation was incorrect** in calendar view: any submitted timesheet was treated as on-time, ignoring the late threshold.
    
*   **Admin-submitted timesheets** were not represented in the calendar view on the second page.
    
*   **Institution name** displayed incorrectly in primary filters.
    
*   At the program-level summary, the **department name** was replaced with the program name.
    

### 8.6 Development environment bottleneck

There is a single shared TEST environment for the analytics report. UI, API, and data layer changes are all deployed there together; teams with separate fixes must wait for environment availability, slowing iteration.

## 9\. Specific known calculation issues

In addition to the systemic issues in §8, individual calculation problems have been documented:

*   **NYS 405 false positive Max Hours violations (MEDA-8787).** The "Average Hours per 7 Days" metric is calculated incorrectly for NYS 405-enabled sites, producing false positives. **Open.**
    
*   **Program Summary count duplication when a period contains multiple schedules (MEDA-8869).** The Possible Timesheet count at the Program Summary level is duplicated when the report period includes two or more schedules.
    
*   **Firm-based schedule support (MED-801).** The Analytics report does not yet fully support firm-based schedules (Internal Medicine model with multiple firms producing separate review periods per firm). **In progress.**
    

## 10\. Relationship to the platform-side initiative

The Analytics report is the consumer side of the broader Work Hours initiative. Several decisions affecting the report are being made on the platform side:

*   **Configurable start of week (MED-565).** Once the platform supports configurable week start, the Analytics report's existing Week Start Day filter no longer needs to compensate for hardcoded Sunday assumptions. The filter will likely become a display-time view choice, not a compliance correction.
    
*   **Centralized violation calculation (MED-814).** Calculations currently performed by the API layer (in the 1,000+ line method noted in §8.2) are being moved to the platform side, where each client's configuration is known. The Analytics report will consume **finalized violation outputs** from the platform via the schema contract being defined under MED-814. This is the principle articulated in the Work Hours design principles document: **Analytics consumes finalized outputs; the platform owns calculation.** The "what Analytics can't easily get" test governs what makes it into the schema contract.
    
*   **Review period status architecture (MED-595).** Review period status is being persisted on the platform side rather than calculated on the fly. The Analytics report will consume the persisted status, removing one of the larger pieces of duplicated logic between the report and the platform.
    
*   **GME Work Hours Reporting Enhancements (MED-812).** Feedback-driven enhancements being completed prior to full solution release at end of PI 26.2.
    
*   **WH Reporting GME Refactoring (MED-731).** The API code refactoring effort tracked above (MED-560) is the technical work behind this feature.
    

## 11\. Operational scenarios

### "Why don't my numbers match the Work Hours Compliance Report?"

By design — see §4. The Analytics report calculates Average Hours/Week and Average Days Off/Week over the **calculation period selected**, not the entire report date range. The 14-hour break check incorporates logged hours, not just scheduled items. Home Call (Called In) hours are now treated like Standard hours. The older Compliance Report uses different logic; both are technically "correct" for their respective methodologies.

### "I gave a Program Director access to the Analytics tab but they still can't see the Work Hours tile"

PDs typically don't have direct Reports access points (by ACGME confidentiality doctrine — see **MedHub - Security & User Management** §"Risky access points"). The canonical path is to configure the PD as a **Mentor** to all residents in their program with Work Hours mentor access. After Mentor configuration, the Work Hours tile becomes available via the mentor pathway.

### "I want to give one or two people early access to the Analytics tab without enabling it institution-wide"

Add their MedHub user IDs to `analytics_tab_users` while keeping `analytics_tab_enabled` set to `false`. **If a user has multiple linked accounts**, each user ID must be listed individually. Recommend keeping the early-access list to ≤10 users.

### "An NYS 405 client is seeing false-positive Max Hours violations"

This is **MEDA-8787**, currently open. The "Average Hours per 7 Days" metric is calculated incorrectly for NYS 405-enabled sites. No client-side workaround at this time; track the ticket for resolution.

### "Possible Timesheet count is doubled at the Program Summary level"

The program has multiple schedules within the report period. **MEDA-8869.** No workaround.

### "Firm-based program isn't showing the right review periods"

**MED-801** — firm-based schedule support is in progress. Until it's complete, programs with the firm-based pattern (Internal Medicine model with multiple firms producing separate review periods) will not see all their review periods properly aggregated.

### "Generation hung — should I refresh?"

Generation is **not asynchronous**. If the user navigates away or the browser back button is used, progress is lost. The right move is to wait — main report typically takes 1–2 minutes, second page can take longer (up to 4 minutes with heavy nested data per §8.4 table). The temporary loading messages ("Identifying appropriate trainees…" etc.) are placeholders, not real progress.

### "Calendar view is showing on-time submissions that I think were late"

**MVP gap (§8.5).** On-Time vs. Late calculation in the calendar view treats any submitted timesheet as on-time, ignoring the late threshold filter. Use the Institutional View (first page) for accurate late-submission counts until this is fixed.

### "User has linked accounts and only sees Analytics tab from one of them"

Add each linked user ID separately to `analytics_tab_users`. The linked-account toggle does not automatically extend Analytics tab access from one account to the other.

## 12\. Out of scope for this document

For reference:

*   **Work hours platform functionality** — covered in **MedHub - Work Hours**. Includes timesheet submission, work hour types, the rule definitions themselves, lockout, work hour review period creation and management, and per-program/per-school configuration.
    
*   **Submission Rate calculation in the older Work Hour Submission Report** — referenced briefly in §4 for comparison purposes only; full calculation logic is part of the older report layer being replaced.
    
*   **The older Work Hours Compliance Report and Work Hours Institutional Summary Report** — these are not part of the Analytics tab and are not being changed by this initiative directly. They will eventually be deprecated in favor of the Analytics report.
    
*   **Moonlighting request workflow** — out of scope.
    
*   **Schedule, Service, and Rotation management** — referenced where relevant for how report calculations consume them; full management is its own subsystem.
    

## 13\. Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Whether the `CONST_HOURS_BREAK = 10` column header bug has been fixed since September 2025.
    
*   `[VERIFY]` Whether the **production refresh mechanism** has been migrated from scheduled tasks to Dynamic Tables (§7.3).
    
*   `[VERIFY]` Status of MED-601 (CDC delete-event remediation) — is this complete or still in flight.
    
*   `[VERIFY]` Status of MED-560 (API refactoring) — current PI completion expected.
    
*   `[VERIFY]` Whether the seven AG Grid acceptance-criteria gaps in §8.5 have all been resolved.
    
*   `[VERIFY]` Phase 1 export ship date — has it shipped yet.
    
*   `[VERIFY]` Phase 2 export status — confirm it's still in PI 26.2 or moved.
    
*   `[VERIFY]` UME report development progress — production readiness timeline.
    
*   `[VERIFY]` Whether MEDA-8787 (NYS 405 false positives) and MEDA-8869 (program count duplication) have been resolved.
    
*   `[VERIFY]` Whether MED-801 (firm-based schedule support) has shipped.
    

## 14\. Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`analytics_tab_enabled`

Institution-wide enable/disable for the Analytics tab. When `true`, any user with a role granting access sees the tab. When `false`, the tab is hidden for everyone except users in `analytics_tab_users`.

`analytics_tab_users`

List of MedHub user IDs that see the Analytics tab even when `analytics_tab_enabled` is `false`. Used for limited early-access rollout. Each linked account requires its own user ID entry.

`enable_nys405_rules`

Institution-wide NYS 405 rule enablement. Drives the default state of the "Calculate Using NYS 405 Regulations" filter for NYS clients. (Setting documented in detail in **MedHub - Work Hours** §14.)

`CONST_HOURS_BREAK`

Pre-2017 break threshold. Should not affect post-2017 calculations but historically affected the Analytics report column header. (Documented in detail in **MedHub - Work Hours** §14.)

The Analytics report itself is configured almost entirely through the in-product filter system rather than through root settings. Most behavior the user controls — calculation method, thresholds, week start day, NYS 405 — is governed by the Secondary Filters described in §2.3 and the saved templates feature in §2.4.

## 15\. Database / schema appendix

The Analytics report consumes data from Snowflake's reporting layer (`MEDDATAMART` in production, `MEDDAMART_STG` in test). The reporting layer is fed from the raw layer (`MEDDATMART_STAGE` in production, `MEDDATAMART_STAGE` in test) via either Dynamic Tables (test) or scheduled tasks (production — see §7.3 for the active reliability concern).

Source tables on the platform side that flow into the Analytics report include:

Source table

Purpose in the report

`sh_timesheets`

Daily timesheet entries — driving timesheet submission columns and calendar view.

`ref_timesheets_periods`

Work Hour Review Periods — driving the review-period-based calculation method.

`ref_timesheets_periods_residents`

Per-trainee review records.

`ref_timesheets_periods_comments`

Director review comments — included in Phase 2 export Period Reports.

`audit_dh`

Submission audit trail — driving on-time vs. late calculations.

`users_residents_pg`

Training history — drives PGY level lookup and trainee-period eligibility.

`sh_tracks_slots`

Service assignments — drives Service Assignment columns and calendar view.

`sh_clinics`

Clinic assignments — drives clinic Recorded Activities in calendar view.

The full schema of the Snowflake reporting layer is documented in **Analytics → Work Hour Reports → ETL/ELT Documentation** (Confluence page 591593478).

## Source material

This document is consolidated from:

*   MedHub User Manual, Section 15 — Analytics Tab → Work Hours Analytics Report (v18.1, May 2026 snapshot).
    
*   Confluence: SCSS → Work Hours Analytics Report (page 311197946) — support knowledge base accumulated since the July 2025 beta release.
    
*   Confluence: Analytics → Work Hour Reports → ETL/ELT Documentation (page 591593478).
    
*   Confluence: Analytics → Work Hour Report → List of Issues (page 481656866).
    
*   Confluence: Analytics → Medhub Analytics Load and Performance (LNP) Exception (page 313033561) — performance exception request from June 2025.
    
*   Jira: MED-754 (Phase 1 Export), MED-768 (Phase 2 Export), MED-560 (API refactoring), MED-601 (CDC remediation), MED-565 (configurable start of week), MED-595 (review period architecture), MED-801 (firm-based schedules), MED-812 (GME Work Hours Reporting Enhancements), MED-814 (centralized violation calculation), MED-731 (WH Reporting GME Refactoring), MEDA-8787 (NYS 405 false positives), MEDA-8869 (program count duplication).
    
*   Project conversations on platform/analytics architectural split, schema contract definition, and team operating model.

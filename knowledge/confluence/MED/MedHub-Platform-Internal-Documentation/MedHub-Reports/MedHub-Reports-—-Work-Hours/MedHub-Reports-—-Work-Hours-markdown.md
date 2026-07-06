# MedHub - Reports — Work Hours - markdown

# MedHub - Reports — Work Hours \[GME/UME\]

> In 2025, MedHub introduced the Work Hours Analytics Report, designed to consolidate the various calculation methods used across the legacy work hours reports into a single source of truth for work hour violations. Clients are encouraged to use the Analytics report when identifying work hour violations going forward. The Analytics report is accessed via the Analytics tab and is documented separately. The reports below remain available and are still in active use.

## Report List

The following work hours reports are available in the Compliance Reports section. Unless otherwise noted, these reports are accessible to program administrators, GME Office users, and (in some cases) faculty members.

### Work Hours Compliance Report

Calculates all trainee work hour activity over four-week rolling averages as defined by ACGME regulations. Displays violations in a red highlighted box, including: exceeding 80 hours of activity in a single week, failure to have at least one day off per week averaged over the four-week period, and single work period limitation of 28 hours with a 10-hour break between work periods. The report also includes the mitigating reason or rationale entered by the trainee when they encountered the potential violation.

The report flags weeks that contain a violation. Violations are not counted individually -- a week with multiple violations is counted as one in the report.

**80-hour average calculation:** Sum all hours worked during the 4-week period (or month if schedule is monthly), divide by the total number of available work days in that period (vacation days are excluded), then multiply by 7 to get the weekly average.

**Calendar month note:** Calendar months range from 28 to 31 days. When calculating by calendar month, months with more than 28 days average less than 1.0 day off per seven days. MedHub still counts these instances as a day off, with a minimum valid value of .903 (28/31, truncated to .9 in the report).

**Access:** Faculty Member, Administrator, GME Office. Reports > Compliance Reports > Work Hours Compliance Report.

**Violation rule sets:** Which violation rules are applied depends on the report's start date relative to two root settings: `settings_dh_ns_date` (ACGME 2011 standards, default 7/1/2011) and `settings_dh_cpr_date` (2017 Common Program Requirements updates, default 7/1/2017). Programs may also define custom work hours rules at the program level, which override the institutional defaults.

### Work Hours Detail Report

Displays actual day-by-day timesheet entries by trainee, broken down by week. Includes: date range, number of hours worked, days off, absences (approved by program), moonlighting, compliance with rationale for potential violations, program notes, and timesheet details.

**Access:** Faculty Member, Administrator, GME Office. Reports > Compliance Reports > Work Hours Detail Report.

**Output formats:** HTML, XLS Excel, Text (Tab, Comma, or Pipe).

### Work Hours Institutional Summary

Summarizes work hour information and violations for all programs across the institution. Programs can be filtered for ACGME-accredited or non-ACGME accredited programs (based on the "Accrediting Organization" field in the Program List).

The report can only include review periods that meet all of the following: the review period exists, it begins and ends within the report's date range, and its length is between 21 and 45 days. The report is designed for periods of more than 60 days; when used with shorter periods, different calculations apply and results may vary.

**Output columns:** Percentage of timesheets submitted, average hours worked per week (with 80-hour violation count), average days off per week (with day-off violation count), work period violations (16-hour, 24+4 hour, 8/10 hour break), total violations, number of residents.

**Optional outputs:** Use Duty Hour Review Periods if Available, Use New ACGME Duty Hour Regulations, Violations per Resident, Director Comments, Director Review Percentage.

**Output types:** Standard (one row per program), Show Rotation Details (rows split by review period/block period), Show Level/Rotation Details (split by review period and PGY level).

**Access:** GME Office. Reports > Compliance Reports > Work Hours Institutional Summary.

**Violation calculation method:** Controlled by the root setting `settings_dh` (1=combined method, 2=split method, default: 2). The combined method merges certain violation types (24+6/10hr break); the split method reports them separately.

### Work Hours Submission Report

Summarizes work hour completion percentages for a group of residents or students. The two metrics are: the number of timesheets in a "Submitted" state, and the percentage of timesheets submitted on time.

**Important:** The Submission Report only includes resident-submitted timesheets. Admin-submitted timesheets on behalf of a resident are not counted in this report. If an institution needs data that includes admin-submitted timesheets, they should use the Work Hours Summary Report, which includes all timesheets regardless of who submitted them. This is a frequent source of support confusion.

The report normalizes the selected date range to full work weeks (Sunday to Saturday). Because MedHub stores timesheets by day (not by week) in the `sh_timesheets` table, the report calculates weekly totals by dividing day counts by seven. This can produce fractional results for trainees whose training records start or end mid-week. Trainees starting mid-week may see percentages like 66.7% when they submitted all actual timesheets, because the report counts a partial first week as a full possible timesheet.

**Options include:** Display trainee on-time percentage, Display Program Notes, Hide trainees with 100% submission, Remove weeks with 5 or more absence days (reduces the denominator rather than flagging non-submission).

The report works in both GME and UME contexts. The UME mode is determined by the logged-in user's type (Student Admin or Course Admin). In UME mode, the student query is slightly different: Course Admins check enrollment records only, while Student Admins also constrain by training records -- which can produce different trainee counts for the same date range.

**Access:** Reports > Compliance Reports > Work Hours Submission Report.

### Work Hours Summary Report

Displays the possible number of trainee timesheets that could have been submitted for the selected period, with per-week violation visibility. This report uses weekly timesheet calculations, not the ACGME four-week rolling average -- use the Work Hours Compliance Report for actual four-week violation calculations.

**Report columns:** Trainee name, level, timesheets submitted, non-compliant timesheets, 80-hour rule non-compliance, days-off non-compliance, work period limitation non-compliance, average hours per week, average days off per week, moonlighting hours per week.

**Options:** Remove Non-Reimbursable Trainees, Remove Visiting Residents, Display Email Address. Sort by Last Name or PGY.

The report applies different violation rule sets based on the start date (see root settings `settings_dh_ns_date` and `settings_dh_cpr_date`). Programs with custom work hours rules use those instead of the institutional defaults. Moonlighting columns are displayed when moonlighting is enabled (`settings_moonlighting_hours`).

**Access:** Faculty Member, GME Office. Reports > Compliance Reports > Work Hours Summary.

### Work Hour Entries Report

Exports work periods over a specified date range. Output contains: resident name, program, resident level, date, day of the week, start time, end time, hours worked, and work type activity. This report cannot be generated across academic years.

### Work Hours Activity Types

Provides tallies of each type of work hours activity for each trainee during the target period. Activity types: Standard Hours, Worked From Home, Home Calls (Called In), Internal Moonlighting, External Moonlighting. The number in each column indicates the number of shifts logged.

### Work Hours Moonlighting Report

Compares actual trainee-recorded moonlighting shifts against hours approved for each trainee. Displays internal and external moonlighting as separate columns.

**Access:** GME Office. Reports > Compliance Reports > Work Hours Moonlighting Report.

### Work Hours by Service

Reports work hours data grouped by service assignment.

### Work Hours Work Type Summary

Displays total hours and averages per week of each work type per trainee: Standard Hours, Internal Moonlighting, External Moonlighting, Home Call (Called In), Work From Home.

### Work Hours 10Hr Break Check

Identifies all instances of potential 10-hour break violations. This is intended for research purposes only and should not be used to identify true violations.

### Violation Reasons Report

Lists the reasons entered for a trainee's non-compliant work hours when they were recorded. Returns: reason/program notes, date of submission of non-compliance, and trainee information.

### Faculty Time Reports

Three faculty-focused work hours reports are available:

*   **Faculty Time Approval Report** -- tracks approval status of faculty time submissions.
    
*   **Faculty Time Log Report** -- displays logged faculty time entries.
    
*   **Faculty Time Summary Report** -- summarizes faculty time data across the selected period.
    

* * *

## Key Behavioral Notes

**Institutional Summary vs. Compliance Report:** These two reports use fundamentally different calculation methods and will produce different numbers for the same date range. The Compliance Report uses ACGME-prescribed four-week rolling averages. The Institutional Summary aggregates by review period or block period and applies different date-handling logic. This is by design and is a frequent source of support questions.

**Submission Report vs. Summary Report:** The Submission Report only counts resident-submitted timesheets. The Summary Report counts all submitted timesheets regardless of who submitted them (including admin-submitted). This distinction determines which report to use depending on whether the institution wants to measure resident compliance specifically or overall submission completeness.

**Date normalization:** Multiple reports normalize selected date ranges to full work weeks (Sunday-Saturday). This means the actual date range used in calculations may extend beyond what was selected. Trainees with training records that start or end mid-week may see unexpected percentages due to partial-week calculation artifacts.

**Timesheet storage:** MedHub stores timesheets by day in the `sh_timesheets` table, not as weekly groupings. All weekly calculations are derived by the report code, not the database. This affects how "possible timesheets" and "submitted timesheets" are counted.

* * *

## Key Root Settings

Setting

Description

`settings_dh`

Duty Hours Method: 1=combined, 2=split (default: 2)

`settings_dh_ns_date`

Date to start applying ACGME 2011 standards (default: 7/1/2011)

`settings_dh_cpr_date`

Date to start applying 2017 Common Program Requirements updates (default: 7/1/2017)

`settings_moonlighting_hours`

Enable moonlighting tracking (0=disabled, 1=enabled)

`CONST_HOURS_BREAK`

Threshold for duty hour break violation (8 or 10 recommended; default: 10). Only referenced prior to 2017 updates.

`CONST_HOURS_MIN`

Minimum hours threshold for duty hour violations

`CONST_USE_PGY1_MAX`

Controls whether PGY-1 specific work period labels are displayed

`CONST_CALL_LABEL`

Label used for work period/call columns in reports

`enable_nys405_rules`

Enables NYS 405 regulation compliance options in the Compliance Report

* * *

## Cross-References

Related Page

Relationship

Work Hours

Core feature doc covering timesheet entry, compliance, review periods, and violation rules

Work Hours Analytics Report

The newer Analytics-tab report with advanced filtering; documented separately

Reports -- Finance & Billing

Funding FTE and Funding FTE Summary reports are listed in the Compliance Reports section but documented under Finance

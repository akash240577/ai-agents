# MedHub - Reports — Scheduling - markdown

# MedHub - Reports — Scheduling \[GME\]

## Report List

The scheduling reports are found under Reports > Scheduling Reports. They provide visibility into rotation schedules, shift/call assignments, clinic activity, absences, service assignments, and scheduling configuration. Unless otherwise noted, these reports are accessible to program administrators and GME Office users.

### Annotated Rotation Schedule (ARS)

Provides detailed rotational activity information down to the day level, defining 100% of trainee and/or scheduled faculty activity. Due to its size, the ARS is run by individual program. Filters include schedule, report target (individual residents, scheduled faculty, or all), date range, display type (Reimbursement Exceptions Only or All Activity), and sort (last name or PGY). Output shows a grid layout similar to the block rotation schedule with primary activity in black and exceptions in red. Retrospective vs prospective activity is indicated. A service key at the bottom defines all abbreviations, site locations, clinic definitions, shift definitions, and standard activities. The Reimbursement Exceptions display type is recommended for IRIS verification and audit backup documentation.

**Access:** GME Office, Administrator. Reports > Scheduling Reports > Annotated Rotation Schedule.

### Approved TSMA/Moonlighting Requests

Client-specific report (Duke University) summarizing TSMA/Moonlighting requests. Display options include approval status (approved, rejected, pending pre-GME approval, pending GME approval) and request type (TSMA or outside moonlighting).

### Calls/Shifts Report

Counts the number of shifts and calls recorded for each user over a date range. Filters: date range, trainee/user type, sort (last name or program & last name), separate weekends/weekdays, display unique shifts/calls. Output: resident name, program, in-house calls, home calls, shifts, total.

### Clinic Summary

Summarizes scheduled clinic activity. Filters: program, PGY level, trainee type, user type (residents only, faculty only, or both), date range. Output: program name, resident name, user type, trainee level, trainee type, number of clinics, clinic names.

### Faculty-Resident Shift Overlap Report

Shows shift overlaps for faculty and residents to see who is scheduled at the same time. Filters: date range, programs. Output: faculty, shift, shift date, work period, resident slots, unique residents, residents worked with.

### Requested Absences Report

Summarizes absence requests by program. Filters by absence type (vacation, sick days, away conferences, LOAs) and status (pending, approved, rejected). Output: resident name, program, absence type, status, dates.

### Resident Absence Summary

Displays all recorded absences by trainee. Filters: date range, weekend exclusion, institutional holiday exclusion, sort (last name or level), LOA display format (total/paid/unpaid or LOA type). Output: resident name, level, employee ID, vacation, away conference, LOA breakdown.

**Important:** The LOA Display filter controls how LOA data is broken down. Selecting "Total/Paid/Unpaid" aggregates all LOA types into three columns and does not show custom LOA reason types (e.g., "Other Leaves of Absence"). To see the full breakdown by LOA reason, select "LOA type" instead. This is a frequent source of support questions when clients add custom LOA reasons and expect them to appear in the default report view.

### Resident Assignments by Program

Exports trainee schedule information over a date period grouped by program, showing service, location, assignment dates, and absences.

### Resident Rotations Report

Provides rotation schedule information with extensive filtering. Filters: program(s), trainee level, trainee type, date range, site(s), service(s), sort (resident or rotation/date), display options (released rotations, visiting residents, remove absences from day count). Output: program, trainee name, type, level, employee ID, service, site, start/end date, days. Note: to view released trainees, select the original program, not the program they were released to.

**Output formats:** HTML, XLS, XLSX, Text (Tab, Comma, or Pipe Delimited).

### Resident Scheduled Activities Summary

Provides per-resident counts of on-site calls, home calls, clinics, vacation days, sick days, away conferences, and LOA days. Filters: program, level, trainee type, date range.

### Resident Scheduling Errors

One of the most essential error-checking reports in MedHub. Checks master rotation schedules for gaps and overlaps requiring corrective action before the monthly lockout. Must be run monthly by all program administrators prior to lockout. Filters: program list (filterable for ACGME/non-ACGME), resident level, type, date range, sort, show warnings.

Report output distinguishes errors (require corrective action) from warnings (may require action). Errors include: undefined activity on schedule, activity scheduled before start date, activity scheduled after end date. Warnings include: absence on same day as continuity clinic, multiple clinics on same date, potential duplicate clinic/alternate activity, missing primary service for overlap, absence on same day as CC/AA.

**Note on clinic overlap warnings:** Programs using service-based clinics (which auto-schedule all residents assigned to a service into the associated clinics) will commonly see clinic overlap warnings. These fire even when the overlap is intentional -- the report does not distinguish between intended and unintended overlaps. Administrators should evaluate these warnings in context rather than treating them all as errors.

### Schedule Details

Displays all scheduling configuration settings by program: schedule settings, rotation periods, service settings (name, group, type, float/jeopardy, slots, shift/call view, primary site, scheduling method, standard hours), shift/call settings (name, abbreviation, type, site, call, populate work hours, autogeneration, slots, work periods, team structures, access).

### Service Activity by Rotation

Summarizes service activity by rotation across all trainees. Filter options: all residents, in-program/in-house only, in-program & visitors only, academic year.

### Service Activity by User

Summarizes user activity by trainee or faculty. Filters: users (trainees only, faculty only, or both), resident level, resident status (active, current, all), date range, sort.

### Service Key Exception Report

Identifies service differences between two academic years -- new services, dropped services, or services where the site changed.

### Site Contract Report

Summary of contracts loaded to the Site List. Display options: latest contract, all contracts, site addresses, location, program, end date.

### Site-Based Activity Report

Lists scheduled activity by site for GME users. Does not check for overlapping activity -- should not be used for FTE calculation or billing. Filters: program, trainee level, user type, site/cost reports, date range. Activity types: service/rotation, shift/on-site call, clinic, home call. Additional info: employee ID, pager, email, MedHub ID. Display options: one row per activity, one row per activity and site, group by site, split shifts/calls that cross midnight.

* * *

## Cross-References

Related Page

Relationship

Scheduling

Core feature doc covering master rotation schedule, services, rotation periods, shifts/calls, clinics

Absences

Absence types, approval workflows, and configuration that feed absence reports

Institutional Release

Visiting/released trainee scheduling that appears in rotation reports

Scheduling - Qgenda Interface

QGenda schedule imports that populate rotation and shift/call data

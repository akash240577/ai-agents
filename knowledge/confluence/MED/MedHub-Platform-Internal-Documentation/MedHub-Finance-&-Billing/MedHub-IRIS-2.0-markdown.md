# MedHub - IRIS 2.0 - markdown

# MedHub - IRIS 2.0

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## 1\. Why IRIS exists \[GME\]

Teaching hospitals in the United States receive government reimbursement for the costs of training residents. This reimbursement comes in two forms: **Indirect Medical Education (IME)** payments, which compensate for the higher operating costs of being a teaching hospital (e.g., patients with more complex conditions, residents ordering additional tests), and **Direct Graduate Medical Education (DGME)** payments, which cover the direct costs of residency programs (salaries, benefits, administrative overhead).

To claim these payments, hospitals must submit standardized data files to the **Centers for Medicare and Medicaid Services (CMS)** as part of their annual Medicare cost report. These files are called **IRIS (Intern and Resident Information System)** submissions. An IRIS submission contains a list of every resident trained at the hospital during the cost reporting period, along with their assignment records showing where and when they trained. CMS uses this data to calculate Full Time Equivalent (FTE) counts, which determine reimbursement amounts.

**The stakes are enormous.** A single IRIS file rejection can delay or jeopardize reimbursement worth $50 to $145 million per institution per year. CMS validates submitted files against strict formatting and data quality rules, and uses IRIS data across all providers to detect duplicate claims — situations where two hospitals claim reimbursement for the same resident during the same time period. A third-party contractor (Myers and Stauffer LC) reviews all IRIS duplicates.

As of October 2021, CMS requires all IRIS submissions to use the **XML format**, replacing the legacy DBF file format. CMS retired the IRISv3 and IRISEDv3 applications and no longer provides its own software for creating IRIS files — hospitals are expected to use third-party vendor software. MedHub is one of the vendors on CMS's confirmed compatibility list.

### Key CMS rules

*   A hospital cannot claim time spent by residents training at another freestanding hospital (except subunits).
    
*   In a normal 12-month cost reporting period, no individual may be counted as more than 1.0 FTE.
    
*   Hospitals must coordinate IRIS submissions so no resident is claimed at more than 100% for the same time period across providers.
    
*   XML files follow a naming convention: `######_YYYY-MM-DD.xml` where `######` is the provider ID and `YYYY-MM-DD` is the fiscal year end date.
    
*   IRIS files are submitted to the institution's Medicare Administrative Contractor (MAC) alongside the cost report.
    

* * *

## 2\. MedHub's role \[GME\]

MedHub's IRIS 2.0 module produces CMS-compliant XML files by integrating data that would otherwise need to be assembled from multiple separate systems: resident demographics (SSN, medical school, graduation date, ECFMG certification), training history (program, level, IRP designation, residency codes, appointment type), and schedule assignments (services, shifts, clinics, absences — all tied to sites with IME/DME percentages and cost report associations).

This integration is MedHub's primary advantage over competitors for IRIS: the system already has all the data needed to build the file because it manages the residency program's operations. Clients do not need to import data from external HR systems, scheduling tools, or spreadsheets.

### Who uses IRIS 2.0

The primary user is the **Hospital Finance** role. Hospital Finance users access IRIS 2.0 from the Administration menu. GME Office users manage the upstream configuration (sites, programs, training history, schedules) that IRIS 2.0 depends on, but typically do not interact with the IRIS module directly.

### IRIS 2.0 vs. IRIS 1.0

IRIS 2.0 replaced the original IRIS module (released October 2022). Key differences: IRIS 2.0 supports the CMS XML format (required for all cost reports with fiscal year beginning on or after October 1, 2021), allows multiple cost reports within a single data set (eliminating the need for separate data sets per cost report), and includes significant UX improvements. IRIS 1.0 remains accessible for historical data sets but should not be used for new runs.

* * *

## 3\. IRIS 2.0 data set lifecycle \[GME\]

The workflow for producing an IRIS submission follows a defined sequence. Each step must complete successfully before the next.

### 3.1 Create a data set

Hospital Finance > IRIS 2.0 > **Add Data Set**. Define a name (recommended convention: identify the fiscal year and purpose), start date, and end date. The date range cannot exceed 365 days (366 in a leap year). Include non-reimbursable programs or trainees only for headcount/FTE reporting purposes — never for actual IRIS data set submissions.

### 3.2 Run the pre-test

Click the **Errors/Warnings** link under the Pre-Test column, then click the green **Run** button. The pre-test identifies demographic and scheduling issues that must be corrected before generating the data set. A pop-up notification appears when complete. To refresh after corrections, click **Rerun Pre-test**.

All errors must be resolved before generation. Warnings should also be reviewed — they may not prevent generation but can impact data accuracy, audit outcomes, and FTE numbers. Users can enter notes on individual errors/warnings, and warnings can be discarded if confirmed valid.

See §6 for the complete list of pre-test codes.

### 3.3 Generate the data set

Click **Generate** to build the data set. Generation reads every resident's demographics, training history, and schedule assignments for the date range and compiles them into master records and assignment records. For large institutions with thousands of residents, this process can take significant time and generates potentially hundreds of thousands of rows.

If data changes are made after generation (schedule edits, demographic corrections, site updates), the data set must be **Regenerated** to reflect those changes. The Run Date column shows when the data set was last generated.

### 3.4 Run the post-test

Navigate to the **Prepare File** link under the IRIS Report column, then go to the **Post-Test** tab. The post-test runs in the background (you can leave and return). A pop-up notification and an Urgent Task alert you when complete.

The post-test validates the generated data set for issues that would cause CMS to reject the file. All issues must be addressed before exporting. The post-test results can be exported via the **Export All Errors** button.

See §7 for the complete list of post-test checks.

### 3.5 Review in Data Browser

Use the **Data Browser** (under Actions) to review FTE summaries before exporting. The Data Browser provides multiple views of the generated data broken down by cost report, program, site, and individual trainee.

See §8 for Data Browser views.

### 3.6 Review and update data

The **Update Data** tab allows direct edits to assignment records after generation. However, MedHub strongly recommends correcting data at the source (demographics, training history, schedule) and regenerating. Manual edits in Update Data only affect the current data set — if the data set is regenerated, manual changes are overwritten. Manual updates can also cause discrepancies between the IRIS submission and MedHub's source data.

### 3.7 Export the XML file

Go to the **Export XML** tab. Select a cost report from the dropdown — IRIS 2.0 allows institutions to run IRIS reports for multiple cost reports within the same data set. Click to generate the XML file. The system creates the file with the CMS-required naming convention (provider ID + fiscal year end date). Generated XML files are listed with date, time, and cost report details. Click **Download** to retrieve the file.

The XML file can be converted to XLS for review: open a blank Excel file, go to Developer Tab > Import > select the XML file.

### 3.8 Lock the data set

Final data sets used for CMS submission should be **locked** (Actions > Lock) to prevent accidental regeneration. Reporting remains accessible on locked data sets. To unlock, use Actions > Unlock.

### 3.9 Inactivate old data sets

Use Actions > **Inactivate** to remove completed data sets from the default view. View inactive data sets using the "View Inactive" radio button. Reactivate via Actions > Activate.

* * *

## 4\. Upstream configuration \[GME\]

IRIS 2.0 depends on data from several MedHub modules. Errors in upstream configuration are the most common cause of pre-test failures and incorrect FTE calculations.

### 4.1 Resident demographics and training history

Key fields consumed by IRIS:

*   **SSN** — required, validated for format (9 digits, specific rules for US and Canadian SINs).
    
*   **Medical school** — 5-digit IRIS code. Code 99998 = foreign dental school, 99999 = foreign medical school. Inactive schools with inactivation dates now trigger pre-test warnings if the trainee's graduation date is after the inactivation date (MED-276, MEDM-9912).
    
*   **Graduation date** — must precede residency start date.
    
*   **ECFMG certification** — required for foreign medical graduates (school code 99999 only, not 99998/foreign dental). Issue date must be after graduation but before first training assignment start date.
    
    *   If a resident has multiple ECFMG records with different values, the system sends an automated alert email to [support@medhub.com](mailto:support@medhub.com) with subject "Warning: Multiple ECFMG values exist for single resident" — multiple records cause duplicate rows in the IRIS 2.0 Data Download. See Demographics — Resident for ECFMG field configuration details.
        
*   **Training history** — each record includes program, level, dates, appointment type (in-house or visitor), and IRIS-specific fields: residency code, IRP designation, simultaneous match code, reimbursable status.
    
*   **Initial Residency Period (IRP)** — exactly one training record must be marked as the IRP. The IRP record's residency code determines the number of years the resident receives unweighted DGME FTEs (the IRP limit). This is the single most important field for reimbursement calculations.
    
*   **Displaced resident flag** — indicates the resident qualifies for a temporary FTE cap adjustment (e.g., due to program closures or COVID).
    
*   **Employer** — for visitors using the in-line method, the employer value comes from the training history record's hospital/employer field (MED-459, MEDM-9709).
    

### 4.2 Program list

Each program has IRIS-relevant settings:

*   **Default IRIS code** — 4-digit residency code, auto-populated into new training history records.
    
*   **IRIS reimbursable** — whether the program's residents should be included in IRIS for reimbursement. Non-reimbursable programs should only be included for headcount/FTE reporting.
    
*   **Orientation period** — enables orientation date calculations that can extend the appointment percentage window by up to 8 days.
    
*   **New program designation** — marks the program as qualifying for the CMS exception to rolling average rules, with start/end dates.
    
*   **New program IME exceptions** — when applicable, works with the new program designation. Options: IPF, IPPS, or IRF.
    
*   **Default site** — the site used for reimbursement when no specific site is assigned (e.g., during vacation or LOA).
    

### 4.3 Site list

Sites define the locations where training occurs. Each site has IRIS-critical properties:

*   **Site type** — Internal, Offsite - Affiliated, or Offsite - Non-affiliated.
    
*   **Site designation** — new in IRIS 2.0, required by CMS. Options: None, IRF (Inpatient Rehabilitation Facility), IPF (Inpatient Psychiatric Facility), or NHL/NPS (Non-Hospital Location / Non-Provider Site).
    
*   **Cost report** — each site is tied to a cost report, which groups sites for a specific provider's reimbursement submission. Institutions with multiple hospitals (and therefore multiple CMS provider numbers) need multiple cost reports.
    
*   **IME percentage** — 0% or 100%. Whether the provider can claim IME reimbursement for time at this site.
    
*   **DME percentage** — 0% or 100%. Whether the provider can claim DGME reimbursement for time at this site.
    
*   **NHL/NPS site handling** — NHL/NPS sites require special cost report handling. The user can select a specific cost report for the site or use the resident's program default site for cost reporting.
    
*   **Program restrictions** — sites can be open to all programs or restricted to specific ones.
    

The **institutional default site** is used when no specific site is assigned during a period (e.g., vacation, LOA). This site should be the institution's primary hospital and fully reimbursable (100% IME, 100% DME).

### 4.4 Scheduling

IRIS requires complete schedule coverage for every day of each resident's training history during the data set period. The schedule drives the assignment records in the XML file.

*   **Services (rotations)** — the primary schedule layer. Every day must have a service assignment. When services overlap, one must be designated as **primary** for IRIS.
    
*   **Shifts and calls** — more granular than services, tied to specific sites. Each shift can span multiple days (e.g., 24-hour shifts).
    
*   **Clinics** — similar to shifts but not academic-year-specific. Multiple clinic assignments on the same day must not exceed a full day of work.
    
*   **Absences** — vacation, sick leave, LOA. LOA time is generally assigned to the institutional default site. LOA with "Training Extension Days" sets the appointment percentage to 0%, stopping the IRP clock.
    

* * *

## 5\. FTE calculations \[GME\]

IRIS submissions do not record FTE counts directly. They record residents and their assignments. CMS calculates FTE counts from that data. MedHub's Data Browser replicates these calculations so users can verify numbers before submission.

All FTE calculations use high-precision floating-point arithmetic. Rounding is only applied when displaying final results (to six decimal places). Intermediate values and aggregates are never rounded.

### 5.1 IME FTEs (IPPS, IRF, IPF)

The IME FTE contribution of a single assignment is:

**IPPS IME FTE = timePercentage × imePercentage × (days in assignment / days in cost reporting period)**

IPF and IRF use the same formula, substituting `imePercentage` with `ipfDpuPercentage` and `irfDpuPercentage` respectively.

Note: IME FTEs are based on the length of the cost reporting period, so a single resident can theoretically contribute 1.0 FTE in a short cost reporting period.

### 5.2 DGME FTEs

**Unweighted GME FTE = timePercentage × gmePercentage × ASSIGNMENT\_DURATION**

**Weighted GME FTE = Unweighted GME FTE × GME\_WEIGHT\_FACTOR**

Exception: international dental residents (medical school code 99998) always receive zero weighted and unweighted GME FTEs.

**ASSIGNMENT\_DURATION** = days in assignment / 365 (or 366 if the cost reporting period contains February 29). DGME FTEs are based on calendar years, not the cost reporting period — so for long cost reporting periods (e.g., 13 months), a single resident can contribute more than 1.0 GME FTEs.

**GME\_WEIGHT\_FACTOR** is either 1.0 or 0.5:

*   If `residencyYearsCompleted` ≥ the IRP limit for the resident's `initialResidencyPeriodCode`, the weight factor is **0.5** (weighted/reduced reimbursement).
    
*   Otherwise, the weight factor is **1.0** (full reimbursement).
    

**Bonus years:** If the assignment's residency type is geriatric, preventive medicine, or child neurology, the approved residency length is increased by 2 years for weighting purposes (per 42 CFR 413.79). The bonus period starts from the earliest assignment begin date with a qualifying residency code and lasts exactly 24 months minus 1 day. Bonus years are evaluated per assignment and can cause unweighted reimbursement to exceed the normal limit. The bonus year calculation looks across all assignments for the resident across all years and providers.

### 5.3 Residency years completed calculation

The residency years completed value (`residencyYearsCompleted`) determines whether the GME weight factor is 1.0 or 0.5. MedHub calculates this during data set generation using the following algorithm:

1.  Find the resident's IRP training history record (exactly one must exist).
    
2.  Determine the IRP residency code (use simultaneous match code if it exists, otherwise the IRIS residency code).
    
3.  Check for orientation date exemptions (0–8 additional days).
    
4.  Look up the IRP limit for the residency code.
    
5.  Walk forward from the IRP start date, summing appointment percentages across training history records, accounting for LOAs (which can reduce appointment percentages).
    
6.  Determine when the resident is no longer eligible for full reimbursement based on the IRP limit.
    

If no IRP record exists, the resident generates an error and is excluded from the Residency Year Calculations report.

### 5.4 FTE subcategory breakdowns

Assignments are further categorized into subcategories for specific cost report lines: allopathic/osteopathic, dental/podiatry, primary care (including OB/GYN), new program, displaced resident, provider site vs. non-provider site. These breakdowns use boolean flags from the residency type codes reference table combined with the IME and GME FTE values calculated above.

* * *

## 6\. Pre-test errors and warnings \[GME\]

The pre-test identifies issues before generation. Codes follow the format `TYPE-SEVERITY##` (e.g., DEMO-E01 = Demographics Error 01, SCHED-W03 = Scheduling Warning 03). Errors must be resolved; warnings should be reviewed.

Pre-test warnings can be set to auto-ignore via the root setting `iris_pretest_ignore_codeA` (defaults to "SCHED-W03" for all institutions).

### Demographics errors

Code

Message

Description

DEMO-E01

First/Last Name blank or invalid characters

Names cannot be blank or contain special characters

DEMO-E01

Invalid or blank SSN

SSN must be 9 digits, numeric, and pass format rules (cannot start with 000, 666, or 9; middle group cannot be 00; last four cannot be 0000)

DEMO-E01

Invalid Canadian SIN

Canadian SIN must pass Luhn checksum

DEMO-E02

Invalid or blank Residency Specialty Code

Residency code must be valid alphanumeric or blank

DEMO-E03

No overlapping home-institution training record for visitor

Visitor must have an overlapping home-institution training history record

DEMO-E03

Employer name for home hospital not defined for visitor

Visitor's training history must have a valid hospitalID

DEMO-E04

IRP not assigned or multiple assigned

Exactly one training record must be marked as IRP

DEMO-E04

Residency code not defined in lookup table

IRP record's residency code must exist in the IRIS residency codes table

DEMO-E04

Invalid IRP Code

IRP record's code is flagged as IRP-ineligible

DEMO-E05

Invalid Simultaneous Match Code

Simultaneous match code is flagged as not simultaneous-eligible

DEMO-E06

Overlapping training history date periods

Training history records have overlapping dates

DEMO-E07

No Medical/Dental School recorded

Missing graduation record

DEMO-E07

Missing graduation date

No graduation date recorded

DEMO-E07

Graduation date after residency start date

Graduation must precede training

DEMO-E07

Invalid medical school code

School code not found in IRIS medical schools lookup

DEMO-E07

Foreign Certification Date Required

ECFMG required for school code 99999 but missing

DEMO-E07

Incorrect Foreign Certification Date

ECFMG date is after resident training start

DEMO-E08

ECFMG Issue Date required

Missing ECFMG issue date

DEMO-E08

ECFMG Issue Date before Graduation Date

ECFMG date must be on or after graduation (per MEDM-7261, same-day is now invalid)

DEMO-E08

ECFMG Issue Date after Institution Start Date

ECFMG date after first training history record at institution

DEMO-E09

Reimbursable training history records before IRP date

Training records exist before the IRP start date

### Demographics warnings

Code

Message

Description

DEMO-W01

Duplicate SSN

At least one other resident account has the same SSN

DEMO-W01

Valid but suspicious SSN

Sequential digits, all repeating, or known-invalid SSNs (e.g., 078-05-1120, 987-65-4320 through 987-65-4329)

DEMO-W02

Date gap in training history

Gap between consecutive training history records

DEMO-W03

Medical/Dental School degree blank

Missing degree field

DEMO-W05

Partial appointment

Appointment percentage < 100% for a training period

DEMO-W06

Deprecated residency code

Residency code name contains "Obsolete", "Use code", or "Reserved For Future Use"

DEMO-W06

Deprecated medical school code

School name contains deprecated indicators, or school is marked inactive with inactivation date before trainee's graduation date (per MEDM-9912)

DEMO-W07

School/training gap

More than 3 months between medical school graduation and first training record

DEMO-W08

Multiple Med School records

Multiple medical school records exist for the resident

### New pre-test checks (from Jira — MED-512, MEDM-10115/10119/10124/10128/10133/10497)

Type

Message

Description

Warning

Simultaneous Match configured with same IRP Code and Specialty/Residency Code

Both codes are identical — CMS requires different codes

Warning

Alternate IRP configured with same IRP Code and Specialty/Residency Code

Same as above for Alternate IRP

Warning

Trainee does not have Simultaneous Match or Alternate IRP configured; Specialty/Residency Code requires one

Residency code is marked "Simultaneous Match/Alt IRP Required" but none is configured

Warning

Trainee has Simultaneous Match or Alternate IRP configured with non-IRP Year 1 Specialty/Residency Code that cannot be used

IRP code is Simultaneous Match eligible but Specialty code is not broad-based or preliminary

Warning

Trainee has Alternate IRP configured with non-IRP Year 1 Specialty/Residency Code that cannot be used for Alternate IRP

IRP code is Alternate IRP eligible (only), but Specialty code is not preliminary

Warning

Simultaneous match/alternate IRP configured for a training history record that is not designated as IRP

Configuration exists on a non-IRP record. Triggers for both in-house and visiting trainees. Checks all trainees in the data set regardless of whether their IRP record overlaps the data set dates. Issue type: Demographics.

### Scheduling errors

Code

Message

Description

SCHED-E01

Activity definitions with undefined site

Service, clinic, or shift/call definitions have no site assigned (when site locking is enabled)

SCHED-E02

Exactly one primary service not designated for overlap

When services overlap, one must be marked primary

SCHED-E03

Days of undefined activity

Some days have no schedule coverage

### Scheduling warnings

Code

Message

Description

SCHED-W01

Activities scheduled before/after training

Rotations, clinics, or absences scheduled outside training history dates

SCHED-W02

Potential duplicate clinic

Possible duplicate clinic on same day

SCHED-W02

Three or more clinics on same day

May exceed a full day of work

SCHED-W02

Absence on same day as active clinic

Overlapping absence and clinic

SCHED-W03

Vacation/sick day does not overlap a recorded service

Disabled by default (`iris_pretest_ignore_codeA` = "SCHED-W03")

SCHED-W04

Multiple clinics scheduled for over a full day

Clinic hours exceed a full day

SCHED-W05

LOA day does not overlap a recorded service

LOA day outside a service assignment

SCHED-W06

Away conference day does not overlap a recorded service

Conference day outside a service assignment

* * *

## 7\. Post-test errors \[GME\]

The post-test validates the generated data set before XML export. Unlike the pre-test, post-test errors do not have distinct severity levels in the UI (though the code supports them). Post-test checks operate on the generated IRIS data — correcting source data requires regeneration for changes to take effect.

### Demographic errors

Required fields: First Name, Last Name, Employer, Residency Type Code, Residency Year, Medical School Code, Provider Number, Medical School Graduation Date, Fiscal Year Start, Fiscal Year End. Blank values or MySQL zero-dates ('0000-00-00') trigger errors.

SSN validation (less aggressive than pre-test): checks for fewer than 10 digits or missing. ECFMG checks: issue date required for school code 99999, must be after graduation and before first assignment. Non-foreign graduates should not have ECFMG dates (note: this check applies for 99999 only; 99998 school codes will incorrectly trigger this error).

### Assignment errors

Required fields: Provider Number, Fiscal Year Start, Time Percent, IME Percent, GME Percent, Assignment Residency Year, Assignment Residency Type, Assignment Begin Date, Assignment End Date.

Validation: end date before start date, start date before fiscal year start, end date after fiscal year end. Percentage values must be 0–100, numeric. IME Percent cannot exceed GME Percent.

### Other post-test checks

*   **Master/assignment mismatches** — assignment records without matching master records or vice versa; assignment residency years implausibly out of range from master record.
    
*   **Duplicate SSNs** — checked against IRIS data set (not live demographics).
    
*   **School graduation date after first assignment** — checked against IRIS data set.
    
*   **Invalid school codes** — checked against lookup table.
    
*   **Invalid IRP and assignment residency codes** — checked against lookup table.
    
*   **Invalid characters in text fields** — checks for `:;<>^!\\"{}[]|+\`~\` in name, employer, provider number, medical school, and residency code fields. Special characters in IRIS files can cause CMS to reject the submission outright.
    
*   **Inconsistent provider** — identifies residents not using the most common provider number / fiscal year grouping in the data set.
    
*   **Assignment overlap** — overlapping date ranges within the same user/cost report.
    
*   **Non-reimbursable warnings** — residents with no reimbursable assignments.
    

* * *

## 8\. Data Browser \[GME\]

The Data Browser provides interactive FTE summaries for a generated data set, organized by cost report.

### Summary view (default)

Shows IME, DME, and DME Net FTEs by program for the selected cost report.

### IME view

Expands to show Indirect Medical Education time claimed by program and by site.

### DME view

Expands to show Direct Medical Education time claimed by program and by site.

### Weighted DME view

Shows weighted Direct Medical Education time by program and by site.

### Total FTE view

Shows all FTE time to all sites — both claimed and unclaimed — for the selected cost report.

### Per-trainee drill-down

Click **View All Trainees** at the bottom. Click a program name, then a trainee name to see detailed information: training history, scheduling, and FTE by site. Schedule information is displayed by calendar month (regardless of actual rotation dates) and offers three views:

*   **All Data** — summary row plus detail rows for all assignment records relevant to the selected cost report.
    
*   **IRIS Records** — summary rows only (what populates the assignment file).
    
*   **Details** — detail rows only (without summary).
    

Claimed time (per the selected cost report) displays in **bold**; unclaimed time displays in light gray.

* * *

## 9\. External reports and XML export \[GME\]

From the **Prepare File** view, the **External Reports** tab provides several reports:

### Data Download

The most comprehensive export from a specific IRIS run. Can be filtered to a specific cost report or include all. This is the same report accessible via Actions > Data Download (see §10) — the External Reports version offers a cost-report filter.

The Data Download includes 76 columns covering resident demographics, training history, assignment details, site information, and FTE calculations. Key columns include: trainee name, SSN, medical school code/name/graduation date, ECFMG data, displaced trainee flag, Medicare reimbursable status, trainee category (in-house/visitor), IRP code and start date, current residency code and program, appointment percentage, activity details (type, name, site, dates, percentages), and annualized/reporting-period FTEs broken down by Total, IRF, IPF, NHL/NPS, DME, and IME — each with both annualized and reporting-period variants, plus weighting factors.

For a complete column-by-column reference, see the IRIS 2.0 Guide (vendor documentation).

### IRIS Rotations

Complete list of assignment records within the data set, filterable by cost report.

### IRIS Rotation Details

More granular view of assignment records, filterable by cost report.

### Residency Year Calculations

Shows how the system calculated the `residencyYearsCompleted` value for each trainee. Only trainees with a record in the residency years completed table appear — if a trainee is missing, they likely have no IRP record (which would generate a pre-test error).

### Reference Lists

Complete list of programs, sites, and cost reports as configured when the data set was generated. Used for audit purposes.

### XML Export

Select a cost report from the dropdown to generate the XML file. IRIS 2.0's ability to run for multiple cost reports within one data set eliminates the need for separate data sets per provider — a major improvement over IRIS 1.0. Downloaded files use the CMS naming convention.

* * *

## 10\. Actions \[GME\]

The Actions menu on the IRIS 2.0 data set list provides:

*   **Lock** — prevents regeneration of final data sets. Reporting remains accessible via Actions > Reports.
    
*   **Unlock** — reverses a lock.
    
*   **Inactivate** — removes data sets from the default list view. Use "View Inactive" to see them. Reactivate via Actions > Activate.
    
*   **Reports** — access to the Data Browser and Data Download (the same Data Download described in §9, but without the cost-report filter — it returns all data across all cost reports).
    

* * *

## 11\. Glossary \[GME\]

Term

Acronym

Meaning

Intern and Resident Information System

IRIS

CMS-owned information system. Also refers to the MedHub module that produces these files.

Centers for Medicare and Medicaid Services

CMS

US government entity that collects IRIS files and administers Medicare/Medicaid reimbursement

Direct Medical Expenses

DME / DGME

Direct costs of hosting residents: salaries, benefits, administrative costs

Indirect Medical Education

IME

Indirect costs of being a teaching hospital: higher patient acuity, additional testing

Inpatient Psychiatric Facility

IPF

Site designation for psychiatric units

Inpatient Rehabilitation Facility

IRF

Site designation for rehabilitation units

Non-Hospital Location / Non-Provider Site

NHL / NPS

Site designation for clinical locations that are not hospitals

Full Time Equivalent

FTE

The unit of measurement for reimbursement calculations

Initial Residency Period

IRP

The training record that establishes the resident's specialty and reimbursement clock

Cost Report

CR

Groups sites for a specific provider's Medicare reimbursement submission

Medicare Administrative Contractor

MAC

The entity that receives IRIS file submissions (currently Noridian for most providers)

* * *

## Settings appendix

> **Source of truth for root setting current values.** For the most current information on any setting, the canonical source is `support.medhub.com > Lists > Settings`.

Setting

Type

Description

`iris_pretest_ignore_codeA`

String

Pre-test warning codes to auto-ignore (default: "SCHED-W03")

`setting_sitelock`

Integer

Enable site locking (affects SCHED-E01 pre-test check)

`setting_sitelock_siteID`

Integer

Default site for new activities when site locking is enabled

`settings_visitors_method`

Integer

Visitor method: 1=in-line (PG\_APPT), 2=overlap (SPT). Affects how visitor employer values and training history are handled in IRIS

# MedHub - Reports - Demographics - markdown

# MedHub - Reports - Demographics

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

> **Scope.** This document covers the **Demographics Reports** category only. MedHub has 200+ reports across many categories; each functional category will get its own child page under **MedHub - Reports**. This page is the demographics-specific reference.

## Overview

The Demographics Reports category contains the canonical reports used by GME Office, Program Administrators, Student Administrators, and Course Coordinators to extract trainee, faculty, and student information for institutional reporting, compliance, finance, and ad-hoc analysis. The most-used report in this category — **Ad-Hoc Resident Demographics** — is also one of the most ticketed reports in MedHub. Understanding how the Resident Status filters interact with the time-specific data points is the key to using these reports correctly.

This document covers the Demographics Reports category in depth: the Ad-Hoc Resident Demographics report (its filters, how each Resident Status interacts with time-specific data, the 2023 logic update, the field-by-field behavior); the Ad-hoc Faculty Demographics report; the Resident Roster, Resident Transition, Demographics - Required Fields, Certifications/Licenses, and Orientation reports; how Required Fields validation works; how degree fields and the Alternate First Name flow into reports; and the operational patterns that come up when these reports return unexpected data.

It does not cover: the underlying demographics data model (see **MedHub - Demographics — Resident**, **MedHub - Demographics — Faculty**, **MedHub - Demographics — Student**); training history record mechanics that drive most of these reports (see **MedHub - Training History**); evaluation reports, scheduling reports, conference reports, work hours reports, or other report categories — those will be in their own child pages of **MedHub - Reports**.

## Where these reports live

Demographics Reports are accessed from **Reports → Demographic Reports** (link label varies slightly by client). The category includes (the exact list visible to a user is gated by access map, but the canonical category contains):

Report

What it does

Primary user

**Ad-Hoc Resident Demographics**

Configurable per-resident report with a wide selection of demographics, training history, and licensure data points

GME Office, Program Administrator

**Ad-Hoc Faculty Demographics**

Configurable per-faculty report. Used for Core Faculty reporting via "Active Core Faculty Only" filter

GME Office, Program Administrator

**Resident Roster**

Headcount report — each Resident displays once with their current role during the report date range

GME Office, Program Administrator

**Resident Transition Report**

Movement of trainees in and out of the institution — terminations, transitions, transfers

GME Office

**Demographics - Required Fields**

Validates that required demographic fields are populated; flags errors and warnings

GME Office, Program Administrator

**Certifications/Licenses Report**

Detailed certifications and licenses including Issued date

GME Office, Program Administrator

**Orientation Report**

Onboarding-related demographics for incoming trainees

GME Office

**Resident Expiration Report**

Certifications nearing or past expiration. Limited to specific certification types (see below).

GME Office, Program Administrator

The same category on the UME side surfaces analogous student reports under the Student Administrator's Reports tab.

## The Ad-Hoc Resident Demographics Report — the most-used report

The Ad-Hoc Resident Demographics report is the configurable workhorse of the demographics category. It produces one row per trainee (with some exceptions — see the Orientation Date filter behavior below) and a configurable set of columns drawn from a wide list of demographics, training history, identification, education, certifications, and licensure fields.

The report's behavior depends critically on **two interacting choices**:

1.  The **Resident Status** filter — which determines which trainees are included
    
2.  Whether selected data points are **time-specific** (Pay Rate, Program, PGY level, Specialty, Trainee Type, etc.) or **non-time-specific** (Date of Birth, Medical School, etc.)
    

Understanding this interaction is the difference between a correct report and a confusing one.

### Resident Status filter — what each option includes

The 2/9/22 SKU update (Ticket 190969) defined these precisely:

Filter

Includes

**Active Only**

All residents who are training **today** — they have an active Training History record on their profile that includes today's date

**Active Only/Current**

All residents who are currently training **and** those who have completed training or will begin training **within 365 days**. Can include now-Inactive residents who finished within the last year

**Current**

All residents who have completed training or will begin training **within 365 days**

**Incoming**

Residents who have not yet trained at the institution and have a start date **after today**

**All Residents**

All residents who have ever trained at the institution, including those currently training

**Active During Period** (specify dates)

All residents who have training history dates that fall in the date range entered

**Institution Start Date** (specify dates)

All residents whose first in-house training history record starts during the reporting period

**Orientation Date** (specify dates)

All residents whose Orientation Date field on Training History falls in the report date range

### How time-specific data points behave per Resident Status filter

This is where most confusion happens. The 4/19/2023 logic update (AMBS-9679) changed the report's behavior for time-specific data points when certain filters are used. The current behavior:

Filter

What time-specific data the report pulls (Pay Rate, Program, PGY, Specialty, Trainee Type, etc.)

**Active** / **Active/Current** / **Current**

Current value at the time the report is run

**Incoming**

Value from the **first in-house training history record** for the trainee (the upcoming one), regardless of when the report is run

**Institution Start Date**

Value from the **first in-house training history record** that starts during the reporting period

**Orientation Date**

Value from the **next training history record after** the trainee's orientation date

**Active During Period**

Value from the **first training history record within the report date range** for that trainee. If the first record is for a program not selected in the filter, the resident is excluded from the report (see "Active During Period and program-specific filters" below)

**All Residents**

Current value at the time the report is run. Inactive residents will display "inactive" or "n/a" for time-specific values

> **Why a now-inactive resident shows blank Specialty.** When a resident finished training in the past year, they're "Current" but Inactive. Some time-specific fields (like Specialty) cannot be retrieved as "current" because the resident has no current training history. The display shows blank, "inactive," or "n/a." This is by design. To work around: use **Active During Period** with a date range that overlaps the trainee's last active training history. The Active During Period filter will pull their last recorded specialty. (Tickets 220147, 217619, AMBS-9739.)

### Active During Period and program-specific filters

A non-obvious behavior with material consequences:

> **Active During Period combined with a program filter pulls the FIRST training history record in the date range.** If that first record is for a program not selected in the filter, the resident is **excluded** from the report — even if a later record in the date range matches the selected program.

Example (Ticket 231833):

*   Report parameters: Program = Gastroenterology, Active During Period 10/01/2023 – 10/31/2024
    
*   Resident Glover Quarshie: Internal Medicine 7/1/23–6/30/24, then Gastroenterology 7/1/24–6/30/25
    
*   Glover's first training history record in the date range is Internal Medicine — so the report excludes him from the Gastroenterology results
    

To include cross-program transitioners: select **all relevant programs** or **All Programs** instead of a single program. (Ticket 231833, AMBS-10435, documented LS 3/11/2024.)

### The 2023 update for transferring trainees

A separate fix in AMBS-10639 (Ticket 232868, March 2024) updated the report to find the correct training history record when a trainee transfers TO the institution. Previously, transferred-in trainees might be excluded from Active During Period results; now the code correctly finds the in-house training history record. (AMBS-10639.)

### Orientation Date filter — duplicate entries

A current known issue (April 2026 — AMBS-22069, Ticket 263260): the Ad Hoc Resident Demographics report run with the Orientation Date filter is returning **duplicate entries** for some residents. `[VERIFY]` This is an open active bug as of the SKU's most recent update. Workaround: deduplicate manually after export, or use a different filter (Institution Start Date or Incoming).

### Recent active issues with the Ad-Hoc Resident Demographics Report

Several recent tickets have surfaced patterns worth knowing:

*   **Ticket 262754 (AMBS-21830, due 4/24/26):** Report run for "Active house staff" pulling in data for incoming house staff. `[VERIFY]` Investigation in progress.
    
*   **Ticket 262749 (AMBS-21778):** With Resident Status "All Residents" and all levels/types selected, certain Visiting Residents not appearing in the output. `[VERIFY]` Investigation in progress.
    
*   **Ticket 262697 (AMBS-21865):** When selecting Appt Type for visitors, report shows "Visiting Resident" — but Visiting Resident is not an Appt Type. Should show "Visiting Trainee." `[VERIFY]` Investigation in progress.
    
*   **Ticket 263260 (AMBS-22069, due 5/1/26):** Orientation Date filter returning duplicates (per above). `[VERIFY]` Investigation in progress.
    

> **Several of these tickets are open bugs as of the April 2026 baseline.** The intended behavior of the report (as documented in this section) is correct; the live behavior may differ until these are resolved. Always check the relevant AMBS ticket status before diagnosing a client report issue.

### Incoming filter — why some incoming residents are missing

> **The Incoming filter looks at today's date and forward.** A trainee with a 6/24 start date won't be included if you run the report on 6/30 — the start date is in the past. To capture incoming trainees whose start dates have passed but who haven't yet been activated, use **Orientation Date** with a wide date range, or **Active During Period** with a range that captures the upcoming month. (Ticket 155196, confirmed JS.)

### Specialty field — why values vary

The Specialty value is set when a training history record is created. **Of the 19 different ways training histories can be created**, some format the Specialty value as `Program Name - Level` (e.g., "Pediatrics (1)"), some format it as `Program Name`, and some pull it from elsewhere. Some of these creation paths are imports — which leaves room for MedHub's validation checks to be missed.

The result: residents in the same program may have different Specialty value formats depending on how their training history was created. (Ticket 235501, AMBS-10999.)

> **The fix per resident.** Go to GME Office → resident's training history → click Modify on the entry → click Save without making changes. This forces the Specialty value to recalculate to the standard format. After re-running the report, the resident's specialty will display correctly. (Documented LS, AMBS-10999, 4/11/2024.)

### PGY display option — calculated from medical school graduation

The "PGY" display option under "Summary Information to Include" calculates the trainee's PGY level **based on years post-graduation from medical school**, not from the training history PGY field. Example: a resident graduated in May 2018 — in March 2024, they are 5 years 10 months post-graduation, so the report calculates them as **PGY 5** (not yet 6 years).

This is by design (Ticket 233900, AMBS-10690, documented LS 3/5/2024). When you need the actual training history PGY level, use a different display option that pulls from training history.

### Certification fields — Issued date is missing

> **A known gap: the 'Issued' date is left out of the Medical License information** when the "All Certifications" option is selected. The Certifications/Licenses report contains logic to include this field — use that report instead when Issued date is needed. No plans to change the Ad-Hoc report due to update complexity. (Ticket 241387, AMBS-11828, 8/26/2024.)

### Other Ad-Hoc Resident Demographics field behaviors

*   **Cost Center field is not currently a feature** of the Ad-Hoc Resident Demographics report. Adding it requires an enhancement request. (Ticket 172864, confirmed Neeraj Gupta 6/2/21.)
    
*   **Associate Program Director field is not available.** Workaround: use the Residency Program Directory or the Bulk Email Tool to filter by APD. There are no settings to control which fields are available on the report. (Ticket 213756, AMBS-9351, 3/6/2023.)
    
*   **Tracks filter requires** `setting_program_track` enabled AND the institution must have set up "Combine with Program" feeder programs in the Program List. Originally part of custom development for another client; allows feeder program reporting (e.g., Preliminary Medicine-Dermatology). (Confirmed TM.)
    
*   **"Paid by" filter requires** `payedbyFlag` root setting. The list is populated by a developer (no interface to manage). When enabled, a "Paid by" menu appears within individual training history records. (Ticket 83958, confirmed BS.)
    
*   **License field — when two licenses have the same expiration date** ("Current/Last License (separate fields)"), the report pulls the **first license listed**. (Confirmed TM.)
    
*   **Custom fields:** Custom fields named `custom_text` or `custom_date` (with a number) appear in both the batch demographics import wizard and the Ad-Hoc Resident Demographics report — as long as one of them is added and active. Inactivating removes them. The pre-existing hard-coded fields cannot be removed. (Ticket 231482, AMBS-10390, AMBS-6516.)
    
*   **Alternate First Name** is used on evaluation forms, selectable dropdowns, and the Ad-Hoc Resident Demographic Report. **Not designed for other reports or pages.**
    
*   **Display Suffix vs Display Degree (suffix) vs Degree (Name) vs Medical/Dental Degree** — four distinct fields drawn from different demographics tabs:
    
    *   **Display Suffix** — pulls from change name field "suffix"; only impacts the resident's name display
        
    *   **Display Degree (suffix)** — pulls from change name field "Degree (suffix)"; only impacts name display
        
    *   **Degree (Name)** — also pulls from change name field "Degree (suffix)"; displays in the report under the resident's name in its own field
        
    *   **Medical/Dental Degree** — pulls from Education tab "Degree" field (if marked as graduated); displays under the resident's name in its own field
        

### Excel export and special characters

> **Excel export shifts data to the right when special characters are in demographics fields.** A colon (`:`) in an address field, for example, will misalign the row. The Ad-Hoc report was not designed to handle special characters in this output format. Three options:
> 
> 1.  Remove special characters from demographics fields
>     
> 2.  Generate the report in HTML instead of Excel
>     
> 3.  Manually clean the Excel output after generation
>     
> 
> (Ticket 173876, confirmed Neeraj Gupta 6/10/21.)

### Excel export — colons in name field

A specific case: the name field with `:DO:` or `:MD:` (colons surrounding the degree) causes the Ad-Hoc report to return blank cells and out-of-place cells. Remove the colons (Full Name reads `MD` or `M.D.` only) and the report runs as expected. (Ticket 215544, JW 3/20/23.)

## The Ad-Hoc Faculty Demographics Report

The Faculty equivalent of the Ad-Hoc Resident Demographics report. Configurable per-faculty report with status filters and column selections.

### Core Faculty reporting

The most distinctive use of the Ad-Hoc Faculty Demographics report is **Core Faculty reporting**:

1.  Reports → Demographic Reports → **Ad-hoc Faculty Demographics**
    
2.  **Status Filter** → **"Active Core Faculty Only"**
    
3.  The report shows a `[T]` (for "Teaching") next to each Core program in the results
    

This is the canonical way to report on Core Faculty designation per program. The `[T]` indicator only displays when `setting_faculty_teaching` is enabled.

(See **MedHub - Demographics — Faculty** §"Core Faculty designation" for setup detail.)

### Recent bug status

> **Ad-hoc Faculty Demographics has the most recent bugs of any report in the category as of the April 2026 baseline.** However, **the Confluence documentation is spot-on for how the report is INTENDED to work** — the documented behavior reflects the design, even where the live behavior may differ due to in-flight bugs. Use the documented behavior as the source of truth when troubleshooting; check the relevant AMBS ticket status for live state. `[VERIFY]` specific bug list with Emma when reachable.

## The Resident Roster Report

The Resident Roster is a headcount report. Each resident displays **once** with their current role during the report date range — even if they had multiple roles in that range. Most institutions use this for:

*   Annual headcount snapshots
    
*   GMEC presentations
    
*   Quick PGY-level distribution checks
    

(Confirmed TM.)

> **The Resident Roster will NOT pick up multiple training history records for one resident in the date range.** It picks up one — the current role at the time the report runs (or the most relevant role for the date range). For institutions needing multi-role detail, use the Ad-Hoc Resident Demographics report.

## The Resident Transition Report

Tracks movement of residents into, within, and out of the institution. Filter by Transition Type:

Transition Type

Captures

**Terminations (no future training)**

Trainees with no future Training History record AND no termination record listed in their Demographics → Training History tab

**Terminations (Termination Record)**

Trainees with a termination record in their Training History tab — generated by the Resident Termination Wizard

**Transfers**

Trainees moving between programs internally

**Transitioning Residents**

Trainees moving from residency to fellowship within the institution

(Confirmed CS.)

### Administrator and Reason columns — a known display gap

> **The Administrator name and Reason columns show 'N/A' when a resident is transitioning to another program (not terminating).** The report only displays the Administrator's name when there is no future training history (i.e., true terminations).
> 
> Workaround: Run the Resident Transition Report with **"Do not Include Transferring Residents"** unchecked, and enter an **end date that extends beyond the most future training history end date**. This causes the report to include the Administrator's name in transition records.
> 
> Flag for Product team awareness. (Ticket 196719, AMBS-8452.)

## The Demographics - Required Fields Report

Validates that required demographics fields are populated. Returns a list of warnings and errors per resident. Used at:

*   Year-end cleanup before AAMC reporting
    
*   Pre-IRIS submission validation
    
*   Onboarding completeness checks
    

### What the report checks

The complete list of validations (fields it can flag):

Check

Condition

Severity

Blank "NPI"

NPI field is empty

Warning

Invalid or blank "Citizenship"

Country of Citizenship missing or invalid

Warning

Invalid or blank "Pager Number"

Pager Number missing

Warning (controllable per `setting_demo_required_pager`)

"Visa" fields required

Foreign school + non-US citizen + Visa info missing

Warning

Invalid or blank "Birth Date"

Birth Date missing or invalid

Error

Invalid or blank "Email Address"

Email missing or malformed

Error

Invalid or blank "Gender"

Gender missing

Error

Invalid or blank "Social Security Number"

SSN missing or invalid

Error

Invalid Username. Temporary username in use

Username starts with system-generated prefix

Error

Missing "ECFMG" records

Foreign medical graduate without ECFMG records

Error

Missing "Medical/Dental School" records

Education tab incomplete

Error

Missing "Training History"

No PG records

Error

**Initial Residency Period (IRP) not assigned**

IRP flag missing

Error (GME function)

**No post-graduate training history record during visiting rotation**

Visiting record without overlapping in-house PG record

Error (GME function)

**Residency code not assigned to all internal training records**

IRIS residency code missing on PG records

Error (GME function)

**Residency code not assigned to training record during visiting rotation**

Same for visitors

Error (GME function)

(Confirmed TM.)

### How to test the full check list

> **For a complete list, ask GME Office to run the report against a test resident with only basic/essential data populated.** This is the only way to surface every warning and error the report can produce. (Confirmed TM.)

### The Visa check

When a resident attended a foreign school AND is not a US citizen, MedHub performs a **VISA check**:

*   The check is **satisfied** if: the user has Status or Work Auth field filled in **AND** has an Expiration Date.
    
*   The check produces **a warning** otherwise.
    

The check can be **disabled institution-wide** via root setting `settings_req_fieldsA` — set the "visa" index to 0. `[VERIFY]` This setting may be deprecated in the latest version. Check the canonical settings list.

If a naturalized US citizen is flagged with the Visa warning despite having US citizenship, this is a known behavior — the check fires when the institution's data shows a foreign school AND a non-US citizenship. If the citizen is now naturalized, GME can disregard the warning (or update the citizenship field to U.S. and rerun). (Ticket 123092, confirmed HN.)

### The Pager check

> **Pager Number can be removed as a Required Field** by disabling root setting `setting_demo_required_pager`. Useful for institutions where trainees no longer carry pagers. (Ticket 156702, confirmed BG 9/11/20.)

### Special characters and accents in name fields

> **Names with accents** (e.g., "Colón Rosa") are flagged with a "Last Name field blank or contains invalid characters" error. **The system DOES allow accents** — the underlying functionality is unaffected. The Required Fields report's validation flags accents as unexpected special characters. **Until enhanced, the error can be safely ignored or the user's name can be edited to remove the accent.** Product team is aware. (Ticket 167812, confirmed CB 1/25/2021.)

### IRP and ECFMG date validation

> **Foreign Certification Date error** ("Incorrect Foreign Certification Date") fires when the **IRP** is set to a date BEFORE the **ECFMG issue date**. The IRP cannot be after the ECFMG issue date. Fix: move the IRP to a record that begins after the ECFMG issue date. (Ticket 137287, confirmed TM.)

> **The first reimbursable row on the training history must be at least 1 day after the ECFMG issue date.** If the trainee's first reimbursable training history starts on 7/1/2018 and the ECFMG was issued 7/11/2018, the report flags the error. The training history start date must be 7/12/2018 or later. (Ticket 191722, confirmed MD 2/23/2022.)

### Visiting Record overlap with multiple training history records

> **A Visiting Record that overlaps multiple Training History records produces a "No post-graduate training history record during visiting rotation" error.** Example: Resident with Training History 7/1/2019–6/30/2020 (PGY-3) and 7/1/2020–6/30/2021 (PGY-4); Visiting Record 10/1/2019–9/30/2020 (PGY-3). The Visiting Record spans both PG years, but is tagged at PGY-3 — the system cannot match the second half (which should be PGY-4). **Best practice: each Visiting Record should fall within ONE Training History record's dates, with matching PGY level.**
> 
> Fix: split the Visiting Record into 10/1/2019–6/30/2020 (PGY-3) and 7/1/2020–9/30/2020 (PGY-4). Once the Resident Status Update overnight script runs, the error will clear. Splitting has no impact on work hours, schedules, evaluations, etc. (Ticket 159138, ES/BG 2/1/2021.)

### What the Required Fields Report cannot flag as a "GME function"

> **Username changes cannot be flagged as 'GME function.'** The username field is editable by both Administrator and GME — even when set to read-only for admins, the system can't restrict the warning to GME. (Ticket 172944, AMBS-6894.)

### Customizing what fields the report checks

> `settings_req_fieldsA` allows a few fields to be removed, shown as warning, or shown as error. The report itself is hard-coded but designed to include custom fields. **Custom fields named** `custom_text` or `custom_date` (with a number) appear in both the batch demographics import wizard and the report. (Ticket 231482, AMBS-10390, AMBS-6516.)

## The Certifications/Licenses Report

A detailed report on certifications and licenses by resident. Includes:

*   All certifications and licenses the institution tracks
    
*   Issue dates (where the Ad-Hoc Resident Demographics report leaves these out — see above)
    
*   Expiration dates
    
*   Status
    

The available certifications on this report (and Reports ID 21, 28, and 120) are controlled by root setting `required_certificationsA`. If a certification appears duplicated in the report, the certification ID may be listed twice in the array.

> **BLS duplicate fix.** When BLS Certification appears duplicated in reports, remove one of the duplicate entries from `required_certificationsA`. The certification ID can be found in the URL when hovering over the certification field hyperlink on the root/support side. (Ticket 162272, confirmed Jeff S/ML.)

## The Resident Expiration Report

A focused report on expiring certifications. **Limited to specific certification types only:**

*   DEA Controlled Substance
    
*   ACLS
    
*   ATLS
    
*   NRP
    
*   PALS
    
*   ALSO
    
*   ALTO
    
*   BLS
    

(Ticket 112576, confirmed BS.)

For other certifications, use the Certifications/Licenses Report or query the Demographics tab directly.

## The Orientation Report

Surfaces onboarding and orientation-related data for incoming trainees. Includes columns for the trainee's:

*   Identification fields
    
*   Onboarding package status
    
*   Lab Coat Department (when configured)
    

### Lab Coat Department column

> **Current Lab Coat Dept column is empty when nothing is configured.** The column displays text from the **Lab Coat Title** field on the program in the Program List. To populate: GME Office → Program List → click into a program → set the **Lab Coat Title** field for the program. (Ticket 235170, JW/AMBS-10926, 4/3/2023.)

## How the Resident Status Update script affects reports

A meta-behavior worth knowing across all demographics reports:

> **A nightly Resident Status Update script** runs at MedHub and processes all training history record changes — activating/deactivating accounts based on the date and current training records. The new status is **not reflected immediately**; the script runs overnight.
> 
> A **Resident Status Update email** is sent to GME staff designated in **Institutional Settings → Institutional Alerts → Resident Status Updates**, listing the changes the script made.
> 
> **To force the script for a single account** (when you don't want to wait for overnight): re-save the page where the record was modified or added. (Ticket 139327, confirmed JS.)

Reports run before the script processes a change will reflect the previous status. If a report seems to be missing a recent training history change, run the affected resident's training history → click Modify → Save without changes → re-run the report.

## How dates pull on the Resident Demographics Report

A reference for three commonly-confused date fields:

Field

Source

**Residency Start Date**

Start date of the **first training history record** of detail (also the IRP year)

**Institution Start Date**

Usually the same as Residency Start Date, **unless** the trainee started at one institution then transferred to another (with both documented in the training history). For a transferred trainee, the Institution Start Date is the start date of the **first training history at the home site's institution** (e.g., if Institution A → Institution B, on Institution B's MedHub site, Institution Start Date is the Institution B start date)

**Current Program Start Date**

First day of the trainee's record with the **current program/trainee type combination**. Example: if a trainee was a Resident in IM last year and is now a Research Fellow in IM this year, Current Program Start Date is the start date of the Research Fellow IM record (not the residency record)

(Verified OG/JB.)

## Awards on demographic reports

> **Portfolio awards do NOT carry over to the Awards/Offices report.** The portfolio awards do appear on the Awards/Disciplines tab on the Demographics profile, but they are display-only — not modifiable from there.
> 
> **GME-added awards vs. Program-added awards:**
> 
> *   GME-added: live in the **Awards & Officer Positions** section. In List Management → Resident Award Types → the Program column is `- -` (no specific program).
>     
> *   Program-added: live in the **Program Awards** section. In List Management → Resident Award Types → the Program column shows the program name.
>     
> 
> (Ticket 82101, confirmed TR.)

## Common scenarios

### "Specialty is blank for some terminated residents"

By design when **All Residents** or **Active/Current Only** is the filter. Inactive residents have no current training history to pull from. Use **Active During Period** with a date range that overlaps their last training history.

### "Specialty values vary in format — some have PGY level, some don't"

Result of the 19-different-creation-paths problem. Re-Modify-Save each affected training history record to force standardization. (Ticket 235501.)

### "Incoming trainees are missing"

Check today's date. If the start date is on or before today, the **Incoming** filter excludes them (looks at today and forward). Use **Orientation Date** with a wide range or **Active During Period**.

### "Active During Period results are missing trainees who transferred between programs"

The first record in the date range determines program assignment for the report. Select all relevant programs or All Programs to capture transitioners. (Ticket 231833.)

### "Excel export is misaligned"

A special character (often a colon) is in a demographics field. Remove the character, generate as HTML, or clean the Excel manually. (Ticket 173876.)

### "PGY level on the report doesn't match the training history PGY"

The "PGY" display option calculates from medical school graduation date, not training history. Use a different display option for the actual training history PGY. (Ticket 233900.)

### "Required Fields report flags accent in name"

Known false positive. The system supports accents fine for actual functionality — only the report's validation flags them. Ignore or remove the accent for cleaner reporting until Product enhances. (Ticket 167812.)

### "Visa warning for a naturalized US citizen"

Triggered by foreign school + non-US citizenship combination. If the citizen has naturalized, update the citizenship field to U.S. and rerun. Or disable institution-wide via `settings_req_fieldsA` visa = 0. (Ticket 123092.)

### "Visiting Record produces 'no post-graduate training history record' error"

Visiting Record overlaps two Training History records with mismatched PGY levels. Split the Visiting Record into two pieces matching each PG record. (Ticket 159138.)

### "Issued date is missing from Medical License columns on Ad-Hoc"

Known gap on the Ad-Hoc Resident Demographics report. Use the Certifications/Licenses report instead — it includes Issued date. (Ticket 241387.)

### "Resident Transition Report shows 'N/A' in Administrator column"

Only termination records show the Administrator name; transition records don't. Run with end date past the most future training history end date and uncheck "Do not Include Transferring Residents." (Ticket 196719.)

### "Lab Coat Department column is empty"

Set the Lab Coat Title field on the program in the Program List. (Ticket 235170.)

### "BLS appears twice in the Certifications/Licenses report"

Remove the duplicate certification ID from `required_certificationsA`. (Ticket 162272.)

### "I want a report that includes GME comments from the Comments tab"

There is no report that includes the GME Comments field. (Ticket 184727, ES 10/7/2021.)

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Status of the four currently-open AMBS tickets on the Ad-Hoc Resident Demographics report (AMBS-21778, AMBS-21830, AMBS-21865, AMBS-22069). All four are open as of late April 2026. Worth confirming live status when reachable.
    
*   `[VERIFY]` `settings_req_fieldsA` — the SKU references this for Visa check disable; I want to confirm this setting hasn't been renamed or split.
    
*   `[VERIFY]` Recent Ad-hoc Faculty Demographics report bugs — you flagged this report has the most recent bugs of any in the category. Worth getting a list of specific issues to fold into the Settings/Common Scenarios sections.
    
*   `[VERIFY]` Whether the Required Fields report can be customized via settings other than `settings_req_fieldsA` — Ticket 231482 (AMBS-10390) confirmed it's hard-coded but takes custom fields. Worth confirming current state.
    
*   `[VERIFY]` `setting_program_track` — the SKU describes this as part of custom development for another client. Worth confirming if this is now standard or still custom.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_req_fieldsA`

Configures Required Fields report behavior. Allows certain fields to be removed, set to warning, or set to error. Includes "visa" index that disables/enables the Visa check institution-wide.

`setting_demo_required_pager`

Whether the Pager Number is required (and flagged as missing in the Required Fields report).

`required_certificationsA`

Array of certification IDs available on the Certifications/Licenses report and on Reports ID 21, 28, 120, 49. Duplicate entries cause duplicate display.

`setting_program_track`

Enables the "Track" filter on the Ad-Hoc Resident Demographics report. Requires the institution to have set up "Combine with Program" feeder programs in the Program List. Originally part of custom development.

`payedbyFlag`

Enables the "Paid By" filter on the Ad-Hoc Resident Demographics report. The list itself is populated by Development; no interface to manage.

`setting_faculty_teaching`

Enables the `[T]` indicator on the Ad-hoc Faculty Demographics report when filtering for "Active Core Faculty Only." See **MedHub - Demographics — Faculty** for setup.

Institutional settings (configured under **GME Office → Institution Settings → Alerts → Institutional Alerts**):

*   **Resident Status Updates** — recipients of the nightly status update email summarizing changes from the Resident Status Update script.
    

## Database tables appendix

Table

Purpose

`users_residents`

Primary resident demographic records — drives the Ad-Hoc Resident Demographics report.

`users_residents_pg`

Resident training history (Post Graduate Event records). Source of time-specific data points (Pay Rate, Program, PGY, etc.).

`users_residents_pg_appt`

Per-academic-year appointments inside Residency/Fellowship records.

`users_faculty`

Primary faculty demographic records — drives the Ad-Hoc Faculty Demographics report.

`users_faculty_programs`

Faculty program associations. The `core` flag here drives the `[T]` indicator on the Faculty Demographics report.

`users_residents_certifications`

Certifications by trainee — drives Certifications/Licenses report.

`users_residents_education`

Education tab data (Medical/Dental Degree, schools, etc.).

`users_residents_address`

Address fields. Special characters here cause Excel export shifts (Ticket 173876).

`users_residents_change_name`

Change name fields including Suffix and Degree (suffix). Drives Display Suffix, Display Degree (suffix), Degree (Name) fields on reports.

`users_residents_visa`

Visa fields (Status, Work Auth, Expiration). Drives Visa check on Required Fields report.

`users_residents_apps`

Onboarding/application package assignments — drives Orientation Report data.

`ref_program_track`

Track program references when `setting_program_track` is enabled.

`ref_certifications_required`

Required certifications list (controlled by `required_certificationsA`).

`lookup_iris_restype`

IRIS residency codes — drives "Residency code not assigned" Required Fields warning.

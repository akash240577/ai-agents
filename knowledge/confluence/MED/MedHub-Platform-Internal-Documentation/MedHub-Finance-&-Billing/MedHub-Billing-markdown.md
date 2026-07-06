# MedHub - Billing - markdown

# MedHub - Billing

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## 1\. Overview \[GME\]

Billing in MedHub determines how long trainees spent at each location during a billing period so that the institution can bill affiliated sites for trainee time. The billing module takes schedule data (services, shifts, clinics), maps it through the site → funding source configuration, and produces per-trainee, per-funding-source FTE and dollar amounts based on configurable rate tables.

Billing is **GME-only**. There is no UME equivalent because medical students pay tuition rather than receiving salary.

The recommended billing method is **Billing by Funding Source** (`settings_billing=2`). The legacy Billing Report method (`settings_billing=1`) is deprecated and the hourly/budgeted method (`settings_billing=3`, originally built for UPMC) is no longer supported.

### Who has access

Access to billing functions is controlled by `settings_billing_userA`. By default, only GME Office users can generate bills. Hospital Finance users can be given access as well. Finance users can also be granted read-only view of billing tables via `setting_finance_billing_view`.

A separate **Billing user type** exists as a lightweight read-only account with access to reimbursement, demographics, and limited reporting. Billing accounts cannot be linked to other account types — they must be logged into separately.

### Relationship to IRIS and scheduling

Billing uses the same FTE calculation algorithm as IRIS: trainee time is assigned to activities using a defined algorithm in half-day increments. The schedule must be complete and accurate before bills are generated, since billing is entirely downstream of the block schedule. Generating a bill reads every schedule for every program and determines how many days each trainee should be allocated toward each funding source based on site associations.

As of March 2024 (MPP-72), bill generation runs asynchronously. Users can navigate away or log out without interrupting the process and receive an Urgent Task and toast notification when generation completes. There were no changes to the bill generation logic itself — only the execution model changed.

* * *

## 2\. Billing configuration \[GME\]

Billing configuration lives under **GME Office > Sites/Billing** and involves several interconnected tabs: Sites, Funding Sources, Billing Rates, Billing Periods, and Billing Exceptions. The flow is:

**Sites → Funding Sources → Billing Rate Tables → Bill Generation → Reports/Exports**

### 2.1 Sites

Sites represent the physical locations where schedule activities take place. Each service, shift, call, or clinic definition is assigned to one or more sites. For billing purposes, a site must be marked as **Billed** (checkbox on the site definition) to participate in billing calculations.

Key site properties for billing:

*   **Site type** — Internal, Offsite - Affiliated, or Offsite - Non-affiliated. Only Internal sites can be selected as a program's default site.
    
*   **Billed checkbox** — must be checked for the site to generate billing data.
    
*   **Cost Center** — an optional field on service definitions that captures internal reimbursement detail more granular than the site. The FTE by Rotation report uses Cost Center data.
    
*   **Site contracts** — expiration dates tracked per site. Alerts for expiring contracts are controlled by `setting_site_contracts_alerts_range` (array: first value = days after expiration to keep showing the alert, second value = days before expiration to start showing it) and `setting_site_contracts_alerts_usertypes`.
    

Sites cannot be inactivated by end users. To inactivate a site, contact MedHub Support — a finance consultant uses the root-side "Sites - Update Definitions" tool to change site status. Once a site is linked to a service and schedule, the site status field is locked to prevent accidental changes that would affect billing data.

### 2.2 Funding sources

A funding source represents an entity that pays for trainee time — typically an affiliated hospital, VA, or other clinical partner. Funding sources are configured under the Funding Sources tab in Sites/Billing.

Each funding source has:

*   **Associated sites** — if a trainee spends time at a site linked to this funding source (and is in an applicable program), their time is allocated to this funding source.
    
*   **Program restrictions** — a funding source can apply to all programs or be limited to specific ones.
    
*   **Billing rate table** — each funding source is tied to exactly one billing rate configuration that determines how dollar amounts are calculated.
    
*   **Type** — site-based or general. Site-based funding sources are matched first based on where the trainee was scheduled. General funding sources catch remaining time. **Order matters** — site-based funding sources should generally be listed above general ones.
    
*   **Remove vacation/LOA days** — optional per-funding-source configuration.
    

When a bill is generated, the system examines each trainee's schedule for the billing period and determines which funding source each day of activity maps to, based on the activity's site and the site-to-funding-source configuration. A trainee's "Bill To" field in their training history record can override this, forcing time to a specific funding source regardless of schedule-driven site assignment.

### 2.3 Billing periods

Billing periods define the date ranges for which bills are generated. The standard period type is controlled by `settings_billing_periodID` (defaults to monthly). Non-standard periods (e.g., bi-weekly) require developer assistance to configure.

Institutions can run one of two billing modes:

*   **Single data set** — one bill per period (the default).
    
*   **Prospective + Reconciliation** — enabled by `settings_billing_reconcile`. The institution generates a prospective bill before the period completes (to preview expected billing) and a reconciliation bill afterward (to capture what actually happened). The terms for these can be customized via `term_billing_prospectiveStr` and `term_billing_reconcileStr`.
    

The **Billing Summary report** uses the best available data for each period: if a reconciliation data set exists, it uses that; otherwise it uses the prospective data. This means the Billing Summary and the prospective Bill Funding Source report will not always match when both types exist.

### 2.4 Billing rate tables

Billing rate tables define how much a trainee's time is worth per day. They are versioned — clients add new rate entries as salary and benefits change over time. The system uses the rate table version that is current for the dates of the billing period.

Rate tables can be configured in one of two modes:

#### Standard/single rate

A single daily dollar amount per trainee designation:

*   **Standard** — the default rate for all trainees.
    
*   **Chief** — an alternate rate if the trainee is designated as a chief resident.
    
*   **Visa** — an alternate rate for trainees with specific visa/immigration types (controlled by `settings_billing_visaA`). If the Visa column is left blank, the Standard rate is used.
    

#### Break into components

The daily rate is built from multiple individually configured components, each representing a category of compensation (e.g., salary, benefits, retirement). When a billing rate table is set to "Break into components," the user selects which component types to include.

Component types are defined on the root side under **List Management > Billing Rate Components**. There are five types:

1.  **Rate Table** — can only be enabled on the root side. When enabled and included in a billing rate table, the user enters level-specific daily rates directly into the billing rate table.
    
2.  **Auto-calculated** — can only be enabled on the root side. Calculates a percentage of the value in the Pay Rate Table (GME > List Management > Pay Rate Tables) for the academic year corresponding to the trainee's assigned rate. Uses the same pay rate that drives contract salaries. The Annual column in the Pay Rate Table must be populated for this component type to calculate correctly.
    
3.  **Supplemental Lookup** — can be added on the root side or in GME > Sites/Billing > Billing Rates > Component Rates. Values are set per academic year, program, and level.
    
4.  **Custom (GME-managed)** — can be added on the root side or in GME > Sites/Billing > Billing Rates > Custom Component Rates. Unlike other component types, custom components can also be assigned directly in the trainee's training history record (Modify Training History > Custom Billing Components). Custom components support multiple rates with effective dates, but are not set per program, level, or academic year — the daily rate applies when the trainee has the component assigned and the billing period falls after the effective date.
    
5.  **Chief Bonus** — can only be enabled on the root side. Uses the Annual Bonus amount entered in the trainee's training history record under the Chief subsection (only visible when `setting_demo_training_acmr` is enabled). Only consumed when the funding source's billing rate is set to "Break into Components" and the Chief Bonus component is selected. Only applies to chief residents.
    

For component-based rate tables, the total daily rate is the sum of all applicable component rates for the trainee's program, level, and academic year, plus any custom component daily rates assigned to the trainee.

### 2.5 Billing exceptions

Billing exceptions are optional rules that modify how specific trainees or groups are billed. Only a minority of clients use them. Exceptions can:

*   Force billing to a specific funding source.
    
*   Exclude or include specific billing components.
    
*   Apply to trainees matching certain criteria.
    

Exceptions are configured under **Sites/Billing > Billing Exceptions**. The precision of percentage-based exceptions is controlled by `settings_billing_exceptions_precision`.

* * *

## 3\. Bill generation \[GME\]

### 3.1 Generating a bill

Navigate to **GME Office > Sites/Billing > Generate Bills**. The layout shows all billing periods with options to generate, regenerate, view data, and run reports.

To generate a bill:

1.  Click **Generate** (or **Regenerate** for an existing period).
    
2.  Select the programs to include.
    
3.  The system processes asynchronously — you can navigate away. An Urgent Task notification appears when complete.
    

What happens during generation: the system reads every trainee's schedule for the selected period and determines, for each day, which site (and therefore which funding source) the trainee's time should be allocated to. The output is the number of days each trainee is assigned/billed to each funding source.

### 3.2 View/update data

After generation, clicking **View/Update Data** shows a matrix: funding sources across the top, trainees down the left, with days-assigned values in each cell. If any trainees are partially funded or not funded, a warning icon appears at the top of this page.

### 3.3 Locking

Generated billing periods can be locked via the Actions menu to prevent accidental regeneration. Locked periods still allow reporting. To unlock, use Actions > Unlock.

### 3.4 Settings affecting bill generation

Setting

Description

`settings_billing`

Billing method: 0=off, 1=report only (deprecated), 2=billing by funding source (recommended), 3=budgeted/hourly (no longer supported)

`settings_billing_userA`

User types with access to bill generation (string, colon-separated). Default: GME only. Value "5:6" grants access to both GME and Hospital Finance.

`settings_billing_periodID`

Standard billing period type

`settings_billing_reconcile`

Enable prospective + reconciliation billing

`settings_billing_conferences`

Bill for away conferences: 0=don't bill, 1=bill all sources, 2=bill general sources only

`settings_billing_sickdays`

1=sick days bill to overlapping service; 0=bill to default site. If default site is not assigned to a funding source, system applies to a general funding source. If no general funding source exists, time shows as unfunded.

`settings_billing_exclude_clinics`

Exclude clinics from FTE calculations

`settings_billing_exclude_shifts`

Exclude shifts/calls from FTE calculations

`settings_billing_loa_unpaid`

Bill for unpaid LOAs

`settings_billing_overlap_clinics`

Bill for clinics deleted/cancelled during absence approval

`settings_billing_overlap_shifts`

Bill for on-site shifts/clinics removed or replaced during absence approval

`settings_billing_visitors`

Include in-line visitors in billing (requires `setting_visitor_method=1`): 0=exclude, 1=include

`settings_billing_decimals`

Decimals of precision for billing days per resident per period

`settings_billing_level`

Allow override of billing rate level per trainee in training history (if billing level differs from clinical level)

`settings_billing_visaA`

Visa/immigration types that receive alternate billing rate. Set empty for "all."

* * *

## 4\. Billing reports \[GME\]

Billing reports are accessed from the Generate Bills page. The following reports exist:

### 4.1 Bill Funding Source report

The standard report used to bill affiliates. Shows per-trainee detail by funding source: days assigned, days billed, daily rates (by component if applicable), and totals. Can be run for a single period and single funding source, or across multiple.

For rate tables set to "Break into Components," the report shows a column for each active component with the calculated dollar amounts. For "Standard" rate tables, the report shows the single daily rate.

### 4.2 Bill Funding Source Export (MPP-289)

A CSV export that provides per-trainee, per-funding-source data at the level of detail clients need for downstream billing workflows. Positioned between the minute-level billing data export and the high-level summary reports.

**Location:** Sites/Billing > Generate Bills, as a separate button between Bill Funding Source and Billing AR Report.

**Export options:**

*   Select one or more funding sources
    
*   Select prospective or reconciliation (if `settings_billing_reconcile` is enabled), then select specific billing period(s) — single period or a start/end range
    
*   Select one or more programs
    
*   Include/exclude SSN
    
*   Exclude trainees with no billable activity (when enabled, only includes records where Days Billed > 0; when disabled, includes all trainees in selected programs including those with >0 Assigned Days but 0 Days Billed)
    
*   Include/exclude daily rates for billing components and custom components (controls whether individual per-day component rates appear; the Trainee Daily Rate and Total Daily Rate columns always appear regardless)
    
*   Include/exclude activity names and dates
    

**Column headers (always present):** Last Name, First Name, Funding Source, Funding Source Rate Type, Billing Period, Department, Program, Payroll Code, Short Code, Employee ID, PTA Number (Stanford only — per MEDM-10098, this column only appears for Stanford University), Paid By, Bill To, Billing Level, Appt Percentage, Days Assigned, Days Billed, FTE, Annualized FTE, Trainee Rate Type, Trainee Daily Rate, \[column per active component rate\], \[column per applicable custom billing component\], Total Daily Rate, Total Amount, Billing Exceptions.

**Conditional columns:** Period Type (if reconciliation enabled), SSN (if selected), Activities (if selected — lists schedule activities and date ranges contributing to Days Assigned, with site percentages for multi-site activities).

**Key calculations:**

*   **FTE** = (Days Assigned to funding source in period / Days in period) × Appointment Percentage
    
*   **Annualized FTE** = (Days Assigned to funding source in period / Days in year) × Appointment Percentage. Uses 366 days if the billing period's academic year includes February 29.
    
*   **Trainee Rate Type** = Standard, Chief, or Visa based on demographics, considering `settings_billing_visaA`
    
*   **Trainee Daily Rate** = daily rate for the trainee's rate type × Appointment Percentage (per MEDM-10036)
    
*   **Component rate values** = daily component rate × Appointment Percentage × Days Billed (per MEDM-10028/MEDM-10032). When "Include Daily Rates" is selected, the per-day component rate (before multiplication by Days Billed) also appears.
    
*   **Total Daily Rate** = either single standard/chief/visa rate × Appt % (Standard mode) or sum of all component daily rates × Appt % + custom component daily rates × Appt % (Components mode)
    
*   **Total Amount** = Total Daily Rate × Days Billed
    

**Sort order:** Funding Source → Department → Program → Resident → Billing Period.

The export logic matches the Bill Funding Source report, including the "Bill To" override from training history and billing exceptions.

### 4.3 Billing AR / Billing Summary reports

Used to summarize billing by program. The Billing Summary uses the best available data per period (reconciliation if available, otherwise prospective).

### 4.4 Bill/Budget Comparison

Compares scheduled/billed amounts against defined budgets set in the Funding Budgets tab.

### 4.5 Billing data export (legacy)

A separate raw data export available when `settings_billing_export` is enabled. This is **not** the Bill Funding Source Export — it is an older, more granular export that provides half-day-level detail of the generated billing data set. Format controlled by `settings_billing_export_format` (options: xls, txt-pipe). Additional demographic fields can be appended via `settings_billing_export_fieldA`. The legacy export and the Bill Funding Source Export serve different purposes and both remain available: the legacy export for raw granular data, the Bill Funding Source Export for structured per-trainee billing summaries with rate calculations.

* * *

## 5\. FTE calculation algorithm \[GME\]

Billing and IRIS share the same FTE calculation algorithm. Time is allocated in half-day increments using configurable hour thresholds:

*   **0 to 2 hours** → rounds to 0 (no billing)
    
*   **2.5 to 6 hours** → rounds to half day
    
*   **6.5+ hours** → rounds to full day
    

For activities at sites with split percentages (e.g., a service assigned 50% to Site A and 50% to Site B), the percentage determines how the billed days are divided between funding sources.

The algorithm prioritizes activities in a defined order when resolving site assignment for billing. This priority order has not fundamentally changed since the original implementation.

* * *

## 6\. Funding budgets \[GME\]

Funding budgets are optional and defined per funding source, per level, in number of days per billing period. They allow the institution to track approved FTE allocations vs. actual billed time.

*   **Approved Slots** — when `settings_billing_budget_slots` is enabled, GME Office gets an "Approved" column to add to funding budgets.
    
*   **Program write access** — programs can be granted access to enter budget information during a defined date range.
    
*   Budget data feeds the Bill/Budget Comparison report.
    

* * *

## 7\. Site locking \[GME\]

When `setting_sitelock` is enabled, program administrators can create new activities but cannot assign them to sites. A default site (specified in `setting_sitelock_siteID`) is assigned to all new activities. GME Office then assigns the correct site.

New activities trigger an **Urgent Task** called "New Activity - Site Required," visible only to GME users with super-admin flags. The Sites/Billing page displays a warning for any activities without proper site assignments, linking to a read-only view.

* * *

## 8\. Training history fields affecting billing \[GME\]

Several fields on the trainee's training history record directly impact billing:

*   **Bill To** — overrides the schedule-driven funding source assignment, forcing all time to a specific funding source.
    
*   **Billing Level** — when `settings_billing_level` is enabled, allows a billing level different from the clinical level.
    
*   **Appointment Percentage** — multiplied into FTE and total amount calculations.
    
*   **Paid By** — informational field included in billing exports.
    
*   **PTA Number** — informational field included in billing exports.
    
*   **Custom Billing Components** — assigns custom component rates to the trainee.
    
*   **Chief designation** — determines whether the Chief rate or Chief Bonus component applies.
    
*   **Visa/Immigration type** — determines whether the Visa rate applies (per `settings_billing_visaA`).
    
*   **Rate** — the pay rate assignment that auto-calculated components reference.
    

* * *

## 9\. Common scenarios and troubleshooting \[GME\]

**Resident billed under wrong program:** A resident is always billed based on their home program, even if released to a different program.

**Duplicate or skipped rows in billing data:** Historically reported in some cases, believed to be caused by connection/performance issues during synchronous bill generation. The March 2024 async generation (MPP-72) should eliminate this.

**Bill Funding Source vs. Billing Summary mismatch:** Expected when the institution uses both prospective and reconciliation. The Billing Summary uses reconciliation data when available; the Bill Funding Source report shows exactly what was generated for the selected period type.

**Clinic billing and half-day calculation:** Clinics round to 0, 0.5, or 1 day based on the hour thresholds. A 2.5-hour clinic counts as a half day, with the remaining half day billed to the primary service.

**Changing a clinic's site for billing:** Since clinics are not academic-year-specific, the recommended process is: (1) create a new clinic definition with the correct site, (2) inactivate the old clinic, (3) populate only the new clinic going forward. This preserves historical data.

**Zero-dollar contracts after pay rate setup:** Pay rate information only pulls into contracts if the pay rate table is updated before the contract is assigned. Also verify that a default pay rate table is designated in List Management.

* * *

## 10\. Client-specific customizations \[GME\]

*   **University of Washington** — custom billing that allows billing for cancelled shifts/clinics.
    
*   **Kansas (KUMC)** — custom billing export with institution-specific Speedtypes (`settings_billing_speedtypes`, `settings_billing_speedtypes_filepath`, `settings_billing_speedtypes_transfer`).
    
*   **OHSU** — extra fields in funding export (`funding_export_ohsu_fields`).
    
*   Client-specific billing reports exist for UTSW, CCF, OHCA, and OU (documented in Reports — Finance & Billing).
    

* * *

## Settings appendix

> **Source of truth for root setting current values.** For the most current information on any setting, the canonical source is `support.medhub.com > Lists > Settings`.

Setting

Type

Description

`settings_billing`

Integer

Billing method: 0=off, 1=report only (deprecated), 2=billing by funding source (recommended), 3=budgeted/hourly (no longer supported)

`settings_billing_access`

Integer

Ability to add read-only billing users

`settings_billing_budget_slots`

Integer

0=off, 1=on. Gives GME an "Approved" column in funding budgets

`settings_billing_conferences`

Integer

Bill for away conferences: 0=don't bill, 1=bill all, 2=bill general only

`settings_billing_decimals`

Integer

Decimals of precision for billing days per resident per period

`settings_billing_exceptions_precision`

Integer

Number of decimals in percentage-based billing exceptions

`settings_billing_exclude_clinics`

Integer

Exclude clinics from FTE calculations

`settings_billing_exclude_shifts`

Integer

Exclude shifts/calls from FTE calculations

`settings_billing_export`

Integer

Enable raw data export for generated billing data (0=disabled, 1=enabled)

`settings_billing_export_fieldA`

Array

Fields to append to billing export (references ref\_demo\_fields table)

`settings_billing_export_format`

String

Export file format: xls, txt-pipe

`settings_billing_level`

Integer

Allow billing level override per trainee in training history

`settings_billing_loa_unpaid`

Integer

Bill for unpaid LOAs

`settings_billing_overlap_clinics`

Integer

Bill for clinics cancelled during absence approval

`settings_billing_overlap_shifts`

Integer

Bill for shifts removed/replaced during absence approval

`settings_billing_periodID`

Integer

Standard billing period type

`settings_billing_reconcile`

Integer

Enable prospective + reconciliation billing

`settings_billing_remitStr`

String

Remit-to address displayed on billing reports

`settings_billing_report_details`

Integer

Default details level for billing report: 0=none, 1=activity names, 2=date-specific

`settings_billing_sickdays`

Integer

1=bill sick days to overlapping service; 0=bill to default site

`settings_billing_speedtypes`

Integer

Enable KUMC-specific billing export with Speedtypes

`settings_billing_userA`

String

User types with billing generation access (colon-separated)

`settings_billing_visaA`

Array

Visa types billed at alternate rate (empty=all)

`settings_billing_visitors`

Integer

Include in-line visitors in billing (0=no, 1=yes; requires setting\_visitor\_method=1)

`setting_finance_billing_view`

Integer

Finance read-only view of billing tables

`setting_sitelock`

Integer

Enable site locking (1=on)

`setting_sitelock_siteID`

Integer

Default site ID for new activities when site locking is enabled

`setting_site_contracts_alerts_range`

Array

Days around site contract expiration to show alerts (row 0=days after, row 1=days before)

`setting_site_contracts_alerts_usertypes`

Array

User type IDs that see expiring site contract alerts

`setting_admin_access_site_contracts`

Integer

Allow administrators to view site contracts

`setting_funding_activity`

Integer

Activity flag (CC=1, default=0)

`setting_funding_lookup`

Integer

Reference funding code lookup table (0=off, 1=on, 2=on + limited to single code per name)

`setting_funding_promote_auto`

Integer

Auto-populate funding on promotion (0=disabled, 1=enabled)

`setting_funding_slots`

Integer

Maximum funding slots per date period

`funding_codeDigits`

Integer

Force this number of digits for all shortcodes

`term_billing_prospectiveStr`

String

Custom term for prospective billing

`term_billing_reconcileStr`

String

Custom term for reconciliation billing

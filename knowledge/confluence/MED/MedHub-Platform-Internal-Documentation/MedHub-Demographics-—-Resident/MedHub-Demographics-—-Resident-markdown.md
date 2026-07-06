# MedHub - Demographics — Resident - markdown

# MedHub - Demographics — Resident

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Resident Demographics is the MedHub feature that records the trainees who go through GME residency and fellowship programs — their identifying data, contact info, training history, contracts, education background, certifications, the documents tied to their training, and the system identifiers MedHub uses to route evaluations, schedules, work hours, conferences, and procedures to the right person.

This document covers Resident Demographics as a feature: profile structure, the institutional-vs-program demographic field configuration, how to add and modify residents (manually and via the four import wizards), the lifecycle (deletion, archive, transition), the custom demographics field configuration workflow on the root side, and the operational patterns that come up repeatedly in support tickets.

It does not cover:

*   **Training history mechanics** — covered in **MedHub - Training History** (Post Graduate Event records, status flags, the 30-day post-end-date window, the Resident Status Update script).
    
*   **Contracts** — covered in **MedHub - Contracts**. The contract data on a Training History record is documented there.
    
*   **Resident scheduling and service assignments** — covered in **MedHub - Scheduling**.
    
*   **Evaluations of and by residents** — covered in **MedHub - Evaluations — GME**.
    
*   **Onboarding packages sent to incoming residents** — covered in **MedHub - Onboarding** (the term-translatable feature `term_resident_applicationsStr`).
    

## Where it lives

Resident Demographics records are accessed through:

*   The **Residents** dropdown in User Management on the home page, or the search-by-name selector
    
*   The **Resident Demographics** link in the GME Office Functions area for GME-side users
    

The Program Administrator owns the demographics for residents in their program. GME has full read/write across all programs.

The profile is organized into a series of tabs:

1.  **Demographics** — contact data, identifiers, hardcoded fields, and any institution-configured custom fields
    
2.  **Training History** — Post Graduate Event records (residency, fellowship, lapse, etc.); see **MedHub - Training History**
    
3.  **Education** — medical school, undergraduate, other education
    
4.  **Certifications** — board certifications, BLS/ACLS, etc.
    
5.  **Forms/Files** — uploaded documents (contracts, signed forms, etc.)
    
6.  **Schedule** — read-only view of the resident's rotation schedule
    
7.  **Procedure Logs** — links into the resident's procedure log; see **MedHub - Procedures**
    
8.  **Portfolio** — links into the resident's portfolio entries; see **MedHub - Portfolios**
    
9.  **Evaluations** — links into evaluations of the resident; see **MedHub - Evaluations — GME**
    

There is also an **Active** and **Access** checkbox pair beneath the Demographics tab and (gated by `setting_gme_delete_resident`) a "Permanently Delete this Resident" link visible to GME under specific conditions — see **MedHub - Training History** §"Permanent deletion of a resident profile."

## Profile structure

### Tab 1: Demographics

Required fields when adding a new resident manually:

*   First Name
    
*   Last Name
    
*   Username
    
*   Email Address
    
*   Start Date
    

Plus the trainee must be assigned to at least one program (typically the program adding them).

Hardcoded fields available via root configuration (Status active/inactive, Read/Write per field):

*   Salutation, Title, Specialty, Photo
    
*   Active checkbox, Access checkbox, Reset Password
    
*   USMLE / NPI / DEA numbers
    
*   Employee ID, ABMS ID, ECFMG number
    
*   Personal demographics: gender, date of birth, ethnicity, citizenship status, marital status
    
*   Contact: work phone, pager, home phone, cell phone, work address, home address
    
*   Spouse and dependents
    
*   Mail code
    
*   Emergency contact
    
*   Languages, biographical, research interests, hobbies
    
*   General Notes
    

Like Faculty, the standard Resident demographic fields are configured under root-side **Resident Fields** (per institution). Each field has a Status (Active/Inactive) and Admin Access (Read/Write) value.

### Custom demographic fields

Unlike Faculty (where fields are hardcoded except for Faculty Department), **Resident Demographics supports custom fields** at the institution level. Common uses: tracking client-specific identifiers, tracking program-specific designations, capturing data the institution needs but ACGME / hardcoded fields don't cover.

Custom fields are configured root-side. The internal workflow — what Support team members do when a client requests a custom field — is below in §"Custom demographics field configuration workflow."

### Tab 2: Training History

Documented in detail in **MedHub - Training History**. From the Resident Demographics standpoint, the Training History tab is where:

*   Post Graduate Event records are added (Residency, Fellowship, Lapse in Training, Teaching Appointment, etc.)
    
*   Per-academic-year appointment records sit inside Residency / Fellowship Post Graduate Events
    
*   Contracts attach to specific training history records
    
*   The IRP (Initial Residency Period) flag is set per resident
    
*   The IRIS Residency Code is set per appointment
    
*   Chief Resident designation is added
    

The Training History tab is the most consequential tab in the entire profile.

### Tab 3: Education

Records the resident's prior education:

*   Medical School (with end date — affects PGY calculation; see **MedHub - Training History** §"A resident is showing as PGY -2")
    
*   Undergraduate
    
*   Graduate (if applicable)
    
*   Other (additional certifications, fellowships before residency, etc.)
    

The medical school **end date** is what MedHub uses to calculate the resident's PGY. If this date is in the future (data entry error), PGY shows as negative.

### Tab 4: Certifications

Tracks board certifications, BLS/ACLS/PALS, USMLE step scores, and any other certifications the institution captures.

> **"Certification recorded by Another Program."** A specific entry that sometimes appears in a trainee's Certifications tab is the result of the trainee moving between programs while a certification field was active in the original program but not yet enabled in the new one. The record cannot be removed, but it can be addressed by enabling the certification field for the new program. (Documented in **MedHub - Training History**.)

### Tab 5: Forms/Files

Generic file storage. Used for uploaded contracts (when not generated by MedHub), signed forms, credentialing documents.

### Tabs 6-9: Schedule, Procedure Logs, Portfolio, Evaluations

Read-only views or links into the relevant feature areas. Cross-reference the dedicated docs.

## Adding new residents

There are four supported paths to add a resident, with different use cases:

### 1\. ERAS Demographics Import Wizard

The most common path for institutions onboarding a new class. **ERAS Demographics Import** uses the ERAS Excel export from the Electronic Residency Application Service to populate resident profiles.

Available under **Home → Task Wizards → ERAS Demographics Import** (`setting_wizardA` index 3).

#### How it works

1.  Locate Task Wizards on the homepage.
    
2.  Select **ERAS Demographics Import**.
    
3.  Choose between the new ERAS interface or the legacy file upload tool (programs have the option of either).
    
4.  Upload the ERAS-provided Excel file.
    
5.  The wizard maps ERAS fields to MedHub demographic fields. Confirm or adjust the mapping.
    
6.  Review the residents to be created — confirm names, emails, programs.
    
7.  Submit. New resident accounts are created with their starting demographic data populated.
    

#### Behaviors

*   **The wizard creates the resident account and populates demographics.** It does NOT automatically create the first training history record. That is added separately, either manually or via the New Resident Import wizard if the institution prefers a separate step.
    
*   **Manual additions before import can create duplicates.** MedHub does NOT automatically check to avoid duplicating profiles. If a resident is manually added and then also appears in an ERAS import, two profiles result. Support is then needed to merge or delete one. **Best practice: do not manually add residents before running the ERAS import.**
    
*   **Medical school data import.** The wizard imports medical school information from the ERAS file into the resident's Education tab.
    

### 2\. New Resident Import Wizard

Used when residents are not coming through ERAS — for example, fellows transitioning from another institution, residents joining mid-year, or trainees from non-ERAS specialties.

Available under **Home → Task Wizards → New Resident Import Wizard** (`setting_wizardA` index 6).

#### How it works

1.  Generate a template from the wizard.
    
2.  Populate the template with the residents to add (one row per resident).
    
3.  Upload the populated template.
    
4.  The wizard creates accounts and populates the demographic fields included in the template.
    

The template-based approach is similar to the Resident Demographics Batch Import (below), but with different defaults and use cases:

*   **New Resident Import** is for adding NEW residents who don't exist in MedHub yet.
    
*   **Resident Demographics Batch Import** is for updating EXISTING resident demographics (or adding new ones — but the template focus differs).
    

### 3\. Resident Demographics Batch Import

Used to update demographic fields for residents already in MedHub. Available under **Home → Task Wizards → Resident Demographics Batch Import** (`setting_wizardA` index 4).

> **Three separate batch demographics wizards.** Faculty, Resident, and Student each have their own dedicated batch demographics wizard — they do not share infrastructure. The Resident version (this one) operates independently from the Faculty version (see **MedHub - Demographics — Faculty** §"Adding faculty in bulk: Faculty Demographics Batch Import") and the Student version (see **MedHub - Demographics — Student**).

The wizard works in two phases:

**Phase A — Create Import Template:**

1.  Click **Resident Demographics Batch Import**.
    
2.  Click **A. Create Import Template**.
    
3.  Select one or more programs.
    
4.  Select residents to update or exclude.
    
5.  Select the demographic fields to update.
    
6.  Download the generated template.
    
7.  Modify the file, preserving format.
    

**Phase B — Upload Populated Template:**

1.  Click **B. Upload Populated Template**.
    
2.  Browse to the file.
    
3.  Confirm each field to update (use **All** for select-all).
    
4.  The progress bar and IMPORT ERRORS section indicate status. _Import Complete!_ displays when finished.
    

The wizard is for _updating_ existing residents as well as creating new ones — when generating the template, including existing residents produces a row pre-filled with their current data, which can then be overwritten in the spreadsheet.

### 4\. Manual entry

Available to GME under Resident Demographics → Add New Resident, gated by `demo_resident_newStr`. By default, GME and Program Administrators (with appropriate access) can add residents.

Manual entry is the right path when:

*   A single one-off resident needs to be added (transferring in mid-year, etc.)
    
*   A test/sandbox resident is needed for support purposes
    
*   ERAS or New Resident Import is unavailable for the source data
    

> **Caution: don't manually add residents who are also in an upcoming ERAS or New Resident Import.** Duplicates result.

## Updating an existing resident

From User Management → Residents → select the resident. Administrators have write access to all fields they have permission for (per institution's `Resident Fields` configuration).

A few specific update behaviors:

### Username changes

*   **Usernames must be unique across the institution.** If a username modification doesn't stick, another active user has the same username. Support can search to identify the conflict. The fix is typically to rename the conflicting (often inactive) account by prefixing/suffixing an `x`.
    
*   **Resident Email Swap Wizard** (`setting_wizardA` index 17) is a specific tool for swapping email addresses for residents in batch — used when an institution migrates email domains (`@old.edu` → `@new.edu`) or onboards residents who initially had personal emails and now have institutional ones. Run from **Home → Task Wizards → Resident Email Swap Wizard**.
    

### Photos

Photos can be uploaded individually on the resident's profile, or in bulk via the **Batch Photo Upload Wizard** (`setting_wizardA` index 16). The wizard's behavior is identical regardless of user type — see **MedHub - Demographics — Faculty** §"Adding faculty photos in bulk: Batch Photo Upload Wizard" for the full mechanics. The same naming-convention rules apply (filename matches Name, MedHub Username, or Employee ID Number).

### Self-service updates

Residents can update their own basic contact information (home address, home phone, etc.) when the institution permits. The fields available for self-service are configured at the institution level via Resident Fields → Read/Write configuration. Sensitive fields (training history, contracts, etc.) are admin-only.

### Mass updates

For bulk updates across many residents, use the Resident Demographics Batch Import wizard (above).

## Lifecycle

### Active and Access

Two checkboxes beneath the Demographics tab:

*   **Active** — controls whether the resident is currently active in the program. Most-active behaviors are controlled by training history (see **MedHub - Training History** §"What 'current,' 'active,' and other status terms mean"), but the Active checkbox is a manual override.
    
*   **Access** — controls direct MedHub access. Removing access blocks login but preserves the profile.
    

### Archive vs delete

*   **Archive** — like faculty, residents can be archived. Archived residents do not show on standard reports but retain all data.
    
*   **Permanent delete** — only available when the resident has training history records that are entirely in the future, or when their current training history record is at another institution. See **MedHub - Training History** §"Permanent deletion of a resident profile."
    

### Transitions

*   **Resident-to-Faculty Transition** — when a graduating resident becomes faculty at the institution. See **MedHub - Demographics — Faculty** §"Resident-to-Faculty Transition."
    
*   **Internal program transfer** — handled by GME via training history modification. See **MedHub - Training History** §"Internal transfer between programs."
    
*   **Student-to-Resident Transition** — deprecated. The wizard exists in `setting_wizardA` (index 15) but is no longer recommended for use.
    

## Custom demographics field configuration workflow

Unlike Faculty Demographics, the Resident profile supports **custom demographic fields** that institutions can request beyond the hardcoded defaults. Examples: a "Hospital ID" field specific to a client's HR integration, a "Track Designation" field for institution-specific track programs, or a free-text "Special Interest" field for capturing data the standard fields don't cover.

### Internal workflow for setting up a custom field

When a client requests a new custom demographic field, the supported workflow is:

1.  **Confirm scope.** Is the field for residents, students, or faculty? (Faculty does not support custom fields beyond Faculty Department; Student does support them.) For residents, confirm the field is institution-wide or program-specific.
    
2.  **Confirm field type.** Common types:
    
    *   Text (free-text input)
        
    *   Number
        
    *   Date
        
    *   Dropdown (with a defined list of options)
        
    *   Checkbox (yes/no)
        
    *   Multi-select (multiple checkbox options)
        
3.  **Confirm display configuration.** Should the field be visible to: Program Admin? Coordinator? Resident self-view? GME? Read or write per role?
    
4.  **Confirm data location.** Custom fields populate a `users_residents_*` extended table, with the field configured in the root-side Resident Fields page.
    
5.  **Add the field on the root side.** As a Support user with root access:
    
    *   Navigate to **Resident Fields** in global navigation
        
    *   Add a new field with the appropriate name (the internal name; cannot have spaces or special characters; must start with a letter)
        
    *   Set the title (the display label)
        
    *   Set Status = Active
        
    *   Set Admin Access = Write (or Read, depending on the request)
        
    *   For dropdown fields, populate the options list
        
    *   Save
        
6.  **For dropdown options that need ongoing management.** If the dropdown options should be managed by a non-root user (typically GME or Student Admin), configure the access setting that allows the relevant user type to manage that list (similar to `faculty_dept_accessA` for Faculty Department — there's a parallel access setting for resident custom fields).
    
7.  **Confirm with the client.** Walk through the new field with the client, confirm visibility and access, and have them populate test data on a sandbox resident before going live.
    

> **Field naming rules are strict.** Field names cannot contain spaces. They must start with a letter, contain only alphanumeric characters and underscores, and are case-sensitive. (This is the same constraint as away conference custom fields — see **MedHub - Absences** §"Conference (away)" — applied across the system.) Field titles can have spaces, special characters, etc.; only field names are restricted.

> **Renaming or removing custom fields after data is populated.** Once data has been entered into a custom field, removing the field destroys that data. Renaming the field's title is safe; renaming the underlying field name is not (it's tantamount to creating a new field and abandoning the old one). For data preservation, custom fields should be inactivated rather than deleted.

> `[VERIFY: ]` Coverage of root-side custom field configuration in this doc is based on inference from related documented patterns (Faculty Department, Conference custom fields). The exact root-side UI flow for adding resident custom fields may differ in current product. Coverage from internal Confluence on the root-side workflow would strengthen this section — recommend Emma's review of the workflow steps above and addition of any missing steps.

## Lapsing in training, leaves, and gaps

Resident demographics intersect with several training-history-driven states:

### Leave of Absence (LOA)

LOAs are managed through Absences (see **MedHub - Absences** §"Leaves of Absence"), but they have a training-history side effect:

*   **Extending training history via LOA.** When the LOA's Extend Training History checkbox is set with extension days, MedHub creates a new training history record for the LOA period and pushes the resident's end date back. From the demographics view, this appears as a new training history row.
    
*   **The "Inactive" status during LOA.** Trainees on LOA appear as Inactive (per **MedHub - Absences** §"LOA and trainee access") and lose access overnight. From the demographics view, this is reflected in the Active checkbox state.
    

### Lapse in Training

A "Lapse in Training" Post Graduate Event type records a gap in training. From the demographics view, it appears as a training history row of type Lapse in Training. The "Contract pending final approval" message that displays on these records is by design (see **MedHub - Training History** §"Other things to know").

## Common scenarios

### "I added a resident manually and now they appear twice after I ran the ERAS import"

Manual additions before ERAS imports cause duplicates. Identify which profile to keep (the ERAS-imported one is usually preferred because it has the full ERAS data), then delete the duplicate via Permanently Delete this Resident — possible only if no past or current training history is on the duplicate. If both profiles have training history, escalate to Tier 2 / Data team for merge.

### "Resident's PGY shows as -1 or -2"

Medical school end date on the Education tab is in the future. Correct the date.

### "Resident can't log in but their training history record is current"

Walk through:

1.  Active checkbox state — is it checked?
    
2.  Access checkbox state — is it checked?
    
3.  Username and email correct?
    
4.  Have they been archived?
    
5.  Did the Resident Status Update overnight script run since the most recent training history change?
    

### "Resident transitioned to faculty but their procedure logs are missing"

Resident-to-Faculty Transition Wizard preserves the Resident account (inactivated). Historical procedure logs as a resident remain on the (now-inactivated) Resident account. To consolidate, escalate to Combine Faculty Profiles after the transition. Rare; check with Support first.

### "Need to bulk-update email addresses for an entire program"

Use the **Resident Email Swap Wizard** (`setting_wizardA` index 17). This is the supported tool for batch email changes.

### "Need to add a custom field tracking \[institution-specific data\]"

Walk through the custom field workflow (above). Confirm scope, type, access, and visibility. Add via Resident Fields on the root side.

### "Custom field's data isn't saving"

Field name probably has spaces or special characters. Field names must start with a letter, contain only alphanumerics and underscores, and have no spaces. Field titles can be flexible; field names cannot.

### "Resident appears in the dropdown but I can't open their profile"

Default program may be inactive (similar pattern to Faculty Demographics — see **MedHub - Demographics — Faculty** §"Why default program matters" — though for residents this is less common because residents are typically tied to a single program at a time).

## Open questions for Emma

*   `[VERIFY]` The custom demographic field configuration workflow described in §"Custom demographics field configuration workflow." This is based on inference from related documented patterns; the exact root-side UI flow may have specific steps I haven't captured. Recommend you review the workflow steps and add any missing detail.
    
*   `[VERIFY]` The Resident Email Swap Wizard exists in `setting_wizardA` index 17 but I don't have detailed UI documentation for its flow. Adding step-by-step would strengthen this doc when source coverage is available.
    
*   `[VERIFY]` Whether the Student-to-Resident Transition Wizard is fully deprecated or just discouraged. The page tracker has it as deprecated per your guidance, but the wizard list (`setting_wizardA` index 15) still references it.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`demo_resident_newStr`

Controls which roles can add new residents. Array — value 3 in the array allows Program Administrators to add residents in addition to GME.

`setting_gme_delete_resident`

Whether non-Super-Admin GME users can permanently delete resident profiles when training history is future-only or at another institution (0 = off, 1 = on).

`setting_demo_training_acmr`

Enables Chief start/end date and bonus fields on training history records (referenced from Resident Demographics → Training History tab).

`setting_demo_training_bc`

Enables the Board Certified field on training history records.

`setting_demo_training_transition`

Controls visibility of the Transition/Termination field on training history records.

`setting_wizardA` (index 3)

Per-user-type access to ERAS Demographics Import Wizard.

`setting_wizardA` (index 4)

Per-user-type access to Resident Demographics Batch Import.

`setting_wizardA` (index 6)

Per-user-type access to New Resident Import Wizard.

`setting_wizardA` (index 16)

Per-user-type access to Batch Photo Upload Wizard (used for residents, faculty, students).

`setting_wizardA` (index 17)

Per-user-type access to Resident Email Swap Wizard.

`term_resident_applicationsStr`

Term-translatable string for Onboarding (the GME-side onboarding feature for incoming residents). See **MedHub - Onboarding**.

Resident Fields configuration (the controlled set of demographic fields, including any institution-specific custom fields) is managed through **Resident Fields** on the root side, which controls Status (Active/Inactive) and Admin Access (Read/Write) for each field.

## Database tables appendix

Table

Purpose

`users_residents`

Primary resident profile records. One row per resident. Contains demographics, contact info, identifiers, Active/Access flags.

`users_residents_pg`

Resident training history (Post Graduate Event records). See **MedHub - Training History**.

`users_residents_pg_appt`

Per-academic-year appointments inside Post Graduate Event records.

`users_residents_education`

Education tab records (medical school, undergraduate, etc.).

`users_residents_certifications`

Certifications tab records (board cert, BLS/ACLS, USMLE, etc.).

`users_residents_files`

Forms/Files tab uploads.

`users_residents_custom_*`

Custom demographic fields (extended tables; named per institution's configured custom fields).

`users_residents_loa`

LOA records. See **MedHub - Absences**.

`users_residents_vacations` / `_sick` / `_conferences`

Absence records. See **MedHub - Absences**.

`users_residents_spt`

Visiting Training Periods (overlap method). See **MedHub - Training History**.

`users_residents_discipline`

Discipline records.

The Resident user type also has program associations (`users_residents_programs` or similar — confirm in **MedHub - Database Schema Reference** when drafted) and role-specific tables for chief resident designation, mentor relationships, etc.

# MedHub - Procedures - markdown

# MedHub - Procedures

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Procedures in MedHub track the clinical procedures that trainees perform — surgery cases, line placements, intubations, deliveries, and so on — for two primary purposes: meeting ACGME / specialty case-log requirements, and demonstrating procedural competency through verifications and certifications. The Procedures module is moderately complex; the most nuanced parts are **verifications, certifications, and levels of supervision**, all of which are addressed in detail below.

This document covers Procedures end-to-end: procedure list configuration; how trainees log procedures; verifications and certifications; the levels-of-supervision framework; the Supervising Program list and what it controls; the Procedure Cleanup Wizard; the Case Log Import Wizard (UME); reporting on procedures; and operational patterns.

It does not cover: external case log integrations (ACGME ADS, ABS data — these are separate doc), the Conferences module's Lecturer dropdown logic that depends on the Supervising Program list (cross-referenced in **MedHub - Conferences**), or evaluation forms that incorporate procedure data.

## Where it lives

Procedures are accessed via the **Procedures** tab in the global navigation. Within the tab, the Program Administrator (or Course Coordinator on the UME side) sees:

*   **Procedure Logs** — view, filter, search trainee procedure logs
    
*   **Manage Procedures** — define procedures (the procedure list), CPT codes, complexity levels, levels of supervision
    
*   **Procedure Requirements** — minimums per PGY level
    
*   **Verifications** — view pending and completed verifications
    
*   **Certifications** — view residents certified to perform specific procedures
    
*   **Supervising Program List** — programs eligible to supervise procedures done by this program's trainees
    

The Program Settings → Procedures tab controls procedure-related program-level behavior (Certify Residents for Procedures setting, Verification requirements, etc.).

## Procedure list

Each program defines its own list of procedures (or copies a base list and modifies). The list lives in `procedures_definitions` and is keyed per program.

### Procedure attributes

Each procedure definition has:

*   **Name** — the procedure name as it will appear in the dropdown trainees pick from
    
*   **CPT code(s)** — optional but commonly populated; CPT codes can be a single code or a list
    
*   **Category / type** — used for grouping in reports
    
*   **Complexity / minimum count** — for some specialties, complexity levels (Simple, Moderate, Complex) are tracked separately
    
*   **Required PGY levels** — which PGY levels must perform this procedure
    
*   **Minimum count** — required per PGY level
    
*   **Verification required** — whether a verifier (faculty supervisor) must attest to the procedure
    
*   **Active** flag
    

> **Procedure list is per-program by default.** Two programs at the same institution can have different procedure lists. For some specialties (e.g., Internal Medicine subspecialties), the program copies from a base list maintained at the IM level and customizes.

### Building / updating the procedure list

Procedures are added under **Procedures → Manage Procedures → Add Procedure**. For institutions onboarding, the standard pattern is to import a starter list from the specialty board's published case requirements, then refine.

> **CPT code population.** Programs may want to populate CPT codes alongside procedure names. CPT codes drive certain reports and integrations with external case log systems (ACGME, ABS). The CPT code field accepts a single code or a list (with semicolon separators or similar — confirm format per institution).

## Logging procedures

Trainees log procedures from their home page → **Procedures → Log a Procedure**. The log entry includes:

*   **Procedure** — selected from the program's procedure list
    
*   **Date** — date the procedure was performed
    
*   **Patient** — patient identifier (typically MRN or de-identified ID)
    
*   **Setting** — inpatient / outpatient / OR / etc.
    
*   **Diagnosis** — primary diagnosis associated with the procedure
    
*   **Role** — the trainee's role (Primary Surgeon, Assistant, Observed, etc.)
    
*   **Level of supervision** — see "Levels of supervision" below
    
*   **Supervising faculty** — the faculty member who supervised the procedure
    
*   **Notes** — free-text
    

After submission, the log entry can be edited or deleted by the trainee until it is verified by the supervising faculty (depending on configuration). After verification, edits typically require admin assistance.

### Logging via mobile

Trainees can log procedures from the MedHub mobile app. Mobile-side logging supports the same fields with simplified UI.

### Bulk import

For institutions migrating from another system or onboarding a class with historical case logs, the **Case Log Import Wizard** (UME-side) supports bulk import of procedure logs from an Excel template. The wizard is UME-side per current configuration; for GME-side bulk imports, contact MedHub Support for direct database imports.

## Verifications

A **verification** is when a supervising faculty member (or designated verifier) confirms that the procedure log entry is accurate — that the trainee did indeed perform the procedure at the indicated level of supervision and role.

### When verification is required

Verification is configured per-procedure (in the procedure list) and per-program (via Program Settings → Procedures). Common patterns:

*   **All procedures require verification** (most rigorous; standard for surgery and surgical subspecialties)
    
*   **Specific procedures require verification** (e.g., complex procedures only)
    
*   **No verification required** (rare; only used when the institution has a separate verification process)
    

### How verification works

1.  Trainee logs the procedure with a supervising faculty member identified.
    
2.  The supervising faculty receives an email notification (and an Urgent Task) to verify.
    
3.  The faculty opens the verification, reviews the log entry, and either:
    
    *   **Verifies** — the log entry is finalized and counted toward requirements/certifications
        
    *   **Disputes / rejects** — the log entry is returned to the trainee with comments for correction
        

### Verification timing and reminders

*   **Email notifications** go to the supervising faculty when the procedure is logged.
    
*   **Late verification reminders** can be configured at the program level — typically 7 days, 14 days, etc.
    
*   **Faculty must have an active MedHub account** to receive verifications. Outside Evaluators or non-Faculty supervisors cannot verify procedures (see "Off-program / outside supervisors" below).
    

### Self-verification (rare and discouraged)

Some institutions allow trainees to self-verify procedures (typically attendings observed, no faculty involvement). This is configured per-procedure and is rare in standard configurations. Self-verified procedures may not count toward all certifications depending on specialty board rules.

### Bulk verification

Verifications cannot be performed in bulk by default — each verification is reviewed individually by the supervising faculty. Some programs request bulk-verify access for chiefs or for end-of-year cleanup; this is not a supported workflow.

## Certifications

A **certification** in MedHub is the designation that a trainee is **certified** to perform a procedure independently — they have met the program's threshold of supervised performances and are now permitted to perform the procedure unsupervised.

### How certification works

1.  Program defines certification requirements per procedure: typically a minimum count at a specific level of supervision (e.g., 5 procedures at "Performed with Supervision" before being eligible for "Certified to Perform Independently").
    
2.  As the trainee logs procedures and they get verified, the count accrues.
    
3.  Once the threshold is met, the trainee can be certified — either manually (by the Program Director or a designated mentor) or, in some configurations, automatically.
    

### Manual certification

The Program Director (or a mentor with `Certify Residents for Procedures` enabled — see Program Settings → Procedures) reviews the trainee's procedure log and clicks **Certify** for the procedure. The certification is then attached to the trainee's record.

### Automatic certification

Some institutions configure automatic certification when the threshold is met. This is less common; most programs prefer the explicit step of a faculty signing off.

### Mentor certification access

When **Certify Residents for Procedures** program setting is enabled, mentors (faculty designated as mentors to specific trainees) can certify their mentees for procedures. This is one of the access privileges granted by mentor designation, alongside viewing mentee evaluations, viewing mentee work hours, etc. (See **MedHub - Demographics — Faculty** §"Mentor designation.")

### Certification revocation

Certifications can be revoked by the Program Director if a trainee subsequently demonstrates incompetence or if the certification was issued in error. The trainee's certification status reverts to "not certified," and they require re-supervision until re-certified.

### "Certification recorded by Another Program"

When a trainee transfers between programs internally, certifications earned in the prior program may appear as "Certification recorded by Another Program" entries in the new program's Certifications tab. The record cannot be removed (it preserves the history), but it can be addressed by enabling the certification field for the new program. (Documented in **MedHub - Training History** §"Other things to know.")

## Levels of supervision

The **levels of supervision** framework records how independently the trainee performed the procedure. Standard levels:

*   **Observed** — the trainee observed but did not perform
    
*   **Assisted** — the trainee assisted; the supervising faculty performed
    
*   **Performed with Direct Supervision** — the trainee performed; faculty was physically present and directly supervising
    
*   **Performed with Indirect Supervision** — the trainee performed; faculty was available but not in the room
    
*   **Performed Independently** — the trainee performed independently (typically only available after certification)
    
*   **Teaching** — the trainee performed and taught a junior trainee
    

The exact list and labels vary by specialty and institution. Levels are configured per-program in Procedure Requirements.

### Why levels matter

The level of supervision drives:

*   **Counting toward requirements** — many specialty board requirements specify a minimum count at "Performed with Supervision" or higher
    
*   **Eligibility for certification** — programs may require N supervised performances before certification
    
*   **Reporting** — levels appear on the Resident Procedure Summary report
    

### Changing levels after the fact

If a procedure was logged with the wrong level (e.g., the trainee selected "Performed with Direct Supervision" but should have been "Performed Independently" because the trainee was already certified), the trainee can edit the log entry until verified. Once verified, the trainee asks a Program Administrator to delete the entry; the trainee then re-logs and re-verifies with the correct level.

## Supervising Program list

A specific concept in the Procedures module: each program has a **Supervising Program list** (Procedures → Supervising Programs) that defines which programs are eligible to supervise procedures done by this program's trainees.

### Why this list exists

When a trainee logs a procedure, they pick a supervising faculty member from a dropdown. The dropdown is filtered by the Supervising Program list — only faculty in those programs appear.

The list also affects the Conferences Lecturer dropdown — adding a program to the Supervising Program list makes residents from that program appear in conference lecturer dropdowns (see **MedHub - Conferences** §"Lecturer dropdown" — this is the only documented use of the Procedures Supervising Program list outside Procedures itself).

### Configuring the list

1.  Navigate to **Procedures → Supervising Programs**.
    
2.  Click **Update Program List** (or similar).
    
3.  Check the boxes for programs that should be eligible to supervise procedures.
    
4.  Save.
    

The Default Supervising Program is the program itself (the program the list belongs to). Adding other programs is necessary when:

*   The institution has overlap programs where one program's faculty supervises another's trainees (Internal Medicine → Cardiology fellowship; Pediatrics → PICU)
    
*   The trainee rotates through other programs and needs to log procedures supervised by faculty in those programs
    

### Off-program / outside supervisors

Trainees can log procedures supervised by faculty in programs on the Supervising Program list. They cannot log procedures supervised by **off-program evaluators** (faculty in other programs added only as evaluators) or **outside evaluators** (external faculty without MedHub Faculty accounts). For procedures supervised by these users, the log entry can identify the supervisor in a free-text field, but no automated verification flow is possible — the verification is captured outside MedHub.

## Procedure Cleanup Wizard

The **Procedure Cleanup Wizard** (`setting_wizardA` index 9) helps Program Administrators clean up stuck procedure log entries — duplicates, orphans, or entries with data integrity issues.

Available under **Home → Task Wizards → Procedure Cleanup Wizard**. Default access is configurable per-institution; commonly available to GME and Program Administrators.

### What it does

The wizard surfaces procedure log entries that have one of several issues:

*   **Duplicate entries** — same trainee, same procedure, same date, same patient
    
*   **Orphaned entries** — log entries where the supervising faculty no longer exists in the system (archived, deleted)
    
*   **Stuck verifications** — log entries pending verification for a long time where the supervisor cannot or will not respond
    

The Program Administrator (or GME) reviews the surfaced entries and can:

*   Delete duplicates
    
*   Reassign orphans to a different supervisor
    
*   Manually resolve stuck verifications (by deleting the entry, re-logging, or escalating)
    

### When to use it

Run the Procedure Cleanup Wizard:

*   At year-end to clean up the year's accumulated stuck entries
    
*   When a faculty member archives and leaves orphaned verifications behind
    
*   When data integrity issues are reported (duplicates, ghost entries)
    

### When NOT to use it

The wizard is not for routine maintenance. Day-to-day verification management happens in the standard Verifications page. The wizard is the cleanup tool for entries that have escaped the standard flow.

## Case Log Import Wizard (UME)

The **Case Log Import Wizard** (UME-side) imports student procedure and diagnosis logs from an Excel file. Used for bulk import of historical case logs at onboarding.

Available under UME-side **Task Wizards → Case Log Import Wizard**.

### How it works

1.  Generate an import template from the wizard.
    
2.  Populate the template with case log entries (one row per entry, with columns for student, procedure, date, supervisor, etc.).
    
3.  Upload the populated template.
    
4.  The wizard imports each row as a procedure log entry on the corresponding student's profile.
    

### Behaviors

*   **The wizard imports historical entries**, but the verification status is set per the import (typically "verified" for historical entries, since the verification was captured outside MedHub).
    
*   **Procedure list must exist** — the procedures in the import must match the program's procedure list. Mismatches cause import errors.
    
*   **Supervising faculty must exist** — the supervisors named in the import must have MedHub Faculty accounts in the supervising program list, or the import will flag those rows.
    

## Reporting on procedures

Standard procedure reports (under Reports → Procedures or via Procedure Logs view):

*   **Resident Procedure Summary** — counts by procedure, by level of supervision, per trainee
    
*   **Procedure Requirements Status** — measures actual count against required minimums; identifies gaps
    
*   **Verification Statistics** — counts of verified, unverified, disputed
    
*   **Certification Status Report** — which trainees are certified for which procedures
    

A few specific reporting behaviors:

*   **Date filtering** — procedure reports default to the academic year; date range filters are available for custom periods.
    
*   **Level of supervision rollup** — reports may roll up "Performed with Direct" and "Performed with Indirect" supervision into "Performed with Supervision" depending on the report variant. Confirm the report definition for the institution's preferred rollup.
    

## Common scenarios

### "Trainee logged a procedure but the supervising faculty isn't getting the verification email"

Walk through:

1.  Is the supervisor a Faculty user with an active account?
    
2.  Is the supervisor in a program on the trainee's Supervising Program list?
    
3.  Did the trainee select the correct supervisor from the dropdown? (If they typed in a name in a free-text field instead of selecting from dropdown, no email is sent.)
    
4.  Are the supervisor's email notifications enabled?
    

### "Trainee can't see the procedure I want them to log"

The procedure isn't in the program's procedure list. Add it via Procedures → Manage Procedures → Add Procedure.

### "Faculty in another program isn't appearing in the supervisor dropdown"

The other program isn't on this program's Supervising Program list. Add via Procedures → Supervising Programs → Update Program List.

### "I need to bulk-import historical case logs for new students"

UME: use the Case Log Import Wizard. GME: contact MedHub Support for direct database import; the GME-side does not have an equivalent wizard.

### "Verification has been pending for 30+ days and the faculty is unresponsive"

Use the Procedure Cleanup Wizard to identify stuck verifications. Either reassign to a different supervisor (if appropriate), delete and re-log, or contact the faculty directly outside MedHub.

### "Trainee was certified but procedure count says they're not eligible"

Manual certification doesn't require meeting the count threshold; a Program Director can certify based on judgment. If the trainee was auto-certified but shouldn't have been, revoke the certification and adjust the threshold or counting rules.

### "Procedure log entry shows wrong level of supervision and is already verified"

Trainee asks Program Administrator to delete the entry; trainee re-logs with the correct level; supervisor re-verifies. There is no edit-after-verification path.

### "Duplicate procedure entries"

Run the Procedure Cleanup Wizard. If the wizard doesn't catch the duplicates, review manually and delete one entry.

### "'Certification recorded by Another Program' showing in trainee's profile"

This is a transfer artifact. Cannot be removed; address by enabling the certification field for the new program.

### "Procedure count looks wrong on the requirements report"

Check:

1.  Is the trainee's training history record covering the dates of the logged procedures?
    
2.  Are the procedures verified (unverified procedures may not count depending on the report variant)?
    
3.  Is the level of supervision counted by this report? (Some reports only count "Performed with Supervision" or higher.)
    
4.  Are the requirements set correctly for this trainee's PGY level?
    

## Open questions for Emma

*   `[VERIFY]` Procedure Cleanup Wizard's UI flow and exact filters. The wizard exists in `setting_wizardA` index 9; my description is based on inference from related cleanup wizards. Recommend you review the wizard's actual flow.
    
*   `[VERIFY]` Whether there's a GME-side equivalent of the Case Log Import Wizard, or whether GME bulk procedure import is exclusively a database/support workflow.
    
*   `[VERIFY]` The exact list of standard supervision levels per `setting_proceduresXX` setting — my listing is based on common values across institutions; the actual root setting may have different defaults.
    
*   `[VERIFY]` Whether the auto-certification configuration is actively used at any client, or whether all certifications are manual in current product.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_procedures_supervision_levels`

Configurable list of supervision levels available in the level-of-supervision dropdown.

`setting_procedures_verification_required`

Master toggle for procedure verification at the institution level.

`setting_procedures_certify_residents` (per-program)

Enables mentors to certify their mentees for procedures (`Certify Residents for Procedures` program setting).

`setting_procedures_late_verification_days`

Days before late verification reminder is sent.

`setting_procedures_self_verify`

Enables trainee self-verification for specific procedures (rare).

`setting_procedures_auto_certify`

Enables automatic certification when threshold is met.

`setting_wizardA` (index 9)

Per-user-type access to Procedure Cleanup Wizard.

Procedures-related program-level settings (configured under Program Settings → Procedures):

*   Verification requirements (per-procedure granularity)
    
*   Certify Residents for Procedures (mentor certification access)
    
*   Late verification reminder thresholds
    
*   Self-verification permissions
    
*   Required PGY levels per procedure
    

The Case Log Import Wizard is UME-specific and not represented in `setting_wizardA`. It's accessed from the UME-side Task Wizards page.

## Database tables appendix

Table

Purpose

`procedures_definitions`

The program's procedure list — names, CPT codes, complexity, required levels. One row per procedure per program.

`procedures_logs`

Trainee procedure log entries. One row per logged procedure. Contains date, patient, level, supervisor, role, notes.

`procedures_verifications`

Verification records. One row per verification. Contains supervisor, status (pending / verified / disputed), comments.

`procedures_certifications`

Certification records. One row per (trainee, procedure) certification. Contains certifying user, date, revocation date if applicable.

`procedures_requirements`

Required minimums per procedure per PGY level.

`procedures_supervising_programs`

Per-program list of programs eligible to supervise this program's trainees.

`procedures_categories`

Procedure categories for grouping.

`procedures_logs_diagnoses`

Diagnoses associated with a procedure log entry.

`procedures_logs_files`

Files attached to procedure log entries (rare).

`procedures_audit`

Audit trail for procedure log changes.

UME-side procedure / case log tables share schema with GME (joined via the user type). Student-specific procedure log tables, if separate, are documented in **MedHub - Database Schema Reference** when drafted.

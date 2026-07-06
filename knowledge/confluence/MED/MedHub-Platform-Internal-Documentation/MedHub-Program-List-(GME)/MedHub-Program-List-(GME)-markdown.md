# MedHub - Program List (GME) - markdown

# MedHub - Program List (GME)

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The Program List is the GME-side institutional registry of residency and fellowship programs. Each program is a distinct training entity with its own ACGME accreditation status, its own administrators and trainees, its own services and schedules, and its own evaluations and reporting. The Program List is the foundational structural element of GME-side MedHub — virtually every other module references program ID.

This document covers the Program List as a feature: program attributes, program types and how they affect downstream behavior, ACGME accreditation tracking, the relationship between programs and the GME Office, default site / billing, the program lifecycle (creation, modification, archive), and the operational patterns that come up repeatedly in support tickets.

It does not cover:

*   **Program-level settings** — covered in **MedHub - Implementation & Configuration** when drafted; per-program settings appear in many module-specific docs (Scheduling, Evaluations, Procedures)
    
*   **The Program Director's evaluation access** — covered in **MedHub - Demographics — Faculty** §"Program Director" and **MedHub - Evaluations — GME**
    
*   **Program Scorecards** — separate doc
    
*   **Resident Demographics** for the trainees in the program — covered in **MedHub - Demographics — Resident**
    

## Where it lives

The Program List is accessed from the GME-side global navigation:

*   **Program List** in the GME Office menu — registry of all programs at the institution
    
*   Each program's individual settings are accessed by clicking the program name → Program Settings tabs
    

GME Office users have full read/write access to the Program List. Program Administrators have access only to their own program's settings (not to other programs in the list).

## Program attributes

Each program in the Program List has:

*   **Name** — display name (e.g., "Internal Medicine Residency")
    
*   **Abbreviation** — used in dropdowns and reports (e.g., "IM")
    
*   **ACGME Program ID** — the official ACGME identifier
    
*   **Specialty / Subspecialty** — used for milestone package matching
    
*   **Program Type** — Residency, Fellowship, Internship, Other
    
*   **Status** — Active / Inactive
    
*   **Default site / Default cost center** — for billing / IRIS attribution when no service-level override exists
    
*   **Program Director** — faculty lead
    
*   **Associate Program Directors** — faculty co-leads
    
*   **Program Administrator(s)** / **Backup Administrator(s)** — admin lead(s)
    
*   **Coordinator(s)** — additional administrative staff
    
*   **GME Office contact** — designated GME Office liaison
    
*   **PGY range** — typical level range (PGY1-3, PGY4-6, etc.)
    
*   **Default schedule structure** — block configuration (12 blocks, 13 blocks, weekly, custom)
    
*   **IRIS Reimbursable** — whether trainees in this program count toward IRIS reimbursement (see **MedHub - IRIS** when drafted)
    
*   **Description**
    

## Program types

The Program Type field controls some downstream behaviors:

*   **Residency** — primary training programs (3-7 years typically). Trainees use the Resident user type, with Residency Post Graduate Event records.
    
*   **Fellowship** — post-residency subspecialty training (1-3 years typically). Trainees use the Resident user type with Fellowship Post Graduate Event records.
    
*   **Internship** — typically merged into Residency PGY1 in MedHub; rare to have a standalone Internship program.
    
*   **Other** — non-standard training entities; rare.
    

Program Type does not strictly enforce trainee type — a program designated as Fellowship can still have residents (i.e., the program's name is decoupled from individual trainee classifications). The training history record on each trainee is what authoritatively classifies them.

## ACGME Program ID

The ACGME Program ID is the official identifier issued by the Accreditation Council for Graduate Medical Education. It identifies the program in ACGME's WebADS system and is used for:

*   ACGME case log integrations
    
*   Milestone reporting to ACGME
    
*   Annual ADS update submissions
    
*   Some institution-side reporting
    

The ACGME Program ID must be set per-program for ACGME-recognized programs. Non-ACGME programs (e.g., institution-internal training programs) leave it blank.

## Default site and cost center

Each program has a default site and default cost center used when scheduling activities (services, shifts, clinics) don't have their own site/cost center override.

> **Why this matters.** The default site drives billing attribution for time that doesn't have a more specific assignment. If the default site is wrong, billing reports may attribute time to the wrong location. See **MedHub - Scheduling** §"Site Lock" for related concepts.

## Program lifecycle

### Creating a new program

New programs are added by Support during institution implementation, or by GME Office during expansion. The creation flow:

1.  **GME submits a request** with program name, abbreviation, ACGME ID, type, etc.
    
2.  **Support adds the program record** in the Program List.
    
3.  **Implementation team configures program-level settings** — workflows, evaluations, scheduling, etc.
    
4.  **Default site, cost center, payer** are set.
    
5.  **Initial admin assignments** — Program Administrator, Coordinator, Director are added.
    
6.  **Test trainee** is added to verify the program is fully functional.
    

### Modifying a program

Most program-level changes happen through Program Settings tabs (per program), accessible to the Program Administrator and GME. Changes to:

*   **Program Director / Associate Director** — adjusted via Program Settings → General tab
    
*   **Workflow approvers (chiefs)** — adjusted via Program Settings → General tab (per academic year)
    
*   **Evaluation configuration** — Program Settings → Evaluations tab
    
*   **Schedule configuration** — Program Settings → Schedules tab
    
*   **Conferences** — Program Settings → Conferences tab
    
*   **Procedures** — Program Settings → Procedures tab
    

Higher-level program attributes (name, abbreviation, ACGME ID, type) are typically changed by GME or Support, not Program Administrators.

### Inactivating a program

When a program is no longer offered:

1.  Set Status to Inactive
    
2.  The program is removed from active dropdowns and reports
    
3.  Trainees in the program at the time of inactivation continue to be tracked under the inactive program
    
4.  Historical evaluations, conferences, and other data are preserved
    

> **Cannot delete a program.** Programs can only be inactivated, not deleted. Deletion would orphan all the program's data (trainees, evaluations, schedules, etc.).

### Default program changes for faculty

When a program is inactivated, faculty whose default program is that program will hit the "missing default program" symptoms (blank screen, SSO 500, can't be reactivated). See **MedHub - Demographics — Faculty** §"Why default program matters." The fix is to update the faculty's default program before inactivating, or after via the data team.

## Program splits and reconfigurations

When a program changes its split-schedule structure (e.g., adding a new split for a new track, or merging splits), Support performs a backend reconfiguration. This affects:

*   The program's schedule (`sh_schedules`) records
    
*   Associated services (`sh_schedules_services`) — typically copied to the new structure
    
*   Trainee training history records that cross 7/1 boundaries — force-split into pre/post records
    
*   Contracts associated with split records — also force-split
    

See **MedHub - Scheduling** §"Special schedule configurations" and **MedHub - Training History** §"Split schedules and the 7/1 boundary" for details.

## Common scenarios

### "Program Director isn't seeing all the program's evaluations"

Walk through:

1.  Is the PD's faculty profile pointing to this program as their default program (or at least an associated program)?
    
2.  Is the PD's faculty role set to Program Director on the Program Settings → General tab?
    
3.  Are individual faculty evaluations restricted by `setting_eval_pd_faculty_individual` or similar setting? If so, the PD has program/service access but not individual.
    
4.  Is the PD trying to see evaluations of themselves? PDs cannot see evaluations of themselves (see **MedHub - Evaluations — GME** §"Confidentiality framework").
    

### "Program is showing an old academic year's chiefs"

Chiefs are assigned per-academic-year. Update via Program Settings → General → academic year selector → designate chiefs.

### "Need to add a new program mid-year"

GME submits a request with program details. Support adds the program record. Initial trainees can then be added via ERAS Demographics Import or manually. Program Settings need to be configured before trainees become functional in the system.

### "Program shows the wrong specialty in milestone reports"

The Specialty / Subspecialty field on the program affects milestone package matching. If milestones aren't loading correctly for this program, verify the specialty matches what ACGME publishes for milestones. Update via the Program Settings page.

### "Program needs a new schedule split"

This is a backend reconfiguration. GME submits a request to Support with the desired split structure. Support performs the reconfiguration, which may force-split training history records and contracts (see **MedHub - Training History** §"Split schedules and the 7/1 boundary" — always CC GME on the implications).

### "Default program for a faculty / trainee is showing as inactive"

The default program has been inactivated. Either reactivate it or update the user's default program to a different active program. See **MedHub - Demographics — Faculty** §"Why default program matters" for the full pattern.

## Open questions for Emma

*   `[VERIFY]` The exact flow for institution-internal program creation. My description is based on inference; the actual GME-side UI may have specific steps for creating a program record without Support intervention.
    
*   `[VERIFY]` Whether ACGME Program ID validation is enforced (e.g., format check, uniqueness check) or just recorded as free-text.
    
*   `[VERIFY]` The full list of Program Type options and any specific behaviors tied to types other than Residency / Fellowship.
    
*   `[VERIFY]` Whether IRIS Reimbursable per-program is a hard toggle or whether per-trainee Non-Reimbursable flags can override.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_program_types`

List of valid Program Type options.

`setting_acgme_required`

Whether ACGME Program ID is required for new programs.

`setting_program_default_site_required`

Whether default site is required for new programs.

Program-level settings are configured per-program via the Program Settings tabs (General, Evaluations, Schedules, Conferences, Procedures, etc.).

## Database tables appendix

Table

Purpose

`i_programs`

Primary program records. One row per program. Contains name, abbreviation, ACGME Program ID, specialty, type, status, default site, default cost center, payer, IRIS Reimbursable flag.

`i_programs_directors`

Program Director and Associate Director associations.

`i_programs_administrators`

Program Administrator (and backup) associations.

`i_programs_coordinators`

Coordinator associations.

`i_programs_chiefs`

Per-academic-year chief resident designations.

`i_programs_workflow`

Per-program absence approval workflow configuration (see **MedHub - Absences** §"Configuring chiefs as middle approvers").

`i_programs_settings_*`

Various program-level settings tables.

`users_residents_pg`

Trainee training history records, joined to programs via `programID`. See **MedHub - Training History**.

`users_faculty_programs`

Faculty-to-program associations. See **MedHub - Demographics — Faculty**.

`sh_schedules`

Program schedules (one or more per program). See **MedHub - Scheduling**.

The Program List shares infrastructure with the UME-side Course List for site references, evaluation forms, and faculty associations at the institution level.

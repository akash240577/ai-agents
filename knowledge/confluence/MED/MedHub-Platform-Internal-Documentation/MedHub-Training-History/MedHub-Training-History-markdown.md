# MedHub - Training History - markdown

# MedHub - Training History

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Training History is the MedHub feature that records experiential learning on the path to becoming a doctor. Each record captures a discrete period of training: who was training, in what program, at what level, between what dates, in what role.

Training History exists for trainees who are still becoming doctors:

*   **Residents (GME)** have robust training history records that drive scheduling, evaluations, contracts, IRIS reimbursement, and access to MedHub itself.
    
*   **Students (UME)** have simpler training history records, separate from course enrollments and clerkship assignments. Student training history primarily controls access and identifies the period of medical school training.
    

Faculty do not have training history records. Faculty are already trained — what they have instead are program/service assignments and an institutional start/end date. If you are looking for "where did this faculty member work and when," that lives in Faculty Demographics, not Training History.

Training history is not a side reference; it is the spine of the trainee's existence in MedHub. Almost every behavior the system displays for a trainee — whether they appear active, what program they belong to, what level they are, whether they can be scheduled today, whether their work hours and evaluations are tracked — derives from their training history records.

This document covers training history as a feature: what records contain, how they are created and modified, the wizards that operate on training history records, and how all of this affects the rest of the system. It does not cover how IRIS uses training history fields to generate reimbursement files; that is documented in **MedHub - IRIS**. The wizards that _create_ the initial training history record at trainee onboarding (ERAS Demographics Import, New Resident Import) are documented in **MedHub - Demographics — Resident**, since those wizards are demographics-creation tools whose training-history side effect is incidental. The wizards that operate on existing training history records (Resident Advancement Wizard, Termination/Graduation Wizard) are documented here.

* * *

## \[GME\] Resident Training History

### Where it lives

A resident's training history records are accessed through their Resident Demographics profile, on the **Training History** tab. The GME Office has read/write access; Program Administrators can view records but most field-level edits flow through GME, since these records drive reimbursement and contracts. Some actions initiated by Program Administrators (granting leaves of absence, advancement, termination) do create or modify training history records as a side effect.

### Record structure

A resident's training history is not a single flat list. It is a two-level structure:

*   A **Post Graduate Event** record (the outer record) describes a period of activity at the institution: a residency, a fellowship, a teaching appointment, a lapse in training, etc. This record carries dates, type, and contract/IRIS-relevant flags that apply to the entire period.
    
*   Within a Post Graduate Event of type Residency or Fellowship, one or more **appointment records** describe each academic year: the program, PGY level, IRIS residency code, schedule association, and chief resident designation for that year.
    

Most of what users see on the Training History tab is the Post Graduate Event level. The per-academic-year appointment data is what changes when a resident is advanced or moves between PGY levels — a new appointment row is added inside the same Post Graduate Event.

### Post Graduate Event types

The **Type** field distinguishes what kind of activity the record represents. The valid types are:

*   Internship
    
*   Residency
    
*   Fellowship
    
*   Private Practice
    
*   Teaching Appointment
    
*   Hospital Appointment
    
*   Military
    
*   Lapse in Training
    

The list is controlled by the root setting `pg_typeA`. The values in this list are hardcoded in product logic — adding new options is not supported, because the workflow tied to each type is implemented in code. Adding a new option to the dropdown will not produce useful records; fields will not populate correctly and dates default to 1969 (Ticket 171007).

Residency and Fellowship are the types that drive the most behavior — scheduling, IRIS, contracts, evaluations. Lapse in Training records have a specific role: they are how MedHub represents a gap in training that should remain visible on the trainee's history (and they are the source of the "Contract pending final approval" message that shows by design on these records, since no contract can be associated with a lapse). Teaching Appointment, Hospital Appointment, Military, and Private Practice are typically used to record activity outside the standard residency/fellowship flow.

### Fields on a training history record

The following fields appear on a Residency or Fellowship Post Graduate Event record. Not every field appears on every record type; some are only enabled if a corresponding root setting is on.

Field

Description

Type

The Post Graduate Event type. See list above.

Start Date

First date of the period. Required.

End Date

Last date of the period. Required.

Residency Program

The program the trainee is appointed to during this period.

Appointment Type

The trainee type for this period (Resident, Fellow, Visiting Resident, etc.). Pulls from the institution's Resident Types list.

Resident Level

The level the trainee is at during this period. Required for Residency/Fellowship.

PGY

Postgraduate year. Note: MedHub's PGY is the _current_ training year (PGY1 = first year). CMS counts _completed_ years (a MedHub PGY1 = CMS 0). MedHub's PGY value can also go negative if the trainee's medical school end date is in the future on the Education tab (Ticket 236519).

Appointment Percentage (FTE)

Default is 100. Used when a trainee is part-time or shared. Sometimes referred to as FTE percentage.

Billing Level

Used for finance reporting.

Site/Hospital

The site of training. Used for IRIS site assignment.

Specialty (IRIS Residency Code)

The CMS residency code for this period. Required for IRIS-reimbursable records.

IRP (checkbox)

Initial Residency Period flag. Must be set manually per resident; cannot be bulk-uploaded (Ticket 196464).

Board Certified (checkbox)

Indicates the trainee is board certified for this appointment.

ACMR / Chief Resident (checkbox)

Designates the trainee as a Chief Resident for the period. The presence of this flag affects display in the Residency Program Directory (Ticket 148982). Chief start/end dates and bonus fields are gated by `setting_demo_training_acmr`.

Non-Reimbursable (checkbox)

When checked, the period is not reported in IRIS. The checkbox can only be turned off if the program itself has the IRIS Reimbursable setting enabled (Ticket 118084).

Displaced

Used to flag residents displaced by external events (e.g., COVID disruption).

Transition/Termination

Termination record information, if present.

Projected Training End Date

Reference date for when the trainee is expected to finish their overall program. Does not affect any other fields, scheduling, or access — it is for reporting only (Tickets 260215, 259173).

IRP Limit Date

Used for IRIS calculations.

Post Residency Activity

Notes on what comes after this period.

Contract Rate / Contract Date / Contract Received / Contract Comments / Contract Approved

Contract data tied to this training history record.

Payer

Institution Payer for this period. The default payer is set on the root side under List Management → Institution Payers; the order of payers in that list determines which is the default.

Funding Code / CC Funding Code

Funding codes for the period.

Moonlighting Flag / Location / Hours / Type

Moonlighting tracking, when applicable.

Custom Salary Rate

Override of the default salary rate from the pay rate table.

Comments / Training History Comments

Free-text notes.

Resident Signature / Director Signature (and dates)

Captured when the trainee/director signs the contract.

The per-academic-year appointment record (within a Residency or Fellowship Post Graduate Event) carries: programID, PGY, level, IRIS residency code, IRIS residency code (simultaneous match), simultaneous match type, chief resident flag/dates/bonus, schedule reference, appointment percentage, and track program reference.

### What "current," "active," and other status terms mean

Two distinctions matter when reading what the system displays for a resident:

*   **Active vs. Inactive**: Active residents have a current training history record — one that includes today's date. Active controls whether the user can log in, whether they appear available to schedule, and whether they appear as a current trainee in most program views.
    
*   **Current vs. Archived**: Current residents either have a current training history record or one that begins or ends within 365 days of today. Current controls whether they appear in common dropdowns and reports for incoming/recent trainees. Archived residents (those whose last training record ended more than 365 days ago) do not appear in most dropdowns but remain available for reporting.
    

A resident can be Inactive but Current (they will graduate today or graduated within the past year), and they will continue to appear in many program views. They can also be Active but technically near-inactive (last day of training).

After a resident's last training history record ends, MedHub gives them 30 additional days of access. This window allows departing residents to complete outstanding evaluations, log final work hours, or export a Learning Portfolio. After 30 days, the system automatically un-checks the "Access" box overnight. Manually re-enabling Access for a graduated resident will only last one day — the overnight script will turn it off again (Ticket 201671). This is by design.

### The Resident Status Update script

When something looks wrong with a resident's training history — they're not appearing where expected, their access seems incorrect, their PGY hasn't updated — the most common cause is that the **Resident Status Update** overnight script hasn't yet run. This is the script that propagates training history changes into derived state across the system.

The script runs nightly and processes:

*   Activation/deactivation based on whether today falls within a current training history record
    
*   Status changes (active, inactive)
    
*   PGY/level updates
    
*   Program changes when a trainee transitions internally
    
*   ACGME status
    
*   Trainee type
    
*   Schedule access changes
    

A few things to know:

*   The script processes in-house residents only. Visiting residents and students rely on a different overnight script. Running the Resident Status Update task script on the root side does not move visiting residents into active state; for visitors, you wait for the overnight cron to run, or contact Tier 2 to run the visitor cron manually (Tickets 219258, 219264).
    
*   Notifications labeled "Resident status update script run" simply confirm the script ran and list what it changed. They are not error notifications.
    
*   If a trainee's display does not match their training history, run the script first; if that does not resolve it, look for data integrity issues like an invalid date or a missing program.
    

For details on the script itself and other root-side scripts, see **MedHub - Root Side Task Scripts**.

### Visiting residents: two methods

MedHub supports two methods for tracking residents who visit the institution from another training program. The method in use at a given institution is set by the root setting `settings_visitors_method`. Both methods are in active use across the client base, and Support needs to be able to recognize and work with either.

Which method an institution uses is normally decided during implementation. The Finance team recommends the overlap method, and some clients have migrated to it over time, but switching after data has been entered is unusual.

#### Inline method

In the inline method, visiting records sit in the same Post Graduate History list as in-house records, in chronological order. A visiting record uses a "Visiting Resident" or "Visiting Fellow" trainee type from the institution's Resident Types list. The Demographics tab does not display an "Appt. Type" dropdown for visitors.

This method works well for institutions where visitors are infrequent or do not return.

Notable behaviors:

*   Records are stored in the same table as in-house training history (`users_residents_pg`).
    
*   A contract can be associated with a visiting record (AMBS-9334).
    
*   Each visiting period is its own training history record.
    

#### Overlap method

In the overlap method, the visiting period overlaps the trainee's full home institution record. The Demographics tab displays a "Visiting Resident" Appointment Type. Under Post Graduate History, the overall date range appears as a Post Graduate Event record. Under a separate Visiting Resident History section, the program-and-date details for each visit appear.

**Overlap visitors MUST have training history record(s) for their home institution that covers the entire time they are a visitor.** It is not valid to only have visiting records.  
  
For the overlap method (setting\_visitor\_method=2), the visiting resident must have both a visiting record in users\_residents\_spt (the SPT record) and a training history record in users\_residents\_pg that captures the trainee's home institution and home program information. The SPT record alone is not sufficient. This is a common configuration gap — when a visitor is set up with only an SPT record and no corresponding training history record, it produces downstream issues that look like software bugs but are actually data setup issues. Support should always verify that both records exist when troubleshooting overlap-method visitor problems.

This method works well for institutions where visitors return repeatedly, since adding additional visits is less data entry than creating a new Post Graduate Event for each visit.

Notable behaviors:

*   Visit details are stored in a separate table (`users_residents_spt`).
    
*   A corresponding `users_residents_pg` record with the trainee's home institution and home program must also exist for the visitor to be fully functional in the system.
    
*   Contracts cannot be delivered through the visiting record (AMBS-9334).
    
*   Adding a visiting record for someone who previously trained in-house at the institution requires going through Resident Demographics, setting Appt Type to Visiting Resident, and saving — then populating the Visiting Resident History section. The previous in-house records are preserved (Ticket 192805).
    

#### Visiting trainee access

Visiting trainees gain access only after their visit start date. They do not appear in the new program's resident dropdown until the overnight cron runs after their start date (Ticket 171272). Internal residents transferring to a new program become available 90 days before start date, but visiting residents must wait until the day they begin.

If a client needs a visiting resident to be active before the overnight cron runs, a CSC may contact Tier 2 to manually run the visitor cron.

### Lifecycle events and their effects on training history

Most actions involving a resident's lifecycle either create new training history records or modify existing ones. Understanding which actions produce which records is the difference between a clean trainee history and one that has to be cleaned up by Tier 2 later.

#### Adding a new resident

A new resident's first training history record is normally created automatically when the resident account is created — through the ERAS Demographics Import wizard, the New Resident Import wizard, or manually through "Add New Resident" on the GME side (gated by `demo_resident_newStr` for whether non-GME admins can do this). For details on those onboarding wizards, see **MedHub - Demographics — Resident**.

When a record is added manually through the demographics profile, the trainee will appear in the program's resident dropdown on the schedule starting the moment the record exists, scoped to the academic year of the record's dates. For incoming trainees, this allows the program to schedule before the trainee's start date.

#### Internal transfer between programs

When a trainee transfers from one program to another within the same institution, the GME Office handles the change (Program Administrators cannot promote across programs). The new program gains access to the trainee 90 days before the transfer start date — the trainee appears in the new program's resident dropdown under a "Transferring Residents" header. The new program's Administrator can begin scheduling the trainee for the upcoming academic year as soon as the new training history record is added.

The previous program loses full access to the trainee on the start date of the new program. After the start date, the previous Program Administrator can no longer view or edit the trainee's information unless they have access to the new program. This is by design — the program that currently "owns" the trainee owns the data — and it protects both confidentiality and data integrity (Ticket 170216). After the trainee graduates, all previous programs regain access to the trainee's data for legacy purposes.

#### Leave of Absence

A Leave of Absence (LOA) is requested through the Absences workflow, but the LOA mechanics intersect with training history in two specific ways:

*   The LOA form has an **Extend Training History** checkbox. When this is checked along with a number of extension days, MedHub automatically creates a new training history record for the LOA and moves the resident off-cycle, making them available for the extended training period.
    
*   If the LOA dates are later modified, the training history extension does not automatically recalculate. The extension must be updated manually.
    

The presence of an LOA-extended training history record is what makes split certificate dates possible. The system will pull the start date of the resident's first training history record and the end date of the latest record when generating certificates, which can produce a gap if there is an LOA-induced extension record in between (Ticket 167377). There is no setting to suppress this; if the certificate needs to show a continuous date range, it must be edited manually when generated.

The Extend Training History checkbox can be hidden from view through an institutional setting if the institution prefers extensions to be managed only by GME.

For the full LOA workflow (form fields, approval flow, edit-after-the-fact, training history extension mechanics), see **MedHub - Absences**.

#### Permanent deletion of a resident profile

In limited cases, a Resident Demographics profile can be permanently deleted from the GME side — typically for duplicates or accounts created in error. The "Permanently Delete this Resident" link only appears when:

*   The resident has training history records that are entirely in the future, or
    
*   Their current training history record is at another institution.
    

The visibility of this link is controlled by `setting_gme_delete_resident`. When the setting is enabled (1, the default at most institutions), GME Office users can delete without needing the Super Admin flag. When disabled (0), only Super Admin GME Office users can delete. In all cases, the trainee's existing past or current training history at the institution makes the link disappear — the system will not allow deletion of a trainee with completed or in-progress training records.

Once a trainee is deleted, all data tied to the account is removed and cannot be recovered. Always confirm any onboarding or other entered data is exported first.

## Resident Advancement Wizard

The **Resident Advancement Wizard** (also called the Promotion Wizard internally — `setting_wizardA` index 1) advances trainees to the next PGY level. It does not create a new Post Graduate Event record — it adds a new appointment record (per-academic-year) inside the trainee's existing Residency/Fellowship Post Graduate Event, advancing them to the next level for the new academic year. The trainee then becomes available on the next year's master rotation schedule.

Available under **Home > Task Wizards > Resident Advancement Wizard**. The wizard can be run by Program Administrators or by GME (per-user-type access controlled by `setting_wizardA`).

### When to run it

The wizard can be run well in advance of the next academic year — the new appointment row simply has a future start date and does not affect the current year's schedule, evaluations, or status. Most institutions run advancement after April Match Day announcements, in May, after running the Termination Wizard for graduating trainees. (See "Order of operations at year-end" below.)

### How to run it

1.  Locate the Task Wizards link on the homepage.
    
2.  Select **Resident Advancement Wizard**.
    
3.  Select either all PGY levels or specific levels where trainees need to be advanced.
    
4.  Verify each trainee checked should be promoted. **Uncheck** any trainee who should not advance:
    
    *   Trainees who are graduating at their current PGY level (terminate them via the Termination Wizard instead — see below)
        
    *   Trainees who will be transferring to a different program internally (handled by GME via training history modification, not the wizard)
        
    *   Trainees who have requested to repeat a year
        
5.  Submit. New appointment records are added to each selected trainee's training history.
    

After submission, each advanced trainee has a new appointment row at the next PGY level for the next academic year, sharing the same Post Graduate Event record. The trainee becomes available on the next year's master rotation schedule.

### Order of operations at year-end

The Termination Wizard and the Resident Advancement Wizard interact in a specific way that must be respected:

> **The Termination Wizard must be run BEFORE adding next-year training history records — including before the Resident Advancement Wizard.** If a future training history record exists when the Termination Wizard runs, the wizard will wipe out the future record.

The recipe for a clean year-end cycle:

1.  **January–April:** Run the Termination Wizard for graduating trainees.
    
2.  **By mid-April:** GME approves terminations.
    
3.  **By end of April:** Certificates are printed.
    
4.  **May or later:** Run the Resident Advancement Wizard for continuing trainees.
    

Running these out of order produces work for Support to clean up. (Ticket 155624.)

### Common scenarios

*   **Trainee not appearing in the wizard:** Their current training history record may not end within the configured window, OR they may already have a next-year appointment record (manually added). Check the training history tab.
    
*   **Trainee transferring to a different program internally:** This is handled by GME modifying training history directly, NOT by the wizard. The wizard advances within the same program.
    
*   **Trainee staying on as Chief Resident at the same PGY level:** Don't advance them through the wizard. Add the Chief Resident flag to their existing training history record (or extend the record if continuing past the standard end date). See "A resident is staying on after graduation as a Chief Resident" under Common scenarios below.
    
*   **Wizard advanced a trainee who shouldn't have been advanced:** Manually remove the new appointment record from their training history. There's no "undo" button on the wizard.
    

## Resident Termination/Graduation Wizard

The **Resident Termination/Graduation Wizard** (`setting_wizardA` index 2) records the end of a trainee's appointment — for graduation, voluntary departure, or termination. The wizard creates a pending termination record in the trainee's training history. **The GME Office must approve** the termination for it to take effect.

Available under **Home > Task Wizards > Resident Termination/Graduation Wizard**. The wizard is run by Program Administrators (or GME).

### Termination window

Trainees can be terminated **up to 60 days prior to their end date by default**. Some institutions allow up to 180 days. The setting `setting_wizards_termination_days` controls this window.

### How to run it

The wizard offers two modes — Batch and Individual.

**Batch mode:**

1.  Locate Task Wizards on the homepage.
    
2.  Select **Resident Termination/Graduation Wizard**.
    
3.  On Step 1, the **Batch** tab displays trainees eligible for termination (those whose end dates are within the configured window). Select each trainee leaving the program at the end of the current academic year.
    
4.  **Do not select** trainees who are extending their training beyond the academic year — these can be terminated later or via the Individual tab.
    
5.  Click Next Step.
    
6.  Select the termination reason (graduation, voluntary departure, dismissal, etc.).
    
7.  Submit. A pending termination record is added to each selected trainee's training history.
    

**Individual mode:** Use Step 1's **Individual** tab to terminate one trainee at a time. Useful for off-cycle terminations (mid-year departures, terminations that happen outside the standard cycle).

The default mode is controlled by `setting_wizards_termination_mode` (1 = single, 2 = batch). The user types eligible to terminate in batch mode are controlled by `setting_wizards_termination_batch_userA` (default `3:5` — Program Administrator and GME).

### What happens after submission

A **pending termination record** appears in the trainee's training history. The GME Office receives an Urgent Task to approve. Behavior:

*   **If GME approves:** The termination record is finalized and appears alongside the regular records. The trainee's account follows standard post-end-date access rules (30-day window — see "What 'current,' 'active,' and other status terms mean" above).
    
*   **If GME rejects:** The pending record is removed entirely. It does not remain visible as "rejected" — it disappears, and the trainee shows back up in the wizard's available list the next time it is run.
    

> **A subtle behavior:** The Program Administrator who ran the wizard receives an automated email when GME rejects a termination. This is by design, but some institutions consider it noise. There is no setting to suppress this email per program. (Ticket 168536.)

### Critical timing rule

> **The Termination Wizard must be run before any next-year training history records exist.** Running advancement first, then termination, will wipe out the future records.

The recipe for a clean year-end cycle:

1.  Run the Termination Wizard early in the calendar year (the setting allows this from January 1 onward).
    
2.  GME approves terminations by mid-April.
    
3.  Certificates are printed by GME by end of April.
    
4.  Resident Advancement happens after certificates are printed — typically May 1 or later.
    

Reversing this order — adding next-year records first and then trying to terminate — wipes out the future records and produces work for Support to clean up. (Ticket 155624.)

### Settings affecting the wizard

Setting

Effect

`setting_wizards_termination_days`

Maximum days prior to end date the wizard can be run. Default 60; some institutions set 90 or 180.

`setting_wizards_termination_mode`

Default mode of the wizard (1 = single, 2 = batch).

`setting_wizards_termination_disable_duplicates`

Disable the duplicate-check (default 0 = check enabled, 1 = disabled).

`setting_wizards_termination_batch_userA`

User types eligible to terminate in batch mode. Default `3:5` (Program Administrator and GME).

### Common scenarios

*   **Wizard wiped out a future training history record:** The wizard was run after a future record was added. Manually re-add the future record. Next year, run the Termination Wizard first.
    
*   **Need to terminate a trainee outside the 60-day window:** Either request a temporary increase to `setting_wizards_termination_days`, or the GME Office can manually add the termination record without using the wizard.
    
*   **Need to push back the date limit for a single past termination:** A SQL data ticket can extend the window temporarily for a back-dated termination (Ticket 166189).
    
*   **Chief Resident staying on after graduation:** If they're staying as a Trainee (still at PGY-x), add a Chief Resident training history record covering the chief year and don't terminate. If they're staying but the chief year is non-required (e.g., Internal Medicine, Pediatrics), the institution can choose between Trainee status or transitioning them to Faculty via the Resident-to-Faculty Transition Wizard. (See **MedHub - Demographics — Faculty** for the transition wizard.) Their Chief Resident record can be marked as non-reimbursable for IRIS. (Ticket 173654.)
    
*   **Termination email sent to Program Administrator on rejection:** By design, no per-program suppression. (Ticket 168536.)
    

### Other things to know

A few additional behaviors that are training-history-driven:

*   **30-day post-end-date access**: As noted above, residents retain access for 30 days after their last training history record's end date. Re-checking the Access box manually only persists for one day.
    
*   **One-day training history records are valid**. The system used to throw a date format error for these; AMBS-9245 (Ticket 212453) corrected this.
    
*   **The Lapse in Training "Contract pending final approval" message is by design.** When viewing a Lapse in Training record, the system displays this message because no contract can exist for a lapse. Product has acknowledged this is a gap and may eventually update the message (Ticket 164201).
    
*   **The "Certification recorded by Another Program" entry** that sometimes appears in a trainee's Certifications tab is a result of the trainee moving between programs while a certification field was active in the original program but not yet enabled in the new one. The record cannot be removed, but it can be addressed by enabling the certification field for the new program.
    

### Training history and IRIS

Several fields on the training history record feed IRIS reimbursement reporting. The relevant fields are listed in the field reference above. How these fields flow into the IRIS XML, the IRIS Data Browser, and the IRIS Cap Report is documented separately in **MedHub - IRIS**. From the training history side, the rule is: the data must be accurate and complete on the record before IRIS calculations can be trusted, and the IRP flag in particular requires manual entry per resident.

* * *

## \[UME\] Student Training History

### What it is, and what it isn't

Student training history is a separate feature from course enrollments and clerkship assignments. It records discrete periods of medical school training in the same conceptual sense as resident training history: who, in what type of training, between what dates, at what level.

It is _not_ the same as:

*   **Enrollments** (records of students registered to specific courses), which live in the Enrollment/Grades tab.
    
*   **Clerkship assignments**, which schedule a student to a specific clerkship period and site.
    

Course enrollments and clerkship assignments may reference a training history period (the student must have a current training history record to be active in the system at all), but they are distinct records on distinct tabs and have their own lifecycles.

### Where it lives

Student training history is accessed through the Student Demographics profile. The Student Administrator (Dean's Office) is the typical user with full access; Course Coordinators have varying access depending on institution configuration. Visiting students are managed by the Student Administrator.

### Record structure

Student training history is much simpler than resident training history. It is a flat list of records — there is no two-level structure with appointments inside outer events. Each record contains:

Field

Description

Start Date

First date of the period.

End Date

Last date of the period.

Training Type

The category of training. Hardcoded to one of: Medical Student, Military, Lapse in Training, Other. Set by `training_typeA`.

Student Type

The student's type for this period — pulls from the institution's Student Types list.

Level

Year of training.

Location

Free-text location of training.

Location Address

Optional address.

Visiting School

If this is a visiting student, the home school they are visiting from (links to the IRIS school list).

Clerkship

Optional reference to a specific clerkship, used for visiting students whose training history is tied to a course (see below).

Training Comments

Free-text notes.

Letter Comments

Comments associated with verification or transition letters.

Other Training Description

Free-text used when the type is Other.

### Status, access, and the 30-day window

Student training history controls access in the same way resident training history does:

*   A student is active when today falls within a current training history record.
    
*   After the last training history record's end date, the student retains access for 30 days. After the window expires, the system automatically removes access overnight; manually re-enabling it lasts only until the next overnight script run (Ticket 177032).
    
*   The Resident Status Update script also processes student training history changes (despite the name); however, the script does not directly handle visiting students from the manual root-side run, so visiting student status changes generally have to wait for the overnight cron.
    

If students unexpectedly cannot log in on or near a date that crosses an academic year boundary (a common pattern: students lose access on the day after the end of their previous training history if a new record has not yet been added), the cause is almost always a missing or incorrectly-dated current training history record (Ticket 203263).

### Visiting students

Visiting students — those visiting from another medical school for a clerkship — are tracked through the visiting student fields on the training history record (Visiting School, Clerkship). When a visiting student is added with a clerkship reference, an enrollment record is also created for the corresponding course, and the student appears in the Course Coordinator's enrolled-students view for that course.

This dual-record creation can occasionally have bugs in specific edge cases, but the intended and consistent behavior is that visiting students with a clerkship reference get both the training history record and a matching enrollment.

### Permanent deletion of a student profile

A Student Administrator with Security access can permanently delete a student profile, but only when the student has training history records that are entirely in the future. Once a current or past training history record exists, the delete link is no longer visible.

Note that for students, deletion is gated by Security access in the user-management page, not by Super Admin status, and not by the `setting_gme_delete_resident` setting (which is GME-only). This is documented in AMBS-11438 (Ticket 238242).

### Student Advancement Wizard (UME)

The UME-side **Student Advancement Wizard** advances students to the next year of training. Students must be advanced prior to future academic years in order to be available for scheduling. This is the UME equivalent of the Resident Advancement Wizard but acts on the student training history records described above.

Available under UME-side **Task Wizards → Student Advancement Wizard**. Run by the Student Administrator.

After a student is advanced, a new training history record is added covering the new academic year. The student becomes available on next year's course schedules.

The Student Advancement Wizard, like the Resident Advancement Wizard, can be run well in advance of the new academic year without affecting the current year. There is no Termination/Graduation Wizard equivalent on the UME side — students transitioning out are generally handled by ending their training history record and using the Resident-to-Faculty Transition Wizard or other workflows on the GME side as appropriate (note that Student to Resident Transition Wizard is deprecated).

* * *

## Common scenarios

This section captures recurring patterns Support encounters that involve training history mechanics. These are not the only scenarios that touch training history, but they are the ones most likely to come up.

### A visiting resident is returning to an institution they previously visited

This is the scenario the inline-vs-overlap method distinction was designed to handle. If the institution uses the **inline method**, simply add a new training history record with a Visiting Resident trainee type for the new visit dates. The previous visiting record stays in place. If the institution uses the **overlap method**, ensure the resident's Appt Type is still set to Visiting Resident on the Demographics tab, and add a new entry to the Visiting Resident History section for the new visit dates.

### A trainee is transferring between programs at the same institution

The transfer is handled by the GME Office. After the new training history record is added for the new program, the new Program Administrator gains access to the trainee 90 days before the start date and can begin scheduling. The previous program's Administrator loses access on the start date. If the previous Administrator needs continued access for legacy data review, they need to be added to the new program's Administrator list. After graduation, all previous programs regain access for legacy purposes.

### A resident is staying on after graduation as a Chief Resident

This is a judgment call that depends on whether the chief year overlaps an ACGME-required year. If the chief year overlaps a required year, a training history record is needed for the chief year. If the chief year is in addition to the ACGME-required years (the chief year is non-required, as is common in Internal Medicine and Pediatrics), the institution can choose whether to keep the person as a Trainee or convert them to Faculty.

The decision affects:

*   **Evaluations**: Trainees receive resident-evaluation-of-other-resident (peer) forms; Faculty receive standard faculty evaluation forms.
    
*   **Work hours**: A Trainee can submit work hours; Faculty cannot.
    
*   **Billing**: Trainees can be billed in IRIS; Faculty cannot.
    

If the trainee remains a resident, set the Chief Resident flag on the training history record. If they transition to faculty, use the Resident-to-Faculty Transition Wizard (and note the trainee will not be available in that wizard until after their training history end date — see **MedHub - Demographics — Faculty**).

### A resident has a Lapse in Training and the system shows "Contract pending final approval"

This is by design. Lapse in Training records cannot have an associated contract, so the system displays the message because it does not find one. There is no fix; Product is aware (Ticket 164201).

### A trainee's training history record needs to be 1 day long

One-day training history records are valid. Earlier behavior produced a "date formatted incorrectly" error; this was corrected in AMBS-9245 (Ticket 212453). If a 1-day record fails to save today, the cause is usually overlap with another existing record, not the duration.

### A resident is showing as PGY -2 or some other negative PGY

PGY is calculated from the medical school graduation date on the Education tab. If that date is in the future (data entry error or unverified incoming trainee), the calculation will be negative. The fix is to correct the medical school end date on the Education tab (Ticket 236519).

### The Termination Wizard wiped a future training history record

This happens when the wizard is run after a future training history has already been added. The fix is to manually re-add the future record. To prevent it next year: run the Termination Wizard before adding any next-year training history records (start January 1, terminate by mid-April, certificates by end of April, advancement after).

### A trainee is not appearing where expected based on their training history

The Resident Status Update script has likely not run yet. Either wait for the overnight run or, for in-house residents, ask Tier 2 to run the task script manually. For visiting residents and students, the manual root-side script does not affect them — they require the overnight cron, or a Tier 2 manual cron run.

If running the script does not resolve the issue, look for: an inactive default program, an invalid training history date range, a gap in coverage today, or a data integrity issue like a record without a programID.

### A graduated resident's access keeps re-enabling itself overnight

This is the 30-day post-end-date window working as designed. Manually un-checking Access does not persist; the overnight script will respect the 30-day window. If access truly needs to be revoked early, the username can be modified to make it unknown to the user (Ticket 201671).

* * *

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

The following root settings affect training history records or the system behaviors that depend on them. Most of these settings are configured during implementation and rarely changed.

Setting

Effect

`pg_typeA`

Defines the Post Graduate Event types available in the Type dropdown. Hardcoded — adding new options does not work.

`settings_visitors_method`

Selects between inline and overlap methods for visiting resident tracking. Set during implementation.

`setting_visitors_add`

Controls visitor add behavior.

`setting_demo_training_acmr`

Enables Chief start/end date and bonus fields on training history records.

`setting_demo_training_bc`

Enables the Board Certified field on training history records.

`setting_demo_training_transition`

Controls visibility of the Transition/Termination field.

`settings_demo_required_training_gap`

Controls how training gaps are flagged.

`setting_iris_employer_multiple`

Affects how multiple employer records are reported in IRIS.

`settings_billing_visitors`

Affects billing behavior for visiting trainees.

`term_terminationStr`

Custom label for terminations on the training history.

`term_visitingStr`

Custom label for visiting records.

`term_non_reimbursable`

Custom label for the Non-Reimbursable flag.

`setting_wizards_termination_days`

How many days before the end date the Termination Wizard can be run (default 60; some institutions allow up to 180).

`setting_wizards_termination_mode`

Default mode of the Termination Wizard. 1 = single, 2 = batch.

`setting_wizards_termination_disable_duplicates`

Disable the duplicate check in the Termination Wizard. Default 0 = check enabled.

`setting_wizards_termination_batch_userA`

User types eligible to terminate in batch mode. Default `3:5` (Program Administrator and GME).

`setting_wizardA` (index 1)

Per-user-type access to the Resident Advancement Wizard.

`setting_wizardA` (index 2)

Per-user-type access to the Resident Termination/Graduation Wizard.

`setting_gme_delete_resident`

Whether non-Super-Admin GME users can permanently delete resident profiles when training history is future-only or at another institution (0 = off, 1 = on).

`demo_resident_newStr`

Controls which roles can add new residents (the value 3 in the array allows admins to add residents).

`setting_verification_alert_days_before`

Days before training start to show the Unverified Resident urgent task. Set to -1 to suppress.

`setting_verification_alert_days_after`

Days after training start to show the Unverified Resident urgent task.

`training_typeA`

Student training types: 1=Medical Student, 2=Military, 3=Lapse in Training, 4=Other. Hardcoded; do not modify per client.

`student_trainingA` / `student_cards_trainingA`

Configure student training history field display.

`demo_trainingA` / `demo_cards_trainingA`

Configure resident training history field display.

`document_training_type`

Affects training-history-related document generation.

* * *

## Database tables appendix

Quick reference for the underlying tables. Useful for Tier 2 and data investigations.

Table

Purpose

`users_residents_pg`

Resident training history — the outer Post Graduate Event records. One row per period (residency, fellowship, lapse, etc.). Contains dates, type, IRIS flags, contract data, payer, funding codes, moonlighting fields.

`users_residents_pg_appt`

Per-academic-year appointments inside a Residency or Fellowship. One row per academic year within a `users_residents_pg` record. Contains PGY, level, programID, IRIS residency code, simultaneous match code, chief flag/dates/bonus, schedule reference.

`users_residents_pg_billing`

Custom billing splits within a training history record (date range and source percent).

`users_residents_pg_funding`

Funding records tied to training history.

`users_residents_spt`

Visiting Training Periods, used only when the institution has the overlap method enabled. Stores the visit-specific details (hospital, dates, program, schedule) that overlap an outer `users_residents_pg` record.

`users_students_training`

Student training history. Flat structure — one row per training period.

`lookup_iris_restype`

IRIS residency code reference table. Joins to `users_residents_pg_appt.iris_residency_code`.

`users_residents_discipline`

Resident disciplinary records, including termination/probation flags. Lives alongside training history but is a separate concept; some flags here affect what training history actions are allowed.

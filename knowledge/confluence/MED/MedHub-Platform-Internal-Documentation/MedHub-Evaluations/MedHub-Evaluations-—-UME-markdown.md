# MedHub - Evaluations — UME - markdown

# MedHub - Evaluations — UME

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

UME-side evaluations assess medical students, faculty, courses, and clerkships. The Evaluations module on the UME side shares most of its infrastructure with the GME side (form building, scales, delivery methods, reporting), but diverges on form types, the role of the Course Coordinator and Course Director, mapping questions, and Final evaluations. This document covers UME-side evaluations end-to-end as a twin to **MedHub - Evaluations — GME**; cross-reference the GME doc for the shared mechanics where indicated.

This document covers: UME form types and their access patterns; building UME forms (the four create paths, mapping questions, Final evaluation designation); delivery methods (manual, automated, course-based, RIS where applicable); evaluation lifecycle on the UME side; the Final evaluation workflow including SPE (Student Performance Evaluation); the Course Director release workflow and `setting_clerkship_codirectors`; and operational patterns specific to UME.

It does not cover: GME-side evaluation form configuration (see **MedHub - Evaluations — GME**); course enrollment mechanics that drive evaluation delivery (see **MedHub - Course Enrollments**); the gradebook (see **MedHub - Gradebook**, currently a separate doc).

## Where it lives

UME evaluations are accessed from the **Evaluations** tab in the UME-side global navigation. The Course Coordinator (and Student Administrator) sees:

*   **Manage Evaluation Forms** — create, modify, inactivate
    
*   **Deliver Evaluations** — manual delivery
    
*   **Automated Evaluations** — recurring delivery rules
    
*   **View Completed Evaluations** — search and view
    
*   **Incomplete Evaluations** — outstanding deliveries
    
*   **Evaluation Functions** — Outside Evaluators, Evaluation Groups, Final Evaluation designation, mapping
    
*   **Final Evaluation Designation** — the SPE / final-evaluation specific configuration
    
*   **Mapping** — for forms whose questions feed into other forms (typically into a Final evaluation)
    

The **Course Settings → Evaluations** tab controls course-level evaluation behavior.

## Form types

UME-specific form types include:

*   **Faculty evaluation of a student**
    
*   **Resident evaluation of a student** — when residents supervise students on rotations and evaluate them
    
*   **Student evaluation of a faculty member**
    
*   **Student evaluation of a resident** — student evaluating residents who supervised them
    
*   **Student evaluation of a course / clerkship**
    
*   **Student self-evaluation**
    
*   **Student peer evaluation** (student of student)
    
*   **Final Student Performance Evaluation (SPE)** — special type, see Final evaluations below
    
*   **Course Director evaluation of student** — Course Director's summative assessment, often the SPE itself or feeding into it
    

Confidentiality framework on the UME side mirrors GME with appropriate substitutions:

*   **Student evaluation of a faculty member** — confidential to the student evaluator. Faculty target may see aggregate views in some cases (Course Settings → Evaluations).
    
*   **Student evaluation of a course / clerkship** — confidential to the student evaluator. Course Director and Course Coordinator can see in association with the student's name; students cannot see what others said.
    
*   **Student peer evaluation** — evaluator anonymized to target.
    

## Course Director and `setting_clerkship_codirectors`

UME has an institutional setting that significantly affects evaluation access: `setting_clerkship_codirectors`.

When enabled, **Associate Course Directors get the same access as Course Directors**, including the ability to **release** student evaluations. There is no read-only review mode for co-directors — if they have evaluation access, they have release access. The only way to remove release ability is to remove evaluation access entirely.

This is documented in detail under **MedHub - Demographics — Faculty** §"Associate Program Director" (the UME equivalent applies the same way for course directors). When a Course Director reports concerns about co-director access, this setting is the lever.

> **What "release" means in the UME evaluation context.** A Final evaluation (SPE) on the UME side typically requires a release step before it becomes visible to the student. The Course Director (or co-director, when the setting is on) reviews the form and clicks Release to push it to the student. Without release, the form is in a held state. This is a UME-only workflow — GME-side evaluations don't have an equivalent release step.

## Building forms

The four creation paths are the same as GME (see **MedHub - Evaluations — GME** §"Building forms" for the shared mechanics):

1.  Design new form
    
2.  Copy existing form
    
3.  Copy from another course
    
4.  Copy from another institution
    

The Modify Form screen, attributes, and question types are largely identical. Two UME-specific concepts deserve attention:

### Mapping questions

UME forms can have questions **mapped** to a Final evaluation. When a form question is mapped, the response on the source form populates the corresponding question on the Final evaluation when the Final is generated.

*   **Configured under Evaluations → Evaluation Functions → Mapping** (or the form's Modify page, depending on UI version).
    
*   **One source question can map to one Final evaluation question.**
    
*   **Used for "rolling up" formative evaluations into a summative SPE** — for example, mid-clerkship evaluations from multiple faculty rolling up into the Final evaluation that the Course Director signs off on.
    

> **Specific clinical achievement bins not populating on Final.** A common reported issue: Final SPE form is not populating with clinical achievement bin from earlier evaluations. The cause is usually a mapping configuration mismatch — the source form's question and the Final's question must be the same answer type and the same scale. (Ticket 168613.)

### Pre-populated forms

Some Finals pre-populate with data from earlier evaluations or from the student's enrollment record (course dates, etc.). Pre-population is configured at the form level.

> **Dropdown questions on pre-populated forms.** Dropdown-style questions appear on pre-populated forms with the original selection retained, but if the source data is changed after pre-population, the form may show stale data. The fix is to re-pre-populate (Ticket 166516).

## Final evaluations and SPE

The **Final Student Performance Evaluation (SPE)** is the UME equivalent of the resident's final program evaluation. It's typically the form that gets shared with the residency programs the student is applying to (via ERAS) and/or stored as part of the student's permanent record.

### Designating a Final evaluation

A form is designated as a Final evaluation under **Evaluations → Evaluation Functions → Final Evaluation Designation**. The designation tells the system this is the form that:

*   Receives mapped data from earlier evaluations
    
*   Goes through the release workflow (Course Director / co-director releases to student)
    
*   May appear on student transcripts or be exported separately
    

### Final evaluation lifecycle

1.  **Earlier evaluations are completed** during the rotation by faculty, residents, peers (depending on form types).
    
2.  **Mapping pulls responses into the Final.** Configured per question via Mapping.
    
3.  **The Final form is generated** at the end of the rotation (manually by the Course Coordinator or automatically based on rotation end date).
    
4.  **Course Director (or co-director with** `setting_clerkship_codirectors` enabled) reviews and either edits or signs off.
    
5.  **Release to student.** Once released, the student can view the Final.
    
6.  **Optional: exporting / sharing externally** for ERAS or other purposes.
    

> **Final not populating from earlier evaluations.** If a Final evaluation is generated and shows no data from earlier rotation evaluations, walk through:
> 
> 1.  Were the earlier evaluations completed (not just delivered)?
>     
> 2.  Are the source-form questions mapped to the Final's questions?
>     
> 3.  Are the source-form questions and the Final's questions using compatible answer types and scales?
>     
> 4.  Was the student enrolled in the course during the date range that earlier evaluations cover?
>     
> 
> (Tickets 160075, 168613, 173939.)

> **Multiple sites in a clerkship.** If a clerkship has multiple sites and the student rotates at one site, the Final pulls data from evaluations completed at that site. Adding sites to a course splits the schedule; site-specific evaluations only roll up into the Final for students at that site (Ticket 160865 pattern). Confirm that the student's enrollment record points to the correct site.

> **Final marked completed but Course Coordinator can't see it.** This is typically a release issue — the form has been completed but not released. Course Director or co-director needs to release it. If the Coordinator should also be able to release, that requires the institutional setting that gives Coordinators evaluation access (which by default they already have for view, but release may be limited per institution). (Ticket 173939.)

### Final evaluation print-friendly view

> **Generating a print-friendly Final evaluation.** Some forms render poorly when printed — text overflow, layout breaks. There's no built-in "print-friendly" mode; programs use the View Completed Evaluations page to view the form and print from the browser. (Ticket 185254.)

## Delivery methods

UME shares the same delivery method options as GME (manual, automated, on Specific Dates, end-of-shift) with these UME-specific notes:

### Manual delivery

Same flow as GME: Evaluations → Deliver Evaluations → form → recipient → target → date range.

> **Step 2 blank screen on manual UME delivery.** Same root cause as GME — typically a session or browser cache issue. (Ticket 154420 was related to a student missing manual delivery options; the fix was access map related.)

### Automated evaluations

UME automated evaluations are configured per course (or institutionally for cross-course evaluations). Same four delivery method options:

*   **By Rotation** (in UME, this is by clerkship period)
    
*   **By Activity**
    
*   **On Specific Dates**
    
*   **End-of-shift**
    

> **Faculty/Course Director access to Automated evaluation feature for Self evaluations.** A specific request: turning on the automated evaluation feature for "Student of Self" (student self-evaluation). Configured at the course level — Course Settings → Evaluations → enable Self Evaluations automation. (Ticket 170244.)

### RIS on the UME side

RIS is available on the UME side but is less commonly used than on GME. The mechanics are the same — students identify the supervisors who supervised them on a rotation, and evaluations are delivered to those identified supervisors.

> **RIS for fellowship/UME programs.** RIS visibility is gated similarly across program types. If RIS isn't visible in a course's Evaluation Functions list, escalate to confirm the setting is enabled.

## Pre-Populated Evaluation Mapping (UME-specific)

Mapping is the UME-side mechanism for pulling responses from one form into another. Most commonly used to pull mid-clerkship evaluation responses into the Final SPE.

Configuration:

1.  Both forms must exist and be finalized (or at least in a state where their question lists are stable).
    
2.  Open the source form's Modify page (or Evaluations → Evaluation Functions → Mapping, depending on UI).
    
3.  For each question to map, select the corresponding Final-evaluation question.
    
4.  Save.
    

When the Final is generated, mapped questions are pre-populated with the most recent response from the source form (within the relevant date range / clerkship).

> **Mapping rules.** The source question and the Final's question must use compatible answer types. A scale-question response cannot map to a free-text question. A pull-down question's response will only pre-populate a pull-down with the same options.

> **Re-running mapping after the Final is generated.** Once a Final is generated, re-running mapping does not retroactively update an already-generated Final. The Final has its own snapshot. To incorporate new mapped data, generate a new Final.

## Common scenarios

### "Final evaluation isn't populating with achievement bins"

Walk through the mapping checklist (above). Most common cause is mapping configuration not matching answer types or scales between source and Final.

### "Student can't see their Final evaluation"

The Final hasn't been released by the Course Director or co-director. Confirm release status. If `setting_clerkship_codirectors` is enabled, co-directors can also release.

### "Visiting student isn't getting evaluations"

Visiting students need an enrollment record matched to the course they're rotating in. See **MedHub - Training History** §"Visiting students" for the dual-record creation. If the enrollment record isn't created automatically when adding the visiting student, the evaluation won't deliver.

### "Course shared between programs — student isn't getting evaluation"

When a course is shared with another program/course, the student's enrollment must be in the originating course. Shared courses don't automatically deliver evaluations to students enrolled in the receiving course.

### "I want to remove a Course Director's release ability but keep their evaluation viewing"

Not supported. With `setting_clerkship_codirectors` on, evaluation access = release ability. The only way to remove release is to remove evaluation access entirely. (Ticket 203653, AMBS-9267.)

### "Manual delivery shows zero recipients in Step 2"

The Recipient list is filtered by the form type and the student's enrollment in courses you have access to. If you have access to the student's course and the form type matches, recipients should appear. If they don't, check the access map and the form's type configuration.

### "I delivered a Lab Evaluation three times to a student, and now it's gone from her list"

This pattern (Ticket 177143) is typically the form being filtered out of the student's view because of an enrollment date issue — the form's date range is outside the student's enrollment dates. Confirm enrollment dates align with the form delivery dates.

## Low score alerts (UME)

Low score alerts notify designated recipients when an evaluator's response to a question meets or falls below a configured threshold. When triggered, the system sends an **email notification** and creates an **Urgent Task** on the recipient's MedHub homepage. This section covers UME-specific configuration, recipient types, routing logic, evaluator name masking, the Evaluations Low Score Report, and Notification Groups. For the shared delivering-entity routing framework that governs both GME and UME, see **MedHub - Evaluations — Low Score Alerts (GME)** §"Alert routing — delivering entity logic (ELM-1803)."

### Where it lives

Low score alert configuration is accessed through the evaluation form builder: **Evaluations → Manage Evaluation Forms → \[form\] → Alerts/Comments column**. Click "Yes" on any question row to open the alert configuration for that question.

The **Evaluations Low Score Report** is accessed under **Reports → Evaluations Low Score Alerts**. This report supports all evaluation types and displays only responses that triggered a low score alert flag based on the form's alert configuration.

### Question-level configuration

Each question's alert setup includes:

*   **Setting Alerts By** — determines which answer options trigger the alert. Options are "All" (every scale option has a threshold) or individual scale options. For pull-down / options questions, each choice option can be individually set to trigger or not trigger an alert.
    
*   **Send Alert On** — the specific scale options or choice values that trigger the alert when selected by the evaluator.
    
*   **Required Comment** — whether the evaluator must enter a comment when selecting a triggering answer. This is configured per triggering option.
    
*   **Delivering Recipients** — which user types receive the alert email and Urgent Task for this question. Available UME recipient types are:
    
    *   Course Coordinator
        
    *   Course Director
        
    *   Advisor (faculty advisor assigned to the student evaluatee)
        
    *   Notification Group (if the Notification Groups root setting is enabled)
        

If no custom Delivering Recipients are configured at the question level, the system does not send alerts for that question — there is no course-level fallback setting equivalent to GME's Program Settings → Send Admin Low Score Alerts. Each question must have its own recipients explicitly selected.

> **Pull-down / options questions and low score alerts.** Low score alerts work with pull-down answer types. When the question uses a pull-down (e.g., Pass / Fail), each choice option can be configured to trigger an alert independently. For example, selecting "Fail" can trigger an alert while "Pass" does not. The form builder shows each choice option in the alert configuration with its own Send Alert checkbox.

> **Alerts set on options but no recipients selected.** If alert thresholds are configured on a question's answer options but no Delivering Recipients are selected, the low score is still **recorded** and appears on the Evaluations Low Score Report. However, no email or Urgent Task is generated. This is by design — the alert flag is captured for reporting purposes even without notification recipients.

### Alert routing on the UME side

When a UME course delivers an evaluation and a low score alert is triggered on a faculty member, the alert goes to the recipients associated with the **delivering course** (ELM-1803 Path 2).

When a **Student Admin** delivers an evaluation (ELM-1803 Path 3), the system checks whether the evaluation is associated with a course:

*   If yes, the alert goes to the Delivering Recipients associated with that course.
    
*   If the **Faculty Default Program** checkbox is also checked in the alert configuration, alerts go to recipients of both the delivering course and the faculty's default program.
    
*   If no course is associated, course-level Delivering Recipient selections are ignored.
    

> **"Send Alert to delivering course's recipients instead of faculty member/resident's program."** This checkbox appears in the question-level alert configuration for UME forms. When checked, the alert routes to the delivering course's recipients rather than the faculty target's default program. With ELM-1803 in production, delivering-course routing is now the default behavior for UME course-delivered evaluations. The checkbox remains in the UI for Student Admin-delivered evaluations where the routing path is more ambiguous.

### Notification Groups

Low Score Notification Groups allow institutions to define custom groups of recipients for low score alerts, independent of the course/program hierarchy. They are enabled via a root setting and managed under **List Management → Low Score Notification Groups**.

To create a Notification Group:

1.  Navigate to **List Management → Low Score Notification Groups**.
    
2.  Click **Add Group** and name the group.
    
3.  Add members — any MedHub user at the institution can be added to the group.
    
4.  Save.
    

Once created, the group appears as a Delivering Recipient option in the question-level alert configuration. When selected, group members receive the alert in addition to any other selected recipient types (Course Coordinator, Course Director, etc.).

Notification Groups are useful when alert recipients don't map cleanly to the standard course hierarchy — for example, when a dean's office needs visibility into alerts across multiple courses, or when a department-level faculty development team needs to receive alerts for a specific set of evaluation questions regardless of which course delivers the evaluation.

### Evaluator name masking in alert emails

Two root settings control whether the evaluator's name is visible in UME low score alert emails:

*   `show_lowscore_evaluator` — set to 0 (never show evaluator name in UME low score alert emails) or 1 (conditionally show based on evaluation type).
    
*   `show_evaluator_name` — a per-evaluation-type array. When `show_lowscore_evaluator` is 1, each evaluation type has a value of 0 (mask) or 1 (show). This allows institutions to mask evaluator names for student-of-faculty evaluations while showing them for faculty-of-student evaluations, for example.
    

The masking setting controls **only the email notification body**. It does not affect the display of the evaluator's name in the Low Score Alert view within MedHub itself. The in-app display is controlled by the **Evaluation Access Map** — specifically, the Name Redacted access level for the relevant evaluation type. These are independent controls: an institution can mask the evaluator in the email while showing it in the MedHub UI, or vice versa.

> **The Evaluation Access Map does not flow to low score alert emails.** Confirmed by Product. The access map controls in-app viewing; the `show_lowscore_evaluator` / `show_evaluator_name` settings control email content. They are separate systems.

### Evaluations Low Score Report

The **Evaluations Low Score Report** (Report ID 133) is the primary reporting tool for low score alerts. It is accessed under **Reports → Evaluations Low Score Alerts**.

Filters include:

*   Course/Clerkship
    
*   Date range
    
*   Evaluation type
    

The report output displays all responses that triggered a low score alert flag, regardless of whether Delivering Recipients were configured (see "Alerts set on options but no recipients selected" above). It supports all evaluation types.

### Backup Administrators and low score alerts

Backup Administrators do **not** receive low score alert emails or Urgent Tasks. This is by design. Only the user types explicitly selected in the question-level Delivering Recipients configuration receive alerts. The informational text in Program Settings references backup administrators, but the actual alert delivery logic does not include them (AMBS-14438, resolved as "As Designed").

### Advisor alerts

Faculty Advisors can be selected as Delivering Recipients for low score alerts on evaluations of their student advisees. When a low score alert fires on an evaluation targeting a student, and the student has a faculty advisor assigned, the advisor receives the alert if "Advisor" is selected in the question-level configuration.

`[VERIFY]` The email notification sent to Advisors historically used GME terminology ("mentor" and "resident" instead of "advisor" and "medical student"). A Product enhancement project was initiated to correct UME notification language across the platform. Confirm whether this has been completed.

### Common troubleshooting scenarios

**"A low score was given but no alert was sent."** Check: (1) Is a threshold/Send Alert configured on the question for the specific answer given? (2) Are Delivering Recipients configured at the question level? If recipients are not set, no email or Urgent Task is generated — even if the low score is recorded. (3) For pull-down questions, confirm the specific choice option (not just the question) has Send Alert checked.

**"The evaluator's name shows as 'anonymous' in the alert email."** Check the `show_lowscore_evaluator` root setting. If set to 0, all evaluator names are masked. If set to 1, check the `show_evaluator_name` array for the relevant evaluation type. Also confirm the evaluation was not delivered with the anonymous special option.

**"An Urgent Task for Low Score Evaluation Alerts can't be cleared."** If the recipient no longer has access to the course or program, the Urgent Task cannot be cleared from their interface. File a data team request (MHDP project) with the user's userID and the responseIDs of the stuck alerts.

**"The Course Director received an alert but the Course Coordinator didn't (or vice versa)."** Check the question-level Delivering Recipients — each recipient type must be explicitly selected. There is no automatic inheritance from course-level settings.

### Settings reference

Setting

Scope

Effect

`show_lowscore_evaluator`

Root (institution-wide)

0 = never show evaluator name in low score alert emails; 1 = conditionally show per `show_evaluator_name` array.

`show_evaluator_name`

Root (institution-wide)

Per-evaluation-type array. When `show_lowscore_evaluator` is 1, each type's value (0 or 1) controls masking in the alert email.

Low Score Notification Groups

Root (institution-wide)

Enables the Notification Groups feature under List Management.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_clerkship_codirectors`

UME — gives Associate Course / Clerkship Directors the same access as Course Directors, including release ability for student evaluations. No way to limit to read-only review.

`setting_evaluations_lockout_days`

Days after delivery before evaluations lock from edits.

`setting_evaluations_expiration_days`

Default expiration window (days) after which delivered evaluations are removed from incomplete lists.

`setting_evaluations_late_notification_days`

Days after delivery before late notification email goes to evaluator.

`setting_evaluations_outside_evaluator_enabled`

Enables Outside Evaluator functionality on UME side.

`setting_eval_aggregate_faculty_self_view` (per-course)

Allows faculty to see aggregate views of evaluations of themselves.

`setting_evaluations_final_release_required`

Whether Final evaluations require Course Director release before student can view.

`setting_eval_mapping_enabled`

Enables form-to-form question mapping for UME.

Course-level settings (configured under Course Settings → Evaluations):

*   Final evaluation designation (per form)
    
*   Mapping configuration
    
*   Self-evaluation automation
    
*   Aggregate access for faculty
    
*   Course Director release workflow
    
*   Course Coordinator access map
    

## Database tables appendix

UME-side evaluation tables share the GME schema with course-scoped associations:

Table

Purpose

`eval_forms`

Form definitions (shared with GME). Form types include UME-specific types.

`eval_forms_questions`

Question definitions including mapping references.

`eval_forms_courses`

Form sharing across courses.

`eval_responses`

Completed evaluation records.

`eval_responses_questions`

Per-question responses.

`eval_deliveries`

Delivered evaluations.

`eval_automated`

Automated evaluation rules.

`eval_groups`

Evaluation Groups.

`eval_finals`

Final evaluation designation per form.

`eval_mapping`

Question-to-question mapping for Final evaluations.

`eval_outside_evaluators`

Outside Evaluator records (shared with GME).

`eval_alerts`

Low-score alerts.

`eval_reviews`

Tracking Reviews records.

Final evaluation status (released / not released) is tracked on the `eval_responses` record itself, not in a separate table.

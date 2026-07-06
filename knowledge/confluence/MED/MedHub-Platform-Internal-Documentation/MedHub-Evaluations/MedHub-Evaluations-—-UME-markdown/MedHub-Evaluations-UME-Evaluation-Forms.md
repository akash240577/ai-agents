# MedHub - Evaluations - UME - Evaluation Forms

# MedHub - Evaluations — UME — Forms

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

This article covers building, configuring, sharing, and managing evaluation forms on the UME side of MedHub. It is the first of three UME evaluation articles:

*   **MedHub - Evaluations — UME — Forms** (this article): form types, building forms, question types, scales, skip logic, milestones/competencies, locked questions, sharing
    
*   **MedHub - Evaluations — UME — Delivery**: manual delivery, automated delivery, Course List delivery, SIS, self-initiated evaluations, session evaluations, expiration, insufficient contact
    
*   **MedHub - Evaluations — UME — Responses**: evaluation access hierarchy, Review & Release Groups, final evaluation workflow, grading, reset to partially complete, low score alerts, View Completed Evaluations, reporting
    

## UME form types

Each evaluation form is identified with one or more **types**. The type drives who can deliver the form, who can complete it, who can view results, and what default confidentiality applies. The available evaluation types for a UME institution are controlled by the root setting `school_evaltypeA`.

`school_evaltypeA` is a 2-dimensional array:

*   Dimension 1 (`[1]`): evaluation types available to **Student Administrators**
    
*   Dimension 2 (`[2]`): evaluation types available to **Course Administrators/Coordinators**
    

If the setting is a flat (1-dimensional) array, both Student Admins and Course Admins see the same types. When the institution needs to restrict which types Course Admins can work with (for example, preventing Course Admins from creating forms of a type they shouldn't deliver), the 2-dimensional configuration is used.

The complete list of UME evaluation types:

*   Student evaluation of other student (peer)
    
*   Student evaluation of resident
    
*   Student evaluation of faculty
    
*   Student self evaluation
    
*   Student evaluation of a service/clinic
    
*   Student evaluation of course
    
*   Faculty evaluation of a student
    
*   Resident evaluation of student
    
*   Resident/Student/Faculty evaluation of a procedure
    
*   Resident/Student/Faculty evaluation of a conference
    
*   Patient/staff evaluation of a student
    
*   Patient/staff evaluation of faculty/program/hospital
    
*   Student evaluation of school/hospital
    
*   Faculty self evaluation
    
*   Faculty evaluation of a service/clinic
    
*   Faculty evaluation of other faculty (peer)
    

Not all types are enabled at every institution. The root setting controls which are available.

> **UME evaluation types available on the GME side.** All UME evaluation types are also accessible on the GME side of a site, because the school of medicine is created using the GME side as the "base" (the medical school placeholder program). The code to include Resident of Faculty type evaluations is not included on the UME side, which is why those evaluations do not appear in UME View Completed Evaluations for a faculty member. If a GME Program Administrator can see student-of-faculty evaluations in their View Completed Evaluations and the UME side cannot, this is by design — not a permissions issue.

## Building forms

### Creation paths

Evaluation forms are built and managed under **Evaluations → New Evaluation Form** (and Manage Evaluation Forms for editing). There are four creation paths:

1.  **Design new form** — start from scratch.
    
2.  **Copy existing form** — copy a form already in this course.
    
3.  **Copy from another course** — copy a form shared by another course at the institution.
    
4.  **Copy from another institution** — search MedHub-wide for a form another institution has shared. The source form must have "Allow other MedHub institutions to copy this evaluation form" checked. Milestone tagging and header descriptions import when compatible.
    

A GME program can also share a form with UME: the Program Administrator checks "Allow other programs to copy this evaluation form" and "Allow other MedHub institutions to copy this evaluation form," then a UME course can use "Copy From Another Institution" to find and copy it.

> **Copying a form does not copy mapping.** When a form is copied (from any source), the evaluation question mapping (contributor-to-final) is **not** copied. Mapping must be re-configured on the new form.

> **Locked forms cannot be unlocked.** Once a form's design status is changed to Final (Locked), it cannot be reverted to Draft to add new questions. The only option is to copy the form, modify the copy, and inactivate the original.

### Form attributes

When a form is created, the following are set on the initial creation page:

*   **Title** — can be modified at any time, even after the form has been delivered and has completed responses.
    
*   **Introduction / Instructions** — displayed to the evaluator at the top of the form. Can be modified at any time.
    
*   **Types** — the evaluation types this form is identified with.
    
*   **Public** — when checked, the form is intended to be available to other courses at the institution to copy. **Known gap:** checking "Public" on a course-level form does not currently share the form with other courses as the user manual states (AMBS-8105). The Student Administrator must explicitly share the form with courses.
    
*   **Format** — Standard or Right/Left columns. Right/Left allows scale questions with content on both ends.
    
*   **Descriptions display** — pop-up hint or beneath option.
    
*   **Numbering** — Autonumber (default) or Number manually.
    
*   **Allow students to view evaluation** — form-level setting that controls whether students can view completed evaluations of this type about themselves. If disabled, students will not have access regardless of Review & Release or School Settings.
    

### Form status

*   **Draft** — the form can be modified (add/remove/reorder questions). Cannot be delivered.
    
*   **Final (Locked)** — the form is locked and deliverable. Questions cannot be added or removed. Question text, scales, and alert configurations can still be edited.
    

Changing status from Draft to Final is done via the Modify Form page → Update Information. If the status change fails to save, check the medical school placeholder program's evaluation settings on the GME side.

## Question types and answer types

Forms support these question types:

*   **Header** — non-scoring; used to break the form into sections.
    
*   **Standard scale question** — pulls from the Scales list.
    
*   **Milestone scale question** — pulls from milestone/competency scales and can be tagged to competencies.
    
*   **Comment / free-text** — open response; can be required or optional, and can be configured to require text only when a specific scale answer is given.
    
*   **Options (pull-down)** — single-select from a list. Can be configured for low score alerts per individual option.
    
*   **Checkbox / multiple selection** — multi-select.
    
*   **Yes / No** — binary; can trigger a required comment or alert.
    
*   **Confidential comment** — a comment field that is hidden from certain user types based on the evaluation access settings.
    

> **"Repeat Scales on Consecutive Questions" setting.** If scale descriptions are not repeating on each question within a UME form, check the GME Medical School placeholder program's Program Settings → Evaluations subtab and ensure "Repeat Scales on Consecutive Questions" is enabled.

> **Custom answer types displaying "n/a."** When an evaluator opens an incomplete evaluation with custom answer types, "n/a" may display next to each option even though the custom answer type does not include N/A. This is a known display issue (AMBS-8194).

## Skip logic

Skip logic allows questions on an evaluation form to be shown or hidden based on the evaluator's answer to a previous question. Configured per question via the **Skip Logic** column in the form builder.

**Two modes:**

*   **Hide initially** — the question is hidden when the form loads. It displays only if the evaluator selects one of the configured trigger answers on the controlling question.
    
*   **Show initially** — the question is visible when the form loads. It is hidden if the evaluator selects a trigger answer.
    

**Configuration:** Click the Skip Logic column for a question → select Hide initially or Show initially → select which answers on the controlling question trigger the show/hide behavior.

**Key behaviors and constraints:**

*   Hidden questions cannot be required. The evaluator cannot answer a question they cannot see.
    
*   If a question that serves as the skip logic trigger is **deleted from the form**, dependent questions may behave inconsistently — some evaluators may be able to submit while others cannot, because the system loses the reference to the deleted trigger question. The fix is to re-examine and re-configure skip logic on the remaining questions.
    
*   When **copying a form from another institution**, skip logic configuration may not transfer correctly. A rule set to "display if a specific answer is selected" on the source form can become "display if ANY answer is selected" on the copied form. This was corrected in April 2025 (AMBS-13474), but forms copied prior to that fix may have incorrect skip logic and should be reviewed.
    

## Scales

Scales are managed by MedHub Support, not by the Student Administrator or Course Coordinator. When an institution needs a custom scale, the request is submitted to MedHub Support with the desired option labels, headers (if any), N/A behavior, and any specific requirements.

Custom scales can be added per institution. Once created, they appear in the scale dropdown for all courses at that institution.

**Key behaviors:**

*   Scales with similar option text but different IDs can look identical to the evaluator. The fix is to add visible headers to distinguish them.
    
*   Renaming scale options (e.g., changing "Best Possible Experience" to "Excellent Experience") can either modify the existing scale (affecting historical responses) or create a new scale variant (preserving historical labels). Institutions requesting a rename should be asked which they prefer.
    

## Milestones and competencies (UME)

UME milestone/competency usage is more limited than GME. UME does not have ACGME milestone package imports — those are specific to GME residency and fellowship specialties.

UME forms use **competency-tagged questions** on non-milestone scales. When a question is tagged to a competency, the data feeds the Competency Averages/Trends view that students can see when the School Setting "Show Competency Averages/Trends" is enabled.

The root setting `settings_schools_evaluations_locked_override` controls whether linked competencies and milestones can be overridden on locked evaluation questions.

## Low score alert configuration on forms

Low score alerts notify designated recipients when an evaluator's response to a question meets or falls below a configured threshold. The configuration is set at the **question level** within the form builder. The behavioral detail of how alerts fire, route, and display after an evaluation is submitted is documented in **MedHub - Evaluations — UME — Responses** §"Low score alerts." This section covers the full configuration mechanics on the form itself.

**Where it lives:** Evaluations → Manage Evaluation Forms → \[form\] → **Alerts/Comments** column. Click "Yes" on any question row to open the alert configuration for that question. Alert configuration can be modified on Final (Locked) forms — it does not require the form to be in Draft status.

### Setting Alerts By

Two options:

*   **All** — every answer option on the question's scale is individually configurable as a trigger.
    
*   **Individual options** — only specific scale options are configurable.
    

For most use cases, "All" is appropriate because it exposes every answer option for configuration.

### Send Alert On

For each answer option (scale value or pull-down choice), a checkbox determines whether selecting that answer triggers the alert. Check the box next to each answer that should fire an alert. Uncheck answers that should not.

**For scale questions:** Typically the lowest-scoring options are checked (e.g., "Does not meet expectations," "Strongly Disagree," or numeric values 1-2 on a 1-5 scale).

**For pull-down / options questions:** Each individual choice option has its own Send Alert checkbox. For example, on a question with Pass/Fail options, "Fail" can be configured to trigger an alert while "Pass" does not. This works the same way as scale questions — the alert is tied to specific answer values, not to a numeric threshold.

### Required Comment

For each answer option that has Send Alert checked, a separate checkbox controls whether the evaluator is **required to enter a comment** when selecting that answer. This is configured per triggering option — you can require comments on some low-score answers but not others.

The required comment appears as a text field that the evaluator must fill in before they can submit the evaluation. If they select a triggering answer and leave the comment blank, the form will not submit.

### Delivering Recipients

Delivering Recipients determine which user types receive the alert email and Urgent Task when the alert fires. The available recipient types for UME forms are:

*   **Course Coordinator** — primary and backup coordinators for the course that delivered the evaluation.
    
*   **Course Director** — the primary Course Director for the delivering course. The director must also have email alerts enabled in their User Preferences (Director Low Score Alerts = "Send Email Alerts") to receive the email notification.
    
*   **Course Associate Director** — visible as a recipient option when `setting_clerkship_codirectors` is enabled.
    
*   **Advisor** — the faculty advisor assigned to the student evaluatee.
    
*   **Notification Group** — a custom group of recipients. Notification Groups are enabled via a root setting and managed under List Management → Low Score Notification Groups. Once a group exists, it appears in the Delivering Recipients list.
    

**If no Delivering Recipients are selected:** The alert is still **recorded** in the system. It appears on the Evaluations Low Score Report and the alert flag is set on the evaluation in View Completed Evaluations. However, no email notification is sent and no Urgent Task is generated. This is the most common configuration mistake — setting up thresholds and required comments but forgetting to select recipients, then wondering why no one was notified.

### The "Send Alert to delivering course's recipients" checkbox

This checkbox appears in the question-level alert configuration for UME forms. It controls the routing logic for which course's recipients receive the alert:

*   **When checked:** The alert routes to the recipients associated with the course that delivered the evaluation, regardless of the faculty target's default program.
    
*   **When unchecked:** The alert routes to the recipients associated with the faculty target's default program.
    

This is particularly important when faculty teach across multiple courses — checking this box ensures the alert goes to the people who manage the course where the evaluation was delivered, not the faculty member's home program. See **MedHub - Evaluations — UME — Responses** §"Low score alerts — alert routing" for the full delivering-entity routing logic including edge cases.

### Notification Groups

**Where it lives:** List Management → Low Score Notification Groups (enabled via a root setting)

To create a Notification Group:

1.  Navigate to List Management → Low Score Notification Groups.
    
2.  Click Add Group and name the group.
    
3.  Add members — any MedHub user at the institution can be added.
    
4.  Save.
    

Once created, the group appears as a Delivering Recipient option in the question-level alert configuration. When selected, group members receive the alert in addition to any other selected recipient types.

Notification Groups are useful when alert recipients don't map to the standard course hierarchy — for example, when a dean's office needs visibility into alerts across multiple courses, or when a department-level team needs alerts for a specific set of questions regardless of which course delivers the evaluation.

For most Notification Group members, the Urgent Task alert link is the **only** way to access the low score evaluation. An exception is if the member is also the Course Director or Associate Course Director for the relevant course.

### Alerts on shared forms

When a Student Administrator configures low score alerts on an evaluation form, and the form is shared with courses, the alert configuration flows to the shared form at the course level. The Delivering Recipients on the shared form will use the course-level recipients (Course Coordinator, Course Director, etc.) for the course that delivers the evaluation.

### Example configuration walkthrough

To configure a low score alert on a Faculty evaluation of student form so that the Course Director and Course Coordinator receive an email and Urgent Task when an evaluator scores a student as "Does not meet expectations" on Question 5, and the evaluator must enter a comment explaining why:

1.  Evaluations → Manage Evaluation Forms → select the form.
    
2.  In the question list, find Question 5. Click "Yes" in the Alerts/Comments column.
    
3.  Setting Alerts By: All.
    
4.  Find "Does not meet expectations" in the list of answer options. Check the **Send Alert** box.
    
5.  On the same row, check the **Required Comment** box.
    
6.  Under Delivering Recipients, check **Course Coordinator** and **Course Director**.
    
7.  Save.
    

## Sharing forms

### Sharing within an institution

A form can be shared with one or more courses at the institution from the Modify Form page. The Student Administrator can share forms with any course. Course Coordinators can share forms with courses they have access to.

> **"Public" checkbox gap.** Checking "Public" on a course-level form does not currently share the form with other courses as the user manual states. This is a known gap (AMBS-8105). To share a form with other courses, use the explicit sharing mechanism on the Modify Form page.

### Sharing for pre-populated evaluation mapping

For contributor forms to be available for Final Evaluation Question Mapping, the contributor evaluation form **must be shared with the course**. This requirement was introduced in the March 2020 minirelease. If a course's Final Evaluation Question Mapping page shows "No finalized evaluations of students were found" for a contributor form, confirm the contributor form has been shared with the course.

### Sharing between GME and UME

Two methods:

1.  **Student Administrator creates the form** → shares it with appropriate courses → GME Program Administrator goes into the Medical School placeholder program and shares it with appropriate GME programs.
    
2.  **GME Program Administrator creates the form** in the Medical School placeholder program → shares with appropriate GME programs → Student Administrator shares with appropriate courses.
    

Option 1 is recommended because the form originates on the UME side where it will be primarily used.

## Locked questions

The root setting `settings_schools_evaluations_locked_override` controls whether linked competencies and milestones can be overridden on locked evaluation questions at the school level. The Locked Questions framework on UME follows the same infrastructure as GME — institution-wide questions authored by the GME Office that courses include but cannot modify.

## Inactivating forms

When a form is inactivated (status changed to Inactive/Archived), it is no longer available for new deliveries. However:

*   **Self-initiated evaluation forms** that reference an inactivated form will continue to allow students to initiate evaluations on the inactive form until it is explicitly removed from the Course Settings → Self-Initiated Evaluations area. Inactive forms now display as greyed-out in this area to signal they should be removed (AMBS-9661).
    
*   Historical completed evaluations on inactivated forms remain accessible in View Completed Evaluations and reports.
    

## Settings appendix

Setting

Scope

Default

Effect

`school_evaltypeA`

School

Array

Evaluation types available to UME. Can be a 2-dimensional array: \[1\] = Student Admin types, \[2\] = Course Admin types.

`settings_schools_evaluations_locked_override`

School

0

Allow override of linked competencies and milestones for locked evaluation questions.

`settings_students_evals`

School

1

Evaluation method. 0 = off, 1 = standard, 2 = CC model (student of faculty only), 3 = Duke model.

## Common troubleshooting scenarios

**"The Course Coordinator can't see evaluation types that the Student Admin can see."** Check `school_evaltypeA`. If it's configured as a 2-dimensional array, the types available to Course Admins (dimension 2) may be a subset of those available to Student Admins (dimension 1).

**"Scale descriptions aren't repeating on consecutive questions."** Check the Medical School placeholder program on the GME side → Program Settings → Evaluations subtab → "Repeat Scales on Consecutive Questions." This must be enabled.

**"Students can still initiate evaluations on a form we inactivated."** The form must be removed from Course Settings → Self-Initiated Evaluations area. Inactivating the form alone does not remove it from self-initiation.

**"We copied a form from another institution and the skip logic isn't right."** Forms copied before April 2025 may have skip logic that transferred incorrectly (AMBS-13474). Review the skip logic configuration on the copied form and compare it to the source form's intended behavior.

**"We want to add a question to a locked form."** Not possible. Copy the form, add the question to the copy, inactivate the original. Note that mapping is not copied — re-configure mapping on the new form.

**"Contributor forms don't appear in Final Evaluation Question Mapping."** The contributor form must be shared with the course. This requirement was introduced in March 2020.

**"We set up low score alerts on a question but no one received a notification."** Check whether Delivering Recipients are selected in the question-level alert configuration. If thresholds are set but no recipients are checked, the low score is recorded (visible in the Evaluations Low Score Report) but no email or Urgent Task is generated.

**"The Course Director isn't getting low score alert emails."** Two things to check on the form side: (1) Is Course Director selected as a Delivering Recipient in the question-level alert configuration? (2) Does the Course Director have email alerts enabled in their User Preferences → Director Low Score Alerts field? Both must be true. For routing and delivery issues beyond configuration, see **MedHub - Evaluations — UME — Responses** §"Low score alerts."

**"We want different people to get alerts for different questions on the same form."** This is supported. Delivering Recipients are configured per question, not per form. Each question can have a different set of recipients.

# MedHub - Evaluations - UME - Evaluation Delivery

# MedHub - Evaluations — UME — Delivery

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

This article covers all methods of delivering evaluations to evaluators on the UME side of MedHub. It is the second of three UME evaluation articles:

*   **MedHub - Evaluations — UME — Forms**: form types, building forms, question types, scales, skip logic, milestones/competencies, sharing
    
*   **MedHub - Evaluations — UME — Delivery** (this article): manual delivery, automated delivery, Course List delivery, SIS, self-initiated evaluations, session evaluations, expiration, insufficient contact
    
*   **MedHub - Evaluations — UME — Responses**: evaluation access hierarchy, Review & Release Groups, final evaluation workflow, grading, reset to partially complete, low score alerts, View Completed Evaluations, reporting
    

## Student Administrators and Course Coordinator capabilities

UME evaluation delivery involves two administrative tiers with different capabilities:

**Student Administrator** — institution-level access. Can deliver evaluations across all courses they have access to. Can deliver to Outside Evaluators created at the school level, but **not** to Outside Evaluators created at the course level. Can permanently delete incomplete evaluations (including course evaluations set in the Course List). Can deliver evaluations to students up to 120 days after enrollment ends.

**Course Coordinator** — course-level access. Can deliver evaluations within their assigned course(s). Can deliver to Outside Evaluators created at their course level. Can delete incomplete course evaluations, but deleted evaluations route to the "Identify Incomplete Evaluations" link as a safety net (the Student Admin can permanently remove them from there). Course Coordinators can deliver evaluations to students 30 days before a course starts and up to 120 days after enrollment ends.

> **Student groups vs individual delivery.** When delivering to student groups, evaluations can only be delivered to students within the active enrollment period for that group. The 30-day pre-course and 120-day post-enrollment windows apply only when selecting individual students, not groups.

> **Course association on delivery.** When a Student Administrator manually delivers an evaluation, the system associates the evaluation with the course currently selected in the course dropdown on the Home page. If the Student Admin does not change their selected course before delivering, the evaluation is associated with the wrong course. This affects which Course Coordinators/Directors can view the completed evaluation. Best practice: always confirm the correct course is selected in the dropdown before delivering.

## Manual delivery

**Where it lives:** Evaluations → Deliver Evaluations

Manual delivery is a four-step workflow. Each step has its own page.

### Step 1 — Select evaluation type and selection method

Two fields:

*   **Evaluation Type** — dropdown of the evaluation types available to the current user. Student Admins see all types in `school_evaltypeA[1]`. Course Coordinators see types in `school_evaltypeA[2]` (or all types if the setting is a flat array).
    
*   **Selection Method** — controls how recipients and targets are chosen in Step 2:
    
    *   **Individuals** — pick individual users for recipient and target lists.
        
    *   **Groups** — pick evaluation groups (if any are configured for the institution). Evaluation Groups are static lists of users created under Evaluations → Evaluation Functions. When delivering to a group, the system delivers an evaluation for each user in the group.
        

Click **Continue** to advance to Step 2.

The page also displays a **Recently Delivered Evaluations** table (showing the last 20 deliveries from this admin) with columns: Recipient, Type, Evaluation Title, Rotation, Service, Clinic, Issue Date, Expiration Date. This is a reference table — it does not affect the new delivery being configured.

### Step 2 — Configure the delivery

This is the main configuration page. All fields:

**Evaluation Type** and **Selection Method** — displayed read-only at the top, reflecting the Step 1 selections.

**Evaluation Form(s)** — dropdown of all Final (Locked) evaluation forms of the selected type available to the current user. To deliver multiple forms in a single delivery (e.g., issuing two different evaluation forms to the same recipient/target pairing), click **\[SELECT MULTIPLE\]** next to the dropdown — this changes the field to a multi-select list. The system will deliver one evaluation per recipient/target/form combination.

**Recipient(s)** — the left selection list shows users who will complete the evaluation. The list is filtered by the evaluation type (e.g., Student-of-Faculty type shows students as recipients; Faculty-of-Student type shows faculty). Each entry shows the user's name, number of evaluations the user already has in queue, and active enrollment/service dates in square brackets. **Hold Shift or Ctrl** to select multiple recipients.

**Faculty/Recipient to evaluate** — the right selection list shows the targets (evaluatees). Filtered by evaluation type. For evaluations targeting faculty, an **Outside faculty** link appears below the list — clicking it shows Outside Evaluators (school-level for Student Admin, course-level for Course Coordinator) so they can be selected as targets.

**Notes (optional)** — free-text field. The text entered here is included in the **MedHub - Evaluation Request** email that goes to the evaluator. It does not appear on the evaluation form itself in the MedHub UI. Use this to give the evaluator context for why the evaluation was issued. The Notes field is not visible to the evaluation target.

**Rotation Period (optional)** — dropdown of the recipient's currently scheduled rotation periods. Default value is "(unavailable)" when no rotation period is selectable. Selecting a rotation associates the evaluation with that block for reporting purposes.

**Service/Clinic (optional)** — dropdown of services/clinics the recipient is currently assigned to. Default value is "(unavailable)" when no service is selectable. Selecting a service tags the evaluation with that service.

**Special Options (optional)** — dropdown with these values:

*   **(none)** — standard delivery; built-in confidentiality applies per evaluation type.
    
*   **Anonymous** — evaluator identity is permanently stripped upon submission. See **MedHub - Evaluations — UME — Responses** §"Confidentiality and anonymity" for full consequences.
    
*   **Electronic Signature** — evaluator must provide an electronic signature when submitting. Note: this option does not work on the MedHub mobile web browser (the electronic signature box does not render there). Faculty using mobile must use the MedHub iOS app instead.
    

Below the Special Options dropdown is a **Disable 'Insufficient Contact' links** checkbox. When checked, the "Insufficient contact to evaluate" link is hidden from the evaluator on this specific delivery, preventing them from removing the evaluation without completing it. This setting is per-delivery — if the checkbox is enabled after evaluations have been queued, the change does not apply to already-queued evaluations (the setting is saved to the database at queue time, AMBS-143834).

**Reciprocal Evaluation (optional)** — dropdown that allows automatic delivery of a reciprocal evaluation back the other way at the same time as the primary delivery. Default value is **"(do not send reciprocal evaluations)."**

A reciprocal evaluation is the inverse evaluation pair — e.g., when delivering a Student-of-Faculty evaluation from a student to a faculty member, the reciprocal would be a Faculty-of-Student evaluation from that faculty member back to the student. Selecting a form from this dropdown causes the system to deliver both evaluations simultaneously, paired as reciprocals.

The dropdown lists forms of the inverse evaluation type that are available in the current context. If no inverse-type forms exist, the dropdown shows only "(do not send reciprocal evaluations)."

Reciprocal evaluations set up through this dropdown are recognized by the system as **the** reciprocal pair for the primary evaluation. This matters for view-access logic: if a course has the setting "Hide until reciprocal evaluation is submitted" configured for either evaluation type, the system uses the reciprocal pairing to determine when the target can see the completed evaluation.

> **Reciprocal Evaluation delivery vs reciprocity window.** These are two distinct mechanisms. The Reciprocal Evaluation dropdown in Step 2 sets up the _delivery_ of a paired evaluation. The **reciprocity window** (root setting `ume_eval_reciprocity_window`, default 14 days) controls _view access_ — specifically, how long the system waits for a reciprocal evaluation to be completed before releasing the original evaluation to the target's view (when Review & Release or School Settings include reciprocity conditions). A reciprocal evaluation does not have to be set up at delivery time through this dropdown to be considered a reciprocal — the system will recognize any inverse-type evaluation delivered within the reciprocity window as the reciprocal. The Step 2 dropdown is just a convenience to set up both at once. See **MedHub - Evaluations — UME — Responses** §"Reciprocity" for the full view-access logic.

**Delivery (required)** — three radio button options:

*   **Immediate** — the evaluation is delivered as soon as the admin clicks through Step 3 and submits. Evaluator receives the email notification and the Urgent Task immediately.
    
*   **On Date (Queue)** — opens a date picker. The evaluation is queued and delivered on the specified date (during the overnight processing).
    
*   **Multiple Dates (Queue)** — opens multiple date pickers. The evaluation is queued and delivered on each specified date (useful for repeating periodic deliveries from a single setup).
    

**Expiration Date (optional)** — when the root setting `eval_expiration_enabled` is enabled (default), this field is pre-populated based on the School/Course Settings Evaluation Expiration default. Override by entering a different date. If the field is blank, the evaluation does not expire.

Click **Submit** to advance to Step 3.

### Step 3 — Review matches and deliver

The page displays:

*   **Evaluation Type** — confirms the Step 1 selection.
    
*   **Evaluation Form** — confirms the Step 2 form selection. If multiple forms were selected, each appears as its own tab/section.
    
*   **Delivery Date** — confirms the Step 2 delivery configuration (e.g., "05/28/2026 (immediate)" or the queued date).
    

Below this header is the **STANDARD MATCHES** table listing every recipient/target/form combination the system will deliver. All matches are checked by default. The Student Admin or Course Coordinator can:

*   **Uncheck any specific recipient/target/form combination** to exclude it from this delivery. Use this to skip pairings that aren't needed (e.g., if a student-faculty pair didn't actually work together).
    
*   **Review all matches** to confirm the delivery configuration is correct before committing.
    

A warning banner reads: "The delivery process may take several minutes. Don't click submit button below more than once or refresh the page." Multiple-recipient/multiple-target deliveries can produce dozens of matches and the system processes them sequentially.

Two controls below the table:

*   **Deliver Selected Evaluations** — the action button. Clicking this commits the delivery and triggers the email notifications and Urgent Tasks (for Immediate delivery) or queues the records (for On Date / Multiple Dates).
    
*   **Deliver additional evaluations of the same type** — checkbox. When checked, after clicking Deliver Selected Evaluations, the system returns to Step 1 with the evaluation type pre-selected, allowing the admin to start another delivery without navigating back from the Evaluations tab.
    

> **Critical: Step 3 is NOT a delivery confirmation — it is the final delivery action.** A common new-user error is treating Step 3 as a "review what was sent" page. If the admin navigates away from Step 3 without clicking **Deliver Selected Evaluations**, no evaluations are delivered. Always confirm a success message appears or the page returns to the Evaluations tab before considering the delivery complete.

### Step 4 — Success confirmation

After clicking Deliver Selected Evaluations, the system displays a success message and (if "Deliver additional evaluations of the same type" was not checked) returns the admin to the Evaluations tab. The newly delivered evaluations appear in the Recently Delivered Evaluations table on the Step 1 page if the admin starts a new delivery, and in the Evaluation Delivery History report.

### Behaviors specific to manual delivery

**Course association on delivery.** When a Student Administrator manually delivers an evaluation, the system associates the evaluation with the course currently selected in the course dropdown on the Home page. If the Student Admin does not change their selected course before delivering, the evaluation is associated with the wrong course. This affects which Course Coordinators/Directors can view the completed evaluation, and which course's recipients receive any low score alerts. Best practice: always confirm the correct course is selected in the dropdown before delivering.

**Gray vs black student names.** When a student has multiple enrollments in the same course, they appear only once in the delivery recipient list. The system shows dates for the enrollment with the latest start date. The student may display in gray (future enrollment) rather than black (current enrollment). Gray students can still be selected for delivery.

**Rotation dates on manually delivered evaluations.** When a Course Coordinator manually delivers an evaluation without selecting a Rotation Period in Step 2, rotation/course dates are not included on the delivered evaluation. Dates are a feature of evaluations delivered automatically (via automated rules, Course List, or SIS). To get rotation dates on a manual delivery, select the Rotation Period in Step 2.

**Outside Evaluators in manual delivery.** Outside Evaluators appear via the **Outside faculty** link below the Recipients/Targets selection lists. Student Admins see only school-level OEs. Course Coordinators see course-level OEs. There is a known gap where Student Admins cannot deliver to course-level OEs and Course Coordinators cannot deliver to school-level OEs.

**Duplicate delivery warning.** On Step 3, MedHub flags potential duplicate deliveries: the system looks at whether the same evaluation has been delivered in the last 14 days. "Same evaluation" is defined as the same evaluator, evaluatee, and evaluation form — rotation dates and service are not considered. A duplicate evaluation can still be delivered, but the admin must check the box next to the form to confirm.

**Queued evaluations editing.** Once an evaluation is queued (via On Date or Multiple Dates), the admin can navigate to **Evaluations → Queued Evaluations** to delete or modify queued items before they are delivered. The Expiration Date on already-queued evaluations can be modified through the Queued Evaluations action menu → Set Expiration Date. Other attributes (form, recipient, target, Special Options) cannot be modified after queuing — the evaluation must be deleted and re-queued.

## Automated evaluations

**Where it lives:** Evaluations → Automated Evaluations (Course Coordinator) or Evaluations → Automated Evaluations (Student Admin)

### Two delivery methods

**By Course Periods** — generates evaluations based on the student's enrollment dates in the course. Available evaluation types:

*   Student evaluation of other student (peer)
    
*   Student self evaluation
    
*   Student evaluation of course
    

**By Service Dates** — generates evaluations based on the student's service assignment dates within the course. Available evaluation types:

*   Student evaluation of faculty
    
*   Student evaluation of a service/clinic
    
*   Student evaluation of other student (peer)
    
*   Student evaluation of resident
    
*   Faculty evaluation of a student
    
*   Resident evaluation of student
    
*   Patient/staff evaluation of a student
    

> **Faculty of Service is NOT available for automated delivery.** This evaluation type must be delivered manually.

### Anchor dates for automated delivery

When configuring an automated evaluation rule, the following anchor date options are available:

*   Service start date
    
*   Service mid-point
    
*   Service end date
    
*   Course start date
    
*   Course mid-point
    
*   Course end date
    

These are automatically available and require no additional settings to use.

### The 10-day service gap rule

The automated evaluation delivery engine uses a hardcoded **10-day threshold** to determine whether a student's service assignment has truly ended. This rule is not configurable, cannot be adjusted per course or institution, and applies uniformly across all UME automated evaluation rules (AMBS-14871).

**How it works:**

When a student has two assignments on the **same service** and the gap between them is **10 days or less**, the system treats the two assignments as **one continuous service**. It does not deliver an evaluation at the end of the first assignment. Instead, it waits for the true end of the continuous service period and delivers **one evaluation per evaluator/evaluatee combination** covering the entire span — even if the evaluator only interacted with the student during one of the assignments.

When the gap between two assignments is **more than 10 days**, the system treats them as separate service experiences. Each segment triggers its own evaluations independently per the automated rule configuration.

This is by design: the threshold prevents the system from sending multiple evaluations for what is functionally a single continuous experience interrupted by a short gap (e.g., a weekend, holiday, or brief absence).

**Student-centric logic — faculty schedules are not considered.**

The gap check is performed **only on the student's assignment schedule**. The system does not consider:

*   Whether the faculty member's involvement actually ended before the next student assignment
    
*   Whether the faculty/student overlap continues into the next assignment
    
*   Which specific faculty are assigned to the second assignment
    

Even if a faculty member only interacted with the student during the first assignment and has no relationship to the second assignment, the evaluation of that faculty member is consolidated into the single delivery at the end of the continuous service period — not delivered at the end of the first assignment.

**Workaround when the consolidation is not desired.**

If an institution determines that two assignments on the same service should be evaluated independently rather than consolidated (for example, because they were genuinely separate experiences with different faculty cohorts), the only available correction is a **data adjustment**: modify the second assignment's start date so the gap exceeds 10 days. Increasing the gap by even one day (from 10 to 11) moves the assignments outside the threshold and causes the system to treat them as separate services, triggering independent evaluation delivery for each. This is a data workaround, not a configuration change — there is no setting that bypasses the rule.

**Terminology — assignments vs blocks.**

A **block** is the rotation schedule structure (the calendar framework). A single block can contain multiple **assignments**. The 10-day rule operates on assignments within or across blocks, not on blocks themselves. When discussing this behavior with clients or in tickets, use "assignment" for accuracy — describing the issue in terms of blocks can produce misleading conclusions.

**This rule applies to automated evaluation delivery only.** It does **not** apply to SIS delivery (see "Students Identify Supervisors" below) — SIS may deliver two separate requests when assignments fall within the 10-day window.

### The simulation tool

Automated evaluations include a Simulator tool that shows which evaluations would be delivered based on the current schedule and configuration. The simulation looks at the current state of schedules and rules — it does not deliver backwards. If a student was not scheduled to a service at the time the evaluation would have been generated, the simulation may show the evaluation now but it was not delivered historically.

### Queued evaluations

Evaluations can be queued for future delivery. Once queued, the following can be modified:

*   Evaluations can be deleted from the queue.
    
*   If the institution uses Evaluation Expiration, an expiration date can be set on already-queued evaluations.
    
*   If the email address of a student is updated while the evaluation is in queue, the evaluation goes to the new email when delivered.
    

Other attributes of queued evaluations (form, recipient, target) cannot be modified after queuing — the evaluation must be deleted and re-queued.

> **Student Admin visibility of course-queued evaluations.** Student Administrative users can see evaluations queued at the course level by Course Coordinators (AMBS-8501).

> **Queued evaluations and inactive profiles.** If a student's profile becomes inactive (e.g., training history not entered for the new academic year) between the time an evaluation is queued and the time it is delivered, the system automatically removes the evaluation with the message "System deleted evaluation (evaluator no longer active)."

### Duplicate evaluation checks for automated delivery

When automated evaluations fire, the system checks for duplicates. For course evaluations, the duplicate check considers `userID`, `clerkshipID`, `end_date`, and `eval_type` — but **not the evaluation form ID**. This means if two different forms of the same evaluation type are set up for the same course, and the first form's evaluation was already delivered for the student/course/date combination, the second form's evaluation will not deliver.

## Course List delivery

**Where it lives:** Student Admin → Course List (the course management page)

The Course List is the primary surface for configuring automatic delivery of **Final evaluations** and **Course evaluations**. Each course row in the Course List has fields for:

*   Final evaluation form and evaluator (Course Director)
    
*   Course evaluation form
    
*   Delivery timing
    

### Final evaluation delivery via Course List

When a course has a Final evaluation form designated in the Course List, the system automatically delivers the Final evaluation to the designated Course Director at the configured timing (typically course end date).

For the Final evaluation fields to appear in the Course List, three conditions must be met:

1.  The user is a Student Administrator.
    
2.  A default final evaluation form is set via `settings_students_final_evaluationID`.
    
3.  The Student Admin has access to evaluation delivery.
    

> **Alternate Director (Outside Evaluator) gap.** When a course has an Outside Evaluator set as the Alternate Director in the Course List instead of a regular faculty Course Director, the "Identify Undelivered Final Evaluations" tool cannot deliver finals to the Outside Evaluator. Finals delivered on time from the Course List work correctly for Outside Evaluators; the gap only affects late/catch-up delivery via the Identify tool (AMBS-10219).

### Course evaluation delivery via Course List

Course evaluations set in the Course List are delivered automatically based on the configured timing. The "of course" evaluation can be set independently of the Final evaluation — one does not depend on the other.

> **No expiration on Course List evaluations.** Final evaluations and Course evaluations delivered via the Course List do not support the Evaluation Expiration setting. Expiration dates for course evaluations can be set manually after delivery through the Incomplete Evaluations page.

### Identify Undelivered Final Evaluations

**Where it lives:** Evaluations → Identify Undelivered Final Evaluations

This tool shows students who should have received a Final evaluation but did not. Filters include Course Dates, Course Group(s), and Student(s).

Once a student's name appears on this list, it remains until **both** the Final evaluation and the Course evaluation are delivered through this page, **or** until 180 days have passed. This means a student whose Final was delivered on time but whose Course evaluation was not delivered through this page will continue to appear on the list.

### Changing the Course Director mid-cycle

When the Course Director is changed in the Course List, previously delivered Final evaluations remain assigned to the original Course Director. To reassign:

1.  Go to Incomplete Evaluations, locate the finals delivered to the previous director, and remove them.
    
2.  Go to Identify Undelivered Final Evaluations — the finals will reappear with the new director's name.
    
3.  Deliver from there.
    

## Students Identify Supervisors (SIS)

**Where it lives:** Evaluations → Evaluation Functions → Students Identify Supervisors (Course Coordinator level)

SIS is the UME equivalent of GME's RIS (Resident Identifies Supervisor). The student, rather than the system, picks the faculty or residents who supervised them, and evaluations are delivered to those identified supervisors.

### Configuration

SIS is configured per course. Settings include:

*   When the request is sent (relative to the student's service end date)
    
*   The form to deliver to identified supervisors
    
*   Which services to apply SIS to
    

### Key behaviors

**SIS delivery is based on the student's service date**, not the course/rotation date. The system looks at the student's assignment to a service in the course. If the student's service assignment is not removed before an enrollment record is dropped, an SIS request may still be delivered.

**All faculty and residents appear in the SIS list** when the student is identifying supervisors. There is no filter to limit to only those scheduled to the same service. Students can also search for and select faculty/residents from programs specified in the SIS setup's "Supervising Programs" configuration, but this does not prevent searching outside those programs (AMBS-6747).

**The 10-day service gap rule does NOT apply to SIS.** Unlike automated delivery, if a student is assigned to the same service twice within 10 days, SIS may deliver two separate requests. This has been confirmed as a gap specific to UME SIS; the GME RIS equivalent does respect the 10-day rule.

**SIS requests across academic year boundaries.** If a course's dates span two academic years, two SIS requests may be delivered to the student for the same service. A workaround is to use Service Pre-Population, which makes the system view the service assignment as continuous and issue only one SIS request. However, only one service per course can be pre-populated.

**SIS Completion Statistics.** The SIS Completion Statistics page shows initiated vs completed statistics per SIS set. The page cannot toggle between courses — the workaround is to click into each SIS Set title individually to view its statistics.

**Outside Evaluators in SIS.** Students can select course-defined Outside Evaluators from the SIS dropdown when the course has Outside Evaluators configured and a self-initiated student-of-resident type is enabled.

## Self-initiated evaluations

Self-initiated evaluations allow students or faculty to start an evaluation on their own, without an administrator delivering it.

**Configuration:** Course Settings → Evaluations → Self-Initiated Forms. The Course Coordinator adds evaluation forms to the self-initiated list for each applicable type (Faculty-initiated student evaluations, Student-initiated faculty evaluations, etc.).

**Student window:** Students can self-initiate evaluations during their enrollment period. After the course end date, the Course Coordinator can extend the window by 1 to 14 days via Course Settings → Evaluations → "Allow Self-Initiated Evaluations After Course End Date." This setting is disabled by default.

**Faculty window:** Faculty may initiate evaluations of students up to **30 days** after the student's course period end date. This is hardcoded and not configurable.

> **Inactive forms in self-initiated settings.** If a form is inactivated but not removed from the Self-Initiated Evaluations area in Course Settings, students can still initiate evaluations on that form. Inactive forms now display greyed-out in this area to signal they should be removed (AMBS-9661).

## Session evaluations

Session evaluations are delivered automatically based on scheduled sessions in Curriculum Mapping.

**Delivery timing:** Session evaluations are delivered **the morning of the session**. The student can access the evaluation at any time after delivery, even before the session occurs.

**Prerequisite:** Sessions must be scheduled (via Curriculum Mapping → Course Sessions → Session Scheduling, or Course Admin → Session Management) for session evaluations to be deliverable. If sessions are not scheduled, no evaluations will be delivered even if a form is configured.

Session configuration and scheduling are covered in the Curriculum Mapping article.

## Evaluation expiration

Evaluation Expiration removes an incomplete evaluation from the evaluator's queue after a configured number of days.

### Three-tier hierarchy

1.  **Root setting** (`eval_expiration_enabled`) — must be enabled (value = 1) to unlock the feature institution-wide. When off, expiration fields do not appear in School/Course Settings or during delivery.
    
2.  **School Settings / Course Settings → Evaluations → Evaluation Expiration** — sets the default expiration period in days. School Settings apply to evaluations delivered at the school level (by Student Admin). Course Settings apply to evaluations delivered at the course level. These do not override each other — each applies to evaluations delivered at its own level.
    
3.  **Per-delivery override** — when delivering an evaluation, an Expiration field pre-calculates from the School/Course Settings default. This value can be overridden for each specific delivery.
    

> **Final and Course evaluations from the Course List do NOT support expiration.** Evaluations delivered via the Course List (both Final evaluations and Course evaluations) do not include an expiration date function. Expiration dates can be set manually after delivery through the Incomplete Evaluations page.

### What happens when an evaluation expires

*   The evaluation is removed from the evaluator's queue of incomplete evaluations (Urgent Tasks).
    
*   The evaluation is **not** removed from the Student Admin or Course Admin list of Incomplete Evaluations. It must be manually removed by the applicable administrative user.
    
*   There is no audit trail that specifically tracks expired evaluations. The "Incomplete Evaluations - Removed" audit captures manual removals but does not indicate whether the removed evaluation was expired.
    
*   Expired evaluations are visible in the Evaluation Delivery History report with an expired status.
    

## Evaluation Due dates and late reminders

The **Evaluations Due** setting (School Settings or Course Settings → Evaluations) sets a due date relative to the delivery date. Once the due date passes, a reminder email goes to the evaluator **each Tuesday** until they complete the evaluation.

This is distinct from Evaluation Expiration:

*   **Evaluations Due** sends recurring reminders but does **not** remove the evaluation.
    
*   **Evaluation Expiration** removes the evaluation from the system.
    

Both can be active simultaneously.

## Outside Evaluators

An Outside Evaluator is someone who does not have a standard MedHub Faculty account. Outside Evaluators can be created at two levels:

**School level** — created by the Student Administrator. Visible to Student Admins for delivery purposes.

**Course level** — created by the Course Coordinator within a specific course. Visible to Course Coordinators for delivery within that course. Students can select course-level OEs when self-initiating evaluations.

> **Cross-level visibility gap.** Student Admins cannot deliver to course-level Outside Evaluators. Course Coordinators cannot deliver to school-level Outside Evaluators. This is a known functional limitation. The Outside Evaluator list that a Student Admin sees shows all accounts across courses, but delivery access is limited to school-level OEs only.

> **Outside Evaluator search.** The search bar for Outside Evaluators searches first name or last name individually. Searching for a full name (first and last together) returns no results because the names are stored separately.

## Insufficient Contact

When an evaluator clicks "Insufficient contact to evaluate" on a pending evaluation, the evaluation is deleted from the database.

### The "disable insufficient contact" setting

To prevent the "Insufficient contact to evaluate" link from appearing on course evaluations delivered via the Course List, the setting **"disable insufficient contact"** must be checked in the **Medical School GME placeholder program** under Program Settings → Evaluations subtab. This is a GME-side setting that affects UME evaluations because the Medical School program is the base for UME functionality.

### Email notification hierarchy

The **"Email Coordinator on Insufficient Contact"** setting operates on a hierarchy: it must be enabled at **both** the School Settings level **and** the Course Settings level in order to send email notifications for evaluations issued by that course. Enabling it at only one level is not sufficient.

### Audit trail

An audit trail record is created when an evaluation is removed via Insufficient Contact. The audit trail does not record which course originally delivered the evaluation. The Evaluation Completion by User report assumes all deleted evaluations were delivered by the current course, which can produce phantom delivery counts.

## Settings appendix

Setting

Scope

Default

Effect

`eval_expiration_enabled`

Site-wide

1

Enables/disables the Evaluation Expiration feature institution-wide.

`settings_students_final_evaluationID`

School

0

Default evaluation form to use for final course grades. Required for Final evaluation fields to appear in Course List.

`setting_evaluations_final_notice`

School

99 (disabled)

Number of days before/after due date to deliver final evaluation late notices to Student Admin. Negative = before, positive = after, 99 = disabled.

`ume_disable_gme_eval_notifications`

School

Array (empty)

Disables sending low score alert notifications from UME to GME default recipients for specified evaluation types.

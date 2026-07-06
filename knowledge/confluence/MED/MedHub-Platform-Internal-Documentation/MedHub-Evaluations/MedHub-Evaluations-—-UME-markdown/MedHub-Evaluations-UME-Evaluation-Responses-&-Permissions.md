# MedHub - Evaluations - UME - Evaluation Responses & Permissions

# MedHub - Evaluations — UME — Responses

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

This article covers viewing, accessing, and managing completed evaluation data on the UME side of MedHub: the access-control model, the evaluation access hierarchy, individual vs aggregate access, Review & Release Groups, confidentiality and anonymity, the final evaluation workflow, grading, reset to partially complete, low score alerts, View Completed Evaluations, and reporting. It is the third of three UME evaluation articles:

*   **MedHub - Evaluations — UME — Forms**: form types, building forms, question types, scales, skip logic, milestones/competencies, low score alert configuration, sharing
    
*   **MedHub - Evaluations — UME — Delivery**: manual delivery, automated delivery, Course List delivery, SIS, self-initiated evaluations, session evaluations, expiration, insufficient contact
    
*   **MedHub - Evaluations — UME — Responses** (this article): the access-control model, access hierarchy, individual vs aggregate access, Review & Release Groups, confidentiality and anonymity, final evaluation workflow, grading, reset to partially complete, low score alerts, View Completed Evaluations, reporting
    

## The UME access-control model

Understanding who controls evaluation access on the UME side is foundational. It is the single most important concept for reasoning about everything else in this article, and it differs fundamentally from the GME side.

On the UME side, the **Dean's Office — represented in MedHub by the Student Administrator role — holds control over how evaluation access, confidentiality, and viewing are configured across all courses.** Whether the institution wants uniform settings across every course or intentionally different settings per course, that decision belongs to the Student Administrator, not the Course Coordinator. Over successive releases, control over access, confidentiality, and release behavior has been deliberately consolidated at the Student Administrator level. Settings may still operate per course, but they are _controlled by_ the Student Administrator.

This is why the **Course Settings → Evaluations tab contains no access or confidentiality controls at all.** A Course Coordinator configures operational settings there (due dates, expiration defaults, self-initiated forms, alert toggles, kiosk links), but cannot set who can view completed evaluations, cannot configure redaction, and cannot determine when students see their results. Those controls live exclusively at the Student Administrator level, across four mechanisms:

*   The root-side **Evaluation Access Map** (configured by MedHub Support at the institution's request)
    
*   **Evaluation Access for Roles** and **Evaluation Access for Users** (when enabled, Student-Admin-managed)
    
*   **Review & Release Groups** (Student-Admin-managed; governs student access to individual responses)
    
*   **School Settings → Evaluations** (Student-Admin-managed; governs aggregate access and institution-wide behavior)
    

> **Why this matters for troubleshooting.** When a Course Coordinator reports they cannot change what a user sees, that is by design — they do not have access control at the course level. The change must be made by the Student Administrator through one of the four mechanisms above. When access behaves "per course" but no one at the course can change it, the Student Administrator configured it that way at the school level.

This control model is the inverse of the GME side, where individual programs have substantial autonomy and Program Administrators/Directors control their own access and confidentiality configuration. Because the two sides are opposite in this respect, it is critical not to apply GME assumptions to UME or vice versa.

## Individual access vs aggregate access — two separate systems

The second foundational concept: **a student's access to individual evaluation responses and their access to aggregate (summary) data are governed by entirely separate mechanisms.** Conflating them is the most common source of access confusion.

**Individual response access** — whether a student can open and read a single completed evaluation about themselves — is governed by:

*   **Review & Release Groups** when the evaluation was delivered at the course level (by a Course Coordinator), and
    
*   **School Settings** when the evaluation was delivered at the school level (by a Student Administrator).
    
*   The form-level **"Allow students to view evaluation"** setting acts as a final gate regardless of the above.
    

**Aggregate access** — whether a student can see a summarized, evaluator-anonymized roll-up of responses about themselves — is governed by the **aggregate checkboxes and dropdowns in School Settings → Evaluations** (e.g., "Student Access to Performance Evaluation Aggregate," "Student Access to Peer Evaluation Aggregate"). Aggregate access is **not** affected by Review & Release Groups, by the ability to view individual evaluations, or by the root-side Evaluation Access Map.

This means the School Settings checkboxes labeled "Student Access to Resident/Faculty Evaluations" and "Student Access to Individual Peer Evaluations" control **aggregate report visibility**, not individual-response access. Individual-response access is handled by Review & Release Groups. A student can have aggregate access without individual access, individual without aggregate, both, or neither — the two are configured independently.

## Evaluation Access Map and Access for Roles/Users

These mechanisms govern what **administrative and faculty roles** (not students) see when viewing completed evaluations.

### Root-side Evaluation Access Map

The Evaluation Access Map is configured on the root side by MedHub Support (at the institution's request) and sets the institutional default for what each user role can see for each evaluation type. The change is retroactive when applied. The five access levels are:

*   **None** — the user sees evaluations listed but cannot open or view contents. A warning message appears when they attempt to open one.
    
*   **Can view; all redacted** — the user can view the evaluation form, but evaluator names and confidential/required comments are redacted.
    
*   **Can view comments; names redacted** — the user can view the form and comments, but evaluator names are redacted.
    
*   **Can view names; comments redacted** — the user can view the form and evaluator names, but confidential/required comments are redacted.
    
*   **Can view all information** — full access to all evaluation information available to the user by design.
    

Some access levels may be grayed out, indicating the role is not permitted that level by design. These settings do **not** override built-in confidentiality or anonymity restrictions, and they do **not** control low score alert email content (governed by separate masking settings — see "Low score alerts").

### Evaluation Access for Roles and Evaluation Access for Users

When the root setting `evaluations_clerkship_access_map` is enabled, the Student Administrator and Course Coordinator can adjust evaluation access from within the Evaluations tab without contacting MedHub Support to alter the root-side map. A button titled **Evaluation Access for Users** appears within the Evaluation Forms section of the Evaluations tab landing page.

*   The **Student Administrator** can change evaluation access per course, per evaluation type, for the Course Director, Site Director, and Course Coordinator roles.
    
*   The **Course Coordinator** can modify access for the Course/Site Director roles only, and cannot grant those roles broader access than the Coordinator has themselves.
    

The access levels are the same five as the root-side map (None through Can view all information). A confirmation modal displays the number of users affected, and a "Last Updated" timestamp is shown.

**Core/Site inheritance:** Settings can differ between a core/parent course and its site-based courses. If a site-level setting has been set, it applies to that site-based course. If not, the site-level inherits the core/parent course's settings — whether default or modified.

These settings do not override built-in MedHub access restrictions, and the defaults derive from the root-side Evaluation Access Map established during implementation.

## Confidentiality and anonymity

Confidentiality and anonymity are distinct mechanisms. Understanding the difference is critical for configuration, troubleshooting, and client communication.

### Confidentiality

Confidentiality is **built into MedHub by evaluation type** and enforces the principle that a superior should never see individual evaluations completed by someone who reports to them. Confidentiality is always on for the applicable types. There is no setting to enable or disable it.

**What confidentiality does:**

*   The **evaluation target** (the person being evaluated) never sees the name of the individual evaluator on a confidential evaluation type. They can only ever see an aggregate view (when School Settings permit), and the aggregate never lists evaluator names.
    
*   The **Student Administrator** and **Course Coordinator** can see the evaluator's name on completed evaluations (subject to the Evaluation Access Map).
    
*   **Course Directors** can see the evaluator's name except on evaluations of themselves; access to faculty and course evaluations is further governed by `setting_director_evals_ume` and `setting_director_course_evals` (see "Who sees what by role").
    
*   The evaluator's identifying information **remains in the database** — it is access-controlled, not stripped.
    

**Evaluation types governed by built-in confidentiality on the UME side:**

*   Student evaluation of faculty
    
*   Student evaluation of resident
    
*   Student evaluation of a service/clinic
    
*   Student evaluation of course
    
*   Student evaluation of other student (peer)
    
*   Student evaluation of school/hospital
    
*   Patient/staff evaluation of a student
    
*   Patient/staff evaluation of faculty/program/hospital
    
*   Faculty evaluation of other faculty (peer)
    

**Evaluation types that are NOT confidential by default:**

*   Faculty evaluation of a student — a superior evaluating a reportee. Students can see individual evaluations completed on them by faculty, including the evaluator's name (unless anonymity is applied at delivery, or access is restricted by Review & Release).
    
*   Resident evaluation of student — same principle.
    

### Anonymity

Anonymity is an **optional, per-delivery setting** that adds a layer on top of confidentiality. It is selected at delivery and **irreversibly strips the evaluator's identity from the database** upon submission.

**How an evaluation is designated anonymous:** the "Anonymous" Special Option at manual delivery, automated rule setup, SIS setup, or self-initiated setup; or institution-wide via `settings_students_course_specialNum` / `settings_students_final_specialNum` set to 2 for Course List deliveries; or via `setting_eval_rof_anonymous_force` for forced-anonymous types.

**What happens on submission of an anonymous evaluation:** the system permanently sets `eh_responses.evaluator_userID` to 0, `evaluator_outsideID` to 0, and `evaluator_other` to "(anonymous)". After this, no one — not the Student Administrator, not the Course Director, not MedHub Support, not the development team — can determine who completed it.

**Consequences of anonymity:**

*   Cannot reset to Partially Complete (the system does not know who to reassign it to).
    
*   Does not appear in the evaluator's Completed Evaluations view.
    
*   Excluded from Evaluation Completion Summary and Evaluation Completion by User reports.
    
*   Cannot be corrected after submission.
    
*   The evaluator's name is visible in View Completed Evaluations and Incomplete Evaluations **until submission** — the strip occurs at the moment of submission.
    
*   Affects reciprocity timing (see "Reciprocity").
    

### Confidential questions

Individual questions within a form can be marked **Confidential**, separate from the form's evaluation type. On a confidential question, the target sees the word "(confidential)" in place of any response. Only the Student Administrator, Course Coordinator, and Course Director can see confidential question responses (the Course Director can see them both individually and in the Course/Clerkship Aggregate view). This is distinct from the Anonymous Special Option, which strips evaluator identity, and from built-in confidentiality, which is type-based.

### Confidentiality vs anonymity comparison

Aspect

Confidential (built-in)

Anonymous (per-delivery)

Controlled by

Evaluation type (automatic)

Special Option at delivery

Can be disabled

No

N/A — opt-in per delivery

Evaluator identity in database

Preserved

Permanently stripped on submission

Student Admin can see evaluator name

Yes

No

Course Director can see evaluator name

Yes (except on evals of themselves)

No

Target can see evaluator name

No (aggregate only)

No (aggregate only)

Can reset to Partially Complete

Yes

No

Appears in evaluator's Completed Evaluations

Yes

No

Included in completion reports

Yes

No

Reversible after submission

N/A (always on)

No — irreversible

## Review & Release Groups

Review & Release Groups are the mechanism that controls **student access to individual evaluation responses** for course-delivered evaluations. They add a course-level layer of access restriction on top of School Settings. They are managed entirely by the Student Administrator.

**Where it lives:** Student Admin → Security → Review & Release Groups (`/u/c/security/evaluation/review-release/groups`).

### Enabling the feature

Review & Release is gated by the root setting `feature_toggle` (the `review-and-release` key). MedHub Support enables it at the institution's request, but should confirm the institution has configured its groups first — if the toggle is flipped with only the Default Group at system defaults, all courses inherit the Default Group settings, which may grant or remove student access unexpectedly. Once enabled, the Student Administrator can edit group membership and settings at any time; there is no lock-in.

### The group list page

The Review & Release Groups page lists each group with:

*   **Group Name**
    
*   **Number of Members** — this is the number of **courses** assigned to the group (not users).
    
*   **Actions** — **Edit Members** (assign courses to the group), **Edit Settings** (configure the access behavior), and **Delete**.
    

A **Default Group** always exists. Any course not explicitly assigned to another group uses the Default Group's settings. A **Create New Group** button adds additional groups.

### Assigning courses to a group (Edit Members)

The Edit Members page (Modify Review & Release Group) provides a two-pane mover: **Search and Add Courses** on the left (all courses, each labeled with its current group) and **Courses to move to Group** on the right. Courses are moved with **Add Selected** / **Remove Selected** / **Remove All**, then saved with **Save Group**. The page restates: "Courses not assigned to a group will utilize the Default Group settings."

### Configuring access behavior (Edit Settings)

The Modify Release Settings page is organized by evaluation **category**, each with its own **Access/Hide** dropdown:

**Student Access to Resident Evaluations**, **Student Access to Faculty Evaluations**, and **Student Access to Peer Evaluations** each offer these six options:

*   **Always hide from students**
    
*   **Immediate access** (to resident / faculty / peer evaluations)
    
*   **Hide until reciprocal evaluation is submitted**
    
*   **Hide until grade is posted by course director**
    
*   **Hide until reciprocal evaluation is submitted and grade is posted**
    
*   **Hide until released by course director**
    

For the Resident and Faculty categories, a **Reciprocal Time Window** field (in days) appears beneath the dropdown. This value is used when the selected option involves reciprocity (see "Reciprocity"). The Peer category's dropdown does not display a Reciprocal Time Window field in the same way.

**Student Access to Final Evaluations** has a **different, three-option set**:

*   **Immediate access to final evaluation**
    
*   **Hide until student completes all outstanding evaluations**
    
*   **Hide until released by course director**
    

Settings are saved with **Update Settings**.

### The flow of access (how R&R and School Settings combine)

When a student attempts to view an evaluation about themselves, the system resolves access in this order:

1.  **Where was the evaluation delivered from?**
    
    *   **Course-delivered** (by a Course Coordinator): Review & Release settings for that course's group apply **first**. If R&R restricts access, the student has no access to the individual response — and aggregate access is then determined separately by School Settings. If R&R allows access, proceed to step 2.
        
    *   **School-delivered** (by a Student Administrator): Review & Release is **bypassed** entirely, because the evaluation isn't tied to a course's R&R group. Individual access is based on School Settings only. **Exception:** Final evaluations always respect R&R settings regardless of delivery level (Final evaluations have their own R&R category for exactly this reason).
        
2.  **School Settings** then determine what the student sees (individual, aggregate, or both) per the configured access checkboxes and aggregate settings.
    
3.  **The form-level "Allow students to view evaluation" setting** is a final gate. If disabled on the form, the student cannot view it regardless of R&R or School Settings.
    

> **Worked example.** A course delivers a Faculty-of-Student evaluation. The course's R&R group sets Faculty Evaluations to "Immediate access." School Settings have "Student Access to Performance Evaluation Aggregate" enabled but "Student Access to Resident/Faculty Evaluations" (the individual-aggregate checkbox) unchecked. Result: R&R permits access, then School Settings govern — the student sees the aggregate (3+ threshold met) but not... actually, here the relevant individual control is R&R, which permitted it, so the student sees the individual response, and the aggregate per the aggregate settings. Conversely, if the same R&R group set Faculty Evaluations to "Always hide from students," the student would see neither the individual response nor (because R&R blocked it at the course level) any course-delivered contribution — only school-delivered data would surface, governed by School Settings.

## School Settings — student, faculty, and resident access

**Where it lives:** Student Admin → School Settings → Evaluations tab. This page holds the institution-wide evaluation behavior. The settings most relevant to response access:

### Aggregate access settings and the camouflage structure

Several aggregate-access settings share a common three-control structure: a **threshold** dropdown ("Hide until X completed evaluations (per form)"), a **release-mode** dropdown ("Release Individually" or "Release in blocks of X"), a **delay** dropdown ("Delay Release X days"), and an **"Apply reciprocity settings to this view"** checkbox. These controls exist to **camouflage which specific evaluator said what**, so that a target viewing aggregate results cannot deduce an individual evaluator and retaliate (e.g., a student giving a poor reciprocal evaluation to a faculty member they believe scored them low).

The settings with the **full** three-control structure plus reciprocity checkbox:

*   **Student Access to Peer Evaluation Aggregate**
    
*   **Faculty Access to Aggregate View**
    
*   **Resident Access to Aggregate View**
    

The settings with **only the threshold** dropdown (no release-mode, no delay):

*   **Student Access to Performance Evaluation Aggregate**
    
*   **Student Access to Patient/Staff Evaluation Aggregate**
    

The reason these two have only a threshold: the robust blocks/delay camouflage exists to prevent reciprocal retaliation, and in these two cases there is no reciprocal-retaliation risk. A student never evaluates the patient/staff member, and patient/staff evaluations are largely anonymous anyway; performance evaluations of the student likewise don't create a reciprocal the student controls. The "hide until X completed" threshold provides sufficient camouflage on its own.

### Student access to performance evaluation aggregate

When **Student Access to Performance Evaluation Aggregate** is enabled, a student can view the aggregate of evaluations completed about them once **3 or more** evaluations of that particular form have been completed. Until that threshold is met, the aggregate link is grayed out. This 3-evaluation threshold is the standard behavior; the aggregate covers both Faculty-of-Student and Resident-of-Student evaluation data.

### Student access to peer evaluations (individual and aggregate)

Individual and aggregate peer access are controlled separately:

*   **"Student Access to Individual Peer Evaluations"** (checkbox) — governs whether the student can see individual peer evaluations (subject to confidentiality, which always masks the peer evaluator's name) and is surfaced through the aggregate/individual viewing path. To grant individual peer visibility, this must be enabled.
    
*   **"Student Access to Peer Evaluation Aggregate"** (checkbox + threshold/blocks/delay/reciprocity) — governs the peer aggregate column in the student's Aggregate Evaluations view, independent of individual access.
    

To grant aggregate-only peer access: enable "Student Access to Peer Evaluation Aggregate" and leave "Student Access to Individual Peer Evaluations" disabled. To grant both: enable both. Peer aggregate access is not affected by Review & Release settings, individual peer access, or the root-side Evaluation Access Map.

### Student access to patient/staff aggregate

**"Student Access to Patient/Staff Evaluation Aggregate"** controls the patient/staff aggregate column in the student's view, with a threshold dropdown only. (The student's Aggregate Evaluations view shows separate columns for Patient/Staff and Peer aggregate data.)

### Other School Settings on this tab relevant to responses

*   **Send Coordinator Evaluation Alerts** — institution-level toggle for coordinator low score alerts (interacts with the Course Setting; see "Low score alerts").
    
*   **Email Student on Performance Evaluation** — sends the student an email when a performance evaluation about them becomes available. Does not send for anonymous evaluations, and does not send when access is set to "Hide until reciprocal" or "Hide until released."
    
*   **Show Competency Averages/Trends** — surfaces two additional tabs in the student's evaluation data view (competency averages and trend charts), populated from competency-tagged, non-milestone-scale questions on both Faculty-of-Student and Resident-of-Student evaluations.
    
*   **Student Access to Resident/Faculty Evaluations** and **Student Access to Individual Peer Evaluations** — as established above, these govern aggregate report visibility for those types, not individual-response access.
    
*   **Email Coordinator on "Insufficient Contact"** — operates on a hierarchy: must be enabled at both School Settings and the Course level to send (see Delivery article).
    
*   **Kiosk/Public Evaluation Link** settings — enable patient/public evaluation entry points and select the forms used.
    

## Reciprocity

Reciprocity governs how long the system waits for a reciprocal evaluation to be completed before releasing an evaluation to the target's view. It applies when an access setting includes a reciprocal condition ("Hide until reciprocal evaluation is submitted," "Hide until reciprocal evaluation is submitted and grade is posted," or an aggregate setting with "Apply reciprocity settings to this view").

**Which window value applies:**

*   **Course-delivered evaluations:** the system uses the **Reciprocal Time Window** field on the delivering course's Review & Release group, for the relevant evaluation category (Faculty-of-Student selection governs the faculty's aggregate view; Resident-of-Student selection governs the resident's aggregate view).
    
*   **School-delivered evaluations:** the system uses the root setting `ume_eval_reciprocity_window` (default 14 days).
    
*   If the delivering course's R&R setting for the relevant type does **not** use reciprocity (e.g., it's set to Always hide, Immediate, Hide until grade posted, or Hide until released), no reciprocity logic is applied to evaluations from that course.
    

**How reciprocity resolves:**

*   Any inverse-type evaluation delivered within the reciprocity window is recognized as _the_ reciprocal of the original (it does not have to be set up via the Reciprocal Evaluation dropdown at delivery — that dropdown is just a convenience; see Delivery article).
    
*   If the reciprocal is completed within the window and the original is **not anonymous**, the target gains access as soon as they complete their reciprocal.
    
*   If the original evaluation was **anonymous**, the system can't recognize the reciprocal as such (identity is stripped), so the target must wait the full reciprocity window before the evaluation releases.
    
*   If **multiple** inverse-type evaluations were delivered within the window, the target must complete **all** of them before the original releases.
    
*   If the reciprocal is **never** completed, the original is held indefinitely.
    
*   "Insufficient contact" removal of a reciprocal: if removed within the window, the system still waits to the window's end (in case another reciprocal is delivered); after the window, the original releases as though no reciprocal was sent.
    
*   When "Apply reciprocity settings to this view" is combined with "Release in blocks of X" and/or "Delay Release X days," **all** conditions must be met before data appears in the aggregate.
    

## Who sees what by role

### Student Administrator

Full access to all evaluations across all courses (subject to the Evaluation Access Map). Can see evaluator names on all types, deliver, delete, reset, and configure all access mechanisms.

### Course Coordinator

Full access to evaluations within their assigned course(s) by default, subject to the Evaluation Access Map and any Evaluation Access for Roles/Users restrictions set by the Student Administrator. Can delete incomplete evaluations (course evaluations set in the Course List route to "Identify Incomplete Evaluations" as a safety net rather than being permanently deleted). Can reset evaluations to partially complete only if granted **both** Evaluations - Viewing **and** Settings/Lists access in the course. Holds no access-configuration control.

### Course Director

Access is governed by two root settings plus the standard viewing path:

**Faculty evaluations —** `setting_director_evals_ume`**:**

*   0 = aggregate evaluations only
    
*   1 = both aggregate and individual evaluations
    
*   2 = individual evaluations, with the evaluator shown as anonymous
    

**Course evaluations —** `setting_director_course_evals`**:**

*   0 = no access
    
*   1 = all access (aggregate and individual)
    
*   2 = aggregate access only
    

Course Directors access evaluations through the **Student Evaluations** and **View Faculty/Course Evaluations** links in the Course Director Access area of their homepage. They can see responses to questions marked Confidential (individually and in the Course/Clerkship Aggregate). They **cannot** see Student evaluations of services/clinics (no design path to them; the Course Coordinator can provide this if needed). Required low score comments are **not** displayed in the Course Director aggregate view (by design).

### Associate Course Director

Governed by `setting_clerkship_codirectors` plus the granular Access for Roles/Users mechanism:

*   `setting_clerkship_codirectors` **= 0 (default):** Associate Course Directors do not have the Student Evaluations link or Course-Director-equivalent functions, and are not selectable as a low score alert recipient.
    
*   `setting_clerkship_codirectors` **= 1:** they gain the Student Evaluations link, can view completed final evaluations the Director has completed, can release evaluations, and become selectable as "Course Associate Director" for low score alerts.
    

When enabled: Associate Course Directors **can release** evaluations, and there is no way to grant view access without also granting release access (AMBS-9267). They do **not** receive the "Unreleased Evaluations" Urgent Task (only the primary Director does), and they **cannot** complete final evaluations on behalf of the primary Director.

**Additional aggregate links:** with `setting_clerkship_codirectors` = 0 and `setting_director_course_evals` = 1, the Student Admin can grant Associate Course Directors three homepage links — View Faculty Aggregate Evaluations, View Course Evaluations, View Course Aggregate Evaluations.

> **Associate Course Director aggregate threshold.** When an Associate Course Director uses "View Faculty Aggregate Evaluations," the "Faculty Access to Aggregate View" threshold (hide until X completed per form) does **not** apply to their view of other faculty. That threshold only governs a faculty member's view of their _own_ performance.

To restrict what an Associate Course Director (or any Course/Site Director) sees per course and per evaluation type, the Student Administrator uses **Evaluation Access for Roles**; for individual exceptions, **Evaluation Access for Users**. These are the canonical tailoring mechanisms — not the root setting alone.

### Advisor

Faculty Advisors can view evaluations of their student advisees, including evaluator names (subject to confidentiality), and can view Program Notes. Advisors can receive low score alerts when selected as a Delivering Recipient.

### Student

Student access resolves through the layered system described in "Individual access vs aggregate access," "Review & Release Groups," and "School Settings" above. In summary: individual responses via R&R (course-delivered) or School Settings (school-delivered), gated by the form-level "Allow students to view evaluation"; aggregate via the School Settings aggregate controls (performance aggregate at the fixed 3-evaluation threshold; peer and patient/staff aggregates per their own settings; competency averages/trends when enabled).

## Final evaluation workflow

### Pre-populated evaluations (contributor mapping)

The Final evaluation can be pre-populated with data from earlier "contributor" evaluations completed during the rotation — the primary mechanism for rolling formative assessments into a summative one.

**Configuration:**

1.  The Final form and contributor form(s) must exist and be active.
    
2.  The contributor form **must be shared with the course** (requirement since March 2020).
    
3.  Navigate to **Evaluations → Final Evaluation Question Mapping** (Student Admin) or **Evaluation Question Mapping** (Course Coordinator).
    
4.  Select the Final form, click **Add/Modify Contributor Forms**, check the contributor forms.
    
5.  Click **Update Map** for each question to map contributor questions to Final questions.
    

**Mapping rules:**

*   Source and target questions must use compatible answer types (matching scale values).
    
*   Multiple contributor questions can map to a single composite question; the composite then displays the **percentage of times each answer option was selected**, not the individual question wording or responses.
    
*   Mapping does not carry over when a form is copied — re-configure it.
    
*   If mapping is configured after contributors have completed their evaluations but while the Final is still incomplete, the contributor responses flow into the incomplete Final.
    
*   If the **same form** is used for both contributor and Final, mapping is automatic — no configuration needed.
    

**Contributor window:** `setting_evaluations_final_contributor_days_previous` (default 60) and `setting_evaluations_final_contributor_days_after` (default 40) define how many days before/after the Final's issue date a completed contributor evaluation is included. If responses aren't flowing, verify the contributors completed within this window (and check the School Settings Evaluations Due window, which can also affect inclusion).

### Course Director review and submission

The Course Director opens the Final, reviews pre-populated contributor data, adds their own responses and grade, and submits. The Student/Course Admin can submit on the Director's behalf when `final_eval_admin_submit` = 1.

### Release to student

Student visibility of the completed Final is governed by three layers:

1.  `setting_students_evals_final_view` (root):
    
    *   0 = students can never view finals; the Course Setting shows "(disabled by school)"
        
    *   1 = students view finals per the Course Setting and/or Review & Release (default)
        
    *   2 = students always see finals as soon as the Director submits; the Course Setting shows "(forced by school)"
        
2.  **Course Setting → Student Access to Final Evaluation** (when the root setting = 1): Allow immediate access / Hide until student completes all outstanding evaluations / Hide until released by director. "Hide until student completes all outstanding evaluations" hides the Final if the student has any incomplete evaluation delivered by, or tagged to, that course (including an incomplete "of course" evaluation).
    
3.  **Review & Release Groups** — Final evaluations respect the group's "Student Access to Final Evaluations" setting regardless of delivery level.
    

When "Hide until released by director" applies, the Director sees an **Unreleased Evaluations** Urgent Task and releases from the Student Evaluations link. (A task script can release evaluations older than the reciprocity window if the queue accumulates stale items.) Associate Course Directors can release when `setting_clerkship_codirectors` = 1 but do not see the Urgent Task. A Course Coordinator can release on the Director's behalf when `allow_coordinator_eval_release` = 1.

> **Grades release only when all finals for the course period are complete.** The system does not release final grades until **all** final evaluations for the course period are complete — even finals for other students. If any final in the course period is outstanding, no grades release for any student in that period.

### Grading on final evaluations

*   `director_can_change_grade` (default 0) — when enabled, the Course Director can change the grade on a Final after it is reset to partially complete. Applies to the Director's own editing, not the "Fill Out Evaluation for a Faculty Member" admin tool.
    
*   `admin_can_change_grade` (default 1) — Student Admin can edit grades via the demographics UI (Student → Enrollment/Grades).
    
*   `grade_release_workflow_enabled` — adds a Gradebook-based release workflow. The Student Admin selects students to release final grades from the Gradebook; the Gradebook grade becomes canonical and propagates to the final evaluation and the student's demographics. If the Director later updates the final evaluation grade, the Admin is notified and must approve and re-release. Grade-page checkboxes can't be checked until finals are submitted. When this workflow is off, the final grade is available to the student upon Director submission.
    
*   **The numeric grade field** is entered manually (by coordinator or director, often a numeric conversion of a letter grade) — MedHub does not calculate it.
    

## Reset to Partially Complete

Reverts a completed evaluation to incomplete so the evaluator can edit and resubmit.

**Where it lives:** View Completed Evaluations → open the evaluation → upper-left link "Reset evaluation to 'Partially Completed.'"

**Access:** For Course Coordinators, both **Evaluations - Viewing** and **Settings/Lists** access in the course are required for the reset (and delete) links to appear. For Final evaluations specifically, `course_admin_resets_final_evaluation` (default 1) determines whether a Course Admin can reset a Final.

**Behavior:**

*   The evaluator receives an email and the evaluation returns to their Urgent Tasks as incomplete, with previous answers pre-populated (reset does not clear answers).
    
*   The Completion Date is cleared; a new completion date is recorded on resubmission. If the original was submitted on time but resubmitted after the due window, it is counted late.
    
*   If `director_can_change_grade` is enabled, the Director can change the grade on resubmission.
    

**Restrictions:** Anonymous evaluations cannot be reset (no known evaluator to reassign to). Outside-Evaluator-completed evaluations cannot be reset. There is no audit trail of who reset an evaluation or when. Reset/delete links are only available within 180 days of delivery by default.

> **Resetting after expiration.** Resetting a completed evaluation to partially complete after its expiration date has passed is safe only if it is edited and returned to completed the same business day. If left partially complete when the overnight script runs, the expiration takes effect and the evaluation is removed with no way to reopen it.

## Low score alerts

### What triggers an alert

A low score alert is triggered when an evaluator submits a response that meets or falls below a threshold configured in the question-level alert settings (see Forms article for configuration). When triggered, the system sends an **email notification** and creates an **Urgent Task** on the recipient's homepage.

### Recipient types

Delivering Recipients available for UME forms: Course Coordinator, Course Director, Course Associate Director (when `setting_clerkship_codirectors` is enabled), Advisor, and Notification Group. If no recipients are selected on a question, the low score is still recorded (and appears on the Evaluations Low Score Report) but no email or Urgent Task is generated.

### Alert routing

*   **Course-delivered, alert on a faculty member:** routes to the delivering course's recipients.
    
*   **Student Admin-delivered:** the system checks whether the evaluation is associated with a course (the course selected in the Home dropdown at delivery). If associated, routes to that course's recipients; if the "Faculty Default Program" option is also set, routes to both the course and the faculty's default program. If no course is associated, course-level recipient selections are ignored.
    
*   **Best practice:** when delivering from the Student Admin role, select the course from the Home dropdown so alerts route to the Course Director and Course Coordinator correctly.
    
*   **Type-specific routing examples:** an alert on a "Student evaluation of faculty" form goes to the student's Course Coordinator and the faculty member's default program administrator. An alert on a "Student evaluation of resident" form targets the resident — the residency program administrator sees it (via View Completed Evaluations and, if enabled, email); the Course Coordinator does **not** receive a notice that their student gave a resident a low score.
    

### Course Director alert preferences

For a Course Director to receive low score alert **emails**, they must set their faculty profile → User Preferences → **Director Low Score Alerts** to "Send Email Alerts." Without this, the alert appears only as an Urgent Task. The "Low Score Evaluations" subtab appears in their Student Evaluations view when (1) the correct course is selected in the dropdown, (2) the Director (or Associate Director) is a selected alert recipient on a form originating from or shared with the course, and (3) at least one response has triggered an alert on that form.

### Notification Groups

Low Score Notification Groups route alerts to a custom set of users independent of the course hierarchy. Enabled via root setting; managed under **List Management → Low Score Notification Groups**. Once a group exists, it appears as a Delivering Recipient option. For most group members, the Urgent Task link is the only way to access the low score evaluation — unless the member is also the Course Director or Associate Course Director for the relevant course.

### Dean's Office / school-level alerts

`settings_students_lowscore_admin` identifies a userID (must be user type 12 / Student Admin) to receive all student-evaluation low score alerts at the school level. `setting_ume_alert_recipient_evaltypeA` controls which evaluation types trigger these school-level alerts (all-or-nothing; applies to both course- and Dean's-Office-delivered evaluations).

### Evaluator name masking in alert emails

*   `show_lowscore_evaluator` — 0 = never show the evaluator name in UME low score alert emails (displays "(anonymous)"); 1 = defer to `show_evaluator_name`.
    
*   `show_evaluator_name` — per-evaluation-type array; when `show_lowscore_evaluator` = 1, each type's value (0 or 1) controls masking. Commonly masked types include Student-of-Faculty (16), Student-of-Resident (17), Student-of-Service/Clinic (19), Student-of-Course (20), Student-of-Student peer (23), Student-of-School/Hospital (26).
    

These settings control **only the email**. The Evaluation Access Map controls in-app display — independent systems. The email is sometimes the only way to identify the evaluator of an otherwise-confidential low score, which is why the access map deliberately does not govern it.

*   `ume_disable_gme_eval_notifications` — when populated with type IDs, disables sending low score alert notifications from UME to GME default recipients for those types.
    

### Evaluations Low Score Report

**Reports → Evaluations Low Score Alerts.** Displays all responses that triggered a low score flag, regardless of whether recipients were configured. Note: a low score alert email can be generated to an administrator (because the target is their trainee) for an evaluation that does **not** appear on their program's Low Score Report (because it wasn't delivered by their program) — the administrator can still view it via View Completed Evaluations filtered by Alert status.

### Outside Evaluator low score alerts

When a low score alert targets an Outside Evaluator, the Outside Evaluator's name does not appear in the alert email (Outside Evaluators have an outsideID, not a userID). When a recipient (e.g., a Director) views a low score alert about an Outside Evaluator via the Urgent Task, they lose access to that evaluation after the initial view, with no way to return to it via the standard links.

## Incomplete Evaluations view

Student Administrators and Course Coordinators have access to all incomplete or partially complete evaluations via the Incomplete Evaluations view.  
  
**Filters:** Evaluator, Evaluatee, Service/Clinic, Status  
**Columns:** Recipient (Evaluator), Evaluation, Info, Course, Type, Service, Rotation, Status, Issued, Expiration (if enabled)  
  
If the evaluator is an Outside Evaluator, the Evaluation column will include **Resend Link / Send Email**. Resend Link automatically resends the link to the outside evaluator with standard email language.  
Send Email opens up a link in the user’s email client with the standard language and link for the user to edit/customize before sending.  
  
Users may also select the checkmark next to the row to complete the following batch options:  
  
Remove Selected  
Resend Link (Outside evaluators only) - this would match the Resend Link option in the individual rows, but will send in batch. It will list all links in a single email for a given outside evaluator.  
Modify Expiration Days (if enabled)  
  
Clicking the column in the Info column opens a Response Information modal. The information included is dynamic based on the delivery method and information available.

*   "Delivered by: \[Last Name\], \[First Name\] (\[User type\])" — for Manual or Self-Initiated deliveries
    
*   "Automated Evaluation: \[Rule Title\]" — for Automated deliveries
    
*   "SIS Service: Service - \[Service Name\]" or "RIS Service: Service - \[Service Name\]" — for Identify Supervisors deliveries
    
*   "Conference Evaluation:" — for Conference deliveries (no name shown)
    
*   "Session Evaluation:" — for Session deliveries (no name shown)
    
*   "Final Evaluation:" — for Final/Clerkship deliveries (no name shown)
    

## View Completed Evaluations

**Where it lives:** Evaluations → View Completed Evaluations. The page offers a Simple Search and a Detailed Search.

**Simple Search:**

*   **Delivery Period** dropdown (e.g., Past 6 Months)
    
*   **Evaluations of:** checkboxes — Students, Faculty, Residents, Services, Course/School/Hospital, Conferences, Procedures
    
*   **Submit**
    

**Detailed Search filters:**

*   **Delivered** — Any/range dropdown plus From/To dates
    
*   **Submitted** — Any/range dropdown plus From/To dates
    
*   **Print Status** — Any / printed / not printed
    
*   **Type(s)** — multi-select of evaluation types
    
*   **Form(s)** — multi-select of forms
    
*   **Evaluator(s)** — multi-select of users (with a SHOW ALL link)
    
*   **Evaluations of** (targets) — multi-select of users (with a SHOW ALL link)
    
*   **Service(s)** — multi-select
    
*   **Rotation(s)** — multi-select (UME-MS schedule)
    
*   **Course(s)** — multi-select
    
*   **Campus(es)** — multi-select
    
*   **Site(s)** — multi-select
    
*   **Alert Status** — Any / Flagged / not flagged
    
*   **Evaluation Status** — checkboxes: Completed, Incomplete, Expired
    
*   **Display final evaluations only** — checkbox
    
*   **Submit**
    

> **Information button gap.** The information (i) button — which shows delivery metadata such as how the evaluation was issued — is available only under Incomplete Evaluations on the UME side, not under View Completed Evaluations.

### Printing evaluations and comment masking

When a Course Coordinator or Student Admin prints an individual completed evaluation via the printer icon, comment-based questions may be masked per `settings_students_evals_print_mask` (0 = comments not masked; 1 = masked, the default). To print with comments visible, use the Detailed Search results → check the evaluation → "Print Selected" from the action menu, which respects the "Mask Comments" checkbox rather than the root setting.

### Program Notes

**+Add Program Notes** on a completed evaluation lets administrators add notes (1,000-character limit). Visible to the Student Administrator, Course Coordinator, Course Director, and Advisor; **not** visible to the student target. Exportable via the API or the Aggregate Evaluation Report's "Complete Log" display option.

## Permanently deleting completed evaluations

To permanently delete a completed evaluation on the UME side:

1.  The GME Office Institution Setting **"Allow Administrators to Delete Evaluation"** must be enabled. Without it, only a root-side Super Admin can delete completed evaluations.
    
2.  The Course Coordinator must have both **Evaluations - Viewing** and **Settings/Lists** access in the course.
    

The "Permanently remove this evaluation" link appears on completed evaluations within 180 days of delivery by default. Deletion is irreversible — there is no application-level recovery, and the Identify Undelivered Final Evaluations tool can only regenerate a missed/deleted final within one year.

## Reporting

This article covers only the response-access-relevant reporting behaviors; see the Reports articles for full report documentation.

*   **Evaluation Completion Summary / Evaluation Completion by User:** anonymous evaluations are excluded (the system can't attribute them). The Completion by User report treats evaluator-deleted ("insufficient contact") evaluations as if delivered by the current course, which can inflate a user's delivered/deleted counts even when limiting to the current program.
    
*   **Aggregate Evaluation Report:** available to Student Admins and Course Coordinators; Course Directors see faculty aggregate (`setting_director_evals_ume`) and course aggregate (`setting_director_course_evals`). Required comments can be displayed via the report's "Display required comments" option (but not in the Course Director's aggregate view).
    
*   **Resident access to student-evaluation aggregate:** governed by two settings together. The GME-side Program Setting "Resident Access to Student Evaluations" must be enabled for the resident to see a Student Evaluations subheader in their Aggregate tab; if only this is enabled, its threshold applies. The UME School Setting "Resident Access to Aggregate View" can also be enabled, in which case its threshold (hide until X / release in blocks of X) overrides the Program Setting. If the School Setting is enabled but the Program Setting is not, the resident has no access.
    

## Settings appendix

Setting

Scope

Default

Effect

`evaluations_clerkship_access_map`

School

0

Enables Evaluation Access for Roles/Users for Student Admins and Course Coordinators.

`setting_clerkship_codirectors`

School

0

Gives Associate Course Directors Course-Director-equivalent access, including evaluation release.

`setting_director_evals_ume`

School

1

Course Director access to faculty evaluations. 0 = aggregate only, 1 = aggregate + individual, 2 = individual shown anonymous.

`setting_director_course_evals`

School

1

Course Director access to course evaluations. 0 = no access, 1 = all, 2 = aggregate only.

`setting_students_evals_final_view`

School

1

Student access to finals. 0 = disabled, 1 = per course setting / R&R, 2 = forced immediate.

`course_admin_resets_final_evaluation`

School

1

Whether Course Admins can reset Final evaluations.

`director_can_change_grade`

School

0

Whether Course Directors can change grades on reset Finals.

`admin_can_change_grade`

School

1

Whether Student Admins can edit grades via demographics UI.

`grade_release_workflow_enabled`

School

0

Enables Gradebook-based grade release workflow.

`final_eval_admin_submit`

School

1

Whether Student/Course Admins can submit Finals on the Director's behalf.

`allow_coordinator_eval_release`

School

0

Whether Course Coordinators can release evaluations on the Director's behalf.

`feature_toggle` (review-and-release)

Site-wide

0

Enables Review & Release Groups.

`ume_eval_reciprocity_window`

School

14

Reciprocity window (days) for school-delivered evaluations.

`show_lowscore_evaluator`

School

1

0 = mask evaluator in UME low score emails; 1 = defer to `show_evaluator_name`.

`show_evaluator_name`

Site-wide

per-type = 1

Per-type masking array for low score alert emails.

`settings_students_lowscore_admin`

School

0

UserID (type 12) receiving all school-level student-eval low score alerts. 0 = off.

`setting_ume_alert_recipient_evaltypeA`

School

empty

Evaluation types that trigger school-level alerts to the `settings_students_lowscore_admin` user.

`ume_disable_gme_eval_notifications`

School

empty

Disables UME→GME low score alert notifications for specified types.

`settings_students_evals_print_mask`

School

1

Whether printed evaluations mask comment-based questions for UME coordinators.

`setting_evaluations_final_contributor_days_previous`

School

60

Days before Final issue date to include contributor evaluations.

`setting_evaluations_final_contributor_days_after`

School

40

Days after Final issue date to include contributor evaluations.

`settings_students_final_evaluationID`

School

0

Default form used for final course grades.

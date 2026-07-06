# MedHub - Gradebook (UME) - markdown

# MedHub - Gradebook (UME)

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The **Gradebook** is the UME-only feature for tracking and releasing course grades to medical students. It supports per-course, per-period grade entry by Course Coordinators or Course Directors, organizes grades into weighted **components** plus a **final grade**, and provides a controlled release workflow so Student Admins can stage when grades become visible to students.

Gradebook integrates tightly with two other UME surfaces:

*   **Final Evaluations** — the final grade entered in the Gradebook flows to the final evaluation form, and vice versa (with directionality rules — see "Component-to-final flow" below).
    
*   **Student Demographics → Enrollment/Grades tab** — released grades populate the student's grade history.
    

This document covers: enabling Gradebook for a course, the grade scale and component setup, the My Grades student view, the release workflow (with `grade_release_workflow_enabled`), the academic-year and course-period rules that determine when courses appear in the dropdown, and the support patterns around grade scale changes and orphaned grades.

It does not cover: Course List management itself (see **MedHub - Course List — UME**); Course Enrollment data (see **MedHub - Course Enrollments**); the underlying Final Evaluation form (see **MedHub - Evaluations — UME**).

## Where it lives

For Course Coordinators (CC) and Student Administrators:

> **Home → Gradebook**

The Gradebook page lists courses the user has access to and that are eligible for the current academic year (see "Academic year and course period rules" below). Selecting a course opens the grade entry view for the active course period.

For students:

> **Home → My Grades** (only appears if the student is currently enrolled in a course with Gradebook enabled)

For Course Directors:

> **Faculty Home → \[course's Gradebook link\]** (when Course Director access has been granted on the course's Gradebook configuration)

## Enabling Gradebook on a course

> **Student Admin → Course List → \[course\] → Course Settings → Grading**

The Grading subtab is where Gradebook is enabled and configured per course. Steps:

1.  **Select the academic year dropdown** (top of the page) — Grading config is per academic year.
    
2.  **Enable Gradebook** for the course.
    
3.  **Select the grade scale** (e.g., Pass/Fail, Honors/High Pass/Pass/Fail, numeric).
    
4.  **Define components and percentages** — e.g., Mid-rotation Eval 30%, Final Eval 30%, OSCE 20%, Quiz 20%.
    
5.  **Configure access** — which Course Director(s) can edit; whether Course Coordinators can enter; whether students see My Grades.
    

After saving, the Gradebook becomes available to selected users from the Home page.

### Adding new grading components

Components on a course are limited to ones that exist in the institution's **UME Grade Components catalog** (root-side, Utilities → UME Grade Components link). If a course needs a component name that doesn't exist (e.g., "RACS"), MedHub Support has to add it to the catalog first. Then the Course Coordinator can select the new component on Course Settings → Grading. (Ticket 175945, ES 6/4/2021.)

### Component grade types

> **Grade types for components are hard-coded.** Components can use either **numeric percentage** OR **pass/fail** — you cannot apply a custom grade scale (like an honors/pass scale) to a component. Custom grade scales work only for **assignments** within the gradebook, and for the final grade. Components are limited to the two hard-coded types. (Ticket 237154, AMBS-9555.)

## Grade scale considerations

The grade scale selected on a course controls the labels shown on final evaluations and on student grade displays. Once data has been entered against a grade scale, **changing the scale is destructive**:

> **Changing the grade scale on a course in the Course List, after grades have already been entered for past course periods, severs the link between the past grades and the displayed labels.** Past final grades start displaying option **values** instead of option **names**. For example, with a Pass/Fail scale, an "Incomplete" grade would start displaying as "INCMP" and a "Late Withdraw" would display as "LW" — the underlying scale codes rather than the user-facing names. The same effect appears on student Enrollment/Grades tabs and on past final evaluation forms.
> 
> **There is no way to prevent this if the scale is changed.** The only clean way to transition from one grade scale to another is to phase out the old course and replace it with a new course in the Course List, leaving past grades intact under the original course. (Ticket 232367, ML 1/26/2024.)

> **Changing the grade scale also greys out previously-entered final grades in the Gradebook itself.** This is a known design limitation — the Gradebook was not built to accommodate scale changes mid-history. (Ticket 159968, AV 3/15/21.) Note that final grades remain visible on the student's Enrollment/Grades tab even when greyed out in the Gradebook.

When a client asks about changing a grade scale, recommend the phased-replacement approach over the in-place change: complete current grades, deactivate the old course, create a replacement course in the Course List with the new scale, transition new course periods to the new course.

## Academic year and course period rules

The Gradebook dropdown that lists available courses is governed by **course period date midpoint vs. academic year**. The rules:

*   **A course period is tied to the academic year that contains the period's midpoint.**
    
*   The Gradebook dropdown shows course periods tied to the **current academic year** and the **previous academic year**.
    
*   If a course period spans two academic years (starts in June, ends in August), it's tied to whichever AY contains the midpoint.
    

Common consequence:

> **A course period that started before 7/1 but has its midpoint after 7/1 will not show in the Gradebook dropdown until 7/1**, even if the course is currently in progress in late June. This is by design. (Ticket 167823, AMBS-7440, ES 11/19/2021.)

A second consequence:

> **Course periods that are in the next academic year don't show until that AY starts.** A 5/8 - 6/4/2022 course period assigned to the next academic year (because of how terms were configured) will not appear in the current AY's Gradebook. (Ticket 198882, AMBS-7440, ML 6/15/2022.) If a course period is assigned to the wrong academic year, fix the term assignment first; the period then appears.

### Open Enrollment requirement

> **Course periods only appear in the Gradebook if Open Enrollment is set on the period.** A period that has been Closed for enrollment will not display in the Gradebook even when it's the current AY. To restore: Student Admin → Course List → course → Course Dates tab → click "Re-Open Enrollment" for the affected periods. (Ticket 215774, AMBS-9511, ML 5/8/2023.)

### Provisional grades

When a Course Coordinator enters a grade for a course period that is **not yet complete**, the grade is treated as **provisional** — it shows in the Grade Change Audit on the student's Enrollment/Grades tab, but it does NOT display next to the course on the student's profile until the course is complete. (Ticket 161065, AV 11/24/20.)

This trips up Coordinators who expect to see the grade reflected immediately. Reassure them that provisional state is normal and the grade will display once the course completes.

## Component-to-final flow

The Gradebook's components feed the **final evaluation grade** with directionality:

*   **Initial direction**: components flow into the final evaluation grade. When a Course Director opens the final evaluation form, the component grades are pre-populated.
    
*   **One-time door**: once the Course Director **saves or submits** the final evaluation with a value in the FINAL field, the components stop flowing automatically. From that point forward, updating component grades in the Gradebook does NOT update the final evaluation.
    
*   **Manual catch-up**: if components need to be updated after the final has been saved, the update has to happen on the final evaluation directly (or via Course Director access to the final form). The Gradebook components alone won't propagate.
    
*   **Auto-calculation**: the score auto-calculates based on the components and their percentages, but the **Course Director still has the final input** — they can override the calculated grade.
    

(Ticket 216443, AMBS-9574, JW 6/23/23.)

## Release workflow

The institution chooses one of two release behaviors via the root setting `grade_release_workflow_enabled`:

Setting

Behavior

**Enabled (1)**

Final grades are NOT released automatically when the final evaluation is submitted. Student Administrator manually releases grades from within the Gradebook by selecting one, some, or all students. The Gradebook grade can override the final evaluation grade. The released grade then propagates to both the final evaluation and the student's Demographics page.

**Disabled (0)**

Final grades become immediately visible to the student upon completion/submission of the final evaluation. No staging.

When `grade_release_workflow_enabled` is on:

*   The Student Admin can ONLY release grades when ALL final evaluations for the course period are completed and submitted. The release checkboxes are disabled until that's true. (Ticket 226999, AMBS-9992, MC.)
    
*   If the Course Director updates the final evaluation grade after release, the Admin is notified and must re-approve and re-release for the new grade to be visible.
    
*   The Student's Enrollment/Grades audit tracks every change.
    

> **A common scenario**: a student sees their grade for one course period but not another. Almost always: the second period hasn't been released yet (typically because not all final evals for that period are complete). Confirm all final evals are complete and have the Admin release. (Ticket 226999.)

## My Grades student view

The **My Grades** link appears on a student's Home page when:

*   They are currently enrolled in a course that has Gradebook enabled, AND
    
*   The `student_gradeswindow` root setting determines how far back the student can see grades.
    

The `student_gradeswindow` setting is **NOT an enable/disable flag.** Instead, it's a number of days specifying the lookback window. If set to 30, the student can see grades from today and 30 days into the past. These grades appear under My Grades AND on Review Records. (Ticket 228151, AMBS-10035, HN/KJ.)

If a student doesn't see a grade they expect:

1.  Check whether the grade has been released.
    
2.  Check whether the course has Gradebook enabled.
    
3.  Check `student_gradeswindow` value — if too short, the grade may have aged out of view.
    

## Course Director view

When a Course Director's account has access to a course's Gradebook (configured via Course Settings → Grading), they see:

*   **Their course's Gradebook** — accessible from their Faculty home or via the course link.
    
*   **Grade entry capability** for components and final grades they're responsible for.
    
*   **The full course's grade list** — students they're assigned to.
    

The Course Director can both view existing grades and enter new ones, subject to the components and grade scale defined for the course.

## Course Coordinator vs. Course Director

*   **Course Coordinator** = administrative staff for the course. Configures Gradebook, enters component grades, manages release.
    
*   **Course Director** = faculty leader of the course. Enters final grades, has final input on calculated values, can be granted Gradebook access via the course settings.
    

Both can enter grades, but the Course Director has the final say on the final grade specifically — the auto-calculation produces a suggestion, but the Director can override.

## Common scenarios

### "Course period dates exist but the course isn't in the Gradebook dropdown"

Three common causes:

1.  **Course period midpoint is before today's AY start date** — period belongs to a different AY. Fix: confirm the term assignment for the period.
    
2.  **Open Enrollment is closed on the period** — re-open via Course Dates tab. (Ticket 215774.)
    
3.  **Course period is in the future AY** — won't appear until that AY starts. (Ticket 198882.)
    

### "Student says they can't see their grade"

Walk through:

1.  Has the grade been released? (Check Gradebook → Release tab for the student.)
    
2.  Have all final evaluations for the course period been completed?
    
3.  Is the student still within the `student_gradeswindow` lookback period?
    

If all three are true and the student still can't see, check Demographics → Enrollment/Grades tab for the audit trail.

### "We changed the grade scale and now the old grades show as codes (LW, INCMP, etc.) instead of names"

Known design limitation. Once a grade scale is changed in the Course List, past grades display option values instead of option names. **There's no clean fix in place** — recommend phased course replacement going forward (deactivate the old course version, create a new course with the new scale). (Ticket 232367.)

### "Component grades aren't flowing to the final evaluation"

Once the Course Director saved or submitted a value in the FINAL field on the final evaluation, the component-to-final flow stopped. From that point on, component grade updates in the Gradebook don't propagate. The Course Director (or an admin completing the form as the Director) has to manually update the final evaluation. (Ticket 216443.)

### "Final grades are not auto-releasing"

Check `grade_release_workflow_enabled`. If enabled (1), grades require explicit release by Student Admin and don't auto-release on final eval submission. If the institution wants auto-release behavior, disable the setting.

### "Grade entered but greyed out in the Gradebook"

The grade scale on the course was changed after this grade was entered. The grade is still on the student's Enrollment/Grades tab (not lost), but the Gradebook UI greys it out because the displayed scale no longer matches. (Ticket 159968.)

### "Need to add a new component (e.g., 'RACS') to a course"

Component names must exist in the UME Grade Components catalog (root-side). If the requested component name isn't there, MedHub Support adds it via Utilities → UME Grade Components. After that's done, the Course Coordinator can select it on Course Settings → Grading. (Ticket 175945.)

### "Students can see component grades for one period but not another from the same course"

The two periods may have different release statuses. Or the period the student can't see is in a different AY entirely. Or the period was orphaned by a grade scale change or term reassignment. The **Move Orphan Grade Assignments** root-side script can re-attach orphaned grades to the correct AY when this happens. Run for the affected course. (Ticket 225323, AMBS-9929.)

### "Error message when entering grades for a particular course block period"

Often caused by **overlapping custom course block periods**. The Gradebook does not support a course having two custom block periods that overlap on the same dates. Recommendation: either consolidate the students into one block period and delete the duplicate, OR create sites for the course and put one of the block dates at the site level. (Ticket 158280, MB.)

### "Can grade types for components be other than numeric or pass/fail?"

No. Hard-coded to those two types. Custom grade scales work only for assignments and for the final grade. Component grade types cannot be customized. (Ticket 237154.)

### "Provisional grade entered but the student doesn't see it"

By design. Provisional grades (entered before course completion) only show in the Grade Change Audit, not as the active grade on the student's Enrollment/Grades tab. The grade displays once the course is complete. (Ticket 161065.)

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`grade_release_workflow_enabled`

When enabled (1), Student Admin must manually release grades from within the Gradebook. The Gradebook grade can override the final evaluation grade and propagates to the final eval and student's Demographics page. When disabled (0), final grades are immediately visible to students upon final eval submission.

`student_gradeswindow`

Number of days lookback window for student grade visibility. Not an enable/disable — a numeric value in days. E.g., 30 = student sees today's grades and 30 days back.

Per-course settings (configured under Course Settings → Grading):

*   **Enable Gradebook** — toggles Gradebook for the course.
    
*   **Grade scale** — Pass/Fail, Honors-style, or numeric. Locked once data is entered (changing it has destructive effects).
    
*   **Components** — list of component names with weights. Drawn from the institution's UME Grade Components catalog.
    
*   **Course Director access** — whether the Course Director can enter grades.
    

Root-side scripts (institutional admin tools):

*   **Move Orphan Grade Assignments** — re-attaches grades that lost their AY association due to course period AY-spanning issues. Used to fix the issue described in Ticket 225323.
    
*   **UME Grade Components** — root-side admin tool for the institution's component catalog.
    

## Database tables appendix

Table

Purpose

`gradebooks`

Per-course, per-AY Gradebook configuration.

`gradebook_components`

Per-course component definitions (name, weight).

`gradebook_grades`

Per-student, per-component grade entries.

`gradebook_finals`

Per-student final grades, with release status flag.

`grade_scales`

Institution-wide grade scale definitions (e.g., Pass/Fail, Honors-style, numeric).

`grade_scale_options`

Per-scale option values and names (the source of the values vs. names display issue when scales change).

`users_residents_courses_periods`

Per-period course enrollment. Tied to academic year via term assignment.

`eval_results`

Final evaluation records — receive component grades and final grade flow from Gradebook.

`users_students_demographics`

Enrollment/Grades tab — receives released grades.

`grade_change_audit`

Audit of all grade changes, including provisional grades not yet displayed to students.

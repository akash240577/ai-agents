# MedHub - Course Enrollments - markdown

# MedHub - Course Enrollments (UME)

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Course enrollments are how UME tracks which students are registered for which courses, in what role, for what period. They are the primary record of a student's academic activity at the institution and the foundation for grading, evaluations, scheduling, and graduation requirements.

This document covers course enrollments in MedHub UME: how enrollment records are structured, how they get created (the five enrollment methods), how the **Enrollment/Grades** tab works, the academic-term placement logic that governs how enrollments display and behave, and the operational patterns that come up most often in support tickets.

It does not cover:

*   The **Schedule Lottery** — the lottery is _one_ method of creating enrollments, but the lottery feature itself (setup, selection sets, optimization, delivery) is documented in **MedHub - Schedule Lottery**. This doc covers what the lottery produces.
    
*   **Course List** configuration — how courses, course dates, course block date templates, and course groups are set up. See **MedHub - Course List**.
    
*   **Gradebook** mechanics — final grade entry, grade scales, grade pass-back. See **MedHub - Gradebook**. This doc covers grades only as far as they appear on the Enrollment/Grades tab.
    

## What an enrollment record is

A course enrollment record ties one student to one course for one date period. It carries:

*   **Student** (the user)
    
*   **Course** (from the Course List)
    
*   **Course date period** (from the Course List > Course Dates tab — block-date-template-driven or custom)
    
*   **Status** (Enrolled, Dropped, Waitlisted, Pending)
    
*   **Credit hours** (pulled from the Course List, optionally editable in the record itself — see configurable behavior below)
    
*   **Final grade** (set later through Gradebook or the final evaluation)
    
*   **Audit data** (date created, date submitted, lock receipt for SIS sync)
    

The same student can have multiple enrollment records for the same course if the course is configured to allow it (Course List → individual course → "Students can take this course multiple times"). Otherwise the system blocks duplicate enrollments — see "Common scenarios" for the exact behavior.

A few conventions worth knowing up front:

*   An enrollment record is created _whenever_ a student becomes associated with a course period, regardless of method. Self-enrollment requests, lottery output, manual entry, API/SIS pushes, and Excel imports all produce the same kind of record.
    
*   A **dropped** enrollment is not deleted — it stays on the record with a Dropped status. Deleting an enrollment removes it entirely; this is a different action with different audit consequences (see "Audits").
    
*   A **waitlist** record is its own enrollment status, distinct from Enrolled. Moving a student from waitlist to enrolled is always a manual action by the Student Administrator.
    

## The Enrollment/Grades tab

The Enrollment/Grades tab on a student's demographics profile is the primary place this information is viewed. The tab displays the student's enrollment records grouped by academic term, with the student's grades and credit hours.

For each enrollment, the tab shows: course name, date period, status, credit hours, and grade. From here, an authorized user can modify the enrollment (change status, modify credit hours when configured, etc.), drop it, or delete it.

Course Coordinators access the Enrollment/Grades tab for students in their course(s). To grant Course Coordinators write access to enrollments in their courses, an administrator goes to the Demographics tab and changes the Course Coordinator's access from Read to Write. **This is configurable per institution.**

The tab also displays an **Enrollment Change Audit** and a **Grade Change Audit**, when those audits are enabled at the institution. Both are demographics fields — they have to be added on the root side under Demographics (Student) > Add Field. Once a field is enabled, it begins capturing changes immediately, including changes that have already happened (the audit is computed from the underlying data, not from a log started at enable time).

There is one important limitation in the Enrollment Change Audit: **batch enrollments performed through the Pre-scheduled Activities tab in Schedule Lottery do not flow to the Enrollment Change Audit** (Ticket 147644). This is a long-standing gap. If you are investigating an enrollment that "appeared from nowhere" in the audit, batch pre-scheduled-activity entry is a likely cause.

When an enrollment record is **deleted** (not dropped), the audit shows "Record Not Available" in the Record column. This is by design — the audit references the enrollment record by ID, and once deleted, there is no record to point to (Ticket 182348).

### Why an enrollment might appear on the tab but not the Course Roster

A common confusion: a student's Enrollment/Grades tab shows them enrolled in a course, but the Course Roster does not show them. This typically happens when changes are made to a course's date periods after a student has been enrolled. The student's enrollment is now associated with a date period that no longer exists or was modified at the Course List level. The fix is to delete the enrollment and re-enroll (Ticket 191869, AMBS-8174).

A related issue: the Course Roster only shows date periods that have at least one enrolled student. If no students are enrolled in a date period yet, the Course Roster will not display it at all (Ticket 158666).

## The five enrollment methods

MedHub supports five methods for creating course enrollments. All of them produce the same kind of enrollment record; they differ in who initiates the action, what controls apply, and what audit trail is created.

### 1\. Self-enrollment (student-initiated)

Students can request to enroll in courses through the Course Catalog tab on their View Enrollments link. Self-enrollment is gated by a cascade of settings, all of which must be aligned for a course to actually appear as available:

1.  **Root setting** `student_self_enrollment` must be enabled. Without this, self-enrollment is not available anywhere at the institution.
    
2.  **School Settings → Student Self-Enrollment** must be enabled. The school setting is the gate for the institution — if this is off, no individual course can offer self-enrollment.
    
3.  **Course Group settings** (in Course List → Course Groups) can configure self-enrollment behavior for a group of courses, overriding individual course settings if defined. If course group settings are configured, the individual course settings are grayed out.
    
4.  **Individual course settings** (Course List → individual course) configure self-enrollment for that course specifically, used when course group settings are not set.
    

**The school setting is inclusive** — an individual course or course group cannot turn self-enrollment _on_ if it is off at the school level. School Settings define the maximum permitted scope; courses opt into a subset.

The **add/drop window** is set in School Settings → Schedules → Student Add-Drop Requests. The window is defined by two values: how many weeks before a course starts the window opens, and how many weeks the window stays open. For example, a window of "12 weeks before" / "9 weeks open" means the window opens 12 weeks before the course start date and closes 3 weeks before the course start date (Ticket 146340). The same window applies to all self-enrollment-eligible courses, regardless of their start dates.

The **student types and student years** eligible for self-enrollment are also configured in School Settings → Schedules → Student Add-Drop Requests. Only students of types/years selected here can self-enroll.

A note on year designation in Course Groups: the year designation is only respected by **Schedule Lottery**. It is _not_ respected for self-enrollment — a course set up for MS3s in a course group will still appear for self-enrollment to MS4s if the course is set up for self-enrollment (Ticket 179218). To restrict self-enrollment to specific years, that has to be handled at the school-setting level for student years, not at the course-group level.

Self-enrollment can be configured as **automatic** (the request is approved on submission) or **requires administrative approval** (the Student Administrator must approve the request from their Urgent Tasks). The same approval setting governs waitlist requests for that course.

#### What students see

When a course is configured for self-enrollment and the window is open, students see a **+Add Enrollment** button on the course in the Course Catalog. If the course is full and waitlist is enabled, they see **+Add to Waitlist** instead. Other states students may see (per AMBS-7632):

*   **Request processing** — request submitted but not yet synced
    
*   **Request pending** — request submitted, awaiting approval
    
*   **Join Waitlist** — when waitlist auto-approve is enabled
    
*   **Request Waitlist** — default action button when waitlist is enabled and the scheduling window is open
    

#### Enrolling in a course they've already taken

If "Students can take this course multiple times" is **disabled** on the course (default), the student gets a conflict warning when attempting to enroll again. What happens next depends on the approval setting:

*   If approval is **automatic**, the student cannot proceed past the conflict warning.
    
*   If approval **requires administrative approval**, the student can proceed and submit the request, leaving the decision to the Student Administrator (Ticket 170604).
    

#### Visiting students and self-enrollment

Visiting students with active training history records can access the Course Catalog and self-enroll, but the Student Administrator has to approve. If approved, the visiting student's training history needs an additional record matching the new course dates — this is a manual step (Ticket from late 2021, confirmed HN).

### 2\. Schedule Lottery

The Schedule Lottery generates enrollments from student preferences submitted during a defined lottery window. Students rank courses, the optimizer assigns enrollments based on priorities, and the resulting enrollments populate the Enrollment/Grades tab as Enrolled records.

For lottery setup, optimization, and delivery mechanics, see **MedHub - Schedule Lottery**. The lottery doc covers the multi-stage lottery process, selection set ordering, and pre-scheduled activities; this doc covers what those flows produce in terms of enrollment records.

Three points worth carrying over from the lottery side:

*   The Course Group **year designation** is respected by the lottery (unlike self-enrollment).
    
*   **Pre-scheduled activities** added through the lottery's Pre-scheduled Activities tab create enrollment records but **do not flow to the Enrollment Change Audit** (Ticket 147644). This is a known gap.
    
*   **Special activities** cannot coexist with course blocks. If course blocks have been associated with a special activity, custom dates and notes for that activity will not work; the fix is to remove all course blocks (Ticket 196693, AMBS-8473).
    

### 3\. Manual enrollment (admin-entered)

A Student Administrator or Course Coordinator can manually add or modify enrollments through:

*   **Student Demographics → Enrollment/Grades tab** — add an enrollment for a specific student
    
*   **Course Roster** — add students to a specific course period
    

The capabilities of each user type differ significantly. The **Student Administrator** can add enrollments regardless of course dates, enrollment numbers, waitlist status, or whether the course is currently open. **Course Coordinators**, even with Write access, are limited:

*   They cannot add an enrollment if the course period has already ended (Ticket 246827)
    
*   They cannot add an enrollment if the course period has been closed for enrollment
    
*   They cannot add an enrollment if enrollment numbers are at max
    
*   They cannot add an enrollment if there is already at least one student on the waitlist (Tickets 158485, 161895)
    

A workaround for any of these scenarios: have a Student Administrator add the enrollment instead. The Student Admin role is intentionally less constrained.

A Student Administrator also has full autonomy in the Enrollment/Grades tab to do whatever is needed — including moving a waitlisted student to enrolled status — regardless of the longitudinal checkbox in the Course List or the course's min/max settings (Ticket 180475).

### 4\. API / SIS interface

Many institutions use a custom interface between MedHub and their student information system (SIS) — Banner, the UCSF registrar, etc. The interface flows enrollments either direction depending on the configuration.

**Direction is institution-specific.** At UCSF, MedHub is the source of truth for enrollments and the data flows to SIS. At Banner-interfaced institutions, the SIS is typically the source of truth. **Always check the institution's interface configuration before making assumptions about which side is authoritative.**

The Banner interface specifically does **not** delete enrollments in MedHub when they are deleted in Banner — this is a known limitation that would require an enhancement (Ticket 221325, AMBS-9771). If a Banner institution reports phantom enrollments after a Banner-side delete, this is the cause.

For SIS sync errors visible on the Enrollment/Grades tab, the errors may be hidden if the small filter checkboxes at the top of the tab are checked. Deselecting all checkboxes will reveal sync errors for individual enrollment records (Ticket 184354, AMBS-7613).

The `lock_receipt` column in the `users_students_enrollment` table stores the last sync timestamp, prefixed with "a" for an add or "d" for a drop (Ticket 141017).

### 5\. Batch Excel import

The Student Administrator can batch-import enrollments via Excel template through the import tool. Common requirements that have to be in place for the import to work (Ticket 221109):

*   **Academic terms** must be created that cover the date ranges in the import. If terms only extend through the current academic year and the import contains future-year dates, it will fail.
    
*   **Students must be advanced** to the academic year being imported. If their training history doesn't extend into that year, enrollment imports for that period will fail. The Student Advancement Wizard handles this.
    
*   **Course dates** must exist for the periods being imported, either through Course Block Date templates or custom dates on individual courses.
    

The import tool does not delete enrollments. If the template is used to mark a status as Dropped, it will create a separate Dropped record rather than removing an existing record. To remove enrollments in batch, use the Pre-scheduled Activities tab in Schedule Lottery (even if the institution doesn't use the lottery for delivery) — choose the academic year, course, check the boxes for the affected students, and submit (Confirmed JP).

## Academic-term midpoint logic

This is the single most confusing aspect of course enrollments and the source of more edge-case tickets than any other topic in this area. Worth its own treatment.

### The rule

When a course date period is added, the system assigns it to an academic term based on the **midpoint date** of the period — not the start or end date. The midpoint is computed as the date halfway between start and end.

The system looks up which academic term contains the midpoint and assigns the period to that term. If no term contains the midpoint, the system falls back to looking up the term containing the start date. If still no term is found, the system errors with "No Academic Term exists for the date period specified" (Ticket 190050, AMBS-8005, confirmed Jeff Stevens).

### Why this causes problems

Most of the time, midpoint logic works invisibly and does what users expect. It causes problems in three specific situations:

**Problem 1: A course date period spans two academic years.** If the midpoint falls in a different academic year than the one selected when the dates were entered, the system has competing logic. The course dates are already associated with the academic year selected at entry time, but the midpoint points to a different year's term. The system cannot reconcile, and the enrollment displays under a _blank_ term header on the Enrollment/Grades tab — neither under the entered year nor under the midpoint year (Ticket 172088).

This is why an enrollment may appear "orphaned" between two academic terms with no header. There is no harm to scheduling or evaluations from this, but the display is wrong. To fix it: remove all the enrollment records, delete the affected course period, re-add the period under the academic year associated with the _midpoint_, and re-add the enrollments.

**Problem 2: A custom course period is added when multiple academic terms exist for the same year.** When the term lookup returns more than one term, the system grabs the first available — which generally maps to the lowest term ID, but **this cannot be relied on** (AMBS-8005). There is no logic to sort or prefer one term over another.

If an enrollment lands in the wrong term as a result, an easy workaround: temporarily change the academic year on the unwanted Academic Term (in List Management → Academic Terms), drop the enrollment, then revert the term change. The enrollment will then be assigned correctly (Ticket 196024, AMBS-8409).

**Problem 3: Academic terms cross academic years.** Academic terms cannot cross over two academic years. If a term is set up that spans, say, 1/1/22 – 12/31/22 (which crosses 2021-2022 and 2022-2023), the term will not work correctly with course block dates. The fix: create two separate terms within their respective academic years (Ticket 171244).

### How to avoid these problems

Whenever a course date period is created — whether through a Block Date Template or a custom period — choose the academic year that corresponds to the **midpoint** of the period, not the calendar year the period starts in. This is most relevant for periods that cross July 1 (the typical academic year boundary). If a period runs from June into August, its midpoint is in July, which generally puts it in the _new_ academic year.

For Block Date Templates specifically: the academic term is assigned when the Block Date Template date period is _created_. The system looks at the term assigned at template-creation time for any course periods built from that template later. For custom course dates added directly to a course, the term is assigned at course-period-creation time, with midpoint logic applied.

## Course block dates

A few things to know about how course block dates affect enrollments:

*   **Block dates cannot overlap.** Modifying a block date may fail with a form processing error if the change would cause overlap with another block. The fix is to start with the furthest-out block date and work backward (Ticket 154336).
    
*   **Untagging a course from a block date does not remove existing enrollments.** If you untag a course from a block date, the enrollments stay, the course block date stays in the course's Course Dates tab (since it's been used), and the date template association is preserved. Future enrollment periods can still be deleted from the course as long as they have no enrollments. Adding a new date period within an existing block date will flow to the tagged course (Ticket 143477, tested HN).
    
*   **Deleting a date period from a Block Date Template does not remove course periods already populated from it.** If a date period was used and then deleted from the template, the course periods built from it remain in the Course List. Those periods lose their academic term association, leading to the "displayed at the top of the Enrollment/Grades tab outside any term" symptom (Ticket 186109).
    
*   **A dropped enrollment does not prevent block date deletion.** If a student has a dropped record in a course, that does not block users from deleting the block dates for the course — even though there is still data referencing the period. This is a gap in functionality (Ticket 173634, on Product spreadsheet).
    

## Waitlists

Waitlist enabling is configurable at three levels (School Settings → Course Group → individual course), with the same cascade as self-enrollment. The school setting is the gate; course group and individual settings opt into a subset.

A few specific waitlist behaviors:

**Movement from waitlist to enrolled is always manual.** There is no auto-promote behavior, regardless of how waitlist or self-enrollment approval are configured. When a spot opens (an enrolled student drops), the waitlisted students are not notified, and no urgent task is generated. The Student Administrator must manually move the waitlisted student from waitlist to enrolled (Ticket 169206).

**The button students see depends on whether a waitlist already exists.** If a course fills up, students see "+Add to Waitlist." If an enrolled student then drops and a waitlist already exists, students will _continue_ to see "+Add to Waitlist" — they will not see "+Add Enrollment" again, even though there is technically a spot. The system checks whether a waitlist exists for the course, not whether a spot is open (AMB-9588).

**A student cannot be on the waitlist for the same course-and-dates twice.** Approving a duplicate waitlist request produces an error (Ticket 186962, AMBS-7856).

**For Student Administrators to add students to a waitlist, root setting** `student_self_enrollment` must be enabled, even though waitlists feel like an admin function. This is because the waitlist feature is implemented as part of the student self-enrollment system (Ticket 167895). The setting name is misleading.

**Waitlisted students do not appear in the Course Roster dropdown.** To see waitlisted students for a course, run the Student Enrollment Report and filter for Waitlisted status (Ticket 162915).

**Students can cancel waitlist requests from the Pending Requests page,** but not from the Course Catalog (Ticket 184674, AMBS-7632).

**Self-enrollment approval emails for waitlists are misleading.** When a Student Administrator approves a waitlist request, the student receives an email that says their _enrollment_ request has been approved — but they are now on the waitlist, not enrolled. This is on the Product feedback list (Ticket 169206).

## Credit hours

Credit hours on an enrollment record can behave one of two ways, controlled by `student_enrollment_hours_table`:

*   **Read-only (value 1)**: Credit hours pull from the Course List > Credit/Hours field for that course and cannot be edited at the enrollment level. Changes to course-level credit hours flow into existing enrollments.
    
*   **Write (value 2)**: Credit hours pull from the Course List initially, but can be edited at the enrollment record level (when adding or modifying). This decouples credit hours per enrollment from the course default. **This is configurable per institution** (Ticket 163623, AMBS-3812).
    

The **Graduation Requirements Query** uses the _current_ credit hours field on the course in the Course List, not the credit hours stored on the enrollment record. If the Course List credit hours are blank or 0.0, the Graduation Requirements Query will show the course as "missing" for all enrolled students, regardless of grade or what is on the enrollment record. The minimum value for the query to count a course is **0.1** (Ticket 163623, AMBS-6765).

## Student access to enrollment data

Students viewing their own enrollment schedule is gated by **two** root settings, and **both** must be checked when changing student access — toggling one without the other produces inconsistent behavior:

*   `student_schedule_view` controls whether students can see their own enrollment schedule. When 0, the Course Schedule view on the Home page and the Enrollment section of Review Records are disabled.
    
*   `settings_students_schedule_hide` (also referenced as `hide_student_schedules` in some places — same setting) hides the Schedules link from students entirely.
    

When activating or deactivating student schedule view, both settings should be reviewed and updated together (Tickets 182899, 192217). Some institutions request these changed periodically (e.g., during a multi-stage lottery process to prevent students from seeing partial assignments).

Advisor access to a student's enrollment list is controlled by `advisor_schedule_view` (1 = access, 0 = no access).

## Other behaviors worth knowing

**Course Coordinator dropdown restrictions in conferences.** When a Course Coordinator selects a lecturer for a conference, the dropdown is filtered by which residency programs are associated with their courses (via Supervising Program list or linked services on the schedule). Two Course Coordinators with the same UME access but different course assignments may see different residents in the dropdown (Ticket 133299).

**Inactive sites that re-appear as active.** Course site/clerkship status changes flow from a core clerkship to its associated site clerkships _only_ for status changes (active/inactive), not for name or abbreviation changes (Ticket 154027). Sites becoming active again is usually because the parent core clerkship was re-activated.

**Course Coordinator dropdown on the Home page.** Students will not appear in the Home page student dropdown menu for Course Administrators until they have a _current_ enrollment in that course that overlaps with today's date. The full student list is available in Student Demographics (the magnifying glass), but the Home page dropdown is filtered to the current period (Ticket 209295).

**Limiting Enrollment Requests page filtering.** The Enrollment Requests page (Schedule Management → Enrollments) functions as a browse view. There is no way to limit which dates appear beyond the existing filters; the data goes back to the institution's earliest records and cannot be purged (Ticket 216394).

**Custom away conference fields in conferences with no underscore between words won't save data.** Field Name fields must be set up with underscores between words (e.g., `Attending_who_approved_time_off`). This is a separate context (away conferences) but mentioned because it is a recurring puzzle (Ticket 187835, AMBS-7939).

**Department grouping is not supported.** The Student Enrollment Report has a Departments tab, but courses cannot be grouped into "department" categories that span multiple courses (Ticket 190598). To group courses for reporting, individual course selection is currently the only option.

## Common scenarios

### A student says they are enrolled but no enrollment record shows in a report

Run the Student Enrollment Report. Confirm the student's training history extends to cover the period in question. Without a current training history record, enrollments may not flow to reports correctly (Ticket 236496). Also verify that the student wasn't enrolled through the Pre-scheduled Activities batch tab in Schedule Lottery, in which case the audit will not show the action (Ticket 147644).

### A Course Coordinator gets "Cannot add student to requested course" error

The Course Coordinator role is constrained. The error appears when:

*   The course period has been closed for enrollment
    
*   The course has already ended
    
*   The course is at max enrollment
    
*   A waitlist has at least one student on it
    

Either ask a Student Administrator to add the enrollment, or adjust the underlying condition (Ticket 158485, 161895, 246827).

### An enrollment displays without an academic term header

The course period has lost its academic term association, usually because:

*   The course period was deleted from a Block Date Template
    
*   The course period crosses an academic year and the midpoint logic resolves to a different year than the one entered
    
*   The academic term covering the period was deleted or modified
    

The fix involves removing the affected enrollments, deleting the unaligned course period, re-adding the period under the correct academic year, and re-adding the enrollments (Tickets 172088, 186109).

### A student cannot self-enroll in a course they expect to be available

Walk down the cascade: root setting → school setting → course group setting → individual course setting. Check the add/drop window dates against today. Check student types and student years configured in School Settings → Schedules → Student Add-Drop Requests. Check whether the course is full and a waitlist already exists.

### Manage Enrollment buttons are missing

The student's training history is the most common cause. If the training history record does not cover today, or the student is between training history records (e.g., on a date that follows their last record's end), the buttons will not appear (Tickets 145660, 173129).

### A course shouldn't communicate with the registrar yet, but it is

The clock symbol on a course indicates registrar communication. Communication timing is institution-specific via the SIS interface; check the interface configuration before assuming there is a bug (Ticket 135416 from UCSF).

### Site clerkships keep flipping back to active

Site clerkships inherit status changes from the parent core clerkship. If someone activated the parent, all site clerkships went active too. Status changes flow; name changes do not (Tickets 154027, 162443).

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`student_self_enrollment`

Master toggle for student self-enrollment. Also gates the Student Admin's ability to add students to a waitlist.

`student_schedule_view`

Student access to their own enrollment schedule. 1 = access, 0 = no access.

`settings_students_schedule_hide` (aka `hide_student_schedules`)

Hides the Schedules link from students entirely. Should be reviewed and updated together with `student_schedule_view`.

`student_enrollment_hours_table`

Credit hours editability. 1 = Read-Only (pull from Course List), 2 = Write (pull from Course List, editable in record).

`student_enrollmentA` / `student_cards_enrollmentA`

Configure enrollment record field display.

`enrollment_status_nameA`

Custom display labels for enrollment statuses.

`enrollment_lock_method`

Governs student enrollment record delete behavior.

`hide_student_enrollment`

Hides student enrollment area.

`advisor_schedule_view`

Advisor access to student enrollment lists. 1 = access, 0 = no access.

`track_enrollment_period_reference`

Affects how enrollment periods are referenced in tracking.

## Database tables appendix

Table

Purpose

`users_students_enrollment`

Primary enrollment records. One row per student-course-period combination. Includes status, lock\_receipt (SIS sync), credit hours, and audit timestamps.

`users_students_enrollment_grades`

Grades associated with enrollment records, including `date_submitted` (when grade action was submitted).

`sh_students_lottery_enrollment`

Enrollments produced by Schedule Lottery, with lottery-specific metadata.

`users_students_deferments`

Student deferments, which interact with enrollment records.

`grading_auto_calc_enrollment`

Auto-calculation data for enrollments — note that auto-calc Gradebook is deprecated; this table is legacy.

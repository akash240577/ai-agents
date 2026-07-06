# MedHub - Course List (UME) - markdown

# MedHub - Course List (UME)

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The Course List is the UME-side equivalent of the GME-side Program List. It is the institutional registry of medical school courses — clerkships, electives, foundational courses, longitudinal experiences — that students enroll in, schedule against, and are evaluated within. Each course is a discrete container with its own dates, sites, evaluations, requirements, and enrollment lifecycle.

This document covers the Course List as a feature: course attributes, course types and how they affect downstream behavior, course site configuration, course period definitions, course-level evaluations and requirements, the relationship between courses and Course Coordinators, and the operational patterns that come up repeatedly in support tickets.

It does not cover:

*   **Course Enrollments** — separate doc covering enrollment records, the relationship between Course List and student records (see **MedHub - Course Enrollments**)
    
*   **Schedule Lottery** — covered in **MedHub - Schedule Lottery**
    
*   **UME rotation schedules within a course** — covered in **MedHub - Scheduling** §2.4
    
*   **Evaluation forms tied to courses** — covered in **MedHub - Evaluations — UME**
    

## Where it lives

The Course List is accessed from the UME-side global navigation:

*   **Course List** in the main menu — registry of all courses at the institution
    
*   Each course's individual settings are accessed by clicking the course name → Course Settings tabs
    

Student Administrators (Dean's Office) have full read/write access to the Course List. Course Coordinators have access to the courses they're assigned to.

## Course attributes

Each course in the Course List has:

*   **Name** — display name (e.g., "Pediatrics Clerkship")
    
*   **Course code** — institutional course code (e.g., "PEDS 301")
    
*   **Type** — Clerkship, Elective, Foundational, Longitudinal, etc. (configurable)
    
*   **Status** — Active / Inactive
    
*   **Default site / sites** — the location(s) where the course takes place (covered below)
    
*   **Course Director / Co-Directors** — faculty lead(s)
    
*   **Course Coordinator(s)** — administrative lead(s)
    
*   **Default duration** — for clerkships with fixed length, the default block size
    
*   **Required vs Elective** — whether students must enroll
    
*   **PGY level / class year** — which class the course is intended for
    
*   **Required preceptor / faculty count** — for evaluation delivery rules
    
*   **Description**
    

## Course types

The Course Type field controls some downstream behaviors:

*   **Clerkship** — typically the core clinical rotations. Has clerkship periods, may have multiple sites, evaluations include Final SPE.
    
*   **Elective** — student-selected courses, typically with shorter duration and looser scheduling requirements.
    
*   **Foundational** — first-year preclinical courses, typically institution-wide cohorts.
    
*   **Longitudinal** — courses that span the entire year or multiple years (e.g., longitudinal mentorship, longitudinal research).
    

Course Type is configurable at the institution level — the available types are managed via List Management or root configuration.

## Course sites

A course can have one site or multiple sites. Sites represent the physical location(s) where the course takes place — typically hospitals or clinics affiliated with the medical school.

### Single-site courses

A course with a single site has all enrollments associated with that site. Course schedule and evaluations are scoped to the site.

### Multi-site courses

For clerkships offered at multiple hospitals (e.g., "PEDS 301" offered at Hospital A and Hospital B), the course has multiple site variants. Site variants share the course's overall structure but have distinct:

*   Course dates (per-site offering schedule)
    
*   Evaluation forms (sometimes site-specific)
    
*   Sites (location)
    
*   Course Coordinators (sometimes per-site)
    

> **Display behavior for site variants on the schedule.** The schedule display only shows blocks for the variant the user is currently viewing. Site-specific dates do not display when toggled to the main course, and vice versa. This is by design — site variants have separate schedules. (See **MedHub - Scheduling** §2.4 — UME courses with site-specific variants.)

### Adding a site to an existing course

When adding a site to a course, the institution must add the site to the course's site list and then create a course period for that site. Existing students don't automatically get site assignments — that is configured during enrollment.

> **Multi-site Final evaluation rollup.** For a clerkship with multiple sites, the Final SPE rolls up data from evaluations completed at the student's specific site. Adding sites to a course splits the schedule; site-specific evaluations only roll up into the Final for students at that site. (Ticket 160865 pattern, documented in **MedHub - Evaluations — UME** §"Multiple sites in a clerkship.")

## Course periods

Courses use **course periods** (also called rotation periods or clerkship periods, depending on UI). Course periods are the date ranges that define when an instance of the course is offered.

### How periods are defined

Two configuration paths:

1.  **Custom rotation periods** — defined in **List Management → Rotation Periods**. These take precedence when present.
    
2.  **Auto-generate from enrollments** — when no custom periods are defined and the course has the auto-generate setting on (see **MedHub - Scheduling** §2.4), the schedule slices the academic year based on actual enrollment dates.
    

> **Why a course coordinator sees rotation dates they didn't create.** This is almost always the auto-generate-from-enrollments behavior. A single enrollment 1/3 – 1/30 produces three periods (7/1 – 1/2, 1/3 – 1/30, 1/31 – 6/30). If the coordinator wants explicit periods, define them in List Management → Rotation Periods.

### Period structure

Each course period has:

*   **Start date / End date**
    
*   **Site (for multi-site courses)**
    
*   **Capacity** — maximum number of students per period
    
*   **Required preceptor count** — how many faculty are needed
    
*   **Custom attributes** specific to the institution
    

## Course Director and Course Coordinator

Each course has at least one Course Director (faculty) and one Course Coordinator (admin). Roles:

### Course Director

*   Reviews and releases Final evaluations (see **MedHub - Evaluations — UME** §"Final evaluations and SPE")
    
*   Has access to all course evaluations
    
*   Can edit course settings
    
*   Receives course-related alerts (low score, etc.)
    

### Associate Course Director / Co-Director

When `setting_clerkship_codirectors` is enabled, Associate Course Directors get the same access as Course Directors — including the ability to **release** student evaluations. There is no read-only review mode for co-directors. (See **MedHub - Demographics — Faculty** §"Associate Program Director" — same setting governs both UME co-directors and the GME parallel.)

### Course Coordinator

*   Manages course settings
    
*   Manages course evaluations and schedule
    
*   Manages enrollments (with appropriate access)
    
*   Has access to demographics for enrolled students (per institution access map)
    

## Course-level evaluations and requirements

Courses have their own evaluation configuration:

*   **Evaluation forms** — created at the course level or shared from another course
    
*   **Final evaluation** — designated SPE
    
*   **Requirements** — minimum evaluations per student per period (e.g., "every student must receive at least 3 faculty evaluations")
    
*   **Mapping** — questions on mid-rotation evaluations mapped to the Final
    

See **MedHub - Evaluations — UME** for the full evaluation framework.

## Course Coordinator access map

The Course Coordinator's access to evaluations, demographics, and course settings is controlled by an institution-level access map. By default:

*   **Evaluations** — full access (per **MedHub - Evaluations — UME** §"Coordinator access by default")
    
*   **Demographics** — read access to enrolled students
    
*   **Course settings** — write access for assigned courses
    
*   **Schedule** — write access for assigned courses
    

The access map can restrict any of these per institution — typically used to limit Coordinator visibility into demographics or evaluations from other courses.

## Inactivating a course

When a course is no longer offered:

1.  Set Status to Inactive on the Course Settings page
    
2.  The course is removed from active dropdowns and reports
    
3.  Historical enrollments and evaluations are preserved
    

> **Inactivated courses still appear in historical reports.** Setting Status to Inactive does not delete data; it removes the course from active dropdowns. Existing enrollments, evaluations, and grades remain.

> **Cannot delete a course that has had enrollments.** Deletion is reserved for courses that were created in error and never used. Once an enrollment exists, the course can only be inactivated.

## Common scenarios

### "Course Coordinator can't see a course they should have access to"

Walk through:

1.  Is the Coordinator listed in the course's Course Coordinator field?
    
2.  Is the institution's access map configured to give Coordinators access to all courses or only assigned ones?
    
3.  For a recently-added course, has the Coordinator's session been refreshed (logout/login)?
    

### "Course shows site variants but the student is enrolled in the wrong one"

Edit the enrollment record to point to the correct site variant. The student's schedule and evaluations will rebuild for the new site after the next overnight cron.

### "Course period dates don't align with enrollment dates"

If the course is using auto-generate from enrollments, this is by design — periods slice based on enrollments. If using custom rotation periods, edit the period in List Management → Rotation Periods.

### "Final evaluation is missing data from one site"

Each site variant has its own evaluation rollup. Confirm the student's enrollment site matches where evaluations were completed.

### "Faculty appears in the wrong course's faculty dropdown"

Faculty must be associated with a course (typically via the Faculty Demographics → Programs/Services tab → Add/Modify Programs flow, with the course as the "program" association). See **MedHub - Demographics — Faculty** §"Removing from a single program."

### "Adding a faculty to a course is also showing them on GME side"

By design. Adding a UME course association to a faculty profile creates a corresponding association with the medical school program on the GME side. Removing the UME course doesn't fully detach them from the medical school program. (See **MedHub - Demographics — Faculty** §"Faculty added to UME course is also showing on GME side.")

### "Course code doesn't match what's in the SIS"

Course codes can be edited in Course Settings. If the course is being integrated with an external SIS, the code mapping must match.

## Open questions for Emma

*   `[VERIFY]` The exact UI flow for adding sites to a course and configuring site variants. My coverage is based on inference from related Scheduling and Evaluations content; the Course List-side UI may have specific flows I haven't captured.
    
*   `[VERIFY]` Whether Course Type is fully configurable per institution or whether the available types are hardcoded.
    
*   `[VERIFY]` The exact relationship between Course List and the GME Program List — specifically whether the medical school program (GME-side) is auto-created when a UME institution is set up, or whether it's a separate institution configuration step.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_students`

Master toggle for UME-side functionality.

`setting_clerkship_codirectors`

Gives Associate Course Directors the same access as Course Directors, including evaluation release.

`setting_courses_auto_generate` (per-course)

Enables auto-generate of course periods from enrollment dates.

`setting_course_types`

Institution-level list of course types.

Course-level settings are configured per-course via Course Settings.

## Database tables appendix

Table

Purpose

`i_courses`

Primary course records. One row per course. Contains name, code, type, status, default site, capacity, requirements.

`i_courses_sites`

Course site associations. One row per (course, site) pair for multi-site courses.

`i_courses_periods` / `i_courses_periods_sites`

Course periods (clerkship periods) with optional site-specific variants.

`i_courses_directors`

Course Director and co-director associations.

`i_courses_coordinators`

Course Coordinator associations.

`users_students_enrollments`

Enrollment records. See **MedHub - Course Enrollments**.

The Course List shares some infrastructure with the GME Program List (`i_programs`) — both rely on the same site references, faculty associations, and evaluation form library at the institution level.

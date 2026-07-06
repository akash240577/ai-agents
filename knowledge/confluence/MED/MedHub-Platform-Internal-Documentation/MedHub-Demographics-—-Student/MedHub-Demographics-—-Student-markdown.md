# MedHub - Demographics — Student - markdown

# MedHub - Demographics — Student

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Student Demographics is the MedHub feature that records the medical students at a UME institution — their identifying data, contact info, training history, education, and the system identifiers MedHub uses to route course enrollments, evaluations, and clerkship assignments to the right person.

This document covers Student Demographics as a feature: profile structure, the institutional-vs-course demographic field configuration, how to add and modify students (manually and via batch import), the lifecycle (deletion, archive, transition), the custom demographics field configuration workflow on the root side, and the operational patterns that come up repeatedly in support tickets.

It does not cover:

*   **Training history mechanics** — covered in **MedHub - Training History** §"Student Training History" (flat record structure, the 30-day post-end-date window, visiting student handling).
    
*   **Course enrollments** — covered in **MedHub - Course Enrollments**. Enrollments are conceptually distinct from training history.
    
*   **Course / clerkship scheduling and Schedule Lottery** — covered in **MedHub - Schedule Lottery**.
    
*   **Evaluations of and by students** — covered in **MedHub - Evaluations — UME**.
    
*   **Onboarding packages sent to incoming students** — covered in **MedHub - Onboarding** (the term-translatable feature `term_student_applicationsStr`).
    
*   **The Gradebook** — covered in **MedHub - Gradebook**.
    

## Where it lives

Student Demographics records are accessed through:

*   The **Students** dropdown in User Management on the home page
    
*   The Student Administrator's home page → Demographics link
    

The Student Administrator (Dean's Office) is the primary user with full read/write across all students at the institution. Course Coordinators have varying access depending on the institution's access map configuration — typically read access to demographics for students enrolled in their courses.

The profile is organized into a series of tabs:

1.  **Demographics** — contact data, identifiers, hardcoded fields, and any institution-configured custom fields
    
2.  **Training History** — flat list of training periods; see **MedHub - Training History** §"Student Training History"
    
3.  **Education** — undergraduate education, prior degrees
    
4.  **Enrollments / Grades** — course enrollment records and grades; see **MedHub - Course Enrollments**
    
5.  **Forms/Files** — uploaded documents
    
6.  **Schedule** — read-only view of the student's schedule
    

There is also an **Active** and **Access** checkbox pair beneath the Demographics tab, and a "Permanently Delete this Student" link visible to Student Administrators with Security access — but only when the student has training history records that are entirely in the future.

## Profile structure

### Tab 1: Demographics

Required fields when adding a new student manually:

*   First Name
    
*   Last Name
    
*   Username
    
*   Email Address
    
*   Start Date
    

Plus the student must be assigned to the medical school (typically just the institution's single school).

Hardcoded fields available via root configuration (Status active/inactive, Read/Write per field):

*   Salutation, Title, Photo
    
*   Active checkbox, Access checkbox, Reset Password
    
*   Student ID / Employee ID
    
*   Personal demographics: gender, date of birth, ethnicity, marital status
    
*   Contact: home phone, cell phone, work phone, work address, home address
    
*   Emergency contact
    
*   Languages, biographical
    
*   General Notes
    

Like Faculty and Resident demographics, the standard Student demographic fields are configured under root-side **Student Fields** (per institution). Each field has a Status (Active/Inactive) and Admin Access (Read/Write) value.

### Custom demographic fields

Like Resident Demographics (and unlike Faculty), **Student Demographics supports custom fields** at the institution level. The configuration workflow is the same as for residents — see §"Custom demographics field configuration workflow" below.

### Tab 2: Training History

Documented in detail in **MedHub - Training History** §"Student Training History." From the Student Demographics standpoint, the Training History tab is where:

*   Periods of medical school training are recorded (Medical Student type, Military, Lapse in Training, Other)
    
*   Visiting student records are added (with Visiting School and optional Clerkship reference)
    
*   Student Type is set per period
    
*   The student's "active" status is determined (today within a current training history record)
    
*   Lapses in training are recorded
    

Student training history is a **flat list** — there is no two-level Post Graduate Event / appointment structure like residents have.

### Tab 3: Education

Records the student's prior education (undergraduate, graduate work). Affects only certain reports — UME-side education does not drive PGY calculations the way GME-side medical school dates do.

### Tab 4: Enrollments / Grades

Read-only or limited-write view of the student's course enrollments. Enrollments are managed through Course Enrollments / Course List — see **MedHub - Course Enrollments** for that workflow.

### Tab 5: Forms/Files

Generic file storage for documents tied to the student.

### Tab 6: Schedule

Read-only view of the student's clerkship and course schedule. The student's actual schedule is owned by their course enrollments and clerkship assignments — this tab visualizes them.

## Adding new students

There are three supported paths to add students:

### 1\. Student Demographics Batch Import

The most common path for institutions onboarding a class. Available under UME-side **Task Wizards → Student Demographics Batch Import**.

> **Three separate batch demographics wizards.** Faculty, Resident, and Student each have their own dedicated batch demographics wizard — they do not share infrastructure. The Student version (this one) operates independently from the Resident version (see **MedHub - Demographics — Resident** §"Resident Demographics Batch Import") and the Faculty version (see **MedHub - Demographics — Faculty** §"Faculty Demographics Batch Import").

The wizard works in two phases:

**Phase A — Create Import Template:**

1.  Click **Student Demographics Batch Import**.
    
2.  Click **A. Create Import Template**.
    
3.  Select students to update or exclude (or generate a template for new students).
    
4.  Select the demographic fields to update.
    
5.  Download the generated template.
    
6.  Modify the file, preserving format.
    

**Phase B — Upload Populated Template:**

1.  Click **B. Upload Populated Template**.
    
2.  Browse to the file.
    
3.  Confirm each field to update.
    
4.  The progress bar and IMPORT ERRORS section indicate status. _Import Complete!_ displays when finished.
    

The wizard handles both creating new students and updating existing ones — when generating the template, including existing students produces rows pre-filled with their current data, which can then be overwritten in the spreadsheet.

### 2\. Manual entry

Available to Student Administrators under Student Demographics → Add New Student. Used for one-off additions (a student transferring in mid-year, a sandbox/test student).

### 3\. Visiting student addition

Visiting students (from another medical school) are added by populating the Training History tab with a Visiting School reference and optional Clerkship reference. When a visiting student is added with a clerkship reference, an enrollment record is automatically created for that course. See **MedHub - Training History** §"Visiting students" for the dual-record creation behavior.

## Adding student photos in bulk

The **Batch Photo Upload Wizard** (`setting_wizardA` index 16, accessible UME-side as well) uploads multiple student photos in one operation. Behavior is identical regardless of user type — see **MedHub - Demographics — Faculty** §"Adding faculty photos in bulk: Batch Photo Upload Wizard" for the full mechanics. The same naming-convention rules apply (filename matches Name, MedHub Username, or Employee ID Number).

## Updating an existing student

From User Management → Students → select the student. Student Administrators have write access to all fields they have permission for (per institution's `Student Fields` configuration). Course Coordinators have read access by default but typically not write to demographics.

### Username changes

*   **Usernames must be unique across the institution** (across all user types — students, residents, faculty share the username space).
    
*   **There is no UME equivalent of the Resident Email Swap Wizard.** Bulk email updates require the Student Demographics Batch Import wizard with the email field included.
    

### Self-service updates

Students can update basic contact information (home address, home phone, etc.) when the institution permits. The fields available for self-service are configured via Student Fields → Read/Write configuration.

## Custom demographics field configuration workflow

Like Resident Demographics, Student Demographics supports custom fields institutions can request. The workflow mirrors the resident one — see **MedHub - Demographics — Resident** §"Custom demographics field configuration workflow" for the full step-by-step.

Key points:

1.  **Confirm scope** — the field is for students specifically (vs residents or faculty)
    
2.  **Confirm field type** — text, number, date, dropdown, checkbox, multi-select
    
3.  **Confirm display configuration** — visibility/access per role
    
4.  **Add the field on the root side** via Student Fields:
    
    *   Navigate to **Student Fields** in global navigation as a Support user
        
    *   Add a new field with the appropriate name (no spaces, starts with a letter, alphanumeric and underscores only)
        
    *   Set the title (the display label)
        
    *   Set Status = Active
        
    *   Set Admin Access = Write (or Read)
        
    *   For dropdown fields, populate the options list
        
    *   Save
        
5.  **For dropdown options that need ongoing management** by Student Admins, configure the access setting (parallel to `faculty_dept_accessA` for Faculty Department).
    

> **Field naming rules are strict** (same as resident custom fields and conference custom fields): field names cannot contain spaces, must start with a letter, contain only alphanumeric characters and underscores, are case-sensitive. Field titles can be flexible.

> `[VERIFY: ]` Coverage of root-side custom field configuration in this doc is based on inference from related documented patterns. The exact root-side UI flow for adding student custom fields may differ in current product. Recommend Emma's review of the workflow.

## Lifecycle

### Active and Access

Two checkboxes beneath the Demographics tab:

*   **Active** — controls active state. Most behavior is driven by training history (current record exists for today's date).
    
*   **Access** — controls direct MedHub login access.
    

### Archive and delete

*   **Archive** — like residents and faculty, students can be archived. Archived students don't show in standard dropdowns or reports but retain all data.
    
*   **Permanent delete** — only available when the student has training history records entirely in the future. The delete link is gated by Security access in the user-management page (not by Super Admin status, and not by the GME-side `setting_gme_delete_resident` setting). Documented in AMBS-11438 (Ticket 238242). See **MedHub - Training History** §"Permanent deletion of a student profile."
    

### Graduation

Student graduation is recorded by ending their training history record. Once the end date passes, the standard 30-day post-end-date access window applies (per **MedHub - Training History** §"Status, access, and the 30-day window"); after that, access is automatically removed overnight.

### Student-to-Resident Transition

The **Student-to-Resident Transition Wizard** is deprecated per current internal guidance. Students transitioning to GME (matching into a residency at the same institution) should be added as residents through the standard ERAS Demographics Import or New Resident Import wizards (see **MedHub - Demographics — Resident**), not transitioned via the wizard.

## Visiting students

Visiting students are tracked through the visiting student fields on the training history record:

*   **Visiting School** — links to the IRIS school list (the home school they're visiting from)
    
*   **Clerkship** — optional reference to a specific clerkship; when set, an enrollment record is also created
    

When a visiting student is added with a clerkship reference, the dual-record creation produces:

1.  A training history record (with Training Type = Medical Student, Visiting School set, Clerkship set)
    
2.  An enrollment record for the corresponding course (visible to the Course Coordinator)
    

Visiting students retain all standard student behaviors (access, evaluations, etc.) for the duration of their training history record.

> **Visiting students gain access only after their visit start date.** They do not appear in the new course's enrollment-related dropdowns until the overnight cron runs after their start date — there is no immediate access flip. (Mirrors the visiting resident behavior in **MedHub - Training History** §"Visiting trainee access.") If access is needed sooner, escalate to Tier 2 to manually run the cron.

## Common scenarios

### "Student can't log in but their training history record is current"

Walk through:

1.  Active checkbox state — is it checked?
    
2.  Access checkbox state — is it checked?
    
3.  Username and email correct?
    
4.  Have they been archived?
    
5.  For a record crossing the academic year boundary (most common pattern: students lose access on the day after their previous training history if a new record hasn't been added) — see **MedHub - Training History** §"Status, access, and the 30-day window."
    
6.  Is this a visiting student whose start date is today? They may need the overnight cron to run before they get access.
    

### "Visiting student needs immediate access"

Visiting students gain access only after the overnight cron runs after their start date. Tier 2 can manually run the visitor cron if access is needed sooner.

### "Visiting student added but not appearing in enrollment list"

The dual-record creation may have hit an edge case. Confirm:

1.  Training history record has Visiting School set
    
2.  Training history record has Clerkship reference set
    
3.  The corresponding course is active and accepting enrollments
    
4.  Wait for the overnight cron, or escalate to Tier 2
    

### "Student transferring in from another medical school"

Add as a regular student (not visiting) with a new training history record. Their previous education at the other school is recorded on the Education tab.

### "Need to bulk-update a custom field across all students"

Use the Student Demographics Batch Import wizard. Generate a template that includes the custom field, populate, upload.

### "Student-to-Resident Transition needed"

Use the standard ERAS Demographics Import or New Resident Import (see **MedHub - Demographics — Resident**) to create the resident record; the Student-to-Resident Transition Wizard is deprecated.

### "Custom field's data isn't saving"

Field name probably has spaces or special characters. Field names must start with a letter, contain only alphanumerics and underscores, and have no spaces.

## Open questions for Emma

*   `[VERIFY]` The custom demographic field configuration workflow described in §"Custom demographics field configuration workflow." Mirrors the resident pattern, but recommend you review for any UME-specific nuances.
    
*   `[VERIFY]` Whether there's a UME-specific equivalent of the Resident Email Swap Wizard for batch email updates. I don't see one in `setting_wizardA` but want to confirm.
    
*   `[VERIFY]` The exact deprecation status of the Student-to-Resident Transition Wizard and what should be communicated to clients who currently rely on it.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_students`

Master toggle for UME-side functionality. Required for many student-related features.

`training_typeA`

Student training types: 1=Medical Student, 2=Military, 3=Lapse in Training, 4=Other. Hardcoded; do not modify per client.

`student_trainingA` / `student_cards_trainingA`

Configure student training history field display.

`setting_wizardA` (index 15)

Per-user-type access to Student to Resident Transition Wizard (deprecated; do not use).

`setting_wizardA` (index 16)

Per-user-type access to Batch Photo Upload Wizard (used for residents, faculty, students).

`term_student_applicationsStr`

Term-translatable string for Onboarding (the UME-side onboarding feature for incoming students). See **MedHub - Onboarding**.

`setting_clerkship_codirectors`

UME — gives Associate Course / Clerkship Directors the same access as Course Directors. Affects student evaluations primarily. See **MedHub - Demographics — Faculty** §"Associate Program Director" and **MedHub - Evaluations — UME**.

Student Fields configuration (the controlled set of demographic fields, including any institution-specific custom fields) is managed through **Student Fields** on the root side, which controls Status (Active/Inactive) and Admin Access (Read/Write) for each field.

The Student Demographics Batch Import wizard is UME-specific and not represented in `setting_wizardA` (which is the GME wizard registry). It's accessed from the UME-side Task Wizards page.

## Database tables appendix

Table

Purpose

`users_students`

Primary student profile records. One row per student. Contains demographics, contact info, identifiers, Active/Access flags.

`users_students_training`

Student training history. Flat structure — one row per training period (Medical Student, Military, Lapse, Other). See **MedHub - Training History**.

`users_students_education`

Education tab records (undergraduate, graduate, etc.).

`users_students_files`

Forms/Files tab uploads.

`users_students_custom_*`

Custom demographic fields (extended tables; named per institution's configured custom fields).

`users_students_enrollments`

Enrollment tab records — links into Course Enrollments. See **MedHub - Course Enrollments**.

The Student user type also has course associations, role-specific tables for visiting students, and references to the IRIS school list (`lookup_iris_schools`) used for Visiting School population.

# MedHub - Reports — Enrollment - markdown

# MedHub - Reports — Enrollment \[UME\]

## Report List

These reports provide visibility into student enrollment status, course capacity, service completion, grades, and rosters across UME clerkships and courses. They are found under Reports > Scheduling Reports and Reports > Demographics in UME contexts.

### Enrollment Period Report

Displays enrollment period data at the course level, showing how many students are enrolled in each defined period for each course. This is a capacity/slot-level view -- it reports against the enrollment periods configured for courses, not individual student records.

**Access:** Student Administrator. Reports > Scheduling Reports > Enrollment Period Report.

**Filter options:** Courses, Departments, or Sites (tab selection); Status (Active, Closed, Cancelled; multi-select); Date Period (start and end date).

**Output columns:** Course Name, Course Abbrev, Status, Start Date, End Date, Min, Max, Enrolled, Reference, Other ID.

### Student Enrollment Report

Provides a summary of student enrollment status and the scheduled services for each enrollment, filterable by courses, departments, or sites. This is a student-level view -- each row is one student's enrollment in one course.

**Access:** Student Administrator, Course Coordinator. Reports > Scheduling Reports > Student Enrollment Report.

**Filter options:** Courses, Departments, or Sites (tab selection); Year(s); Status(es) (Enrolled, Dropped, Waitlisted); Student Type(s) (multi-select); Date Period; Lottery; Sort By (Course, Date, or Student); Display Options (List scheduled services, Include Employee ID).

**Output columns:** Student Name, Employee ID (if selected), Type, Year, Course, Status, Start Date, End Date, Scheduled Services (if selected).

**Output formats:** HTML, XLS, XLSX, Text (Tab, Comma, or Pipe Delimited).

Enrollments that cross academic year boundaries are included in the report when the date range spans both years.

### Student Service Report

Provides a detailed breakdown of the services students have completed, including which course the services were for, when they took place, and where.

**Access:** Student Administrator. Reports > Scheduling Reports > Student Service Report.

**Filter options:** Courses or Departments (tab selection); Site(s) (multi-select); Date Period.

**Output columns:** Course, Student, Service, Abbrev, Start Date, End Date, Days, Campus/Location, Site, Service Type, Resident Interaction.

**Output formats:** HTML, XLS, Text (Tab, Comma, or Pipe Delimited).

### Student Roster

Outputs a roster of all students who were enrolled during a date range in any courses selected. This report bridges enrollment and demographics -- it shows who was enrolled where and when, with optional demographic fields.

**Access:** Student Administrator, Course Coordinator. Reports > Demographics > Student Roster.

**Filter options:** Course; Year(s); Student Type(s); Date Range. Optional display fields: Date of Birth, Gender, Middle Name, Email Address, Pager, Student ID, Mailbox.

**Output columns:** Student, Course, Course Start, Course End, Type, Level, plus any optional fields selected.

**Output formats:** HTML, XLS, XLSX, Text (Tab, Comma, or Pipe Delimited).

### Student Grades

Displays student grade data by clerkship, pulling from the gradebook and final grade submissions.

**Access:** Student Administrator, Course Coordinator. Reports > Demographics > Student Grades.

**Filter options:** Clerkship; Site(s); Date Range; Display Options.

**Output columns:** Student Name, Clerkship, Term, and detailed grade information within the clerkship.

**Output formats:** HTML, XLS, XLSX, Text (Tab, Comma, or Pipe Delimited).

* * *

## Cross-References

Related Page

Relationship

Course Enrollments UME

Core feature doc for UME enrollment configuration, self-enrollment, add/drop workflows

Schedule Lottery UME

Lottery-based enrollment; lottery results commit to enrollment records

Course List UME

Course and clerkship definitions that students enroll into

Grades and Gradebook UME

Grade entry, composite evaluations, and final grade workflows that feed the Student Grades report

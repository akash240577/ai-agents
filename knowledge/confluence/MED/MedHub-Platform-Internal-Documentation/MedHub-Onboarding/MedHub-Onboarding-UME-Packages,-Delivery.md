# MedHub - Onboarding - UME - Packages, Delivery

# MedHub — Onboarding: Creating & Delivering Packages (UME)

> **Scope.** This article covers the UME (medical student) side of onboarding: building packages and the documents inside them, scoping requirements to the right students, delivering packages, what students see and do, and the emails and Urgent Tasks involved. The **review and approval** side — Dean's Office approval, batch and individual processing, and the reporting tools — lives in the companion article _MedHub — Onboarding: Reviewing & Approving Requirements (UME)_, referenced here as "the review/approval article."
> 
> **This is a UME article and is self-contained.** It does not rely on the GME onboarding articles for any behavioral detail. While the UME and GME onboarding modules share much of the same underlying architecture, they differ in terminology, the approving body, available document types, and several behaviors; do not apply GME behavior to the UME side. Two differences are important enough to state up front: **UME onboarding does not use dynamic forms, and it does not use contracts** (see §3).

* * *

## 1\. Overview and terminology

UME onboarding is the module the Dean's Office uses to collect the documents, forms, and training modules a medical student must complete — for example, at matriculation, before clerkships, or for visiting-student rotations. A set of these requirements is bundled into a **package**, which is **assigned** to students and then **delivered** to them. Delivery generates a personalized link and an email; the student completes the requirements in a web portal; the Dean's Office processes what comes back.

### The module name is configurable

The label for this module is set per institution. The root setting `term_student_applicationsStr` controls the full name (default **Student Applications**) and `term_student_applicationsShortStr` controls the short name used on subtabs (default **Applications**). Common configured values include **Student Applications**, **Student Onboarding**, and **Student Requirements**. Throughout this article, navigation paths use generic names; substitute the institution's configured term. Note also that the UME term for a student's level is itself configurable through `term_student_levelStr` (default **Year**).

### Where it lives

The module is reached from the Student Admin (Dean's Office) home page using the institution's configured link name. It opens to a set of subtabs:

*   **Delivery** (sometimes labeled "Applications") — the list of students and their assigned/delivered packages; where assigning, delivering, updating, and changing due dates happen.
    
*   **Requirements** — a per-requirement view across students, used for processing individual items (covered in the review/approval article).
    
*   **Manage Packages** — where packages are created, configured, and have requirements added to them.
    
*   **Forms and Documents** — the library of reusable document/requirement definitions.
    

### Who has access

Access to the module is enabled by `setting_student_applications` and governed by related access settings. Which user types can process a package on a student's Orientation tab is controlled by `setting_student_applications_modify`; which user types can view applicant-submitted files is controlled by `setting_student_applications_fileA`. The approving body on the UME side is the **Dean's Office** (this is reflected throughout the system, including the approval fields stored on each requirement).

* * *

## 2\. Packages: standard vs. custom

A package is the parent container for a set of requirements (stored in `users_students_apps` when assigned to a student). Each package has a type:

**Standard package.** The default package type; an institution may have only one active standard package at a time. Creating a new standard package archives the prior one.

**Custom package.** Remains in effect until explicitly inactivated; an institution may have more than one custom package active at once. Custom packages are used when different student populations need different requirement sets (for example, a matriculation package alongside a visiting-student package).

The Manage Packages subtab lists every package with its effective date, status (Active/Inactive), the count of forms/documents it contains, and the count of students it has been delivered to. When creating a new package, a **Copy From** option lets you start from an existing package (for example, to build a new academic-year version).

### Package-level settings

Configured on the Manage Packages subtab when you create or modify a package:

*   **Package Name** — the title students and staff see.
    
*   **Type** — Standard or Custom (see above).
    
*   **Effective Date** — the date the package becomes usable.
    
*   **Due Date** — set as a number of days before the student's Orientation Date, a fixed date, or the package due date. Because the due date can be derived from the Orientation Date, the value stored on each delivered package depends on the student having an Orientation Date on file (see §5).
    
*   **Intro/Instructions** — static text displayed at the top of the student's portal. Editing this field flows to already-delivered packages without requiring a package update.
    
*   **Directions** — the text substituted into the `{DIRECTIONS}` token in the delivery email (see §10).
    
*   **Email Subject Line** and **Email Content** — the delivery email (see §10).
    
*   **Status** — Active or Inactive.
    
*   **Email Reminders** — "Send reminder N days before due date" and an optional "Send weekly reminders."
    
*   **Reminder Text** — text included in reminder emails, alongside the system-generated list of outstanding items and the portal link (see §10).
    

### Package structure: headers and ordering

Within a package, requirements can be grouped under **headers** (section titles) added with the **Add Header** button, and each requirement row has an order control so the package can be sequenced as the student should experience it.

* * *

## 3\. Documents (requirements) and how they behave

A "document" in onboarding is any single requirement placed into a package. Definitions live in the **Forms and Documents** library and are reusable across packages.

### Document types — UME has three

When adding a document on the UME side, the **Document Type** dropdown offers exactly three types:

*   **Print Form** — a form the student downloads, completes offline, and returns (the option reads "Applicant downloads and mails form").
    
*   **Outside Document** — a document or file the student supplies (the option reads "Applicant supplies own form"), most often returned by upload.
    
*   **Learning Module** — an online module created within MedHub that the student completes and attests to.
    

**UME onboarding does not offer dynamic forms or contracts.** Although the underlying document-type configuration list (`student_applications_docTypesA`) contains entries for Dynamic Form and Contract, these are not available in the UME interface and are not used on the student side. There is therefore no dynamic-form-to-demographics import on the UME side and no contract-signature workflow within UME onboarding. Do not document or assume either capability for UME.

### Return methods

The **Return Method** determines what the student must do and whether the item generates reminders:

*   **Mail Form** — the student mails a physical form.
    
*   **Upload** — the student uploads a file.
    
*   **Mail or Upload** — either is accepted.
    
*   **Electronic Signature** — used for signable documents.
    
*   **Mark Complete** — the student clicks a "Mark Complete" button; the item still requires Dean's Office review.
    
*   **Mark Complete (No Dean's Office Review)** — the student marks it complete and it is considered done without Dean's Office review.
    
*   **Dean's Office Task to Complete** — no student action is required; the Dean's Office completes the item. This does not generate reminder emails to the student.
    

### Additional Processing

The **Additional Processing** option links an approved requirement to a destination elsewhere in the student's profile — for example, "Use as demographics photo," a Certifications destination (OSHA Training, HIPAA Training, ACLS, BLS, Safety Training, etc.), or an Immunizations destination (TB Skin Test, Hep. B Vaccine, MMR Vaccine, Polio Vaccine, PPD Skin Test, Rubella Titer, Small Pox Vaccine, etc.). Additional Processing populates the destination only when the item is approved by the **Dean's Office or an Administrator**; the file does not flow if approved by a faculty reviewer (see the review/approval article).

### Multiple files

When multiple-file upload is enabled for an Upload requirement, the student can attach several files to one requirement; they must click to upload each file and then mark the requirement complete to submit it, because the system does not know how many files are intended until the student indicates completion.

### The Access matrix

Each document has an **Access** matrix that sets, per user type, what that user type can do with the item. The columns are **Full Access / Accept Documents**, **Upload Documents / Mark Submitted**, **Read-Only**, and **No Access**; the rows are the institution's user types (for example, Administrator, Dean's Office, and student-facing types). This matrix determines, for example, whether a coordinator can accept a document or only view it, and whether the student can see a given item.

* * *

## 4\. Requirement scoping: how package contents are tailored per student

A package is delivered as a whole, but not every requirement in it applies to every student. Each requirement carries its own scoping filters, set on the **Add Form/Document to Package** screen, evaluated against the individual student's profile and training/enrollment record at delivery (and at each update). A requirement appears in a student's package only if the student matches all of the requirement's scoping criteria.

The per-requirement scoping filters on the UME side are:

*   **Appointment Type** — All Appointment Types, or a chosen list. (This is the UME analog of a trainee/house-staff type.)
    
*   **Levels** — All Levels, or individual level checkboxes (for example, 0 through 5). The student's level/year is read from their training/enrollment record (see below).
    
*   **Citizenship** — a dropdown: all, or a specific citizenship value, read from the student's demographics.
    
*   **Course/Clerkship** — All Course/Clerkships, or a chosen list. A requirement can be limited to students associated with specific courses/clerkships.
    

UME requirement scoping does **not** include a Medical School filter. This is expected, not a gap: for a medical student, the institution is their medical school, so there is no medical-school attribute to scope on. The closest distinction — whether a student is the institution's own student or a visiting student from elsewhere — is handled by the **Appointment Type** filter (for example, a Visiting Medical Student type). UME scoping also has no program-based filter, because UME uses courses/clerkships rather than programs, and the Course/Clerkship filter groups students rather than binding requirements (see §5).

### Scoping resolves against the student's record

The Levels and Appointment Type scoping is evaluated against the **training/enrollment record** the delivery resolves to for that student; the student's level/year comes from that record, not from a standalone field. Because requirement scoping keys off the resolved record's level, the level a package treats a student as — and therefore which level-scoped requirements appear — follows that record. If a student's level is set incorrectly on the underlying record, the onboarding requirements will reflect the incorrect level (for example, a student who is actually a Year 4 but whose record resolves to Year 1 will be scoped as Year 1). The fix is to correct the level on the student's training/enrollment record, then update the package (see §8).

* * *

## 5\. Delivery and the filter system

This section explains the two-step assign/deliver workflow and the filters on the Delivery/Applications subtab, including how the **Course/Clerkship** filter behaves and how level resolves.

### The two-step model: assign, then deliver

Putting a package on a student is two separate actions:

1.  **Assign** — attaches the package to the student and sets a due date. **No email is sent.** The package now shows against the student's name and on their Orientation tab.
    
2.  **Deliver** — sends the delivery email (or surfaces the package in the student's Urgent Tasks — see §9 and §10) and opens the portal link. After delivery, the **Status** column shows "Delivered" with a link that staff can click and then enter the student's last name to preview exactly what the student sees.
    

Both actions are performed from the Action menu at the bottom of the Delivery/Applications subtab after checking the students to act on. The menu offers a deliver action and an assign-package section listing available packages, plus post-delivery actions (resend delivery email, change due date, update selected packages, unassign selected packages — see §8).

### The filters on the Delivery/Applications subtab

The filter bar contains:

*   **Course** — All Courses, or a specific course/clerkship.
    
*   **Status** — Not Assigned/Inactive, Assigned, Delivered, Complete, or All.
    
*   **Date Type** — selects which date field the date filter applies to (for example, Orientation Date, Active During Period, Due Date).
    
*   **Date value** — a single date or a date range, with date pickers.
    
*   **Limit to applications due in range** — a checkbox that further restricts results to packages whose due date falls within the entered range.
    
*   **Advanced Options** — exposes additional filters including **Student Type** (and a package selector).
    

The list columns mirror the student record: name, course/clerkship, student type, Orientation Date, Due Date, Package, Status, Delivery Date, and a Complete/Submitted/All progress count.

### Course is a filter, not a binding

The **Course** filter scopes **which students appear** in the list — it groups students by their course/clerkship association so the Dean's Office can act on a relevant set. **A package is not tied to a specific course.** Selecting a course (or "All Courses") changes who is listed, not what the package contains; package contents are determined by the per-requirement scoping in §4 evaluated against each student. Internally, the Course filter resolves to a clerkship identifier, and "All Courses" passes an all-value rather than a specific clerkship.

### How level resolves, and the Date Type filter

A student can have more than one training/enrollment record over time, and level/year comes from the applicable record. The Date Type filter (and the date value) determine which record period is in scope, and the resolved record's level then drives level-based requirement scoping (§4). Filtering by **Active During Period** with a given range resolves to the record active during that range; the level-scoped requirements resolve accordingly. As with GME, this is why the same package can treat a student as a different level depending on which record period the delivery resolves to — but on the UME side there is no dynamic form, so there is no separate "form shows a different level than the package" behavior to account for.

### Finding students without a package, and assigning a second package

Students with no package for the filtered criteria display with dashes ("- -") in the Package/Status columns — a clean row signaling you can assign a package. To assign an additional package to a student who already has one, filter with **Active During Period** over a narrow range plus **Limit to applications due in range** to surface a clean row, then assign and deliver the second package from the Action menu; or assign a new package directly from the student's **Orientation tab** using the assign-new-package control, then deliver from the delivery list.

### Standard assign-and-deliver sequence

1.  Open the Delivery/Applications subtab and filter to bring up students who do not yet have a package. Ensure the **Orientation Date** is populated on the student's record (it can be entered manually or batch-imported).
    
2.  Check the students to receive the package.
    
3.  From the Action menu, **assign** a package; enter the Due Date when prompted; submit. (No email is sent yet.)
    
4.  Check the same students; from the Action menu, **deliver**; confirm at the prompt. "Delivered" and a link now appear in the Status column.
    

* * *

## 6\. (Not applicable — dynamic forms)

UME onboarding does not use dynamic forms. The GME-side behavior in which a dynamic form's level value resolves independently of the delivered record does not exist on the UME side, because there are no dynamic forms to deliver. UME requirements are Print Forms, Outside Documents, and Learning Modules (see §3).

* * *

## 7\. (Not applicable — contracts)

UME onboarding does not deliver contracts. There is no contract document type in the UME interface and no contract-signature workflow within UME onboarding (see §3).

* * *

## 8\. Updating a package after delivery

Most changes to a package or its requirements after delivery do not automatically flow to already-delivered packages. Two Action-menu functions push changes; both are performed from the Delivery/Applications subtab after filtering to the student and checking their row.

### Update Selected Packages

Use **Update Selected Packages** after changing a package's contents or a requirement's configuration — for example: adding or removing a requirement, changing a requirement's appointment type/level/citizenship/course scoping, editing a requirement's instruction text, replacing an attached file, or correcting a profile/record value (such as level or citizenship) that determines whether a scoped requirement applies. After updating, the student receives an email notifying them their package has been updated and an Urgent Task to address it. (Editing the package-level Intro/Instructions flows without an update; editing a specific requirement's instruction text requires an update to flow.)

### Change Due Date

Use **Change Due Date** to change the due date on already-assigned/delivered packages: filter to the student, check the row, choose Change Due Date from the Action menu, enter the new date, and submit. Changing the package due date this way recalculates the individual requirement due dates. After any change to an already-delivered package, follow with **Update Selected Packages** so the change reaches the student.

* * *

## 9\. What the student experiences

### Accessing the package: the verification step

How a student identifies themselves to open their package is set by `setting_student_applications_method`:

*   **0 = instant access** — no identity step.
    
*   **1 = last name** (the default) — the student enters their last name.
    
*   **2 = last 4 of SSN** — the student enters the last four digits of their SSN.
    
*   **3 = student ID** — the student enters their student ID.
    

When the method is last name, the portal link opens a page prompting for the last name before showing the package contents.

### Authenticated vs. unauthenticated access

Whether the student reaches the package through the emailed link or through their Urgent Tasks depends on whether the system recognizes they have logged into MedHub before:

*   A student who has **never logged into MedHub** accesses the package through the **unauthenticated portal link** in the onboarding email (entering the verification value above).
    
*   A student who **has logged into MedHub before** accesses the requirements through their **Urgent Tasks** after logging in, not through an unauthenticated link. For these students, the delivery email instructs them to log in and follow the link on their home screen rather than providing a direct unauthenticated link (depending on the tokens used — see §10).
    

This is why a returning student may report that their email "has no link" while a new student's does: the system suppresses the unauthenticated link for someone it can authenticate, routing them through Urgent Tasks.

### Multiple packages: the toggle

When a student has more than one package assigned, they can switch between them using a toggle in the upper-left corner of the screen, above the institution name — but only when **logged into MedHub**. The toggle is not available when the student opens a package through the unauthenticated portal link in an email, because each delivered package has its own unique link (the encrypted `key` on `users_students_apps`). A student who clicks the emailed link for one package must log in to reach their other packages.

### Completing requirements

The student's portal lists the requirements with an Actions column, a Status column, and a Dean's Office–approved column. Depending on return method, the student uploads files, mails a form, completes a learning module online, marks an item complete, or signs a document. A package is **Complete** when every applicable requirement is completed, submitted, and/or marked complete by the Dean's Office.

* * *

## 10\. Notifications, emails, and tokens

### The delivery email and its tokens

The **Email Content** field on the package is the email sent at delivery. It supports tokens including `{FIRST_NAME}`, `{LAST_NAME}`, `{NAME}`, `{EMAIL}`, `{INSTITUTION}`, `{DIRECTIONS}` (itemized access instructions including the student's unique link and the verification prompt), and `{LINK}` (the direct portal link). The content of `{LINK}` is contained within `{DIRECTIONS}`, so an email needs only one of the two. The behavior differs by token in combination with login history (§9): with `{DIRECTIONS}`, a student who hasn't logged in sees the full directions plus a link, while one who has logged in sees instructions to log in (no unauthenticated link); with `{LINK}`, a direct link is shown regardless of login history but the Directions content is not. A package can be saved only if the Email Content includes `{LINK}` and/or `{DIRECTIONS}`.

The initial delivery email subject defaults to a Dean's Office registration message (`student_application_email_subject`).

### Reminder emails

Reminder behavior is configured per package: "Send reminder N days before due date" and an optional "Send weekly reminders" (weekly reminders are sent on Mondays). Reminders include the Reminder Text, a system-generated list of outstanding items, and the portal link. **Reminder emails do not support tokens.** Their content (pending items only, vs. pending and complete) is governed by `student_application_email_reminder_content`. Reminders are generated only for return methods that trigger them (not for Dean's Office Task to Complete).

### Update and comment emails

*   When a package update **adds** required documents, the student receives the update email (`student_application_email_update_message` / `student_application_email_update_subject`) and an Urgent Task.
    
*   When the Dean's Office adds a comment to a requirement, the student receives the comment email (`student_application_email_comment_message` / `student_application_email_comment_subject`).
    

### Student-side Urgent Tasks

A delivered (or updated) package surfaces to the student as an Urgent Task when they are logged in, and is the primary access path for students the system can authenticate (§9). The Dean's Office reviewer-side Urgent Task and approval workflow are documented in the review/approval article.

### The "Contact Dean's Office" link

The student portal includes a contact link at the bottom; which user type(s) receive these messages is governed by `setting_student_applications_contact_methods` (by default, the UME Applications contact). This link is built into the portal.

* * *

## 11\. Settings appendix

Settings related to creating and delivering UME onboarding packages. Settings governing review/approval are covered in the review/approval article.

Setting

What it controls

`setting_student_applications`

Enables the UME onboarding/applications module.

`term_student_applicationsStr`

The configured full name of the module (default "Student Applications").

`term_student_applicationsShortStr`

The configured short name used on subtabs (default "Applications").

`term_student_levelStr`

The configured term for a student's level (default "Year").

`student_applications_docTypesA`

The document-type configuration list. Although it contains Dynamic Form and Contract entries (inherited in the configuration), the UME interface exposes only Print Form, Outside Document, and Learning Module.

`student_applications_Statii`

The package status list (Inactive, Assigned, Delivered, Complete).

`setting_student_applications_method`

Student verification method to open the portal: 0 = instant access, 1 = last name, 2 = last 4 of SSN, 3 = student ID.

`setting_student_applications_modify`

Which user types can process a package on the student's Orientation tab.

`setting_student_applications_fileA`

Which user types can view applicant-submitted files.

`setting_student_applications_contact_methods`

Which user type(s) receive "Contact Dean's Office" messages from the student portal.

`setting_student_applications_display_fields`

Demographic fields to display as columns on the Applications screen.

`student_application_email_subject`

Subject of the initial delivery email.

`student_application_email_update_subject` / `student_application_email_update_message`

Subject/body of the email sent when an update adds required documents.

`student_application_email_comment_subject` / `student_application_email_comment_message`

Subject/body of the email sent when the Dean's Office adds a comment to a requirement.

`student_application_email_reminder_content`

Reminder email content: 1 = pending items only; 2 = pending and complete items.

* * *

## 12\. Database tables appendix

Tables that store UME onboarding package delivery and student completion data.

Table

What it holds

`users_students_apps`

The package **assigned to a student**: `userID`, `packageID`, `status`, `orientation_date`, `due_date`, `delivery_date`, and `key` (the encrypted unique access key behind each delivered package's link). The delivery/level-resolution behavior in §5 keys off this record.

`users_students_apps_docs`

Per-student requirement state within an assigned package: `status` (0 = unprocessed, 1 = incomplete/awaiting Dean's Office, 2 = complete, 3 = waived), `due_date`, `applicant_date` (student submission), `deans_office_date`, `deans_office_initials`, `deans_office_response`, `notes`, and `filename`. (The `documentID` column references a document definition; despite a column description inherited from the GME schema that mentions a "dynamic form," UME does not use dynamic forms — the referenced documents are Print Forms, Outside Documents, and Learning Modules.)

`users_students_apps_forms`

A join table carrying status for a delivered form. Its descriptions are inherited from the GME schema (including references to a "dynamic form" and to a "resident application"); UME onboarding does not deliver dynamic forms, so this table is not the storage behind any active UME dynamic-form feature.

> The package and document **definitions** (package settings, document/requirement definitions, and per-requirement scoping) are stored in the shared `admin_app_*` tables used by both sides of the platform; the UME-specific data above is the per-student assignment and completion state.

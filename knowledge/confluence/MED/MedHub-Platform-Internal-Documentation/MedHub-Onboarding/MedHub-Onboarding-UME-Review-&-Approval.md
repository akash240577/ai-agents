# MedHub - Onboarding - UME - Review & Approval

# MedHub — Onboarding: Reviewing & Approving Requirements (UME)

> **Scope.** This article covers the UME (medical student) side of _processing_ onboarding requirements after they are delivered: reviewing and approving submissions, individually and in batch; sending requirements back to students; faculty reviewers; and the reporting and export tools. The _creation and delivery_ of packages — building packages and documents, requirement scoping, delivery filters, student completion, and emails — is covered in the companion article _MedHub — Onboarding: Creating & Delivering Packages (UME)_, referenced here as "the creation/delivery article."
> 
> **This is a UME article and is self-contained.** It does not rely on the GME onboarding articles for any behavioral detail. The approving body on the UME side is the **Dean's Office** (not GME). Two capabilities present on the GME side are **absent on the UME side and are not covered here**: dynamic forms (and therefore any dynamic-form-to-demographics import on approval) and contracts. UME onboarding requirements are Print Forms, Outside Documents, and Learning Modules only.

* * *

## 1\. Overview: where approval happens

Once a package is delivered and a student begins submitting requirements, the Dean's Office processes each requirement — accepting it, waiving it, or sending it back for resubmission. There are **two surfaces** for this:

*   **The Requirements subtab** (within the onboarding module) — a per-requirement view across many students at once. This is the **batch** surface: select one requirement, filter to a set of students, and approve/waive/mark submitted/change due date for all selected at once.
    
*   **The student's Orientation tab** (within their student profile) — a per-student view showing all of that student's packages and requirements, used to process one student's items individually with full per-requirement control (status, approval date, response to applicant, notes).
    

Which user types can process requirements is governed by `setting_student_applications_modify`. Faculty reviewers are a separate, requirement-specific review role (see §6).

Because UME onboarding has no dynamic forms, the GME-side restriction that dynamic forms must be approved individually does not apply here — UME requirements (Print Forms, Outside Documents, Learning Modules) can be processed in batch or individually.

* * *

## 2\. Requirement status vocabulary

A requirement moves through a small set of statuses. The status values set on a requirement (the Status dropdown on the Orientation tab) are:

*   **Requested** — outstanding/awaiting the student. Setting an item back to Requested is how you send it back (see §5). A Response to Applicant is displayed to the student only when the item is in Requested status.
    
*   **Submitted** — the student has submitted; the item awaits Dean's Office review.
    
*   **Complete** — approved/accepted; setting Complete records an Approval Date and the approver's initials.
    
*   **Waived** — waived; no longer outstanding and no longer generating reminders.
    

In the underlying record (`users_students_apps_docs.status`), these map to: 0 = unprocessed (not completed by the applicant), 1 = incomplete (completed by the applicant but not yet approved by the Dean's Office), 2 = complete (completed by applicant and Dean's Office), 3 = na/waived.

The export and filter views describe the same lifecycle as "Waiting for applicant submission" (Requested), "Ready for review/approval" (Submitted), "Waiting for applicant resubmission" (Requested again after being sent back), and "Document processed and complete" (Complete). A package as a whole is **Complete** only when every applicable requirement is completed, submitted, and/or marked complete.

* * *

## 3\. Individual approval on the Orientation tab

The Orientation tab on a student's profile lists all packages assigned to that student, grouped by package (each showing its Orientation Date and due date and whether it is complete or incomplete). Each package group has its own controls — **Print Missing**, **Download Files**, **Logins**, and **show/hide** — plus a Status column with a **\[key\]** to the status icons.

*   **Print Missing** produces a PDF of all incomplete documents for the student across all of that student's packages; to exclude items, waive them so they are no longer counted as missing.
    
*   **Download Files** retrieves the student's uploaded files.
    
*   **show/hide** expands or collapses the requirement detail.
    

### The per-requirement panel

Clicking a requirement's status expands an editing panel with these fields:

*   **Applicant Submission** — whether the student has submitted, with a file indicator and a link to the uploaded file when present.
    
*   **Date** — the student's submission date.
    
*   **Due Date** — the requirement's due date (editable here).
    
*   **Status** — the dropdown from §2 (Requested / Submitted / Complete / Waived).
    
*   **Upload File** — a checkbox to upload a file on the student's behalf.
    
*   **Approval Date** — recorded when Status is set to Complete.
    
*   **Stored Responses** — a dropdown of prepared response messages (see §5); selecting one populates Response to Applicant.
    
*   **Response to Applicant** — free text shown to the student only when the item is set to Requested.
    
*   **Send Response as Email** — when checked, the Response to Applicant is emailed to the student.
    
*   **Notes** — internal notes.
    

Click **Save** to apply. When an item is approved, the student's view and the matrix show the approver's initials (the Dean's Office initials, stored in `deans_office_initials`) and the approval date.

### Re-approving with a new date

A change to the Approval Date is recorded when the **status changes** (for example, Submitted to Complete). To re-approve an already-Complete item with a new approval date, set it back to Submitted, save, then set it to Complete with the new Approval Date and save. (On the Requirements subtab, processing a requirement sets the Approval Date to the current date automatically.)

### Unassigning a package via the Orientation tab

A package can be unassigned only when none of its requirements have been submitted, completed, or approved. To clear a package whose items have been processed, set each requirement back to an incomplete state on the student's Orientation tab (removing the approval date and setting the status to Waived or Requested/Submitted), save, then return to the Delivery/Applications subtab and unassign the package.

* * *

## 4\. Batch approval on the Requirements subtab

The Requirements subtab processes one requirement across many students at once. Its filters include **Package**, **Requirement** (select one), **Course/Clerkship**, **Student Type**, **Status**, and a **Due Dates** range. After submitting the filters, matching students list with their level/year, type, submission and status detail. To process in batch:

1.  From the Requirement dropdown, select the document to process.
    
2.  Apply the other filters to bring up the intended students and submit.
    
3.  Check each student, or use the header checkbox to select all.
    
4.  From the action menu, choose the action — approve, waive, submitted, or change due date.
    
5.  Submit.
    

Processing a requirement from this subtab sets its Approval Date to the current date.

* * *

## 5\. Sending a requirement back, and Stored Responses

To return a requirement for correction, set its Status to **Requested** and enter a message in **Response to Applicant**, which is displayed to the student while the item is in Requested status. Check **Send Response as Email** to also email it.

### Stored Responses

The **Stored Responses** dropdown offers prepared content that can be inserted into Response to Applicant when a requirement is sent back. Stored Responses are managed in List Management (under the configured "Stored Responses" list for the student onboarding module), where each response has a Title, Content, Status, and display Order, with a Modify action. Selecting a Stored Response in the per-requirement panel populates the Response to Applicant text, which can be edited before saving. Typical uses include standardized instructions for re-completing a module, requesting a missing signature, or asking for a corrected document.

* * *

## 6\. Faculty reviewers

Faculty reviewers let users outside the Dean's Office — for example, a course director or department staff member — review and approve specific onboarding documents.

### Setting up a faculty reviewer

A reviewer must have a **faculty account**. If the person does not already have one, create the faculty account first, then designate them on the specific document:

1.  Open the onboarding module and go to the **Forms and Documents** subtab.
    
2.  Click **Modify** next to the form/document.
    
3.  Scroll to the **Faculty Reviewers** field and click **+Add New Reviewer**.
    
4.  Select the person's name.
    
5.  Optionally enable **Allow faculty reviewers to view SSN and Empl. ID** and/or **Notify reviewer(s) on resident submission** (when notification is enabled, a field appears for the reviewer's email and the reviewer is emailed on each student submission of that document).
    

Because faculty accounts can clutter real course/clerkship lists, some institutions create a dedicated placeholder grouping to hold reviewer accounts. A reviewer added after delivery still works for items not yet completed, because the system checks for a reviewer when the item is completed, not at delivery.

### How a reviewer processes documents

When a student submits a document that has a faculty reviewer, an alert flows to the reviewer's **Urgent Tasks** under the onboarding reviews task. The reviewer opens the submitted documents and approves or rejects them, individually or in batch.

### Reviewer limitations

*   **Additional Processing does not run on reviewer approval.** When a requirement is configured with Additional Processing (to post a file to a Certifications/Immunizations destination or as the demographics photo), the destination is populated only when the **Dean's Office or an Administrator** accepts the document — not when a faculty reviewer accepts it. Requirements with Additional Processing should not be assigned to faculty reviewers.
    
*   **"Waiting for resubmission" requires a response.** When the Dean's Office sets a reviewer's item back to Requested with a Response to Applicant, it shows in the reviewer's "waiting for resubmission" view; set back without a response, it shows as Incomplete and is found via the "waiting for submission" filter.
    
*   **Document visibility is broad.** A reviewer's visible document list is limited by whether a document is hidden and tied to the institution, not by which specific reviewer they are, so a reviewer may see documents beyond those assigned to them.
    

* * *

## 7\. Reporting and review tools

### Document Matrix

The Document Matrix (reached from the onboarding module) shows requirement status across students in a grid, filtering by Document(s), Course/Clerkship, and Package(s), with display options for submission date, approver initials, and student start date. The matrix reflects only requirements that are part of an onboarding **package**, so its counts can differ from other completion reports that count items delivered outside the package (for example, the Completed Learning Modules report).

### Orientation – Missing Documents

The Orientation – Missing Documents report lists students with outstanding onboarding documents, filtering by Orientation Date, Course/Clerkship, Documents (for example, "Missing Application Documents"), and a Display option (for example, "Only Students w/ Missing Documents"), returning each student with type, ID, course/clerkship, and a count of missing documents.

### Export Document Information

Export Document Information produces a spreadsheet of package documents and their processing state, filtering by Course/Clerkship, Student type, Filter By Dates, the date value, Package, Delivery dates, **Document status** (Waiting for applicant submission / Ready for review/approval / Waiting for applicant resubmission / Document processed and complete — by default, not-yet-processed documents are selected), and Document options. Use the **Document status** filter to change what is exported (for example, only items Ready for review/approval).

* * *

## 8\. Settings appendix

Settings relevant to reviewing and approving UME onboarding requirements. Creation/delivery settings are in the creation/delivery article.

Setting

What it controls

`setting_student_applications_modify`

Which user types can process a package's requirements on the student's Orientation tab.

`setting_student_applications_fileA`

Which user types can view applicant-submitted files.

Faculty-reviewer configuration (reviewer list, SSN/employee-ID visibility, submission notification) is stored on each document rather than as institution-wide settings; see §6 and the database appendix.

* * *

## 9\. Database tables appendix

Tables that store UME onboarding review/approval data.

Table

What it holds

`users_students_apps_docs`

Per-student requirement processing state within an assigned package: `status` (0 = unprocessed, 1 = incomplete/awaiting Dean's Office, 2 = complete, 3 = waived), `due_date`, `applicant_date` (student submission date), `deans_office_date` (Dean's Office approval date), `deans_office_initials` (approver initials), `deans_office_response` (response to applicant), `notes`, and `filename`. This is the core review/approval record.

`users_students_apps`

The package assigned to a student (status, orientation/due/delivery dates, encrypted access key). Referenced here for the per-student package context; covered in the creation/delivery article.

`users_students_apps_forms`

A join table carrying status for a delivered form; its descriptions are inherited from the GME schema and UME does not deliver dynamic forms, so it is not the storage behind any active UME form-import feature.

> The document/requirement **definitions**, including faculty-reviewer configuration and Additional Processing destinations, are stored in the shared `admin_app_*` tables used by both sides of the platform; the UME-specific data above is the per-student processing state.

# MedHub - Onboarding - GME - Review & Approval

# MedHub — Onboarding: Reviewing & Approving Requirements (GME)

> **Scope.** This article covers the GME (resident/fellow) side of _processing_ onboarding requirements after they are delivered: reviewing and approving submissions, individually and in batch; sending requirements back to trainees; how approving a dynamic form populates the demographics profile; faculty reviewers; and the reporting and export tools used to track outstanding items. The _creation and delivery_ of packages — building packages and documents, requirement scoping, delivery filters, trainee completion, and emails — is covered in the companion article _MedHub — Onboarding: Creating & Delivering Packages (GME)_, referenced here as "the creation/delivery article." **Contract signature and contract approval** are documented in the dedicated _Contracts (GME)_ article; this article covers only how a contract requirement appears among other requirements being processed.
> 
> A UME (student) companion article is planned and is not yet written. The student side uses parallel but distinct settings and tables (for example, Dean's Office approval fields rather than GME approval fields); do not apply this behavior to the UME side without confirmation.

* * *

## 1\. Overview: where approval happens

Once a package is delivered and a trainee begins submitting requirements, the GME office processes each requirement — accepting it, waiving it, or sending it back for resubmission. There are **two surfaces** for this, and they behave differently:

*   **The Requirements subtab** (within the onboarding module) — a per-requirement view across many trainees at once. This is the **batch** surface: select one requirement type, filter to a set of trainees, and approve/waive/mark submitted/change due date for all selected at once.
    
*   **The trainee's Orientation tab** (within their Resident Demographics profile) — a per-trainee view showing all of that trainee's packages and requirements. This is the **individual** surface, used to process one trainee's items with full per-requirement control (status, approval date, response to applicant, notes).
    

Which user types can process requirements is governed by `setting_resident_applications_modify` (access to process a package on the Orientation tab). Faculty reviewers are a separate, requirement-specific review role (see §7).

One important constraint determines which surface you must use for a given item: **dynamic forms cannot be approved in batch.** A dynamic form must be approved individually from the trainee's Orientation tab, because approving it can overwrite demographics data and the approver is expected to view the submission before approving (AMBS-8249). Non–dynamic-form requirements can be processed either in batch or individually.

* * *

## 2\. Requirement status vocabulary

A single requirement on a trainee moves through a small set of statuses. The same underlying states appear under different labels depending on where you are in the system, so both vocabularies are given here.

The **status values** set directly on a requirement (the Status dropdown on the Orientation tab) are:

*   **Requested** — the item is outstanding/awaiting the trainee. Setting an item back to Requested is how you send it back to the trainee (see §5). A Response to Applicant is displayed only when the item is in Requested status.
    
*   **Submitted** — the trainee has submitted the item; it is awaiting GME review/approval.
    
*   **Complete** — the item is approved/accepted. Setting Complete records an Approval Date and the approver's initials.
    
*   **Waived** — the item is waived; it no longer counts as outstanding and stops generating reminders.
    

The **status names used in the Export Document Information filter and exports** describe the same lifecycle from the workflow's point of view:

Export status name

Equivalent requirement state

Waiting for applicant submission

Requested (not yet submitted)

Ready for review/approval

Submitted (awaiting GME)

Waiting for applicant resubmission

Requested again after being sent back

Document processed and complete

Complete

In the per-trainee export, a submitted-but-not-yet-approved item is flagged as "Submitted to GME, Awaiting Approval" and highlighted, and a "Waiting for GME" column indicates whether the item is sitting in the GME queue. A dynamic-form submission appears in the export as "Submitted online (Dynamic form)."

A package as a whole is **Complete** only when every applicable requirement in it is completed, submitted, and/or marked complete (see the creation/delivery article for package-level completion and the per-trainee progress count shown as Complete/Submitted/All).

* * *

## 3\. Individual approval on the Orientation tab

The Orientation tab on a trainee's Resident Demographics profile lists all packages assigned to that trainee, grouped by package (for example, "2026 Annual" and "2025 Annual"), each showing its Orientation Date and Application Due date and whether it is complete or incomplete. Each package group has its own controls: **Print Missing**, **Download Files**, **Logins**, and **show/hide**, plus a Status column with a **\[key\]** to the status icons.

*   **Print Missing** produces a PDF of all incomplete documents for the trainee. Note that Print Missing includes **all** missing requirements across **all** packages assigned to the trainee, regardless of package; if you do not want certain items included, waive them so they are no longer counted as missing.
    
*   **Download Files** retrieves the trainee's uploaded files.
    
*   **Logins** relates to the trainee's portal access.
    
*   **show/hide** expands or collapses the requirement detail.
    

### The per-requirement panel

Clicking a requirement's status (for example, the "GME review/approval" or "Incomplete" status link) expands an editing panel with these fields:

*   **Applicant Submission** — indicates whether the trainee has submitted, with a "File Uploaded" indicator and a link to the uploaded file when present.
    
*   **Date** — the trainee's submission date (blank if not yet submitted).
    
*   **Due Date** — the requirement's due date (editable here).
    
*   **Status** — the dropdown described in §2 (Requested / Submitted / Complete / Waived).
    
*   **Upload File** — a checkbox to upload a file on the trainee's behalf.
    
*   **Approval Date** — the date the item is approved. When you change Status to Complete, this records the approval date.
    
*   **Stored Responses** — a dropdown of prepared response messages (see §5); selecting one populates the Response to Applicant field.
    
*   **Response to Applicant** — free text sent to the trainee; **displayed to the trainee only when the item is set to Requested**.
    
*   **Send Response as Email** — a checkbox; when checked, the Response to Applicant is emailed to the trainee.
    
*   **Notes** — internal notes on the item.
    

After editing, you click **Save** (top right) to apply. When an item is approved, the trainee's view and the matrix show the approver's initials and the approval date (for example, "10/14/2025 SH").

### Approving on a later date / re-approving

Because the Approval Date on the Orientation tab is a field you control, a change to the Approval Date is only recorded when the **status is changing** — for example, from Submitted to Complete. Re-saving an item that is already Complete with a new Approval Date does **not** update the date. To re-approve an already-Complete item with a new approval date, set the item back to Submitted, save, then set it to Complete while entering the new Approval Date, and save (AMBS-8472). (On the Requirements subtab, updating a requirement automatically sets the Approval Date to the current date.)

### Unassigning a package via the Orientation tab

A package can be unassigned only when none of its requirements have been submitted, completed, or approved. To clear a package whose items have been processed: on the trainee's Orientation tab, set each requirement back to an incomplete state — for items with an approval date, remove the approval date and set the status to Waived (or Requested/Submitted) — and save, then return to the Delivery/Applications subtab and unassign the package. If the package shows no requirements underneath it at all, none of its requirements matched the trainee's scoping; see the creation/delivery article (requirement scoping) for resolving that case.

* * *

## 4\. Batch approval on the Requirements subtab

The Requirements subtab processes one requirement across many trainees at once. Its filter bar is distinct from the Delivery/Applications subtab:

*   **Package** — all packages, or one.
    
*   **Requirement** — the specific document/requirement to process (select one).
    
*   **Program** — all programs, or selected.
    
*   **Trainee Types** — all house staff types, or selected.
    
*   **Status** — all status types, or a specific status (used, for example, to pull everyone in Submitted status for a given requirement).
    
*   **Due Dates** — a date range.
    

After submitting the filters, the matching trainees list with columns for Resident, Program, Level, Trainee Type, Employee ID, Status, Due, Submitted, Documents, and Notes. To process in batch:

1.  From the Requirement dropdown, select the document to process.
    
2.  Apply the other filters to bring up the intended trainees and submit.
    
3.  Check each trainee, or use the header checkbox to select all.
    
4.  From the action menu at the bottom, choose the action — **approve**, **waive**, **submitted**, or **change due date**.
    
5.  Submit.
    

Updating a requirement from this subtab automatically sets its Approval Date to the current date.

> **Dynamic forms are excluded from batch approval.** As noted in §1, a dynamic form must be approved individually from the Orientation tab. If an Administrator is set up to approve a dynamic form, they are taken to the trainee's Orientation tab and must approve it there item-by-item; a batch checkbox does not apply to dynamic forms (it appears, grayed out, only after the form has already been approved) (AMBS-8249).

> **A note on Requested vs. Submitted in this view.** Whether a "GME Task to Complete"–style item appears under the Requested or Submitted filter can depend on the item's processing state — re-saving a requirement that carries an approval date can move it between the Requested and Submitted lists. When auditing a requirement across trainees, check both statuses if a trainee is missing from the list you expected (AMBS-9042).

* * *

## 5\. Sending a requirement back, and Stored Responses

To return a requirement to the trainee for correction or resubmission, set the item's Status to **Requested** and enter a message in **Response to Applicant**; this message is displayed to the trainee when the item is in Requested status. Check **Send Response as Email** to also email the message. (For the interaction between sending an item back and the faculty-reviewer "waiting for resubmission" view, see §7.)

### Stored Responses

Rather than retyping common messages, the **Stored Responses** dropdown offers prepared content that can be inserted into Response to Applicant when a requirement is rejected/sent back. Stored Responses are managed in List Management under **Trainee Requirements – Stored Responses** (`admin_lists_application_responses.mh`), where each response has a Title, Content, Status, display Order, and a Modify action. They are stored in `admin_app_stored_responses`. Typical uses include standardized instructions for re-completing a specific module, requesting a missing signature, or asking the trainee to add a Foreign Medical School name — any message the office sends repeatedly. Selecting a Stored Response in the per-requirement panel populates the Response to Applicant text, which can then be edited before saving.

* * *

## 6\. How approving a dynamic form populates the demographics profile

Approving a dynamic form is not only an acceptance step — it is the point at which the data the trainee entered is written into their MedHub profile. Understanding this is essential because approval can overwrite existing profile data.

### The import happens on approval, not on submission

A dynamic form's field values are stored when the trainee submits, but they are **imported into the demographics profile when the GME office (or an Administrator) approves the form**. Approving on the Orientation tab triggers this import. Because of this, MedHub displays a warning when approving a dynamic form that approval will overwrite Resident Demographics account data — this is expected, and is the reason dynamic forms are approved individually rather than in batch (§1, §4).

### Field mapping and "overwrite existing values"

Each field on a dynamic form is mapped to a destination field in the demographics profile (the mapping is part of the form's configuration). When the form is approved:

*   Mapped values flow to their destination fields.
    
*   Each field's mapping carries an **"overwrite existing values"** configuration that determines whether the imported value replaces a value already present on the profile. When configured to overwrite, approval replaces the existing demographics value with the form value; otherwise an existing value is preserved. This behavior applies consistently to returning trainees as well as new ones.
    

Two mapping behaviors are important to know when diagnosing unexpected results:

*   **Two fields mapped to the same database column append.** If more than one form field is mapped to the same demographics column, their values are concatenated rather than one taking precedence. Mapping multiple visible/hidden fields to a single destination column is therefore not a sound configuration (AMBS-4218).
    
*   **Training-history values create training-history records.** A form's training-history section, on approval, creates or updates the trainee's training-history records (stored in `users_residents_pg` and the appointment-percentage child `users_residents_pg_appt`) (AMBS-7050).
    

### What is and is not controlled by the form

Some fields are controlled by the form on approval; others are not:

*   Fields the form is configured to import (for example, SSN, demographics fields, education, certifications via Additional Processing, and training-history records) are written/overwritten per the mapping on approval.
    
*   The trainee **name** shown on a dynamic form is controlled by the GME office via the trainee's Demographics tab, not imported from the form. If a name needs to change after a form has been approved, correcting the Demographics profile is what updates it; to make the corrected name appear on the form's PDF, set the requirement back to Requested, edit the name on the profile, then set it back to Submitted and approve again (AMBS-11831).
    
*   The **PGY level (and program) shown on a dynamic form** is **not** drawn from the specific delivered training-history record. As documented in the creation/delivery article (the dynamic form exception), a dynamic form always reflects the trainee's current training-history record (or the upcoming one if there is no current record). This is unrelated to the import-on-approval behavior above and is current, expected behavior — see _MedHub — Onboarding: Creating & Delivering Packages (GME)_ for the full explanation.
    

### Data-entry caveats that affect the import

*   If a trainee copies and pastes a value such as an SSN into a dynamic form, hidden characters can be carried in; on import this can corrupt the stored value (for example, causing the Ad Hoc Resident Demographics report to display unexpected characters). The resolution is to set the form back to Requested, re-enter the value directly in the form, and re-approve.
    
*   If the Education information is already present in MedHub and the form is configured to show Education read-only, the trainee cannot edit those fields and the system cannot enforce them as required — so a form can be submitted without education dates in that configuration.
    
*   When a requirement uses **Additional Processing** to post a file to a destination tab (Certifications, Immunizations, Test Scores), that posting occurs only when **GME or an Administrator** approves it. If a **faculty reviewer** approves the item, the file does not flow to the destination field (see §7).
    

* * *

## 7\. Faculty reviewers

Faculty reviewers let users outside the GME office — for example, an HR staff member or a department reviewer — participate in reviewing and approving specific onboarding documents.

### Setting up a faculty reviewer

A reviewer must have a **faculty account**. If the person does not already have one, create the faculty account first, then designate them as a reviewer on the specific document:

1.  Open the onboarding module and go to the **Forms and Documents** subtab.
    
2.  Click **Modify** next to the form/document.
    
3.  Scroll to the **Faculty Reviewers** field and click **+Add New Reviewer**.
    
4.  Select the person's name.
    
5.  Optionally enable **Allow faculty reviewers to view SSN and Empl. ID** and/or **Notify reviewer(s) on resident submission**. If you enable the notify option, a field appears to enter the reviewer's email address, and the reviewer receives an email each time a trainee submits that document.
    

Reviewer designations and options are stored on the document definition (`admin_app_documents`: `faculty_reviewers`, `eidssn` for SSN/employee-ID visibility, `email_faculty`/`faculty_email` for notification). Because faculty accounts can clutter real programs, some offices create a dedicated placeholder program (for example, named "Faculty Reviewers") to hold these accounts.

A faculty reviewer added to a requirement **after** the package is delivered still works for items not yet completed: the system checks whether a requirement has a reviewer at the time the item is **completed**, not at delivery. It does not retroactively route items the trainee already completed.

### How a reviewer processes documents

When a trainee submits a document that has a faculty reviewer, an alert flows to the reviewer's **Urgent Tasks** under **Trainee Onboarding Reviews**. Clicking the task opens the submitted documents, which the reviewer can approve or reject — individually or in batch. The "Notify reviewer(s) on resident submission" option additionally emails the reviewer on each submission.

### Reviewer limitations

*   **Additional Processing does not run on reviewer approval.** When a requirement is configured with Additional Processing (to post a file to Certifications, Immunizations, or Test Scores), the destination field is populated only when **GME or an Administrator** accepts the document — not when a faculty reviewer accepts it. Requirements with Additional Processing should therefore not be assigned to faculty reviewers (AMBS-8347).
    
*   **"Waiting for resubmission" requires a response.** When GME sets a reviewer's item back to Requested, the item shows in the reviewer's "waiting for resubmission" filter only if a Response to Applicant was entered (so the item shows as "GME responded"); if the item is set back to Requested without a response, it shows as Incomplete and the reviewer can locate it only via the "waiting for submission" filter.
    
*   **Document visibility is broad.** The list of documents a reviewer can see is limited only by whether a document is hidden and tied to the institution — not by which specific reviewer they are; a reviewer may therefore see documents beyond those they were assigned. The same broad-visibility behavior applies to the Document Matrix for administrative users across programs (see §8) (AMBS-7886).
    

* * *

## 8\. Reporting and review tools

### Document Matrix

The Document Matrix (`admin_applications.mh`, reached from the onboarding module) shows requirement status across trainees in a grid. It filters by **Document(s)** (by type, e.g., the Dynamic Form group), **Program(s)**, and **Package(s)**, with display options:

*   **Display submission date for submitted documents**
    
*   **Display initials of approver on approved documents**
    
*   **Display resident start date**
    

The Document Matrix reflects only requirements that are part of an onboarding **package**, which is why its counts can differ from other completion reports that look at items delivered outside the onboarding package (for example, the Completed Learning Modules report counts modules sent from the Learning Modules page, while the Document Matrix counts modules sent as onboarding requirements).

Note the visibility behavior: an administrative user may see onboarding requirements for trainees in programs they do not have access to in the Document Matrix. This is current behavior (AMBS-7886).

### Orientation – Missing Documents

The Orientation – Missing Documents report (`admin_cc_missing.mh`, under Residents/Orientation) lists trainees with outstanding onboarding documents. It filters by **Orientation Date**, **Program**, **Documents** (e.g., "Missing Application Documents"), and **Display** (e.g., "Only Trainees w/ Missing Documents"), and returns each trainee with their type, employee ID, program, and a count of missing documents. It is the fastest way to see who still has outstanding items for a given orientation date.

> A separate **Missing Documents** tool predates the current onboarding functionality and is driven by the `setting_demo_requireddocs` root setting and the "Required Documents by Trainee Type" list (List Management). When that setting is enabled, those required documents appear on the Orientation tab beneath the onboarding package and can be flagged as missing even when the onboarding package itself is complete. These are not onboarding-package requirements; see the creation/delivery article's settings appendix.

### Export Document Information

Export Document Information (the Export from the Delivery/Applications subtab) produces a spreadsheet of package documents and their processing state. It filters by Program, Trainee type, Filter By Dates (e.g., Orientation Date), the date value, Package, Delivery dates, **Document status** (Waiting for applicant submission / Ready for review/approval / Waiting for applicant resubmission / Document processed and complete — by default, not-yet-processed documents are selected), and Document options. The export's columns include Orientation Date, name, Department, Program, Trainee Type, Level, Package, Document Title, Package Status, Program Access, GME Access, and a "Waiting for GME" indicator; submitted-but-unapproved items are flagged "Submitted to GME, Awaiting Approval," and dynamic-form submissions show as "Submitted online (Dynamic form)." Use the **Document status** filter to change what is exported (for example, to export only items Ready for review/approval).

### Notification of submitted documents

The "MedHub – Applicant document submission report" email notification goes to the GME users identified in the Institution Settings → Alerts → Institutional Alerts → Resident Applications field. (The reviewer-side notification — "Notify reviewer(s) on resident submission" — is separate and configured per document; see §7.)

* * *

## 9\. Settings appendix

Settings relevant to reviewing and approving GME onboarding requirements. Settings for creating and delivering packages are in the creation/delivery article; contract-specific settings are in the _Contracts (GME)_ article.

Setting

What it controls

`setting_resident_applications_modify`

Which user types can process a package's requirements on the trainee's Orientation tab.

`setting_resident_applications_fileA`

Which user types can view applicant-submitted files.

`setting_last4ssn`

Displays only the last four digits of the SSN to program administrators (where they have SSN access).

`setting_residents_ssn_view`

Whether residents can see their own SSN on the Review Records page.

`setting_demo_requireddocs`

Enables the legacy "Required Documents by Trainee Type" section on the Orientation tab — separate from onboarding packages and a source of "missing documents" that are not package requirements.

Institution Settings → Alerts → Resident Applications

The GME users who receive the "Applicant document submission report" notification (institutional alert configuration, not a single backend setting).

Faculty-reviewer configuration (reviewer list, SSN/employee-ID visibility, submission notification) is stored on each document rather than as institution-wide settings; see §7 and the database appendix.

* * *

## 10\. Database tables appendix

Tables that store GME onboarding review/approval data and the demographics destinations written on dynamic-form approval.

Table

What it holds

`users_residents_apps_docs`

Per-trainee requirement processing state within an assigned package: status, due date, applicant submission date (`applicant_date`), GME approval date (`gme_date`), GME approver initials (`gme_initials`), GME response to applicant (`gme_response`), approval notes, and uploaded filename. This is the core review/approval record.

`users_residents_apps_forms`

The delivered dynamic form per trainee, with its completion status (not opened / completed / started but not completed), start/end dates, and an import error log.

`users_residents_apps_fields`

The field values a trainee entered on a dynamic form; these are imported into demographics on approval.

`admin_app_documents`

The document/requirement definition, including the faculty-reviewer configuration: `faculty_reviewers`, `eidssn` (reviewer SSN/employee-ID visibility), `email_faculty`/`faculty_email` (reviewer notification), and `post_action` (Additional Processing destination).

`admin_app_stored_responses`

The prepared "Stored Responses" used when sending a requirement back to a trainee (Title, Content, Status, Order).

`users_residents_pg`

Training-history (post-graduate) records. A dynamic form's training-history section creates/updates these on approval.

`users_residents_pg_appt`

The appointment-percentage child of the training-history record, also written on approval of a training-history form section.

`stats_usage_applications`

Audit trail of trainee portal login/verification attempts (referenced in the creation/delivery article; useful when confirming whether a trainee accessed the portal before a submission dispute).

# MedHub - Onboarding - GME - Packages, Delivery

# MedHub — Onboarding: Creating & Delivering Packages (GME)

> **Scope.** This article covers the GME (resident/fellow) side of onboarding: building packages and the documents inside them, scoping requirements to the right trainees, delivering packages, what trainees see and do, and the emails and Urgent Tasks involved. The **review and approval** side of onboarding — faculty reviewers, batch and individual approval, the dynamic-form-approval-to-demographics overwrite, and the Document Matrix — lives in a separate companion article, _MedHub — Onboarding: Reviewing & Approving (GME)_. **Contract setup, signature workflow, and contract maps** are documented in the dedicated _Contracts (GME)_ article; this article covers only the delivery of a contract that is already mapped, as one requirement type inside a package.
> 
> A UME (student) companion article is planned and is not yet written. Do not apply the behavior described here to the UME side without confirmation; although the two share underlying mechanics, the settings, terminology, and some behaviors differ.

* * *

## 1\. Overview and terminology

Onboarding is the module GME offices use to collect the documents, forms, signatures, training modules, and contracts a trainee must complete before (and during) their appointment. A set of these requirements is bundled into a **package**, which is **assigned** to trainees and then **delivered** to them. Delivery generates a personalized link and an email; the trainee completes the requirements in a web portal; the GME office (and optionally faculty reviewers) approves what comes back.

### The module name is configurable

The label for this module is set per institution and is not fixed. The root setting `term_resident_applicationsStr` controls the full name and `term_resident_applicationsShortStr` controls the short name used on subtabs. Common values include **Trainee Applications**, **Trainee Onboarding**, **Trainee Requirements**, and **Resident Onboarding**. Because of this, the same screen may be called "Applications" at one institution and "Delivery" at another. Throughout this article, the navigation paths use generic names; substitute the institution's configured term.

The reminder email subject line follows the configured term as well: it uses whatever is stored in `term_resident_applicationsStr` with "Reminder" appended (AMBS-10598).

### Where it lives

The module is reached from the GME Office home page (under Resident Management, using the institution's configured link name). It opens to a set of subtabs:

*   **Delivery** (sometimes labeled "Applications") — the list of trainees and their assigned/delivered packages; where assigning, delivering, updating, and changing due dates happen.
    
*   **Requirements** — a per-requirement view across trainees, used for processing individual items (covered in the companion approval article, with the filter set noted in §10 here).
    
*   **Manage Packages** — where packages are created, configured, and have requirements added to them.
    
*   **Forms and Documents** — the library of reusable document/requirement definitions (dynamic forms, print forms, outside documents, contracts, learning modules).
    

### Who has access

Access to the module is governed by `setting_resident_applications` (enables the module) and related access settings. The behavior differs by role in one important way:

*   When a **GME Office** user opens the Delivery/Applications subtab, the trainee list **pre-populates automatically**.
    
*   When an **Administrator** (program coordinator) opens the same subtab, the list does **not** pre-populate. The administrator must apply filters and submit to bring up trainees. This is by design, not a defect (AMBS-4981).
    

Which user types can process a package on a trainee's Orientation tab is controlled by `setting_resident_applications_modify`; which user types can view applicant-submitted files is controlled by `setting_resident_applications_fileA`.

* * *

## 2\. Packages: standard vs. custom

A package is the parent container for a set of requirements. Each package has a type, stored in `admin_app_packages.package_type`.

**Standard package.** The default package type. An institution may have only **one** active standard package at a time. When a new standard package is created, the previously active standard package is automatically moved to **Archived** status. A package can therefore show as "Archived" while still appearing "Active" in some views — this is the expected result of creating a newer standard package.

**Custom package.** A custom package remains in effect until it is explicitly inactivated. An institution may have **more than one** custom package active at the same time. Custom packages are used when different populations need different requirement sets (for example, an annual reappointment package alongside a new-hire package, or a separate package for off-cycle or visiting trainees).

The Manage Packages subtab lists every package with its effective date, status (Active/Inactive), the count of forms/documents it contains, and the count of trainees it has been delivered to. Copying is supported: when creating a new package, the **Copy From** dropdown lets you start from an existing package (for example, to make a new academic-year version of last year's package) — there is no charge for copying a package to a new year.

### Package-level settings

Configured on the Manage Packages subtab when you create or modify a package (stored in `admin_app_packages`):

*   **Package Name** — the title trainees and staff see.
    
*   **Institution(s)** — for split institutions, the institution the package belongs to.
    
*   **Type** — Standard or Custom (see above).
    
*   **Effective Date** (`date_effective`) — the date the package becomes usable.
    
*   **Due Date** (`due_days`) — set as a number of days **before the trainee's Orientation Date**. Because the due date is derived from the Orientation Date, the value stored on each delivered package depends on the trainee having an Orientation Date on file (see §5 and §6). The due date can also be a fixed date or the package due date, depending on how it is configured per requirement.
    
*   **Intro/Instructions** (`intro`) — static text displayed at the top of the trainee's portal. Editing this field flows to already-delivered packages **without** requiring a package update.
    
*   **Directions** — the text substituted into the `{DIRECTIONS}` token in the delivery email (see §11).
    
*   **Email Subject Line** (`email_message_subject`) and **Email Content** (`email_message_text`) — the delivery email (see §11).
    
*   **Status** (`package_status`) — Active or Inactive.
    
*   **Email Reminders** — "Send reminder N days before due date" and an optional "Send weekly reminders." Reminder cadence is stored in `reminder_days` and `reminder_freq`.
    
*   **Reminder Text** (`reminder_custom_text`) — text included in reminder emails, alongside the system-generated list of outstanding items and the portal link (see §11).
    

### Package structure: headers and ordering

Within a package, requirements can be grouped under **headers** (section titles such as "Requirements needed for Issuance of Letter of Appointment" or "Additional Provider Credentialling Requirements"). Headers are added with the **Add Header** button on the package modify screen and are organized in display order alongside requirements. Each requirement row also has an order control so the package can be sequenced as the trainee should experience it.

* * *

## 3\. Documents (requirements) and how they behave

A "document" in onboarding is any single requirement that can be placed into a package. Definitions live in the **Forms and Documents** library (`admin_app_documents`) and are reusable across packages. The document types available are controlled by `resident_applications_docTypesA`.

### Document types

*   **Dynamic Form** — an interactive form the trainee fills out online. Values entered can map back into the trainee's demographics profile when the form is approved (the approval/import behavior is documented in the companion approval article). **Dynamic forms have an important limitation regarding training-history values — see §6.**
    
*   **Print Form** — a form the trainee downloads, completes offline, and returns (typically by upload).
    
*   **Outside Document** — a document or file requirement (for example, a certificate or a signed attestation), most often returned by upload.
    
*   **Contract** — a contract mapped through the Contracts module, delivered inside the package. See §7; full contract behavior is in the _Contracts (GME)_ article.
    
*   **Learning Module** — an online module the trainee completes and attests to.
    

### Return methods

The **Return Method** determines what the trainee must do and whether the item generates reminders (stored in `admin_app_documents.return_method`):

*   **Upload** — the trainee uploads one file (or multiple, if enabled). Triggers reminder emails until complete.
    
*   **Upload (multiple)** — the trainee may upload more than one file to satisfy the requirement (see "Multiple files" below).
    
*   **Electronic Signature** — used for contracts and signable documents.
    
*   **Complete Online / Fill Out Online** — used for dynamic forms and learning modules completed within the portal.
    
*   **Mark as Complete** — the trainee only clicks a "Mark as Complete" button (no upload). This **still** triggers reminder emails if left incomplete.
    
*   **GME Task to Complete** — used when **no trainee action** is required; the GME office completes the item. This does **not** trigger any reminder emails to the trainee.
    

### Additional Processing

The **Additional Processing** option (`admin_app_documents.post_action`) links an approved requirement to a destination field elsewhere in the trainee's profile — for example, posting an uploaded ECFMG certificate to the Certifications tab, or an immunization record to the Immunizations tab, once the item is approved. Two consequences follow from this:

*   Additional Processing only populates the destination when **GME or an Administrator** approves the item. If a **faculty reviewer** approves it, the file does **not** flow to the destination field. For this reason, requirements set up with Additional Processing should not be assigned to faculty reviewers (AMBS-8347).
    
*   A requirement with Additional Processing **cannot** also allow multiple file uploads. Because only one document can occupy a single Certification/Immunization/Test Score destination, the "Allow applicant to upload multiple documents" checkbox is disabled whenever Additional Processing is set. To re-enable multiple uploads, set Additional Processing to "no additional processing" (AMBS-11715).
    

### Multiple files

When **Allow applicant to upload multiple documents** (`allow_multiple_uploads`) is enabled for an Upload requirement, the trainee can attach several files to one requirement. The trainee must click **Choose Files** and **Upload** for each file, then click **Mark Completed** to submit — the system does not know how many files the trainee intends to attach, so the requirement is not considered submitted until **Mark Completed** is clicked. Files uploaded but not followed by **Mark Completed** appear in the trainee's profile in Incomplete status. When multiple files are submitted, they are all displayed together under the requirement on the trainee's Orientation tab and stored together in the relevant folder on the Forms/Files tab.

### The Access matrix

Each document has an **Access** matrix that sets, per user type, what that user type can do with the item (stored as the `access_*` fields on `admin_app_documents`). The columns are:

*   **Full Access / Accept Documents** — can review and approve/accept submissions.
    
*   **Upload Documents / Mark Submitted** — can upload or mark the item submitted on the trainee's behalf.
    
*   **Read-Only** — can see the item but not act on it.
    
*   **No Access** — cannot see the item.
    

The rows are the user types (Administrator, GME Office, Hospital Finance, House Staff). This matrix is what determines, for example, whether a coordinator can accept a document or only view it, and whether the trainee (House Staff) can see a given item at all.

* * *

## 4\. Requirement scoping: how package contents are tailored per trainee

A package is delivered as a whole, but **not every requirement in a package applies to every trainee**. Each requirement carries its own set of scoping filters, set when the requirement is added to the package (the **Add Form/Document to Package** screen) and stored in `admin_app_packages_documents`. These filters are evaluated against the individual trainee's profile and training-history record at delivery (and at each update). A requirement appears in a trainee's package only if the trainee matches **all** of the requirement's scoping criteria.

The per-requirement scoping filters are:

*   **Trainee Types** (`trainee_typeA`) — All, or a chosen list (e.g., Resident, Clinical Fellow).
    
*   **Trainee Levels** (`levelA`) — All, or chosen PGY/student levels.
    
*   **Citizenship** (`citizenship` / `citizenshipA`) — All, US, Non-US, or a chosen list. MedHub reads the **Country of Citizenship** field on the trainee's Demographics tab. If that field is blank or set to United States, the trainee will **not** see requirements scoped to Non-US citizens. To make a citizenship-scoped requirement (such as a J-1 document) appear after correcting the field, the package must be updated for the trainee (see §8).
    
*   **Programs** (`programA`) — All, or chosen programs. A requirement can be limited to specific programs (the package modify view shows, e.g., "(77 programs)" for a requirement scoped to a subset).
    
*   **Medical School** (`medical_school`) — All, US/Canadian, or Foreign Medical Schools. MedHub reads the trainee's **Education** tab to determine whether they attended a Foreign Medical School. If the education information is not yet entered, a requirement scoped to Foreign Medical School graduates will **not** appear. This is most commonly seen with the ECFMG Certificate requirement. The information can be entered two ways: directly on the trainee's Education tab before the package is delivered, or via a dynamic form that the trainee completes and GME approves — after which the package must be updated to force the now-qualifying requirement into the trainee's package.
    
*   **Due Date** (`due_days_before`) — a requirement can carry its own due date offset, distinct from the package due date.
    

### Why this matters: scoping resolves against the training-history record

The scoping above is evaluated against the **training-history record that the delivery resolves to** for that trainee. The trainee's program and level are not free-floating attributes; they come from a specific training-history record. Which record the system uses is determined by **how the package is filtered and delivered** (see §5). Because requirement scoping keys off the resolved record's program and level, the **same package delivered against different training-history records can produce different contents** for the same trainee. For example, a requirement scoped to PGY-2 in Program X appears only when the delivery resolves to a training-history record where the trainee is a PGY-2 in Program X.

This is the single most important behavioral fact about onboarding delivery, and it is the root of most "the package shows the wrong requirements / the wrong level" questions. It is covered mechanically in §5.

> **Note on a trainee with no applicable requirements.** If a package is assigned to a trainee but none of the requirements' scoping matches that trainee (wrong type, level, program, citizenship, or school), the package can show as assigned while the trainee's Orientation tab shows no requirements underneath it. In that state the package cannot be unassigned until a requirement is made to apply (or the situation is otherwise resolved); see the companion approval article for the unassign workflow.

* * *

## 5\. Delivery and the filter system

This section is the core of the article. It explains the two-step assign/deliver workflow, the full set of filters on the Delivery/Applications subtab, and — critically — how those filters determine **which training-history record** a delivery resolves to, and therefore what the package contains and whether a trainee appears in the list at all.

### The two-step model: assign, then deliver

Putting a package on a trainee is deliberately two separate actions:

1.  **Assign** — attaches the package to the trainee and sets a due date. **No email is sent.** The package now shows against the trainee's name in the list and on their Orientation tab.
    
2.  **Deliver** — sends the delivery email (or surfaces the package in the trainee's Urgent Tasks — see §9 and §11) and opens the portal link. After delivery, the **Status** column shows "Delivered" with a **\[link\]** that staff can click and then enter the trainee's last name to preview exactly what the trainee sees.
    

Both actions are performed from the Action menu at the bottom of the Delivery/Applications subtab after checking the trainees to act on. The Action menu offers **Deliver Selected** and an **Assign Package** section listing every available package, plus post-delivery actions (**Resend Delivery Email**, **Change Due Date**, **Update Selected Packages**, **Unassign Selected Packages** — see §8).

### The filters on the Delivery/Applications subtab

The filter bar contains:

*   **Program** — All Programs, or one/multiple selected programs.
    
*   **Status** — Not Assigned, Assigned, Delivered, Complete, or All (`resident_applications_Statii`).
    
*   **Date Type** — selects which date field the date filter applies to (see below).
    
*   **Date value** — a single date or a date range (depending on Date Type), with date pickers.
    
*   **Limit to applications due in range** — a checkbox that further restricts the results to packages whose due date falls within the entered range.
    
*   **Advanced Options** — exposes a package selector so you can filter to a specific package, among other options.
    

The list columns are: Resident, Program, Trainee Type, Orientation Date, Due Date, Package, Status, Delivery Date, and Complete/Submitted/All (a per-trainee count of requirement progress).

### Date Type — the five options and what each reads

The **Date Type** dropdown is the most consequential filter, because it selects which date field the system evaluates and, in doing so, influences which training-history record is in scope:

*   **Orientation Date** — matches on the trainee's Orientation Date (a single date, or "(upcoming)" — see the window behavior below).
    
*   **Orientation Date Range** — matches on the Orientation Date across a date range.
    
*   **Delivery Date** — matches on the date the package was delivered.
    
*   **Due Date** — matches on the package due date.
    
*   **Active During Period** — matches trainees whose training-history record is active during the entered date range. This is the default Date Type when the subtab first loads.
    

### How the date filter resolves a training-history record — and therefore package contents

A trainee can have more than one training-history record (last year's, this year's, next year's). Each record carries its own program and level. **The date filter determines which record the delivery resolves to**, and that record's program and level then drive requirement scoping (§4). The practical consequences:

*   Filtering by **Active During Period** with **this** academic year's dates resolves to the trainee's **current** record — so requirement scoping uses this year's program and level.
    
*   Filtering by **Orientation Date** for an incoming/next-year orientation (or **Active During Period** with next year's dates) resolves to the trainee's **upcoming** record — so requirement scoping uses next year's program and level.
    

This is why the same package, sent to the same person, can correctly contain different requirements depending on how it was filtered and delivered — and why a package can show a trainee at the "wrong" level. If a coordinator delivers against the current-year record when they meant to onboard the trainee for next year, the package resolves to this year's level (e.g., PGY-1) rather than next year's (e.g., PGY-2). The fix is to deliver against the record for the intended year (for incoming/next-year onboarding, filter by the upcoming Orientation Date so the delivery resolves to the next training-history record).

> Training-history records are the backbone of the platform: a trainee's program, level, and status at any point in time come from the applicable record, and most features — onboarding included — read from them rather than from standalone fields. Onboarding's filter-to-record behavior is a specific instance of this system-wide pattern.

### The "(upcoming)" Orientation Date window

When Date Type is **Orientation Date** and the value is **"(upcoming)"** rather than a specific date, the system applies a date window: **current date minus 30 days through current date plus 6 months.** Both the orientation date and the package due date are considered against this window. A package whose due date falls outside that window may not display under the "(upcoming)" filter even though the trainee's orientation date is in range (and vice versa). If a trainee's package does not appear under "(upcoming)," switching to a **specific** Orientation Date, or filtering by **Due Date**, will surface it (AMBS-11525, AMBS-11911, AMBS-13361). The "Limit to applications due in range" checkbox with **Active During Period** behaves analogously, layering a due-date constraint on top of the active-period match.

### All Programs and per-program duplication

When **All Programs** is selected, only programs that do **not** have a program-closed date defined before or within the current academic year are included in the filter. If a trainee is expected but not appearing under All Programs, check whether their program has a closed date; the trainee can still be found by filtering for their specific program. (Reactivating a program from the Program List clears its closed date.)

Because the Orientation Date is a property of the **trainee's account as a whole** while program comes from the training-history record, a trainee who has **multiple programs across their training-history records** will appear as **one row per program** when filtered by All Programs with Orientation Date: Upcoming. These are not duplicate packages — they are one display row per program. You can confirm a single underlying package by checking the trainee's Orientation tab, or by verifying the **\[link\]** URL is the same across the rows. Filtering by the specific program shows a single row.

### The dashes ("- -") and finding trainees without a package

In the list, dashes ("- -") in the Package, Due Date, Orientation Date, or Status columns indicate the trainee has **no package** for the filtered criteria — effectively a clean row, signaling you can assign a (new) package to them. To produce a list of trainees who have **not** been assigned a package during a period: select Date Type **Active During Period**, enter a wide date range, optionally filter by program, use **Advanced Options** to select the relevant package, and check **Limit to applications due in range**. Submit. Trainees with no package in range display with dashes in the Package column.

### Assigning a second (additional) package to a trainee

A trainee who already has a package can be assigned a second one. There are two methods.

**Method 1 — clean-slate filter on the Delivery/Applications subtab.** Because a trainee who already has a package for the filtered period may not present a blank row, you filter to surface one:

1.  Open the Delivery/Applications subtab.
    
2.  Apply the Program filter.
    
3.  Set Date Type to **Active During Period** and enter the first few dates of the trainee's training history (for example, 7/1–7/5).
    
4.  Check **Limit to applications due in range**.
    
5.  Submit. This brings the trainee up with a clean row.
    
6.  Check the trainee, and from the Action menu choose **Assign** the second package; a Due Date field appears — enter it and submit. (De-select **Limit to applications due in range** before this submit if needed.)
    
7.  Check the trainee again and choose **Deliver** from the Action menu; confirm at the prompt.
    

**Method 2 — the trainee's Orientation tab.**

1.  Open the trainee's Orientation tab from their Resident Demographics profile.
    
2.  Click **Assign New Package**.
    
3.  Choose the package from the dropdown.
    
4.  Enter the due date.
    
5.  Submit. You are taken to the delivery page, where you check the trainee and choose **Deliver** from the Action menu, then confirm.
    

### Standard assign-and-deliver sequence (incoming trainees)

1.  Open the Delivery/Applications subtab and filter to bring up trainees who do not yet have a package. The Orientation Date filter is used most often; ensure the **Orientation Date** is populated on the trainee's Training History tab (it can be entered manually or batch-imported via the Resident Demographics Import Wizard).
    
2.  Check the trainees to receive the package.
    
3.  From the Action menu, **Assign** a package; enter the Due Date when prompted; submit. (No email is sent yet.)
    
4.  Check the same trainees; from the Action menu, **Deliver**; confirm at the prompt. "Delivered" and a **\[link\]** now appear in the Status column.
    

* * *

## 6\. The dynamic form exception (training-history values)

There is one place where the filter-to-record behavior in §4–§5 does **not** apply, and it is a frequent source of confusion.

The rest of the package — requirements and contracts — resolves against the specific training-history record the delivery is tied to. **Dynamic forms do not.** A dynamic form is not bound to the specific training-history record on delivery the way requirement scoping and contracts are; it has no awareness of which record it belongs to. As a result, a dynamic form's training-history-derived values — most notably the **PGY level** (and the program shown on the form) — always reflect the trainee's **current** training-history record, or the **upcoming** record if there is no current one. It cannot display a value drawn from a specific delivered record.

The practical effect: even when a package is correctly delivered against next year's record and the package's scoped requirements resolve correctly to next year's level, a dynamic form inside that package will still show the trainee's current PGY level/program. This is current, expected behavior.

Because the dynamic form reflects whatever the demographics/training-history values currently are, the value shown on the form will change if the underlying profile is updated; the form pulls from the trainee's profile rather than carrying its own stored copy of these fields.

* * *

## 7\. Delivering a contract inside a package

A contract is one of the document types that can be placed in a package. The **setup of contract maps, content, and the signature workflow is documented in the** _**Contracts (GME)**_ **article** and is not repeated here. Two delivery-side behaviors matter for onboarding:

**The contract resolves to a training-history record by due date.** For a contract requirement to appear in a delivered package, the package must be due **within 4 months of the relevant training-history start date**. This timeframe is how the system determines **which training-history record** to pull the contract from — the same record-resolution principle as the rest of the package (§4–§5). If a package is delivered far in advance (more than ~4 months before the start date), the contract requirement will not appear. A common workaround for off-cycle trainees is to temporarily set the package due date within 4 months of the start date, update the package to pull in the contract, then adjust the due date back. Because of this timing logic, some institutions deliver contracts as a separate package.

**The contract must be mapped and signature-required before it will populate.** Even with the timing correct, the contract has to be assigned through the Contracts module and set to require signature before it will appear in the package. After completing that in Contracts, return to onboarding, select the trainee for the same academic year, and choose **Update Selected Packages** so the contract flows into the delivered package. (The signature/approval workflow itself is in the _Contracts (GME)_ article.)

* * *

## 8\. Updating a package after delivery

Most changes made to a package or its requirements after delivery do **not** automatically flow to packages already delivered. Two Action-menu functions push changes; both are performed from the Delivery/Applications subtab after filtering to the trainee and checking their row.

### Update Selected Packages

Use **Update Selected Packages** after you change a package's contents or a requirement's configuration — for example: adding or removing a requirement, changing a requirement's trainee types/levels/programs/citizenship/school scoping, editing the instruction text on a requirement, replacing a PDF attached to a requirement, or correcting a profile field (citizenship, Foreign Medical School) that determines whether a scoped requirement applies. After updating, the trainee receives an email notifying them their package has been updated and an Urgent Task to address it. (If a requirement is only **removed** from a package, no email is sent.)

What flows on update vs. automatically:

*   **Editing the package-level Intro/Instructions** flows **without** an update.
    
*   **Editing a specific requirement's instruction text** requires **Update Selected Packages** to flow.
    
*   **Adding a faculty reviewer** to a requirement takes effect for items not yet completed when the requirement is completed — the system checks for a reviewer at the time the item is completed, not at initial delivery — so a reviewer added after delivery still works for pending items (covered further in the approval article).
    

### Change Due Date

Use **Change Due Date** to change the due date on already-assigned/delivered packages: filter to the trainee, check the row, choose **Change Due Date** from the Action menu, enter the new date next to the Submit button, and submit. Changing the package due date with this function **recalculates all the individual requirement due dates**. Note that changing a due date on the package itself (in Manage Packages) does **not** automatically recalculate individual requirement due dates on delivered packages — use the **Change Due Date** function to force that recalculation. After any change to an already-delivered package, follow with **Update Selected Packages** so the change reaches the trainee.

* * *

## 9\. What the trainee experiences

### Accessing the package: the verification step

How a trainee identifies themselves to open their package is set by `setting_resident_applications_method`:

*   **0 = instant access** — no identity step.
    
*   **1 = last name** (the default) — the trainee enters their last name to open the portal.
    
*   **2 = last 4 of SSN** — the trainee enters the last four digits of their SSN.
    
*   **3 = employee ID** — the trainee enters their employee ID.
    

When the verification method is last name, the portal link opens a page prompting "YOUR LAST NAME" before the package contents are shown. These access attempts (and their success/failure) are recorded in `stats_usage_applications`, which logs the user, timestamp, IP address, and whether the attempt succeeded — useful when a trainee reports being unable to open their package.

### Authenticated vs. unauthenticated access — where the trainee finds the package

Whether the trainee reaches the package through the emailed link or through their Urgent Tasks depends on **whether the system recognizes they have logged into MedHub before**:

*   A trainee who has **never logged into MedHub** accesses the package through the **unauthenticated portal link** delivered in the onboarding email (entering the verification value from above).
    
*   A trainee who **has logged into MedHub before** accesses the requirements through their **Urgent Tasks** after logging in, **not** through an unauthenticated portal link. For these trainees, the delivery email will instruct them to log in and follow the link on their home screen rather than providing a direct unauthenticated link (the exact email content depends on the tokens used — see §11).
    

This is why a returning trainee may report that their delivery email "doesn't have a link" while a brand-new trainee's email does: the system suppresses the unauthenticated link for someone it can authenticate, routing them through Urgent Tasks instead.

### Multiple packages: the toggle

When a trainee has **more than one** package assigned, they can switch between packages using a **toggle in the upper-left corner of the screen, above the institution name** — but **only when they are logged into MedHub** with delivered credentials. The toggle is **not** available when the trainee opens a package through the unauthenticated portal link in an onboarding email, because each delivered package has its **own unique link** (the encrypted `key` on `users_residents_apps`). A trainee who clicks the emailed link for one package will not see a way to reach their other packages from there; they must log in to toggle.

### Completing requirements

The trainee's portal lists the requirements with an Actions column, a Status column (showing which items still need action), and a GME Approved column. Depending on return method, the trainee uploads files, completes a dynamic form or learning module online, marks an item complete, or signs a contract. For multiple-file requirements, the trainee must click **Mark Completed** after uploading to submit the requirement (see §3). A trainee can view files they have uploaded via the **View** button next to a requirement, and can see all stored files later via **Review Records** on their home page (which surfaces the Forms/Files tab, including onboarding-uploaded files).

A package is considered **Complete** when every applicable requirement in it is completed, submitted, and/or marked complete by the GME office.

* * *

## 10\. Notifications, emails, and tokens

### The delivery email and its tokens

The **Email Content** field on the package (`email_message_text`) is the email sent at delivery. It supports tokens, the most important being:

*   `{FIRST_NAME}`, `{LAST_NAME}`, `{NAME}` — the trainee's name.
    
*   `{EMAIL}` — the trainee's email address.
    
*   `{INSTITUTION}` — the institution name (drawn from the `global_sitename` root setting).
    
*   `{DIRECTIONS}` — itemized instructions for accessing the package, **including** the trainee's unique link, plus instructions to enter the verification value (e.g., last name) when prompted.
    
*   `{LINK}` — the trainee's personalized direct link to the portal.
    

The content of `{LINK}` is contained **within** `{DIRECTIONS}`, so an email needs only **one** of the two — there is no need to include both. The behavior differs by token in combination with the trainee's login history (§9):

*   With `{DIRECTIONS}`: a trainee who has not logged in before sees the full directions plus a direct link; a trainee who has logged in before sees instructions to log into MedHub and follow the link on their home screen (no unauthenticated link).
    
*   With `{LINK}`: the recipient sees a direct link regardless of login history, but does **not** see the contents of the Directions field.
    
*   With **both**: the directions content is included and the login/access instructions and link may appear as well.
    

A package can be saved only if the Email Content contains `{LINK}` and/or `{DIRECTIONS}`, so a package cannot be delivered without a means for the trainee to reach it (AMBS — token-required-on-save fix).

### Reminder emails

Reminder behavior is configured per package (§2): "Send reminder N days before due date" and an optional "Send weekly reminders." Weekly reminder emails are sent on **Mondays**. Reminder emails include the Reminder Text configured on the package, a system-generated list of outstanding items, and the portal link. **Reminder emails do not support tokens** — token substitution is only performed on the initial delivery email (and the update email), not on reminders. The content of reminders (pending items only, vs. pending and complete) is governed by `application_email_reminder_content`.

Reminder emails are only generated for requirements whose return method triggers reminders (Upload and Mark as Complete do; **GME Task to Complete** does not — see §3).

### Update and comment emails

*   When a package is updated in a way that **adds** required documents, the trainee receives the update email (`application_email_update_message` / `application_email_update_subject`) and an Urgent Task.
    
*   When GME adds a comment to a requirement, the trainee receives the comment email (`application_email_comment_message` / `application_email_comment_subject`).
    

### Trainee-side Urgent Tasks

A delivered (or updated) package surfaces to the trainee as an Urgent Task when they are logged in — and is the primary access path for trainees the system can authenticate (§9). The reviewer-side Urgent Task ("Trainee Onboarding Reviews") and the GME approval workflow are documented in the companion approval article.

### The "Contact GME Office" link

The trainee portal includes a "Contact GME Office" link at the bottom. Which user type(s) receive these messages is governed by `setting_resident_applications_contact_methods` (by default, the GME Applications contact). This link is hardcoded into the portal and cannot be removed.

* * *

## 11\. Settings appendix

Settings related to creating and delivering GME onboarding packages. Settings governing review/approval and the Document Matrix are covered in the companion approval article; contract-specific settings are covered in the _Contracts (GME)_ article.

Setting

What it controls

`setting_resident_applications`

Enables the GME onboarding/applications module.

`term_resident_applicationsStr`

The configured full name of the module (e.g., "Trainee Applications"). Also drives the reminder email subject line.

`term_resident_applicationsShortStr`

The configured short name used on subtabs.

`resident_applications_docTypesA`

The document types available (Dynamic Form, Print Form, Outside Document, Contract, Learning Module).

`resident_applications_Statii`

The package status list (Inactive/Not Assigned, Assigned, Delivered, Complete).

`setting_resident_applications_method`

Trainee verification method to open the portal: 0 = instant access, 1 = last name, 2 = last 4 of SSN, 3 = employee ID.

`setting_resident_applications_modify`

Which user types can process a package on the trainee's Orientation tab.

`setting_resident_applications_fileA`

Which user types can view applicant-submitted files.

`setting_resident_applications_contact_methods`

Which user type(s) receive "Contact GME Office" messages from the trainee portal.

`setting_resident_applications_display_fields`

Demographic fields to display as columns on the Applications screen.

`application_email_subject`

Subject of the initial delivery email.

`application_email_message`

Body of the initial delivery email (legacy/deprecated default; package Email Content is used in current configurations).

`application_email_update_subject` / `application_email_update_message`

Subject/body of the email sent when an update adds required documents.

`application_email_comment_subject` / `application_email_comment_message`

Subject/body of the email sent when GME adds a comment to a requirement.

`application_email_reminder_content`

Reminder email content: 1 = pending items only; 2 = pending and complete items.

`global_sitename`

The institution name shown in the package header and `{INSTITUTION}` token.

`setting_demo_requireddocs`

Enables the legacy "Required Documents by Trainee Type" section on the Orientation tab (predates current onboarding; can cause "missing documents" that are not onboarding-package items).

`setting_demo_labcoats`

Enables/removes the lab coats section on the Orientation tab.

`setting_labcoat_types`, `setting_labcoat_typeA`, `setting_labcoat_requiredA`, `setting_labcoat_name`, `setting_labcoat_email`, `custom_formatting_on_lab_coat`

Lab coat ordering configuration (lab coats appear on the Orientation tab alongside onboarding).

* * *

## 12\. Database tables appendix

Tables that store GME onboarding package creation, delivery, and trainee completion data.

Table

What it holds

`admin_app_packages`

Parent package definition: title, effective date, status, type (1 = standard, 2 = special/custom), `due_days`, intro, reminder days/frequency/text, email subject and message, directions.

`admin_app_documents`

The reusable document/requirement definition: document type, return method, allowed filetypes, `post_action` (Additional Processing), per–user-type access flags, `allow_multiple_uploads`, `faculty_reviewers`, `eidssn` (reviewer SSN view), `email_faculty` (notify reviewer), `email_admin`, learning module reference.

`admin_app_packages_documents`

Joins a document to a package and stores the per-requirement scoping: `programA`, `trainee_typeA`, `citizenship`/`citizenshipA`, `medical_school`, `levelA`, `due_days_before`, header title/description, sort order.

`admin_app_stored_responses`

Prepared response text that can be sent to a trainee when a requirement is rejected (used in the review/approval workflow).

`users_residents_apps`

The package **assigned to a trainee**: status, `orientation_date`, `due_date`, `delivery_date`, and `key` (the encrypted unique access key behind each delivered package's link). The behavior in §5 keys off this record.

`users_residents_apps_docs`

Per-trainee requirement status within an assigned package: status, due date, applicant submission date, GME approval date, GME initials, GME response, uploaded filename.

`users_residents_apps_forms`

Joins a delivered dynamic form to the trainee with its completion status (not opened / completed / started but not completed), start/end dates, and an error log.

`users_residents_apps_fields`

The values a trainee enters into a dynamic form; these import into demographics on approval.

`stats_usage_applications`

Audit trail of onboarding portal login/verification attempts: user, GME user, timestamp, IP address, success flag, and input.

### A note on the deprecated `users_residents_apps_*` tables

Several `users_residents_apps_*` tables carry a table status of **Deprecated** in the database documentation: `_demo`, `_schools`, `_licenses`, `_tests`, `_training`, `_insurance`, `_life_insurance_beneficiary`, `_discipline`, and `_addresses`, plus `_extra_fields`, `_groups_quantity`, and `_tabs` (the last three documented as "Never Used"). Their column descriptions indicate they stored structured data — demographics, education, licenses, training history, test scores, insurance, and disciplinary/attestation answers — from **older onboarding forms that are not dynamic forms**. These tables are not the storage behind current dynamic forms.

The active storage for current dynamic forms is, by contrast, `users_residents_apps_forms` (form delivery and completion status), `users_residents_apps_fields` (the field values the trainee enters, which import into demographics on approval), and the `admin_app_*` family that defines dynamic forms (`admin_app_fields`, `admin_app_groups`, `admin_app_sections`, `admin_app_tabs`, `admin_app_lists`, and related) — all of which carry an **Active** table status. The deprecated tables above are listed here only so they are not mistaken for current storage; they should not be read or written by current onboarding behavior.

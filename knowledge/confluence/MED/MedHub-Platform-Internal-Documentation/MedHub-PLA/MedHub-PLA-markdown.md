# MedHub - PLA - markdown

# MedHub - PLA Management \[GME\]

> **Source of truth for root settings referenced in this document:** `support.medhub.com > Lists > Settings` (filter by `settings_pla`).

## 1\. Overview

The PLA (Program Letter of Agreement) Management module provides institutions with the ability to create, distribute, and approve formal agreements between the sponsoring institution's residency/fellowship programs and external participating sites where trainees are sent for educational training assignments and/or rotations.

PLAs address the expected GME responsibilities between the program and external site, generally including specifics on faculty/supervisory responsibilities, education content, length of rotation(s) or training assignment(s), evaluation expectations, and related governing policies and/or procedures.

The module supports two parallel request workflows that share the same underlying settings infrastructure:

*   **PLA requests** — formal Program Letters of Agreement, routed through a signature workflow that includes mandatory GME initial review. Completed PLA PDFs are automatically saved to the Contracts/Affiliation Agreements section for the corresponding participating site in the site list.
    
*   **Rotation requests** — lighter-weight requests for rotation-specific activities at a participating site, routed through an approval workflow. Approved rotation requests can optionally trigger a PLA.
    

Both workflows are managed from the same area: GME Office > Program Management > PLA Management (GME view); Program Administrator > Site Management > PLA Management (admin view).

### Navigation paths

Role

Path

GME Office

Home > Program Management > PLA Management

Program Administrator

Site Management > PLA Management

### Tabs within PLA Management

The module is organized into the following tabs, visible depending on role and settings:

Tab

Description

Settings

PLA-level configuration: enable/disable features, approval/signature workflows, email notifications, approver roles, external data entry users, instructions, and signature formatting

Dynamic Fields

Data collection fields that flow from request forms into PDF templates

PLA Forms/Templates

Create and manage PLA request forms and their corresponding PDF templates

PLA Requests

Initiate, modify, review, and approve/reject PLA requests

New Rotation Request Forms

Create and manage rotation request forms (only visible when rotation requests are enabled)

New Rotation Requests

Initiate, modify, review, and approve/reject rotation requests (only visible when rotation requests are enabled)

My Approvals

Non-GME users view and act on requests pending their approval

* * *

## 2\. PLA Settings

PLA Settings provide the GME Office with the ability to enable rotation requests, set up email notifications, manage approval workflows, and customize instructions that appear on approval workflow pages. These should be configured before performing any other PLA Management activities.

### 2.1. General PLA Settings

Setting (UI label)

Description

Enable New Rotation Requests

When enabled, the Rotation Requests and Rotation Request Forms tabs become available.

Program Access to Initiate New Rotation Requests

Allows program coordinators to initiate their own rotation requests. If not enabled, only the GME Office can initiate rotation requests.

Program Access to Initiate PLA Requests

Allows program coordinators to initiate their own PLA requests. If not enabled, only the GME Office can initiate PLA requests and then allow program administrators to enter their respective portions.

Remove Ability to Send PLA Back with Comments

When enabled, removes the option for approvers to send the PLA back to the GME Office with comments. This applies to both PLA requests and rotation requests.

Send (Business) Daily Email Reminders

Enables daily reminder emails (Monday–Friday only) to users with pending rotation or signature requests.

Send New Site Email Notifications

When enabled, sends an email to the designated Finance and/or Contract teams when a resident has an activity at a new site. If the request is for an existing site already on the site list, no notification is sent.

GME Alert Recipient(s)

Select the primary and backup contacts for PLA Management alert recipients at the institution. The dropdown reflects added GME Staff Members.

### 2.2. Approval Workflow

The Approval Workflow defines who will be asked to approve a rotation request or sign a PLA request by default, and in which order those approvals or signatures occur.

Key characteristics:

*   Up to five approval slots are available in each workflow.
    
*   The PLA signature request workflow **requires** GME Office initial approval as a mandatory step. The rotation request approval workflow does not require this.
    
*   Selecting "Other Internal" as an approver type assumes the user has an active MedHub Faculty account. An existing Faculty account must be selected, and the user's title must be entered for the signature line.
    
*   Selecting either "External Approver" type assumes the approver does not have a MedHub account. An email address is required so a one-time approval link can be sent.
    
*   There are two external approver options: **specify** (enter external approver info directly in the workflow setup) and **dynamic** (the data-entry user provides external approver info within the request form itself).
    
*   The GME Office may override or reset the approval/signature workflow for individual requests at their discretion.
    
*   Form-specific approval workflows (set on individual PLA forms or rotation request forms) override the default institutional workflow.
    

**Update Approval Workflow:** Click Update Approval Workflow > select users from the dropdowns or manually enter required fields > click Update Approval Workflow to save.

**Update Signature Workflow:** Click Update Signature Workflow > select users from the dropdowns > click Update Signature Workflow to save.

### 2.3. External Data Entry

When creating a PLA form or rotation request form, question access can be restricted to the GME Office and/or the program administrator. In cases where an external user (not in MedHub) needs to provide data entry, they are added here. External data entry users receive a one-time email link to access and complete their designated form fields.

The external data entry list shows: user name/title, user status, and the number of rotation requests and PLA templates they have contributed to.

### 2.4. Email Notifications

The Email Notifications sub-tab allows customization of all PLA-related email alerts, including alerts for request approvals and rejections. Most notification types provide selection or write-in fields for email recipients, subject line, and email content. Default text is provided for standard notifications; alternate/external notifications start blank.

The following tokens can be used in email content fields: `{PROGRAM}`, `{TYPE}`, and `{SITE}`. These are found under the Dynamic Fields tab and auto-populate with information from the specific request and user.

Email notification types cover: PLA request approval, PLA request rejection, PLA send-back, rotation request approval, rotation request rejection, rotation send-back, external approver notification, internal approver notification, new site notifications, and alternate/external variants of each.

### 2.5. Instructions

The Instructions sub-tab provides a rich-text field for creating customizable instructions that display at the top of a PLA signature request page, guiding the required approvers. An HTML link can be added to direct users to a separate resource.

### 2.6. Signatures

Controls the display format for approval signatures on the completed PLA PDF.

**Default format:** Signatures display in chronological order of approval in a three-column layout, added left-to-right as approvers sign. This is recommended when the ordering of signatures is not important.

**Custom format:** A custom format can display signatures of specific approver roles in a designated order. Configuration options:

*   Number of columns (one, two, or three)
    
*   Positioning by Role table — map approver roles to specific row/column positions
    

Behaviors:

*   If an approver does not submit their signature, it is skipped and the next signature displays.
    
*   If multiple approvers submit signatures for the same role, all signatures for that role are grouped together.
    
*   Any required signatures not ordered in the custom format still display in the first column in default chronological order.
    

### 2.7. Approver Roles

Additional approver roles can be created and applied to internal and/or external approvers. Custom roles appear with the prefix "Approver Role" in dropdown menus.

To add: Click Add Approver Role > enter a Role Name > set Status (Active by default) > click Add Approver Role.

* * *

## 3\. Dynamic Fields

Dynamic fields are data collection fields added to questions on rotation request forms and PLA forms. They serve as the bridge between form data entry and PDF template output — the values collected flow into the PDF template via tokens.

### 3.1. Default and Auto-Populated Fields

Multiple dynamic fields are pre-loaded by default when PLA functionality is activated. Auto-populated fields pull data from the institutional program tagged to the request in real time. Default fields display with a lock icon next to their name and have some modification limitations.

### 3.2. Dynamic Field Properties

Property

Description

Dynamic Field Name

Appears in the Dynamic Field dropdown when adding a question to a form

Token/Key

Appears in the Dynamic Field column of a form under Form Questions/Headers. Must be unique across all dynamic fields.

Status

Active (can be added to questions) or Inactive (cannot)

Display Placeholder Text If Missing Data

When checked, placeholder text appears if the Question Text field is left blank

Question Text

Standardized question text that appears when a dynamic field is batch-added to forms

Data Entry

Which user types can add data to the field

Field Type

The input type for the field

### 3.3. Field Types

Field Type

Use Case

Short Text

Single lines of text

Long Text

Larger field with higher character limit

Date

Date-based data

Options/List

List of answers, one selected via radio button

Options/Pull-down

List of answers, one selected via dropdown

Checkbox

Answer confirmed by clicking a checkbox

File Upload

File must be uploaded. Allowed file types can be restricted. Appending the file upload makes it required only after the PLA has been signed.

External Approver

Collects information for a person without a MedHub account who needs to approve the request

### 3.4. Availability Settings

Each dynamic field has separate availability toggles for rotation requests and PLA requests:

*   **Required by Default** — when batch-added to a form, the question is required.
    
*   **Force Inclusion** — the field must be added to a form before the form status can be set to Active and requests can be initiated.
    

### 3.5. Adding a New Dynamic Field

GME-defined fields (no lock icon): Click Add Dynamic Field > enter field name, token/key, status, question text > select data entry types, field type, and availability options > click Add Dynamic Field.

* * *

## 4\. PLA Forms and Templates

The PLA Forms/Templates tab is where users create custom PLA forms and their corresponding PDF templates. The form collects data; the template uses that data to generate the final PDF agreement.

### 4.1. Creating a PLA Form

1.  Click Add PLA Template.
    
2.  Select method: "New Template - Start from scratch" or "Copy existing form."
    
3.  Enter a PLA Form Name (Introduction/Instructions optional; basic HTML supported).
    
4.  Click Initiate PLA Template.
    

**Form configuration:**

*   **Form Status** — Can only be changed once dynamic fields (questions) have been added. Once set to Active (Locked), questions and headers can no longer be edited. If the form has not yet been submitted as a PLA request, the status can be reverted to Inactive for changes.
    
*   **Access to Initiate** — Restricts program administrator ability to initiate this specific PLA form.
    
*   **Approval Workflow** — Form-specific workflow that overrides the default institutional workflow. Can be further overridden by GME once a request is initiated.
    

**Forced inclusion requirement:** A banner lists fields required by forced inclusion when initiating or modifying a PLA form. All forced-inclusion fields must be added before the form can be activated.

### 4.2. Adding Questions

**Individual:** Click Add Question > select Dynamic Field (or standalone question) > select Question Type (disappears if a dynamic field is selected) > select Data Entry user types > set Required checkbox.

**Batch:** Click Batch Add Questions > check desired dynamic field questions (forced-inclusion fields auto-selected; already-added fields not shown) > click Add Selected Questions.

### 4.3. Form Modifications

*   **Editing/Deleting:** Only when form status is Inactive/Draft.
    
*   **Reordering:** Drag-and-drop, available even when locked.
    
*   **Deleting a Form:** Only when form status is Inactive/Draft. Once Active, the form cannot be deleted.
    

### 4.4. PDF Template

The PDF Template tab provides formatting tools to create the PDF document that becomes the final signed agreement. Dynamic fields added to the request form are available to insert into the template as tokens.

**Creating a PDF Template:**

1.  Click the form name > click the PDF Template tab.
    
2.  Enter content in three sections:
    
    *   **Header** — displayed at the top of every page
        
    *   **Body** — extends to multiple pages; most content goes here
        
    *   **Footer** — displayed at the bottom of every page
        
3.  Use the "(select field to insert)" dropdown to place dynamic field tokens. These populate with data from the corresponding PLA request.
    
4.  Text blocks can be displayed in columns using the Multiple Columns button and wrapping text in `{COLUMNS}` tokens.
    
5.  Click Update PDF Template. Use Preview to verify before finalizing.
    

* * *

## 5\. PLA Requests

### 5.1. PLA Request List

The PLA Requests tab displays a list of initiated, in-process, and approved PLA requests. Requests can be filtered by Status, Program, Site, and/or PLA Template form.

Available actions from the list: Email Reminders (to users with incomplete required questions when status is Initiated/Incomplete), Email Admin (customized email to program administrator), View Request.

If the site for a request already exists in MedHub, a site link appears that directs to the Modify Site page.

**Request ID in export:** PLA request lists can be exported to Excel. The export includes the Request ID column (MEDM-10461).

### 5.2. Initiating a PLA Request

1.  Click Initiate PLA Request.
    
2.  Select the Program.
    
3.  Select the PLA Template.
    
4.  Optionally check Notify Administrator to email the primary administrator.
    
5.  Click Initiate PLA Request. Redirects to the Modify Request page.
    

### 5.3. Submitting a PLA Request

1.  Filter to Initiated/Incomplete status > click Modify.
    
2.  Answer all required questions.
    
3.  Select "Submit Request - GME Initial Review" (or "Save as Partially Complete" to finish later).
    
4.  Click Submit PLA Request.
    

When a request includes an external data entry participant, the request remains at Initiated/Incomplete until the external data has been entered. The external participant receives an email notification when the initial request is submitted.

### 5.4. Approval Lifecycle

The PLA request approval lifecycle has three stages:

**Pending GME Initial Review:** A GME user must perform initial review before the request moves forward. After GME approval, the first person in the signature workflow receives the request (via Urgent Tasks as "PLA Requests for Approval" or in PLA Management > PLA Requests with Pending Approval status).

**Pending Approval (Signature Workflow):** Each approver in the workflow receives the request in sequence. Internal approvers see it in their Urgent Tasks and My Approvals tab. External approvers receive a one-time email link.

**Pending GME Final Review:** The GME Office provides final review before completion. Once final approval or rejection occurs, the PLA request status can no longer be changed.

### 5.5. Request Actions

From the View Request page, GME can:

*   **Approve** — moves request forward in the workflow
    
*   **Reject/Archive** — enter rejection comments; returns request with Initiated/Incomplete status
    
*   **Send Back with Comments** — returns request to the program coordinator with form blank and status reset to Initiated/Incomplete (only available if "Remove Ability to send PLA back with Comments" is not enabled)
    
*   **Override Workflow** — bypass workflow settings: Mark as Approved, Mark as Rejected, Skip Approval, Reset as Pending. Additional approver steps can be added and approval emails resent.
    

### 5.6. Deleting PLA Requests

Authorized users can delete PLA requests from both the Modify and View Request screens (MEDM-10368, MEDM-10399). All deletions are logged to the audit trail (MEDM-10442, MEDM-10450) and are visible in the Audit Trail Query report (MEDM-10446).

* * *

## 6\. Rotation Request Forms

Rotation request forms are only available when "Enable New Rotation Requests" is checked in PLA Settings.

### 6.1. Creating a Rotation Request Form

1.  Click Add Rotation Request Form.
    
2.  Select method: New Form or Copy existing form.
    
3.  Enter a form name (Introduction/Instructions optional; HTML supported).
    
4.  Click Initiate Rotation Request Form.
    

**Form configuration:**

*   **Form Status** — as with PLA forms, can only change once forced-inclusion fields are added. Once Active (Locked), questions/headers cannot be edited.
    
*   **Default PLA Template** — the PLA template to generate once the rotation request is approved.
    
*   **Access to Initiate** — restricts administrator access on a per-form basis.
    
*   **Approval Workflow** — form-specific override of the default approval workflow.
    

### 6.2. Questions, Modifications, and Deletion

Same mechanics as PLA forms: individual add, batch add, drag-and-drop reordering, edit/delete only when Inactive/Draft.

* * *

## 7\. Rotation Requests

### 7.1. Initiating a Rotation Request

1.  Click Initiate Rotation Request.
    
2.  Select the Program.
    
3.  Select the Rotation Request Form.
    
4.  Optionally check Notify Administrator.
    
5.  Click Initiate Rotation Request. Redirects to Modify Request.
    

### 7.2. Submitting a Rotation Request

1.  Filter to Initiated/Incomplete > click Modify.
    
2.  Answer all required questions.
    
3.  Select "Submit Request - Initiate Approval Workflow" (or Save as Partially Complete).
    
4.  Click Submit Rotation Request.
    

### 7.3. Approval and Actions

Approval lifecycle mirrors PLA requests with two differences: no mandatory GME initial review step, and approved rotation requests can optionally trigger a PLA (via the "Initiate PLA" dropdown at final approval).

On final GME approval: select a PLA template from the Initiate PLA dropdown, check Pull Data and Notify Admin, then approve. This creates a new PLA request pre-populated with data from the rotation request.

Request actions (Send Back with Comments, Approve, Reject/Archive, Override Workflow) work identically to PLA requests.

**Request ID in export:** Rotation request exports include the Request ID column (MEDM-10456).

### 7.4. Deleting Rotation Requests

Same deletion capability as PLA requests (MEDM-10405, MEDM-10410), with audit trail logging.

* * *

## 8\. My Approvals

The My Approvals tab allows non-GME users to view both PLA and rotation requests pending their approval, as well as previously approved, rejected, sent-back, or skipped requests. Requests can be filtered by Status, Request Type, or Site.

### 8.1. Approving a Request

1.  Click My Approvals > select Pending status.
    
2.  Click Review/Sign Request.
    
3.  To approve: Click Sign Request > type the approver's name > choose a font or upload a signature from the Signature Style/Font dropdown > click Sign Request.
    
4.  To reject: Click Reject Request > enter optional rejection comments > click Reject Request.
    

Rejected requests return to the GME Office user with Initiated/Incomplete status.

* * *

## 9\. Site Integration

Completed PLA PDFs are automatically saved to the Contracts/Affiliation Agreements section for the participating site within the site list. When a PLA results in a new site being created, the "Send New Site Email Notifications" setting (if enabled) triggers notification to designated Finance and/or Contract teams.

When approving a PLA or rotation request for a new site, GME is presented with a site selection step.

* * *

## 10\. Known Gaps and Behaviors

### 10.1. Daily Reminder Emails — Never Implemented

The root settings `settings_pla_reminders_pla` and `settings_pla_reminders_rotation` exist and are described as enabling daily reminders to pending PLA signers and rotation request approvers, respectively. **These settings are non-functional and the feature was never implemented.** This was discovered via an AMBS support ticket in February 2025. Both settings are now marked as Deprecated in the root settings database. The "Send (Business) Daily Email Reminders" option in PLA Settings (controlled by a separate mechanism) is the only working reminder functionality.

### 10.2. PLA Management Terminology Setting

The root setting `settings_pla_mgmt_term` controls the display text used for the PLA Management link. Default value is "PLA Management." The root setting `settings_pla_request_term` controls the terminology for individual PLA requests (default: "PLA Request"), and `settings_pla_rotation_request_term` controls rotation request terminology (default: "Rotation Request"). These are typically configured during initial setup by MedHub.

### 10.3. Insurance Reminders

The root setting `settings_pla_insurance` enables insurance reminders within PLA Management. This was originally developed for Dartmouth-Hitchcock. Emma is investigating whether this feature is still actively used and what it does functionally.

### 10.4. Signature Display After Approval

When viewing Signature History within a PLA request that is Pending Approval, comments associated with each approval step are visible. The 2-column custom signature format has known rendering constraints — signatures display per the configured positioning, but the behavior when signatures are skipped or grouped may not match expectations for all layouts (per AMBS-13722, closed with a fix applied to signature column rendering).

* * *

## 11\. Related Features and Cross-References

Feature

Relationship

Site Management

Completed PLA PDFs auto-save to Contracts/Affiliation Agreements in the site list

Alert Recipients

GME PLA alert recipients are configured within PLA Settings, not the institutional Alert Recipients page

Audit Trail

PLA and rotation request deletions are logged and visible in the Audit Trail Query report

Accreditation

PLAs are a component of program accreditation compliance; the Accreditation Overview module references PLA site coverage

* * *

## 12\. Learning Portal Modules

Module ID

Module Name

Duration

Audience

MedHub GME 30

PLA Management Sites and Billing

~20 min

GME Office

MedHub GME 31

PLA Manager: Subscription

~35 min

GME Office

GME 30 covers managing PLA sites, entering sites, FAQ, adding new sites, adding documents to sites, and PLA reporting. GME 31 covers PLA settings, forms and templates, dynamic fields, creating PDF templates, initiating and approving requests, and the workflow dashboard.

* * *

## 13\. Settings Appendix

> **Source of truth for root settings:** `support.medhub.com > Lists > Settings` (filter by `settings_pla`).

### Active Settings

Root Setting Key

UI Label (if any)

Scope

Type

Description

Default

`settings_pla`

—

Site-wide

Integer

Enables PLA functionality (0=disabled, 1=enabled)

—

`settings_pla_back_with_comments`

Ability to send PLA back with comments

Site-wide

Integer

0=Off, 1=On. Governs whether the "send back with comments" button is available.

1

`settings_pla_gme_userA`

—

Institution

String

Colon-delimited list of user identifiers for primary and backup GME contacts. Updated by the client through PLA Settings.

—

`settings_pla_instructions_approval`

—

Institution

String

Instructions displayed to PLA approvers at the top of the signature request page. Updated by GME through PLA Settings.

(default text)

`settings_pla_insurance`

—

Site-wide

Integer

Enables insurance reminders within PLA Management. Originally developed for Dartmouth-Hitchcock.

—

`settings_pla_mgmt_term`

—

Site-wide

String

Display text for the PLA Management link.

"PLA Management"

`settings_pla_program_access`

—

Institution

Integer

Enables direct program access to fill out PLA forms (0=disabled, 1=enabled). Set by GME through PLA Settings.

—

`settings_pla_request_term`

—

Institution

String

Terminology for an individual PLA request. Configured by MedHub during initial setup.

"PLA Request"

`settings_pla_request_workflowA`

—

Site-wide

Array

Default approval workflow for PLA requests.

Array()

`settings_pla_rotation`

—

Institution

Integer

Enables rotation request forms as part of the PLA workflow (0=disabled, 1=enabled). Set by GME through PLA Settings.

—

`settings_pla_rotation_program_access`

—

Institution

Integer

Allows programs (admins) to initiate rotation requests. Controlled by GME through PLA Settings.

—

`settings_pla_rotation_request_term`

—

Site-wide

String

Display text for rotation request links and urgent tasks.

"Rotation Request"

`settings_pla_rotation_workflowA`

—

Site-wide

Array

Default rotation request approval workflow.

Array()

`settings_pla_signatures`

PLA Signature Columns

Site-wide

Integer

Controls the number of signature columns in the PLA PDF.

—

`settings_pla_signatures_formatA`

PLA Signature Formatting

Site-wide

Array

Custom signature positioning format.

Array()

### Email Notification Settings (all Institution scope, String type)

Root Setting Key

Description

`settings_pla_alerts_external`

Email to external data entry users when a request requires their input

`settings_pla_alerts_newsite_contracts`

Send notification to contracts contact when GME approval creates a new site

`settings_pla_alerts_newsite_finance`

Send notification to finance when GME approval creates a new site

`settings_pla_alerts_pla_approved`

Email to program admin/director after PLA approval

`settings_pla_alerts_pla_approved_alt`

Alternate notification for PLA approval

`settings_pla_alerts_pla_approved_alt_recipients`

Comma-delimited alternate recipient list

`settings_pla_alerts_pla_approved_alt_subject`

Alternate approval notification subject line

`settings_pla_alerts_pla_approved_recipientA`

Recipients for final GME PLA approval (Array: admin, director, approvers)

`settings_pla_alerts_pla_external`

Email to next external approver for PLA request

`settings_pla_alerts_pla_internal`

Email to next internal approver for PLA request

`settings_pla_alerts_pla_rejected`

Email to admin/director on PLA rejection

`settings_pla_alerts_pla_rejected_recipientA`

Recipients for PLA rejection notification (Array: gme, admin)

`settings_pla_alerts_pla_sendback`

Email to admin when PLA is sent back by GME

`settings_pla_alerts_rotation_approved`

Email to admin/director after rotation request approval

`settings_pla_alerts_rotation_approved_alt`

Alternate notification for rotation request approval

`settings_pla_alerts_rotation_approved_alt_recipients`

Comma-delimited alternate recipient list

`settings_pla_alerts_rotation_approved_alt_subject`

Alternate rotation approval subject line

`settings_pla_alerts_rotation_approved_recipientA`

Recipients for final GME rotation approval (Array: admin, director, approvers)

`settings_pla_alerts_rotation_external`

Email to next external approver for rotation request

`settings_pla_alerts_rotation_internal`

Email to next internal approver for rotation request

`settings_pla_alerts_rotation_rejected`

Email to admin/director on rotation request rejection

`settings_pla_alerts_rotation_rejected_recipientA`

Recipients for rotation rejection notification (Array: admin, director)

`settings_pla_alerts_rotation_sendback`

Email to admin when rotation request is sent back by GME

### Deprecated Settings (Non-Functional)

Root Setting Key

Scope

Description

`settings_pla_reminders_pla`

Institution

Described as enabling daily reminders to pending PLA signers. **Never implemented.** Discovered via AMBS ticket, February 2025.

`settings_pla_reminders_rotation`

Institution

Described as enabling daily reminders to pending rotation request approvers. **Never implemented.** Discovered via AMBS ticket, February 2025.

* * *

## 14\. Database Tables

The PLA module uses 13 tables across two categories:

**Transactional tables (instance-level,** `i_sites_` prefix):

Table

Purpose

`i_sites_pla_requests`

PLA request records: status, dates, site/program references, GME comments, send-back data, generated PDF filename

`i_sites_pla_requests_answers`

Answers to dynamic field questions on PLA request forms

`i_sites_pla_requests_approvals`

Approval records: internal/external approver info, signature data, approval status/timestamps, role, comments

`i_sites_pla_rotations`

Rotation request records (parallel structure to PLA requests)

`i_sites_pla_rotations_answers`

Answers to dynamic field questions on rotation request forms

`i_sites_pla_rotations_approvals`

Approval records for rotation requests

**Reference/configuration tables (**`ref_pla_` prefix):

Table

Purpose

`ref_pla_external`

External data entry user records

`ref_pla_requests`

PLA form definitions

`ref_pla_requests_items`

Questions/headers on PLA forms

`ref_pla_roles`

Custom approver roles

`ref_pla_rotations`

Rotation request form definitions

`ref_pla_rotations_items`

Questions/headers on rotation request forms

`ref_pla_tokens`

Dynamic field definitions

* * *

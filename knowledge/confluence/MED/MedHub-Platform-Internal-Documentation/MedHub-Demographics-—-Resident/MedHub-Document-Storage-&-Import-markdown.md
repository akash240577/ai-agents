# MedHub - Document Storage & Import - markdown

# MedHub - Document Storage & Import

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview \[GME\]

MedHub provides three related capabilities for managing trainee documents at scale, built primarily to support clients transitioning from competitor platforms (New Innovations, Meditrek, etc.):

1.  **Demographics Batch Document Upload** — a root-side tool that bulk-imports documents into any resident's Forms/Files tab (active, inactive, upcoming, or archived accounts), filing them into the correct demographic folder based on a prescribed filename format.
    
2.  **AI Document Classification** — a Snowflake Cortex AI-powered tool that analyzes documents and assigns them standardized category and subcategory names, producing filenames that the batch upload tool can process.
    
3.  **Historical Document Storage Portal** — a micro-frontend (MFE) embedded in MedHub that gives GME Office users a searchable window into archived documents for people who do not have MedHub accounts (typically former trainees and faculty from a prior platform) stored in Azure Blob Storage.
    

These three capabilities work together in a pipeline: a third-party contractor (Germane Solutions) organizes raw document exports from the prior platform, the AI tool classifies and names them, Germane validates the AI's work, and then either the batch upload tool imports them into MedHub accounts or the historical portal makes them searchable for people without MedHub accounts.

The key distinction between the batch upload tool and the historical portal is not whether a person is "current" or "historical" — it is whether the person has a MedHub account. Any person with a MedHub account (active, inactive, upcoming, or archived) can have documents imported via the batch upload tool. The historical portal serves people who have no MedHub account at all.

This page does not cover individual file uploads to Forms/Files (documented in **MedHub - Demographics — Resident** §"Tab 5: Forms/Files") or Onboarding package document requirements (documented in **MedHub - Onboarding**).

* * *

## 1\. Forms/Files tab structure \[GME\]

Before covering the import tools, it helps to understand where imported documents land. The Forms/Files tab on a resident's demographics profile is the general-purpose document storage area. It is tab index 7 in the `demo_tabA` root setting (internal key `files`, display label `Forms/Files`).

### Folders

Files within Forms/Files are organized into folders. The folder types are hardcoded in `include_demo_files.mh` (lines 178–183) and configured via the `demo_tabA` setting. Each folder corresponds to a specific demographic area — for example, Training History, Certifications, Immunizations, Documents, etc. When a file is uploaded manually or via the batch tool, it is placed into a folder based on its `tabID` value, which maps to one of these configured folders.

### File record structure

Each file stored in Forms/Files corresponds to a row in the `users_residents_files` database table. The key fields are:

Field

Purpose

`fileID`

Auto-increment primary key

`userID`

The resident's user ID

`file_title`

Display title of the document

`file_name`

Actual filename on disk

`file_type`

File extension (up to 8 characters)

`file_size`

File size

`file_author_userID`

Who uploaded the file

`file_date_modified`

Last modified date

`tabID`

Which demographic folder this file belongs to (maps to `demo_tabA` entries)

`itemID`

Specific item within the tab (e.g., for certifications: which certification type)

`file_share`

Whether the file is shared with the resident (0 = no, 1 = yes)

`file_share_admin`

Whether shared with program administrators

`file_share_finance`

Whether shared with finance users

`file_share_mentor`

Whether shared with faculty mentors

`folderID`

Folder assignment within Forms/Files

`status`

Active/inactive flag (1 = active)

All sharing flags default to 0 (not shared). Files are stored on disk under `/home/files/medhub/<global_iabbrev>/hidden/profiles/r/` on the application server and mounted via NFS to web servers.

* * *

## 2\. Demographics Batch Document Upload tool \[GME\]

The GME Demographics Batch Document Upload tool is a root-side utility that bulk-imports documents from a client's SFTP site into resident profiles' Forms/Files tabs. It can import documents into any resident account that exists in MedHub — active, inactive, upcoming, or archived. It was built to support the Kaiser Permanente Northern California (KPNC) migration and is now available for any client onboarding that requires mass document import.

### Who can run it

This is a **root-side tool** — only MedHub Support users with root access can execute it. It is not exposed to institution-side users (GME, Program Administrators, etc.).

### Prerequisites

Before the tool can be used, the root setting `demographic_file_sftp_path` must be populated with the correct SFTP folder path for the client. Without this setting, the system has no way to locate the client's SFTP server to pull documents from. The tool's Step 1 validates that this path is set and displays a "Valid path entered" confirmation.

### Workflow

The tool presents a five-step wizard interface:

**Step 1: Verify SFTP path.** Confirms that `demographic_file_sftp_path` is populated and valid for the client.

**Step 2: Verify file naming.** Files on the SFTP site must follow a prescribed naming convention (see below). The tool provides a downloadable **Batch Document Upload Reference.xlsx** export containing the valid reference values (userIDs, tabIDs, itemIDs, folderIDs, programIDs) for the client, which is used to construct the filenames.

**Step 3: Run validation.** A "Run validation" button scans all files in the client's SFTP folder and checks each filename against the naming convention and reference data. The validation report shows total files, successful validations, and files with errors. A downloadable error list is available for files that fail validation.

**Step 4: Set default file permissions.** Before importing, the operator sets default sharing permissions for the uploaded documents via a permission grid. The grid has four role rows — Administrator, Hospital Finance, Resident, and Faculty Mentor — each with three access levels: Write Access, Read-Only, or No Access. These defaults apply to all files in the batch. (Individual file permissions can be changed after import through the resident's Forms/Files tab.)

**Step 5: Import files.** The "Import files" button initiates the import. This is an asynchronous process — the operator can navigate away without disrupting the import. The right-hand side of the page displays current and previous batch status, including completion timestamps and counts (e.g., "5238 / 5894 imported").

### Prescribed filename format

`userID_tabID_itemID_folderID_programID_title_filename`

Where:

*   `userID` — the MedHub user ID of the resident
    
*   `tabID` — the demographic tab identifier (from `demo_tabA` configuration) that determines which folder the file is placed in. Forms/Files documents that do not map to a specific demographic tab use a tabID of 0.
    
*   `itemID` — the specific item within the tab (e.g., for a certification tab, which certification subtype). Should be included only if the document is one the client wants attached to a specific field. Use 0 if not applicable.
    
*   `folderID` — should be 0 unless the document should be uploaded to a specific client-created folder on the Forms/Files tab.
    
*   `programID` — should match the resident's current program.
    
*   `title` — the desired user-facing display name of the file. Must be less than 100 characters.
    
*   `filename` — the original filename prior to the renaming process. Optional. Must be less than 30 characters.
    

Underscores are used as delimiters between parts of the naming convention. All other special characters are automatically removed during the import process.

### File constraints

*   Only **one file per itemID** per resident. If a resident has multiple versions of the same category of document (e.g., two flu shot records), upload the most recent version to the itemID and create new folders to upload older versions.
    
*   Allowed file types: AVI, CSV, DOC, DOCX, GIF, HTM, JPEG, JPG, MOV, MP3, MP4, MPEG, MPG, ODP, ODS, ODT, PDF, PNG, PPT, PPTX, RTF, TXT, WAV, XLS, XLSX, XML, ZIP.
    
*   Maximum file size: 40 MB per file.
    

### Post-import behavior

*   Successfully imported files are moved to a "Processed" folder within the client's SFTP site.
    
*   Files that fail import remain in the client's original SFTP folder location.
    
*   The tool tracks batch history on the right side of the page: each batch shows completion timestamp, total count, and imported count.
    

> **This is not a self-service tool.** The filename format requires internal MedHub identifiers (userID, tabID, itemID, folderID, programID) that clients do not have direct access to. The tool provides a Batch Document Upload Reference.xlsx export with the valid values for a given client. The typical workflow involves Germane Solutions preparing the files with the correct naming convention, based on these reference values and the AI classification tool's output.

### Origin

The tool was initially investigated in MEDM-7277 (spike: "Investigate Mass Document Import to Trainee Profiles") for the Kaiser SOW, then implemented in MEDM-7559. The parent epic is MED-661 ("Customer Document Storage 2025–2026").

* * *

## 3\. AI Document Classification \[GME\]

The AI document classification capability uses Snowflake Cortex AI functions (LLM models hosted on Snowflake's SaaS platform) to analyze documents and assign them standardized MedHub category and subcategory names. This produces the correctly-formatted filenames that the batch upload tool expects.

### How it works

1.  Raw documents from the client's prior platform are uploaded to the MedHub SFTP server.
    
2.  An Azure Data Factory ETL pipeline migrates the documents from SFTP to Azure Blob Storage.
    
3.  Snowflake Cortex AI functions analyze document metadata and content to classify each document into MedHub's standard document categories (stored in the `DOCUMENT_CATEGORIES` table).
    
4.  The classification results are stored in Snowflake (`USERS_DOCUMENTS` table) alongside the blob file path references (`USER_BLOB_FILES` table).
    
5.  The classified documents are then either renamed per the prescribed format for batch import (residents with MedHub accounts) or indexed for the historical portal (people without MedHub accounts).
    

### Role of Germane Solutions

Germane Solutions is the third-party contractor engaged to assist with document migration. Their role spans both sets of documents:

*   **Documents for people without MedHub accounts:** Germane organizes and sorts document exports from competitor platforms (which may have different categorization structures) into a format suitable for ingestion into the historical portal.
    
*   **Documents for residents with MedHub accounts:** After the AI tool classifies and names documents, Germane performs a validation pass to verify that the AI named them correctly before they are imported into MedHub via the batch upload tool.
    
*   **Data categorization mapping:** Different competitor platforms (New Innovations, Meditrek, etc.) use different document categorization schemes. Germane helps map these to MedHub's standard categories.
    

### Data architecture

The AI classification system uses a per-client Snowflake schema with four key tables:

Table

Purpose

`USER_METADATA`

User details and document metadata. PII (email) is masked via Snowflake PII masking policies.

`DOCUMENT_CATEGORIES`

MedHub's standard document classification categories.

`USER_BLOB_FILES`

Azure Blob document file path details.

`USERS_DOCUMENTS`

User documents and their AI-assigned classifications.

### Privacy and security

*   AI classification operates on **metadata only** — the Snowflake Cortex LLM models process document metadata, not document content.
    
*   PII is masked and accessible only to privileged application roles.
    
*   Snowflake application authentication uses key-pair mechanism.
    
*   Azure Blob access is controlled via SAS tokens and restricted to specified VNETs via private endpoints.
    

* * *

## 4\. Historical Document Storage Portal \[GME\]

The Historical Document Storage Portal is a micro-frontend (MFE) integrated into the MedHub platform that provides GME Office staff with a searchable interface for viewing and downloading documents belonging to people who do not have MedHub accounts — typically former trainees and faculty from a prior platform.

### When it is used

This portal serves clients who are transitioning from a competitor platform and have large volumes of documents for people who will not be given MedHub accounts. These are typically alumni trainees and faculty whose documents still need to remain accessible for verification, compliance, and operational purposes (e.g., employment verification by GME administrators).

### Enabling the portal

The portal is controlled by a root setting:

*   `document_storage_gme` — institution-level boolean (default: False). When enabled, a link to historical document storage appears on the **Residents** tab.
    
*   `document_storage_ume` — school-level boolean (default: False). When enabled, a "Student Documents" link appears under **Student Administrator > Students tab > Functions section**. The UME side is fully built and shipped (MEDM-9951). No UME client has used this feature yet.
    

The portal is a one-time setup per client: the ETL pipeline runs to migrate and classify the documents, and then the MFE is available for ongoing search and retrieval.

### Access control

Only two user types can access the portal:

*   **GME Office** (userType 5)
    
*   **Student Administrator** (userType 12) — UME side is built and shipped (MEDM-9951) but not yet in use with any client
    

Authentication flows through MedHub's existing JWT authentication. The JWT token includes the user's clientID (globalID), userID, userType, and institutionID/schoolID. Based on these claims, the API routes requests to the correct client-specific Snowflake schema and Azure Blob container.

No additional credentials are required — being logged into MedHub with the correct role is sufficient.

### Search capabilities

The MFE allows authorized users to search documents using the following metadata filters:

*   Resident/Student Name
    
*   Upload Year
    
*   Program Name
    
*   Document Category
    
*   Document Subcategory
    

Users can view and download documents directly from the search results.

### Technical architecture

*   **Frontend:** Angular MFE integrated into the MedHub platform
    
*   **Backend:** REST APIs exposed via endpoints, authenticated via MedHub JWT
    
*   **Storage:** Azure Blob Storage (per-client containers, SAS token-secured, private endpoint access)
    
*   **Metadata:** Snowflake database (per-client schema, schema-level role access)
    
*   **AI:** Snowflake Cortex functions for initial classification (one-time during onboarding)
    

### First client

The initial implementation was for KPNC (Kaiser Permanente Northern California), a client not previously on MedHub whose documents needed to be accessible to the institution after onboarding.

* * *

## End-to-end workflow for a new client migration

When a new client migrates from a competitor platform to MedHub and needs document import:

1.  **Document export.** The client or their prior vendor exports all trainee/faculty documents from the old platform.
    
2.  **SFTP upload.** Documents are uploaded to the MedHub SFTP server.
    
3.  **Germane sorting.** Germane Solutions organizes and sorts the raw export, mapping the competitor's categorization to MedHub's standard categories.
    
4.  **ETL + AI classification.** The Azure Data Factory pipeline migrates documents to blob storage. Snowflake Cortex AI analyzes and classifies each document.
    
5.  **Germane validation.** Germane reviews the AI-assigned classifications to confirm accuracy.
    
6.  **Residents with MedHub accounts → batch import.** For documents belonging to people who have MedHub accounts (whether active, inactive, upcoming, or archived), files are renamed per the `userID_tabID_itemID_folderID_programID_title_filename` format and imported via the Demographics Batch Document Upload tool into their Forms/Files tabs.
    
7.  **People without MedHub accounts → historical portal.** For documents belonging to people who will not be given MedHub accounts, the documents remain in blob storage and are indexed in the Snowflake metadata tables. The `document_storage_gme` setting is enabled, and GME Office staff can search and retrieve them via the portal.
    

> **SFTP cleanup.** Successfully imported files are moved to a "Processed" folder within the client's SFTP site. Files that fail import remain in the original SFTP folder.

* * *

## Common scenarios

### "Client is migrating from New Innovations and needs their documents accessible"

This is the primary use case. Walk through the end-to-end workflow above. Key questions to confirm upfront: how many documents, which people have MedHub accounts vs. which do not, and whether the client has already engaged Germane Solutions.

### "GME Office can't see the historical document storage link"

Check whether `document_storage_gme` is enabled for the institution. If the setting is off (the default), the link won't appear. This is a root-side setting — Support must enable it.

### "Batch document import can't find the SFTP folder"

Check whether `demographic_file_sftp_path` is populated for the client. Step 1 of the tool validates this setting. If it is empty or incorrect, the tool cannot locate the files.

### "Batch document import failed for some files"

Run the Step 3 validation first — it produces a downloadable error list. Common failure reasons: unrecognized userID (resident account doesn't exist in MedHub), malformed filename not matching the prescribed 7-segment format, invalid tabID/itemID combination, file exceeds 40 MB, or unsupported file type. After import, any files that fail remain in the original SFTP folder (not moved to Processed).

### "Documents imported but they're in the wrong folder"

The folder placement is driven by the `tabID` in the filename. If the tabID was incorrect in the prescribed filename, the file lands in the wrong folder. The fix is to re-import with corrected filenames or manually move the files via the resident's Forms/Files tab.

### "Can we import documents for graduated/inactive residents?"

Yes. The batch upload tool can import documents into any resident account that exists in MedHub, regardless of status (active, inactive, upcoming, archived). The only requirement is that the person has a MedHub account with a valid userID. If the person does not have a MedHub account at all, their documents go to the Historical Document Storage Portal instead.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Scope

Default

Effect

`demographic_file_sftp_path`

Site-wide

(empty)

The SFTP folder path for the client's demographic file uploads. Required for the batch upload tool to function — without this setting, the tool cannot locate the client's SFTP server. Must be populated before running Step 1 of the import wizard.

`document_storage_gme`

Institution

False

Enables GME historical document storage. When True, a link to the Historical Document Storage Portal appears on the Residents tab for GME Office users.

`document_storage_ume`

School

False

Enables UME historical document storage. When True, a "Student Documents" link appears under Student Administrator > Students tab > Functions. The UME MFE integration is built and shipped (MEDM-9951) but not yet in use with any client.

`demo_tabA`

Site-wide

(array)

Defines the demographic tabs and their internal keys. Index 7 (`files` → `Forms/Files`) is where imported documents land. The tabID values used in the batch import filename format reference entries in this array.

## Database tables appendix

Table

Purpose

`users_residents_files`

Forms/Files records for residents. One row per uploaded file. Contains userID, file metadata, tabID/itemID (folder placement), sharing flags, and status.

`cache_data`

Used by the batch upload tool to track processing state: start time, counts, errors, completion status.

### Snowflake tables (Historical Document Storage)

These tables live in per-client Snowflake schemas, not in the MedHub application database:

Table

Purpose

`USER_METADATA`

User details and document metadata (PII masked).

`DOCUMENT_CATEGORIES`

Standard MedHub document classification categories.

`USER_BLOB_FILES`

Azure Blob file path references.

`USERS_DOCUMENTS`

Per-document AI classification results.

## Related Jira

Key

Title

Type

Status

MED-661

Customer Document Storage (2025–2026)

SAFe Epic

Closed

MED-288

Customer Document Storage (Historical) — AI

Feature

Closed

MED-791

Customer Document Storage — Fast Followers

Feature

Closed

MEDM-7277

Investigate Mass Document Import to Trainee Profiles

Spike

Closed

MEDM-7559

Import process for Demographics Batch Document Upload tool

Story

Closed

MED-480

Historical Document Storage — Detailed Design \[UX\]

Feature

Closed

MEDM-9951

Enable access to the micro front end for historical documents (UME)

Story

Closed

MEDA-8767

Historical Document Storage — KT & Learning

Work Order

Closed

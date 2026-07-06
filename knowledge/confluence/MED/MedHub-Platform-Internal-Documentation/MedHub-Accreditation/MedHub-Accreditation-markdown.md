# MedHub - Accreditation - markdown

# MedHub - Accreditation \[GME\]

> **Source of truth for root settings referenced in this document:** `support.medhub.com > Lists > Settings` (filter by `setting_accreditation`, `accred_`, `apr_`, `cler_`, `ape_`).

## 1\. Overview

The Program Accreditation module provides the GME Office and program administrators with tools to manage ACGME accreditation data, track accreditation events, conduct Annual Program Evaluations (APEs), and maintain program policies. It is primarily a GME Office feature, with read-only or limited access for program administrators.

The module is organized around two navigation levels: an institutional overview (GME Dashboard, CLER, AIR) and per-program detail (Program Overview, GME Review, ACGME Review, APE, Surveys, Scholarly Activity, Correspondence, Policies).

### Navigation

Role

Path

GME Office

Home > Accreditation > Program Accreditation

Program Administrator

Home > Site Management > Program Accreditation (read-only view of site visit notes and citations; APE access if granted)

The module is enabled by the root setting `setting_accreditation` (0=disabled, 1=enabled).

* * *

## 2\. GME Dashboard

The GME Dashboard provides a centralized view of accreditation events across all programs.

### Upcoming/Recent

Displays all upcoming and recent accreditation events, labeled by Event Type, Program, Date, and Status. Events are ordered by date, then alphabetically by type. Clicking a program name navigates directly to that accreditation event.

### Accreditation Matrix

Organizes accreditation events alphabetically by program in a matrix view. Each event shows two date links: the last occurrence and the next occurrence. If no event has occurred, dashes (--) appear in place of a link. The matrix can be exported to Excel via the Export Data button.

If an Annual Evaluation cell is yellow, more than 365 days have passed since the last APE for that program.

* * *

## 3\. CLER Visits

The CLER (Clinical Learning Environment Review) tab manages information about an institution's CLER visits. Users can record visit dates, citations/issues, required actions, and assigned reviewers. Pre-visit activities (participant lists, documentation, coordination emails) and post-visit report issue tracking are managed here.

Different site visits can be viewed by selecting dates in the upper right corner.

### Site Visits

To add: Click Add Site Visit > select site, CLER Status, Visit Date, Follow-up Date > add comments > click Submit.

To edit/delete: Select the visit date > click Modify > make changes and Submit, or click Delete CLER Visit.

### Report Issues

Issues found during a CLER visit can be tracked with status, pathways, and actions.

To add an issue: Click Add Issue > enter issue description > select status > click Submit. Pathways can be associated with an issue via Modify Pathways. Actions can be added to issues with type, status, priority, and due date.

### Participants and Attachments

Participants can be added from MedHub user types (Administrator, Faculty, Trainee, GME Office) or as write-ins. Files can be attached to visits with configurable file access permissions.

* * *

## 4\. Annual Institution Review (AIR)

The AIR provides institutional-level views that aggregate data from all programs. It has two components: Dashboard and Details.

### Dashboard

Presents institutional-level data across six areas: Accreditation Status, Board Pass Rates, ACGME Resident Surveys, Work Hours Compliance, Scholarly Activities, and Citations. Data is filtered by academic period (defaults to current). Dashboard data refreshes nightly -- same-day changes are not reflected until the next morning.

Data sources for each dashboard area:

Dashboard

Source

Accreditation Status

Most recent populated accreditation status from the ACGME Review section for all programs

Board Pass Rates

Average of all program board pass rates as logged into program APE forms

ACGME Resident Survey

Average across all programs of each resident survey category for the previous academic year (requires ACGME survey PDF import -- see section 5.5 for known limitations)

Work Hours Compliance

Work hours submission compliance across all programs

Scholarly Activities

Count of all portfolio entries across all faculty and trainees

Citations

Count of open issues from the ACGME Review section

Dashboards can be reordered (drag and drop), toggled to show/hide data series, and exported as image files or printed.

### Details

The Details section displays measures across programs in a matrix, organized alphabetically by program. Programs included are those selected in Institution Settings > Accreditation Settings > Program Selection. Measures displayed are those enabled in Institution Settings > Accreditation Settings > GME Review.

Color coding: Green = 80% and above; Yellow = between 50% and 80%; Red = below 50%; Grey = no data or insufficient data. For individual parameters: green = above threshold, red = below threshold, grey = insufficient data.

The Details table can be exported to Excel via the Export Details button.

AIR Details measures include: Accreditation Status, Resident Surveys, Faculty Surveys, Resident Scholarly Activities, Faculty Scholarly Activities, Work Hour Submission Compliance, Open ACGME Citations, Board Pass Rate, Milestones Progression, APE Completed, Program Policies, and MEC Issues/Citations.

* * *

## 5\. Program Details

Accessible from the Program Detail tab, this provides per-program accreditation management.

### 5.1. Program Overview

A summary view of all initiated accreditation events and their details for a specific program. Each section can be navigated via links. Site Contracts for the program are displayed at the bottom.

### 5.2. GME Review

Allows the GME Office to initiate internal reviews (Annual Reviews, Special Reviews, or Focused GME Reviews). Review types are defined by MedHub Support on request.

Each review includes: Review Areas (color-coded against thresholds, with auto-saving comments), Issues (with status, category, severity), Reviewers, and File Attachments.

Review Areas are configured in Institution Settings > Accreditation Settings > GME Review, where the GME Office enables compliance indicators and sets thresholds. These thresholds drive the color coding: when a parameter meets the threshold for a program, the section turns green; it remains grey until data populates, then turns red once data begins feeding but falls below threshold.

Reviewers may be MedHub users (Administrator, Faculty, Trainee, GME Office) or write-ins. MedHub users designated as reviewers receive read-only access to the event from their home screen via a "Program Accreditation Review" link. Write-in reviewers do not receive MedHub access.

### 5.3. ACGME Review

Tracks accreditation events initiated by the ACGME -- typically site visits, self-studies, or Annual RRC letters. Additional review types can be added by MedHub Support.

Each review records: accreditation status, letter date, response due date, status, and comments. Citations/Issues, Reviewers, and File Attachments can be added. Reviewer access works the same as GME Review.

The accreditation status recorded here is what flows to the Program List export and to the AIR dashboard.

### 5.4. Annual Program Evaluations (APE)

APEs assess individual programs across four categories: Trainee Performance, Faculty Development, Graduate Performance, and Program Quality.

APE statuses: Planned, Program Review Completed, Reviewed by GME/DIO, Archived. Institutions can add custom statuses via the root setting `apr_statusA`.

Initiating an APE: Click Initiate APE > select Program, Academic Year, APE Date. If a previous APE exists, action items from the most recent APE are displayed for optional carry-forward.

APE components: Trainee Performance parameters are a mix of auto-generated measures (pulling from evaluations, milestones, procedures, conferences, portfolios, work hours, and committee data) and manual-entry Yes/No fields. Each parameter has a Value and Comment field; both require entry to submit the APE. When the APE status moves from Planned to a submitted status, only parameters that contain values (including blank values) are displayed. Faculty Development parameters cover teaching, scholarly activity, CME, mentoring, self-assessment, and trainee evaluations of faculty. Graduate Performance parameters are mostly manual entry (board scores, match results, employer surveys) with auto-generated on-time graduation and graduate survey tracking. Program Quality parameters cover faculty/trainee program evaluations, ACGME survey data (requires import), and manual match results.

The full APE parameter reference (data types, sources, and query logic for each parameter) is documented in the APE Parameters Job Aid.

Review Checklist: A checklist of requirements that can be marked complete within the APE.

Reviewers: Reviewer access requires activation of a root setting (`ape_reviewers_modify`). When enabled, reviewers can add/edit comments and update the review checklist.

Action Items: Items carry forward between APEs. Each item tracks: Area for Improvement, Action Plan, Date Instituted, Individual Responsible, Context, Expected Resolution, Target Date, and Status (Not Resolved / Partially Resolved / Resolved).

Additional Comments: Strengths, Program Areas for Improvement, Action Plan, Notes, and GME Notes.

File Attachments: Files can be attached with access restricted to GME, Program (Directors/Coordinators), and/or Reviewer.

Export: APEs can be exported to PDF.

### 5.5. ACGME Surveys

Allows the GME Office to upload and track ACGME Resident and Faculty survey data. Internal surveys can also be tracked. An animated trend graph displays institutional performance over time, comparing program, institution, and ACGME national measures.

Surveys can be imported from ACGME survey PDFs (2012 and later only -- earlier formats are incompatible). Individual program survey data can be exported to Excel. Issues can be added and tracked from within the survey view.

**Known gap -- ACGME survey import reliability:** The PDF reader built for this functionality is brittle. Every time the ACGME updates question wording on their surveys, the import breaks for affected questions. As of now, only a small subset of questions whose language has not changed since approximately pre-2021 imports correctly. There is no alternative mechanism to import ACGME survey data into MedHub. This directly affects the usefulness of the AIR Dashboard's ACGME Survey panels and any APE parameters that depend on imported survey data, as those areas only reflect the subset of questions that successfully import.

### 5.6. Scholarly Activity

Displays scholarly activities logged during the academic period to resident or faculty learning portfolios. This is a read-only view of data collected elsewhere in the system (Portfolios). Graphs show yearly trends by type, comparing program to institution.

The displayed columns are derived from specific portfolio entry types: Conference Presentations (Publication - Abstract, Presentation - National/Regional), Chapters and Text (Publication - Book Chapter, Publication - Journal Manuscript), Research (Research Project), and Teaching/Presentations (faculty who lectured at least one in-house conference). "Utilization" indicates whether any of the above fields is non-zero or "Yes."

Program administrators have access to a PubMed import button to directly import PubMed IDs and citation data for residents and faculty.

### 5.7. Correspondence

Tracks files and internally initiated change requests between program administrators and the GME Office. Correspondence types include: Miscellaneous (from ACGME) and internal change requests (Director Changes, Complement Changes, Format Changes, New Program, Accreditation Status, Progress Report). Custom correspondence types can be added, modified, or deleted by the GME Office.

### 5.8. Policies

The GME Office defines required policies that programs must upload. Each policy has an expiration period set by GME; policy expiration alerts can be configured under Accreditation Alerts. Maximum file upload size is 40 MB.

To add: Click Add Document/Link > select Policy Type > select Policy File Type > choose file > enter File Title > set File Expiration > click Submit.

* * *

## 6\. Accreditation Settings (Institution Settings)

Accessed at Institution Settings > Accreditation Settings, these control compliance data monitoring across programs.

### 6.1. General Settings

Controls APE reviewer access. When "Allow reviewers to modify the APE" is enabled, reviewers can add/edit comments and update the review checklist. This requires activation of a root setting -- contact MedHub Support.

### 6.2. APE Parameters

Manages the parameters that appear in APEs. Parameters are linked to academic years and are only accessible when filtering by an academic year that contains them. Capabilities: add new parameters, modify parameters, bulk activate/inactivate for a single academic year, reorder within categories (drag-and-drop), add custom parameter categories via List Management. Default MedHub APE parameters are restricted to their original categories; custom parameters can be moved between categories.

### 6.3. Program Selection

Generates a list of all programs and allows the institution to exclude non-accredited programs from accreditation reports and APE requirements. Programs with an ACGME number in the Program List default to selected.

### 6.4. GME Review

Allows the GME Office to set thresholds for compliance indicators used in internal program reviews. Each parameter has a description of how it functions. Measures selected here also appear in the AIR Details table.

* * *

## 7\. Accreditation Alerts

Accessed at Institution Settings > Alerts > Accreditation Alerts. Custom email alerts can be configured for accreditation events across: CLER Visits, GME Reviews, ACGME Reviews, Surveys, APEs, Policies, and Correspondence.

Each alert specifies: recipients, alert type, timing (days before projected/completed date -- disregarded for "Completed by Program" and "File Uploaded" types), and custom email text (overrides default message if provided).

For APE alerts (File Uploaded and Completed by Program), the Recipients dropdown should be set to "GME Accreditation" to send to the primary and backup GME contacts identified in the Institutional Alerts table.

* * *

## 8\. Program Improvement Plans (PIP)

Program Improvement Plans are a separate customization that overlaps with the Accreditation module. PIPs are enabled via the root setting `setting_accreditation_pip` and used by some institutions to track programs requiring focused improvement. PIPs include fields for board pass rates, survey data, review dates, GMEC review dates, and assigned reviewers (faculty, residents, and committee members).

PIPs are accessed from the GME Office home page under the Accreditation heading. The PIP workflow includes assigned reviewers who receive a "Program Accreditation Review" link on their home screen. APE completion alerts still fire when an APE is submitted through the PIP workflow path (confirmed via AMBS-18835/18838 test cases).

The database table `admin_accred_pip` stores PIP records. This is a client-by-client feature -- not all institutions have it enabled.

* * *

## 9\. Related Features and Cross-References

Feature

Relationship

Milestones / CCC

Milestone Progress Reports and CCC workflow are documented in Evaluations GME; accreditation references milestone data in APE parameters and AIR

Portfolios

Scholarly Activity tab is a read-only view of portfolio data; APE scholarly activity parameters pull from portfolios

Work Hours

APE work hours compliance parameter pulls from submitted timesheets

Evaluations

Multiple APE parameters pull from evaluation data (faculty of resident, resident of faculty, self-assessment, program evaluations)

Conferences

APE conference attendance parameter pulls from conference attendance data

Procedures

APE case experience parameter pulls from procedure logs

PLA Management

Site Contracts displayed in Program Overview are related to PLA-generated agreements

Program List

Accreditation status from ACGME Review flows to the Program List export

* * *

## 10\. Learning Portal Modules

Module ID

Module Name

Duration

Audience

MedHub GME 25

Accreditation Overview

~30 min

GME Office

MedHub GME 28

Annual Program Evaluations

~25 min

GME Office, Program Administrator

GME 25 covers navigating the Accreditation feature, enhancing institutional oversight, and measuring program quality. GME 28 covers designing an APE, managing the APE process, entering action plans, tracking status, managing reviews, and uploading/interpreting ACGME survey data.

* * *

## 11\. Settings Appendix

> **Source of truth for root settings:** `support.medhub.com > Lists > Settings`.

Root Setting Key

Scope

Type

Description

`setting_accreditation`

Site-wide

Integer

Enable Accreditation module (0 or 1)

`setting_accreditation_modify_response`

Site-wide

Integer

Allow admins and reviewers to modify responses to accreditation events (0 or 1)

`setting_accreditation_pip`

Site-wide

Integer

Enable Program Improvement Plan

`setting_accreditation_pr`

Site-wide

Integer

Enable GME Executive Reviews

`setting_cc_apr_evaluationID`

Site-wide

Integer

APR Evaluation Form ID

`setting_contacts_export_accreditation`

Site-wide

Integer

Include accreditation organization and number in program contacts exports

`setting_gmec_committee_reminder`

Site-wide

Integer

Send GMEC Reminder Email (client-configurable in Site Settings)

`ape_measure_alt_descFlag`

Site-wide

Integer

Allow institution to set an alternate description for APE measures

`ape_reviewers_modify`

Institution

Integer

Allow APE reviewers to add comments and update the review checklist

`apr_statusA`

Site-wide

Array

APE Status List (default: Planned, Program Review Completed, Reviewed by GME/DIO, Archived)

`accred_statusA`

Site-wide

Array

Accreditation Status lookup values

`accred_survey_issue_status`

Site-wide

Array

Survey issue status lookup values

`accred_survey_types`

Site-wide

Array

Survey type lookup values

`accredited_acgme_reviewsA`

Site-wide

Array

ACGME Review types used for accreditation status

`cler_action_statusA`

Site-wide

Array

Statuses for CLER issue actions

`cler_action_typesA`

Site-wide

Array

Action types for CLER site visit issues

`cler_issue_statusA`

Site-wide

Array

Status of issues found during CLER visits

`cler_statusA`

Site-wide

Array

CLER Visit Status lookup values

# MedHub - Interfaces - markdown

# MedHub - Interfaces \[GME/UME\]

## 1\. Overview

MedHub supports a variety of interfaces that exchange data with external systems. These range from standard product integrations available to all clients, to premium paid add-ons, to fully custom client-specific interfaces built as one-off development projects.

Interfaces typically operate via one of the following mechanisms: SFTP file exchange (scheduled cron jobs that export or import flat files to/from a client's SFTP server), API calls (real-time or near-real-time data exchange via the MedHub REST API), HL7 messaging (health-data-standard file transfers triggered by data changes), or direct database-level imports from vendor-provided files.

### General troubleshooting guidance

When a client reports an interface issue, ask for the name of the interface and what it pulls -- the name MedHub uses internally often differs from what the client calls it. If they receive an error, ask them to include the error text. Common issues include SFTP connectivity (verify the SFTP address is [sftp.medhub.com](http://sftp.medhub.com), not [support.medhub.com](http://support.medhub.com)), file timing (many interfaces only generate files when changes are detected, not on a fixed daily schedule), and matching criteria failures (interfaces that match on username, employee ID, or other identifiers will silently skip records that don't match).

Requests to add or update the content of a client's custom interface should be routed through their CSM.

* * *

## 2\. Standard Interfaces (Available to All Clients)

### BoardVitals Integration

BoardVitals provides board-prep "Question of the Day" content on trainees' and faculty members' home portal pages. The integration is specialty-specific and displays questions relevant to the program's board certification area.

**Prerequisites:** The program must have an IRIS code in the Program List (maintained by the GME Office). This code associates the program with the correct BoardVitals specialty content. Without it, no content is available.

**Setup:** Program Directors, Associate Program Directors, or Program Administrators enable the integration at Portal Channels/Surveys > Integrations > Add Integration. They select whether trainees, faculty, or both should see the Question of the Day. Once installed, the integration can be updated or inactivated from the same screen.

**Institutional configuration:** The GME Office may also need to configure API Access settings at Institutional Settings > API Access > Board Vitals. The relationship between this institutional-level configuration and the program-level Integrations tab setup is not fully documented -- if a program reports "no integrations available for your specialty," check whether the IRIS code is present and whether the institutional API access has been configured.

**Support scope:** MedHub displays the BoardVitals content and handles the integration setup within MedHub. MedHub Support does not have access to the BoardVitals platform itself. For content questions or BoardVitals account issues, clients should contact BoardVitals directly.

### ResQ Medical (Work Hours App)

ResQ Medical is a mobile app for work hours logging that integrates with MedHub via the MedHub API. Trainees use the ResQ app to log shifts and work hours, and ResQ pushes that data into MedHub's work hours system.

**Authentication:** Trainees log in to ResQ using their MedHub credentials (username, password, and institution identifier).

**Support scope:** All ResQ troubleshooting is handled by the ResQ support team. MedHub Support does not have access to the ResQ platform. Direct clients to ResQ support for login issues, app functionality, or data push problems.

### myTIPreport Integration

myTIPreport (acquired by Ascend Learning from Taylor Lafrinere) pushes completed evaluation data from the myTIP system into MedHub evaluation forms. The integration is designed to deliver per-question, per-element milestone data into MedHub forms that have been specifically configured for myTIP integration.

**Setup (MedHub side):** Program administrators go to Manage Evaluation Forms and select "Copy from Another Institution." Searching "MyTip" displays all available myTIP integration evaluation forms. The program copies the relevant form and uses it for evaluation delivery. The copied form must have questions linked to both milestone elements AND parent subcompetencies/competencies for proper data rollup.

**Setup (myTIP side):** Additional configuration is required on the myTIP platform. MedHub Support is not responsible for myTIP-side configuration. Clients should refer to the myTIP integration guide at [mytipreport.org](http://mytipreport.org).

**Prerequisites:** "Track Milestone Elements" must be enabled in Milestone Management for the integration data to flow into milestone reporting correctly.

**Known operational issue:** myTIP integration evaluation forms have periodically become unshared in the Sandbox environment (observed September 2020, December 2020, June 2022). The root cause has not been identified. When this occurs, the forms need to be re-shared.

### Paging Interface

The paging interface provides an externally accessible page displaying on-call/paging information for trainees. Access can be restricted by IP address and/or password.

**Access control:** If the root setting setting\_paging\_ipA is configured, the system first checks whether the user's IP is on the whitelist. If the IP matches, access is granted. If not, the system checks for a setting\_paging\_password setting -- if configured, the user sees a login page where they must supply the password. If neither setting is configured, the paging resource is available to all. The password setting is only relevant when the IP setting is also used.

* * *

## 3\. Premium Interfaces (Paid Add-On)

### Symplr/Cactus Credentials Monitoring

Symplr (formerly Cactus) provides automated license monitoring for the Credentials Monitoring module. MedHub exports a roster of trainees and their license types to Symplr, which then monitors state licensing websites for updates and sends status changes back to MedHub.

**How it works:** MedHub generates a roster export containing trainee identifiers and license types. Symplr acts as an automated user of state licensing lookup websites, checking for renewals, expirations, and status changes. Results are imported back into MedHub and displayed on the trainee's Credentials Monitoring tab.

**Known limitation:** When a state licensing website changes its structure or URL, Symplr's automated lookup can break for that state until Symplr updates their scraping process. This has occurred with Michigan's LARA website and other states. During these periods, some license types may stop updating while others continue to work. Symplr manages the timeline for these fixes.

**Roster ordering issue (historical):** An issue was identified where editing a license number in MedHub would send STOP then START commands to Symplr in the wrong order, causing Symplr to stop monitoring that license type. This was fixed -- MedHub no longer sends STOP commands for edited licenses.

**Support scope:** MedHub Support handles the roster export side and can verify that the correct trainees/licenses are being sent. For issues with specific license types not updating, verify the roster first, then escalate to Symplr if the roster is correct. The Credentials Monitoring core doc covers the full feature in detail.

* * *

## 4\. Scheduling Interfaces (Cross-Reference)

MedHub supports scheduling imports from QGenda, Amion, and other scheduling tools. These are documented in the Scheduling core doc and the Scheduling - QGenda Interface child page. In brief:

**Amion:** Enabled per-program via root setting. Uses the Amion Interface Setup wizard (Home > Task Wizards) to map services, shifts/calls, and trainees between the two systems. Multiple Amion accounts can be linked to one program. Team-based shifts/calls cannot be imported.

**QGenda:** A more comprehensive scheduling interface with its own dedicated documentation page. Supports rotation and shift/call imports.

* * *

## 5\. Client-Specific Custom Interfaces

Custom interfaces are built as one-off development projects for individual clients. They are managed as cron scripts on the MedHub application servers and typically exchange data via SFTP. Custom interface configurations are tracked at [support.medhub.com](http://support.medhub.com) > Developers > Site Customizations.

To deactivate a custom interface: update the entry on the support site to "Archived" status, add the ticket number and crontab entry to the Customization Notes, then remove the crontab entries on the appropriate app server(s).

### Chicago -- MSOW HL7 Interface

Exports demographic data to Chicago via HL7 messaging. The interface only transfers a file when changes are detected -- it does not run on a fixed daily schedule. If no changes have been made, no file is generated.

### Chicago -- PeopleSoft Interface

Imports enrollment records from PeopleSoft. The interface checks for existing enrollment records in MedHub: if the record matches (including enrollment status), it is ignored. If it matches except for enrollment status, the MedHub status is updated to match PeopleSoft.

### Cleveland Clinic -- CBORD Meals Export

Exports meals information to the CBORD meals system. Generates three files: ccf-meals-new.txt (new hires), ccf-meals-remove.txt (terminated trainees), and ccf-meals-funds.txt (fund amounts per employee ID). Files are only generated when status changes are detected. Meal eligibility rules are configured at GME > Meal Exports > Meal Eligibility; export history is viewable at Meal Exports > Export History. All matching is based on Employee ID. Script: /home/sites/medhub\_green\_apps/clients/cc/cron\_cc\_meals\_cbord.php

### Cleveland Clinic -- APR Reporting Access

To grant administrator access to the APR Reporting link: Program List > click Department title > Dept. Chiefs/Admin > select administrators > Submit.

### Cleveland Clinic -- Faculty Demographics (Read-Only)

Active and Access checkboxes in Faculty Demographics are set to read-only. Cleveland Clinic manages faculty accounts centrally through a weekly interface feed.

### Creighton -- Automated Gradebook Bin Calculations

Two custom gradebook automations for required clerkships. The Clinical Bin calculates a score from average evaluation scores and optional other learning activity scores, weighted by a course-level setting, and maps to bins (0-54.4=0, 54.5-69.4=35, 69.5-84.4=45, 84.5-100=50). The Shelf Bin derives a score from shelf exam percentile in Demographics > Test Scores, using ranges (1-4=0, 5-74=35, 75-79=40, 80-89=45, 90-99=50). For retakes, the second attempt is used. Both populate automatically when a Final Evaluation form is opened.

### Dartmouth-Hitchcock -- Custom SAML Configuration

Uses a custom SAML configuration requiring development assistance for changes. Tickets go to Tier 2 then Dev. Separate from standard SAML self-serve.

### Dartmouth-Hitchcock -- Transition Export

Identifies promotions, transfers, graduates, and incoming residents for PeopleSoft. File only generates when residents meet the criteria based on the current date. Script: /home/sites/medhub\_green\_apps/clients/dh/cron\_dh\_peoplesoft\_transitions.php

### Dartmouth-Hitchcock -- Resident Import

Imports name, employee ID, and basic contact information for active residents from PeopleSoft. Script: /home/sites/medhub\_green\_apps/clients/dh/cron\_dh\_peoplesoft\_import.php

### Dartmouth-Hitchcock -- New Hire Export

Exports basic resident demographic data to PeopleSoft for new account creation. Only includes incoming trainees within 120 days of start date with a GME-approved dynamic form. Script: /home/sites/medhub\_green\_apps/clients/dh/cron\_dh\_peoplesoft.php

### Duke (GME) -- TSMA/Moonlighting Workflow

For combined programs (e.g., IM/Peds), set the TSMA/Moonlighting approver to "None" for the Combined Department to route requests to the PD first. If the program has a department, the department chair must be set up for the workflow to route correctly (PD then Chair then DIO).

### Duke (GME) -- SABA/OESO Learning Module Compliance Import

Nightly import of resident compliance data from Duke's OESO system. Compliance modules are configured at GME > List Management > Compliance (Resident). Each data line maps to a field on the resident's Compliance tab. Duke sends data associated with Course names that must match MedHub field mapping. Multiple course IDs are separated with a pipe |. Updates done on root side at Demographics > Compliance -- reach out to Tier 2. Script: /home/sites/medhub\_green\_apps/clients/duke/cron\_duke\_oeso.php

### Duke (School of Medicine) -- PeopleSoft UME Interface

Imports student demographics and enrollments. Does not create courses but creates custom date periods if they don't exist. Matches on NetID (username), clerkship abbreviation matching "Subject" field, and clerkship number matching "Catalog" field. Users, courses, and terms must exist in MedHub.

### Duke -- UME Demographics and Enrollment Import

Imports student demographics (excludes MS1) and enrollments from PeopleSoft-generated files. Creates accounts if they don't exist and student is not MS1. Matches on username (Duke Net ID) -- if username changes (e.g., student-to-resident transition), the interface creates a duplicate account. Script: /home/sites/medhub\_green\_apps/clients/dukeume/cron\_duke\_student\_demographics.php

### Duke -- Incentive Payment File Upload

Annual upload at [duke.medhub.com/functions/tasks/duke\_import\_incentive\_pmt.mh](http://duke.medhub.com/functions/tasks/duke_import_incentive_pmt.mh). Can be run by support or sent to Tier 2.

### Duke -- ARDS Report

Custom report for Duke University Health System. Step one of a multi-step merge process for creating DUHS's IRIS disk. Supports complex billing requirements across multiple facilities. Other clients may also use this report.

### GWU (School of Medicine) -- REGI Student Enrollment Import

Custom UME enrollment interface. Pulls courses into MedHub when students are enrolled and sends course date periods. Courses must be manually added if no students are enrolled, with abbreviations matching for future imports.

### Harbor-UCLA -- Paging Interface

See section 2 (Paging Interface) -- Harbor is the primary user of this functionality.

### HCA -- DEA Standardization Public View

Custom public-facing report displaying DEA information for HCA enterprise-wide standardization.

### IUSM -- EM Shift Logging

Custom shift logging for emergency medicine. Residents record shift logs identifying faculty supervisors and patient counts. Delivers evaluations using round-robin when multiple forms configured. Settings can be PGY-specific with cooldown periods preventing duplicate forms. Not available to other clients; no development changes are being made.

### KUMC -- Resident Demographics Export

Daily export of GME resident demographics and status. File: sftpkumc\_resident\_changes\_export.txt. SFTP user: kumc. Technical contact: Greg Fay ([gfay@kumc.edu](mailto:gfay@kumc.edu)).

### Mayo -- Payroll Notes Export (Lawson)

Exports payroll notes. Only includes users who do not have an employee ID listed.

### Mayo -- Nightly Data Lake/EDW Export

Nightly export (medhub\_mayo-export\_date.tar.gz) to Mayo's data lake. Three downstream interfaces depend on this file: new resident/trainee, compliance, and deactivation. Mayo needs the nightly file to resume -- past files are not needed.

### Mayo -- Person Export

Demographics sync from Mayo's HR system. Runs Monday-Friday at 7:30 PM Eastern. Updates email only when orientation date is not set, is today, or is in the past. NPI set to null in the file will overwrite existing NPI unless already null/blank.

### Mayo -- Conference Attendance Interface

Imports conference attendance based on matching person ID (PERID) and location code. Both must match. Location codes are configured in the conference interface settings. Unmatched records appear as errors showing the non-matching location code.

### NYPQ -- PA Surgery Program

Special case: not affiliated with GME office. Uses MedHub exclusively for procedure logging. MedHub Support must handle Training History modifications directly -- their GME office will not do it.

### OUHSC -- PeopleSoft Interface

Does not receive course data until student enrollment is provided. Courses must be manually added if no students are enrolled. Abbreviations must match.

### RCSI -- Faculty Portfolio CME Lock and Deficiencies Email

CME lock controlled by setting\_cme\_lock (date + days). Annual cron on 4/30 sends deficiency emails. Can be disabled by dev, but if disabled before 4/30 and re-enabled after, it won't run that year. Script: /home/sites/medhub\_blue\_apps/clients/rcsi/cron\_rcsi\_pcs.php

### RCSI -- Custom Demographics Import

Nightly import of member data including name, title, specialty, membership, registration, contact details, and training dates. SFTP user: rcsi.

### Stanford -- MSOW Credentialing Export

Nightly export of secure personal data (SSN, NPI, DEA, email, license) for MSOW credentialing. File: stanford\_msow\_MM-DD-YYYY.csv.

### University of Colorado (CU Anschutz) -- HCM Import

Nightly import from CU's HCM system updating specific demographic fields.

### UCHealth -- HR Resident Data Export

Pulls resident data for HR. File: medhub\_uc\_epic.txt. SFTP user: ucgme.

### UCSF -- SIS Grade/Enrollment Interface (UME)

All data flows MedHub to SIS. Nightly schedule (Eastern): 12:00 pull courses, 12:20 parse, 12:30 reconcile enrollment, 12:35 push enrollment, 12:45 push grades. Day N changes transmit day N+1.

### UCSF -- Hitachi Interface

Exports resident info for residents with active training history (in-house or visitor), Hospital/Employer = "UCSF", past 180 days, with Employee/Hitachi ID. Fixed-width flat file (MEDHUB2.txt). Excludes trainees in "UCSF - Affiliate" department. Pronouns field added 2024.

### UCSF -- ECHO Interface

**Critical integration** feeding downstream UCSF systems including access and patient care. Daily export into fixed-width flat file (housestf.txt). Four matching criteria on UCSF side: SSN, DOB, Name, Department. Any changes require test file approval before commit. Contacts: Natasha Komarovskaya and Raisa Yurkanskaya.

### UCSF -- Custom Dynamic Form Attestation Alert

Triggers notification email when a trainee answers "Yes" to Attestation questions. Fires upon GME Office form approval, not submission. Checks fields with hardcoded name liability\_answer with value 1.

### UCSF -- Student SSO Account Linking (Annual Process)

Annual process allowing promoting students to access UME accounts first via SSO until a specified date (typically June 15). Employee IDs are removed from resident profiles so SSO defaults to UME, then re-added on the specified date. Since 2021, client handles this via Demographics batch import wizard.

### UPHS (Penn Medicine) -- Nightly Feed

Exports five flat files nightly: HouseStaffCredentialed (procedure certifications), HouseStaffLicenses (license data), HouseStaffRoster (accredited programs), HouseStaffRoster\_NonAccred (non-accredited), and uphs-phonebook (contact info). HouseStaff files compile at 2:00 AM ET; phonebook at 11:17 AM ET.

### UPMC -- ACGME Procedure Import with Evaluation Delivery

Custom extension: at the end of the ACGME Procedure Import wizard, the administrator can deliver verification evaluations on all imported procedures.

### URMC -- UME Faculty Demographics Interface

Nightly import creating/updating faculty profiles from SFTP. Runs at 3:40 AM EST. Does not update username field -- after SAML self-serve migration, usernames must be updated manually for SSO. Script processes files from urmcfac SFTP.

### URMC (SOM) -- Enrollment and Course Block Dates

Student Admin must first create academic terms at List Management > Academic Terms. URMC's IT team then feeds course date ranges and enrollment records for the upcoming year.

### UTSW -- Campus Solutions Course/Clerkship Interface

Imports course/clerkship and enrollment data. Only allows new data -- changes in Campus Solutions do not edit MedHub records, creating duplicates if dates are modified after initial import. UTSW must make matching edits in MedHub immediately.

### UTSW -- Texas State Billing Report

Custom billing report for UTSW.

### Yale -- Morrisey Extract

Programs added to the extract via CSM request.

### Meharry -- Custom Procedure Fields for Work Hours

Custom procedure fields (Patient Ethnicity, Clinical Hours Worked, Setting) on UME clerkships. Students log on mobile app with required fields. Reporting requires Procedure Export.

### KPNC -- Medtrics Rotator Migration

Data migration from Medtrics using rotations\_userschedule table. Records without matching data remain in "Test1" program requiring manual assignment.

* * *

## 6\. Cross-References

Related Page

Relationship

Scheduling

Amion and QGenda interface setup and configuration

Scheduling - QGenda Interface

Detailed QGenda interface documentation

Credentials Monitoring

Symplr/Cactus credentials monitoring feature and configuration

Evaluations GME

myTIPreport integration forms and milestone element tracking

Security & User Management

SAML SSO configuration (standard and custom)

Mobile App

ResQ integration context for work hours logging

# MedHub - Demographics — Faculty - markdown

# MedHub - Demographics — Faculty

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Faculty Demographics is the MedHub feature that records the people who train, evaluate, and supervise trainees — their contact data, program associations, schedule access, and the identifiers MedHub uses to route evaluations, conferences, and procedures to the right person. Faculty are not in training themselves (which is why they have no training history records), but their profiles connect them to virtually every part of the system.

This document covers Faculty Demographics as a feature: the profile structure, how to add and modify faculty, the permanent vs. dated assignment distinction, how default program affects almost everything, the lifecycle (deactivation, archiving, deletion, transition from trainee), the task wizards that operate on faculty profiles, and the operational patterns that come up repeatedly in support tickets.

It does not cover:

*   **Faculty service assignments and scheduling mechanics** — covered in **MedHub - Scheduling** §8 (Faculty Scheduling). This doc covers the demographics fields and the permanent vs. dated distinction; Scheduling owns the assignment flow.
    
*   **Faculty CME tracking** — covered separately. CME fields on the Demographics tab are documented there, not here.
    
*   **Faculty evaluation delivery and form configuration** — covered in **MedHub - Evaluations - GME / UME**.
    
*   **Resident Demographics** and **Student Demographics** — separate docs, separate roles, separate configuration surfaces.
    

A note up front: **faculty fields are hardcoded.** The system does not support adding custom demographic fields to faculty profiles. Multiple support tickets have asked for this; the answer is no, and there's no current Product timeline for change. (Ticket 120328, AMBS-8018, confirmed 1/11/2022.) If a client needs to track institution-specific data, the only field available for free-text capture is **General Notes** on the Faculty Information tab. The one exception is **Faculty Department**, which can be enabled as a dropdown — see "Faculty Department field" below.

## Where it lives

Faculty Demographics records are accessed through the Faculty dropdown menu in the **User Management** section of the home page (or by selecting a specific faculty member from a Faculty selector elsewhere). The Program Administrator typically owns the demographics configuration; GME has visibility but does not have direct write access to faculty profiles in most institutions.

The profile is organized into four tabs:

1.  **Faculty Information** — contact data, identifiers, demographics
    
2.  **Programs/Services** — program associations and permanent service assignments
    
3.  **Forms/Files** — uploaded documentation
    
4.  **Schedule** — dated service and clinic assignments
    

There is also an **Active** and **Access** checkbox pair beneath the Faculty Information tab that controls account state, and an **Archive Faculty** button that appears when both are unchecked (see "Lifecycle" below).

## Profile structure

### Tab 1: Faculty Information

Required fields when adding a new faculty member:

*   First Name
    
*   Last Name
    
*   Start Date (institutional start date)
    
*   Username
    
*   Email Address
    

Optional fields populated by the Administrator:

*   Salutation (controls "Dr." prefix display in evaluations, directories, etc.)
    
*   Title
    
*   Specialty
    
*   Photo (appears on resident evaluations of the faculty member)
    
*   Active checkbox
    
*   Access checkbox
    
*   Reset Password (sends a password reset email)
    
*   Employee ID
    
*   Staff Type
    
*   Institution Start/End Dates
    
*   Work Phone, Pager, Home Phone, Cell Phone, Work Fax, Alpha Pager
    
*   Mail Code
    
*   NPI Number
    
*   Work Address, Home Address
    
*   Clinical Interests, Research Interests, Biography
    
*   Spouse Name, Children
    
*   General Notes
    

Most of these fields can be selectively shown/hidden or made read-only via root-side **Faculty Fields** configuration. Each field has a Status (Active/Inactive) and Admin Access (Read/Write) value.

### Tab 2: Programs/Services

This tab does two things:

1.  **Program associations** — which programs the faculty member belongs to. Configured via the **Add/Modify Programs** button.
    
2.  **Permanent service assignments** — which service groups the faculty is permanently assigned to. Configured by checking boxes next to service groups.
    

The distinction between permanent and dated assignments is important enough to have its own section — see "Permanent vs. dated assignments" below.

The **Default Program** is set on this tab via the Add/Modify Programs flow. It is the single most consequential field in the entire profile. Without a default program, faculty cannot log in cleanly, cannot be reactivated, cannot be removed from programs, and may receive 500 errors on SSO login. See "Why default program matters" below.

### Tab 3: Forms/Files

Generic file storage tied to the faculty profile. Common file types accepted. Used for credentialing documents, signed forms, faculty agreements, etc.

### Tab 4: Schedule

Dated service and clinic assignments. This tab is the _temporary/dated_ assignment surface; the Programs/Services tab is the _permanent_ assignment surface. Mixing them for the same faculty produces duplicate evaluations.

The Schedule tab supports adding services (with date ranges) and clinics. Clinics added via this tab do **not** appear on the program's master rotation schedule view — they only display in the faculty member's personal demographics schedule. This is a known limitation; for clinic-related faculty scheduling that needs to surface on the rotation schedule, use the Schedule tab on the rotation schedule itself.

The **Schedule Changes** page (accessible to GME Office) records an audit trail of changes made on this tab.

## Permanent vs. dated assignments — pick one method per faculty

Faculty members can be assigned to services through three different methods. **Using more than one method for the same faculty member produces duplicate evaluations.**

The three methods:

Method

How

When to use

**Permanent**

Programs/Services tab → check the service group box

Faculty is on a service indefinitely (full year, every year, until unchecked)

**Dated (profile)**

Schedule tab → +Add Service with date range

Faculty rotates between services through the year

**Dated (rotation schedule)**

Schedule tab on the rotation schedule → pencil into a block

Same as above, but initiated from the schedule view

The two dated methods are equivalent — they produce the same kind of record from different UI entry points.

> **Critical rule.** Do not mix permanent and dated assignments for the same faculty member. If a faculty is on a service for the full year, use permanent. If their schedule varies, use dated. Never both, or any overlapping period will produce duplicate automated evaluations. This is documented in detail in **MedHub - Scheduling** §8.1.

A few additional behaviors:

*   **Permanent assignments propagate via service groups.** When a faculty is permanently assigned to a service group, the assignment applies to every service in that group across all schedules and academic years. This is what makes service-group cleanup (Scheduling §4.1) important — a permanent assignment to a duplicated/wrong group means the faculty is "on" services they shouldn't be.
    
*   **Permanent assignments display on Services (All) view of the rotation schedule** when the program setting `Display Permanent Faculty Assignments` is enabled.
    
*   **Faculty must be scheduled to services for evaluations to fire.** If trainee schedules are complete but no faculty are scheduled to those services, automated evaluations will not deliver. Always check faculty scheduling first when troubleshooting missing evaluations.
    

## Why default program matters

The single most common Faculty Demographics support pattern is "something is broken for this faculty member." More often than not, the underlying cause is a missing or invalid default program.

A faculty member's **default program** is set on the Programs/Services tab via the **Add/Modify Programs** button. The default determines which program "owns" the profile when the faculty has access to multiple programs.

When default program is missing or invalid (e.g., the program has been archived), the following symptoms appear:

*   **Login produces a blank screen.** When the faculty logs in, they see a mostly empty page. The credentials worked — the issue is the profile has nothing to display because no default program is set. (Ticket 204528, AMBS-8808, confirmed ML 10/7/2022.)
    
*   **SSO login produces a 500 error.** Same root cause — the page can't render without a default program. (Ticket 247496, AMBS-13171.)
    
*   **Active and Access checkboxes can't be toggled.** Without a default program, these checkboxes are unavailable. The faculty cannot be activated or have their access modified until a default is set. (Ticket 151827.)
    
*   **Faculty doesn't appear in linking dropdowns.** If their default program is inactive in the Program list, the faculty is unavailable for linking elsewhere. (Ticket 142602, confirmed JS.)
    
*   **Programs can't be removed from the profile.** If the default program is inactive, it won't appear in the Programs/Services tab for removal until reactivated. (Ticket 142603, confirmed ES.)
    
*   **Profiles created via API are particularly susceptible.** The API often creates faculty profiles without a default program, producing all of the above symptoms. (Confirmed ML, AMBS-8808.)
    

The fix is the same in all cases: **set a default program.** If the original default program has been archived, the data team can do this on the back end if the dropdown is unavailable. For UME-side faculty, the medical school program is typically the default.

When troubleshooting any odd faculty demographics behavior, **check default program first.**

### A specific gap: the Manage users with missing roles tool

When a faculty member has incomplete role configuration (often producing an attached-message error like _"this user has access to evaluations, but they are not configured as a Faculty user"_), the issue is a missing user role. Tier 1 support resolves this via:

> **Users → Manage users with missing roles** (accessible as a Support user)

Walk through the list and configure the affected users. (Ticket 159906, confirmed Kyle Andrews 9/14/2020.) This is a root-side script, not a task wizard — the name is similar but it lives on the root user's home page rather than under Task Wizards.

## Lifecycle

### Adding a new faculty member

A Program Administrator adds faculty via **User Management → New Faculty Member**. Required fields are First Name, Last Name, Start Date, Username, Email Address. After saving, the additional optional fields and the Programs/Services tab become accessible.

**Always search before adding.** The drop-down's search/magnifying-glass icon should be used to confirm the person doesn't already have a faculty account before creating a new one. Duplicate faculty accounts are common and require Combine Faculty Profiles to fix.

A program setting controls whether faculty members can update their own profile. By default, faculty have limited self-service access (basic contact info like home address and phone). See **MedHub - Program Settings** for the relevant program-level setting.

### Adding faculty in bulk: Faculty Demographics Batch Import

For institutions onboarding many faculty at once or doing periodic refreshes, the **Faculty Demographics Batch Import** task wizard is the supported tool. Available to both Program Administrators (Site Management → Task Wizards) and GME Office (Institutional Functions → Task Wizards). This is `setting_wizardA` index 18 (and is also exposed UME-side under the same name).

> **Three separate batch demographics wizards.** Faculty, Resident, and Student each have their own dedicated batch demographics wizard — they do not share infrastructure. The Faculty version (this one) and the Resident version (`setting_wizardA` index 4 — see **MedHub - Demographics — Resident**) and the Student version (UME — see **MedHub - Demographics — Student**) operate independently. Don't try to use the Faculty version to import residents or vice versa.

The wizard works in two phases:

**Phase A — Create Import Template:**

1.  Click **Faculty Demographics Batch Import**.
    
2.  Click **A. Create Import Template**.
    
3.  Select one or more programs.
    
4.  Select faculty members to update or exclude.
    
5.  Select the demographic fields to update.
    
6.  Download the generated template.
    
7.  Modify the file, preserving format.
    

**Phase B — Upload Populated Template:**

1.  Click **B. Upload Populated Template**.
    
2.  Browse to the file.
    
3.  Confirm each field to update (use **All** for select-all).
    
4.  The progress bar and IMPORT ERRORS section indicate status. _Import Complete!_ displays when finished.
    

The wizard is for _updating_ existing faculty as well as creating new ones — when generating the template, including existing faculty produces a row pre-filled with their current data, which can then be overwritten in the spreadsheet.

### Updating an existing faculty member

From the User Management dropdown, select the faculty member. Administrators have write access to all demographic fields on the Faculty Information tab, plus the Programs/Services and Schedule tabs.

A few specific update behaviors:

*   **Salutation drives "Dr." prefix.** For non-MD/PhD faculty, set Salutation to something other than "Dr." to avoid the prefix appearing in evaluations and directories.
    
*   **Username modifications must be unique.** If a username modification doesn't stick, another active user has the same username. MedHub Support can search to identify the conflict. The fix is typically to rename the conflicting (often inactive) account by prefixing/suffixing an `x`. (Ticket pattern from original SKU.)
    
*   **Faculty members can update very basic contact information themselves** (home address, home phone) when the program setting permits.
    

### Adding faculty photos in bulk: Batch Photo Upload Wizard

The **Batch Photo Upload Wizard** uploads multiple faculty photos in one operation. Available under **Home > Task Wizards > Batch Photo Upload Wizard** (`setting_wizardA` index 16).

This is the same wizard used to upload Resident and Student photos — its behavior is the same regardless of user type. This section describes its use for Faculty; the Resident Demographics and Student Demographics docs describe its use for those user types.

#### How it matches photos to people

The wizard attempts to match each uploaded image file to a faculty member by checking the file name against three identifiers:

1.  **Name of the faculty member** (e.g., `John_Smith.jpg`)
    
2.  **MedHub Username** (e.g., `jsmith.jpg`)
    
3.  **Employee ID Number**
    

If a match is found automatically, the photo is associated with that faculty member. If a file name doesn't match (or matches multiple faculty), the wizard surfaces a dropdown for manual matching.

#### How to run it

1.  Locate Task Wizards on the homepage.
    
2.  Select **Batch Photo Upload Wizard**.
    
3.  Drop image files into the upload box.
    
4.  For any unmatched or ambiguous files, select the correct faculty member from the dropdown.
    
5.  Submit.
    

#### Limitations and known issues

*   **Photos for incoming faculty need a profile first.** The wizard matches against existing faculty profiles. Photos for faculty who haven't been added to MedHub yet won't match — add the profile first, then upload the photo.
    
*   **Some name patterns produce false matches with graduated trainees** (Ticket 165559). When uploading photos for new faculty and the wizard pulls up "hundreds of student photos including students who have graduated years ago," the cause is that the uploaded files match user names from prior years that haven't been archived. The workaround: rename the photo files to use Employee ID or Username rather than name format, which produces unique matches.
    
*   **Manual match looping** (Ticket 168276). Some users have reported that after manually matching a batch and clicking Next Step, the wizard returns them to the previous screen and clears their selections. If this happens, try uploading a smaller batch (e.g., 10 photos at a time) — the issue is more common with large batches.
    

### The Active and Access checkboxes

Two checkboxes beneath the Faculty Information tab:

*   **Active** — controls whether the faculty member is currently active in the program. Unchecking makes them inactive and rescinds MedHub access.
    
*   **Access** — controls direct MedHub access. Unchecking removes their access but keeps administrative access to the profile (e.g., for evaluation delivery).
    

Both checkboxes can be made read-only institution-side via root-side Faculty Fields configuration (set Field Name "Access" and "Active" to read-only). Note: making these read-only means **no one at the institution can archive faculty** without going through a different workflow. Institutions that disable these usually do so deliberately to centralize control. (Confirmed BG.)

### Archiving

When **both** Active and Access are unchecked, an **Archive Faculty Member** button appears on the lower left of the profile. Clicking it gives a confirmation prompt; archiving makes the profile only accessible by direct search.

Archived faculty:

*   Do **not** show on evaluation reports.
    
*   Do **not** appear in faculty dropdowns.
    
*   Are still in the system — they can be searched for, viewed, and reactivated.
    
*   Are removed from active rosters but retain all their historical data.
    

> **Archiving order matters.** Run any reports tied to the faculty member _before_ archiving — once archived, they no longer appear on evaluation reports. (Confirmed BG.)

> **Archiving does not unschedule the faculty.** Permanent service assignments, Schedule tab entries, and clinic assignments remain in place. To fully remove someone from active rotation, **un-schedule from all services, shift/calls, and clinics first, then archive.** This is intentional — the system protects against accidental data loss when archiving. (AMBS-7613 pattern.)

#### Archiving multiple faculty at once: Faculty Archive Wizard

For batch archiving — typically at year-end when many faculty are leaving the institution, or during data cleanup of inactive accounts — the **Faculty Archive Wizard** is the supported tool. Available under **Home > Task Wizards > Faculty Archive Wizard** (`setting_wizardA` index 13).

This is distinct from the per-profile archive workflow described above:

*   **Per-profile archive** (just above): Uncheck both Active and Access on a single faculty member, then click Archive Faculty Member. Used when archiving one person at a time.
    
*   **Faculty Archive Wizard:** Used when archiving multiple faculty members at once.
    

How to run it:

1.  Locate Task Wizards on the homepage.
    
2.  Select **Faculty Archive Wizard**.
    
3.  Filter the list of faculty (typically by program, by status, or by institutional end date).
    
4.  Select faculty to archive.
    
5.  Submit. Each selected faculty's Active and Access checkboxes are unchecked, and they are archived in one operation.
    

The same caveats apply as for the per-profile archive workflow:

*   **Run reports first.** Archived faculty don't appear on evaluation reports — pull anything needed before archiving.
    
*   **Unschedule first.** Archiving does not remove permanent service assignments, dated Schedule tab entries, clinic assignments, or shift/call assignments. To fully remove a faculty member from active rotation, un-schedule from all services, shift/calls, and clinics first. Then archive.
    
*   **Archived faculty are searchable but not visible in dropdowns.** They retain all historical data and can be reactivated by direct profile search.
    

When the wizard isn't the right tool:

*   **Removing from a single program (faculty staying at the institution):** Use Programs/Services tab → Add/Modify Programs → uncheck the program. This is a program-association change, not an archive action.
    
*   **Single-faculty archive:** The per-profile flow is faster.
    
*   **Faculty merging into another profile:** Use Combine Faculty Profiles (Support root-side action), not the archive wizard.
    

### Removing from a single program

If a faculty member is leaving one program but staying at the institution (and active in other programs), the correct path is **Programs/Services tab → Add/Modify Programs → uncheck the program → Save**. The faculty's account stays active; only the program association is removed.

> **Removing from a UME course/medical school is more restricted.** Once a UME course has been added to a faculty profile, the faculty is associated with the medical school program on the GME side. They **cannot be removed from the medical school program** through normal admin tools — this would break historical reporting. The data team can do it if specifically required, but the standard answer is no. (Ticket 138228, ticket 185756, confirmed CK and JS.)

### Combine Faculty Profiles

When the same person has two faculty accounts (commonly from a username collision, an institutional name change, or a previous account being recreated instead of reactivated), Support can merge the two via **Combine Faculty Profiles** on the root side.

#### What carries over from the removed account to the kept account

The merge preserves:

*   Faculty program assignments
    
*   Faculty completed evaluations
    
*   Evaluations where the faculty is the target (incoming evaluations)
    
*   Procedure logs where the faculty is a supervisor
    
*   Procedure certifications where the faculty is the certifier
    
*   Faculty portfolio entries
    
*   Conferences where the faculty is a lecturer
    
*   Faculty conference attendance records
    
*   Faculty mentor assignments
    
*   Faculty demographics files
    
*   Faculty service assignments (permanent and ad-hoc/dated)
    
*   Audit trails linked to the removed account
    
*   Usage stats linked to the removed account
    
*   Faculty team assignments
    

After the merge, the "removed" account is archived and inactivated; the "kept" account retains all its original data plus everything from the removed account.

#### What does NOT carry over

**Accreditation group memberships are not transferred.** If the removed account was a member of any of the following, the kept account must be re-added to those groups manually:

*   GMEC committee or subcommittees
    
*   Program Evaluation Committees (PECs)
    
*   Clinical Competency Committees (CCCs)
    
*   APE Reviewers
    

(Documented by ELR, 7/30/2024.)

#### Process notes for clients

When requesting a merge, Support will ask the client to confirm:

*   Which account to keep
    
*   That both accounts are absolutely the same person
    

Only Faculty profile types are eligible for combination. Resident and Student duplicate accounts cannot be merged — the supported path for those is for the institution to identify the least-used duplicate and have a Super Administrator delete it.

### Resident-to-Faculty Transition

When a graduating trainee becomes a faculty member at the same institution, the **Resident to Faculty Transition Wizard** is the supported path. Available under **Task Wizards → Resident to Faculty Transition Wizard** (`setting_wizardA` index 7).

#### What the wizard does

The wizard performs four steps that would otherwise need to be done manually:

1.  Inactivates the trainee account, marks not current, removes access.
    
2.  Removes the trainee's username (because MedHub disallows duplicate usernames, the trainee account's username is altered to free it up for the new faculty account).
    
3.  Adds the faculty's demographic/login data and photo (if available).
    
4.  Adds faculty program access.
    

The wizard creates a clean active Faculty account from the deactivated Resident account in one flow.

#### Eligibility — when a trainee appears in the wizard

Trainees are available for transition only if:

*   Their last appointment record at the institution was in the program running the wizard.
    
*   Their last appointment record was at most **6 months before today**.
    
*   They do not already have a valid Faculty account.
    
*   **Their training history end date has passed.** A trainee with an end date of 6/30 will appear in the wizard starting 7/1 — not before. This is by design to prevent transitioning a trainee out of resident status before they've completed residency.
    

#### Optional data carried over

The wizard prompts for what to carry from the trainee's record to the new faculty profile. Login info is automatically transitioned. Optional carry-overs:

*   Contact information (telephone, email, address)
    
*   Photo
    
*   Records
    
*   Portfolio
    

#### Common scenarios

*   **Trainee staying as Chief Resident.** This is _not_ a transition use case. Chief Residents who are still residents (still in an ACGME-required year, or in a non-required chief year) remain Trainees, with the Chief Resident flag on their training history record. Use the wizard only when the person is becoming Faculty in the strict sense (no longer a trainee, getting a faculty account). See **MedHub - Training History** for the chief-resident decision tree.
    
*   **Trainee end date hasn't passed yet.** Wait until after the end date. The wizard intentionally won't list trainees before their end date.
    
*   **Trainee transitioned but historical evaluations are missing.** The wizard preserves the trainee account (now inactivated) — historical evaluations as a trainee remain on the trainee account, not the new faculty account. To consolidate, use Combine Faculty Profiles after the transition (when both records exist and the trainee account has been promoted to faculty status separately). This is rare; check with Support first.
    

## Faculty roles and access

### Mentor designation

Faculty can be designated as mentors to one or more trainees within a program. Program Directors can be set as mentors to all trainees in the program. Mentor designation grants the faculty access to:

*   Incomplete evaluations for their mentees
    
*   View completed performance evaluations
    
*   View aggregate and peer evaluation reports
    
*   Receive low score alerts for mentees and view the low score
    
*   View program procedure requirements
    
*   View mentee procedure logs
    
*   Certify procedures for mentees (if `Certify Residents for Procedures` program setting enabled)
    
*   Approve mentees as certified to perform procedures
    
*   View mentee conference attendance
    
*   View mentee work hour activity
    
*   View mentee Portfolios
    
*   View mentee Demographics (which fields are visible is determined by GME)
    

### Program Director

Program Directors have all the mentor access above for _all_ trainees in their program, plus additional administrative access:

*   Upload rotation-specific Curriculum Goals and Objectives
    
*   Upload resource/document files
    
*   Add items to Faculty/Trainee calendars
    
*   View Faculty/program/service evaluations
    
*   View Faculty & Trainee ranking
    
*   Review program accreditation information
    
*   Review Program Scorecards
    

There is an institutional setting that can remove Director access to _individual_ faculty evaluations. With this setting on, Directors retain access to program and service evaluations but not individual faculty ones. By default, Directors have access to evaluations of other faculty, services on their schedule, and their program.

### Associate Program Director

Subset of PD access:

*   Upload rotation-specific Curriculum Goals and Objectives
    
*   Upload resource/document files
    
*   View program/service evaluations
    
*   Review program accreditation information
    
*   Review Program Scorecards
    

There is a UME-side equivalent setting (`setting_clerkship_codirectors`) that gives associate course directors the same access as course directors — including the ability to _release_ student evaluations. The system does **not** support read-only review access for co-directors; if they have evaluation access, they have release access too. The only way to remove release ability is to remove evaluation access entirely. (Ticket 203653, AMBS-9267.)

### Service Head

Designated under the Service Group tab. Service heads have three functions:

1.  Can be included in the absence approval process as a middle approver (vacation and away conference only).
    
2.  Can see "resident of service" evaluation results when the program setting permits.
    
3.  Can be notified via email of incoming residents to the service.
    

### Outside Evaluator

Faculty who participate only in evaluations (not full faculty access). Configured under the Evaluations tab → Outside Evaluators. Can be added to conference attendance via Program Settings → Conferences → Track Outside Evaluator Attendance.

### Core Faculty designation

When the institution has `setting_faculty_teaching` enabled, programs can designate faculty as **Core Faculty** for specific programs:

1.  Open the faculty profile → Programs/Services tab → **Add/Modify Programs**.
    
2.  Scroll to where existing programs appear.
    
3.  Check the **Core** box next to the program(s).
    

To report on Core Faculty: **Reports → Demographic Reports → Ad-hoc Faculty Demographics → Status Filter → "Active Core Faculty Only"**. The report shows a `[T]` (for "Teaching") next to each Core program in the results. (Ticket 121763, 209085, confirmed TM and ELD.)

## Faculty Department field

Faculty Department is an optional dropdown on the Faculty Information tab that some institutions use to categorize faculty. It is not enabled by default.

To enable:

1.  **Root setting** `faculty_dept_accessA` controls who can manage the Faculty Departments list. Adding `5` allows GME Office; adding `12` allows Student Administrator.
    
2.  With the setting enabled, the **Faculty Departments** list becomes manageable in **List Management**.
    
3.  **Add the Faculty Department field to the demographics page.** As a Support user, click **Faculty Fields** in global navigation, add a new field titled `faculty_deptID`, set Status = Active, Admin Access = Write, and click Update Fields.
    

After this two-step setup, GME or Student Admin can populate the department list, and Faculty Demographics displays a Department dropdown. (Confirmed BG, original SKU.)

## Faculty conference attendance

Brief reference; full mechanics in **MedHub - Conferences**.

*   **A faculty member who was on conference attendance sheets yesterday but is missing today** has typically had their institutional end date pass. Faculty don't appear on conference attendance sheets after their institutional end date. Check Faculty Demographics → Faculty Information → Institution End Date.
    
*   **Faculty CME tracking** flows from in-house conference attendance and faculty profile fields. Documented in the Faculty CME doc — not in this one.
    

## Email notifications

A few specific notification behaviors:

*   **Email separators must be commas, not semicolons.** When a faculty's email field contains multiple addresses separated by semicolons, MedHub fails to send emails. The Internet Message Format standard requires comma separation. The fix is to update the field to use commas. (Ticket 135310, confirmed Jeff 12/21/2020.)
    

## Common scenarios

### Faculty member sees a blank screen on login

Default program is missing or pointing to an archived program. Set a default program; if the dropdown is unavailable because the original default is archived, the data team can fix on the back end.

### Faculty SSO returns a 500 error

Same root cause as blank screen — missing default program. Fix the default program.

### Faculty can't be reactivated (Active/Access checkboxes greyed out)

Default program is missing or set to an inactive program. Set a default program (or activate the inactive default).

### Two faculty profiles for the same person

Combine Faculty Profiles on the root side. Confirm with the client first which account to keep. Note that accreditation group memberships do not carry over and must be manually re-added.

### Faculty member needs to be removed from one program but stay in others

Programs/Services tab → Add/Modify Programs → uncheck the program → Save.

### Faculty member needs to be removed from medical school program

Not supported through standard tools — the data team must do it. The standard answer is to leave the association in place to preserve historical reporting.

### Faculty added to UME course is also showing on GME side

This is by design. Adding a UME course association to a faculty profile creates a corresponding association with the medical school program on the GME side. Removing the UME course doesn't fully detach them from the medical school program.

### Custom faculty fields requested

Not supported. Faculty fields are hardcoded. The General Notes field is the available free-text option. Faculty Department is the only optional dropdown that can be added (via root configuration).

### Faculty receiving evaluations they shouldn't

Most often, the faculty has been assigned to a service via more than one method (permanent + dated, or two dated entries). Identify and remove the duplicate assignment. Also check for permanent service group assignments on a service group that has been duplicated post-reconfiguration (Scheduling §4.1).

### Faculty doesn't appear in Lecturer dropdown when adding a conference

Check the lecturer dropdown filter logic — only active residents (and faculty associated with the relevant programs) appear. See **MedHub - Conferences** §Lecturer dropdown for details.

### Faculty doesn't appear in linking dropdowns

Default program is inactive. Activate the default program or change it.

### "User has access to evaluations but is not configured as a Faculty user" error

Missing user role configuration. Tier 1 fixes this via **Users → Manage users with missing roles** as a Support user.

### Faculty is associated with a course/clerkship and shouldn't be — duplicate in dropdown

Run the root-side task script **"Users - Remove duplicate Faculty from clerkships."**

### Need to add Faculty Department field

Two steps: enable `faculty_dept_accessA` (with values 5 for GME and/or 12 for Student Admin), then add the `faculty_deptID` field via Faculty Fields configuration on the root side.

### Need to bulk-archive faculty at year-end

Use the **Faculty Archive Wizard** (Task Wizards). Run any reports first; un-schedule from services/clinics/shifts first; then run the wizard.

### Photos uploaded but pulling up old graduated student/resident matches

Use Employee ID or Username for photo file naming rather than name format. Or upload in smaller batches.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_faculty_teaching`

Enables Core Faculty designation per program. When enabled, programs can mark faculty as "Core" via Add/Modify Programs, and the `[T]` indicator appears in the Ad-hoc Faculty Demographics report.

`faculty_dept_accessA`

Controls who can manage the Faculty Departments list in List Management. Add 5 for GME, 12 for Student Admin. Required before the `faculty_deptID` field can be enabled.

`setting_clerkship_codirectors`

UME — gives associate course/clerkship directors the same access as course directors, including release ability for student evaluations. No way to limit to read-only review.

`setting_faculty_no_default`

Controls the visible behavior when a faculty has no default program (related to the blank-screen login pattern).

`setting_wizardA` (index 7)

Per-user-type access to Resident to Faculty Transition Wizard.

`setting_wizardA` (index 13)

Per-user-type access to Faculty Archive Wizard.

`setting_wizardA` (index 16)

Per-user-type access to Batch Photo Upload Wizard.

`setting_wizardA` (index 18)

Per-user-type access to Faculty Demographics Upload Wizard (the GME-side reference to Faculty Demographics Batch Import).

Faculty Fields (the controlled set of demographic fields) are not root settings — they are managed through **Faculty Fields** on the root side, which controls Status (Active/Inactive) and Admin Access (Read/Write) for each field. Most institutions configure these at implementation and rarely change them.

## Database tables appendix

Table

Purpose

`users_faculty`

Primary faculty profile records. One row per faculty member. Contains demographics, contact info, identifiers, Active/Access flags, archive status.

`users_faculty_programs`

Faculty-to-program associations. Includes the `default_flag` indicating which is the default program.

`users_faculty_programs_services`

Faculty permanent service assignments. One row per faculty-service combination, propagated through service groups.

`sh_faculty`

Faculty dated service assignments (Schedule tab on demographics or rotation schedule pencil).

`sh_faculty_clinics`

Faculty dated clinic assignments.

`sh_faculty_shifts`

Faculty shift assignments.

`sh_globalservices_heads`

Service Head designations on service groups.

`users_faculty_files`

Forms/Files tab uploads.

`i_iris_faculty_*`

IRIS-related faculty data.

Faculty role configuration (mentor, PD, service head, etc.) lives in role-specific tables alongside the program associations.

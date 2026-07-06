# MedHub - Scheduling - markdown

# Scheduling

> **Audience:** Internal MedHub users (Support, GME, Implementation, Product). This is the tribal-knowledge user manual for scheduling — the formal structure of the product, plus the "why," the "how it actually behaves," and the "what to watch for" that's normally only in the heads of the people who've worked the tickets.
> 
> **Scope:** Rotation schedules, services, service groups, shift/calls, clinics/alternate activities, releases, training history, lockout and edit windows, site lock, schedule confirmation, cost centers, institutional release, the third-party scheduling interfaces (Amion, QGenda, ShiftAdmin, Spinfusion), and how absences display on the schedule. Covers GME and the parts of UME that share this infrastructure — UME light rotation schedules and clinics. Does **not** cover work hours, course enrollments, schedule lottery, or absence approval workflows; those have their own documents.
> 
> **Section tags:** Each top-level section is tagged `[GME]`, `[UME]`, or `[GME/UME]` so an AI agent or a human reader knows immediately which population the section applies to. Subsection tags appear only where a subsection deviates from its parent's scope.
> 
> **Source material:** MedHub Scheduling Vendor Guide + 600+ Scheduling-Rotations support tickets resolved by Emma Sartwell + April 2026 Root Settings + April 2026 Database Documentation + the MedHub User Manual.

> **Source of truth for root setting current values.** Default values cited throughout this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

* * *

## 1\. Overview `[GME/UME]`

GME programs use MedHub Scheduling to track five components: the rotation schedule, the shift/call schedule, the clinic schedule, absences, and work hours. UME courses use a lighter version of the same infrastructure — a rotation schedule and clinics, primarily — alongside enrollment-based scheduling that is documented separately. This manual covers everything except work hours, course enrollments, and the absence approval workflow.

The core model: a **program** (GME) or **course** (UME) has one or more **schedules** per **academic year**. A schedule is divided into **rotation blocks**. Inside each block, residents, fellows, students, and faculty are assigned to **services** (the rotation), **shift/calls** (daily duty periods), and **clinics** (outpatient or alternate-activity periods). Services are organized into **service groups** for cross-schedule reporting. Trainees may be temporarily scheduled to another program via **releases**, or to another institution entirely via **institutional release**. Past dates lock automatically on a rolling basis to protect downstream data.

Almost every scheduling support ticket traces back to one of three underlying causes: a training history mismatch, a release done incorrectly, or an attempt to edit a block that's partially locked. Those three patterns are discussed in depth in §13.

> **Terminology note.** Throughout this document, "trainee" is used as the umbrella term for residents and fellows in conceptual prose. When the system displays the word — UI labels, view names, reports, root settings — the on-screen capitalization is preserved (e.g., "the Resident view of the schedule," "the Resident Scheduling Errors report"). The system was built around a user type named "resident," so that label appears on screen pervasively even though the population it describes is broader.

> **Work hours, never duty hours.** Although the ACGME and parts of MedHub's older codebase use the term "duty hours," the current product term is "work hours." Refer to work hours throughout, even when discussing concepts that historically were called duty hours.

* * *

## 2\. Rotation Schedules `[GME/UME]`

A **rotation schedule** (or just "schedule") is the year-long plan for a program or course. It spans the academic year (July 1 – June 30 by default) and is divided into segments called rotation blocks. Most programs have a single rotation schedule. Some opt to **split** their schedule — creating two or more level-specific schedules within the same program — when different trainee levels are on different rotation cadences.

Rotation schedule records live in `sh_schedules`, with the academic year stored in `i_rotationsets`. Each schedule has a `scheduleID`, a `programID`, and a delimited list of `levels` (PGYs) it applies to.

### 2.1 Creating a schedule — the New Schedule Task Wizard

Schedules are created by Program Administrators via the **New Schedule Task Wizard**, accessed from **Home → Task Wizards → New Schedule Wizard** (`setting_wizardA` index 0). Typical timing is April–June for the following academic year, after Resident Advancement has been run so the trainees who will be on the new schedule have appointment records for it.

The wizard has two flavors: **Standard** and **Firms (+1)**. Standard is the common case; firm-based schedules are uncommon and require Support to perform a backend reconfiguration before the wizard can be run for a new academic year — even when the firm structure isn't changing.

#### Standard New Schedule Wizard — step by step

1.  **Select the academic year** the new schedule is for (typically the next year).
    
2.  **Identify the schedule.** For programs with split schedules, this step is repeated until each split has been created.
    
3.  **Define rotation periods (blocks).** Four options:
    
    *   Use the prior year's rotation periods if defined (recommended default for most programs).
        
    *   Use standard calendar months (Jul, Aug, Sep, …).
        
    *   Custom-define start and end dates for each block.
        
    *   Custom-add the start dates only, with the system computing end dates.
        
4.  **Confirm dates.** The wizard displays the start and end dates of each rotation period for the admin to confirm.
    
5.  **Pull over services and shift/calls from the previous academic year (recommended).** Optional but standard. The admin can also create new services or delete services no longer used at this step.
    
6.  **Confirm services and service groups.** The wizard displays everything being pulled over. Services that won't be scheduled or are no longer in use can be deleted at this step.
    
7.  **Final confirmation screen** — the wizard displays _"It is safe to close this wizard."_ Until the admin sees this message, the wizard has not fully run.
    

#### Firm-based (Firms +1) New Schedule Wizard

For firm-based schedules, the wizard looks different from the standard version — and there is a hard prerequisite:

> **Support must perform the firm split reconfiguration before the wizard is run for a new academic year — every year, even if the firm structure isn't changing.** Running the wizard before this step produces broken schedule data that requires backend cleanup.

After the reconfiguration is complete, the New Schedule Wizard launches with an `(F)` suffix on the schedule abbreviation, identifying it as a firm-based schedule. The remaining steps follow the standard flow with adjustments for firm assignments. Holiday break weeks must be configured during the wizard run; they cannot be retroactively inserted afterward. See §2.3 (Special schedule configurations) for firm-based schedule specifics.

#### What gets created

After a successful wizard run:

*   A new `sh_schedules` record for the new academic year.
    
*   New `sh_schedules_rotations` records for each block.
    
*   Copies of `sh_schedules_services` records (if the copy step was taken).
    
*   Updated `sh_schedules_services_shiftnames` for the new academic year.
    
*   The new schedule appears in the academic year dropdown on the Schedules tab.
    

#### After the wizard

The new academic year's schedule is now empty (or partially populated with services and shift/calls if the copy step was taken). The trainees who will be on the new schedule must already have appointment records for the new academic year — typically created via the Resident Advancement Wizard (see **MedHub - Training History**). Trainee assignments to services are added in the rotation schedule view.

The **Schedule Population Wizard** is an optional follow-up that can suggest assignments based on requirements; it is not commonly used and is not documented in detail here.

> **Gotcha — the copy-services step looks like a summary page.** Step 5 displays the list of services that _will be_ copied when the admin clicks Next. Many users read this as a confirmation of work already done and close the wizard prematurely. If a program reports "my services didn't copy over," this is almost always why. Tell them to rerun the wizard and click Next Step all the way to the safe-to-close screen.

> **Gotcha — if Support ran a reconfiguration script that copied services, skip the wizard's copy step.** When Support reconfigures a schedule backend-side (e.g. adding or removing a split), the reconfiguration script copies services automatically. If the admin then also opts into the copy step in the wizard, every service ends up duplicated. Always call this out explicitly when handing a reconfigured schedule back to the client.

> **Gotcha — wizard access is governed by** `setting_wizardA` index 0. Both the Admin (column 0) and GME (column 1) values control whether each user type sees the wizard in their Task Wizards list. If a Program Administrator reports the wizard isn't available, check this setting first.

### 2.2 Editing a schedule

Rotation block dates can be edited after creation, but edits become risky the moment the schedule has assignments on it. If a block's dates are changed after trainees are scheduled, existing assignments may no longer align with the block, which propagates scheduling errors into downstream reports. The safer path, nine times out of ten, is:

*   **If no assignments exist yet:** delete the schedule and rerun the wizard with correct dates.
    
*   **If assignments exist and only minor date shifts are needed:** Support edits the block dates backend-side, and the admin then goes trainee-by-trainee to adjust individual service assignment start/end dates to match. The block-date edit only adjusts the available window; it does not move the assignments.
    
*   **If the schedule structure is fundamentally wrong (13 blocks instead of 12, wrong block lengths, wrong split):** delete and rerun.
    

> **Gotcha — renaming a block is not the same as editing its dates.** A program may rename "Block 1" to "July" and assume the dates match. They often don't. When a client reports "my blocks are named correctly but the assignments look wrong," verify the underlying block dates rather than trusting the labels.

### 2.3 Special schedule configurations

**Split schedules.** A program splits its schedule when different trainee levels have different rotation cadences — for example, Level 1s on 2-week blocks and Level 2–3s on monthly blocks. If every level is on the same blocks, the program should **not** split the schedule, even if they want to view them separately for other reasons. A split that isn't needed complicates service management, evaluation delivery, and reporting; there is almost always a better way to achieve the separation (service naming, service groups, layout filtering).

Each split has its own set of services (see §3.1). Services with the same name on different splits are distinct records and must be linked via a shared service group if the program wants unified reporting.

**Firm-based schedules.** A configuration where trainees are divided into cohorts ("firms") that rotate on staggered cycles. Blocks are typically one week long to accommodate a cohort transitioning into a clinic week. Firm-based schedules are uncommon and usually set up at implementation by Support, who must configure the firm split before the New Schedule Wizard is run for that academic year — even when the firm structure is unchanged from the prior year. Firm records live in `sh_firms` / `sh_firms_dates` / `sh_firms_users`. Holiday break weeks must be configured during the wizard run; they cannot be retroactively inserted.

**Changing the number of splits after the year has started.** Technically possible, strongly discouraged. Changing the split count (e.g. going from "PGY1 / PGY2–3" to "PGY1 / PGY2 / PGY3") requires a full schedule teardown and rebuild: every block and every assignment is deleted, the wizard must be rerun for each new split, and every assignment must be manually re-entered. Any blocks that are already locked will need GME to unlock. For training history records that start before 7/1 (the typical case), the reconfiguration script will **force-split** those records so each academic year can claim its portion — see §11.3 for implications.

### 2.4 UME rotation schedules

UME courses use rotation schedules that work much like GME schedules but with a few differences:

*   The schedule is owned by a course rather than a program.
    
*   A UME course can use **"auto-generate using appointments"** — a setting that derives rotation block dates from course enrollment records rather than from a wizard run. With this setting on, the 7/1 – 6/30 schedule is sliced based on enrollment dates: a single enrollment 1/3 – 1/30 produces three periods (7/1 – 1/2, 1/3 – 1/30, 1/31 – 6/30). Multiple overlapping enrollments produce additional slices. If a course coordinator is confused about why they see rotation dates they didn't create, this is almost always why. The alternative is custom rotation periods defined in **List Management > Rotation Periods**, which take precedence when present. Configuration of course enrollments themselves is documented in the Enrollments section.
    
*   The **By Services view requires at least one service** to display content. A course with auto-generate on but no services added will show block dates with no rows beneath them. The By Student view still works.
    
*   A course with site-specific variants (e.g. "MED 659A" with versions at hospital A and hospital B) has separate course dates and services for each variant. The schedule display only shows blocks for the variant the user is currently viewing — site-specific dates do not display when toggled to the main course, and vice versa.
    

### 2.5 Public View of the Master Rotation Schedule

A program can grant non-MedHub users read-only access to the rotation schedule via **Program Settings > Schedule > Enable Public View**. When enabled, MedHub generates two links:

*   An institution-wide home link that lists all programs with public view enabled.
    
*   A program-specific direct link.
    

Public View is disabled by default. It is distinct from the public call schedule (§5.7).

* * *

## 3\. Services `[GME/UME]`

A **service** is the specific area or department a trainee is assigned to for a rotation — Cardiology, ICU, Continuity Clinic, Research, etc. Services are the center of gravity of the rotation schedule; they drive evaluations, milestones, billing, and IRIS reimbursement.

Services live in `sh_schedules_services`, keyed on `serviceID`. Each is scoped to a single `scheduleID`, a single `rotationsetID` (academic year), and belongs to exactly one service group (`globalserviceID`).

### 3.1 Service definitions

Services are defined in **Service/Shift Management > Services**. Each definition is scoped to:

*   A single program or course
    
*   A single academic year
    
*   A single schedule (for split-schedule programs)
    

The scoping is strict and has a consequence worth internalizing: **if a program has a split schedule, the same service must be defined separately on each split.** A "Floor Team A" service on the Intern schedule and a "Floor Team A" service on the Level 2–3 schedule are two separate records, with two separate `serviceID`s.

Required attributes of a service definition:

*   Service name
    
*   Service abbreviation (what displays on the schedule calendar)
    
*   Service type: Patient Care – Inpatient, Patient Care – Outpatient, Patient Care – Mixed/Other, or Research
    
*   Service group (see §4)
    

Optional: site, description, trainee/faculty slot counts, status, cost center.

> **Recommendation — name split-schedule services with the level.** Most programs with split schedules suffix the level on each version: "Aesthetic – PGY6," "Aesthetic – PGY7," "Aesthetic – PGY8." All three can still live in the same service group. This keeps service pickers unambiguous and makes service-level reports immediately readable.

> **Don't create a service called "Vacation."** If a service named "Vacation" exists and trainees are scheduled to it, the time gets attributed to that service's site and cost report. CMS may view this as gaming the system, since vacation time should be attributed to whatever service the trainee was actively rotating on. Finance recommends scheduling the trainee to the overlapping service for the entire period, then recording an absence on top.

### 3.2 Service assignments

A **service assignment** is one trainee or faculty member's specific, date-bounded scheduling to a service. Service assignments live in `sh_tracks_slots` keyed on `slotID`. Program Administrators assign trainees on the **Schedule tab** by clicking the pencil icon in a block.

**Core rules for service assignments:**

1.  **Every day of a trainee's training history record must have a service assignment.** Even days the trainee is off, even days during vacation, even days during paid LOA. This is non-negotiable for downstream systems — gaps produce "N days of undefined activity" errors on the Resident Scheduling Errors report and create incomplete data for IRIS reimbursement. The exception is unpaid LOA periods that extend training: those do not need service assignments because the training is paused. See §10.1 for the absence interaction.
    
2.  **Assignments do not have to align with block dates.** If a trainee is assigned to a service for dates that cross a block boundary, MedHub automatically splits the assignment into segments that respect the block dates. Partial-block assignments display with a date range; full-block assignments display without dates.
    
3.  **Overlapping services require exactly one Primary designation.** If a trainee has two or more services assigned for overlapping dates, the system enforces that exactly one is marked Primary (`service_primary` flag in `sh_tracks_slots`). The Primary drives billing and reimbursement routing.
    
4.  **Trainees should be scheduled on their home program's schedule** unless a formal release to another program is underway (see §7).
    

> **Gotcha —** `Exactly one primary service not designated for overlap` errors. This is the single most common scheduling warning in the Resident Scheduling Errors report. It surfaces when a trainee has two overlapping service assignments with no Primary flag, or with Primary flags on both. It often appears after:
> 
> *   A release is processed, creating an assignment in the released program alongside the home program's assignment.
>     
> *   A service assignment's dates are edited, accidentally extending it into another service's window.
>     
> *   An Amion or QGenda sync adds an assignment the system sees as overlapping (neither interface supports a Primary flag, so this must be set manually in MedHub after import).
>     
> 
> The fix is almost always manual: open the block, identify the correct Primary, and check it. The Amion and QGenda interfaces will not overwrite manual Primary designations on subsequent syncs. If the error repeatedly reappears, the root cause is usually upstream — a release configured wrong, a partially-locked block edit, or an interface re-importing the conflict each night.

> **Gotcha —** `N days of undefined activity` errors. The trainee has no service assignment for those dates. Often this surfaces at year-end when a trainee's training history record ends on 6/30 but their last service assignment ended earlier. The admin must add an assignment (even a research block or admin time) covering every day.

> **Gotcha — assignments must be removed using the same view they were added in.** Resident view and Service view are not symmetric for editing. An assignment added via the Service (or Services (All)) view will not appear in the block when the admin clicks the pencil from the Resident view. To remove it, the admin must navigate back to the Service view of the same block. This trips up programs constantly, especially with released residents and split schedules. Recommend clients consistently use one view for adding assignments.

### 3.3 Viewing service assignments — the six view types

The **Schedule tab > Rotations subtab** has six views, accessed via the View Type buttons. The same underlying data is presented six different ways.

1.  **Resident** — one row per trainee, one column per block. Default for most users.
    
2.  **Resident (Details)** — same as Resident, with each trainee's continuity clinic scheduling shown in red below their service row.
    
3.  **Faculty** — one row per faculty member.
    
4.  **Faculty (Details)** — same as Faculty, with each faculty member's continuity clinic scheduling in red.
    
5.  **Service** — one row per service, one column per block. Best for filling a specific service.
    
6.  **Services (All)** — same as Service, plus permanent faculty assignments (see §8.3) appear when the program setting `Display Permanent Faculty Assignments` is enabled.
    

Trainee row sort order, by design and not configurable: in-program trainees first by `trackID` then alphabetically, then released trainees by `trackID` then alphabetically. Some firm-based programs see slight deviations because firm assignment affects ordering.

The Resident, Resident (Details), and Service views also expose **In-Program / Released / All Residents** filter buttons to control whose rows display.

> **Gotcha — split schedules and the Service view.** The Service view of one split allows the admin to assign any trainee in the program — including trainees on a different split. When this happens, the assignment displays in the target trainee's own split-schedule block, which can appear as a date mismatch (the assignment dates won't line up with that split's block boundaries). This is expected behavior; continue scheduling from the Resident view or the split-specific Service view to avoid confusion.

### 3.4 Continuing trainees can't see next year's schedule until April 1

A hard-coded behavior: trainees in a program cannot view the schedule for the upcoming academic year during the month of March. This prevents currently-enrolled trainees from seeing newly-matched incoming trainees on the schedule before Match Day announcements. Schedule visibility resumes April 1. Program Administrators can build the schedule any time, but their existing trainees won't see it until April. When clients ask "why can't my PGY1s see next year's schedule," this is the answer.

### 3.5 Copying services between years

When a new schedule is created via the wizard, the admin can copy services from the prior year. When Support creates or reconfigures a schedule backend-side, the reconfiguration script copies services automatically. **These two paths must not both run** — duplicate services are the inevitable result.

Services can also be copied **between programs** for the same academic year via a backend Schedule Utility on the root side ("copy services between schedules/academic years"). This is rare but supported.

If services from the prior year are obsolete and shouldn't carry forward, the admin can either skip the copy step in the wizard, or copy and then delete unwanted services individually. The Delete button is only available until the service has been used in a schedule assignment for the new year; after that, services can only be inactivated.

* * *

## 4\. Service Groups `[GME/UME]`

A **service group** organizes related services across splits and academic years. Service groups are program-level (or course-level) and not tied to a specific academic year, which is what makes them useful for cross-year reporting and cross-split unification.

The table is named `sh_globalservices` (counterintuitive — "global" not "groups"), keyed on `globalserviceID`. The user-facing label is consistently "Service Group."

Rules:

*   Every service must be assigned to exactly one service group.
    
*   A service group can contain many services — across different schedules (splits) and different academic years.
    
*   Service groups are where faculty permanent assignments (see §8.3) attach. A faculty member permanently assigned to a service group automatically applies to every service within it.
    
*   Service groups can have **Service Heads** (`sh_globalservices_heads`) — designated faculty who can be set as middle approvers in the absence approval workflow, can receive incoming-trainee email alerts, and (with a program setting) can see evaluations of the service.
    

### 4.1 Cleaning up service-group mapping after a split reconfiguration

A common mess: after a split-schedule program goes through several reconfigurations, services end up in duplicate or near-duplicate service groups (one per split). The cleanup:

1.  **Identify the main service group** for each concept and rename it with a marker like `*` or `– Main` so it stands out.
    
2.  **In the Services tab, click into each service** and change the Service Group dropdown to point at the main group. This needs to happen for every service on every split.
    
3.  **After the cleanup, revisit automated evaluation rules and schedule assignments** — service group changes can break eval rules that were scoped to the old groups.
    

### 4.2 Renaming service groups mid-year

It's safe to rename a service group mid-year. The new name flows through to all associated services and their evaluation displays.

> **Gotcha — renames affect shared services.** When a service is shared between a GME program and a UME course, the GME side can rename the service group, and the renamed name flows through to the UME course's evaluation display. If a sharing arrangement is ending, inactivate the shared service and create a new course-only one rather than disassociating the sharing while keeping the renamed service alive — the rename and other artifacts persist after disassociation.

* * *

## 5\. Shift/Calls `[GME]`

A **shift** is a defined work period; a **call** is a period when the trainee is on duty and must be available for emergent matters. In real-world terminology these are separate, but MedHub combines them into a single "shift/call" activity type. Shift/calls are primarily a GME concept; UME courses occasionally use them but the patterns below are GME-driven.

Shift/call definitions live in `sh_schedules_services_shiftnames`, keyed on `shiftnameID`. Assignments are stored on `sh_tracks_shifts` and joined to slots.

### 5.1 Shift/call definitions

Defined in **Service/Shift Management > Shift/Calls**. Shift/call definitions are scoped to:

*   A program
    
*   An academic year
    

Unlike services, shift/calls are **not** schedule-specific — the same shift/call definition applies across all splits of a program's schedule.

Two types:

*   **Shift/Call (On-site)** — trainee must be physically present. All true shifts fall here.
    
*   **Shift/Call (Home Call)** — trainee does not have to remain on-site but must be reachable and able to return quickly.
    

The type matters for work hours compliance calculations. On-site time counts fully toward work hours; home call counts differently. Setting the wrong type produces incorrect work hours reports — see the Work Hours document for the calculation details.

Shift/call definitions also include: name, abbreviation, hours per day-of-week, site, slot counts for trainees, faculty, and students, and an optional pager number. Shift/calls may cross midnight (e.g. a 6pm–6am call).

The Shift/Call list in **Service/Shift Management** displays the standard hours next to each shift. The label **"varies"** appears when a shift only happens on certain days without a regular pattern (e.g. only on Sundays, or only three weekdays). When hours are consistent across all weekdays, the actual hours are shown.

### 5.2 Associating shift/calls with services

Every shift/call must be associated with one or more services. **The service association is what controls who shows in the shift/call's assignment dropdown on the schedule.**

The rule for trainees: for a given date, a trainee only appears in a shift/call's dropdown if (1) they are scheduled to a service associated with that shift/call that day, and (2) they do not have a scheduled absence for that day.

Faculty are different. **Faculty are not filtered by service association on the shift/call dropdown.** All faculty in the program appear, regardless of whether they're scheduled to an associated service. This is by design — faculty have multiple, simultaneous, often-overlapping ways to be assigned to services (permanent, dated, profile-based, schedule-tab-based) so the system never confidently knows whether a faculty member "should" be eligible. When a client asks "can we restrict the faculty list on the shift dropdown to those assigned to the service" — the answer is no, and it's not a bug.

> **Gotcha — "my resident isn't showing in the Call dropdown."** Walk through in order:
> 
> 1.  Is the trainee scheduled to a service for that day? (Check the rotation schedule.)
>     
> 2.  Is that service tagged to this shift/call? (Check Service/Shift Management > click into the shift/call > scroll to the service association list.)
>     
> 3.  Does the trainee have a scheduled absence that day?
>     
> 
> If the answer to #1 is yes and #2 is no, the fix is adding the service to the shift/call's association list — often including services from other splits of a split-schedule program so trainees across splits can cover the same call.

> **Gotcha — multi-service shifts show trainees twice.** When a shift/call is associated with more than one service, trainees scheduled to the _displayed_ service group appear above a dotted line in the dropdown, and trainees scheduled to _other_ associated services appear below the dotted line. Because trainees may be scheduled to multiple overlapping services in a block, a single trainee can appear on both sides of the dotted line. This is expected behavior.

> **Gotcha — split-schedule "Call Pool" duplication.** A split-schedule program may have a "Call Pool" service on every split. From the Call dropdown, all four versions appear as identical-looking options. Users pick the wrong one and get unexpected behavior. Rename each Call Pool service to include the level ("Call Pool PGY1," "Call Pool PGY2," etc.) so the dropdown is unambiguous.

### 5.3 Sharing shift/calls across programs

Shift/call definitions can be shared across programs by associating the shift/call with services from another program. This is typically used for cross-program coverage (cross-cover, jeopardy, ICU call pools that span multiple specialties). The blue "Share with a service in another program" link at the bottom of the Update Shift page exposes this.

Once shared, both programs can schedule their trainees and faculty to the shift/call.

### 5.4 Granting non-admin shift/call access

Program Administrators can grant residents and faculty write-access to manage the shift/call schedule — typically used so chief residents can build call schedules. From **Service/Shift Management > Service**, click "Assign Schedule Access," select the user, and choose:

*   **This Service** — write access only to this service's shift/call schedule.
    
*   **This Program** — write access to all service shift/call schedules in the program.
    

This grant is scoped to shift/call scheduling only. It does not give the user access to demographics, evaluations, or other sensitive data.

### 5.5 Draft vs. Final status

Shift/call schedules have two statuses:

*   **Draft** — the schedule is being built. Visible to administrators and those with shift schedule access, but not yet "official."
    
*   **Final** — the schedule is committed. Notifies paging (if `setting_paging` is enabled), triggers work hours pre-population for shifts configured for it, and displays as Final to all users.
    

**Automatic finalization.** Shift/calls based on standard service hours auto-finalize at 12:01am the night before the rotation period begins. **Manual finalization** is required for shift/calls that are not based on standard hours, because MedHub doesn't know when the schedule is "done."

Changes made after finalization are reflected in real time and re-notify paging, but **do not** retroactively change already-pre-populated work hours timesheets — trainees still need to verify their pre-populated work hour entries.

(Work hour pre-population mechanics: when a shift is configured with `shift_timesheets` set appropriately, finalization populates the trainee's work hour timesheet for the shift period. Full work hours behavior is documented in the Work Hours section.)

### 5.6 Editing shift/call definitions after they've been used

Once a shift/call has been scheduled, certain definition properties — particularly the work period — cannot be changed. The supported workaround is to "term" the existing shift/call by setting its Date Period to "Date Specific (define below)" and entering an end date, then create a new shift/call with the new definition going forward.

> **Gotcha — red box around a name.** A red box around a trainee's name on the shift/call schedule indicates a potential work hours violation if the schedule stays as-is. The detail of which rule is being violated lives in the Work Hours documentation.

### 5.7 Public call schedule

Some institutions publish a read-only call schedule for distribution outside MedHub (typically for nursing stations, paging operators, or affiliated hospitals). The setup involves the root setting `setting_paging`, with an optional `setting_paging_password` for password protection (leave blank for no password). When enabled, the link is `https://[institution].medhub.com/paging`.

Link viewers see a three-day view of the call schedule with filters by program, call, location, and user type. **Caveat to communicate to clients:** the public call schedule is only as accurate as the data the program coordinators enter. If a coordinator enters wrong call data or doesn't update it, the public viewer relies on stale or wrong information. Treat this as a feature with real coverage-of-care implications.

### 5.8 Shift/call display ordering

Shift/calls display alphabetically on weekly and monthly views. Calls display first, then a hard line, then non-calls. **This order is hard-coded and cannot be reconfigured.** When a client asks for custom ordering, the answer is no.

### 5.9 Shift autogeneration

Autogeneration is a niche batch-scheduling feature for shifts. The pattern: an admin configures a shift to occur on certain days at certain times with a "Q" frequency (Q1 = every day the shift takes place, Q2 = every 2 days, Q3 = every 3 days, etc.), associates the shift with a service, and assigns the trainee to the service. The shift schedule then displays a one-time setup grid where the admin picks the trainee's first day; the system populates the rest at the configured frequency.

Quirks:

*   After the initial autogen pass, the setup grid is gone. To redo a configuration mistake, delete and re-add the service assignment.
    
*   If the trainee's autogenerated shifts are partially deleted, they will repopulate automatically — autogeneration is "sticky."
    
*   Two ways to skip weekends: either configure the shift as Mon–Fri, or configure it for every day and uncheck "Populate weekends." The latter allows manual weekend additions while skipping autogen on weekends.
    
*   Autogeneration does not handle multiple trainees on the same shift via batch — the admin runs the autogen flow per trainee.
    

The feature is not widely used because of its rigidity. Most programs schedule shifts manually or via an external scheduler.

* * *

## 6\. Clinics and Alternate Activities `[GME/UME]`

**Clinics** (also called Continuity Clinics or Alternate Activities) are recurring outpatient or non-rotation activities that occur within a rotation block but are not the primary service. Common examples: weekly continuity clinic, weekly didactics, monthly half-day administrative time, board exam day, away conference attendance.

Clinics live in `sh_clinics`. Clinic definitions live in `sh_clinics_names` and, unlike services and shift/calls, are **not academic-year-specific** — the same clinic definition can be reused year over year.

### 6.1 Clinic definitions and work periods

Clinic definitions are created in **Continuity Clinics/Alternate Activities** (the page under Schedule Management). Each clinic definition has a name, abbreviation, status, optional comments, and slot counts for residents, faculty, and students.

**Work periods** (`sh_clinics_periods`) define time-of-day buckets within which clinic assignments fall — typically AM, PM, AM/PM, and EVE. **Work period names matter for the Amion interface.** Amion clinic imports only recognize work periods named exactly "AM," "PM," "AM/PM," or "EVE" — any extra wording (e.g. "AM Session") will cause Amion-imported clinics to come in marked as cancelled.

Clinics cannot cross midnight (unlike shift/calls).

### 6.2 Sharing clinics across programs

Clinics can be shared between programs. From the clinic definition's page, an admin can select "Update Program List" and check the boxes for additional programs. Once shared, both programs can schedule their trainees to the clinic.

Important constraint: **only the program that authored the clinic can edit or delete a clinic assignment**, even when the assigned trainee belongs to a different program. If Family Medicine schedules an FM trainee to an Internal Medicine-authored clinic, FM cannot later edit or remove that assignment without involving IM. This is by design.

### 6.3 Service-based clinics (auto-population)

A clinic can be tied to a service so that whenever a trainee is scheduled to that service, they are automatically scheduled to the associated clinic(s). The linkage is set on the service definition page, in a "Clinics" panel on the right side.

The program setting `Populate Service-based Clinics/Shifts` controls how many days _before_ the service starts the clinic auto-population runs. Default is 7 days.

The auto-population respects approved absences — if a trainee has an LOA approved for a date, the auto-population does not schedule them to the service-based clinic on that date.

### 6.4 Editing site on a clinic

Site changes on clinic definitions are restricted differently than on services or shift/calls. Because clinic definitions are not academic-year-specific, changing a clinic's site retroactively could rewrite history and break IRIS reporting. As a result:

*   Once a clinic has been scheduled in a previously-locked fiscal year, **Program Administrators cannot edit its site**, regardless of `setting_sitelock`. The recommended workaround is to create a new clinic with the correct site and use it going forward.
    
*   Users with the Super Admin flag (`users.sa = 1`) can still edit the site.
    
*   The `setting_sitelock` root setting can also restrict site editing on newly-created clinics for non-Super Admins.
    

### 6.5 Removing clinic assignments outside the QGenda window

When QGenda is the source for clinics and `qgenda_back_days` is short (e.g. 30), an admin who needs to remove a clinic assignment outside the window can't do it from the standard pencil flow. Workaround: from **Schedules > Clinics subtab**, select the clinic on the dropdown, select the month, choose Modify, and set the trainee dropdown to "(none)" — this removes the assignment without invoking the QGenda interface check.

### 6.6 Identifying where a clinic assignment originated

Click into the clinic assignment from the View by Resident view. The clinic title displays with the origin program's abbreviation appended. If it came from an Amion import, it shows `(amion)`. If it was added manually, only the title appears.

### 6.7 Faculty clinic assignments

Faculty clinic scheduling exists but has gaps the support team should know about:

*   Faculty clinic assignments do not display on the **Schedules > Weekly Activity > Faculty** view. This is a long-standing limitation. Workaround: build a Custom View under Service/Shift Management with the relevant clinics added, then access it from **Schedules > Calls/Shifts** with the custom view selected.
    
*   Unlike faculty service assignments, faculty clinic assignments **do** abide by the schedule lockout — they cannot be added, edited, or deleted in locked months without GME unlocking.
    
*   Removing a faculty member from a course or program does **not** un-schedule their clinic or service assignments. This is intentional to prevent accidental data loss. The proper sequence is: un-schedule the assignments first, then remove course/program access.
    

### 6.8 Duplicate clinic assignments

MedHub does not perform a time-overlap check when scheduling clinics. It is possible (rare, but possible) to schedule a trainee to two identical clinics for the same date and time. IRIS will count each as a separate activity (1/2 day each). The Resident Scheduling Errors report flags potential duplicate continuity clinics as a warning.

* * *

## 7\. Releases `[GME]`

A **release** occurs when a trainee is scheduled to a service in another program for one or more rotation blocks. The trainee's own program is the **home program**; the program they are temporarily scheduled to is the **released program**. Despite being released, the home program remains the only program with access to confidential data on the trainee.

Release records live in `sh_tracks_releases`, with `scheduled_flag` indicating whether the released program has fully scheduled the trainee for the release window. Releases are structurally important to understand because they are where scheduling breaks down most visibly, and because the nuances of how a release is initiated determine who can later edit the assignment.

This section covers intra-institution releases. Releases between separate institutions (institutional release) are covered in §9.

### 7.1 Two ways to release — and why they behave differently

There are two release dropdowns the home admin can pick from on the block editor, and each behaves differently:

**"Common Releases" release.** From the block pencil, the home admin picks the target from the program's pre-built "Common Releases" list and enters the dates. A "Common Release" is any release pattern the program has used at least once before — once a release is set up to a particular service, it shows up as a Common Releases option going forward. Under this dropdown, the **home program retains scheduling control**. Only the home program can edit or remove the assignment. The released program sees the trainee on their schedule but cannot edit.

**"Other Service/Program" release.** From the block pencil, the home admin picks "Release to Other Service/Program" (the language straight out of the user manual), then selects the target program, then either selects a specific service in that program OR selects `> [Program]'s admin will schedule`. Under this dropdown, when `> [Program]'s admin will schedule` is chosen, **scheduling control transfers to the released program**. The trainee shows up in the released program's Urgent Tasks ("Released Residents (unscheduled)"), and the released program's admin schedules them to specific services via the red links (see §7.3).

The `> [Program]'s admin will schedule` option is gated by the root setting `setting_scheduling_release_generic` (default 1, enabled). When disabled, the option is not available and all releases must specify a target service.

Which dropdown is right depends on the situation:

*   If the released program is going to schedule the trainee to multiple services (typical for substantive rotations), use the **"Other Service/Program"** dropdown with `> [Program]'s admin will schedule`.
    
*   If it's a light-touch release where the home program knows exactly what service to put the trainee on, the **"Common Releases"** dropdown is faster.
    

> **Gotcha — "the released program can't edit the trainee's assignment."** The home program used the "Common Releases" dropdown (which kept control with the home program). The released program is stuck viewing without edit access. Two options to fix: (1) home program edits on behalf of the released program, or (2) home program removes the release entirely and re-releases via "Other Service/Program" with the `> [Program]'s admin will schedule` choice.

### 7.2 The correct "Other Service/Program" sequence — and why clicking Submit too early breaks it

When initiating an "Other Service/Program" release from the home program's block pencil:

1.  Click the pencil on the trainee's block.
    
2.  On the next available row, select **"Release to Other Service/Program"** from the dropdown. **Do not click Submit.** The system automatically refreshes the form.
    
3.  The dropdown now reads "Select Program." Pick the target program. **Do not click Submit.** The system automatically refreshes again.
    
4.  The dropdown now reads the target program's name. Pick `> [Program]'s admin will schedule`.
    
5.  Set the release start and end dates.
    
6.  Click Submit.
    

Repeat these six steps for each separate release range within a single block. If the dates span multiple blocks, repeat the full sequence in each block.

> **Gotcha — "the dropdown is blank" is almost always premature Submit.** If the admin clicks Submit at step 2 or step 3 (before the auto-refresh), the form returns a blank or malformed dropdown. The admin thinks the feature is broken. Walk them through the six steps, emphasizing "do not click Submit" at steps 2 and 3.

### 7.3 The released program's scheduling — use the red links, not the pencil

When a trainee is released to a program via "Other Service/Program" with `> [Program]'s admin will schedule`, that trainee appears on the released program's rotation schedule with **red links at the bottom of the schedule** — one red link per distinct release range. The released program's admin clicks each red link to assign the trainee to specific services for that release window. Once scheduled, the trainee's release entry on the home program's schedule transitions from red to black.

**The red links must be used.** Not the pencil in the block. Here is why:

Suppose a trainee is released to a program for two ranges in the same block: 1/2 – 1/10 and 1/14 – 1/30. Two red links appear. If the admin clicks each link in turn and schedules the trainee, the system correctly understands it has scheduled both releases. If the admin instead clicks the block's pencil, the system merges the two releases into a single 1/2 – 1/30 window and allows the admin to schedule that combined range — treating it as one release and leaving the second release technically unscheduled. If the admin then mixes methods (pencil for one release, red link for the other), the result is duplicate or overlapping assignments.

Historical note: the pencil on released-schedule views was removed for a period specifically to force the red-link workflow, then restored after user complaints. The pencil is only displayed on a released trainee's block if the trainee has been manually released to the program at least once. Even when displayed, Product's guidance remains: use the red links.

### 7.4 Releases that span multiple blocks in the released program

A release that fits in one block in the home program may span multiple blocks in the released program (if the two programs use different block lengths). When the released program's admin clicks the red link to schedule, they may get a `SCHEDULING ERROR: Please verify that (a) all days have been assigned and that (b) there are no overlaps` because the link's UI can only schedule within one block at a time.

Two resolutions:

*   **Cancel the release and have the home program's admin schedule it** via the "Common Releases" dropdown so it stays under the home program's control.
    
*   **Run a backend script that pre-populates the underlying tracks** (`schedules_tracks_generate.mh` with `rotationsetID` and `scheduleID`) so the released program's red-link UI can complete the multi-block schedule. This is a Support-side action, run from the root user.
    

### 7.5 Releases and duplicate assignments

"Released resident assignments keep duplicating" is a recurring complaint. The usual causes:

1.  **Mixed pencil-and-red-link scheduling on the released side.** (See §7.3.)
    
2.  **A prior bug** where released-side assignments appeared in the block but disappeared when clicked into, forcing the home program to re-release, which created duplicates. Historical; corrected.
    
3.  **Partial-block lockout interactions** — editing the unlocked portion of a partially-locked block can cause the locked portion's assignment to duplicate. Recurring symptom; check whether the trainee is a release and whether the block spans a lockout boundary.
    
4.  **Training history adjusted after assignments were created.** If a trainee's training history end date is shortened after an assignment was added, the assignment can persist as a "ghost." Fix: temporarily extend the training history record to cover the assignment's date range, remove the assignment, then revert the training history.
    

The correct cleanup for duplicates is: unassign everything for the release window, then reschedule using only the red links. Do not selectively delete one of the duplicates — the system can behave inconsistently when there are two records for the same service/date/trainee.

### 7.6 Releases and evaluations

The home program **cannot** deliver automated evaluations on a trainee's released rotation. Evaluations tied to a service must be delivered by the program that owns that service. There are three common workarounds:

1.  **Release and let the released program evaluate.** The home program shares its evaluation form with the released program in read-only mode so the wording is consistent. The completed evaluation still lives in the home program's View Completed Evaluations because evaluations belong to the target's home program. This is the cleanest pattern and is the primary reason many clients release in the first place.
    
2.  **Don't release — recreate the service locally.** The home program creates a service named something like "Away – OBGYN" in its own schedule, adds the external faculty as off-program evaluators, and tags them to the new service. Automated evaluations can then be configured as usual. This is messier, especially when many faculty or services are involved, but it keeps everything under the home program's direct control.
    
3.  **Don't release and deliver manually.** The home program adds the external faculty as off-program evaluators and delivers each evaluation by hand based on a spreadsheet or form the trainee returns listing who they worked with.
    

### 7.7 The Released Residents Urgent Task

The home page Urgent Task **"Released Residents (unscheduled)"** alerts a released program's admin to releases that need scheduling. Two important details:

*   The Urgent Task counts releases from **180 days before today through 180 days after today** — a rolling window, not the academic year.
    
*   The **list of unscheduled trainees displayed at the bottom of the rotation schedule** uses the **selected academic year** of the schedule view, not a rolling window.
    

These two scopes overlap but are not identical. A release that falls in the academic year but outside the rolling window appears on the schedule's bottom list but not in the Urgent Task. A release inside the rolling window but in a different academic year appears in the Urgent Task but not on the current schedule. Clients sometimes report this as a discrepancy; it's the design.

The Urgent Task counts release **records**, not unique trainees. A trainee released to ANES for two consecutive periods produces two release records and counts as two in the Urgent Task.

The bottom-of-schedule unscheduled list only displays for **unlocked schedules and the current academic year** — historic schedules or fully locked schedules don't show the list.

### 7.8 Release date corrections after the fact

If a release's dates need to change because the underlying training history end date was wrong, modifying the training history and the rotation schedule does **not** flow through to the release record. Cancelling the release and re-releasing also doesn't work — the system tracks releases by name + start date and won't re-offer a release matching a previously-cancelled one.

The supported fix is manual: Support removes the release records from the system entirely (which makes the trainee re-appear in the GME user's "identify residents for release" list), then the release is recreated with the correct dates. Training history records are then updated separately to match.

* * *

## 8\. Faculty Scheduling `[GME]`

Faculty scheduling is conceptually simpler than trainee scheduling, but it's the source of a surprising number of tickets because there are three methods and using more than one at a time causes duplicate evaluations.

The root setting `settings_schedule_faculty` (default 1) gates whether faculty scheduling is available at all. The setting `settings_schedule_faculty_color` controls the default display color for faculty on the schedule.

Faculty service assignments live in `sh_faculty`; faculty clinic assignments in `sh_faculty_clinics`; faculty shift assignments in `sh_faculty_shifts`. Permanent assignments live in `users_faculty_programs_services`.

### 8.1 Three methods — pick exactly one per faculty member

1.  **Faculty profile > Schedules subtab** — for date-bounded assignments. Open the faculty member's profile, go to Schedules, click **+Add Service**, pick the service and date range. Best when the faculty moves around and works with different services through the year.
    
2.  **Schedule tab > Faculty view** — also for date-bounded assignments. Click the pencil in a block on the Faculty view of the rotation schedule. Equivalent to method 1 but from the rotation schedule interface.
    
3.  **Faculty profile > Program/Services subtab** — for permanent/indefinite assignments. Open the faculty profile, go to Program/Services, and check the services the faculty is permanently on. The system treats them as assigned to those services for the entire academic year, every year, until unchecked.
    

> **Critical rule — do not mix methods for the same faculty.** Using method 3 (permanent) and then also adding dated assignments via method 1 or 2 will cause MedHub to issue duplicate automated evaluations for any period the two methods overlap. If a faculty member is on a service for the full year, use permanent. If their schedule varies, use dated. Never both.

### 8.2 Faculty must be scheduled for evaluations to fire

A frequent cause of "automated evaluations didn't fire" is that trainee schedules are complete but **no faculty are scheduled to those services.** Without faculty assignments, the system has no "from" and "to" to match on. Before escalating an automated-eval issue, always confirm faculty scheduling is in place for the service in question.

### 8.3 Permanent faculty assignments via service groups

When a faculty member is permanently assigned to a service (method 3), the assignment applies to every service in the same service group. This is why shared service groups matter on split schedules: one permanent faculty assignment on the group propagates to the PGY1, PGY2, and PGY3 versions of that service without having to set each one individually.

Permanent assignments display on the **Services (All)** view of the rotation schedule when the program setting `Display Permanent Faculty Assignments` (`setting_faculty_permanent` on `sh_schedules`) is enabled.

### 8.4 Half-day scheduling — use shifts or clinics, not services

Services are full-day only. If a faculty member or fellow works a half-day at one location and a half-day at another, the scheduling is done via:

*   **Half-day shifts** — create a Shift/Call with a half-day work period, tagged to the appropriate service, and assign on the Shift/Call schedule.
    
*   **Half-day clinics** — create a Clinic with an AM or PM work period, and assign on the Continuity Clinics view.
    

### 8.5 Archiving faculty does not unschedule them

When a faculty profile is archived, their service, shift/call, and clinic assignments **are not removed**. This is intentional — the archive flag is meant to hide the user from active rosters without destroying historic data. The proper sequence to remove a faculty member is: unschedule from all services, shift/calls, and clinics first, then archive.

### 8.6 Faculty assignments crossing block boundaries — known display bug

When a faculty member is scheduled via method 1 (profile Schedules subtab) and the assignment crosses a block boundary, clicking the assignment from the **Schedule tab > Rotations > Faculty view** to navigate to the associated shift/call schedule can produce a blank shift/call layout with `12/31/1969` dates. The system can't determine which block's shift/call schedule to display. Workaround: navigate to the shift/call schedule from the **Calls/Shifts subtab** directly, or click into the shift/call schedule via the resident view of the same block.

### 8.7 Faculty incoming-trainee email alerts

Service groups can be configured to email faculty when trainees are about to start a rotation in that group. Configured under **Service/Shift Management > Service Groups > \[select group\] > Email Faculty on Incoming Resident(s)**. The recipients dropdown supports:

*   **Service Heads** — designated heads of that service group
    
*   **Faculty – Permanent Assignments** — faculty permanently scheduled to the group
    
*   **Faculty – Scheduled** — faculty scheduled to the specific service via dated assignments
    
*   **Faculty – Other** — write-in list of email addresses
    

Recipients only receive the email if they are scheduled to the service before the first day of the rotation period. Late-added faculty are not retroactively emailed.

The same setup also delivers curriculum goals/objectives associated with the service, if defined.

* * *

## 9\. Institutional Release `[GME]`

Beyond intra-institution releases (§7), MedHub supports **institutional release** — a structured workflow for releases between programs at different institutions, regardless of whether the receiving institution runs MedHub. Institutional release is gated by the root setting `settings_affiliate` (the legacy setting name "affiliate" predates the current product name).

This document covers only the scheduling-side mechanics. The full institutional release workflow (approval, billing implications, contract handling, settings reference, and operational scenarios) is documented in the dedicated child page **MedHub - Institutional Release**.

> **Gotcha — institutional release date corrections.** The same constraint as intra-institution releases applies: changing the underlying training history and schedule does not flow through to the institutional release record. The system tracks releases by name + start date and won't re-offer cancelled releases. Manual cleanup by Support is the supported path.

* * *

## 10\. How Absences Display on the Schedule `[GME]`

This document covers only the display and interaction of absences with the rotation schedule. The full absence approval workflow, LOA training extension mechanics, and the ACGME-related rules are documented separately.

### 10.1 The "trainees should always be scheduled to a service, even during absences" rule

Best practice — and the basis of how IRIS calculates billing time — is that trainees have a service assignment for **every day** of their training history record, even during vacation, sick days, conferences, and most LOAs. The absence is recorded _on top_ of the service assignment, and the service is what attributes the time for billing.

The exception is **LOA periods that extend training**. If an LOA extends the training history end date by N days, the extended period (which falls outside the original training year) does not need a service assignment. The system pushes the trainee's end date back by the extension length, and a new service assignment can be added later for the extended portion if needed.

Example: a trainee is on LOA from 3/1 to 4/30, and 30 days of that period extend training. Service assignments should be in place for March (the trainee's normal service). April doesn't need a service assignment because the 30-day extension covers it. The trainee's original 6/30 end date moves to 7/30, and a service assignment must then be scheduled for July.

The root setting `settings_iris_loa_overlap` controls whether non-extending LOA time is attributed to the overlapping service (1) or the institution's default site (0, default).

### 10.2 Display of absences on the rotation schedule

Approved absences display on the rotation schedule as text overlays in the relevant blocks, with the absence type indicated. The rotation schedule blocks themselves still show the service assignment underneath (per §10.1).

The Resident Scheduling Errors report flags as **warnings** (not errors):

*   An absence recorded on the same day as a continuity clinic
    
*   An absence recorded for the same day as a Continuity Clinic/Alternate Activity (these two appear redundant but are distinct entries in the report)
    

### 10.3 Approving an absence inside a locked period — the single-resident unlock pitfall

When an admin needs to approve an absence in a locked month, GME typically issues a schedule unlock. **If GME issues the unlock for a single resident only**, the admin can hit a frustrating wall: the Resident Absences page is a batch-approval page, and the approval action checks whether the entire program is unlocked — not whether the specific resident is unlocked. A single-resident unlock will produce a "Potential Scheduling Conflicts" error when the admin tries to approve from the batch page.

Two resolutions:

*   **Click "view/modify" for the specific resident's absence** and approve the absence individually from that page rather than from the batch-approval page.
    
*   **GME issues the unlock for "All Residents"** in the program rather than for a single resident.
    

Recommend the latter as a standing practice when an unlock is going to involve any absence approvals.

### 10.4 Vacation as a service — don't

Some programs have created a service literally named "Vacation" and scheduled trainees to it during vacation periods. CMS may view this as gaming, since vacation time should be attributed to whatever service the trainee was actively rotating on. The supported pattern is per §10.1: schedule the trainee to the actual service for the full period and record vacation as an absence on top.

### 10.5 Auto-population of clinics during LOA

When the program setting `Populate Service-based Clinics/Shifts` is on, the auto-population respects approved LOAs — trainees are not auto-scheduled to service-based clinics on dates they have an approved absence.

* * *

## 11\. Training History and Schedule Display `[GME]`

The **training history record** is the single most underestimated piece of scheduling plumbing. A trainee only appears on a schedule if their training history record matches that schedule's level and date range. Most "the resident isn't showing on the schedule" tickets are training-history problems.

Training history records are stored in `users_residents_pg`, with per-appointment level/program/scheduleID detail in `users_residents_pg_appt`. Visiting trainee periods are tracked separately in `users_residents_spt`.

### 11.1 What training history records control

A training history record binds a trainee to:

*   A **program**
    
*   A **level** (1, 2, 3, ...)
    
*   A **date range** (start date through end date)
    

For that trainee to appear on a given schedule, the record's program must match the schedule's program, the record's level must match the schedule's level (for split schedules), and the record's date range must overlap the schedule's academic year.

Training history records are managed in the **Training History tab** of the trainee's profile, with a Modify button next to each record.

### 11.2 The overnight sync

Training history changes do not take effect immediately. An overnight sync updates schedule displays. A client who makes a training history change at 3pm and expects to see the trainee on the schedule at 3:01 will be disappointed. Preempt this with "the change will be visible after tonight's overnight sync."

### 11.3 Split schedules and the 7/1 boundary

When a program has a split schedule, training history records must have a clean 1-to-1 relationship with the split they're associated with. A training history record that crosses 7/1 (the academic year boundary) cannot associate with both academic years' schedules at once.

Example: trainee has a record `6/25/2018 – 6/23/2019` (PGY1) and another `6/24/2019 – 6/21/2020` (PGY2). They should appear:

1.  On the 2018–2019 PGY1 schedule for most of the year.
    
2.  On the 2018–2019 PGY2 schedule for the final block.
    
3.  On the 2019–2020 PGY2 schedule for most of the year.
    

For #2 to work, the record has to cleanly cover the 6/24 – 6/30 window of the 2018–2019 academic year on the PGY2 schedule.

This is usually fine until the program changes its split structure. When that happens, the backend recreates the schedule record (literally a new `scheduleID`), and any training history record that crosses 7/1 must be **force-split** into two records: one ending 6/30 and one starting 7/1. The reconfiguration script does this automatically and also:

*   **Splits the trainee's contract.** The trainee ends up with two contracts, one per record. The original full-range contract is preserved in the Forms/Files tab; the trainee does not re-sign.
    
*   **Removes the rotation dates from the dropdown for the force-split trainees,** because the underlying schedule ID changes.
    

**Always CC the GME office** when a reconfiguration force-splits training history records — they need to know contracts were split for auditing and HR-adjacent purposes.

### 11.4 Firm-based schedules and crossing PGY levels

In a firm-based schedule, when a trainee's training was extended from the previous year and they have two different PGY levels appearing on the same schedule, the trainee must be assigned to a firm for **both** sets of dates — one firm assignment per PGY level. If only one is set, the trainee appears greyed out for the other PGY's date range. Fix: **Service/Shift Management > Firms** > find the trainee > add the missing firm assignment for the second set of dates.

### 11.5 Common training-history-root-cause tickets

*   **"PGY2 not showing in my dropdown."** Training history level still set to 1. Modify the record.
    
*   **"The resident isn't on my 2020-2021 schedule."** Their 2020–2021 training history record doesn't exist, has the wrong level, or hasn't overnight-synced yet.
    
*   **"The resident is on the wrong split."** Training history level doesn't match the intended split. Modify.
    
*   **"I see the resident but the block dates are wrong."** Likely a Service view displaying an assignment on a different split (see §3.3), or a training history record that wasn't cleanly split at 7/1.
    
*   **"Ghost service assignment that won't go away."** Training history was shortened after the assignment was created, leaving the assignment outside the now-shorter training period. Temporarily extend the training history to cover the assignment, remove the assignment, revert the training history. (See also §13.6 — Lost Activities Wizard.)
    

* * *

## 12\. Schedule Lockout, Edit Windows, and Site Lock `[GME/UME]`

Schedule data integrity matters because many downstream processes (billing, IRIS reimbursement, milestone reporting) depend on it being stable and correct. MedHub enforces this via a rolling lockout for manual edits, plus per-channel edit windows for API calls and external scheduling interfaces. The four channels are independent of each other.

### 12.1 Manual lockout — the `workflowA` rolling lockout

The standard rolling lockout for Program Administrators is configured in the root setting `workflowA`, an array indexed by user type. The first integer in each user type's row is the **day of the month** after which that user type loses write access to the prior month's data.

Relevant user types:

*   **3 = Program Administrator** — locked out of editing the prior month's rotation schedule, work hours, absences, and continuity clinic assignments after this day.
    
*   **5 = GME Office** — typically not locked, since GME is the unlock authority.
    
*   **6 = Hospital Finance** — separate fiscal lockout.
    

Most institutions set day 15 (locked on the 15th of each month, going back). UCSF and a few others set day 1. Setting day 0 disables the lockout for that user type (rare).

> **Gotcha — the lockout is at the day level, not the block level.** If a block spans two months and the lockout day falls between them, the prior-month portion locks while the current-month portion remains editable. This **partial-block lockout** is the setup that produces the "editing the unlocked portion duplicates the locked portion's assignment" pattern (see §13.2). Always check whether a block is partially or fully locked when triaging "I can't edit this" or "this assignment duplicated."

### 12.2 GME unlocks

Only the GME Office can unlock a locked period. Program Administrators who need to edit locked dates request an unlock through GME. Unlock records live in `admin_rotations_unlock`.

The "Unlock Rotations" page lets GME specify the program(s), the date range, the deadline for the unlock, and an optional notification email to the affected admin. Two important behaviors:

*   **The "Notify by Email" checkbox only controls the initial unlock notification.** It does _not_ control the "Schedule Unlock Expires Tomorrow" reminder email, which is generated by a server-side cron a day before the unlock expires. The reminder cannot be deactivated, but if GME deletes the unlock before the reminder cron runs, no reminder is sent.
    
*   **Unlocks are typically scoped to the program (all residents in the program)**, but can be scoped to a single resident. A single-resident unlock can interact poorly with the batch absence-approval page (see §10.3) — recommend program-wide unlocks unless there's a strong reason otherwise.
    

The list of users who can perform unlocks is controlled by `setting_unlock_userA` (default `5:6`, meaning GME and Finance).

### 12.3 The four edit windows — one per channel

The lockout in §12.1 governs **manual edits by Program Administrators**. Other channels for editing the schedule have their **own** independent windows. The four channels:

Channel

Back-window setting

Forward-window setting

Default back / forward

Visible to client

Manual (Program Admin)

`workflowA` (rolling, by day-of-month)

n/a (prospective is unlimited)

varies (typically 15) / unlimited

No

API

`api_schedule_back_days`

`api_schedule_forward_days`

30 / 360

Yes

Amion

`setting_amion_backdays`

n/a (forward is implicit)

14 / —

No

QGenda

`qgenda_back_days`

`qgenda_forward_days`

14 / 70

No

ShiftAdmin

`setting_shiftadminA[backDays]`

`setting_shiftadminA[forwardDays]`

30 / 180

No

Spinfusion

(configured in `sh_spinfusion`)

(same)

varies

No

**Critical detail on the Amion and QGenda settings:** values of `0` are read as null and the system falls back to the default. The lowest _meaningful_ value is `1`. If a client sets QGenda back days to `0` expecting the sync to stop reaching back at all, they'll be surprised — it'll behave as the default (14 days). To restrict to just yesterday and forward, set `1`.

> **Verifying current default values for these settings.** The defaults shown in this table reflect the April 2026 root settings export. For the current default and description of any setting, the canonical source is `support.medhub.com > Lists > Settings`. Older documentation has at times referenced different defaults (for example, `setting_amion_backdays` was previously documented as 90); when triaging a window-related ticket, check the institution's actual current setting value rather than assuming any documented default.

> **How "back days" actually checks dates.** The interface checks whether **any** day of the assignment falls within the back-days range from today. So an assignment with end date inside the window can still be edited, even if its start date is older. Example: an assignment running 4/1 – 6/30 can be edited via QGenda when `qgenda_back_days` = 30 and today is 5/15, because part of the assignment falls within the window. This is what trips up clients with quarterly blocks.

> **The release programs setting for Amion.** `setting_amion_released_programA` limits which programs can have residents pulled from for release purposes. An empty array means all programs are available; an array `[0]` disables the cross-program pull entirely.

### 12.4 Temporarily extending an interface back-window

Occasionally, a program needs to pull interface-sourced assignments from further back than the current window allows — for instance, a program onboarded to Amion mid-year that needs July and August pulled in November. The process:

1.  **Confirm GME approval.** These settings are institution-wide, so extending one temporarily affects every program at the institution during the pull. Get written approval from GME before touching anything.
    
2.  **Calculate the needed value.** E.g., to pull back to 7/1 from 10/24, set `setting_amion_backdays` to 115.
    
3.  **Update the setting.** This is a root-side change.
    
4.  **Force-pull the specific program's schedule.** Only the program(s) being force-pulled are affected in practice, because no other program is on a sync cycle that triggers during the pull.
    
5.  **Restore the setting to its default before the next automated sync runs.** Failing to restore means the next overnight sync reaches much further back than intended for every program at the institution.
    

### 12.5 Site Lock

Some institutions restrict who can set the site value on service, shift/call, or clinic definitions, because site ties directly to billing and IRIS. Site Lock is enabled via the root setting `setting_sitelock` (default 0).

When enabled, definitions are created with a generic "to be determined" site (configured in `setting_sitelock_siteID`, default 462). GME is notified, determines the correct site, and adds it. The setup involves an institution-side Alerts > Site Requests configuration to designate the GME user(s) who receive site-determination requests.

Behaviors:

*   **Program Administrators can edit the site only on newly-added activities** when Site Lock is off. They cannot edit the site on activities that have already been used in a locked fiscal year, regardless of the Site Lock setting.
    
*   **Super Admins (**`users.sa = 1`) can always edit site values, even with Site Lock enabled.
    
*   For API-based creation under Site Lock, do not send a site value. MedHub auto-assigns the placeholder site and triggers the GME workflow.
    
*   The setting `setting_default_selected_siteID` controls the default site shown in pull-down menus when adding new activities (used when Site Lock is off but the institution wants a "Site Unknown" default).
    

* * *

## 13\. Troubleshooting Framework `[GME/UME]`

Scheduling issues tend to cluster around a handful of root causes. When a client reports a scheduling problem, this framework narrows the likely cause quickly.

### 13.1 Ask the symptom category

Every scheduling ticket lands in one of these buckets:

*   **Missing trainee** — "the resident isn't showing on the schedule" or "they're not in the dropdown."
    
*   **Cannot edit** — "I can't change this assignment" or "the dropdown is blank."
    
*   **Duplicated assignment** — "the assignment duplicated itself" or "I can't delete this duplicate."
    
*   **Ghost assignment** — assignment shows on the schedule but doesn't appear when clicking the pencil.
    
*   **Primary service error** — "Exactly one primary service not designated for overlap."
    
*   **Undefined activity** — "N days of undefined activity between..."
    
*   **Released resident issue** — anything involving the word "released."
    

Each symptom maps to a likely root cause described below.

### 13.2 The three patterns behind most tickets

**Pattern 1 — Training history mismatch (explains most "missing trainee" and "wrong schedule" tickets).** Go to the trainee's Training History tab first, always. Check level, date range, and whether the record crosses 7/1 on a split schedule. Also check whether the record was shortened after assignments were created (ghost assignment cause).

**Pattern 2 — Lockout interaction (explains most "cannot edit," "duplication," and "changes aren't sticking" tickets).** Determine whether the block is partially or fully locked. Check whether the client is using an interface (Amion/QGenda/ShiftAdmin) and whether the edit window is in play. If manual edits keep reverting, it's an interface issue overriding them.

**Pattern 3 — Release done wrong (explains most "cannot edit," "dropdown is blank," and "release is duplicating" tickets).** Determine which dropdown was used (Common Releases or Other Service/Program) and whether the released program is using the red links or the pencil. The fix is almost always either re-releasing via the correct dropdown or having the appropriate program do the edit.

### 13.3 The diagnostic sequence

For any scheduling ticket:

1.  **Reproduce the client's click path.** The most common "the feature is broken" reports turn out to be premature Submit during the "Other Service/Program" release sequence, or using pencil instead of red links, or the View vs. View asymmetry on assignment removal. Walk them through with screen share.
    
2.  **Check training history first.** Level, dates, split-boundary integrity, post-creation shortening.
    
3.  **Check lockout state.** Fully locked, partially locked, interface edit window.
    
4.  **Check audit.** The GME-side schedule audit (`sh_audit` / `sh_audit_changes`) shows far more detail than the Audit Trail Query — it includes which user made which change at what time, and what `change_method` (manual=1, auto=2, standard interface=3, custom interface=4, absence approval=5). Use this for any "who did this" question.
    
5.  **Decide: fix-in-place, rerun wizard, or escalate.** If the schedule is structurally wrong (wrong blocks, wrong split), deleting and rerunning the wizard is almost always faster than surgical edits. If the symptom is a data anomaly (phantom services, ghost shift/calls, duplications that don't respond to cleanup), escalate to second-tier or development with reproduction steps and audit screenshots.
    

### 13.4 The audit tools — know both

*   **Audit Trail Query** (accessible to Program Admins) — limited schedule-change visibility. Shows some changes but not always who made them. Note: certain audit types (e.g., Security – Faculty Modified) only record API-driven changes, not manual ones — this is a known gap in the report's coverage.
    
*   **Schedule Changes** (GME Office only, sourced from `sh_audit` and `sh_audit_changes`) — full detail. Shows who changed what when, queryable by trainee or by program. When investigating cause, recommend GME pull this — do not rely on the Audit Trail Query.
    

### 13.5 Repair Shift Schedule

When trainees aren't showing for a shift/call that should include them and the cause isn't training history or service association, there's a Support-side task script called **Repair Shift Schedule** accessible from the support user home page under the Schedules tool block. This re-runs the matching logic and clears stale records. Use after exhausting the normal diagnostic checks.

### 13.6 Lost Activities Wizard

The **Lost Activities Wizard** (`setting_wizardA` index 8) removes scheduled activities — service assignments, shift/call assignments, clinic assignments — that fall outside a trainee's training history period. These activities surface as warnings on the Resident Scheduling Errors report and can produce phantom assignments that block other operations.

Available at **Home → Task Wizards → Lost Activities Wizard**. Default access is GME-only; the setting can be configured per institution if Program Administrator access is needed.

#### When to run it

The wizard is the right tool when:

*   The Resident Scheduling Errors report shows scheduled activity outside training history.
    
*   A trainee's training history was shortened after assignments were added, leaving "ghost" assignments outside the new training period.
    
*   A reconfiguration force-split a training history record and orphaned assignments outside the resulting boundaries.
    

It is _not_ the right tool for:

*   Removing assignments inside the training history period (use the schedule's pencil icon).
    
*   Removing release records (those require Support cleanup — see §7.8).
    
*   Removing assignments outside the lockout window without unlocking first (the wizard respects lockout boundaries).
    

#### How it works

1.  Open the wizard.
    
2.  Select the trainee's program from the dropdown.
    
3.  If the trainee appears in the list (meaning they have lost activities), select their name.
    
4.  Click Next Step.
    
5.  The wizard displays the lost activities (services, shift/calls, clinics) that fall outside the trainee's current training history record.
    
6.  Confirm removal.
    

The wizard processes one trainee at a time. For institutions with many affected trainees after a major reconfiguration, this is tedious — but it is the supported tool. There is no batch mode.

#### Common patterns

*   **A trainee shortened their training history end date and now has a ghost assignment.** Run the wizard for that trainee; the ghost assignment is removed.
    
*   **A reconfiguration split a training history record at 7/1 and assignments before/after the split are orphaned.** Run the wizard; affected assignments are cleaned up.
    
*   **Wizard shows no lost activities, but the Resident Scheduling Errors report still flags the trainee.** The errors may be coming from a different cause (release issue, primary service designation, undefined activity _within_ training history). Lost Activities Wizard only catches assignments _outside_ training history.
    

* * *

## 14\. Interface Integrations `[GME]`

Most clients use one or more external schedulers. The integrations behave differently enough to be worth calling out individually. Database tables: `sh_amion`, `sh_amion_*` mappings, `sh_qgenda`, `sh_qgenda_*` mappings, `sh_shiftadmin`, `sh_shiftadmin_*` mappings, `sh_spinfusion`, `sh_spinfusion_*` mappings, `sh_momentum`, `sh_momentum_*` mappings.

### 14.1 Amion

Amion imports into MedHub via the Amion Scheduling Interface. The sync is configured per program through the Amion task wizard.

**Mapping is directional.** In the Amion task wizard, each Amion service is mapped to a MedHub service that will display for any assignment to that Amion service. One MedHub service can receive from multiple Amion services (no ambiguity — MedHub just displays the mapped service). But one Amion service cannot map to multiple MedHub services, because the system cannot decide which to display.

> **Gotcha — single Amion schedule, split MedHub schedule.** Clients with a split MedHub schedule often have a single Amion schedule for the whole program. The Amion task wizard won't let them map an Amion service to both the PGY1 and PGY2–3 versions of its MedHub counterpart. Practical fix: map all Amion services to the PGY1 side and rely on the shared service group to propagate faculty permanent assignments to the PGY2–3 services. Flag that automated-evaluation-by-rotation-date timing may be slightly off because the auto-eval rule respects the schedule tied to the service.

> **"Two users mapped to the same Amion ID" errors.** When a trainee and a faculty share a last name, Amion may map both MedHub users to the same Amion user ID. The first one loaded wins; the second is blocked. The interface error report lists exactly which pairs conflicted. Fix by correcting the Amion-side user mapping.

> **Faculty type mapping.** If no faculty types are mapped in the interface settings, the Amion faculty dropdown in MedHub pulls from trainees instead. Always check faculty type mapping is configured before assuming faculty data is missing.

**Limited Amion accounts (faculty-shifts-only).** Some clients have Amion accounts that only contain faculty shifts and don't import services or trainees ("no Blocks word in upper left"). MedHub is not designed to import shifts without their associated services — without the service, MedHub doesn't know how many faculty slots the shift has. Faculty assignments will arrive but won't display in the standard shift/call views. Workaround: use the Schedules > Clinics subtab "ON CALL" monthly view, select a service, and view faculty there. This is a known enhancement gap, not a bug.

**Amion clinic work period names.** Amion clinic imports only recognize work periods named exactly `AM`, `PM`, `AM/PM`, or `EVE`. Work periods with extra words (e.g. "AM Session") cause Amion-imported clinics to come in marked as cancelled.

**Removing Amion-imported assignments.** To remove previously-imported assignments going forward, **leave the Amion wizard mapped and uncheck the assignments to import** — do not set them to "Do Not Import" and don't fully unmap. The interface needs the existing matching to know which assignments to remove on the next sync. Setting matches to "Do Not Import" or fully unmapping breaks the matching, leaving the previously-imported assignments orphaned in MedHub.

### 14.2 QGenda

QGenda imports similarly but has one behavior worth calling out.

> **Gotcha — QGenda-imported assignments fail automated evaluations.** If QGenda has trainees scheduled in 1–2 day increments, MedHub imports them that way. The per-service minimum-day threshold for triggering an automated evaluation (typically 6 days) is never hit. No evaluations fire. The fix is on the QGenda side: build services in continuous blocks and use shift/call for the daily granularity.

QGenda also doesn't support a Primary service designation — when overlapping services are imported, the Primary must be set manually in MedHub after the sync (and won't be overwritten on subsequent syncs).

When two MedHub programs are configured to import from the same QGenda mapping, only one MedHub program will receive the import. This is by design — QGenda treats the mapping as 1-to-1. If both programs need the same QGenda data, one of the MedHub programs must establish its own QGenda mapping.

### 14.3 ShiftAdmin

ShiftAdmin imports shifts (not services or clinics). Configured via `setting_shiftadminA`, which is an array containing `backDays` (default 30) and `forwardDays` (default 180). Mappings live in `sh_shiftadmin`, `sh_shiftadmin_shifts`, `sh_shiftadmin_users`, `sh_shiftadmin_programs`.

### 14.4 Spinfusion, OpenTempo, Momentum

These are less common interface integrations with similar back-day/forward-day mechanics. Specific configuration is generally one-off; defer to the interface task wizard for setup. Database evidence of which interface created or last touched an assignment lives in `sh_tracks_slots.amion_flag` (1=amion, 2=spinfusion, 3=opentempo, 4=momentum) and the parallel `*ID` columns on the slot record.

### 14.5 The "auto-generate using appointments" behavior — UME-specific

This is not an external interface; it's a UME course rotation period option that derives block dates from course enrollments. Covered in §2.4. Setup of course enrollments is documented in the Enrollments section.

* * *

## 15\. Schedule Confirmation `[GME]`

Some institutions use a **Schedule Confirmation** workflow — a monthly admin attestation where Program Administrators (and optionally Program Directors) sign off that a scheduled period is complete and accurate before it locks. The workflow is term-translatable; clients call it "Schedule Verification," "Schedule Confirmation," or "Re-verification" depending on `setting_schedule_confirm_labelStr`. **It is admin-side only — trainees do not participate**, despite some institutions branding it as if they do. The actual signers are Administrators (always) and Program Directors (when `setting_schedule_confirm_esign` includes `2`).

Records live in `sh_confirmations`. The workflow operates on **service rotations only** — not shifts/calls, not clinics. Initial enablement is non-trivial: it requires both a root-setting flag _and_ a developer-side cron entry. Talk to a developer when first turning it on.

### 15.1 Why an institution turns this on

The mechanical purpose: produce a per-month, per-program audit trail of administrative attestation that the rotation schedule reflects what actually happened, _before_ the month locks. Once attested, the program coordinator can no longer claim later that "the schedule was wrong all along" — there is a signed record. This is most often turned on at institutions where IRIS reimbursement, GME funding, or institutional compliance audits demand documented monthly closeout.

A program with `setting_schedule_confirm_mode = 2` confirms only **IRIS-reimbursable programs**. With mode `1` (default), all programs confirm.

### 15.2 The monthly cycle

The cycle is calendar-driven, not academic-year-driven:

1.  **A Schedule Confirmation period opens each month** based on `setting_admin_confirm_release` (format `month:day`, default `0:1` = first day of the current month). On the release day, an "Unverified Schedules" Urgent Task appears for Administrators, and the Primary Administrator receives an email.
    
2.  **The notification email fires 8 days before the schedule lockout date** (the same lockout from `workflowA` that governs prior-month edits — see §12.1). The 8-day offset is not configurable. Carefully choose the institution's lockout date in `workflowA` knowing the email will land 8 days earlier.
    
3.  **The Administrator opens the Unverified Schedules task** and reviews the prior month's rotation schedule. If everything is correct, they e-sign the attestation statement (text from `setting_schedule_confirm_esign_language`). If something is wrong, they fix the rotation schedule first — the program coordinator can still edit until the monthly lockout date occurs, _even if the schedule has already been confirmed_ for that month.
    
4.  **Optional second e-sign by the Program Director.** If `setting_schedule_confirm_esign` has the value `2` in the workflow definition (e.g. `3:2s` means admin approves, then PD signs), the PD receives an Urgent Task after the admin's signature. The PD reviews and e-signs. **The PD must have a signature image uploaded to their faculty profile** — see §15.6.
    
5.  **The lockout occurs** on the day specified by `workflowA`. After lockout, only GME can unlock for further edits.
    

The cycle repeats every month. There is no "backlog" mode — once a month locks without confirmation, that month shows as Unverified on the GME view permanently (unless re-confirmed via the backfill script in §15.5).

> **Gotcha — confirmation does NOT lock the schedule.** A confirmed schedule can still be edited by the Program Coordinator until the monthly `workflowA` lockout date occurs. Confirmation is an attestation, not a lock. The actual lock is the separate `workflowA` mechanism. (Ticket confirmed by TM.)

### 15.3 Who can confirm

*   **All Administrators** of the program can confirm a schedule and clear the Unverified Schedules urgent task — Primary, Backup, or any other admin with the role.
    
*   **Only the Primary Administrator** receives the email notification 8 days before lockout. Backup admins do not get the email but can still see the urgent task and can complete the confirmation.
    
*   **The Program Director** signs only when `setting_schedule_confirm_esign` includes `2` (the PD step). Their Urgent Task only appears after an admin has already signed.
    
*   **GME Office** does not sign by default. To include GME as a third signer, append `5s` to the workflow string (e.g. `3:2s:5s`).
    

(Confirmed TM.)

> **GME does not have a way to send manual reminder emails through MedHub** to programs that haven't confirmed their schedule. The 8-days-before-lockout email is the only automated reminder. If GME wants to follow up on stragglers, they have to do it outside MedHub. (Confirmed BG.)

> **The confirmation does not remind admins to address other monthly tasks** — outstanding absence approvals, unsubmitted work hours, pending evaluations. It is purely a rotation-schedule attestation. (Confirmed BG.)

### 15.4 What's in scope — and what isn't

**In scope:** Service rotation assignments only. The admin attests that the rotation schedule for the prior month is complete and accurate.

**Not in scope:**

*   Shift/Call schedules
    
*   Continuity Clinics / Alternate Activities
    
*   Absences
    
*   Work hours
    

If a program asks "should our shift schedule confirmations also flow through this," the answer is no — Schedule Confirmation is a rotation-only feature. (Confirmed BG.)

### 15.5 Retroactive confirmation — Backfill Schedule Validation Months

Schedule Confirmation does not normally go backward. Best practice is to confirm each month as it comes due. But there is a documented exception for the unusual case where a program sets up its rotation schedule months _after_ the academic year began and needs to confirm the missed months retroactively.

The mechanism is a Support-side task script: **Backfill Schedule Validation Months**. When run, it generates Unverified Schedules urgent tasks for past months that the program never had a chance to confirm. The admin can then confirm those months as if they were current.

**This script must be run before the New Schedule Wizard is run for the next academic year.** Ordering matters because the backfill script needs the prior schedule structure intact to create the right confirmation records.

Use cases:

*   Program implemented mid-year and only set up rotation blocks in November.
    
*   Program restructured a split mid-year and lost confirmation records during the reconfiguration.
    
*   Program needs to satisfy an auditor that all months of a prior year were confirmed.
    

To request: open a Support ticket specifying the program, the academic year, and the date range to backfill. (Confirmed BG.)

> **Re-verification is not supported.** The system treats confirmation as a one-time event per month. Once confirmed, subsequent changes to that month's rotation schedule (during the still-open edit window) do _not_ trigger re-verification. The system simply trusts the original attestation. There is no UI or backend path to force re-verification of an already-confirmed month outside the backfill script. (Ticket 134966, confirmed TM.)

### 15.6 The two-column GME view

GME Office has a **Schedule Confirmations** link that shows the institution-wide confirmation status. The page has two pairs of columns:

*   **Verified by (Admin)** and **Verified Date (Admin)** — populated when the admin completes their e-sign step.
    
*   **Verified by (PD)** and **Verified Date (PD)** — populated only when `setting_schedule_confirm_esign` includes `2` and the PD has completed their e-sign step.
    

When the PD step is configured but the PD has not yet signed, the program/rotation displays as **Unverified** in the page's sort order, even though the admin-side columns are populated. The schedule "still shows as verified by the program administrator" in the row data, but the sort sees it as incomplete because the workflow hasn't fully closed. This is a frequent source of "I confirmed it — why does GME still see it as unverified?" tickets. The answer: check whether your institution requires PD signature, and check whether the PD has signed. (Ticket 143001, ELR 7/9/2024 noted that the configuration value matters here — `setting_schedule_confirm_esign` must equal `2` for the PD to be in the workflow.)

### 15.7 PD signature requirement

When the PD is in the workflow (`setting_schedule_confirm_esign` includes `2`), the PD must have a **signature image uploaded to their Faculty profile** to complete their e-sign step. Without an uploaded signature, a small red triangle error displays next to their name on the Schedule Confirmations page, indicating their signature is missing.

> **The signature upload requirement cannot be removed.** Even if the institution wants the PD to e-sign without an uploaded image, the system requires the file to be present. The PD can still type their name to e-sign — but the small triangle error continues to display until the image is uploaded. (Ticket 145957, confirmed CK.)

The signature upload is the same one used for contracts and certificates — see **MedHub - Contracts** and **MedHub - Certificates** for the upload mechanics. Once uploaded, it works across all three features.

### 15.8 The Schedule Validation Section / Report — and what drives it

The Schedule Validation Section (and the related Schedule Validation Report on the GME side) is what feeds Medicare reimbursement reporting. It is **driven by the resident training history table** (`users_residents_pg`) — not by raw schedule data, and not by UME enrollment data.

> **For a resident or fellow to appear on the Schedule Validation Section, they must have at least one resident training history record.** Visiting trainees who only have a visiting record (`users_residents_spt`) without a resident training history record will not appear. UME students scheduled to a GME program via course-to-program linking also do not appear, because the section requires a `users_residents_pg` row. (Ticket 144278, AMBS-138, confirmed Jeff S/BG.)

This is the answer to "should the student we scheduled into our GME program show on the validation report?" — no. The validation report requires a resident training history record. If the student's data is showing up there, the question is how a `users_residents_pg` row was created for a UME student, which usually points to a different data setup issue.

### 15.9 Common scenarios

*   **"We turned the workflow on but no admins are getting Urgent Tasks."** Check whether the developer-side cron entry was added during enablement. Without the cron, no notifications generate. Schedule Confirmation requires both `setting_admin_confirms_schedule = 1` _and_ a cron entry — easy to miss when first enabling.
    
*   **"The PD says they signed but it's still showing Unverified on the GME view."** Either the PD has no signature image uploaded (the small red triangle is showing), or the institution doesn't actually have `setting_schedule_confirm_esign = 2` and the PD's "signature" was a different action.
    
*   **"We need to retroactively confirm last spring's schedules."** Open a Support ticket; Backfill Schedule Validation Months script. Must run before any New Schedule Wizard runs for the next academic year.
    
*   **"Can the program coordinator confirm again after making a change?"** No. Re-verification is not supported. Once confirmed for the month, the system does not re-prompt. The lockout still happens on schedule.
    
*   **"The 8-day notification window is too tight for our coordinators."** Not customizable. The 8-day-before-lockout timing is hard-coded. The only lever is the lockout date itself in `workflowA` — push lockout later, and the notification arrives proportionally later.
    

### 15.10 Settings

Setting

Default

Description

`setting_admin_confirms_schedule`

0

Master switch for the Schedule Confirmation workflow. Requires backend script + developer-side cron entry to fully enable.

`setting_admin_confirm_release`

`0:1`

When new confirmations become available each month (`month:day`, e.g. `0:1` = first day of current month).

`setting_admin_confirms_late_days`

15

Days after release a confirmation is considered late.

`setting_schedule_confirm_mode`

1

`1` = all programs confirm, `2` = IRIS-reimbursable programs only.

`setting_schedule_confirm_esign`

`3`

Workflow definition string. Values: `3` = admin, `2` = PD, `5` = GME. Suffix `s` requires e-signature. Example: `3:2s:5s` means admin approves, PD signs, GME signs.

`setting_schedule_confirm_esign_language`

(text)

Attestation statement displayed at e-signature time. Edited via Support.

`setting_schedule_confirm_labelStr`

`ScheduleConfirmation`

Term translation for the section name. Common values: "Schedule Verification," "Schedule Confirmation," "Re-verification."

Related settings (configured elsewhere but interact with this workflow):

*   `workflowA` — drives the actual lockout date. The Schedule Confirmation notification fires 8 days before the lockout day specified here.
    

### 15.11 The standalone Schedule Confirmation page is now a redirect

Internal note: this section in the Scheduling doc is the canonical reference for Schedule Confirmation. The previously-standalone `MedHub - Schedule Confirmation - markdown` page (1080459308) has been retired in favor of folding the content here, because Schedule Confirmation is mechanically a Scheduling-domain feature — it operates on the rotation schedule only, shares the lockout settings, and has no independent lifecycle.

* * *

## 16\. Cost Centers `[GME/UME]`

Cost centers are a financial-reporting overlay on services, shift/calls, and clinics. They categorize where an activity's reimbursement should attribute when finer granularity than the site is needed (e.g., a department or sub-department within a hospital).

The functionality is gated by `settings_costcenters` (default 1, enabled). Cost centers are set by the client in **List Management > Cost Centers**.

Service, shift/call, and clinic definitions can have a cost center assigned. Multiple cost centers can be assigned by percentage to a single definition, up to the maximum set by `settings_costcenters_split_max` (default 1).

Three settings designate cost centers used for non-service time:

*   `settings_costcenters_default_costcenterID` — used when a trainee is unscheduled or assigned to an activity with no cost center.
    
*   `settings_costcenters_loa_costcenterID` — used when a trainee is on LOA.
    
*   `settings_costcenters_vacation_costcenterID` — used when a trainee is on vacation or sick day with no overlapping service.
    
*   `settings_costcenters_awayconference_costcenterID` — used when a trainee is on an away conference.
    

The institution-specific terminology used for cost centers (some institutions call them "department codes," "clinic codes," etc.) is configurable via `settings_costcenters_alt_code_term` (default `Dept/ClinicCode`).

When cost centers are in use, the Cost Center FTE report reflects the cost-center attribution rather than just site attribution. This is the primary downstream consumer of cost center configuration.

* * *

## 17\. Settings Reference `[GME/UME]`

A consolidated reference of root settings that affect scheduling. Settings are listed by category.

> **Source of truth.** Default values shown in the tables below are taken from the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

### 17.1 Lockout and edit windows

Setting

Scope

Default

Description

`workflowA`

Site-wide

varies

Array indexed by user type. First number per row = day-of-month after which user type loses write access to prior month. (3=Program Admin, 5=GME, 6=Finance.)

`api_schedule_back_days`

Institution

30

Days back from today the API may edit schedule assignments.

`api_schedule_forward_days`

Institution

360

Days forward from today the API may edit schedule assignments.

`setting_amion_backdays`

Site-wide

14

Days back the Amion sync may add/edit/delete assignments. `0` = use default; `1` is lowest meaningful value.

`qgenda_back_days`

Site-wide

14

Days back the QGenda sync may add/edit/delete assignments. `0` = use default.

`qgenda_forward_days`

Site-wide

70

Days forward the QGenda sync may add/edit/delete assignments. `0` = use default.

`setting_shiftadminA`

Site-wide

`backDays=30, forwardDays=180`

Array of ShiftAdmin back/forward window.

`setting_unlock_userA`

Site-wide

`5:6`

User types with Unlock Administration access (5=GME, 6=Finance).

### 17.2 Site Lock

Setting

Scope

Default

Description

`setting_sitelock`

Site-wide

0

Lock site values to administrators (1=enabled).

`setting_sitelock_siteID`

Site-wide

462

The "Site to be Determined" siteID used when Site Lock is on.

`setting_default_selected_siteID`

Site-wide

0

Default site shown in pull-downs when adding new activities (when Site Lock is off).

### 17.3 Releases and Institutional Release

Setting

Scope

Default

Description

`setting_scheduling_release_generic`

Site-wide

1

Allow the `> [Program]'s admin will schedule` option in the "Other Service/Program" release dropdown.

`setting_amion_released_programA`

Site-wide

`[]`

Programs available for Amion released-resident pulls. Empty = all; `[0]` = none.

`settings_affiliate`

Site-wide

0

Enable institutional release functionality. (Legacy setting name predates the current product term.) See child page **MedHub - Institutional Release**.

`settings_affiliate_outgoing_min`

Site-wide

7

Minimum days in an activity to trigger an outgoing institutional release.

`settings_affiliate_outgoing_gap`

Site-wide

7

Combine services within N days when generating outgoing institutional releases.

`settings_affiliate_release_start_days`

Site-wide

30

Days prior to today to search for new institutional releases.

`settings_affiliate_release_end_days`

Site-wide

180

Days after today to search for new institutional releases.

`settings_affiliate_email_incoming`

Site-wide

1

Send email when new incoming institutional release visitor is received.

`settings_affiliate_email_outgoing`

Site-wide

1

Send email when new outgoing institutional release is identified.

### 17.4 Faculty and trainees

Setting

Scope

Default

Description

`settings_schedule_faculty`

Site-wide

1

Faculty scheduling enabled.

`settings_schedule_faculty_color`

Site-wide

`#0000AA`

Default faculty display color on schedule.

`settings_schedule_students_color`

School

`#00AA00`

Default student display color on schedule.

`student_schedule_view`

School

1

Student access to view their own enrollment schedule.

`hide_student_schedules`

School

1

Restrict students from viewing other students' schedules.

`settings_students_schedule_hide`

School

0

Hide the Schedules link entirely for students.

### 17.5 Schedule Confirmation

See §15 for full operational reference. Settings:

Setting

Scope

Default

Description

`setting_admin_confirms_schedule`

Site-wide

0

Master switch. Requires backend script + cron config to fully enable.

`setting_admin_confirm_release`

Site-wide

`0:1`

When confirmations become available each month (`month:day`).

`setting_admin_confirms_late_days`

Site-wide

15

Days after release a confirmation is late.

`setting_schedule_confirm_mode`

Site-wide

1

1=all programs, 2=IRIS-reimbursable only.

`setting_schedule_confirm_esign`

Site-wide

`3`

Workflow definition (e.g. `3:2s` = admin approves, PD signs). Values: 3=admin, 2=PD, 5=GME; suffix `s` = e-signature required.

`setting_schedule_confirm_esign_language`

Site-wide

(text)

Attestation statement at e-signature.

`setting_schedule_confirm_labelStr`

Site-wide

`ScheduleConfirmation`

Term translation for the section.

### 17.6 Cost Centers

Setting

Scope

Default

Description

`settings_costcenters`

Site-wide

1

Enable cost center tracking.

`settings_costcenters_default_costcenterID`

Site-wide

0

Default cost center for unscheduled or no-cost-center activities.

`settings_costcenters_loa_costcenterID`

Site-wide

0

Cost center for LOA time.

`settings_costcenters_vacation_costcenterID`

Site-wide

0

Cost center for vacation/sick days with no overlapping service.

`settings_costcenters_awayconference_costcenterID`

Site-wide

0

Cost center for away conference time.

`settings_costcenters_split_max`

Site-wide

1

Maximum cost centers assignable to a single service/shift/clinic definition.

`settings_costcenters_alt_code_term`

Site-wide

`Dept/ClinicCode`

Institution-specific terminology for the alternate code.

### 17.7 Split sites and shifts

Setting

Scope

Default

Description

`settings_split`

Site-wide

1

Allow split site assignments for services.

`settings_split_max`

Site-wide

10

Maximum sites per service.

`settings_shift_split`

Site-wide

1

Allow split site assignments for shifts.

`settings_shift_split_max`

Site-wide

4

Maximum sites per shift.

### 17.8 Misc

Setting

Scope

Default

Description

`setting_schedule_notesFlag`

Site-wide

1

GME schedule notes enabled.

`setting_paging`

Site-wide

(off)

Enable public call schedule link. URL: `/paging`.

`setting_paging_password`

Site-wide

(blank)

Optional password for public call schedule.

`setting_wizardA`

Site-wide

(array)

Per-user-type access to task wizards. Indexed list — see individual wizard sections for relevant indices (0=New Schedule, 5=Amion, 8=Lost Activities, 14=QGenda/ShiftAdmin/SpinFusion/OpenTempo).

`default_scheduleID`

Site-wide

varies

Default schedule for GME/HF users when accessing the Schedules tab. Two settings change together: `default_scheduleID` and `default_programID` — both must be updated to switch the default.

`global_rotationsetID`

Site-wide

varies

The current academic year identifier.

`settings_iris_loa_overlap`

Site-wide

0

LOA time attribution: 0 = default site, 1 = overlapping service.

* * *

## 18\. Database Reference `[GME/UME]`

Key scheduling tables. Field-level detail is in the full database documentation; this is the orientation map.

Table

Purpose

Primary key

`sh_schedules`

Rotation schedules

`scheduleID`

`sh_schedules_rotations`

Rotation periods (blocks) on a schedule

`rotationID`

`sh_schedules_services`

Service definitions per schedule

`serviceID`

`sh_globalservices`

Service groups (program-level, cross-year)

`globalserviceID`

`sh_globalservices_heads`

Service heads on a service group

—

`sh_tracks_slots`

Service assignments

`slotID`

`sh_tracks_releases`

Release records

`releaseID`

`sh_tracks_shifts`

Shift assignments

—

`sh_schedules_services_shiftnames`

Shift/call definitions

`shiftnameID`

`sh_clinics_names`

Clinic definitions (not academic-year-specific)

`clinicnameID`

`sh_clinics`

Clinic assignments

`clinicID`

`sh_clinics_periods`

Clinic work periods (AM/PM/AM-PM/EVE)

`periodID`

`sh_faculty`

Faculty service assignments (dated)

—

`sh_faculty_clinics`

Faculty clinic assignments

—

`sh_faculty_shifts`

Faculty shift assignments

—

`users_faculty_programs_services`

Faculty permanent service assignments

—

`sh_firms` / `sh_firms_dates` / `sh_firms_users`

Firm-based schedule structure

`firmID`

`sh_audit`

Schedule audit (header)

`auditID`

`sh_audit_changes`

Schedule audit (per-change detail with JSON)

`changeID`

`admin_rotations_unlock`

Schedule unlock records

`actionID`

`i_rotationsets`

Academic years

`rotationsetID`

`users_residents_pg`

Training history records — drives Schedule Validation Section/Report

`pgID`

`users_residents_pg_appt`

Per-appointment level/program/scheduleID

`apptID`

`users_residents_spt`

Visiting trainee periods (does NOT drive Schedule Validation)

—

`sh_amion` / `sh_amion_*`

Amion interface configuration and mappings

`amionID`

`sh_qgenda` / `sh_qgenda_*`

QGenda interface configuration and mappings

`qgendaID`

`sh_shiftadmin` / `sh_shiftadmin_*`

ShiftAdmin interface configuration and mappings

`shiftadminID`

`sh_spinfusion` / `sh_spinfusion_*`

Spinfusion interface configuration and mappings

—

`sh_momentum` / `sh_momentum_*`

Momentum interface configuration and mappings

—

`sh_confirmations`

Schedule Confirmation records (admin/PD attestation history)

`confirmationID`

`i_affiliates_releases` / `i_affiliates_incoming`

Institutional release records (legacy table name `affiliates`) — see child page **MedHub - Institutional Release**

—

**Audit** `change_method` codes: 0=unknown, 1=manual, 2=auto, 3=standard interface, 4=custom interface, 5=absence approval.

**Audit** `activity_type` codes: 0=mixed, 1=service, 2=shift/call, 3=clinic, 4=absence.

**Audit** `change_type` codes: 0=unknown, 1=add, 2=delete, 3=update.

**Slot** `amion_flag` codes: 1=amion, 2=spinfusion, 3=opentempo, 4=momentum.

* * *

## 19\. Glossary `[GME/UME]`

Term

Definition

Field

Academic Year

July 1 – June 30 period

`rotationsetID`

Back days

Number of days back from today an edit channel may edit

varies

Block

Segment of a rotation schedule

`rotationID`

Call

Period a trainee is on duty and must be available (on-site or home)

—

Clinic Assignment

A user's date-specific assignment to a clinic; cannot cross midnight

`clinicID`

Clinic Definition

A clinic's basic info; not academic-year-specific; may be shared across programs

`clinicnameID`

Common Releases

Pre-built dropdown of release patterns the program has used before; selecting from this dropdown keeps scheduling control with the home program

—

Cost Center

Financial reporting category overlay on activities

—

Course

UME equivalent of a program

—

Edit Window

Combined back-days/forward-days range an edit channel may edit

—

Faculty

A physician who trains and evaluates trainees; schedulable to services, shift/calls, clinics

`userID`

Fellow

A trainee in fellowship training (post-residency)

`userID`

Firm

A cohort in a firm-based schedule rotating on staggered cycles

`firmID`

Forward days

Number of days forward from today an edit channel may edit

varies

GME

Graduate Medical Education (residency and fellowship)

—

Home program

The trainee's own program

—

Institutional Release

Release between programs at different institutions; gated by `settings_affiliate`. See child page **MedHub - Institutional Release**

—

Level

Years post-medical-school graduation; also called PGY

—

Lockout day

Day-of-month after which prior month locks (per `workflowA`)

—

Other Service/Program

Release dropdown option that targets an external program; can transfer scheduling control to the released program when paired with `> [Program]'s admin will schedule`

—

Primary designation

Required attribute on overlapping service assignments; drives billing

—

Program

A GME specialty program

`programID`

Program Administrator

User type managing program-level operations including schedules

—

Release

Scheduling a trainee from one program to another's schedule

`releaseID`

Released program

A program other than the trainee's home program they are temporarily scheduled to

—

Resident

A trainee in residency training; also a user type label in the system

`userID`

Rotation Schedule

Academic-year schedule for a program/course; 1:1 unless split

`scheduleID`

Schedule Confirmation

Monthly admin-side rotation-schedule attestation workflow (term-translatable). See §15.

`confirmationID`

Service Assignment

A user's date-specific assignment to a service

`slotID`

Service Definition

A service's basic info; specific to academic year and schedule

`serviceID`

Service Group

Organizational grouping for services across schedules and years

`globalserviceID`

Service Head

Designated faculty for a service group

—

Shift/Call Assignment

A user's date-specific assignment to a shift or call; may cross midnight

—

Shift/Call Definition

A shift or call's basic info; per-program, per-academic-year

`shiftnameID`

Site

Location an activity takes place; controlled by GME due to billing/IRIS impact

`siteID`

Site Lock

Configuration restricting who may set the site value

—

Split schedule

Program with multiple level-specific schedules within one program

—

Student

UME learner (medical student)

`userID`

Trainee

Umbrella term for residents and fellows (and students in UME contexts)

—

Training History

Record binding a trainee to a program, level, and date range

`pgID`

UME

Undergraduate Medical Education (medical school)

—

Visiting trainee

Trainee from another institution rotating at the client site

`users_residents_spt`

Work Period

Start and end times for clinic assignments (AM, PM, AM/PM, EVE)

`periodID`

* * *

_Source: MedHub Scheduling Vendor Guide (Emma Sartwell) + 600+ Scheduling-Rotations support tickets (2018–2024) + April 2026 Root Settings + April 2026 Database Documentation + MedHub User Manual + Schedule Confirmation FAQs (page 47426474). Synthesis and structural framing by Claude._

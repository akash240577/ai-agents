# MedHub - Evaluations — GME - markdown

# MedHub - Evaluations — GME

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Evaluations are how programs assess trainees, faculty, services, programs, and themselves. The Evaluations module is the single most-used and most-ticketed feature in MedHub: it touches scheduling (which drives who evaluates whom), faculty demographics (which drives who can be an evaluator), training history (which drives PGY level for milestone reporting), conferences (which can deliver evaluations from attendance), and the GME Office's locked questions framework. This document covers GME-side evaluations end-to-end. The UME equivalent is documented in **MedHub - Evaluations — UME**; the two share infrastructure but diverge on form types, delivery semantics, and access patterns, so they are deliberately split into twin documents.

This document covers: form building (the four create paths, attributes, scales, milestones, locked questions); form types and their confidentiality framework; evaluation delivery (manual, automated, RIS, tiered, self-initiated); evaluation groups; off-program and outside evaluators; visiting resident handling; the mentor view and its sorting logic; viewing/reporting (Aggregate Evaluation Report, RIS Completion Summary, Locked Questions Summary, View Completed); evaluation lifecycle (alerts, late notifications, expiration, lockout, the evaluation period reset); and the operational patterns that come up repeatedly in support tickets.

It does not cover: form configuration on the UME side (see **MedHub - Evaluations — UME**); evaluations triggered from conference attendance sheets (see **MedHub - Conferences**); milestone reporting in detail (see **MedHub - Reports** when drafted, or §"Milestones, EPAs, and milestone elements" below for the form-side mechanics); program scorecards or APE workflows (separate docs).

## Where it lives

Evaluations are accessed from the **Evaluations** tab in the global navigation. The Program Administrator (and GME Office) sees:

*   **Manage Evaluation Forms** — create, modify, and inactivate forms
    
*   **Deliver Evaluations** — manual delivery
    
*   **Automated Evaluations** — recurring delivery rules
    
*   **View Completed Evaluations** — search and view historical evaluations
    
*   **Incomplete Evaluations** — see and manage outstanding deliveries
    
*   **Evaluation Functions** — sub-page housing Off-Program Evaluators, Outside Evaluators, Evaluation Groups, RIS settings, and Tiered configuration
    
*   **Milestone Management** — milestone scale assignment, reporting, and (for ACGME-recognized programs) milestone import
    
*   **Locked Questions** — GME-only; institution-wide questions that programs include but cannot modify
    

The Program Settings → Evaluations tab controls evaluation-related program-level behavior (Tracking Reviews, Tiered lockout, Aggregate access for faculty, etc.).

## Form types and the confidentiality framework

Each evaluation form is identified with one or more **types** (set when the form is created or modified via the Update Types link). The type drives who can deliver the form, who can complete it, who can view results, and what default confidentiality applies. The complete list of GME form types:

*   Faculty evaluation of a resident
    
*   Resident evaluation of a faculty member
    
*   Resident evaluation of a service / clinic
    
*   Resident evaluation of program / hospital
    
*   Resident self-evaluation
    
*   Resident peer evaluation (resident of resident)
    
*   Faculty peer evaluation (faculty of faculty)
    
*   Faculty self-evaluation
    
*   Faculty evaluation of program / hospital
    
*   Program Director evaluation of resident (e.g., semi-annual)
    
*   Resident evaluation of conference
    
*   Off-program / outside evaluator forms (not a separate type — these use the same type list and are scoped via evaluator role)
    

> **Confidentiality is encoded by type, not configurable per-form.** Confidentiality on GME-side evaluations is determined by the form type. The framework as MedHub defines it: "confidential" means only those who are supposed to see an item can see it.
> 
> *   **Resident evaluation of a faculty member** is automatically confidential. The only users with access to the completed evaluation (with the resident's name next to responses) are the Program Administrator and the Program Director — and the PD cannot see evaluations completed about themselves. Associate PDs cannot see how faculty were evaluated. The faculty target may see an aggregate view of results in some cases (when Program Settings → Evaluations is configured to allow it), but never sees the responses with the evaluator's name attached.
>     
> *   **Resident evaluation of a service / clinic** is also automatically confidential. Only Program Administrators and Program Directors can see how a service or clinic was evaluated, in association with the resident evaluator's name. Residents cannot see what others said about a service or clinic.
>     
> *   **Resident peer evaluation, faculty peer evaluation, faculty self-evaluation, and any "subordinate evaluation of master"** preserve evaluator anonymity to the target. The target may see aggregate-style results when permitted, but never sees the evaluator's name on individual responses.
>     

The confidentiality framework cannot be loosened on a per-form basis — the type determines the access. If a program needs to expose evaluator identities (extremely rare, typically a faculty development scenario), the workaround is a different form type (e.g., a non-confidential peer assessment) or working with reports that show the aggregate without naming evaluators.

## Building forms

Evaluation forms are built and managed under **Evaluations → New Evaluation Form** (and Manage Evaluation Forms for editing). There are four creation paths:

1.  **Design new form** — start from scratch
    
2.  **Copy existing form** — copy a form already in this program
    
3.  **Copy from another program** — copy a form shared by another program at the institution
    
4.  **Copy from another institution** — search MedHub-wide for a form another institution has shared. If the copied form has compatible tagged milestones and header descriptions, those are imported as well.
    

The "Copy from another institution" path is the underused one. It can save significant build time — Internal Medicine programs at different institutions often have very similar forms, and the milestone tagging often imports cleanly.

### Form attributes

When a form is created, the following are set on the initial creation page:

*   **Title**
    
*   **Introduction / Instructions** — displayed to the evaluator at the top of the form
    
*   **Types** — the form types this form is identified with (drives delivery and confidentiality)
    
*   **Public** — when checked, the form is available to other programs at the institution to copy or share
    
*   **Format** — Standard or Right/Left columns. Right/Left allows scale questions with content on both ends (useful for bipolar scales like "Too lenient ↔ Too strict")
    
*   **Descriptions display** — pop-up hint or beneath option (controls how scale option descriptions render in the evaluator's view)
    
*   **Numbering** — Autonumber (default) or Number manually
    

After creation, the **Modify Form** screen exposes additional attributes that can be set or changed:

*   **Programs** — share with other programs (read-only or write access)
    
*   **Milestone tagging** — link questions to milestone subcompetencies
    
*   **Status** — draft (still buildable) or final (locked, deliverable)
    
*   **Confidentiality** — auto-set by type, not user-configurable
    
*   **Evaluator instructions per question** — alerts, required-comment triggers, low-score alerts
    

> **Title can be modified at any time.** Even after a form is finalized and has been delivered, the title can be updated by editing the Title field and clicking Update Information. The same applies to Introduction/Instructions. Confirmed via SKU.

### Question types and answer types

Forms support these question types:

*   **Header** — non-scoring; used to break the form into sections
    
*   **Standard scale question** — pulls from the Scales list (see below)
    
*   **Milestone scale question** — pulls from milestone scales and can be tagged to one or more milestone subcompetencies
    
*   **Comment / free-text** — open response; can be required or optional, and can be configured to require text only when a specific scale answer is given
    
*   **Options (pull-down)** — single-select from a list; useful for "Did you observe X" type questions
    
*   **Checkbox / multiple selection** — multi-select
    
*   **Yes / No** — binary; can trigger a required comment or alert when answered Yes (or No)
    
*   **Right/left columns** — Format-dependent question type (only available when the form's Format is Right/Left columns)
    

A form question must have **two attributes** to collect milestones data: the question must use a milestone scale, and the question must be tagged to one or more milestone subcompetencies. Both are required — milestone scale alone or tagging alone does not produce reportable milestone data.

### Scales

Scales are managed by MedHub Support, not by the Program Administrator. Common system scales include:

*   Numeric 1-5 (with N/A) — with or without headers
    
*   Strongly Disagree → Strongly Agree (with N/A) — with or without headers
    
*   Does not meet → Exceeds expectations (with N/A)
    
*   Milestones - Level 1-4 (with N/A) — and several variations with different header configurations
    
*   Very Negative Experience → Best Possible Experience (with N/A)
    

When an institution needs a custom scale, the request is submitted to MedHub Support with the desired option labels, the headers (if any), the N/A behavior, and any program-specific requirements. Tickets that requested custom scales over the years include common variants like "Numeric 1-5 with headers added" and "Strongly Disagree → Strongly Agree with N/A" — Support adds these to the institution's scale list. Custom scales can be added per institution; once created, they appear in the scale dropdown for all programs at that institution.

A few scale behaviors worth knowing:

*   **Three answer types display the same to evaluators** (a recurring confusion). Scales with similar option text but different IDs can look identical to the evaluator. The fix is usually to add visible headers to one of them (Ticket 143395) — Support modifies the institution's scale list to add the header version.
    
*   **Renaming scale options** (e.g., changing "Best Possible Experience" to "Excellent Experience") is a Support action that can either modify the existing scale (affecting historical responses) or create a new scale variant (preserving historical labels). Programs requesting a rename should be asked which they want.
    
*   **Header visibility on milestone scales.** A program may want a milestone scale identical to an existing one but with the headers hidden. This is a Support-side change to the scale definition. (Ticket 115212.)
    

### Skip logic

Skip logic allows questions on an evaluation form to be shown or hidden based on the evaluator's answer to a previous question. This is configured per question in the form builder via the **Skip Logic** column.

**Two modes:**

*   **Hide initially** — the question is hidden when the form loads. It displays only if the evaluator selects one of the configured trigger answers on the controlling question.
    
*   **Show initially** — the question is visible when the form loads. It is hidden if the evaluator selects a trigger answer.
    

**Configuration:** Click the Skip Logic column for a question → select Hide initially or Show initially → select which answers on the controlling question trigger the show/hide behavior.

**Key behaviors and constraints:**

*   If a question that serves as the skip logic trigger is **deleted from the form**, dependent questions may behave inconsistently. Some evaluators may be able to submit while others cannot, because the system loses the reference to the deleted trigger question. The fix is to re-examine and re-configure skip logic on the remaining questions.
    
*   **Hidden questions cannot be required.** If a question is hidden by skip logic, it should not also be marked as required — the evaluator cannot answer a question they cannot see.
    
*   When **copying a form from another institution**, skip logic configuration may not transfer correctly. Specifically, a skip logic rule set to "display if a specific answer is selected" on the source form can become "display if ANY answer is selected" on the copied form. This was corrected in April 2025 (AMBS-13474), but forms copied prior to that fix may have incorrect skip logic and should be reviewed.
    

### Milestones, EPAs, and milestone elements

ACGME-recognized programs have ACGME milestones imported into MedHub. Milestone packages are loaded by Support per specialty and per ACGME version (Milestones 1.0 vs 2.0).

*   **Importing the milestone package** — Programs go to Milestone Management to import the ACGME-published package for their specialty. Once imported, milestone subcompetencies are available to tag on form questions.
    
*   **Milestones 1.0 vs 2.0** — Some specialties shifted to Milestones 2.0 in recent years. After importing 2.0, the 1.0 milestones remain in the system for historical reporting but should not be tagged on new forms. The Milestones 2.0 import does not automatically retire the 1.0 set; programs decide which to retire based on their own transition timeline (Ticket 169912).
    
*   **Mixing 1.0 headers with 2.0 descriptions** — A common mistake when migrating: the form's headers display 2.0 but the descriptions pull in 1.0, because the form is using a 1.0 milestone scale but tagged to 2.0 subcompetencies (or vice versa). The fix is to ensure the scale matches the tag set (Ticket 178482).
    
*   **EPAs (Entrustable Professional Activities)** — Some specialties use EPAs alongside or instead of subcompetencies. EPAs are imported similarly via Milestone Management.
    
*   **Milestone Elements** — A finer level of granularity within milestone subcompetencies. End-of-shift milestone-based evaluations can collect milestone elements data when scale questions are tagged to milestone elements. This collection method is the alternative to tagging at the subcompetency level.
    

> **The Infectious Diseases milestones question.** Specialties without ACGME-published milestones (a recurring example: Infectious Diseases as a fellowship sub-specialty) cannot import a milestone package — MedHub does not author milestones, ACGME does. The recommended path is for programs to use a non-milestone scale until ACGME publishes milestones for that specialty. (Ticket 164087.)

### Locked questions (GME-side)

Locked questions are institution-wide questions that the GME Office authors and adds to the institution's locked-question library. Programs include locked questions on their own forms — but cannot modify the question text, options, or scale. This is how GME-level institutional metrics (mistreatment, professionalism, harassment) are kept consistent across programs while still being delivered through program-owned forms.

The Locked Questions list is managed under **Evaluations → Locked Questions** by GME Office users. Each locked question has:

*   **Question text and answer type / scale**
    
*   **Status** (Active or Inactive)
    
*   **Programs that have included it** (visible from the locked question's detail page)
    

> **Inactivating a locked question.** When a locked question's status is changed to Inactive, the question that has been added to evaluation forms is **not** removed — it remains active on the form. Historical and future responses remain intact in the Aggregate Evaluation Report. The only effect of inactivation is that (1) the locked question is no longer available to be added to newly created forms, and (2) the **Locked Questions Summary report** stops including it. Tested and confirmed JS 2/25/21 (SKU). The implication: GME cannot retroactively remove a locked question from forms by inactivating it. To remove a locked question from a form, the program must edit the form and remove it.
> 
> **Programs can see results of GME-locked questions on their own forms.** When a program creates and delivers a form that includes GME locked questions, the Program Administrator can see the results on the Aggregate Evaluation Report and on individual completed evaluations. Confirmed BG.

### Sharing forms across programs

A form can be shared with one or more other programs at the institution. From the Modify Form screen, the **Update Program List** link opens a checkbox list of all programs; checking a program shares the form to that program with a per-program access dropdown:

*   **Read-only** — the program can copy and deliver the form, but cannot modify the original
    
*   **Write** — the program can modify the original form (rare; used primarily for cross-program shared forms maintained by a working group)
    

> **Reporting on shared forms — what the receiving program sees.** A nuance that has caused confusion: if the GME Office (Admin side) creates a form, shares it with programs, and delivers it from the GME Admin side, the responses are reportable by the **GME Office on the Admin-side reports**. Anyone with admin and reporting access can see the responses (i.e., other Program Administrators with reporting access, depending on access map).
> 
> If GME wants programs to deliver the form themselves but have data isolated to GME, GME shares the form for delivery and runs reports themselves — but be aware that any user with admin-side reporting access at the institution can see results unless the access map removes that access (Ticket 228881, Ticket 148166, AMBS-10124, confirmed BG 8/6/2024).

### Coordinator access by default

By default, **Coordinator user types only have access to all evaluations unless the access map removes that access.** This is the inverse of how some other modules work — the default for Coordinators is full access, and the access map is used to restrict (Confirmed BG, SKU). When a program reports "the coordinator is seeing evaluations they shouldn't," the answer is to check the institution's Coordinator access map and add restrictions.

## Delivery methods

There are five ways an evaluation can be delivered. Each has its own setup surface, its own use cases, and its own quirks.

### Manual delivery

**Manual delivery** is the most flexible method: a Program Administrator (or anyone with delivery access) opens **Evaluations → Deliver Evaluations**, selects the form type, the form, the recipient(s), the target(s), and the relevant rotation/dates, and clicks Submit.

Used for:

*   One-off deliveries (faculty visited from another institution)
    
*   Off-cycle evaluations
    
*   Evaluations of services that don't fit the automated rules
    
*   Reciprocal evaluations on demand
    

> **Step 2 blank screen.** A recurring report: "When trying to deliver evaluations manually, the page goes blank on Step 2." This is typically a session/cache issue — clear cache or use a different browser. If it persists, the user's evaluation access has been misconfigured (Ticket 155555, Ticket 155339).

### Automated evaluations

**Automated Evaluations** are recurring delivery rules configured under **Evaluations → Automated Evaluations**. The most-used delivery method for end-of-rotation evaluations, since the system handles the timing and recipient selection automatically based on the rotation schedule.

Each automated evaluation has:

*   **Title**
    
*   **Form to deliver**
    
*   **Delivery method** — by Rotation, by Activity, on Specific Dates, or end-of-shift
    
*   **Rules** — service(s), level(s), evaluator type(s), reciprocal options, etc.
    

The four delivery method options:

*   **By Rotation** — generates evaluations at the end of the rotation block. Looks at all activity within the rotation block and delivers evaluations between trainees and faculty scheduled to those services within that block.
    
*   **By Activity** — generates evaluations at the end of a specific activity (a service assignment that may or may not align with a block). Useful for shorter assignments. Note: **Continuity Clinics cannot be evaluated using by-Activity delivery**; for clinics, use by-Rotation.
    
*   **On Specific Dates** — generates a one-time evaluation on configured dates. Supports only three form types: Self Evaluations, Evaluations of Program / Hospital, and Program Director's evaluations of Residents (e.g., semi-annual).
    
*   **End-of-shift** — generates evaluations triggered by shift completion. Used for milestone-based assessments where each shift is its own micro-evaluation (IUSM customization).
    

> **By Activity vs By Rotation — a common case.** When a resident is scheduled to the same service for the entire academic year and you're using by-Activity delivery, the evaluation is not delivered until the end of the academic year (because the activity hasn't ended yet). If you want quarterly or block-end evaluations, use by-Rotation instead. Confirmed BG.

> **Reciprocal evaluation delivery is supported on automated evaluations.** When configuring an automated evaluation rule (Faculty of Resident), there is a checkbox to also deliver a reciprocal Resident of Faculty evaluation. This is the recommended way to set up paired evaluations.

> **Visiting residents and automated evaluations.** Visiting residents will not receive automated-delivery evaluations unless their training history record has a PGY level. Without a PGY level, the system has no way to scope the rule (which is typically level-based). For visiting residents without a PGY level, deliver manually.

> **Outside Evaluators on automated evaluations.** Configure an Outside Evaluator on the Outside Evaluators page (Evaluations → Outside Evaluators), schedule them to a service group, and they become eligible for automated delivery via the standard service-based rule.

> **Off-program evaluators on automated evaluations.** Off-program evaluators are an existing in-house faculty member from another program added as an evaluator to your program for occasional use. They cannot receive automated evaluations — only manual delivery.

**Absences reduce shared service days for automated delivery.** When MedHub calculates whether two users meet the Minimum Shared Service Days threshold for automated evaluation delivery, approved absences (vacation, sick, LOA) are subtracted from the shared days count. If two residents are scheduled to the same service for a 14-day block but one is on vacation for 12 of those days, their shared service days drops to 2 — below a typical threshold of 3 — and the automated peer evaluation will not fire.

The Minimum Shared Service Days setting (`setting_evaluations_delivery_days`) is a running tally that accumulates across non-contiguous service assignments within a rotation block, but absence days within those assignments are excluded. When a program reports "automated evaluations aren't firing," check for overlapping approved absences before escalating.

> **Annual program evaluation automation.** Use the **on Specific Dates** delivery method with the Evaluations of Program / Hospital form type to automate the annual program evaluation. Configure the date(s) once and the system delivers the form on those dates each year (per institution practice, the dates may need updating each year).

### Resident Identifies Supervisor (RIS)

RIS is a delivery method where the resident, rather than the system, picks the faculty members who supervised them on a rotation. RIS sends a notification to the resident at a configured timing, the resident selects their supervisors from a list of faculty in the program, and evaluations are then delivered to those identified supervisors.

RIS is configured under **Evaluations → Evaluation Functions → Resident Identify Supervisor**. Settings include:

*   **Send Request to Residents** — when the request is sent (e.g., "13 days prior to rotation end date")
    
*   **Form to deliver** — the form sent to identified supervisors
    
*   **Services to apply RIS to** — RIS is configured per service, not per program-wide
    

> **RIS request timing — based on activity end date, not rotation end date.** Despite the setting label "...prior to rotation end date," the timing is based on the resident's **activity end date** within a rotation block, not the calendar end of the rotation block. Confirmed via Ticket. Important for blocks where residents have partial-block service assignments.
> 
> **RIS is delivered by activity end but only within a rotation block.** It will **not** combine blocks if a resident is on the same service for multiple consecutive rotation blocks. For example: a resident on ABC service for the last two weeks of block 1 and all of block 2 will receive two separate RIS requests — one at the end of block 1, one at the end of block 2. (Per dev/ML/HN via bug 3840 / AMBS-12699; documented by ELD 2/1/2022.)

> **RIS in fellowship programs.** RIS is available in fellowship programs. If the function isn't visible in a fellowship's Evaluation Functions list, the institution may have a setting that gates its visibility — escalate. (Ticket 171843.)

> **All faculty in the program appear in the RIS list — cannot be limited.** When a resident is identifying supervisors, all faculty in the program appear. There is no setting to filter to only specific faculty (e.g., only those scheduled to the service). Programs that need to limit options should configure RIS only for services where this isn't an issue. Confirmed BG.

> **Outside Evaluators in RIS.** Residents cannot select Outside Evaluators via the RIS dropdown (Ticket 156925). RIS is limited to in-house faculty. Outside Evaluator delivery is via manual or automated (with service scheduling).

> **RIS cannot be set up retroactively.** If RIS is configured mid-rotation block, the program will not be able to use it until the next rotation block. Confirmed BG.

> **Mixing RIS with other delivery methods on the same service is not recommended.** It is technically possible, but if a faculty member who is scheduled to a service (and would receive an automated evaluation) is also identified by a resident via RIS, duplicate evaluations result. Configure RIS for some services and automated/manual for others. Confirmed BG.

### Tiered evaluations

Tiered evaluations are a composite evaluation method where multiple **Tiered Contributors** complete initial evaluations, and a **Tiered Leader** then completes a composite evaluation that is informed by (and displays) the contributor responses. Used in services where the senior physician (the Tiered Leader) is the one assessing the resident, but multiple junior faculty contributed observation throughout the rotation.

Tiered configuration:

1.  Enable **Tiered Evaluations** in Program Settings → Evaluations.
    
2.  Create an **Evaluation Group** (Evaluations → Evaluation Functions → Evaluation Groups → New Group). Set the group type to **Tiered Group**, designate one or more **Group Leaders**, and select the relevant service(s).
    
3.  Set up an **Automated Evaluation** referencing the tiered group. The automated evaluation must be set up based on **rotation end date**, not activity end date — tiered delivery does not work with activity end date.
    

Behavior:

*   **Contributors fill out their initial forms first.** Their responses populate the leader's composite form when the leader opens it.
    
*   **Tiered Contributors do not receive late notification emails** and are not alerted by the Tiered Evaluations - Lock after Delivery setting. They are only locked out by the Tiered Leader submitting their composite — once the leader submits, any incomplete contributor evaluations are removed automatically.
    
*   **Tiered Contributors may submit past the lock date** if the Tiered Leader hasn't yet submitted. The lock date is more of a "stop accepting once the leader is done" boundary than an absolute deadline.
    
*   **Multiple Group Leaders** — a tiered group can have more than one leader. Each leader receives their own composite form, and each can complete it (so a resident may receive a composite from each leader). Confirmed BG.
    
*   **Tiered Contributor evaluations are NOT included in the Aggregate Evaluation Report.** Only Tiered Leader composite evaluations are aggregated.
    
*   **Residents do not see Tiered Contributor evaluations.** Only the leader's composite is part of the resident's evaluation history.
    
*   **Viewing contributor evaluations as Admin** — go to View Completed Evaluations and check the **Tiered - Include Contributor Evaluations** filter at the bottom of Detailed Search.
    
*   **Tiered Leaders cannot delete their own composite.** The "Insufficient Contact to Evaluate" link is removed inside Tiered Leader composite evaluations. To remove, the leader asks the Program Administrator to remove from Evaluations → Incomplete Evaluations. Confirmed BG.
    
*   **Disabling Tiered Evaluations program setting** — cannot be deselected if any active tiered evaluation groups exist. Inactivate the groups first (Evaluations → Evaluation Functions → Evaluation Groups → click each → set status to Inactive). Confirmed JS.
    

### Self-initiated evaluations

A few form types can be **self-initiated** by the resident — primarily Self Evaluation forms. The resident clicks a self-initiate link from their evaluations page and starts a form on themselves at any time. Useful for things like religious holiday observance requests, self-reflection forms, etc.

> **Self-initiation dropdown locked to one option.** Some institutions configure self-initiation to be limited to specific forms. If a resident reports the dropdown is locked to a single option (e.g., "request for observation of religious holiday") and they want to start a different self-evaluation, the form's eligibility for self-initiation is configured at the form level (Modify Form) — toggle on the additional forms. (Ticket 155368.)

## Evaluation groups, off-program evaluators, outside evaluators

### Evaluation groups

Evaluation Groups are a way to bundle multiple users for delivery purposes. Created under Evaluations → Evaluation Functions → Evaluation Groups → New Group. Each group has a type:

*   **Tiered Group** — used in tiered delivery (see above)
    
*   **Resident Group** — bundle of residents (used as targets in evaluations of residents, or recipients in resident-completed forms)
    
*   **Faculty Group** — bundle of faculty
    
*   **Staff Group** — bundle of non-faculty staff
    

When delivering manually, the group can be selected as Recipient or Target instead of selecting individual users. This is convenient for evaluations that should always go to or about a fixed cohort.

### Off-Program Evaluators

An **Off-Program Evaluator** is a faculty member who already has a MedHub Faculty account in another program at the institution, and you want them to evaluate one of your residents (typically because the resident rotated through their program or worked with them on a one-off basis).

Set up under Evaluations → Evaluation Functions → Off-Program Evaluators → Add Faculty. Pick the source program, then the faculty member.

*   **Manual delivery only.** Off-Program Evaluators cannot receive automated evaluations. They appear at the bottom of the Recipients list when manually delivering, with their source program abbreviation in parentheses.
    
*   **No formal program appointment.** Off-Program Evaluator association does not give the source faculty any access to your program; it is delivery-side only.
    

### Outside Evaluators

An **Outside Evaluator** is someone who does not have a MedHub Faculty account at all — typically external faculty at affiliated hospitals where the resident rotates. Set up under Evaluations → Evaluation Functions → Outside Evaluators → Add Outside Evaluator.

*   **Both manual and automated delivery.** Outside Evaluators can be scheduled to service groups, which makes them eligible for automated delivery.
    
*   **Limited account profile.** Outside Evaluators have only the data needed to send and receive evaluations — name, email, and the service groups they're associated with.
    
*   **They appear at the bottom of the Recipients list** when manually delivering, with a location designation in parentheses.
    

> **Faculty conference attendance for Outside Evaluators.** Outside Evaluators can be added to conference attendance via Program Settings → Conferences → "Track Outside Evaluator Attendance." See **MedHub - Conferences** for details.

## Evaluations Due (late reminders)

**Insert as:** A new subsection under "Late notifications, expiration, and lockout," before or alongside the existing "Late notifications" subsection

### Evaluations Due (late reminders)

The **Evaluations Due** setting in Program Settings → Evaluations sets a due date relative to the delivery date for all evaluations sent from the program. Once the due date passes, the system sends a **reminder email to the evaluator each Tuesday** until the evaluation is completed.

This is distinct from Evaluation Expiration:

*   **Evaluations Due** sends recurring reminders but does **not** remove the evaluation. The evaluator can still complete it at any time.
    

## Insufficient Contact (evaluator removes evaluation)

### Evaluation removal via Insufficient Contact

When an evaluator clicks "Insufficient contact to evaluate" on a pending evaluation, the evaluation is **deleted from the database**. This is distinct from administrative deletion via Incomplete Evaluations — both produce the same outcome (full deletion), but Insufficient Contact is evaluator-initiated.

**What happens on removal:**

*   The evaluation is completely deleted. It no longer appears in Incomplete Evaluations, delivery reports, or completion calculations.
    
*   An **audit trail record** is created documenting the removal. However, the audit trail does **not** record which program originally delivered the evaluation. The Evaluation Completion by User report assumes all deleted evaluations were delivered by the current program, which can cause users to appear in a report with a delivery count even when filtering to "Limit to evaluations sent by this program."
    
*   The removed evaluation no longer appears on the Evaluations Delivery History Report or in the Evaluation Completion by User "Delivered" column. It does not factor into Late, Incomplete, or Completed counts.
    

**Insufficient Contact on the mobile app:** When an evaluator enters a reason for removing an evaluation via the mobile app, the reason is captured in the audit trail but historically did not flow to the resulting email notification. `[VERIFY]` whether this gap has been corrected.

## Reset evaluation to Partially Complete

**Insert after:** "Evaluation period reset" section (or as a subsection within it)

### Reset evaluation to Partially Complete

The "Reset Evaluation to Partially Completed" button allows a Program Administrator to revert a completed evaluation back to an incomplete state so the evaluator can edit and resubmit it.

**Where it lives:** Evaluations → View Completed Evaluations → open a completed evaluation → upper left corner. The button only displays on completed evaluations.

**Access requirements:**

*   Only Program Administrators with the **Program Settings** access point can see and use this button. At some institutions, access is further restricted to **primary administrators** only.
    
*   The access requirement means only a limited number of users per program can perform this action.
    

**What happens when an evaluation is reset:**

*   The evaluator receives an **email notification** informing them the evaluation was reset.
    
*   The evaluation returns to the evaluator's **Urgent Tasks** as an incomplete evaluation.
    
*   When the evaluator opens the evaluation, all previous answers are pre-populated. They can edit any answers before resubmitting.
    
*   The **Completion Date is cleared (nullified)**. When the evaluator resubmits, a new completion date is recorded reflecting the resubmission date.
    

**Restrictions:**

*   **Anonymous evaluations cannot be reset.** MedHub completely strips identifying information when an evaluation is submitted anonymously. Because the system no longer knows who the evaluator was, it cannot assign the evaluation back to anyone. The "Reset to Partially Completed" button does not appear on anonymous evaluations.
    
*   There is **no audit trail** tracking who clicked "Reset to Partially Completed" or when. The system does not log this action.
    

**Files involved:** `evaluations_reset.mh` (exists at the `/u/a/`, `/u/c/`, and `/u/g/` paths — Administrator, Course Coordinator, and GME Office respectively). The reset action updates `eh_responses.completion_date` to null and sets `response_status` back from completed (3) to incomplete.

## Evaluation Responses - Permissions and Rules

### The most essential rule for evaluations in MedHub: Confidentiality  
  
Confidentiality

Confidentiality is **built into MedHub by evaluation type** and enforces the ACGME principle that a superior should never see individual evaluations completed by someone who may report to them. Confidentiality is always on for the applicable types. There is no setting to enable or disable it — it cannot be turned off.

**What confidentiality does:**

*   The **evaluation target** (the person being evaluated) never sees the name of the individual evaluator on any confidential evaluation type. They can only view results in **aggregate** (when Program Settings permits aggregate access).
    
*   The **Program Administrator** and **Program Director** can see the evaluator's name on completed evaluations, with one exception: the PD cannot see evaluations completed about themselves.
    
*   The evaluator's identifying information **remains in the database**. It is not stripped — it is access-controlled.
    

**Evaluation types governed by built-in confidentiality:**

*   Resident evaluation of faculty member
    
*   Resident peer evaluation (resident of resident) — because a resident could be evaluating a fellow or chief
    
*   Patient/staff evaluation of resident
    
*   Patient/staff evaluation of faculty/program/hospital
    
*   Student evaluation of resident
    
*   Student evaluation of faculty
    
*   Faculty peer evaluation (faculty of faculty) — because a faculty member could be evaluating a Program Director
    

**Evaluation types that are NOT confidential by default:**

*   Faculty evaluation of a resident — this is a superior evaluating a reportee. Per ACGME, this is not confidential. Residents can see individual evaluations completed on them by faculty, including the evaluator's name (unless anonymity is applied at delivery).
    
*   Program Director evaluation of resident (e.g., semi-annual) — same principle.
    

**Aggregate access for the evaluation target:** Whether the target can see aggregate evaluation data is controlled by Program Settings → Evaluations → aggregate access settings. The aggregate view never reveals which specific evaluators contributed to the aggregate. The number of evaluations required before the aggregate view becomes available is also configurable (e.g., requiring 3 or more completed evaluations before the target sees aggregate data).

### Anonymity

Anonymity is an **optional, per-delivery setting** that adds a layer on top of confidentiality. It is selected at the time of delivery and **irreversibly strips the evaluator's identity from the database** upon submission.

**How to designate an evaluation as anonymous:**

*   **Manual delivery:** choose "Anonymous" from the Special Options dropdown in Step 2.
    
*   **Automated evaluations:** select "Anonymous" in the Special Options when configuring the automated rule.
    
*   **RIS:** select "Anonymous" in the Special Options for the RIS configuration.
    
*   **Self-initiated evaluations:** select "Anonymous" in the Special Options for the self-initiated form.
    

**What anonymity does — and what it breaks:**

When an evaluation is delivered anonymously and the evaluator submits it, the system performs a permanent, irreversible strip of the evaluator's identity:

*   `eh_responses.evaluator_userID` is set to 0
    
*   `eh_responses.evaluator_outsideID` is set to 0
    
*   `eh_responses.evaluator_other` is set to "(anonymous)"
    

After this, **no one** — not the Administrator, not the PD, not Mentors, not MedHub Support, not the development team — can determine who completed the evaluation. This is by design.

**Consequences of anonymity that go beyond identity masking:**

*   **Cannot reset to Partially Complete.** The system does not know who to assign the evaluation back to.
    
*   **Does not appear in the evaluator's Completed Evaluations view.** Since the system doesn't know who completed it, it cannot place it in any user's completed evaluations list.
    
*   **Excluded from completion reports.** Anonymous evaluations do not appear in the Evaluation Completion Summary or Evaluation Completion by User reports. The system cannot attribute the completion to a specific user, so it is excluded from compliance/completion calculations entirely.
    
*   **Cannot be corrected after submission.** If an evaluator reports they made an error on an anonymous evaluation, there is no way to identify which specific evaluation record is theirs (short of circumstantial investigation by completion date/time).
    

**When anonymity shows the evaluator's name:** Anonymous evaluations show the evaluator's name in View Completed Evaluations and Incomplete Evaluations **until the evaluation is submitted**. The identity strip occurs at the moment of submission. If an administrator opens an incomplete anonymous evaluation, they will see the evaluator's name. Once the evaluator submits, the name is permanently removed.

### Confidentiality vs anonymity: summary

Aspect

Confidential (built-in)

Anonymous (per-delivery)

Controlled by

Evaluation type (automatic)

Special Options dropdown at delivery

Can be disabled

No

N/A — it's opt-in per delivery

Evaluator identity in database

Preserved

Permanently stripped on submission

Administrator can see evaluator name

Yes

No

Program Director can see evaluator name

Yes (except on evals of themselves)

No

Mentor can see evaluator name

Yes

No

Target can see evaluator name

No (aggregate only)

No (aggregate only)

Can reset to Partially Complete

Yes

No

Appears in evaluator's Completed Evaluations

Yes

No

Included in completion reports

Yes

No

Can be reversed after submission

N/A (always on)

No — irreversible

### Force-anonymous Resident of Faculty evaluations

The root setting `setting_eval_rof_anonymous_force`, when enabled, forces all Resident of Faculty evaluations to be anonymous upon submission regardless of the delivery-level settings. This is an institution-wide override. Programs cannot opt out individually. See "Settings appendix" for details.

When this setting is active, the system also forces the "Anonymous" special option on self-initiated Resident of Faculty forms — the program cannot create a non-anonymous self-initiated form for this type.

### Interaction with the Evaluation Access Map

The Evaluation Access Map (configured on the root side) controls what various user roles can see when viewing completed evaluations in the MedHub UI. The access levels are:

*   **None** — the user sees evaluations listed but cannot open or view contents. A warning message appears.
    
*   **Can view; all redacted** — the user can view evaluation data but evaluator names and confidential/required comments are redacted.
    
*   **Can view comments; names redacted** — the user can view evaluation data and comments, but evaluator names are redacted.
    
*   **Can view names; comments redacted** — the user can view evaluation data and evaluator names, but comments are redacted.
    
*   **Can view all information** — full access to all data available to the user by design.
    

The Evaluation Access Map operates **on top of** the built-in confidentiality framework. It cannot override confidentiality — a target user still cannot see individual evaluator names on confidential evaluation types even if their access map says "Can view all information." The access map restricts what is visible; confidentiality restricts what is attributable. Together they determine the complete picture of what any user sees.

The Evaluation Access Map also does **not** control the content of low score alert emails. Those are governed by separate masking settings (`show_lowscore_evaluator` / `show_evaluator_name`). See **MedHub - Evaluations — Low Score Alerts (GME)**.

### Common troubleshooting scenarios

**"The administrator can't see who completed this evaluation."** Check whether the evaluation was delivered anonymously. If it was, the identity has been permanently stripped — there is no way to recover it. If it was not anonymous, check the administrator's access map and confirm they have access to the relevant evaluation type.

**"We want residents to not see the faculty evaluator's name."** Faculty-of-resident evaluations are not confidential by default (ACGME treats this as a superior evaluating a reportee). To hide the evaluator's name from the resident, deliver the evaluation anonymously. Be aware of the consequences: no completion tracking, no reset-to-partially-complete, no completed evaluations view for the evaluator.

**"We want confidential but not anonymous."** This is the default for the applicable evaluation types. Confidentiality is always on. Do not select Anonymous at delivery unless the program specifically wants to strip the evaluator's identity from administrators and PDs as well.

**"Evaluator's name shows on an anonymous evaluation."** If the evaluation is still incomplete (not yet submitted), the evaluator's name is expected to display. The identity strip occurs at submission. If it's completed and still showing a name, this is a bug — escalate.

**"Anonymous evaluations are missing from our completion reports."** This is by design. Anonymous evaluations are excluded from Evaluation Completion Summary and Evaluation Completion by User reports because the system cannot attribute the completion to a specific user.

Mentors can view evaluations of their mentees. The **Mentor view** of resident evaluations is a special view that pulls evaluations of a mentor's mentees with a specific sorting logic. Each column header has its own multi-key sort order:

*   **Resident** — last name → outside evaluator id → 'other' evaluator → issue date
    
*   **Evaluator** — last name
    
*   **Evaluation** — eval id → response title → issue date
    
*   **Type** — eval type id → evaluation id → response title → issue date
    
*   **Rotation** — start date → end date → issue date
    
*   **Service** — service name → issue date
    
*   **Issued** — issue date
    
*   **Completed** — completion date → response status
    
*   **Reviewed** — reviewed date (only displays when Tracking Reviews program setting is enabled)
    
*   **Viewed** — date viewed by current user
    
*   **Alert** — alert flag → issue date
    

> **Sort state is preserved by entry path.** Coming from an urgent task sets the sort to viewed-date asc, then completion-date desc — and saves that as the session sort state. Coming via the Resident Evaluations link sorts by Issued date desc. Sort changes within the page persist for the session until the user comes in via an urgent task again, which resets to the urgent-task default. Switching between all-mentees view and a single mentee does not reset sort. (AMB-7643; Confirmed CB/JP per SKU.)

> **Mentor New Evaluation alert.** The "Mentor - New Evaluation" alert appears when a new evaluation is completed on the mentor's mentee. The alert disappears when addressed (clicked into) — or, if not addressed, the alert disappears unless another evaluation is completed on a mentee within 7 days, which keeps the alert active. The alert does not include evaluations completed by the mentor themselves. Confirmed JS 2/25/21.

## Tracking reviews

When **Program Settings → Evaluations → Tracking Reviews** is enabled, faculty and residents can mark evaluations as "reviewed" — typically used in coaching workflows where the resident and faculty review a completed evaluation together.

Behavior:

*   **The Reviewed column displays in the Mentor view** when Tracking Reviews is enabled.
    
*   **First click wins.** When Tracking Reviews is configured for both faculty and residents, the first user to click "review happened" removes the option for the other. So if the resident clicks first, the faculty no longer sees the review-happened option.
    
*   **The data is captured in the Reviewed column** on the Mentor view sort list and is accessible via the Aggregate Evaluation Report.
    

## Late notifications, expiration, and lockout

Three independent mechanisms control evaluation lifecycle after delivery:

### Late notifications

Configurable per institution. Late notification emails go to the evaluator after a delivered evaluation has been outstanding for the configured period. The setting controls the threshold — typically 14 days, but can be set per institution. **Tiered Contributors do not receive late notification emails** (see Tiered evaluations above).

### Expiration dates

Evaluation Expiration removes an incomplete evaluation from the evaluator's queue after a configured number of days. The expired evaluation is removed from the system — it no longer appears in the evaluator's Incomplete Evaluations, Urgent Tasks, or any completion reports.

Expiration is controlled through a three-tier hierarchy:

1.  **Root setting** (`eval_expiration_enabled`) — must be enabled to unlock the feature institution-wide. Without this setting, the Evaluation Expiration fields do not appear in Program Settings or during delivery.
    
2.  **Program Settings → Evaluations → Evaluation Expiration** — once the root setting is enabled, this field appears on the Program Settings Evaluations subtab. The value entered here (in days) becomes the default expiration for all evaluations delivered from the program.
    
3.  **Per-delivery override** — when delivering an evaluation (Step 2 of manual delivery, the Automated Evaluation rule, the RIS setup, etc.), an Expiration field appears pre-calculated from the Program Settings default. This value can be overridden to a different date for that specific delivery.
    

The recommended approach is to set the Program Settings default to the most commonly used expiration period, then override during delivery for exceptions (e.g., setting a 90-day default in Program Settings for most evaluations, then overriding to 14 days when delivering conference evaluations).

> **Institutional Settings vs Program Settings for expiration.** Institutional Settings for evaluation expiration only apply to evaluations sent at the GME Office level. Program Settings controls what is available at the program level. If the root setting is enabled, programs can use the expiration functionality regardless of what Institutional Settings specify. Disabling the root setting disables expiration for both GME and program levels.

> **Expired evaluations disappear completely.** Once an evaluation expires, it is removed from the evaluator's queue and no longer appears in completion reports or Incomplete Evaluations. It does not remain in a "expired but visible" state.

**Add to settings appendix:**

Setting

Effect

`eval_expiration_enabled`

Root setting that enables/disables the Evaluation Expiration feature institution-wide. When off, expiration fields do not appear in Program Settings or during delivery.

### Lockout

Forms can also be locked to prevent edits after a certain period — even by Program Administrators. Used for finalizing evaluations once a rotation closes. The Tiered Evaluations - Lock after Delivery setting (Program Settings → Evaluations) is one specific lockout. Per-form lockouts are less common.

> **Editing a faculty evaluation that you completed.** Once an evaluation is submitted, the evaluator cannot re-open and edit it. To make a correction, the evaluator asks the Program Administrator to remove the evaluation from Evaluations → Incomplete Evaluations (which deletes it), and then re-deliver it for re-completion. (Ticket 146067, Ticket 160416.)

## Low score alerts

Low score alerts notify designated recipients when an evaluator's response to a question meets or falls below a configured threshold. Alerts are configured at two levels: the **Program Settings** level (which user types receive alerts, and for which evaluation types) and the **question level** (per-question thresholds, required comments, and recipient overrides).

### Configuration

**Program Settings → Evaluations → Send Admin Low Score Alerts** controls which user types (Administrator, Program Director, Associate Director) receive low score alerts, and for which evaluation type categories (Evaluation of Residents, Evaluation of Faculty, etc.). This is the baseline.

**Question-level configuration** (Evaluations → Manage Evaluation Forms → \[form\] → Alerts/Comments) allows per-question overrides: custom thresholds, required-comment triggers, and specific Delivering Recipients. If no custom recipients are configured at the question level, the system falls back to the Program Settings selections. If custom recipients are set, they override the Program Settings for that question.

> **"Evaluation of Faculty" checkbox scope.** The "Evaluation of Faculty" checkbox in Program Settings → Send Admin Low Score Alerts is only used for GME-of-UME evaluations (i.e., Student of Resident/Faculty). It is not respected for straight GME evaluations — those rely entirely on the question-level alert settings. (AMB-5947.)

### Alert routing — delivering entity logic (ELM-1803)

When a low score alert is triggered on a faculty member, the system determines which program or course's recipients should receive the alert based on the **delivering entity** — the program, course, or office that delivered the evaluation.

The routing rules:

1.  **GME Program delivers an evaluation** → alert goes to the recipients associated with the **delivering program**, not the faculty's default program. **Exception:** if the faculty member is an **Off-Program Evaluator** for the delivering program, the alert falls back to recipients associated with the faculty's **default program**.
    
2.  **UME Course delivers an evaluation** → alert goes to the recipients associated with the **delivering course**.
    
3.  **Student Admin delivers an evaluation** → the system checks whether the evaluation is associated with a course. If yes, the alert goes to the Delivering Recipients associated with that course. If the "Faculty Default Program" box is also checked in the alert configuration, alerts go to recipients of **both** the delivering course and the faculty's default program. If no course is associated, course-level Delivering Recipient selections are ignored.
    
4.  **GME Office delivers an evaluation** → the alert goes to recipients associated with the faculty's **default program**. This is the one path where default-program routing is still the primary behavior.
    

### Notification Groups

Low Score Notification Groups (enabled via a root setting) allow institutions to create custom groups of users who receive alerts, independent of the standard program/course recipient logic. When a Notification Group is selected in a question-level low score alert configuration, the group members receive the alert in addition to or instead of the standard recipients.

### Evaluator name masking in alert emails

Two root settings control whether the evaluator's name is visible in low score alert emails:

*   `show_lowscore_evaluator` — set to 0 (never show evaluator name in low score alert emails) or 1 (conditionally show based on evaluation type).
    
*   `show_evaluator_name` — a per-evaluation-type array. When `show_lowscore_evaluator` is 1, the system checks this array: a value of 0 for a given type masks the evaluator name, a value of 1 shows it.
    

These settings were originally UME-only. GME-side masking was added in early 2025 (MED-275 / MEDM-7359, In Production). This allows institutions to enforce evaluator confidentiality in alert emails consistent with their evaluation access settings.

A related feature to mask evaluator names in "Performance Evaluation Available" emails (the email sent to residents when a performance evaluation is ready to view) based on an Institutional Setting is currently in development (MED-786, In PI as of Feb 2026).

### Urgent task behavior and known operational issues

When a low score alert fires, the designated recipients receive both an **email notification** and an **Urgent Task** on their MedHub homepage. The Urgent Task persists until the recipient clicks into the evaluation and addresses the alert.

**Stuck alert urgent tasks** are a recurring support issue. If an administrator receives a low score alert but subsequently loses access to the relevant program (e.g., they transfer roles), the Urgent Task cannot be cleared from their interface — there is no self-service mechanism to dismiss it. Removal requires a data team request (MHDP project). Similarly, alerts routed via the Off-Program or GME Office paths can land on an administrator who does not have access to the evaluation itself, resulting in an "Access Denied" error when they click the alert; these also require data team removal.

### Other alert logic that remains true

*   A faculty member should **never** be alerted to or have access to an evaluation where they were the target. Resident of Faculty evaluations are confidential.
    
*   Which user types receive the low score alert for a given question is determined by the question-level configuration.
    
*   The evaluator's name displays or does not display in the alert according to the evaluation access settings and the masking root settings described above.
    
*   Faculty directors with access to "of faculty" evaluations can see evaluations completed on Faculty Outside Evaluators associated with their course or program. GME directors see this under View Faculty/Service/Program Evaluations → Faculty Evaluations subtab; UME directors under View Faculty/Course Evaluations → Faculty Evaluations.
    

## Permissions and access

By default, the following user types have the following evaluation access:

*   **Program Administrators** — full access to all evaluations in their program
    
*   **Coordinators** — full access by default; restricted by access map
    
*   **Program Director** — view all evaluations in the program, except evaluations _of themselves_ (resident of faculty forms about the PD are not visible to the PD)
    
*   **Associate Program Director** — view program/service evaluations; **cannot** see individual faculty evaluations of other faculty (intentional restriction; if the institution wants APDs to see these, the institutional setting that grants Director-level access is required)
    
*   **Mentor** — view evaluations of their mentees only
    
*   **Resident** — view evaluations _of_ themselves (per confidentiality framework — anonymized for resident-of-faculty); view their own self-evaluations
    
*   **Faculty** — view evaluations _of_ themselves (anonymized for resident-of-faculty); view their own self-evaluations; aggregate view of evaluations they've received when Program Settings allows
    

> **Faculty access to peer evaluations and aggregate views.** Per a recurring question (Ticket 155222, 177254), faculty access to aggregate views of their evaluations is configured per-program in Program Settings → Evaluations. Some programs enable aggregate access for faculty so they can see how peer/resident evaluators rated them in summary form (without seeing individual responses). The PD can disable this if institutional policy is to restrict faculty self-aggregate access.

> **Aggregate access requires multiple completed evaluations.** Confirmed via SKU and Ticket 170744: residents and faculty receiving aggregate views see them only when there are multiple completed evaluations. A single eval shows as the individual response (no aggregation occurs).

## Reports

### View Completed Evaluations

The base view for browsing completed evaluations. Filters at the top (basic search) and Detailed Search at the bottom. Detailed Search filters include:

*   Date range
    
*   Form
    
*   Evaluator / Target
    
*   Service
    
*   Tiered - Include Contributor Evaluations checkbox (see Tiered evaluations above)
    
*   Type filters
    

### Aggregate Evaluation Report

The most-used reporting view. Aggregates results across a date range and dimension (per resident, per faculty, per service, per program). Generates a report per target (or one combined report).

> **Aggregate report has a 2-year window for conference evaluations.** The Aggregate Evaluations Report only shows conference evaluations from the last two years. For older conferences, use View Completed Evaluations directly. (Ticket 225729.)

> **Some scale options collapse in the aggregate.** When the same form is delivered with different scale variants over time, the aggregate may show responses split by scale variant. This is by design — different scales are different data sets.

> **Aggregate report — Responses vs N.** The "Responses" count is the number of submitted responses, while "N" is the count of evaluations delivered. If Responses < N, some delivered evaluations were not submitted. (Ticket 159833.)

### RIS Completion Statistics and RIS Completion Summary Report

Two related reports for monitoring RIS:

*   **RIS Completion Statistics** (Evaluations → Evaluation Functions → RIS → Completion Statistics) — page-level stats on initiated vs completed
    
*   **RIS Completion Summary Report** (Reports → Evaluations → RIS Completion Summary) — Excel report
    

> **The two RIS reports do not always show matching numbers.** The "Supervisors Identified" column in the RIS Completion Summary will not always match the "Initiated" column in Completion Statistics. The Summary identifies how many supervisors the RIS request _identified_; the Statistics page counts initiated requests. If a request was initiated anonymously (or by some other path), it appears in Statistics but not Summary, or vice versa. The discrepancy is by design. (Ticket 123761.)

### Locked Questions Summary

GME-only report under **Evaluations → Locked Questions → Locked Questions Summary**. Shows responses to locked questions across all forms and programs that included them.

> **Inactivated locked questions are excluded from the Summary report** (but historical responses persist in Aggregate Evaluation Report). See "Locked questions" section above.

### Reporting on Tiered Contributor evaluations

Per the Tiered section: contributor evaluations are NOT in the Aggregate Evaluation Report. To see contributor responses, use View Completed Evaluations with the Tiered - Include Contributor Evaluations filter.

## Common scenarios

### "My faculty isn't receiving automated evaluations"

Walk through:

1.  Is the faculty scheduled to the service? (Faculty schedule per **MedHub - Demographics — Faculty** §"Permanent vs. dated assignments.")
    
2.  Is the resident scheduled to the same service for the same dates?
    
3.  Does the automated rule cover this PGY level and service?
    
4.  For visiting residents specifically, is a PGY level set on the training history record?
    
5.  Is the faculty member archived or have an institutional end date that has passed?
    

### "Residents got evaluations they shouldn't have"

Most common cause: faculty assigned to a service via more than one method (permanent + dated), producing duplicate triggers. See **MedHub - Demographics — Faculty** §"Permanent vs. dated assignments — pick one method per faculty."

### "Evaluations went out late"

Check:

1.  Was the rotation end date what you expected? Block date issues propagate to evaluations.
    
2.  For RIS, was the Send Request setting honored — and does the resident have an activity within the rotation block?
    
3.  For tiered evaluations, was the rule set up by rotation end date (not activity end date)?
    

### "I changed a milestone scale and now historical reports show different numbers"

Scale changes affect the rendering of historical responses. Confirm with the program whether their request was to (a) modify the existing scale (affecting historical) or (b) create a new variant (preserving historical). If the request was for (b) and (a) was done, escalate to data team to recover.

### "Resident is on the wrong PGY for milestones reporting"

Milestones reports use the resident's training history PGY level. If the level on the training history record is wrong, the milestone aggregate is wrong. See **MedHub - Training History** §"What 'current,' 'active,' and other status terms mean."

### "We need to bulk-replace an evaluation form mid-year"

There is no batch-replace function. The supported path: (1) finalize the new form, (2) update automated evaluation rules to use the new form, (3) decide whether existing in-flight evaluations on the old form should be removed or completed (most programs let in-flight finish on the old form).

### "A resident's evaluations are missing after they transitioned programs"

When a resident transfers internally between programs, their previous evaluations remain associated with their previous program. The new program does not see them in their default evaluation reports. The evaluations are still in View Completed Evaluations system-wide, but accessing requires the right permissions. See **MedHub - Training History** for the full transfer/access mechanics.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_evaluations_lockout_days`

Days after delivery before evaluations lock from edits.

`setting_evaluations_expiration_days`

Default expiration window (days) after which delivered evaluations are removed from incomplete lists.

`setting_evaluations_late_notification_days`

Days after delivery before late notification email goes to evaluator.

`setting_evaluations_milestone_default_scale`

Default milestone scale shown when building a new form and using batch-add milestones.

`setting_locked_questions_enabled`

Enables the GME-side Locked Questions framework.

`setting_evaluations_outside_evaluator_enabled`

Enables Outside Evaluator functionality.

`setting_evaluations_offprogram_evaluator_enabled`

Enables Off-Program Evaluator functionality.

`setting_eval_tracking_reviews` (per-program)

Tracking Reviews — when a faculty/resident marks an evaluation as reviewed.

`setting_eval_tiered_lock_after_delivery` (per-program)

Days after delivery the Tiered Leader composite locks from contributors.

`setting_eval_aggregate_faculty_self_view` (per-program)

Allows faculty to see aggregate views of evaluations of themselves.

Program-level settings (configured under Program Settings → Evaluations):

*   Tiered Evaluations enabled
    
*   Tiered Evaluations - Lock after Delivery (days)
    
*   Tracking Reviews
    
*   Aggregate self-view for faculty
    
*   Aggregate access map for various user types
    
*   Annual program evaluation date
    
*   Director access to individual faculty evaluations
    

## Database tables appendix

Table

Purpose

`eval_forms`

Form definitions — title, types, format, status (draft / final).

`eval_forms_questions`

Questions on each form, including type, scale ID, milestone tagging, header / non-header flag.

`eval_forms_programs`

Form sharing across programs; per-program access (read-only / write).

`eval_scales`

Scale definitions — option labels, headers, N/A behavior.

`eval_milestones` / `eval_milestones_subcompetencies` / `eval_milestones_elements`

Milestone packages, subcompetencies, and elements.

`eval_responses`

Completed evaluation records — header data per submitted evaluation.

`eval_responses_questions`

Per-question responses inside `eval_responses`.

`eval_deliveries`

Delivered evaluations (incomplete and complete) — recipient, target, dates.

`eval_automated`

Automated evaluation rules.

`eval_automated_rules`

Per-rule conditions inside `eval_automated`.

`eval_groups`

Evaluation Groups (Tiered, Resident, Faculty, Staff).

`eval_groups_users`

Group memberships.

`eval_tiered_contributors`

Tiered Contributor records associated with Tiered Leader composite evaluations.

`eval_outside_evaluators`

Outside Evaluator records.

`eval_offprogram_evaluators`

Off-Program Evaluator associations.

`eval_locked_questions`

GME-side institution-wide locked questions.

`eval_locked_questions_responses`

Locked question response data feeding the Locked Questions Summary.

`eval_ris_settings`

RIS configuration per service.

`eval_ris_requests`

RIS request records (request sent, supervisors identified).

`eval_alerts`

Low-score alerts and other alert flags.

`eval_reviews`

Tracking Reviews records (when enabled).

# MedHub - Evaluations - GME - Milestones

# MedHub - Milestones, EPAs & Milestone Elements — GME

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Milestones are how ACGME-recognized GME programs measure a trainee's progression toward competence. In MedHub, the milestone framework is a tagging-and-reporting system layered on top of evaluations: evaluation questions are tagged to milestone objects, the responses flow into milestone reporting, and a program's Clinical Competency Committee (CCC) uses that data to set a level for each trainee twice a year on the Progress Report.

This article is the GME milestones reference. Form-building mechanics (scales, question types, skip logic, header descriptions) live in **MedHub - Evaluations — Forms (GME)**, which carries only a brief tagging summary and points here. Everything else about milestones — the object taxonomy, acquiring and versioning packages, tagging behavior, the Milestone Settings tab, Milestone Summary, achievements, Progress Reports, and the internal Support-side package-build procedure — lives here.

It does **not** cover: how to build a CCC group, add members, or grant CCC access, and what the committee can see and do beyond the Progress Report — those live in **MedHub - Clinical Competency Committee (GME)**. This article covers the Progress Report itself (the milestone artifact the CCC produces) but references the CCC article for the committee's setup and broader workflow. Detailed milestone _reporting_ layouts live in **MedHub - Reports — Evaluations, Milestones (GME)**; this article covers reporting only where it is inseparable from a tagging or settings behavior.

## The four taggable objects

MedHub milestone tagging operates on four distinct object types. Understanding how they nest is the foundation for everything else, because tagging the wrong object — or the right object with the wrong scale — is the single most common source of "my milestone data isn't showing" tickets.

*   **Competency** — the top-level ACGME core competency (Patient Care, Medical Knowledge, Systems-based Practice, Practice-based Learning and Improvement, Professionalism, Interpersonal and Communication Skills). A competency is a grouping; programs rarely tag at this level alone.
    
*   **Subcompetency** — the reportable unit (e.g., PC1, MK2, ICS1). This is what is reported to ACGME (WebADS) and what the CCC sets a level for on the Progress Report. Each subcompetency belongs to one competency.
    
*   **Milestone element** — the finest level of granularity: the individual bullet points listed under each level of a subcompetency. Elements are an optional, more detailed collection method. Element data is **never** reported to WebADS; it exists to help the CCC arrive at a subcompetency level.
    
*   **EPA (Entrustable Professional Activity)** — a specialty-defined activity (e.g., "EPA 1") that some specialties use alongside subcompetencies. An EPA can be linked to one or more subcompetencies so that tagging the EPA on a question can also tag the associated subcompetency.
    

A single evaluation question can be tagged to any combination of these four objects. In the database, each question-to-object link is a row in `eh_evals_items_links`, which carries a column for each object type (`catID` for competency, `milestoneID` for subcompetency, `epaID` for EPA, `objectiveID` for element) plus an `auto_flag` / `auto_parent` pair that records when a link was created automatically through a defined parent relationship rather than tagged by hand (see "Tagging questions" below).

Object

Granularity

Reported to WebADS

Typical scale

CCC sets level?

Competency

Highest (grouping)

No (rolled up)

Dreyfus 1-5

Via "competency / overall" questions, if enabled

Subcompetency

Reportable unit

**Yes**

Dreyfus 1-5 (Level 1-5, optional N/A)

**Yes** — on the Progress Report

Milestone element

Finest (bullet points)

No

Short scale (Yes/No, Pass/Fail, Never/Sometimes/Always)

No — assists CCC only

EPA

Activity-level

No (mapped to subcompetencies)

Often a trust-level scale

No

## Enabling milestones for a program

Milestones are off by default. Turning them on is a one-time administrator setup task.

1.  **Program Settings → Evaluations subtab → "Enable Milestones"** — place a checkmark and Save Settings. This exposes the **Milestone Management** link in the middle column of the Home tab under Site Management.
    
2.  **Access requirement to see Milestone Management.** An individual program administrator must have the **Reports – Evaluations** access point to get the Milestone Management link. Having only Evaluations – Viewing is not sufficient; the link will not appear. Faculty Program Directors get the link through Program Director access. (Ticket 170821.)
    

Once enabled, the program acquires its milestone package (next section) before any tagging can occur.

> **School / UME side.** The UME equivalent is gated by a separate school-level root setting and is reached through "Milestones/EPA Management" on the Student Admin side. That path and its competency-creation workflow are documented in the UME milestones documentation; this article is GME-only and does not rely on it.

## Acquiring a package: import, update, and inherit

A program gets its subcompetencies one of three ways. All three are reached from **Milestone Management**.

### Direct import

On the **Subcompetencies** subtab, if no subcompetencies are listed yet, click **\+ Import/Update Subcompetencies** at the bottom. Select the package that exactly matches the program's specialty or subspecialty as published by ACGME (or another recognized body — see the package-build note below). The same button is used later to pull in a new version of the package (an "update").

EPAs are imported the same way from the **EPAs** subtab; elements arrive as part of the subcompetency package.

### Inherit (combined and shared-package programs)

Some programs do not import directly — they **inherit** another program's package. Go to **Milestone Management → Milestone Settings → "Inherit Milestones from Program(s)"** and select the source program(s).

*   This is intended for genuinely combined programs (e.g., Internal Medicine/Pediatrics inherits from both Internal Medicine and Pediatrics).
    
*   It is also used where subspecialties legitimately share a package (many Internal Medicine subspecialties share the IM package).
    
*   A program that inherits shows a yellow banner on Milestone Management: "Milestones for this program are inherited from \[program\]. If this is not correct, please update your Milestones Settings."
    
*   When a program inherits from a source that has the **"Include competency and overall questions"** setting enabled, those competency/overall questions appear in the inheriting program's Progress Report even if the inheriting program does not have that setting enabled itself. (Ticket 150351.)
    

### Migrating from inherited to direct

When ACGME issues a package specific to a program that has been inheriting, the program migrates from inherited to direct. This is more involved than a first-time import because the inheritance link is the only thing connecting the program to its historical milestone data.

*   While inheriting, the **Import/Update Subcompetencies** button is **not** visible. It only appears once inheritance is removed.
    
*   **Before un-inheriting, export everything tied to the inherited package** — run milestone reports and the Evaluation Data Export, and export all needed Progress Reports. When the inheritance link is removed, milestone averages in Milestone Summary and milestone reporting lose the mapping needed to calculate against the old (inherited) package. The completed evaluations themselves remain in View Completed Evaluations; it is the milestone _calculation_ mapping that drops.
    
*   To migrate: Milestone Management → Milestone Settings → set "Inherit Milestones from Program(s)" to none → Save → return to the Subcompetencies subtab → **Import/Update Subcompetencies** to pull the dedicated package.
    
*   **The inheritance link can be toggled back on temporarily** to reconnect the old mapping and view/export historical data, then turned off again. Switching inheritance on and off does not affect the program's directly imported package — the directly imported data reappears once inheritance is removed again. (Ticket 172635.)
    

## Package versions and active dates (Milestones 1.0 vs 2.0)

ACGME revised many specialties from Milestones 1.0 to 2.0. MedHub handles both versions concurrently using **Active Periods** on each package, and this date logic — not deletion — is how old and new subcompetencies are kept straight.

### How active dates drive reporting

Every package has an Active Period with a **start date** (and optionally an end date). When a report or screen renders milestone data, the system uses the **evaluation's issue/delivery date** to decide which package was active at that time, and displays the subcompetencies that were active during the selected range.

*   A v2.0 package with a 7/1/2021 start and a v1.0 package end-dated 6/30/2021: a report run 1/1/2021–6/30/2021 shows only v1.0 subcompetencies; run 7/1/2021 onward shows only v2.0; run across both (e.g., 1/1/2021–today) shows both sets.
    
*   Most milestone layouts and reports include a **Version column** so it is clear which package a subcompetency belongs to.
    
*   The **Milestone Summary** "last 6 months" view shows whichever subcompetencies were active within the trailing six months — so during a transition both versions appear, and the old version drops off once the view is more than six months past the v1.0 end date. (Tickets 171418, 179912.)
    

### Statuses: Active, Inactive, Archived

Packages and subcompetencies carry a status that controls availability:

*   **Active** — available to import, tag, and report.
    
*   **Inactive** — displays in gray on the package list and **cannot be imported or updated**. (This is why a v1.0 package is _end-dated_ rather than inactivated when a v2.0 is published — end-dating preserves it for historical reporting; inactivating would block it.)
    
*   **Archived** — does **not** display on the standard package list at all. An archived subcompetency is excluded from evaluation tagging and from most reports, charts, and views, though it can still be viewed via "View all Subcompetencies (Active/Archived)." **Archiving can remove the ability to run milestone reports on those subcompetencies** — use it deliberately. (Ticket 230446; AMBS-10287.)
    

### Re-tagging on a version change

When a program adopts a new version, **evaluation questions must be re-tagged** to the new subcompetencies — this does not happen automatically. The previously tagged subcompetencies remain visible for the inactive/old package so historical data is not lost.

*   Tagging both an old and a new subcompetency to the same question is safe: because packages have active dates, the evaluation's issue date determines which version the response counts toward. A question tagged to one or more v1.0 and one or more v2.0 subcompetencies routes each response to the version active on the issue date. (Ticket 171418.)
    
*   **The header-description language does not follow a re-tag** (see the gotcha under "Tagging questions"). This is the single biggest pain point of a version change.
    
*   MedHub does **not** store the date a program imported a given package version — there is no audit field recording when a v2.0 was brought in. (Ticket 180649.)
    

> **Batch Add during a transition.** When a program has both versions and uses **Batch Add Milestones** on a form, the subcompetency list does not have a version column, so the v1.0 and v2.0 entries of a pair look identical. The working tip: temporarily Archive the v1.0 subcompetencies, Batch Add the v2.0 set, then reactivate the v1.0 subcompetencies. (Ticket 155423.)

## Tagging questions

A form question collects milestone data only when it has **both** of two attributes:

1.  It uses a **milestone scale** (a scale whose title begins "Scale: Milestone…"), and
    
2.  It is **tagged** to at least one milestone object (subcompetency, element, EPA, and/or competency).
    

Neither alone produces reportable milestone data. A milestone scale with no tag, or a tag on a non-milestone scale, yields nothing in Milestone Summary. (Tickets 83926, 78283.)

Tagging is done in the form builder (Evaluations → Manage Evaluation Forms → \[form\] → Modify Form) per question, via the **Update Subcompetencies**, **Update EPAs**, and **Update Competencies** links on each milestone-scale question. **Batch Add Milestones** adds a milestone-scale question per selected subcompetency in one action.

### EPA → subcompetency auto-tagging via defined links

MedHub will not count subcompetency data unless the subcompetency itself is tagged to the question — tagging only the EPA is not enough. But you can avoid tagging both by hand using **defined links**:

1.  In **Milestone Management → EPAs subtab → Linked Subcompetencies** column, open the link for an EPA and select the subcompetency(ies) that should be associated with it.
    
2.  In the question, click **Update EPAs**, select the EPA, and check **"Tag Subcompetencies and Competencies based on defined links"** → Submit.
    

This automatically tags the associated subcompetency (and competency) whenever you tag the EPA, instead of tagging each separately. In the database these auto-created links are flagged (`auto_flag = 1`) with the parent type recorded in `auto_parent` (EPA / subcompetency / element parent). (Ticket 174906.)

### Header descriptions: auto-populate once, never on re-tag

When a question is **first created** with a milestone scale and tagged to **exactly one** subcompetency, the author can opt to pull the ACGME level language into the question's **header descriptions** automatically.

*   This prompt does **not** appear when more than one subcompetency is tagged.
    
*   It does **not** re-fire when you later change the tag on an existing question. Re-tagging a finalized question to a new (e.g., v2.0) subcompetency leaves the old header language in place. To update it, manually edit the **Scale Descriptions → Header Descriptions** for the question, or build a new question/form (where the auto-populate prompt is available again). Product is aware this creates substantial manual work on version changes. (Milestones FAQs; Ticket 171418.)
    

### Completed evaluations update retroactively when a tag changes

Changing a question's tag updates **already-completed** responses for reporting purposes. If you tag an existing question to PC1, every prior answer to that question now reports under PC1. This is what makes re-tagging after a corrected package import work — but it also means a wrong tag silently re-routes historical data, so tag deliberately.

## Milestone elements

Elements are the optional, granular layer. Whether to use them is entirely the program's choice; many programs track only subcompetencies.

*   **Different scale type.** A subcompetency question normally uses a Dreyfus Level 1-5 scale; an element question uses a short scale asking whether the trainee met the expectation (Pass/Fail, Yes/No, Never/Sometimes/Always). This scale difference is the practical reason most programs do not tag elements and subcompetencies to the same question.
    
*   **Tagging both on one question is allowed but usually unwise.** If a 2-point (Yes/No) element scale is used on a question also tagged to a subcompetency, the subcompetency is forced to its highest or lowest level with nothing between. A 1-5 subcompetency scale on a question also tagged to an element distorts the element into a Likert score. (Milestones FAQs.)
    
*   **Collection.** Element data is commonly collected through milestone-scale questions on **end-of-shift** milestone evaluations. View it as Admin under **Milestone Management → Milestone Summary → View Type: Milestone List → List to Display: Milestone Elements**, or within the current/previous six-month Progress Report.
    
*   **Elements assist the CCC; they are not reported.** On the Progress Report, tagged-element results can change the color of boxes to help the CCC choose a subcompetency level, but only subcompetencies are reported to WebADS. The "Progress Report Summary Report" pulls the CCC's subcompetency selections, not element data. The "x/y" beneath an element on the Progress Report (e.g., 2/2) — the bottom number is the count of times an evaluation question tagged to that element was answered. (Milestones FAQs.)
    

## Milestone scales and reporting interaction

Milestone scales behave differently from standard scales in averages, and this surprises programs.

*   **Milestone scales are excluded from non-milestone averages.** Any scale titled "Scale: Milestone…" is assumed to follow the Dreyfus (progressive) model rather than a meaningful numeric mean, so its data is omitted from the peer/Resident/Student/Faculty Averages reports and from the peer average on the Aggregate Evaluation Report — even when the scale is tagged to competencies. For evaluations of **faculty**, use non-milestone scales: milestone scales only produce comprehensive data (averages, progressions) for residents. (Tickets 78283, 83926.)
    
*   **The "Exclude from average calculations" designation.** Milestone scales have historically been set to "exclude from average calculations." The Trend Chart includes any question with milestone tagging regardless of standard vs milestone scale, **but only if the scale is not marked "exclude from average calculations."** A scale carrying that designation drops its questions out of the Trend Chart average (a resident showed a 1.0 average for a block because the most-used form's scale was excluded). The downstream impact of removing that designation from milestone scales is not fully characterized — escalate rather than toggling it casually. (Ticket 175893; AMBS-7078.)
    
*   **Peer-average minimum.** For residents and faculty viewing a peer average (spider graph), the peer group is same-program, same-PGY trainees, and the peer average will **not** display if there are fewer than three active trainees in that pool (otherwise individuals' scores could be reverse-engineered). Administrators have no minimum because they already have full evaluation access. (Ticket 145008.)
    

## Milestone Summary and Achievements

The **Milestone Summary** subtab (Milestone Management → Milestone Summary) shows milestone data calculated from completed evaluations for the trailing six months, viewable as a Milestone List for subcompetencies or elements.

**Milestone Achievements** are a separate, manual mechanism:

*   Marking a resident as having "achieved" a subcompetency on the Milestone Summary tab feeds the **Milestones Summary by Level** report.
    
*   Achievements are meant for manually marking trainees who have attained competence (progressed through all levels, or Level 1-4, by graduation). They can be checked off by the Program Administrator or a Faculty Mentor and are visible to the trainee on their own Milestones Summary page.
    
*   **Achievements do not feed the Progress Report.** They are a subjective, whole-training marker, distinct from the CCC's six-month level selections. To record where a resident currently sits, use the Progress Report, not Achievements. (Milestones FAQs.)
    

## Progress Reports

The Progress Report is the artifact the CCC produces: a per-resident, per-period record of the subcompetency level the committee assigns. (The committee's composition, group setup, member access, and broader meeting workflow live in **MedHub - Clinical Competency Committee (GME)**; this section covers the report itself.)

### Periods and data basis

*   **Fixed six-month periods.** Periods are **Jul–Dec** and **Jan–Jun** — not a rolling six months. (Milestones FAQs.)
    
*   **Completion-date driven.** The data feeding a Progress Report is based on each evaluation's **completion date**, not its issue date. (Milestones FAQs.)
    
*   **Version-aware.** A Progress Report displays only the subcompetencies whose package was active during that six-month range. During a transition the report reflects whichever version was active. (Ticket 179912.)
    
*   **Retention.** MedHub exposes the current plus six previous Progress Reports; it was not built as a historical repository, and reports before that window cannot be selected or edited, nor can historical Progress Report data be imported. (Tickets 235573; AMBS-11024.)
    

### Producing levels: data is optional, lock controls editing

*   A subcompetency level can be set on the Progress Report **with or without** attached evaluation data — as long as the report is unlocked, anyone with write access can set or change a level. (This is why a trainee can have a marked Progress Report but no milestone evaluation data.) (Ticket 83926.)
    
*   **Resetting a level:** Milestone Management → Progress Reports → choose the resident and the six-month period → **Lockout** → open the subcompetency's **More Information** link → **Reset Level** → scroll down → **Update Progress Report** → at the top, **Unlock**. (Milestones FAQs.)
    
*   **"Last" level after a version switch.** After switching to v2.0, there is no "last" level shown until one full round of v2.0 levels has been selected — v1.0 selections do not carry over to v2.0. (Ticket 143149.)
    
*   **Status drives resident visibility.** A resident cannot see CCC entries on their Progress Report unless the report is in **Final** status, even when the "Allow residents to view progress report levels" setting is enabled. (Milestones FAQs.)
    

## Milestone Settings tab

Milestone Management → **Milestone Settings** holds the per-program configuration. Documenting each because the impact of several is non-obvious and they generate recurring tickets.

### Default Subcompetency Scale

Defines (a) the scale — specifically the **header** — used on the Progress Report, and (b) the default milestone scale option that appears when building a new evaluation form with **Batch Add Milestones**. Changing it updates the headers shown on the Progress Report to match the new scale. It does not retroactively change scales already saved on completed evaluations. (Ticket 223297.)

### Inherit Milestones from Program(s)

Selects the source program(s) a combined or shared-package program inherits its package from. See "Acquiring a package → Inherit" above for full behavior, including the competency/overall-question inheritance interaction and the migrate-to-direct path.

### Progress Report settings

*   **Allow residents to view progress report levels** — adds a **CCC Reporting (Last)** column on the resident's Milestones Summary area showing the level and month/year for each subcompetency from the last completed Progress Report.
    
*   **Allow residents to progress reports** — adds a **Progress Reports** subtab on the resident's Evaluations tab, letting them view every Progress Report across their training.
    
*   **Allow residents to view individual subcompetency comments** — when "Allow residents to progress reports" is on, adds the individual subcompetency comments to the resident's view.
    
*   **Allow residents to view general CCC comments** — when "Allow residents to progress reports" is on, adds the general CCC comments at the bottom of the report to the resident's view.
    
*   **Display header descriptions** — displays the header descriptions from the designated default milestone scale on the Progress Report for everyone with access.
    
*   **Include N/A scale option** — controls whether an N/A column appears on the Progress Report. Even if the default milestone scale includes N/A, the N/A column will not appear on the Progress Report unless this setting is enabled.
    
*   **Include data prior to 6 month review period** — brings additional data into the six-month summary area (Average Level, Range, # of Questions, # of Comments, # of Evaluators) and adds a dropdown to choose how many extra months to include.
    
*   **Include competency and overall questions** — adds an area at the end of each subcompetency set where the user completing the Progress Report assesses the competency as a whole and attests whether the trainee is "demonstrating a learning trajectory that anticipates the achievement of competency for unsupervised practice" (options: Yes, No, Conditional on Improvement). When a program **inherits** from a source that has this enabled, these questions appear in the inheriting program's Progress Report regardless of the inheriting program's own setting. (Milestones FAQs entries ES 6/8/2020, Ticket 150351.)
    

## Internal: building a Milestones package on the Support Site

> **Internal / Support only.** This section is for MedHub Support staff authoring a package on the support site so that client programs can import it. Program administrators do not perform these steps.

A program can only import a package that Support has already built on the support site. As of 2025, packages no longer have to originate from ACGME: if a client submits milestones from a recognized specialty board or other body (not a program inventing its own), and they are in the correct format, Support adds them. (This supersedes older guidance that only ACGME-published milestones could be added — see the cross-reference note at the end.)

**Procedure** (dates/spreadsheet specifics below reflect the 2021 version-2.0 rollout; adjust as needed):

1.  Locate the package source (ACGME Milestones overview page, or the submitting board/body's published set).
    
2.  On the support site, go to **Lists → Milestones** (`support.medhub.com/u/a/lists.mh?list=milestones`).
    
3.  Search the list to confirm the package does not already exist; note whether a v1 exists. Ignore "Objectives/Curricular MS" types.
    
4.  Click **\+ Add Milestones Package** at the bottom and complete the package header:
    
    *   **Package Name** — name with version appended (e.g., "Preventive Medicine v2.0").
        
    *   **Version** — e.g., "v2".
        
    *   **Status** — set **Inactive** initially; switch to Active only after the whole package is entered.
        
    *   **Active Period** — Start date (e.g., 2021-07-01); leave End as "Present."
        
    *   **Header Levels** — `1.0|2.0|3.0|4.0|5.0`.
        
    *   **IRIS codes** — enter the code(s) from the spreadsheet, pipe-delimited, or leave blank for now.
        
5.  Add each subcompetency via **\+ Add Milestone**:
    
    *   Select the **competency** from the dropdown.
        
    *   **ID Abbrev** — competency abbreviation + subcompetency number (e.g., MK-2). Abbreviations: Patient Care = PC; Medical Knowledge = MK; Systems-based Practice = SBP; Practice-based Learning and Improvement = PBLI; Professionalism = PROF; Interpersonal and Communication Skills = ICS.
        
    *   **Milestone** — the subcompetency description.
        
    *   **Status** — leave Active.
        
    *   **Header Descriptions** — enter each level's language in the matching level field, with a pipe before each phrase/sentence.
        
    *   Submit and repeat for every subcompetency.
        
6.  Switch the package **Status to Active** once the full package is entered.
    
7.  Find the **v1 package** and set its Active Period **end date to 6/30/2021** — do **not** Inactivate it (inactivating would block historical import/reporting; end-dating preserves it).
    
8.  Record the completed date on the tracking spreadsheet.
    

## Settings appendix

> **Source of truth.** Default values and descriptions reflect the April 2026 root settings export; the canonical, always-current source is `support.medhub.com > Lists > Settings`. Check there, and check the institution's configured value, before troubleshooting.

Setting

Scope

Effect

Enable Milestones

Program Settings → Evaluations

Turns on milestones for the program and exposes the Milestone Management link (requires Reports – Evaluations access to appear).

Default Subcompetency Scale

Milestone Settings (per program)

Sets the header scale used on the Progress Report and the default milestone scale for Batch Add Milestones.

Inherit Milestones from Program(s)

Milestone Settings (per program)

Inherits another program's package (combined/shared-package programs); blocks the direct Import/Update button while active.

Allow residents to view progress report levels

Milestone Settings (per program)

Adds the CCC Reporting (Last) column to the resident's Milestones Summary.

Allow residents to progress reports

Milestone Settings (per program)

Adds a Progress Reports subtab to the resident's Evaluations tab.

Allow residents to view individual subcompetency comments

Milestone Settings (per program)

Adds individual subcompetency comments to the resident's Progress Report view.

Allow residents to view general CCC comments

Milestone Settings (per program)

Adds general CCC comments to the resident's Progress Report view.

Display header descriptions

Milestone Settings (per program)

Shows default-scale header descriptions on the Progress Report.

Include N/A scale option

Milestone Settings (per program)

Shows the N/A column on the Progress Report (required even if the scale includes N/A).

Include data prior to 6 month review period

Milestone Settings (per program)

Brings additional months of data into the six-month summary; adds a month-count dropdown.

Include competency and overall questions

Milestone Settings (per program)

Adds competency-level / overall trajectory questions to the Progress Report; inherited programs receive these if the source has it enabled.

`settings_school_milestones`

School (root)

Enables milestones on the **school/UME** side. Out of scope here; documented in the UME milestones article.

## Database tables appendix

Table

Purpose

`ref_competencies`

Competencies (and subcompetency categories) per program — title, abbreviation, order, status.

`ref_milestones`

Subcompetencies — name, abbreviation, parent competency (`competency_catID`), goal PGY range and values, package reference (`global_packageID`), Active Period start/end, status.

`ref_milestones_epas`

EPAs — name, abbreviation, package reference, Active Period, status.

`ref_milestones_objectives`

Milestone elements — name, abbreviation, package reference, Active Period, status.

`ref_milestones_packages`

Package catalog — name, version, type, status.

`ref_milestones_links`

Defined parent links among competency / subcompetency / EPA / element used for auto-tagging "based on defined links."

`eh_evals_items_links`

Question-to-object tagging join — one row per link, with `catID` / `milestoneID` / `epaID` / `objectiveID`, plus `auto_flag` and `auto_parent` recording auto-tagged links and the parent type.

`users_residents_milestones`

Milestone **Achievements** — per-user achieved-subcompetency records (feeds Milestones Summary by Level).

`users_residents_milestones_progress`

Progress Report records — per resident, program, subcompetency, year, half (1/2), level, and status (Incomplete/Complete).

`users_residents_milestones_progress_comments`

General CCC comments on a Progress Report (per program, year, half).

`users_residents_milestones_progress_audit_log`

Audit trail of Progress Report edits — old/new value, editor, change date.

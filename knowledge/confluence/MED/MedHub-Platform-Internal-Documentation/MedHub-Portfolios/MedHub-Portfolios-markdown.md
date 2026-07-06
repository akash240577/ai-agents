# MedHub - Portfolios - markdown

# MedHub - Portfolios

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Portfolios in MedHub track the scholarly, clinical, and professional activities trainees and faculty produce alongside their core training. Portfolio entries are how the system records publications, presentations, research projects, quality improvement work, awards, and a long list of other activity types — each with its own structured fields, its own date logic, and its own intersection with reporting (CV export, scholarly activity tracking, APE/accreditation, Faculty CME).

Two parallel portfolios:

*   **Resident Learning Portfolios** — accessed by the trainee and by Administrators (and mentors, with restrictions). The Resident's portfolio is broader than just scholarly activity — it also includes Goals & Objectives, Training Summary, Procedures, and CME (when enabled).
    
*   **Faculty Learning Portfolios** — accessed by the faculty member and Administrators. The Faculty portfolio's most-used feature is **CME Tracking** for institutions with `settings_cme` enabled.
    

Both portfolios share the same underlying entry-type framework, but the access patterns, reporting outputs, and which features are enabled per-program differ.

This document covers Portfolios as a feature: entry types and their fields, scholarly activity tracking, the CV export and what's included, the Resident Training Summary view, Goals & Objectives, Faculty CME Tracking, the Portfolio Import Wizard, evaluation requests on portfolio entries, and the operational patterns that come up in support tickets.

It does not cover: evaluation form configuration (see **MedHub - Evaluations - GME / UME**); procedure logging mechanics (see **MedHub - Procedures**); how conferences feed CME (see **MedHub - Conferences**, "CME certificates"); or detailed APE/accreditation reporting (deferred to **MedHub - Accreditation**, when drafted).

## Where it lives

*   **For trainees** — accessed via their **Portfolio** tab. Subtabs include Entries, Training Summary, Goals & Objectives, Procedures, CME Tracking (when enabled).
    
*   **For Administrators (Resident-side)** — accessed via **Learning Portfolios - Residents**, with a Resident dropdown to switch between trainees.
    
*   **For Administrators (Faculty-side)** — accessed via **Learning Portfolios - Faculty**, with a Faculty dropdown to switch between faculty members.
    
*   **For Faculty** — accessed via their **Portfolio** tab; same subtab structure as residents but oriented around their professional activities and CME.
    
*   **For Mentors** — view-only access to mentees' portfolio entries via the standard mentor view.
    

> **The Resident dropdown in Learning Portfolios shows ALL residents in ALL programs the Administrator has access to**, not just the program selected on the home page. This is by design (the Learning Portfolio grants the user access to all residents of all programs the user has access to). An Administrator with access to 61 programs will see all residents across those 61 programs in the dropdown — even when "viewing" a single program's portfolio. (Tickets 162471, 244569, AMBS-12411, confirmed CD 10/14/2020 and LS 11/25/2024.)

## Entry types

Each portfolio entry type has its own structured fields. The most commonly used:

**Scholarly activity types** (count toward APE/accreditation Scholarly Activity totals — see "Scholarly Activity" below):

*   Publication - Book Chapter
    
*   Publication - Journal Manuscript
    
*   Publication - Electronic Media
    
*   Publication - Abstract
    
*   Presentation - National/Regional
    
*   Presentation - Local
    
*   Research Project
    
*   Award/Honor
    

**Clinical & training activity types:**

*   Continuity Clinic Log
    
*   Patient Log
    
*   Procedure/Patient Notes
    
*   Rotation Notes
    
*   Structured Clinical Observation
    
*   Teaching Skills Assessment
    
*   Quality Improvement Project
    
*   Evidence Based Medicine Review
    

**Reflective and learning types:**

*   Self Reflection
    
*   Learning Plan
    
*   Goals & Objectives (also has its own subtab structure — see below)
    
*   Ethics Case
    
*   REACH
    

**Other:**

*   General Entry — catchall for activities that don't fit a specific type
    
*   Community Service
    
*   Grant
    
*   Literature Search
    
*   Custom Portfolio Entry Types — an institution can add custom entry types
    

Some types include the option to add the entry to the resident's CV; others do not (see "CV export" below). The list of available entry types per program is configured at implementation; programs can request additional or custom types by contacting Support.

### Custom portfolio entry types

Institutions can have custom portfolio entry types created. Custom types support the same fields as standard types (entry date, comments, faculty review, etc.) plus any institution-specific fields. The character limit on the comment field in custom portfolio entry types is large — **2.9 million characters without spaces, 3.5 million characters with spaces** (Ticket 165870, confirmed JS 12/14/20).

## Date fields and the Entry Date

Portfolio entries have **multiple date fields** depending on type — publication date, presentation date, project start/end, etc. — but the **Entry Date** is the only consistent field across all types, and the Entry Date is what most reporting hinges on.

This produces a recurring confusion: a resident enters a publication with a publication date in June 2019, but creates the entry in November 2019. The publication date is in 2018-19 academic year, the entry date is in 2019-20. **The system uses Entry Date for APE / scholarly activity reporting, not the activity-specific date.** This means the publication will count toward the 2019-20 APE, not the 2018-19 APE — even though the publication itself was published in the prior academic year.

This is by design and not a bug. The reasoning: portfolio entries have a wide variety of dates (publication, presentation, start, end, accepted, submitted, etc.) and not all entry types include all dates. The developers chose Entry Date as the single consistent field for reporting because it's the only field guaranteed to be present and accurate across every entry type.

> **Workaround for retroactive entries.** When a resident is logging a portfolio entry for an activity from a prior academic year, label the comments section with a phrase like "Poster presentation date: 6/15/2019" so the actual activity date is captured for the reader. The entry will still count toward the current academic year's APE/scholarly activity totals based on the Entry Date. (Tickets 136127, 141927, 174606, confirmed HN/MM 5/17/2021.)

> **The exception: Publication Date is now a date field.** As of MB's 2019 fix, the Publication Date field on Publication-type entries was converted from arbitrary text to a proper date field. Older publications with corrupted dates (e.g., 12/31/1969 or 1/1/YEAR defaults from text-based entries) can be corrected by hand to mm/dd/yyyy. PubMed-imported publications now also conform to the expected date format. (Ticket 133569, confirmed MB.)

> **Year Published 4-digit-only entries still produce 12/31/1969.** If a resident enters only a 4-digit year in the Publication Date field (e.g., "2003"), the system stores 12/31/1969 because the field expects a full date. **A full date must be entered.** Product is examining this functionality but no timeline is set. (Ticket 188439, AMBS-7962, confirmed BG.)

## Scholarly Activity

The 8 scholarly activity entry types listed above are aggregated for institutional reporting. Where this matters:

*   **APE (Annual Program Evaluation)** — The APE pulls scholarly activity for the academic year. The system uses Entry Date to assign the activity to a year (see "Date fields" above).
    
*   **ACGME accreditation reports** — Same logic.
    
*   **Program Scorecards** — Same logic.
    

The 8 types: Publication - Book Chapter, Publication - Journal Manuscript, Publication - Electronic Media, Publication - Abstract, Presentation - National/Regional, Presentation - Local, Research Project, Award/Honor. (Confirmed BG.)

Custom portfolio entry types can be flagged as scholarly activity if configured that way at the institution level. The flag determines whether they're included in the scholarly activity rollup.

## Visibility and the "remove from view" option

When a resident creates a portfolio entry, they have a checkbox to **remove the entry from Program Director, Mentor, and Administrator views**. This is generally used temporarily while the resident is still working on the entry — they don't want their PD to see a draft.

Behavior:

*   The entry is **hidden from the administrator's list view** of the Portfolio.
    
*   The entry **does appear on the Portfolio Entries report** (which lists all entries tagged to a resident regardless of visibility).
    
*   The entry can always be seen if you log into the resident's account.
    

If a portfolio entry shows on a report but doesn't appear in the trainee's portfolio from the admin side, the resident has likely set this flag. The fix: ask the resident to uncheck the visibility flag, or log in as the resident and uncheck it. (Ticket 120107, confirmed TM.)

## CV export

The Resident Portfolio includes an **Export Portfolio** function that produces:

*   An **HTML CV** (the resident's curriculum vitae, formatted)
    
*   An **Excel/XLS export** of all portfolio entries
    

These are different in coverage:

### HTML CV — what's included

Only entries flagged as CV-eligible appear in the HTML CV. The 8 CV-eligible types map exactly to the scholarly activity types:

*   Publication - Book Chapter
    
*   Publication - Journal Manuscript
    
*   Publication - Electronic Media
    
*   Publication - Abstract
    
*   Presentation - National/Regional
    
*   Presentation - Local
    
*   Research Project
    
*   Award/Honor
    

(Ticket 167885, confirmed JS 1/25/21.)

### XLS export — what's included

The XLS export includes everything in the HTML CV **plus** all entries that are not eligible for CV inclusion:

*   General Entry
    
*   Community Service
    
*   Evidence Based Medicine Review
    
*   Quality Improvement Project
    
*   Self Reflection
    
*   Structured Clinical Observation
    
*   Teaching Skills Assessment
    
*   Continuity Clinic Log
    
*   Learning Plan
    
*   Patient Log
    
*   REACH
    
*   Ethics Case
    
*   Grant
    
*   Literature Search
    
*   Rotation Notes
    
*   Procedure/Patient Notes
    

(Ticket 85167, confirmed TR.)

### Workaround for CV gap

If a program wants Quality Improvement Projects (or any non-CV-eligible type) to appear on the CV, the workaround is to **manually add a section to the CV** titled "Quality Improvement Project" and enter the relevant information into that section. The system does not have a way to flag arbitrary entry types for CV inclusion beyond the 8 listed above. (Confirmed JS 1/25/21.)

## Training Summary

The Resident Portfolio's **Training Summary** subtab is a quick view of the trainee's training history, scheduled rotations, conferences, and procedures across one or more academic years. It exports as PDF.

### How the Training Summary date logic works

A few important behaviors:

*   **The trainee's view defaults to their current program.** When the resident is logged in, the Training Summary defaults to their current program and current academic year. The hard-coded default cannot be overridden, even if the trainee has been at the institution since 2013 with multiple training history records. (Ticket 150534, confirmed Kishor Jain 10/13/2020.)
    
*   **For multi-year date ranges, the report shows all schedule splits with assignments only in their respective years.** If a trainee has been at the institution from 2018-2021 and you request a 7/1/2018-6/30/2021 date range, the system shows three schedule splits (PED 1, PED 2, PED 3) and within each split, the assignments display only in the academic year that split was active. Splits from other years appear as blank. **Recommended workflow: run the Training Summary one year at a time** for clean output. The PDF export generates nicely when one year at a time is used. (Ticket 150589, confirmed Kishor Jain 10/1/2020.)
    
*   **The Procedures tab on the Training Summary requires procedure requirements.** If the program has no procedure requirements set up, the Training Summary's Procedures tab will not display data even if residents are logging procedures. To populate: GME or Administrator must set up procedure requirements for the program (see **MedHub - Procedures**). (Ticket 198059, confirmed JS 6/1/22.)
    
*   **Conferences view discrepancy with Conference Requirements Summary.** The Training Summary's "total possible conferences" count differs from the Conference Requirements Summary report when **self-attendance** is enabled. Specifically: the Conferences Attended/Missed count counts exempt conferences AND conferences where at least 1 resident self-marked attendance. The other reports (Resident Portfolio Training Summary and Conference Requirements Summary) only count conferences where the **attendance sheet was fully submitted** (the "Save attendance" button was selected). Once the conference attendance sheets where the resident self-marked are saved, the denominator in the Training Summary and Conference Requirements Summary will match. (Ticket 119756, confirmed JS.)
    

## Goals & Objectives

The **Goals & Objectives** functionality in the Resident Learning Portfolio allows the trainee to define goals that are then reviewed by their Mentor. The trainee logs into MedHub, navigates to Portfolio → Goals & Objectives, and clicks **Add Goal/Objective** to create entries.

Behavior:

*   **Faculty Mentors can review and annotate** each goal.
    
*   **Goals & Objectives is its own subtab** within the Portfolio — it has its own UI separate from the entries list.
    

> **The Learning Plan / Learning Assessment functionality has been deprecated.** Earlier MedHub had a "Learning Assessment" feature; this was phased out and never replaced. The current alternatives are Goals & Objectives in the Learning Portfolio, a Semi-Annual Evaluation form, the Milestones Management Progress Reports functionality, custom subcompetencies, or custom portfolio entry types. (Ticket 171791, documented ELD 11/3/2022.)

## Evaluations on portfolio entries

A Resident can request an evaluation **of a specific portfolio entry**. The evaluation form must be designated with the type **"Learning Portfolio Evaluation"** (controlled by `evaltypeA` configuration).

The flow:

1.  Resident creates a portfolio entry.
    
2.  From inside the entry, the resident clicks **Request Evaluation**.
    
3.  The system displays a list of evaluation forms designated as Learning Portfolio Evaluations.
    
4.  The resident selects a form and a faculty member.
    
5.  The faculty member receives an email and Urgent Task with a link to the portfolio entry — the link works **even if the faculty member is not a mentor of the resident**, so they can review the entry directly.
    
6.  Faculty completes the evaluation. The completed evaluation is **linked within the portfolio entry itself**.
    

> **The resident does NOT receive an email or Urgent Task when the evaluation is completed.** Completed evaluations linked to portfolio entries appear in the entry but the trainee is not actively notified. This is a recurring enhancement request. (Confirmed BG.)

> **Trainees do not get any notification when a faculty mentor or advisor leaves a note, uploads a file, or completes an evaluation on one of their portfolio entries.** This is a known gap that programs sometimes work around by manually messaging the trainee. The Ideal Portal has standing requests for this functionality. (Confirmed BG.)

## Faculty Learning Portfolios — CME Tracking

The most-used feature in Faculty Learning Portfolios is **CME Tracking**. Used by institutions with `settings_cme` enabled (a non-default setting; relatively few institutions use it).

### Three ways to add CME credits

1.  **Faculty member adds individual records manually** — Portfolio → CME Tracking → **\+ Add CME or Activity Type**. The faculty member selects a credit/activity type and enters the relevant data.
    
2.  **Import from existing Portfolio entries** — Portfolio → CME Tracking → **Import Portfolio Entries**. The faculty member selects existing portfolio entries (publications, presentations, etc.) to import as CME credits.
    
3.  **Import from in-house Conferences attended** — Portfolio → CME Tracking → **Import In-House Conferences**. The faculty member (or Administrator) selects conferences they've attended and imports them as CME credits. **Faculty Conference Attendance must be enabled in Program Settings → Conferences** for this to populate.
    

A fourth path: the faculty member enables **Account → Preferences → Conference Option → "Automatically Populate CME Credits"** to auto-import conference attendance as CME.

### CME Credit Types and Activity Types

The list of CME activity types is configured per institution under **GME → List Management → CME Credit Types** (gated by `settings_cme`). Each CME activity type has:

*   **Name** (e.g., "AMA PRA Category 1," "Patient Care," "Self-Study")
    
*   **Parent Type** — one of 4 hardcoded headers controlled by root setting `cme_typeA`. The parent types are visible in the dropdown but cannot be selected directly — they are used to organize specific activity types beneath them.
    
*   **Minimum required for each faculty** (used for tracking compliance)
    
*   **Status** — Active or Inactive
    

> **Why an Administrator might see grayed-out options in the Credit & Activity Type dropdown.** When a Program Administrator opens Faculty Learning Portfolios → CME Tracking → +Add CME or Activity Type, the dropdown shows the 4 parent types but they are grayed out (cannot be selected). The cause: the institution has not yet defined specific CME activity types underneath the parent types. The fix: GME goes to List Management → CME Credit Types → +Add CME or Activity Type → enters a name → selects a parent type → saves. The new specific type is then selectable. (Ticket 168256, ES 2/1/2021.)

> **Adding new parent types** requires a root setting change to `cme_typeA`. Contact Support to request additional parent types.

### Faculty CME Credits Report

Located at **Reports → Conference Reports → Faculty CME Credits Report**. Filters by:

*   Program
    
*   Date range
    
*   CME activity types
    
*   Credit types
    
*   Default program only (or all programs)
    
*   Display options for subtotals by program
    

> **If the report is empty, the Faculty's conferences haven't been imported.** Common cause: faculty hasn't run Import In-House Conferences (or hasn't enabled the auto-populate setting). Fix: as Administrator, go to Learning Portfolios - Faculty → select the faculty → CME Tracking tab → Import In-House Conferences → checkmark conferences → Import. Run the report again. (Confirmed BG.)

## Portfolio Import Wizard

The **Portfolio Import Wizard** is the supported tool for importing multiple portfolio entries from an Excel spreadsheet into trainee and faculty portfolios. Available under **Home → Task Wizards → Portfolio Import Wizard** (gated by `setting_wizardA` index 12).

### How it works

1.  Open the wizard.
    
2.  Select the **portfolio entry type** to import. Due to the unique fields per entry type, **only one type may be imported per wizard run**. Multi-type imports require multiple wizard runs.
    
3.  Download the import template — pre-populated with the fields for the selected entry type.
    
4.  Populate the spreadsheet with one row per entry, including the trainee/faculty username/identifier.
    
5.  Upload the populated spreadsheet.
    
6.  Review the import summary; confirm errors as needed.
    

### Limitations

> **Cannot import entries for graduated residents.** The wizard does not display the names of graduated residents — only currently-training residents are available. To add a portfolio entry for a graduated resident, the entry must be added manually by an Administrative user (see "Adding entries for graduated residents" below). (Ticket 181548, Portfolio Import Wizard SKU, confirmed JS 8/18/21.)

### Adding entries for graduated residents (manual workaround)

When a resident has graduated and a portfolio entry needs to be added for them:

1.  The Administrator accesses the resident's Demographic profile.
    
2.  Hover over the **Residents** dropdown menu (which appears for the Administrator).
    
3.  Click **Learning Portfolio**.
    
4.  Select the entry type and create the entry manually.
    

The graduated resident **cannot** add the entry themselves — they lose access 30 days after the end date in their training history record (see **MedHub - Training History** for the access window).

If the new entry needs to appear on a report, the Administrator must remember:

*   The **Portfolio Entries Report**'s date range filter must encompass the date the entry was made (not the resident's training date range). Selecting "Complete Training" excludes entries made after training ended.
    
*   The **Export Portfolio** tool captures all entries regardless of when they were made, including post-training.
    

(Ticket 181548, confirmed JS 8/17/21.)

## PubMed import

The Resident Portfolio includes a **PubMed Import** tool for journal manuscript publications. The resident enters their last name and a date range, and the tool retrieves matching publications from PubMed.

### Known limitations

> **PubMed import only retrieves data for one faculty member at a time, even when multiple co-authors collaborated.** The tool's external API call uses last-name + date range as the filter; the API response includes all authors of matching publications, but the import process only attaches the publication to the user who ran the search. Co-authors at the same institution must each run the import separately to have the publication appear in their own portfolios.

> **Proposed improvement (not yet implemented).** Allow the user to enter the **PubMed ID directly** in the UI, which would retrieve precise data without relying on last-name matching. This is in AMBS-10156 but not committed to a release. (Ticket 229016.)

## Common scenarios

### "Resident's CV is missing some entries"

Most common cause: the entry type is not on the CV-eligible list (only 8 types appear on the CV — see "CV export" above). Workaround: manually add a section to the CV.

### "Portfolio Entries Report shows an entry but admin can't see it in the trainee's portfolio"

The resident has flagged the entry as "remove from Program Director, Mentor, and Admin views." Log in as the resident to confirm and ask them to remove the flag.

### "Scholarly Activity dates aren't matching what the resident reported"

The system uses Entry Date for APE/Scholarly Activity reporting, not the activity-specific date. Confirm the Entry Date and not the publication/presentation date is the source of truth. If a resident enters an activity from a prior academic year, the activity counts toward the academic year matching the Entry Date.

### "Resident enters '2003' as Year Published but the entry shows 12/31/1969"

The Year Published field requires a full mm/dd/yyyy date. Workaround: enter a valid date approximating the publication (e.g., 6/15/2003) — Product has not provided a timeline for accepting year-only entries.

### "Faculty CME Credits Report is empty"

Three things to check:

1.  Is `settings_cme` enabled at the institution level?
    
2.  Are CME Credit Types defined (List Management → CME Credit Types) with at least one active type per parent?
    
3.  Has the faculty imported their conference attendance into CME Tracking? (Use Import In-House Conferences as Administrator if needed.)
    

### "Faculty CME Activity Type dropdown is grayed out"

Specific CME activity types haven't been defined under the parent types. Add them via List Management → CME Credit Types → +Add CME or Activity Type.

### "Faculty CME items don't import on demand from conferences"

`settings_billing_didactics` may not be enabled, or Faculty Conference Attendance is disabled per program (Program Settings → Conferences). Verify both before troubleshooting further.

### "Resident has Portfolio access but can't see Goals & Objectives"

Goals & Objectives is a separate subtab in the trainee's Portfolio. If absent, it may be disabled per program. Most institutions have it enabled by default.

### "We need to import portfolio entries for graduated residents"

The Portfolio Import Wizard does NOT support graduated residents. Each entry must be added manually by an Administrator via Learning Portfolio - Residents → select graduated resident → add entry. Report dates must encompass the date the entry was added (not the original activity date).

### "Goals & Objectives — what does Learning Plan / Learning Assessment do?"

Learning Plan is a portfolio entry type. Learning Assessment is **deprecated and no replacement was built**. Use Goals & Objectives, semi-annual evaluations, Milestones Progress Reports, or custom portfolio entry types as alternatives. (Ticket 171791.)

### "Trainee published an article but isn't sure how to attach to portfolio"

Use PubMed Import in the Portfolio. Enter last name and a date range covering the publication date. Note the limitation around co-authors (see "PubMed import" above).

### "Resident says Faculty mentor doesn't seem to know they completed the evaluation"

Trainees do not receive notifications when faculty interact with their portfolio entries (notes, files, or completed evaluations). The trainee must check the entry directly to see the evaluation. This is a known gap.

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` The PubMed-by-PubMed-ID enhancement — AMBS-10156 has a proposed solution but I don't have evidence it shipped. Worth confirming current state.
    
*   `[VERIFY]` The 4-digit-year publication entry bug (AMBS-7962) — Product was examining; no timeline as of when SKU was last updated. Worth confirming if recent fix landed.
    
*   `[VERIFY]` Whether any institutions have actually deployed Learning Portfolio Evaluation as a delivery method recently. The SKU notes "I do not hear of many users utilizing that type of evaluation" (Ticket 199510, ELD 11/3/2022) — may be effectively dormant.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_cme`

Enables Continuing Medical Education (CME) features — Faculty CME Tracking, CME Credit Types list, CME activity import. Off by default; enabled on request for institutions that track CME.

`cme_typeA`

Hardcoded list of 4 CME parent types under which specific CME activity types are organized. Adding additional parent types requires a Support change to this setting.

`evaltypeA`

List of evaluation form types. Includes "Learning Portfolio Evaluation" — the type that enables resident-initiated evaluations of portfolio entries.

`setting_wizardA` (index 12)

Per-user-type access to the Portfolio Import Wizard.

`settings_students`

Indirectly affects student portfolio behavior (UME side has limited portfolio support; this doc is GME-focused).

`settings_billing_didactics`

Affects the in-house conference dropdown availability for CME import. See **MedHub - Conferences** Settings appendix.

Program-level settings (configured in Program Settings):

*   **Conferences → Faculty Conference Attendance** — Required for faculty to be able to import conferences into CME Tracking.
    
*   **Conferences → Self-Attendance** — Affects denominator counts in the Resident Training Summary's conferences view; see "Training Summary."
    

## Database tables appendix

Table

Purpose

`portfolio_entries`

Primary portfolio entry records. One row per entry, regardless of type.

`portfolio_entries_types`

Portfolio entry type definitions — name, scholarly activity flag, CV-eligible flag, custom-type flag.

`portfolio_entries_publications`

Publication-specific fields (journal, volume, page, PMID, etc.) joined to `portfolio_entries`.

`portfolio_entries_presentations`

Presentation-specific fields.

`portfolio_entries_research`

Research project fields.

`portfolio_entries_awards`

Award/Honor fields.

`portfolio_entries_quality`

Quality Improvement Project fields.

`portfolio_entries_files`

File attachments to portfolio entries.

`portfolio_entries_evaluations`

Evaluations linked to portfolio entries (Learning Portfolio Evaluation type).

`portfolio_entries_notes`

Notes attached to portfolio entries by mentors/admins.

`portfolio_entries_visibility`

Visibility flags ("remove from Program Director / Mentor / Admin views").

`portfolio_goals`

Resident Goals & Objectives entries (separate from main portfolio entries).

`portfolio_goals_responses`

Mentor responses to goals.

`users_faculty_cme`

Faculty CME credit records.

`users_faculty_cme_imports`

Faculty CME imports from conferences (audit trail).

`ref_cme_types`

CME activity types (List Management → CME Credit Types).

`ref_cme_parent_types`

CME parent types (from `cme_typeA`).

`users_residents_status`

Resident status (active/current/archived) — affects Portfolio Import Wizard's resident list.

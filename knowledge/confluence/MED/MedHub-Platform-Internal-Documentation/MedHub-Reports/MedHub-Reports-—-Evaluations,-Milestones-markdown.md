# MedHub - Reports — Evaluations, Milestones - markdown

# MedHub - Reports — Evaluations, Milestones

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

This document covers the **milestone-specific evaluation reports** — the reports that extrapolate evaluation response data into competency scores based on ACGME milestone frameworks. These are the reports a Program Director, CCC member, or GME Office user needs to answer questions like: "Where does this resident fall on each subcompetency?" or "How is the program progressing toward milestones as a whole?" or "What does the NAS data show for our residents across PGY levels?"

Milestone reports are fundamentally different from the aggregate evaluation reports: they interpret scale responses through the lens of a training-level hierarchy (subcompetencies, competencies, and milestone elements), not just as numeric averages. The underlying data is still evaluation responses, but it has been structured against the ACGME milestone framework imported for the program.

For oversight reports (counts, rates, delivery metadata), see **MedHub - Reports — Evaluations, Submissions & Delivery**. For aggregated scale score reports, see **MedHub - Reports — Evaluations, Aggregate**.

**Reports and surfaces in this category:**

*   Milestones Summary (Milestone Management view)
    
*   Milestone Summary by Level Report
    
*   Milestone NAS Summary Report
    
*   Milestones Progress Report
    
*   Evaluator Scoring Averages by Milestones (see also **MedHub - Reports — Evaluations, Aggregate**)
    

## Prerequisites — Milestone Management configuration

Milestone reports only generate data when the program's Milestone Management is configured correctly. Two settings gate whether data appears at all:

**1\. PGYs to Track for Milestones** (Milestone Management → Milestone Settings)

The range of PGY levels used in the program must be defined here. If this is not set (showing dashes), the Milestone Summary by Level report shows only a "PGY0" header and no actual data. (Confirmed ES, Ticket 180684.)

**2\. Track Milestone Elements** (Milestone Management → Milestone Settings → checkbox)

This must be enabled for element-level data to appear in milestone views and for integration with external systems like myTIPreport that push element-level responses. When disabled, the Milestone Elements tab does not appear and element-level data cannot be tracked. (Confirmed ES, Ticket 123951.)

## The milestone hierarchy

Understanding milestone reports requires knowing the hierarchy:

> **Competency** (e.g., Patient Care) → **Subcompetency** (e.g., PC-1) → **Milestone Element** (individual observable behaviors within PC-1)

Most standard milestone reports aggregate at the subcompetency level. Element-level tracking is configured separately and drives the Milestones Progress Report element view.

## \[GME\] Milestones Summary (Milestone Management view)

The **Milestone Summary** tab in Milestone Management is the primary per-resident, per-program view of milestone data. It shows average scores per subcompetency calculated from evaluation responses for the selected date range.

### Switching between views

The Display dropdown offers several options:

*   **Milestones Summary** — per-subcompetency average scores for the selected resident.
    
*   **Competency Summary** — overall average per core competency (PC, MK, ICS, etc.), displayed as a spider/radar chart. Hover over a data point to see the average for each core competency. This is the only view that shows overall core competency averages (not just subcompetency averages), useful for ACGME semi-annual reporting on core competencies. (Documented by ELD, Ticket 203300.)
    

### Default date range

The Milestone Summary page calculates data for the last 6 months by default. Both v1 and v2 subcompetency packages that were active within the last 6 months will show — this is expected during a transition year. Once a package's end date is more than 6 months in the past, it drops off this view. (Confirmed ES, Ticket 179912.)

* * *

## \[GME\] Milestone Summary by Level Report

The **Milestone Summary by Level** report shows subcompetency scores broken down by PGY level across the program — useful for seeing program-wide milestone progression by year of training.

### PGY0 only / no data

If the report shows only a "PGY0" column with no data, the "PGYs to Track for Milestones" setting has not been configured in Milestone Management → Milestone Settings. Set the PGY level range, then re-run. (Confirmed ES, Ticket 180684.)

### v1 and v2 subcompetency packages

The report includes all subcompetencies active during the report date range. When a program has transitioned from v1 to v2 milestone packages, both will appear if the report dates span the transition. Run the report scoped to dates after the v2 start date to see only v2 data. (Confirmed ES, Ticket 179912.)

* * *

## \[GME\] Milestone NAS Summary Report

The **Milestone NAS Summary Report** (NAS = Next Accreditation System) is the primary ACGME-facing milestones report. It shows the milestone level (e.g., Level 2.5, Level 3) for each subcompetency for each active resident, based on evaluation responses within the date range.

### Date range behavior

The date range filter refers to the **evaluation delivery date** — the report includes evaluations delivered within the specified date range that were also completed. (Confirmed HN.)

### Report shows all zeros or no element data

Two possible causes:

**1\. PGYs to Track not set.** As above — the PGY level range must be configured. (Confirmed BG.)

**2\. Milestone elements are set to "Achieved at Level."** When milestone element questions in the evaluation form have an "Achieved at Level" value set (e.g., Level 2), those elements contribute to the Milestones Progress Report (turning red or green based on the yes/no answer) but do NOT contribute to the NAS Summary report. The NAS Summary report expects a level value, not a binary yes/no. To make element data appear in the NAS Summary: go to Evaluations → Manage Evaluations → Evaluation Form → Question → Update Element → set "Achieved at Level" to **n/a**. (Confirmed JS, Ticket 141670; confirmed CD, Ticket 170867.)

### Graduate data

The NAS Summary report only shows **actively training residents**. For milestone data on graduates, use Export Evaluation Data → Milestones Data → click "Show all Residents." (Confirmed JS, Ticket 153037.)

### Removing old milestone version from the report

When a program has imported a v2 milestone package, old v1 subcompetencies stop appearing once the report dates are entirely after the v1 package end date. If both packages show in a report, adjust the date range to start after the v1 package was retired. (Confirmed ES, Ticket 179912.)

* * *

## \[GME\] Milestones Progress Report

The **Milestones Progress Report** is a per-resident view of milestone progress that includes both subcompetency-level scores and, when enabled, milestone element-level tracking.

### Element tracking — "Achieved at Level" behavior

When a milestone element question in the evaluation form has "Achieved at Level" set to a specific level (e.g., Level 2), the data from that question flows to the Progress Report as a color indicator (red = not achieved at the level, green = achieved at the level) rather than as a numeric score. These elements do NOT appear in the NAS Summary report. (Confirmed JS, Ticket 141670.)

### Access from Resident Dashboards

When the "Link from Progress Report" checkbox is enabled on a Resident Dashboard template, generated dashboards become accessible from within the Progress Report for the same time period. This does not pull Progress Report content into the dashboard — it provides a navigation link from the Progress Report to the PDF. (Ticket 211071, LS 12/15/2022. See **MedHub - Resident Dashboards** §"Progress Report linkage.")

### CCC access

CCC members access the Progress Report through the CCC link on their Faculty home page. Write access to the Progress Report is controlled by the "write-access" flag on the CCC member record. See **MedHub - Security & User Management** §"Clinical Competency Committee."

* * *

## \[GME\] Evaluator Scoring Averages by Milestones

This report is documented in **MedHub - Reports — Evaluations, Aggregate** §"Evaluator Scoring Averages by Milestones." Brief summary for cross-reference:

Shows each evaluator's scoring tendencies per PGY level for Milestone-scale questions. Because milestone scores are level-based (PGY2 expected around Level 2), the report breaks out by PGY level to separate trainee-cohort effects from evaluator-tendency effects. Available to GME and Administrators by default. (ES 12/17/2021.)

* * *

## How milestone versions affect all reports

When a program transitions from a v1 to v2 milestone package (or any version change), all milestone reports are affected by which package was active during the report dates:

*   **Report dates entirely within v1 active period** → only v1 subcompetencies.
    
*   **Report dates entirely within v2 active period** → only v2 subcompetencies.
    
*   **Report dates spanning the transition** → both v1 and v2 subcompetencies appear side by side. The Version column in most reports distinguishes them.
    

The active date range for each package is set in Milestone Management → the package's Start and End Dates. Configuring accurate start/end dates is the clean way to prevent old subcompetencies from appearing. (Confirmed ES, Ticket 179912.)

* * *

## Common scenarios

### "NAS Summary report shows all zeros"

Check two things in order: (1) Is "PGYs to Track for Milestones" configured in Milestone Settings? If not, set it. (2) Are the milestone element questions on the evaluation form set to "Achieved at Level"? If so, those questions feed the Progress Report but NOT the NAS Summary. Change "Achieved at Level" to n/a for elements you want in the NAS Summary. (Tickets 141670, 170867.)

### "Both v1 and v2 milestones are showing on the report"

The report date range spans both package active periods. Narrow the date range to start after the v1 package's end date to see only v2 data. (Ticket 179912.)

### "Milestone Summary by Level shows only PGY0"

"PGYs to Track for Milestones" in Milestone Management → Milestone Settings has not been configured. Set the PGY range and re-run. (Ticket 180684.)

### "Need to pull milestone data on a graduated resident"

Standard milestone reports are limited to actively training residents. Use Evaluations → Evaluation Functions → Export Evaluation Data → Milestones Data → click "Show all Residents." (Ticket 153037.)

### "Element data shows on the Progress Report but not the NAS Summary"

Elements configured with "Achieved at Level" set to a specific level flow to the Progress Report as binary (red/green) indicators, not numeric levels. The NAS Summary requires numeric level data. Fix: set "Achieved at Level" to n/a on the relevant element questions. (Tickets 141670, 170867.)

### "Milestones data isn't flowing correctly from myTIPreport into MedHub milestone reports"

See the discussion in the myTIPreport documentation (when drafted). Key prerequisite: "Track Milestone Elements" must be enabled in Milestone Management → Milestone Settings. The myTIP integration forms must have questions linked to both milestone elements AND their parent subcompetencies/competencies for the data to roll up correctly to subcompetency-level milestone reports. Element-only linking causes data to appear at the element level but not aggregate into subcompetency scores. (Tickets 127524, 123951.)

### "Can I see overall core competency averages (not subcompetency-level)?"

Yes — from Milestone Management → Milestone Summary tab → Display dropdown → select "Competency Summary." This shows a spider/radar chart with overall averages per core competency (PC, MK, ICS, etc.). Hover over each point to see the value. No equivalent appears in the standard reports. (Ticket 203300.)

### "The Milestone NAS Summary report date range — is it delivery date or completion date?"

The date range filter refers to the **evaluation delivery date**. (Confirmed HN.)

## Open questions for Emma

None — the Evaluation Reports FAQs SKU (page 47416150) covers the major milestone report edge cases, and the Evaluations (GME) SKU (page 141983840) covers the configuration prerequisites.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`.

Per-program settings in Milestone Management that drive report behavior:

*   **PGYs to Track for Milestones** — gates which PGY levels appear in milestone reports. Must be set for any milestone report to produce data by level.
    
*   **Track Milestone Elements** — enables element-level data tracking and the Milestone Elements tab. Required for element-level data to appear in the Progress Report.
    
*   **Milestone package Start/End Dates** — controls which package is active during which date range. Determines whether v1 or v2 (or both) appear in reports.
    

Root settings:

*   No dedicated root settings specifically for milestone reports. The milestone feature availability itself is gated by `setting_milestones` at the institution level.
    

## Database tables appendix

Table

Purpose

`eval_milestones`

Milestone score records — per-question, per-resident, per-evaluation. Source for all milestone reports.

`milestone_subcompetencies`

Subcompetency definitions per package.

`milestone_elements`

Milestone element definitions linked to subcompetencies.

`milestone_packages`

Package definitions including start/end dates for version management.

`milestone_settings`

Per-program Milestone Settings (PGYs to Track, Track Elements toggle).

`eval_answers`

Evaluation responses — joined with milestone element links to derive element-level data.

`users_residents_pg`

Training history — provides PGY level context for per-level milestone reporting.

`admin_ccc_members`

CCC member records — drives CCC access to the Progress Report.

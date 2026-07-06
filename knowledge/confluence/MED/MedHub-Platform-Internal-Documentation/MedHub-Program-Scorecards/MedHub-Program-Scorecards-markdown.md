# MedHub - Program Scorecards - markdown

# MedHub - Program Scorecards

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The **Program Scorecard** is a per-program, per-academic-year dashboard of program-level quality metrics — work hour compliance, evaluation completion rates, CCC and PEC meeting counts, ACGME approved positions, accreditation status, citations from the last site visit, corrective actions, and any custom metrics the institution wants to track. It's used by GME Office and Program Administrators to monitor program health and to support GMEC review and accreditation preparation.

This is GME-only, configured at the institution level under List Management. Some institutions term-translate the feature in their UI to **"Quality Measures"** instead of "Program Scorecards" — both refer to the same underlying functionality.

This document covers: what metrics the scorecard captures (auto-calculated vs. manual-entry), how to configure metrics for an institution, how to grant programs the ability to enter their own data, the Recalculate function, and the operational quirks that come up.

It does not cover: ACGME accreditation reports themselves (see **MedHub - Accreditation** when drafted); the underlying evaluation data model (see **MedHub - Evaluations — GME**); work hours reports (see **MedHub - Work Hours Analytics Report**).

> **Program Scorecards are NOT Accreditation-related.** Although they include metrics like ACGME citations and accreditation status, the Scorecard is a separate quality-tracking surface from the Accreditation page (which handles AIR, APE, ADS, etc.). Don't conflate the two.

## Where it lives

For Program Administrators:

> **Administrator → Site Management → Program Scorecards** (or "Quality Measures" if term-translated)

For GME Office:

> **GME Office → List Management → Program Scorecards** — institution-wide configuration of metrics, access settings, and recalculation.

The Program Administrator surface lets the program view its own scorecard for any selected academic year and enter manual values for metrics where they have write access. The GME Office surface lets institutional admins configure the metrics catalog, set per-program access, and recalculate auto-derived metrics.

## Metrics — what's on the scorecard

A scorecard contains two types of metrics:

*   **Auto-generated metrics** — populated by MedHub from underlying data (work hours, evaluations, schedules, demographics, ACGME imports, accreditation records). These are read-only on the program-facing scorecard.
    
*   **Manual-entry metrics** — fields where the program (or GME) types in a value. The institution decides which metrics fall in this bucket.
    

Auto-generated metrics have a **"?" icon next to them** on the configuration page indicating they're system-derived. (BG, AMBS-6650.)

### Built-in auto-generated metrics

The standard auto-derived metrics on a default Scorecard configuration:

*   **ACGME Approved Number of Positions** — pulled from the program's allocated resident slots in the Program List.
    
*   **Accreditation Status** — status of the most recent Site Visit.
    
*   **Cycle Length** — accreditation cycle length from the most recent completed Site Visit.
    
*   **Program Length** — program length defined for the default Resident Type in the program (Program List).
    
*   **ACGME Citations (last Site Visit)** — total number of citations recorded in the most recent Site Visit.
    
    *   **Counts ALL citations regardless of status.** A program that has cleared its citations will still see them counted in this metric — this is a tally, not a status indicator. (Ticket 131016, JJ confirmation.)
        
*   **Corrective Actions** — total number of disciplinary records on trainees active on the midpoint of the academic year.
    
*   **Work Hours Compliant vs. Violations (%)** — calculated from timesheets in the selected academic year.
    
*   **Work Hours On-Time Percentage (%)** — same scope as above. (Ticket 227901, AMBS-10039.)
    
*   **Number of CCC Meetings** — pulled from CCC Meetings tab.
    
*   **Number of PEC Meetings** — pulled from PEC Meetings tab.
    

> **Compliance metrics are scoped to the SELECTED academic year — even when that year is not yet complete.** Selecting the current AY shows compliance/timeliness data for timesheets in the current year so far. Selecting a past AY shows that year's totals. This is by design but can confuse users who expect "current AY" to mean "year-to-date with prior-year baseline."

### Customizing the metrics catalog

> **GME → List Management → Program Scorecards** lets the institution add custom metrics or modify which metrics appear. Metrics can be customized including the score, and custom measures can be added. Programs may customize their score on per-metric thresholds. (Confirmed BG.)

> **Metrics cannot be reordered.** Per Jordan via BG (AMBS-6827), metrics auto-sort by their internal ID number. There's no UI option to drag or otherwise reorder them. (Ticket 171976.)

### Per-program access — locked vs. write

Each metric on a scorecard has an **Access setting per program**: by default, programs see the metric as Read-Only Auto. To allow a program to enter their own values for a manual-entry metric, GME has to unlock it.

> **GME → List Management → Program Scorecards → Access column → change "Read-Only Auto" to "GME/Admin Write"** for the metrics where the program should enter data. (Confirmed BG, source SKU.)

If a metric is set up as a write-only/manual field but the program isn't seeing the expected data, check the Access setting first — frequently the issue is that the metric was configured as manual but the program never had write access granted. (Ticket 161547, CD.)

## Recalculate — refreshing auto-generated values

When source data changes (a CCC meeting was added, citations were resolved, work hour timesheets were unlocked and resubmitted), the scorecard's auto-generated values don't update in real time. The **Recalculate** action triggers a refresh.

Two recalculate scopes:

*   **Program-level Recalculate** — on the **Program Summary tab**, recalculates one program's scorecard.
    
*   **Institution-level Recalculate** — on the **Institution Summary tab**, recalculates all programs at once. **May take up to 10 minutes.**
    

> When a metric appears stale despite a source change (e.g., the program added their May and June CCC meetings but the scorecard still shows the old count), click **Recalculate** at the bottom of the page. (Tickets 219299/219257, ELD 5/25/2023.)

## Resetting a scorecard for a year

If the scorecard's metrics for a year need to be reset (e.g., a major data correction was made and the institution wants to re-derive everything), use the same **Recalculate** action. There's no separate "reset" — recalculate fully refreshes auto-generated values from source data.

For manually-entered values, those persist through Recalculate (Recalculate only refreshes auto-generated values).

## Common scenarios

### "Citations metric still shows the old count even though we cleared them"

By design. The ACGME Citations metric is a tally of citations recorded in the most recent Site Visit, regardless of citation status. Clearing or resolving citations does not reduce the count on the scorecard. (Ticket 131016, JJ.)

If the institution wants a "current open citations" metric, that would be a custom manual-entry metric they'd add and update themselves — there's no built-in tracking of citation status on the Scorecard.

### "We added new CCC meetings but the scorecard count isn't updating"

Click **Recalculate** at the bottom of the Program Summary tab. The auto-generated count refreshes from the underlying CCC Meetings tab data. (Tickets 219299/219257.)

### "A manual-entry metric isn't taking the program's data input"

Check the Access setting for that metric. GME → List Management → Program Scorecards → look for the metric → Access column should show "GME/Admin Write" for the program to enter data. If it shows "Read-Only Auto," change it. (Ticket 161547.)

### "Can we reorder the metrics on the scorecard?"

No. Metrics auto-sort by internal ID. No UI option exists. (Ticket 171976, AMBS-6827.)

### "Where do auto-generated metrics pull their data from?"

GME → List Management → Program Scorecards → metrics with a "?" icon are auto-generated. Clicking the "?" displays the data source. The standard set:

*   ACGME Approved Number of Positions → Program List
    
*   Accreditation Status → most recent Site Visit
    
*   Cycle Length → most recent completed Site Visit
    
*   Program Length → default Resident Type in Program List
    
*   ACGME Citations (last Site Visit) → Site Visit citations table
    
*   Corrective Actions → disciplinary records, trainees active on AY midpoint
    

(BG, AMBS-6650.)

### "Are the work hours compliance metrics for the current year or the previous year?"

Whatever academic year is selected at the top of the scorecard. The selected AY scopes the calculation. Selecting the current year shows current-year-to-date figures. Selecting a past year shows that year's totals. (Ticket 227901, AMBS-10039.)

### "We want to call this Quality Measures instead of Program Scorecards"

Term translation is configurable per institution by MedHub Support — change the user-facing label without changing the underlying functionality. Done at root-side site configuration.

### "We need to differentiate per-trainee corrective actions vs. program-level"

The auto-generated Corrective Actions metric counts disciplinary records on trainees active on the AY midpoint. There's no built-in program-level corrective-action tracking. If the institution wants this, add a custom manual-entry metric.

### "Recalculate is taking forever"

Institution-level Recalculate can take up to 10 minutes — the system is iterating every program. If it's not completing in that window, escalate to data team.

## Settings appendix

Program Scorecards are configured through the GME Office UI rather than root settings. The metrics catalog, per-program access, and term translation (Program Scorecards vs. Quality Measures) are all configured client-side.

Per-metric configuration:

*   **Access** — Read-Only Auto vs. GME/Admin Write per program.
    
*   **Score type** — numeric, percentage, or custom thresholds depending on metric.
    
*   **Auto-generated source** — for system metrics, this defines where the value pulls from (immutable).
    

## Database tables appendix

Table

Purpose

`program_scorecards`

Per-program, per-academic-year scorecard records.

`program_scorecard_metrics`

Catalog of metrics defined for the institution.

`program_scorecard_values`

Per-program, per-metric, per-year values. Includes both auto-generated and manual-entry data.

`program_scorecard_access`

Per-program, per-metric Access setting (Read-Only Auto vs. GME/Admin Write).

`programs`

Source for ACGME Approved Number of Positions and Program Length.

`dh_timesheets`

Source for Work Hours Compliant and On-Time metrics.

`admin_ccc_members` (and CCC meetings table)

Source for Number of CCC Meetings.

`admin_pec_members` (and PEC meetings table)

Source for Number of PEC Meetings.

Site Visit / Accreditation tables

Source for Accreditation Status, Cycle Length, ACGME Citations.

Disciplinary record tables

Source for Corrective Actions metric.

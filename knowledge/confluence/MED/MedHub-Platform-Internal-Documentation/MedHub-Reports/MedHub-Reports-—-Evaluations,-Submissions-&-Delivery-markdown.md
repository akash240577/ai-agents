# MedHub - Reports — Evaluations, Submissions & Delivery - markdown

# MedHub - Reports — Evaluations, Submissions & Delivery

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

This document covers the **oversight-level evaluation reports** — the reports that tell you about the logistics of evaluation delivery and completion without surfacing individual response data. These are the reports a Program Administrator, GME Office user, or Course Coordinator uses to answer questions like: "Did all my faculty submit their evaluations this cycle?" or "What percentage of evaluations were completed on time?" or "Which evaluations were delivered and when?"

These reports do not show aggregated response data (scales, comments, scores) — they show counts, rates, and delivery metadata. For reports that surface response data, see **MedHub - Reports — Evaluations, Aggregate**. For milestone-specific scoring reports, see **MedHub - Reports — Evaluations, Milestones**.

**Reports in this category:**

*   Evaluation Completion Summary
    
*   Evaluation Completion by User
    
*   Evaluation Completion by Rotation
    
*   Evaluation Completion by Service
    
*   Evaluation Delivery History
    
*   RIS Completion Summary / SIS Completion History
    
*   Audit Trail Query (evaluation-relevant subtypes)
    

## \[GME/UME\] Evaluation Completion Summary

The **Evaluation Completion Summary** report gives a month-by-month view of evaluations delivered vs. completed for a program or course over a selected academic year.

### Column definitions

Column

Definition

**Sent**

Evaluations delivered (minus any subsequently deleted evaluations).

**Rec'd**

Evaluations completed ("received" back as completed).

**Perc**

Percentage completed: Rec'd ÷ Sent.

**On Time**

Evaluations completed within the Grace Period set in the report filters.

**Perc On Time**

On Time ÷ Sent.

(Confirmed JS and ES, Ticket 158134.)

### What evaluation types are included

Only evaluations delivered by the program are included. The following types factor in:

*   Resident evaluation of faculty member
    
*   Resident evaluation of other resident (peer)
    
*   Resident evaluation of a service/clinic
    
*   Resident evaluation of program/hospital
    
*   Faculty evaluation of a resident
    
*   Faculty evaluation of a service/clinic
    
*   Faculty evaluation of program/hospital
    
*   Faculty evaluation of other faculty (peer)
    

**Not included**: evaluations delivered to the program from a different program, evaluations of conference, evaluations of procedure, and any evaluation type not in the list above. (Confirmed ES, Ticket 158134.)

**Not included**: Tiered Contributor evaluations. Contributor forms do not appear in Evaluation Completion statistics reports. Tiered Leader evaluations DO calculate. (Confirmed TM.)

### Deleted evaluations

Deleted evaluations are removed completely — they do not appear in the Sent total as though they were never delivered. (Confirmed BG, Ticket 115911.)

**Exception**: if a Faculty evaluator selects "Insufficient contact to evaluate" to remove an evaluation, that evaluation is also not included in the Sent total. (Confirmed BG.)

### Cross-program and released-resident caveats

The report only includes evaluations delivered by the program. If one of your residents was released to another program and that program delivered evaluations on them, those evaluations do NOT appear in your Evaluation Completion Summary — they belong to the releasing program. (Ticket 158134.)

### Month attribution

If an evaluation is delivered in April but completed in August, it counts in April's row — the month of delivery, not the month of completion. (Confirmed JS, Ticket 135523.)

### UME — student level filter removed

The student level filter in the UME version of this report was removed because it did not actually affect the calculations — the report did not filter by student level even when the filter was shown. The filter was removed per AMBS-5979. (Ticket 161431.)

* * *

## \[GME/UME\] Evaluation Completion by User

The **Evaluation Completion by User** report shows evaluation completion stats per individual evaluator — how many evaluations were delivered to them, how many they completed, how many were late, and their completion percentage.

### Column definitions

Column

Definition

**Delivered**

Evaluations issued to the evaluator within the date range, plus any deleted by the evaluator within the date range (irrespective of the delivering program and original delivery date).

**Late**

Evaluations that were not completed by the due date (looks at the "Evaluations Due" Program Setting). Includes both complete and incomplete evaluations that were late. (Confirmed TM.)

**Incomplete**

Evaluations not completed by the evaluator. Expired evaluations count as Incomplete.

**Expired**

Evaluations issued to the evaluator that have since expired.

**Completed**

Evaluations the evaluator submitted.

**Percent Completed**

Completed ÷ Delivered. Expired evaluations reduce this percentage because they count as Incomplete. Example: 10 delivered, 2 completed, 3 expired = 5 incomplete = 20% complete.

**Avg Days**

Average days to complete evaluations in the date range.

**Deleted**

Evaluations deleted by the evaluator within the date range, regardless of which program originally delivered them.

(Confirmed JS, Tickets 167326 and 167490. Updated by LS 7/11/2024.)

### The "Deleted" column behavior and discrepancies

> **The Deleted column is not program-scoped** — it captures all evaluations deleted by that evaluator within the date range, even evaluations originally delivered by a different program. When the "Limit to evaluations sent by this program" filter IS selected, the Deleted column reflects only evaluations delivered and deleted by the current program. (Confirmed TM, Ticket 160678.)

This is the most common cause of "why does this evaluator show more delivered evaluations than I can find in View Completed Evaluations?" — the report is pulling deleted evaluations from other programs that are invisible in the current program's view. (Tickets 84370, 168496.)

### "Limit to evaluations sent by this program" filter

When unchecked (default), the report includes evaluations delivered to the evaluator by ANY program — including evaluations on residents released to the evaluator's program from elsewhere. When checked, only evaluations sent by the current program are included. (Confirmed TM.)

### Released-resident evaluations

When a program delivers evaluations on a resident released to them, those evaluations count in this report's delivery/completion numbers — but the completed evaluations are owned by the resident's home program and are NOT visible in View Completed Evaluations from the delivering program. This produces the "I see 6 delivered but only 3 in View Completed Evaluations" discrepancy. (Ticket 137333, Confirmed JS and ES.)

### "Apply total Deleted towards Percentage" filter

When enabled, deleted evaluations are counted as Incomplete and reduce the evaluator's completion percentage. When not applied, deleted evaluations are excluded as if never delivered. (Confirmed TM.) This filter only displays when the Evaluator Type is set to Residents, Faculty, or Residents and Faculty — not when a specific form type is selected. (Confirmed JS, Ticket 151641.)

### Outside Evaluators

Outside Evaluators are **not included** in this report. Plans to incorporate them exist (MEDM-5455 and MEDM-5456) but have not shipped as of documentation date. (Ticket 243635, documented by LS and MC 10/22/2024.)

### Tiered evaluations

Tiered Contributor evaluations do not appear in completion statistics. Leader evaluations do. (Confirmed TM.)

### Resident evaluation of student type

The Resident Evaluation of Student type is not available in this report. The report was designed prior to that evaluation type being implemented and would require a code change to include it. Product is aware. (Ticket 207424, Confirmed JW 10/18/2022.)

* * *

## \[GME/UME\] Evaluation Completion by Rotation

The **Evaluation Completion by Rotation** report shows evaluation completion by rotation period for trainees.

### "Other (peer/patient/staff)" column

This column captures Resident evaluations of another resident (peer) and Patient/Staff evaluation of another resident types. For a response to factor in, the evaluation must have been attached to a rotation period at delivery. Evaluations written in or left blank when manually delivered, or automated evals based on Activity Date, will NOT count toward this column. Patient/staff of faculty/program/hospital type cannot be attached to a rotation period, so it never factors in. (Confirmed ES, Ticket 158027.)

### Removed evaluations

When an evaluation is removed by an admin or evaluator, it no longer appears in this report. The Incomplete column represents evaluations still in the system and not yet completed. (Confirmed HN, Ticket 164518.)

### On-time definition

The "on-time" calculation uses the "Evaluations Due" setting in Program Settings → Evaluations subtab. (Confirmed ES, Ticket 174510.)

* * *

## \[GME/UME\] Evaluation Completion by Service

Same column structure as Evaluation Completion by Rotation, scoped to service rather than rotation period. The on-time calculation also uses the "Evaluations Due" Program Setting. (Confirmed ES, Ticket 174510.)

* * *

## \[GME/UME\] Evaluation Delivery History

The **Evaluation Delivery History** report shows a row for every evaluation delivered, including delivery date, completion date, form name, delivery method, and evaluator/evaluatee identifiers.

### "Manual" delivery method on automated evaluations

The report shows "Manual" as the delivery method for automatically delivered course evaluations. This is because MedHub has flags for certain delivery types (SIS, automated final evaluation) but no separate flag for automatically delivered course evaluations — "Manual" is the default label. The evaluations ARE being delivered automatically; the label just doesn't distinguish them. (Confirmed TR, Ticket 84455.)

### Tiered evaluations and completion dates

When the Delivery History report is run for tiered evaluations, contributor form completion dates do not appear — only the leader completion date shows. Contributor forms appear as complete (with dashes in the completed date column) once the leader completes the composite form. To see actual contributor completion dates, use View Completed Evaluations. (Confirmed JW, AMBS-672, Ticket 98670.)

* * *

## \[GME/UME\] RIS Completion Summary / SIS Completion History

**RIS (Resident Identifies Supervisors)** and **SIS (Student Identifies Supervisors)** have their own completion tracking reports distinct from the standard evaluation completion reports.

### SIS Completion History column definitions

Column

Definition

**SIS Delivered**

Requests to identify supervisors sent to a student for the selected course/SIS set/time frame.

**SIS Completed**

Completed identification requests. One identification can include multiple faculty depending on required/recommended number in the SIS setup.

**SIS Late**

Requests sent to the student that haven't been acted on within the time frame.

**Supervisors Identified**

Number of faculty identified across all completed identification requests.

(Confirmed HN, 10/11/2022.)

### RIS Completion Summary vs. Completion Statistics

The numbers in the RIS Completion Statistics page and the RIS Completion Summary report will not always match. The "Supervisors Identified" column in the Summary identifies how many supervisors the RIS request identified; the Statistics page is a separate calculation. Deleted evaluations or anonymously submitted evaluations appear in the Summary but not in the Completion Statistics page. (Confirmed CD, Ticket 123761.)

* * *

## \[GME/UME\] Audit Trail Query — evaluation-relevant types

The **Audit Trail Query** report under Reports captures administrative actions on evaluations as an audit log. Evaluation-relevant audit trail types:

*   **Evaluations - Removed (insufficient contact)** — captures when an evaluator removed an evaluation via the "Insufficient contact to evaluate" link OR via the trash can icon in the Mobile App. Results showing "API(5001) removed evaluation" indicate the trash can icon in the Mobile App was used. (5001 = MedHub's mobile app identifier. Documented by ELD 6/1/2023, Ticket 97309.)
    
*   **Evaluations - Automated Evaluation modified** — changes to the Title, Status, Delivery, and Expiration fields on the Update Automated Evaluations page.
    
*   **Evaluations - Automated Evaluation rule modified** — changes to the Delivery Rules within the Update Automated Evaluations page. (Confirmed JW, Ticket 214315.)
    

* * *

## Common scenarios

### "Faculty completion rate is lower than I expect — why?"

Check whether expired evaluations are inflating the Incomplete count (and thus reducing the percentage). Expired evaluations count as Incomplete in the Evaluation Completion by User report. Also check whether the "Apply total Deleted towards Percentage" filter is enabled — it further reduces the percentage when evaluators have deleted forms.

### "The Delivered count is higher than the evaluations I can find anywhere"

Almost always caused by deleted evaluations from other programs being counted. The Deleted column in Evaluation Completion by User captures all evaluations deleted by that evaluator across all programs within the date range, not just the ones from the current program. The report cannot link those deleted evaluations back to their original program. (Tickets 84370, 168496.)

### "Evaluation Completion Summary shows no Tiered Contributor completion data"

By design. Tiered Contributor evaluations are not included in completion statistics. Only Leader evaluations count. Contributors who never complete their part are not docked in these reports — the consequence is that the Leader doesn't get their input, not a compliance hit. (Confirmed TM.)

### "Delivery History shows 'Manual' for course evaluations that I set up automated rules for"

The label reflects the default delivery type flag — there's no separate flag for automated course evaluations in the delivery history. The evaluations are actually being delivered automatically. (Confirmed TR, Ticket 84455.)

### "Who removed this evaluation?"

Run the Audit Trail Query → Audit Type: "Evaluations - Removed (insufficient contact)." Results with "API(5001) removed evaluation" mean the evaluator used the Mobile App trash can. (Ticket 97309.)

### "Completion rates between Evaluation Completion Summary and Evaluation Delivery History don't match"

They measure different things. The Completion Summary is scoped to evaluations delivered by the program, excluding deleted and insufficient-contact-removed evaluations from the Sent total. The Delivery History shows every delivery event regardless.

### "Outside Evaluator isn't showing in Evaluation Completion by User"

Outside Evaluators are not currently included in this report. (Ticket 243635, MEDM-5455/5456 in flight.)

## Open questions for Emma

None — the source SKU (Evaluation Reports FAQs page 47416150) is comprehensive on this report category.

## Settings appendix

Most behavior in these reports is governed by per-program settings rather than root settings.

Per-program settings that drive report behavior:

*   **Evaluations Due** (Program Settings → Evaluations subtab) — drives "Late" and "On Time" columns across Evaluation Completion by User, by Rotation, and by Service.
    

Root settings:

*   No dedicated root settings for this report category. Report availability is gated by the user's access points (Reports - Evaluations access point).
    

## Database tables appendix

Table

Purpose

`eval_results`

Evaluation completion records. Source for all completion/delivery counts.

`eval_delivery`

Delivery log — one row per delivery event. Source for Evaluation Delivery History.

`eval_deleted`

Audit of deleted evaluations (evaluator-initiated and admin-initiated).

`audit_log`

Source for Audit Trail Query. Includes evaluation removal events.

`ris_requests` / `sis_requests`

RIS/SIS identification requests. Source for RIS/SIS completion reports.

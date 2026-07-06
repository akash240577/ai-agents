# MedHub - Reports — Evaluations, Aggregate - markdown

# MedHub - Reports — Evaluations, Aggregate

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

This document covers the **aggregated evaluation response reports** — the reports that surface scale scores, comments, and response distributions from completed evaluations, but at the aggregate level rather than as individual evaluation records. These are the reports a Program Administrator, GME Office user, or Course Coordinator uses to answer questions like: "How did this resident score across all faculty evaluations this year?" or "What did evaluators write in their comments?" or "Which faculty evaluators tend to score higher or lower?"

These reports contain response data but aggregated across evaluations — individual evaluators' responses are not displayed per-person unless the report is configured that way. For oversight reports (counts, rates, delivery metadata), see **MedHub - Reports — Evaluations, Submissions & Delivery**. For milestone-specific scoring reports, see **MedHub - Reports — Evaluations, Milestones**.

**Reports in this category:**

*   Aggregate Evaluation Report
    
*   Aggregate Comments Report
    
*   Evaluation Competencies Report
    
*   Resident/Faculty/Service Ranking Report
    
*   Evaluator Scoring Averages
    
*   Evaluator Scoring Averages by Milestones
    
*   Evaluation Summary by Type
    
*   Evaluation Questions Summary
    
*   Summary by Evaluator
    
*   Locked Questions Summary
    
*   Export Evaluation Data
    

## \[GME/UME\] Aggregate Evaluation Report

The **Aggregate Evaluation Report** is the primary report for reviewing aggregated scale scores and comments from completed evaluations. It is the most-used, most-asked-about evaluation report in MedHub.

### What it produces

Per the target and form selected, the report shows each evaluation question with the distribution of responses (count and percentage per option), optional averages, optional peer averages, and optional free-text comments.

### Total Average calculation

When the "Display total average (for scale-based questions)" filter is enabled, the Total Average normalizes all non-Milestone scale questions to a 10-point scale and averages them together.

Scale conversion examples (standard scales are converted to a 1–10 range):

Scale

Choice 1

Choice 2

Choice 3

Choice 4

Choice 5

**5-point**

1.0

3.3

5.5

7.8

10.0

**4-point**

1.0

4.0

7.0

10.0

—

**2-point**

1.0

10.0

—

—

—

N/A options (value = 0) are always excluded from averages. Milestone scales are excluded from the Total Average calculation — they require a separate calculation. Custom answer types (checkbox/pull-down) are also excluded. (Confirmed TM.)

> **"Display total average" shows 5 or 10 depending on scale uniformity.** When all questions in the form use the same scale AND you select "Display Straight Averages," the average is expressed in the native scale range (e.g., out of 5). When scales are mixed, MedHub normalizes to 10. (Confirmed TM.)

### Peer Average and Peer Standard Deviation

"Display peer averages for scale-based questions" shows:

*   **Peer Avg** — the average score received by all evaluatees of the same type during the report dates, on the same question.
    
*   **Peer Std** — the standard deviation of that peer average.
    

Peer averages are based only on non-milestone scales. They also reflect the report date range — running the same report for a different time period will produce a different Peer Avg. (Confirmed by Product/MC, AMBS-11596, Ticket 239230.)

> If Peer Avg and Peer Std show N/A for all questions, the evaluation form uses only Milestone scales — peer averages are not generated for Milestone-scale questions. (Confirmed BG.)

### Required comments

The "Display required comments" filter option captures comments added to questions when designated scale choice options are selected (i.e., alert/comment-required triggers). (Confirmed BG.)

### Scale descriptions behavior

Scale descriptions only display in the Aggregate Evaluation Report if they were added as "Option Descriptions" — not as "Header Descriptions." Header Descriptions appear on the form itself but are suppressed in the report. (Confirmed BG.)

### Percentages don't add to 100%

When response percentages don't total 100%, check whether the question was required. If it wasn't, some respondents may have skipped it — those non-answers reduce the denominator. (Confirmed BG.)

### Conference evaluation date window

The "of conference" target dropdown only goes back two years from today. If forms were delivered "of presenter," data can be pulled further back. (Confirmed BG.)

### Outside Evaluators in the target list

Outside Evaluators appear in the target list only if:

1.  They have active status OR were evaluated within the past year, AND
    
2.  At least one selected form (of the selected evaluation type) delivered by the program was completed about them.
    

(Confirmed TM.)

### Inactive child courses

When an inactive child course is the target, the report returns no results. To temporarily restore access, change the course to Active status. Design gap flagged with Product (AMBS-8468, Ticket 197199.)

### Tiered evaluations — Leaders only

Only Leader evaluations can be included in the Aggregate Evaluation Report. Contributor evaluations are not included. To see individual Contributor evaluations, use View Completed Evaluations with the "Tiered - Include Contributor Evaluations" filter. (Confirmed LS, Ticket 243733.)

### Released-resident evaluations

To run the Aggregate Evaluation Report on a resident who received evaluations from a host program (during a release), the host program must share the evaluation form with the home program (giving Read-Only access). Once shared, the home program can select the form in the Aggregate Evaluation Report. (Confirmed BG.)

### Cross-program faculty evaluation reporting

The Aggregate Evaluation Report does not combine data from different forms. A program needs access to each form used to evaluate a faculty member (i.e., the form must list the running program in its Programs list, or be shared publicly). Each form must be reported separately. (Documented by LS, Ticket 205978.)

### Excel export — comments bunched in one cell

When exporting to Excel, individual comments within the report may appear bunched into a single cell. This is a known design limitation tracked as AMBS-5066. (Ticket 149059.)

### Aggregate comments from duplicate eval answers

Rarely, a database error produces duplicate evaluation answers, causing percentages to exceed 100%. The "Clean up duplicate evaluation answers" task script (support-side) resolves this. Safe to run any time a user reports percentages exceeding maximum values. (Confirmed JJ, Ticket 137328.)

* * *

## \[GME/UME\] Aggregate Comments Report

The **Aggregate Comments Report** surfaces free-text comments from completed evaluations, grouped by question.

### October 2023 updates

**UME additions:**

*   The first step now offers multi-select across courses, departments, and sites (departments display only when `settings_schools_clerkship_display` is 1 or 2).
    
*   Student groups from selected courses appear in the target list — selecting a group includes all students in that group.
    
*   Report output is organized by the selected sort-by filter, then by course, with a new course column in results.
    
*   Students and Faculty listed in multiple selected courses appear multiple times in output.
    

**GME/UME addition:**

*   Faculty- or resident-type Outside Evaluators associated with selected programs/courses now appear in the target list under an "outside user" header.
    

### Anonymous evaluations — UME limitation

Anonymous "Student of Course" evaluations cannot be reported in the Aggregate Comments Report because the target (student) is not available once anonymized. Workaround: run the Aggregate Evaluations Report to Excel and extract comments. (Confirmed ES, updated 11/24/2020.)

### Sharing requirement (UME)

Student Administrators can run this report for "Student of Course" evaluation comments only if the evaluation form is shared with the course. Once shared, Course Coordinators can also run it. (Confirmed ES, Ticket 139956.)

### Scale-based required comments

The Aggregate Comments Report does NOT pull in required comments triggered by a scale-based question. For required comments, use the Aggregate Evaluation Report with "Display required comments" enabled. (Confirmed TM.)

### Request-URI Too Long error

Running the Aggregate Comments Report across a very large number of courses at once produces a "Request-URI Too Long" server error. The report must be run for fewer courses at a time. Design limitation (AMBS-10844, Ticket 234584).

* * *

## \[GME/UME\] Evaluation Competencies Report

The **Evaluation Competencies Report** shows aggregated scores per core competency (Patient Care, Medical Knowledge, etc.) for an evaluatee, based on evaluation questions tagged to those competencies.

### What it includes

Questions tagged to competencies AND using non-Milestone scales. It does not use Milestone scale questions, and it does not use questions tagged only to subcompetencies or elements (without a competency tag). (Confirmed BG.)

### Program Administrator vs. Mentor view discrepancy

The Evaluation Competencies Report (Administrator view) queries only "Resident Peer" and "Faculty of Resident" evaluation types. The Mentor view additionally includes "Patient/Staff of Resident" — so the numbers appear different. (Confirmed TM, Ticket 96475.)

### UME competency score interpretation

When MedHub normalizes different scale types for the Evaluation Competency Report, it converts all responses to a 1–10 scale using the same normalization as the Aggregate Evaluation Report Total Average. (Confirmed ES, Ticket 171424.)

* * *

## \[GME/UME\] Resident/Faculty/Service Ranking Report

The **Resident/Faculty/Service Ranking Report** ranks evaluatees by their average evaluation scores, with optional Z-Score adjustment for evaluator scoring tendencies.

### What questions feed the Overall column

Only **non-Milestone, non-"excluded from total averages"** scale questions feed the Overall average and the competency columns. By default, Milestone scales are set to "exclude from total averages." Standard scales are included by default. The "excluded" attribute is what determines inclusion — not the word "milestones" in the scale name. (Confirmed ES, Ticket 180310.)

The Evaluations column shows the total number of evaluations issued on the selected forms during the report period — even forms with only Milestone questions count toward the total number.

### Z-Score and Z-Score Rank

*   **Z-Score** — how many standard deviations the evaluatee's average is from the mean, adjusted for evaluator scoring tendencies. Positive = scored above average given evaluator tendencies; negative = below average.
    
*   **Z-Score Rank** — where the evaluatee falls relative to peers.
    

Z-Scores are calculated per evaluator (based on their historical scoring average and standard deviation), then averaged for the evaluatee. Conditions:

*   Only non-excluded, scale-based questions
    
*   Only evaluations of types: Resident peer, Resident of faculty, Faculty of resident, Patient/staff of resident, Patient/staff of faculty
    
*   Only responses completed within the past year, limited to the last 100 per evaluator
    
*   No minimum response count required
    

(Confirmed TM.)

### Report looks at Issue Date, not Completion Date

The Resident/Faculty/Service Ranking Report uses the **Issue Date** for evaluations, not the completion date. (Confirmed JS, Ticket 138246.)

### Anonymous evaluations included

Since 2020, this report includes evaluations delivered anonymously. Product/aging ticket committee confirmed this is valid. (Confirmed TM, AMBS-5448.)

### Outside Evaluators not included

Outside Evaluators do not appear in this report by design. Outside Faculty who appeared in the past were doing so because they had Faculty accounts in addition to Outside Evaluator accounts. For Outside Evaluator data use the Aggregate Evaluation Report or Export Evaluation Data instead. (Documented by ELD, AMBS-8221, Ticket 192826.)

### Competency column vs. Aggregate Evaluation Report discrepancy

If the same competency is tagged on more than one question, or on questions from multiple forms, the Ranking report and the Aggregate Evaluation Report will show different averages for that competency. (Confirmed JS, Ticket 168025.)

* * *

## \[GME\] Evaluator Scoring Averages

Shows an evaluator's scoring tendencies (how strict or lenient they score) based on non-Milestone scale questions. Output: evaluator, scales selected, number of questions completed on those scales, average score given, range.

Milestone scales are intentionally excluded — an evaluator who works with lower PGY trainees would naturally score lower on milestone-based questions, which would reflect the trainee cohort rather than the evaluator's scoring tendencies. (Confirmed TM/ES, Ticket 180684.)

Available to Administrators only by default. (ES 12/17/2021.)

* * *

## \[GME\] Evaluator Scoring Averages by Milestones

Same intent as Evaluator Scoring Averages but specifically for Milestone-scale questions. Results are broken down by PGY level — since milestone scores are level-based (PGY2 expected around Level 2, PGY4 expected around Level 4), averaging across levels without this breakdown would reflect the evaluator's trainee cohort, not their scoring tendencies.

Output: all evaluators in the program of the selected user type, their user type, question count and scoring average per PGY level.

Available to GME and Administrators by default. (ES 12/17/2021.)

* * *

## \[GME/UME\] Evaluation Summary by Type

Shows aggregated response distributions by evaluation type. Only includes data from **non-Milestone questions**. If the report shows all zeros for Residents, confirm whether the evaluations completed on those Residents include non-Milestone scale questions. (Confirmed BG.)

* * *

## \[GME/UME\] Evaluation Questions Summary

Shows the text of evaluation question answers for comment-type questions. The "Answers" column pulls from questions tagged to **comment answer types only** — it does not pull in required comments from scale-based questions or comments triggered by a scale answer. (Confirmed AMBS-7689, Ticket 184977.)

* * *

## \[UME\] Summary by Evaluator

Shows individual evaluator responses per question. The report displays the internal **scale value** (a whole number) rather than the milestone level visible to the evaluator (which can include half-points). This is a known design limitation — the underlying scale value field cannot store half-points. The Aggregate Evaluation Report is the preferred tool for viewing milestone scores accurately. Product is considering a value vs. milestone-value filter option for future development. (Confirmed AMBS-9475, Ticket 182195.)

* * *

## \[GME\] Locked Questions Summary

The **Locked Questions Summary** report returns data from questions that were locked into evaluation forms from a specific program. When the same locked questions exist across multiple programs, the data returned is scoped to the program from which the evaluations were delivered (not the faculty's home program). (Confirmed JS, Ticket 138917.)

* * *

## \[GME/UME\] Export Evaluation Data

The **Export Evaluation Data** tool is a raw data export from the evaluations database, available under Evaluations → Evaluation Functions. Not technically a "report" but the canonical tool for pulling granular evaluation data including:

*   Milestones data for graduated residents (who no longer appear in standard milestone reports) — click "Show all Residents" to include them. (Confirmed JS, Ticket 153037.)
    
*   Full response-level data for custom analysis.
    

### Excel date conversion issue

When evaluation questions ask for numeric ranges like "1-9" or "10-19," Excel interprets these as dates (Jan-9, Oct-19). Fix: format the cells as Custom → "m-d" type in Excel, or update the evaluation form to avoid ambiguous numeric strings. (AMBS-8538, Ticket 198253.)

* * *

## Common scenarios

### "Aggregate Evaluation Report percentages exceed 100%"

Duplicate evaluation answers in the database. Run the "Clean up duplicate evaluation answers" task script (support-side). Safe to run any time. (Ticket 137328, AMBS-5066-adjacent.)

### "Peer Avg shows N/A on every question"

All questions on the form use Milestone scales. Peer averages are only generated for non-Milestone scales. (Confirmed BG.)

### "Total average shows 5, not 10"

All questions use the same scale and "Display Straight Averages" is enabled. With a 5-point-only form, the average is expressed out of 5. With mixed scales, it normalizes to 10.

### "Outside Evaluator isn't appearing in the Aggregate report target list"

Check: (1) Is the Outside Evaluator account active or evaluated within the past year? (2) Was at least one evaluation of the selected form and type completed about them by the current program? Both conditions must be true. (Confirmed TM.)

### "Can I see how a faculty member was evaluated across all programs they're in?"

The program that owns the individual owns the data about them. For faculty, View Completed Evaluations in the faculty's primary program shows all evaluations. For the Aggregate Report, each form must be reported separately, and the form must be shared with the reporting program. There is no cross-program aggregate view. (Documented LS, Ticket 205978.)

### "Resident/Faculty/Service Ranking doesn't include our Outside Faculty"

By design. Outside Evaluators are excluded. Use Aggregate Evaluation Report or Export Evaluation Data for Outside Faculty data. (AMBS-8221, Ticket 192826.)

### "Comments export to Excel are all in one cell"

Known design limitation (AMBS-5066). No fix available currently. Run the report as HTML or extract manually.

### "Evaluation Competency scores differ between Admin view and Mentor view"

Admin queries Resident Peer and Faculty of Resident types only. Mentor view adds Patient/Staff of Resident. (Confirmed TM, Ticket 96475.)

### "Graduate's evaluation data isn't showing in reports"

Standard milestone and ranking reports only show active trainees. Use Export Evaluation Data → Milestones Data → click "Show all Residents" to include graduates. (Confirmed JS, Ticket 153037.)

## Open questions for Emma

None — the Evaluation Reports FAQs SKU (page 47416150) is comprehensive on this report category.

## Settings appendix

Per-program settings that drive report behavior:

*   **Resident Access to Aggregate View** — controls whether trainees can see their own aggregate evaluation data. Does not affect Administrator or GME access to this report.
    
*   **Resident Access to Patient/Staff/Peer Evaluations** — threshold before trainees can see peer/patient/staff evaluations in aggregate view. Does not restrict the Aggregate Evaluation Report for Administrators.
    

Root settings that may affect specific behaviors:

*   `settings_schools_clerkship_display` — when set to 1 or 2, enables the Department option in the Aggregate Comments Report UME multi-select (October 2023 update).
    

## Database tables appendix

Table

Purpose

`eval_results`

Evaluation completion records including scale responses. Source for all aggregate reports.

`eval_answers`

Per-question response records. Source for Aggregate Evaluation Report question distributions.

`eval_comments`

Free-text comment records. Source for Aggregate Comments Report and required comments display.

`eval_competencies`

Competency tags on evaluation questions. Source for Evaluation Competencies Report and Ranking report competency columns.

`eval_milestones`

Milestone score records. Separate from standard scale responses — used by milestone-specific reports.

`eval_forms`

Form definitions including sharing flags and program access list.

`users_residents` / `users_faculty` / `users_students`

Evaluatee profile data for target selection.

`outside_evaluators`

Outside Evaluator records. Currently excluded from Evaluation Completion by User and Ranking reports.

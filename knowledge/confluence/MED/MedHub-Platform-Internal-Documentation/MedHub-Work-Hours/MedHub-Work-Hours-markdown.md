# MedHub - Work Hours - markdown

# MedHub - Work Hours

> **Purpose.** Captures the current state of work hours functionality in the MedHub platform: what trainees, administrators, program directors, and GME/UME offices can do today, how the system behaves, and where settings and behavior live.
> 
> **Audience.** Internal MedHub Support, Product, Engineering, and CS team members. Technical detail is concentrated in clearly marked subsections so non-technical readers can skip past.
> 
> **Scope.** Timesheet submission, work hour types and recorded activities, work hour rules and how they're calculated, configuration surfaces, alerts and notifications, lockout, work hour review periods, and the underlying technical structure.
> 
> **Out of scope.** The Work Hours Analytics report — that lives on a dedicated child page (**MedHub - Work Hours Analytics report - markdown**). The Work Hour Compliance Report, Work Hours Submission Report, Work Hours Institutional Summary Report, GME Work Hours Quarterly Comparison Report, and other classic reports are referenced where relevant to rule applicability but not documented in full here; their full feature sets belong in the Reports children pages.

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export and Emma's consolidated work hours documentation. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

> **Year-of-changes note.** Work Hours is a major focus area for product and engineering. Several behaviors documented here are actively being changed: configurable start of week (MED-565), Maximum Work Period Length violation calculation (MED-859), persisted Review Period statuses (MEDM-10643, MEDM-10817), Pending Status recalculation triggers (MEDM-10662), and the broader Work Hours submissions workflow refresh (MED-809). This document is the **current-state baseline**; sections that are most likely to change are marked.

## 1\. Two product contexts: GME and UME

MedHub serves two distinct training contexts, and work hours behaves slightly differently in each:

*   **GME (Graduate Medical Education)** — residents and fellows. The more mature, more configurable, more heavily used side of the work hours feature. Configuration surfaces include institutional settings, a program list (where the GME office configures program-level settings on each program's behalf), and program settings (controlled by individual programs).
    
*   **UME (Undergraduate Medical Education)** — medical students. Less robust than GME. School Settings is where work hours configuration lives; course settings are not in play for work hours. The student-facing functionality is a subset of the resident-facing functionality, and several conveniences (e.g., late submission emails) behave differently.
    

Where behavior differs between GME and UME, this document calls it out explicitly.

## 2\. Tenancy and architecture

**MedHub is single-tenant.** Each client has its own dedicated database and its own URL (e.g., `clientname.medhub.com`). This has direct consequences for how work hours configuration behaves:

*   Most settings can be configured per client. Some are set by client admins through the UI; many are set on the support side (the "root side") via root settings.
    
*   Per-client configurability means default values described in this doc are _defaults applied to clients who haven't been configured otherwise_ — they are not hard-coded platform values.
    

**Analytics is multi-tenant in Snowflake.** A separate Analytics team runs on a shared Snowflake instance combining data from all clients. Analytics is out of scope for this document; see the Work Hours Analytics report child page.

## 3\. Work hour types

Trainees can record several kinds of activity on a timesheet. Some are entered directly by the trainee; others pull in from the schedule as "Recorded Activities."

### 3.1 Types directly entered onto the timesheet

*   **Standard Work Hours** — on-site work: shifts at the hospital, clinic hours, in-house conference attendance, and similar.
    
*   **Home Call (called in)** — on-site hours when a trainee was called in during a home call.
    
*   **Clinical Work from Home** — paperwork, data entry, case work planning, and other patient-related work done from home. Renamed from "Work from Home" as part of the 2017 ACGME CPR rollout.
    
*   **Moonlighting** — moonlighting hours. Visible only when moonlighting is enabled and the request is approved/documented in the trainee's training history.
    

### 3.2 Items that pull in from the schedule as Recorded Activities

*   **On-site Shift (Recorded Activity)** — an on-site shift scheduled by the program. If the trainee worked the shift, they should enter Standard Work Hours for the time.
    
*   **Home Call (Recorded Activity)** — on-call time done from home unless called in. If the trainee was not called in, they should not log work hours for the period. If they were called in, they should log Home Call (called in) hours.
    
*   **Clinics (Recorded Activity)** — continuity clinic scheduled by the program. If the trainee attended, they should enter Standard Work Hours for the time.
    
*   **Absences (Recorded Activity)** — vacation, leave of absence, sick, conference (away), etc. appear as Recorded Activities on the days they cover.
    

### 3.3 Type-specific behaviors and quirks

*   **"Conference (away)" absences** are recorded but do not block the trainee from logging work hours for the day. The trainee is expected and able to log hours during a Conference (away) absence.
    
*   **Clinical Work from Home counts toward the 80-hour limit only.** Per ACGME CPR Section VI.F.8.a., time spent on patient care activities by residents on at-home call must count toward the 80-hour maximum but does not contribute to 24+4, 8-hour break, or 14-after-24 calculations. A day with only Clinical Work from Home logged still counts as a day off.
    
*   **Daylight saving time** is not specially handled. A continuous span across the spring transition gains an hour as a side effect of the wall clock. Example: 7 AM Saturday to 11 AM Sunday is normally 28 hours; on the spring DST weekend it is counted as 29 hours and may trigger a 24+4 violation. This is **working as designed** (Tickets 145699, 230810, AMBS-10321).
    
*   **Conference attendance can be pre-populated** as Standard Hours when Program Settings → Work Hours → "Pre-populate Conference Attendance" is enabled.
    
*   **Standard Service Hours** (defined in Service/Shift Management on a service definition) auto-populate Recorded Activities on the timesheet for trainees on that service. **They do not factor into the days-off calculation**, even though they appear in the same dropdown — an inconsistency surfaced in Ticket 231921.
    
*   **Home Call is never pre-populated.** Hours are not logged for time on call at home. Only Home Call (called in) hours are logged.
    

### 3.4 Technical detail

*   Daily timesheet entries are stored in `sh_timesheets`.
    
*   The "Home Call (called in)" entry type is enabled or disabled platform-wide for an institution by the root setting `settings_dh_ns_homecall`.
    
*   Moonlighting visibility on the timesheet is gated by per-trainee training-history records.
    

## 4\. Timesheet submission

### 4.1 Workflow

The current submission workflow is week-based (Sunday–Saturday, hardcoded — see §11). A trainee can log hours throughout the week. Two actions:

*   **Save Incomplete Work Hours** — saves entries without submitting. The timesheet status displays as "Incomplete (saved by \[user\])."
    
*   **Submit Work Hours** — finalizes the timesheet. The status displays as "Last Modified by \[user\] on \[date\] at \[time\]."
    

When submitting hours that contain potential violations, the trainee is prompted by a popup to provide a reason and comment for each potential violation (see §6).

### 4.2 Mobile and ResQ behavior

*   **Mobile app** — when entering hours on mobile, hours save automatically as the trainee works. The status shows "work hours have not been submitted" until the trainee taps Submit. Once submitted, the timesheet displays "Last Modified by..." consistent with desktop submission.
    
*   **ResQ integration** — ResQ Medical (a third-party shift logging tool) syncs hours into MedHub timesheets one-way. Hours arrive on the timesheet automatically; the trainee must still log into MedHub and submit the timesheet. (Ticket 163754.)
    
*   **Pre-populated hours and ResQ** — when both are in use, ResQ-submitted hours overwrite pre-populated hours. (Ticket 162715.)
    
*   **ResQ enablement** — verify under GME → Institution Settings → API Access that the ResQ Medical entry is present. ResQ is added to all clients by default. There is a UME version (ResQ UME) as well.
    

### 4.3 Pre-population

Programs can configure work hours to pre-populate from the schedule:

*   **On-site shift pre-population** — set on each shift definition under Service/Shift Management → Shifts/Calls → "Work Hours" → "Pre-populate Work Hours." Pre-populated hours appear on the timesheet ahead of time and the trainee reviews/submits.
    
*   **Conference attendance pre-population** — Program Settings → Work Hours → "Pre-populate Conference Attendance." When attendance is recorded for a conference, the timesheet is fed automatically.
    
*   **Continuity clinics pre-population** — Program Settings exposes a "Pre-populate Clinic Hours" setting; each clinic assignment also has its own pre-populate flag. Both must align for a trainee's clinic time to populate. Changes to the program-level setting do not retroactively change clinic assignments. (Ticket 183377.)
    
*   **Released residents** — pre-population works for released residents if the released-program service has Standard Service Hours set up and pre-population enabled. (Ticket 180451.)
    
*   **QGenda + pre-population gotcha** — when QGenda is the upstream source for clinics, pre-population is locked in at the time the clinic definition is created. Disabling pre-population in MedHub afterward does not retroactively disable it on QGenda-synced clinics; coordinators must remove pre-population in bulk via the Continuity Clinics view → select all → Remove Pre-Population → Submit. (Ticket 202851, AMBS-8730.)
    
*   **Pre-populated hours fire end-of-week.** A change made mid-week takes effect overnight Saturday–Sunday when the new week's timesheet is created.
    
*   **Overnight shifts overwrite Standard Service Hours; daytime shifts do not.** (Ticket 172610.)
    

### 4.4 Submission status display nuances

*   **Hours entered via desktop, not yet submitted** — "Incomplete (saved by \[user\])" appears below the compliance calendar.
    
*   **Hours entered via mobile, not yet submitted** — "work hours have not been submitted" appears below the compliance calendar.
    
*   **Hours submitted** — "Last Modified by \[user\] on \[date\] at \[time\]" appears below the compliance calendar. This corresponds to the latest "complete" entry in the root-side Audit Trail Query for "Duty Hours Submitted."
    

In both incomplete cases, the day-by-day hours and totals at the bottom display the entered values — the difference is just the submission state.

### 4.5 Late submission alerts (current behavior)

*   **Residents** receive an email on Mondays if (a) they have submitted a timesheet at least once in the past, and (b) they have not submitted last week's timesheet by 12:01 AM Monday Eastern Time.
    
*   **Students** receive late-submission emails on Mondays if they have not submitted by midnight Sunday Eastern Time. UME does NOT have the "must have submitted at least once" prerequisite — the Incomplete Work Hours Urgent Task fires for students regardless of whether they've ever submitted before. (Ticket 206818, AMBS-8953.) However, students do **not** receive Incomplete Work Hour notification emails — only urgent tasks. (Ticket 210749, AMBS-9209.)
    
*   **Coordinators** receive a configurable email listing trainees who have not yet submitted last week's timesheet. The day of the week is set via the root setting `setting_dh_admin_alert`.
    
*   **Specialty trainee types** (e.g., Visiting Residents, Chief Residents) can be excluded from work hours and therefore from these alerts via Site Navigation → List Management → Trainee Types and per-type "Work Hours" toggles. (Ticket 192996.)
    
*   **Non-reimbursable trainees** can be included or excluded from alerts via Institution Settings → Alerts → "Non-Reimbursable Residents."
    

### 4.6 Technical detail

*   The week boundary used in submission, alerts, and timesheet generation is **hardcoded as Sunday–Saturday throughout the codebase**. This is the central problem the configurable start of week initiative (MED-565) is solving — see §11.
    
*   Pre-population, auto-submit of full-absence weeks, and similar week-boundary-dependent jobs run from a single nightly cron, `cron_global_timesheets_auto`, scheduled `01 23 * * 6` (Saturday 23:01) — i.e., once per week, on Saturday night.
    
*   Late submission alerts run via `alert_timesheets_late()` and `alert_timesheets_late_admin()` in `includes/common_new/include_alerts.php`, with hardcoded "previous Sunday" check window logic.
    
*   The "Home Call (called in)" data flow is gated by `settings_dh_ns_homecall`.
    

## 5\. Work hour rules

MedHub evaluates the trainee's submitted hours against a set of rules. When a rule is violated, the timesheet flags it and (depending on settings) prompts the trainee for a reason.

There are two broad categories:

1.  **Rules the trainee and administrator are jointly responsible for** — driven by what the trainee logs. These include the 80-hour rule, days-off rule, 24+4 rule, and 8-hour break rule. These are flagged on the trainee's timesheet at submission time.
    
2.  **Rules the administrator alone is responsible for** — driven by the schedule, not by what the trainee logs. The 14-hour-break-after-24-hour-call rule is the primary example. The system flags these in the Scheduled Activities section based on the schedule, regardless of what hours the trainee enters.
    

### 5.1 Maximum 80 hours per week (averaged)

*   Trainees should not work more than 80 hours per week.
    
*   **Averaged** over a 28–31 day period (typically the work hour review period). A 100-hour week is compliant if the other weeks in the period bring the average to 80 or below.
    
*   **Calculation:** `Total hours worked for period / # of possible work days in period (excluding vacation and LOA) × 7 = average hours per week`.
    
*   **Hours included:** all timesheet-logged types — Standard Hours, Home Call (called in), Clinical Work from Home, and Moonlighting. Recorded Activity-only items do not contribute.
    
*   **Special consideration for non-submitted timesheets:** unsubmitted weeks reduce the denominator. If a trainee submits only one week of a four-week period, the average is calculated against just that one week's possible work days. This can produce surprising violations.
    
*   **Vacation and LOA exclusion:** vacation and LOA days are removed from both the numerator and denominator. ACGME requires this. The intent is that taking time off does not justify a heavier workload on the remaining days.
    
*   **Configurability:** programs can override the 80-hour threshold via the program list ("Work Hours Violations: (after 7/1/2017)" → "Use Program-Specific Rules"). Common variations include 88 hours.
    
*   **88-hour exemption tracked at the rotation level** — configured in GME → List Management → Work Hours Rotation Exceptions. When a trainee is on the exempted rotation, the threshold is raised. If they're on the exempted rotation only part of the week, the threshold is pro-rated (e.g., 5 days exempt at 88 + 2 days normal at 80 = 86 hours). **The exemption applies to released residents** rotating to a service where the exemption is configured.
    

### 5.2 One day off in seven (averaged) — ACGME interpretation

*   Trainees should have at least one 24-hour period free of activity per week, **averaged** over a 28–31 day period.
    
*   **Calculation:** `Number of days off / # of possible work days in period (excluding recorded absences) × 7 = average days off per week`.
    
*   **Compliance threshold:** for a 28-day period, average must be 1.0 or higher. For 29–31 day periods, average must be 0.903 or higher.
    
*   **Hours/activities included in the calculation:** Standard Hours, Home Call (called in), and (depending on the `settings_dh_ns_moonlighting` root setting) External Moonlighting, plus Home Call-type Recorded Activities, on-site shift Recorded Activities, on-site call Recorded Activities, and clinic Recorded Activities.
    
*   **Hours/activities excluded:** Clinical Work from Home does not block a day from counting as a day off (Tickets 139496, 148235). **Standard Service Hours** (defined in Service/Shift Management) are also not factored into the day-off calculation, even though they appear in the same Work Hours dropdown — this is an inconsistency surfaced in Ticket 231921.
    
*   **Date the day off is attributed to:** the _end_ time of the 24-hour period of inactivity. If a trainee is inactive from 10 AM Saturday to 10 AM Sunday, Sunday is the day off. This causes a known display oddity: a day with logged hours can show as "off" if it was the tail of a 24-hour inactive period that started the prior day.
    
*   **DST sensitivity:** spring forward shortens the affected calendar day to 23 hours, so a 24-hour inactive period ending on the DST day shifts the day off to the day after, even if that day has logged hours. (Ticket 125164.)
    
*   **Calendar Day Off vs. 24-hour period of inactivity:** these are different concepts. (Ticket 229800.)
    
    *   A **calendar day off** is 24 hours from 12:00 AM to 11:59 PM with no clinical activity.
        
    *   A **24-hour period of inactivity** is any consecutive 24 hours with no activity, regardless of where it falls in the calendar.
        
    *   ACGME requires the 24-hour-period version. The Work Hours by Service report shows calendar days off; the Work Hours History tab labels its column "calendar days off" but actually shows 24-hour periods. A calendar day off is always a 24-hour period of inactivity, but a 24-hour period of inactivity is not always a calendar day off.
        

### 5.3 NYS 405 Day Off

A separate, stricter version of the day-off rule for clients in New York State. Enabled via the root setting `enable_nys405_rules`.

*   **One day off every week** (not averaged over 28–31 days).
    
*   **Vacation and LOA are NOT removed** from the calculation. This is the opposite of the standard ACGME treatment.
    
*   The Work Hour Compliance Report applies NYS 405 rules when the "Use NYS 405 Regulations" filter is selected.
    
*   **Work Hour Review Periods do not use NYS 405 rules** — only the Compliance Report does. (Ticket 147795.)
    
*   The "Use NYS 405 Regulations" filter and the "Display only resident with violations" filter are designed to be used independently. Combining them produces unexpected results because the day-off calculation treats absences differently between the two filters. (Tickets 177713, 183386.)
    
*   The "week" used by NYS 405 today is hardcoded Sunday–Saturday, which is one of the central drivers of the configurable start of week work.
    

### 5.4 Maximum work period — 24+4 (28 hours total)

*   A trainee should not work more than 28 hours in a single continuous work period — 24 hours of clinical duty + 4 hours of transitions/wrap-up.
    
*   **Not averaged.** Each instance is an immediate/true violation. Three 29-hour periods in a week = three violations.
    
*   **Hours included:** Standard hours only. Clinical Work from Home does not count toward 24+4. (Ticket 139496.) Home Call (called in) historically did not count, but per recent ACGME consultation it is now considered in-hospital work that should count the same as Standard. **This is an evolving area** — verify against current rule evaluation logic before stating this confidently to clients.
    
*   **Continuous work period definition:** if two work periods are separated by a gap less than or equal to `CONST_HOURS_MIN` (root setting, typically 2, 2.5, or 3 hours), the system treats them as a single continuous work period. The gap hours themselves are not counted toward the total. (Ticket 172869.)
    
*   **Violation date:** the day the continuous work period ends.
    
*   **Threshold configurability:** the threshold (`CONST_CALL_MAX`, default 28) can be overridden per program via the program list. (Ticket 176247.)
    
*   **Interaction with the 8-hour break rule:** if a trainee chooses a reason on an 8-hour break violation that indicates the work periods were one continuous period, the system may then trigger a 24+4 violation on the combined period. (Ticket 174384.)
    
*   **Daylight saving time:** the spring DST weekend can extend a 28-hour shift to 29 hours, triggering a violation that wouldn't fire any other week. (Tickets 145699, 230810, AMBS-10321.)
    
*   **Same-day double violation (historical):** in some cases two 24+4 violations could be flagged on the same day — once for the original work period exceeding the threshold, and again when a short gap caused the system to treat a follow-up entry as continuing the period. Identified as an enhancement opportunity (AMBS-5075) but the historical behavior remains.
    

### 5.5 8-hour break between work periods

*   Trainees should have an 8-hour break between work periods.
    
*   Post-2017 ACGME treats this as a "should," not a "must" — programs may break it periodically for significant learning opportunities.
    
*   **Not averaged.** Each instance is an immediate/true violation when active.
    
*   **Hours included:** Standard Work Hours by default. External Moonlighting can be included by enabling the root setting `settings_dh_ns_moonlighting`.
    
*   **Configurability:**
    
    *   Can be disabled entirely via the root setting `work_hour_8_violation` (when 0, the rule is grayed out on the compliance checklist as a warning rather than a violation).
        
    *   The minimum gap that constitutes "one continuous period" rather than "two periods with a break" is set by `CONST_HOURS_MIN` (typically 2, 2.5, or 3 hours).
        
*   **Home Call interaction:** if there is an overlapping Recorded Activity for Home Call between two Standard work periods, the 8-hour break violation is suppressed. Internal interpretation: the resident is presumed to have been called in continuously during the home call, so the system does not see the gap as a break. (Ticket 84335.)
    
*   **Trainee-facing reason flow:** if the gap is between `CONST_HOURS_MIN` and 8 hours, the trainee is prompted to choose a reason at submission. Depending on the reason, the system may treat the work as one continuous period (potentially triggering a 24+4 violation) or accept it as two separate periods with an inadequate break. (Ticket 174384.)
    
*   **"Continued same work period after break" / "Left institution for strategic nap" reasons** — these reasons indicate the violation is not a true violation, so trainees are not asked to comment on them. The trainee's Work Hours History tab and personal compliance calendar respect these reasons (compliant timesheet, green week). However, the Work Hours Institutional Summary, Work Hour Compliance Report, and Work Hour Review Period **do not** respect the reason — they look at the backend setting (`work_hour_8_violation`) to decide whether to count the break violation, regardless of reason. (Ticket 181687.)
    
*   **Historical context:** prior to 2017, a 10-hour break check existed alongside the 8-hour check. The 10-hour check was removed (post-`settings_dh_cpr_date`) but the 8-hour check remains.
    

### 5.6 14-hour break after 24-hour scheduled call

*   The program should not schedule a trainee to another shift, call, or clinic within 14 hours of a 24-hour on-site call.
    
*   **Not averaged.** Each instance is an immediate/true violation.
    
*   **This is a schedule-driven rule.** It does not look at hours the trainee logs. ACGME holds the program responsible for what the program scheduled, not what the trainee did. (Ticket 183993.)
    
*   **24-hour call definition:** specifically an on-site shift/call scheduled by the program. **Home calls do not count.** (Ticket 185453 — when a "24-hour backup call" is set up as an On-site Shift/Call type instead of Home Call type, this rule fires; reconfigure the shift/call type going forward — there is no way to retroactively change a shift/call type once populated.)
    
*   **Continuity treatment:** if the program schedules a shift, call, or clinic that starts within 30 minutes of the 24-hour call ending, the system considers it one continuous work period rather than firing a break violation. If that continuous activity then exceeds 24+4, the 24+4 violation triggers instead.
    
*   **End-of-call timing for >24 hour calls:** if the on-site call is more than 24 hours, the 14-hour break requirement starts when the trainee leaves the hospital.
    
*   **Configurability:** the threshold (default 14) can be overridden per program via the program list.
    
*   **Logged-but-not-scheduled hours:** if the trainee logs hours within 14 hours of a 24-hour call but no schedule entry exists, the rule does not fire. ACGME holds the program responsible for what they scheduled; trainee-driven overruns are a separate compliance concern. (Per Rhea: "It would still be a violation if the resident worked during that 14 hours that they were not scheduled BUT the program wouldn't have a violation for scheduling them. However, the program WOULD be held accountable for not having oversight.")
    
*   **Display location:** because this rule is not driven by logged hours, the violation displays in the Scheduled Activities section above the hours table on the timesheet, not in the hours area.
    
*   **Trainee reason still required:** even though the violation isn't caused by what the trainee logged, the trainee is still expected to provide a reason for it.
    

### 5.7 Maximum in-house on-call frequency (every-third-night, averaged over 4 weeks)

*   ACGME requires that residents be scheduled for in-house call no more frequently than every third night, averaged over a 4-week period.
    
*   **MedHub does not actively enforce this rule.** There is no automatic violation flag for it.
    
*   **Where to check it:** Resident Work Hours → Work Hours Statistics → "Average days per week of in-house call (excluding home call and night float)" with the date range and the "Flag residents that exceed in-house call every 3rd night (over 4 weeks)" option.
    
*   This is one of the rules the administrator is solely responsible for via the schedule. (Tickets 199903, ES 6/27/22.)
    

### 5.8 Submission Rate violations (Program Director sign-off requirement)

When enabled, the Program Director must enter a Submission Rate Violation comment before completing a review if the period's submission rate is below threshold. (Ticket 237340.)

*   `duty_hours_submission_residents_threshold` — minimum number of residents in the program for the rule to apply.
    
*   `duty_hours_submission_threshold_percentage` — the threshold percentage; if the submission rate falls below this, a comment is required.
    

### 5.9 Rule applicability quirks

*   **PGY-level changes mid-week:** the system uses the trainee's PGY level **on Sunday** for any violations triggered that week.
    
*   **Released residents:** the **home program's** rules apply. An EM resident rotating through IM is held to the EM rules, not IM rules. (Ticket 164680.)
    
*   **Standard ACGME Rules vs. Program-Specific Rules** — programs select between these two modes in the program list. Switching a program from "Use Standard ACGME Rules" to "Use Program-Specific Rules..." exposes editable threshold fields for each rule. (Tickets 176247, plus the original "Surgery Residency trial" ticket.)
    

### 5.10 Technical detail

*   Many rule behaviors are gated by `settings_dh_cpr_date` — the date the institution adopts the 2017 ACGME Common Program Requirements. Set to a date in the past (typically 7/1/2017) for clients on post-2017 rules.
    
*   Older variants (`settings_dh_ns_date`, default 7/1/2011) gated the 2011 ACGME standards. For most current clients these are historical.
    
*   The `CONST_HOURS_MIN` setting governs the gap-merging behavior across multiple rules (24+4, 8-hour break) and is per-client.
    
*   `settings_dh_ns_moonlighting` controls whether moonlighting hours count toward day-off and 8-hour break calculations (in addition to the always-on inclusion in the 80-hour calculation).
    
*   The on-the-fly violation calculations performed inside the Work Hours Compliance Report and Work Hours Analytics report are out of scope here; this section describes the trainee-facing rule evaluations performed at submission time and on the trainee's compliance checklist.
    
*   **In-flight: MED-859 Maximum Work Period Length violation calculation** is part of the Analytics work hours report rebuild. Sample tests are catalogued in MEDM-10914.
    

## 6\. Trainee submission prompts and reason capture

When a trainee submits a timesheet that contains potential violations, a popup appears asking the trainee to provide a reason and a comment for each potential violation.

### 6.1 Reason list

Chosen from a per-client list managed under support → Site Navigation → List Management → Work Hours Exceptions.

### 6.2 Reason semantics

Each reason can carry an attribute that affects calculation:

*   On an **8-hour break violation**, certain reasons indicate "this was really one continuous period" — collapsing the two entries into a single work period (which may then trigger a 24+4 violation as a consequence). Other reasons indicate "these were genuinely separate periods with an inadequate break," in which case the break violation stands.
    
*   The "Continued same work period after break" and "Left institution for strategic nap" reasons indicate not-a-true-violation in the trainee's compliance view, but Compliance Report / Institutional Summary / Review Period continue to count them based on the backend setting alone (Ticket 181687, see §5.5).
    

### 6.3 Comment field — character limits

*   **Resident** timesheet Program Notes: 212 characters (no spaces) / 255 characters (with spaces).
    
*   **Student** timesheet Program Notes: 205 characters (no spaces) / 255 characters (with spaces).
    

### 6.4 Multi-submit deduplication

The system suppresses duplicate violation emails to PDs and admins when a trainee clicks Submit multiple times within ~30 seconds (to handle slow page loads). After 30 seconds, repeat submissions can produce repeat emails — by design, since the trainee may have updated hours or reasons. (Ticket 100929.)

### 6.5 Locked program notes

Once submitted, the Program Notes field cannot be cleared. The data locks in. (Ticket 167594.)

### 6.6 UME reason list customization gap

The reason list customization UI excludes the UME school program from the program dropdown — meaning UME reason lists today require either platform-side intervention or live with whatever defaults are configured. (Ticket 237440, AMBS-11339.)

## 7\. Work Hour Review Periods

Review periods are how programs aggregate work hours for compliance review by program directors over a multi-week window.

### 7.1 How review periods are generated

*   Generated when a program runs the New Schedule Task Wizard at the start of an academic year.
    
*   **Aligned to rotation periods initially.** If a rotation starts on the 1st of the month, periods are monthly. If it starts mid-month, periods are 28 days from the rotation start. (Ticket 117475.)
    
*   **Capped at 28 days** when rotations are longer. ACGME recommends 4-week review periods, so a program with 6-week rotation blocks gets 28-day review periods that don't align to rotations.
    
*   **Custom review periods** can be created by GME in List Management → Work Hour Review Periods.
    
*   **Programs that miss the wizard** have no review periods. GME can either create periods manually or request that MedHub Support run a regeneration script.
    
*   **Firm-based programs** have separate review periods per firm — six firms = six review periods, not one consolidated period. (Ticket 131707.)
    
*   **Split-schedule programs** have separate review periods per side of the split.
    

### 7.2 Review period statuses

A review period progresses through a lifecycle:

*   **Pending Review** — awaiting program director sign-off.
    
*   **Reviewed** — PD has signed off.
    
*   **Partially Reviewed** — a timesheet was modified after the period was reviewed, generating a new violation. The PD sees an Urgent Tasks alert (no email).
    
*   **Snapshot behavior** — the review period is a snapshot. If a violation count was 10 at review time and a coordinator later edits a timesheet to remove a violation, the review period still shows 10. The Compliance Reports will reflect the change; the review period itself does not.
    

> **In-flight: persisted Review Period statuses.** Today, review period status is calculated on-the-fly in many places. MEDM-10643 (Set Status when Review Period is Created) and MEDM-10817 (Update list view to use persisted status) are migrating to a persisted-and-recomputed model. MEDM-10662 adds Pending Status recalculation triggers (review period created, sunset cron, etc.). MED-595 updates filtering and sorting on the list view.

### 7.3 Triggers that update a review period back to "Pending Review"

1.  Arriving at the Review Alert Date.
    
2.  Submitting timesheets.
    
3.  Regenerating work hours by request (MedHub Support).
    
4.  Recording conference attendance, when program settings enable timesheet pre-population.
    
5.  Recording absences.
    

### 7.4 When a review period becomes available to the PD

The PD can access a review period only after trainees are locked out of editing timesheets that fall within the period. The lockout typically happens 1–2 weeks after the period ends. GME can confirm the date via List Management → Work Hour Review Periods → Review Date column.

Example: a review period ending Saturday 4/6 with a trainee lockout of 4/13 means the PD has access starting 4/14.

### 7.5 Review submission

*   **Coordinator** can pre-populate review comments under Resident Work Hours → Work Hours Reviews → Review.
    
*   **Program Director** sees those comments, can edit/delete/submit them, and ticks the "Reviewed" checkbox per violation.
    
*   **Additional Comments** can be entered by the PD at the bottom of the review.
    
*   After submission:
    
    *   **Review Comments** are visible to coordinators in the Work Hours Compliance Report (in their own column).
        
    *   **Additional Comments** are not visible to coordinators after submission — only to GME via the Institutional Summary Report when "Use Work Hours Review Periods If Available" is selected.
        
*   **Associate Program Directors** can be enabled to approve review periods via the root setting `setting_dh_review_adflag`. (Ticket 141590.)
    

### 7.6 How violation counts are aggregated by review period

*   **Days-off violations** are counted per review period. If a rotation has two review periods and the trainee has a days-off violation in both, both count.
    
*   **24+4 violations and 8-hour break violations** are counted once per occurrence, not double-counted across review periods even if the violation could be associated with two periods.
    
*   **Day-off attribution edge case (Ticket 165290):** the day a 24-hour inactive period ends is the day off. If the inactivity starts in one review period and ends in the next, the day off is attributed to the _end_ day's review period in the calendar — but the days-off _calculation_ requires the entire 24 hours to fall within the review period, so a partial 24-hour span at a period boundary may show as a day off in the calendar but not count toward the calculation. Example: 9/30 - 10/1 inactivity counts as a day off on 10/1's calendar but contributes only 23 hours toward the October review period's day-off average.
    

### 7.7 Email/alert behavior tied to review periods

*   A review period that has no violations does **not** trigger a "New Work Hour Review" urgent task or email. The Review button is grayed out. (Ticket 241429, AMBS-11843.)
    
*   A review period with violations triggers an Urgent Task and email to the PD when it becomes available.
    
*   If the PD reviews a period with violations, then a coordinator resolves all violations before the PD logs in, the PD may see no violations in the system even though they received the email — by design, since the email triggered when the period closed but the violations were resolved in the meantime. (Ticket 158325.)
    

### 7.8 Regenerating review periods (support tools)

*   **For a single program:** Root → Utilities → Work Hours Review Periods → Review Period Definitions → select program → Simulate Auto → Save Changes.
    
*   **For a date range across all programs:** Root → Utilities → Work Hours Review Periods → Work Hours Reviews tab → "Regenerate by date range" with start, end, and "all programs." (Ticket 164381 documents the procedure.)
    
*   **Audit programs missing review periods:** Root → Utilities → Work Hours Review Periods → Review Period Definitions → "Audit all Schedules." (Ticket 238866 documents the audit procedure for Mayo's annual check.)
    
*   **Reopening reviewed periods:** governed by the root settings `setting_dh_review_reopen` and `setting_dh_review_sunset`. These settings can prevent reviewed periods from being reopened or recalculated.
    

### 7.9 The view-by-review-period UI on the trainee timesheet

When `settings_dh_view_by_review_period` is enabled, the trainee timesheet displays the **Review Period Compliance Checklist** instead of the **Weekly Compliance Checklist**.

*   When 0, review periods only display once they reach their alert date. (Ticket 222749, AMBS-9841.)
    
*   When 1, they display earlier.
    
*   Edge case: when a program has no review periods set up for the academic year, the dropdown displays "12/31 - 12/31/1969" placeholder dates and the title reads "Weekly Compliance Checklist" instead. (Tickets 133862, 147409.)
    
*   On split schedules, the toggle does not respect previous-academic-year split membership when the trainee is on a different side now (Ticket 156820, AMBS-5644).
    

### 7.10 Technical detail

*   Review periods are persisted in `ref_timesheets_periods`.
    
*   Review period status (Pending, Reviewed, Partially Reviewed) has been calculated on-the-fly in many places in the system. The architecture work currently in MED-595 / MEDM-10817 is moving this to a persisted, computed-once-and-stored model.
    
*   Review period creation is handled by `create_review_periods()`, part of the cron-driven workflow.
    
*   The alert date for each review period is set by `DHReviewPeriod::setAlertDate()`, which currently hardcodes Sunday in its computation logic.
    
*   The 24-hour-inactive-period day-off calculation has known edge-case behaviors at review period boundaries (AMBS-10048 and related tickets). The system considers Saturday 12 AM–11:59 PM as "spoken for" if the prior week had no Saturday hours, which can cause inconsistent days-off counts week to week even when the trainee logs identical hours. Tracked under MPP-101 for redesign.
    

## 8\. Lockout (when trainees and admins can no longer edit)

### 8.1 Trainee lockout

*   The default is "1 + 1": one previous Sunday–Saturday week plus the current week. Anything older is locked.
    
*   **Configured per program** under root → Site Navigation → Program Management → \[program\] → Settings/Modules → "Work Hours - Residents can access \[N\] week(s) prior to the current week." Options range from 0 weeks (current week only, locking at midnight Saturday) to 52 weeks.
    
*   **The default for new programs** is set by the root setting `settings_dh_weeks_default`. Changing this setting affects only newly created programs. To change existing programs in batch, a Data Ticket is required.
    
*   **Email verbiage gap (Ticket 210459)**: even if a program updates its setting to allow more weeks, the late-submission warning email continues to use 2-week verbiage. Tracked but not yet fixed.
    

### 8.2 Administrator lockout

*   Many institutions set the 15th or 20th of the month as the date administrators can no longer edit work hours, absences, and schedule for the previous month.
    
*   Configured via the root setting `workflowA` (section 3 of that setting governs Program Administrator lockout).
    
*   The lockout is enforced when the admin loads the editing page — there is no scheduled cron that "locks" at a specific moment. The page checks the date against the lockout setting and decides whether to display the editing affordance.
    

### 8.3 Resident hard cap (6 months back from current AY start)

> **Hardcoded.** The Work Hours date pull-down menu allows trainees to navigate back **6 months from the start of the current academic year**, plus the current academic year, regardless of any unlock. (Ticket 89048.) The trainee's specific training history start date in the institution caps it earlier if applicable.
> 
> The "current academic year" is governed by the root setting `global_rotationsetID`. **DO NOT modify** `global_rotationsetID` — it is updated late on June 30 / early July 1 each year by the development team only. Modifying it produces unexpected timesheet behavior and confuses clients.

### 8.4 Unlock workflows

*   **Resident lockout exceptions** can be requested through the program administrator, who may need GME involvement.
    
*   **Administrator lockout exceptions** require GME to use the Unlock Rotations function, selecting program, date range, activities, and a deadline.
    
*   **Past fiscal year unlock** requires MedHub Finance Support.
    
*   **The "Work Hours Locked" Urgent Task** is a warning that lockout is about to occur, not that it has occurred. It persists until the timesheets are submitted; it doesn't time out on its own.
    

### 8.5 UME lockout differences

*   UME schools configure trainee access via the same "Work Hours - residents can access \[N\] week(s)" pattern, but the URL navigation differs because UME schools are managed as a placeholder program. Support uses URLs like `https://[client].medhub.com/u/s/programs_modules.mh?programID=1` to access the settings. (Ticket from CNSU-test, ML 7/7/2022.)
    
*   Some UME functions also require updating `workflowA` to align student lockouts with school workflow cutoffs.
    
*   **UME work hours timeframe is based off current week + past weeks.** It is **not** connected to course end date — students can't be configured to log work hours for N weeks after course end. (Ticket 220714.)
    

### 8.6 Late-submission email cron timing (the "10th of the month" alert)

*   The email sent on the 10th of the month (about workflow cutoff) is governed by a cron variable `setting_alerts_cutoff_day`, which is **independent of** `workflowA`. Both must be aligned to give consistent client experience. T2 support can update `setting_alerts_cutoff_day` per client. (Ticket 218712, AMBS-9665.)
    

### 8.7 Technical detail

*   `settings_dh_weeks_default` is the global default for new programs; per-program overrides are stored at the program level and respected over the global default.
    
*   The lockout enforcement is procedural (page-load check against current date), not background-cron-driven.
    
*   The 6-month hardcoded view window cannot be extended; it is unrelated to the workflow lockout.
    

## 9\. Work Hours Sampling

An alternative to weekly logging for programs that want to track work hours only during sampling windows. (Tickets 219785, 146303.)

*   **Setup (GME):** Program List → \[program\] → "Work Hours Setting" → "Use Work Hours Sampling." Then GME → Home tab → "Work Hours Sampling" → \[program\] → define one or more sampling periods.
    
*   **Multiple sampling windows** can be defined and added throughout the year.
    
*   **Past sampling windows cannot be deleted;** future ones can.
    
*   **Late-submission emails are not sent to trainees** when their program is in sampling mode but no active sampling period is in effect. Trainees can still log hours outside sampling windows; they just won't be reminded.
    
*   **PD notification** for review periods is only sent for sampling windows.
    
*   **Review periods and sampling periods are independent.** Programs are responsible for either deleting non-sampling-period review periods (via List Management) or accepting that empty review periods will exist outside sampling windows.
    
*   **Most programs have determined continuous work hours are best now** under the ACGME requirements. Review periods were built to provide PDs with a way to do that, and it's not customary to use both sampling and review periods together.
    

## 10\. Alerts and notifications (current state)

### 10.1 Trainee-facing

*   **Late submission email** — Mondays at midnight if the previous week's timesheet wasn't submitted (residents only after first historical submission; students always; students get only urgent task, not email).
    
*   **Incomplete Work Hours urgent task** — appears for residents only after they've submitted at least one timesheet historically, and remains until the latest unsubmitted Sunday–Saturday week is submitted. Students see this urgent task regardless of submission history (an inconsistency tracked in AMBS-8953).
    

### 10.2 Administrator-facing (program coordinator/admin)

*   **Late submission summary email** — configurable day of the week via `setting_dh_admin_alert`. Lists trainees who haven't submitted last week.
    
*   **Potential Violation email at submission** — sent when a trainee submits hours containing a potential violation. Configured at GME → Program List → \[program\] → "Send Emails on Potential Violations" and Admin → Program Settings → Work Hours → "Send Emails on Potential Violations."
    
*   **Potential Violations Popup at submission** — shown to the trainee at submission. Configured at GME → Program List → \[program\] → "Potential Work Hour Violations Popup."
    

### 10.3 The four-state interaction between Popup and Email settings

(Documented in Ticket 225253.)

GME Program List "Popup"

Admin Program Settings "Email"

Trainee sees popup?

Email sent?

Violations listed in either?

ON

ON

Yes (with violations listed)

Yes

Yes in both

OFF

OFF

No

No

n/a

ON

OFF

Yes (with violations listed)

No

Yes in popup

OFF

ON

Yes (without violations listed)

Yes (without violations listed)

No

The non-intuitive case is the bottom row — when the GME-level popup setting is OFF but the Admin email is ON, the popup still appears (because the email-trigger needs the trainee to acknowledge), but it doesn't list the violations, and the email also doesn't list them.

### 10.4 More admin-facing nuances

*   **Potential Violation email NOT sent when admin submits** — when a coordinator/admin submits a timesheet on a trainee's behalf, the violation email is suppressed. Internal logic: the admin already knows about the violations. (Ticket 208562.)
    
*   **Multi-submit deduplication** — submissions within ~30 seconds are deduplicated to a single email. After 30 seconds, repeat submissions trigger repeat emails. (Ticket 100929.)
    
*   **Inadvertent global "Duty Hour Alerts" GME setting** — a custom GME-side "Duty Hour Alerts" setting was inadvertently propagated globally to clients years ago. It does not actually trigger any emails for most institutions and is being removed from Institution Settings UI. (Tickets 167246, 212585, AMBS-9326.)
    

### 10.5 Director-facing

*   **New Work Hour Review urgent task and email** — sent when a review period with violations becomes available for review. Periods without violations do not trigger this. (Ticket 241429, AMBS-11843.)
    
*   **Partially Reviewed urgent task** — when a timesheet edit creates a new violation in an already-Reviewed period, the PD sees an Urgent Task. No email.
    

### 10.6 UME alert differences

*   UME has no comparable "Send Email on Potential Violation" setting at the program level for the standard alert flow.
    
*   **Spring 2024 added a UME-only "Potential Violation Alert Recipients" setting** under School Settings → Work Hours, allowing student administrators to be designated as recipients of potential violation emails. Default is no recipients. The email mirrors the GME version but uses UME language and triggers on both mobile and full-site student submissions.
    

### 10.7 Technical detail

*   Trainee alerts run from `alert_timesheets_late()`; admin alerts run from `alert_timesheets_late_admin()`. Both use hardcoded "previous Sunday" check window logic.
    
*   Email content for the trainee lockout warning has known incorrect verbiage when programs use a multi-week access window (e.g., "2 + 1") — the email text doesn't reflect the configured window. Tracked but not yet fixed (Ticket 210459).
    

## 11\. The hardcoded Sunday–Saturday week (the central pain point)

The current MedHub work hours functionality assumes a Sunday–Saturday work week throughout. This shows up in:

*   **Timesheet display and navigation** — the trainee timesheet renders Sun–Sat.
    
*   **Compliance checklist windows** — weekly compliance views align to Sun–Sat.
    
*   **Late submission alerts** — Monday emails refer to "last week" meaning Sun–Sat.
    
*   **Auto-submit and pre-populate cron** — runs Saturday night to roll over the week.
    
*   **Lockout** — lockout windows are counted in Sun–Sat weeks.
    
*   **Day-off calculations** — the "calendar day" frame for days off uses a Sun–Sat-aligned 7-day window.
    
*   **NYS 405 day off** — the strict weekly day-off check uses Sun–Sat as "the week."
    
*   **Review period creation and alert dates** — alert date logic snaps to Sunday.
    
*   **PGY level for week** — the system uses the trainee's PGY on Sunday to evaluate week-level violations.
    
*   **Work Hour Submission report submission rate** — calculated on whole Sun–Sat weeks; produces different numbers than the review period's day-based calculation, especially in months that don't align cleanly to Sun–Sat. (Tickets 122700, 147303, 149592 — extensive support history.)
    

Clients have asked for configurable start of week for years — particularly programs that begin rotations on Mondays. The configurable start of week initiative replaces this hardcoded assumption with per-program (GME) and per-school (UME) configuration.

> **In-flight initiative.** **MED-565** ("Allow for configurable Start Day of Week for work hour timesheets") is the parent feature. **MEDM-10938** is evaluating whether the setting should be schedule-level vs. program-level. **MED-809** ("Enhance work hours submissions workflow and data collection in platform and mobile") bundles the broader workflow refresh. This is **the most consequential change to Work Hours in years** and will affect nearly every section of this document when it lands.

### 11.1 Technical detail

*   The Sun–Sat assumption shows up in inline `date("w")` arithmetic across `includes/common_new/include_functions_timesheet.php` and several `.mh` portal pages.
    
*   Specific functions affected include `timesheet_calendar()`, `timesheet_utility_calendar_month()`, `timesheet_history()`, `timesheet_chart()`, `timesheet_compliance_by_program()`, `timesheet_reviews_update()`, `create_review_periods()`, `alert_timesheets_late()`, `alert_timesheets_late_admin()`, `cron_global_timesheets_auto`, `DHReviewPeriod::setAlertDate()`, and `DHScheduleCollection`.
    
*   Legacy duplicated copies exist in `includes/common/` and `includes/portfolio_dashboards/` (slated for retirement as part of MED-565).
    

## 12\. Schedule, rotation, and PGY interactions

### 12.1 Schedule and rotation

*   Rotation periods (defined when a program runs the New Schedule Task Wizard) are the basis for review period generation.
    
*   Each schedule has its own review periods. A program with a split schedule (e.g., separate PGY-2/PGY-4 and PGY-3 paths) has separate review periods per side of the split.
    
*   A "firm-based" program (Internal Medicine model) has separate review periods per firm — six firms = six review periods, not one consolidated period.
    

### 12.2 PGY level

*   The trainee's PGY level is read on Sunday of the week being calculated.
    
*   Trainees released to another program retain their **home program's** rules.
    

### 12.3 Scheduled activities and recorded activities

*   Standard Service Hours (defined per service in Service/Shift Management → Shifts/Calls → Standard Service Hours) auto-populate Recorded Activities on the timesheet for trainees on that service. They do not factor into the days-off calculation, even though they appear in the same dropdown — an inconsistency surfaced via Ticket 231921.
    
*   Overnight shift hours overwrite Standard Service Hours when work hour pre-population runs. Daytime shift hours do not overwrite. (Ticket 172610.)
    
*   A QGenda → MedHub clinic pre-population integration applies pre-population at the time the clinic definition syncs from QGenda. Disabling pre-population in MedHub afterward does not retroactively disable it on the synced clinics; coordinators must remove pre-population in bulk via the continuity clinics view. (Ticket 202851, AMBS-8730.)
    

### 12.4 Released residents

*   The home program's work hour rules apply, not the receiving program's. (Ticket 164680.)
    
*   Pre-population in the home program's timesheet is supported when the released-program service has Standard Service Hours and pre-population enabled. (Ticket 180451.)
    
*   When a trainee's program is changed for a previous academic year, work hours for the original program remain intact — timesheets are tied to the trainee, not the program.
    

### 12.5 Trainee promoted between PGY levels mid-year

*   If a trainee's training history is extended into another PGY level mid-year (e.g., extended PGY3 in a firm-based program), the trainee must be assigned to a firm for both sets of dates. Without this, the trainee appears greyed out for the second PGY's date range. (Documented in the Scheduling doc §11.4.)
    

## 13\. Configuration surface map

### 13.1 GME side

*   **Institutional Settings** (top-level, applies institution-wide) — accessed by GME office user.
    
*   **Program List** (GME office sets per-program settings on the program's behalf) — separate from Program Settings.
    
*   **Program Settings** (controlled by the individual program) — Admin/Coordinator user → Program Settings → Work Hours.
    

### 13.2 UME side

*   **School Settings** — Student Administrator → School Settings → Work Hours. Applies to entire school.
    
*   **Course Settings** — not in play for work hours.
    

### 13.3 Root side (support-only)

*   **Site Navigation → List Management → Work Hours Exceptions** — manages reason lists used in submission popups.
    
*   **Site Navigation → List Management → Work Hours Rotation Exceptions** — manages 88-hour exemptions tied to specific rotations.
    
*   **Site Navigation → List Management → Trainee Types / Student Types** — controls whether work hours is enabled for each trainee type.
    
*   **Site Navigation → Program Management → \[program\] → Settings/Modules** — per-program settings including weeks-prior access and work hours enable/disable.
    
*   **Site Navigation → Settings (root)** — full set of per-client root settings.
    
*   **Utilities → Work Hours Review Periods** — review period regeneration tools (Simulate Auto, Audit all Schedules, Regenerate by date range).
    

## 14\. Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export and Emma's consolidated documentation. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_dh_cpr_date`

Date the institution adopts post-2017 ACGME CPR rules. Default 7/1/2017 for current clients. Many rule behaviors (Clinical Work from Home counting toward 80, "Clinical Work from Home" rename, 14-after-24, 10-hour break removal) gate on this date.

`settings_dh_ns_date`

Date the institution adopted 2011 ACGME standards. Mostly historical (default 7/1/2011).

`settings_dh_weeks_default`

Default weeks-prior access window for new programs. Default 1. Existing programs require Data Ticket to update in batch.

`settings_dh_view_by_review_period`

Toggles the view-by-review-period UI on the trainee timesheet (0 = wait until alert date; 1 = display earlier).

`settings_dh_review`

Whether review is enabled.

`settings_dh_review_reopen`

Governs whether a Reviewed period can be reopened.

`settings_dh_review_sunset`

Governs sunset behavior for old review periods.

`setting_dh_review_adflag`

Allows Associate Program Directors to approve review periods.

`setting_dh_admin_alert`

Day of week for coordinator late submission email.

`setting_alerts_cutoff_day`

Day of month for monthly workflow cutoff email. **Independent of** `workflowA` — both must be aligned. T2 controls.

`settings_dh_log_on_absence`

When enabled, allows trainees to log moonlighting and Clinical Work from Home during absences.

`settings_dh_ns_homecall`

Enables the "Home Call (called in)" entry type platform-wide.

`settings_dh_ns_moonlighting`

Includes moonlighting hours in 1-in-7 day-off and 8-hour break calculations (in addition to the always-on inclusion in the 80-hour calculation).

`enable_nys405_rules`

Enables NYS 405-style day-off calculation in the Work Hour Compliance Report only — NOT Review Periods.

`work_hour_8_violation`

1 = treat 8-hour break as a violation; 0 = treat it as a warning (and grayed out on the compliance checklist).

`CONST_HOURS_MIN`

Minimum gap (hours) between two work periods to treat them as separate periods rather than one continuous period. Typically 2, 2.5, or 3.

`CONST_HOURS_BREAK`

Threshold for the work hour break violation, pre-2017. 8 or 10. Mostly historical post-2017.

`CONST_CALL_MAX`

24+N maximum work period threshold. Default 28.

`CONST_CALL_LABEL`

Label for the maximum-work-period rule. Default "24+4".

`duty_hours_submission_residents_threshold`

Minimum residents for the submission rate violation to apply.

`duty_hours_submission_threshold_percentage`

Submission rate threshold below which the PD must comment.

`global_rotationsetID`

Marks the start of the current academic year. **DO NOT MODIFY.** Updated only by development on July 1 each year.

`settings_students_dh`

Enables work hours on the UME side.

`workflowA`

Per-user-type lockout day-of-month array. Section 3 governs Program Administrator lockout.

## 15\. Known quirks, edge cases, and as-designed oddities

This section captures behaviors that frequently produce support tickets and may catch new team members off-guard.

*   **Days-off calculation at review period boundaries** — a 24-hour inactive period that starts in one review period and ends in the next shows the day off in the calendar but does not contribute to the calculation in either period (the calculation requires the full 24 hours within the period). (Ticket 165290.)
    
*   **Saturday-with-no-hours behavior** — if a trainee's Saturday has zero logged hours, the next week's days-off calculation treats Saturday 12 AM–11:59 PM as already "spoken for" (assumed counted by the prior week). This can produce week-to-week swings in days-off counts even when the trainee logs identical hours week to week. (Ticket 228299, AMBS-10048, MPP-101.)
    
*   **Daylight saving time** — spring DST extends some shifts by an hour (potentially triggering 24+4 violations) and shortens days off (potentially miscounting the 24-hour inactive period). Currently working as designed. (Tickets 145699, 230810, 125164, AMBS-10321.)
    
*   **Clinical Work from Home counts toward 80 only** — does not count toward 24+4, 8-hour break, or 14-after-24. A day with only Clinical Work from Home logged still counts as a day off.
    
*   **Home Call (called in) and the 8-hour break** — an overlapping (even unlogged) home call between two Standard work periods suppresses the 8-hour break violation. (Ticket 84335.)
    
*   **Two 24+4 violations on the same day (historical)** — possible when a long shift exceeds the threshold and a follow-up entry within `CONST_HOURS_MIN` is also flagged. (AMBS-5075.)
    
*   **14-hour break only on schedule, not on logged hours** — trainees logging hours within the 14-hour window but not scheduled to anything do not trigger the rule. (Ticket 183993.)
    
*   **NYS 405 + "Display only resident with violations" filters** — designed to be used independently. (Tickets 177713, 183386.)
    
*   **PGY level on Sunday** — a trainee promoted mid-week is held to the prior PGY level until the following Sunday for any week-level violation.
    
*   **Released residents** — home program rules apply, not the host program's. (Ticket 164680.)
    
*   **Timesheets unsubmitted reduce the denominator** — a trainee who submits only one week of a four-week period is averaged against just that one week's days, producing an unexpectedly high average. (Ticket 127518.)
    
*   **Vacation excluded from numerator and denominator** — a trainee on vacation for a full week is "invisible" to that week's averaging.
    
*   **LOA full-week timesheets do not need submission** — if the LOA is recorded ahead of time and covers the full Sun–Sat week, the timesheet is auto-handled. Partial-week LOA or after-the-fact LOA still require submission. (Ticket 140789.)
    
*   `settings_dh_log_on_absence` orphans recorded activities — when enabled, a trainee can click "log work from home" on an absence day, which leaves a recorded activity even if the absence is later cancelled/deleted. The recorded activity must be removed by the data team. (Ticket 230920, AMBS-10323.)
    
*   **Review period count vs. compliance report count** — a review period is a snapshot taken at review time. Later edits don't change the review period's totals but do change Compliance Report totals.
    
*   **Data Ticket required for batch lockout window changes** — per-program lockout window changes can be made one at a time; institution-wide updates require a Data Ticket.
    
*   **Conference attendance after submission re-flags the timesheet** — if a program records conference attendance after a trainee submits, the compliance checklist updates but the calendar color does not until the timesheet is resubmitted. (Ticket 167464.)
    
*   **Submitted timesheet locks Program Notes** — once submitted, the Program Notes field can no longer be cleared. (Ticket 167594.)
    
*   **Compliance calendar print color loss** — when the Work Hours Compliance Report is printed (via PDF or browser print), red and yellow highlighting does not display. Browser-side change in print color handling. (Tickets 184798, 196517, AMBS-7635, AMBS-8423.)
    
*   **Overlapping training history blocks timesheets** — a trainee with overlapping training history records sees timesheets as "not available." Resolve by correcting the training history overlap. (Ticket 146494.)
    
*   **UME duplicate students on Compliance Report** — students appearing in multiple courses display multiple rows on the Work Hours Compliance Report. The report is intended to be run per-course; running across multiple courses produces duplicates. Run for shorter 28-32 day periods within a single course. (Tickets 189499, 219638, AMBS-8033.)
    

## 16\. Mobile app behavior (today)

*   **Native mobile app** delivered as a thin UI over the API layer. Most logic lives on the platform side; the app calls APIs to fetch and submit data.
    
*   **Auto-save on entry** — hours entered on mobile save automatically as the trainee works (different from desktop, which requires explicit Save Incomplete).
    
*   **Submission flow** is the same as desktop — a "Submit Work Hours" action triggers the same back-end submission and the same potential-violation popup logic.
    
*   **The "incomplete" status differs in display** — desktop incomplete reads "Incomplete (saved by \[user\])"; mobile-saved reads "work hours have not been submitted." Both indicate the timesheet has not been formally submitted.
    

(See **MedHub - Mobile App** for the broader mobile gap list. Work-hours-specific gap items: gap #1 (view by current week or review period), gap #2 (potential violation popup disable), gap #5 (recorded activities information on timesheet), and gap #17 (respect List Management trainee type work-hours toggle).)

## 17\. UME-specific differences (consolidated)

For quick reference, the places where UME diverges from GME:

Area

GME

UME

Configuration

Institutional Settings + Program List + Program Settings

School Settings only (Course Settings not in play)

Reason list customization UI

Available in List Management

UI excludes the school program from the dropdown (AMBS-11339)

Late submission email

Yes (after first submission)

Urgent Task only (no email) — AMBS-9209

Incomplete Work Hours Urgent Task trigger

After first submission

Always (no first-submission prerequisite) — AMBS-8953

Late submission email day

Configurable via `setting_dh_admin_alert`

Same setting

Potential Violation alert recipients

Per-program; PD/admins

School-wide via "Potential Violation Alert Recipients" (Spring 2024)

Compliance Report behavior

Per-program

Reports across all student courses; running across multi-course periods produces duplicates (AMBS-8033)

Duty Hour Alerts (legacy)

Inadvertent global setting being removed (AMBS-9326)

n/a

`settings_students_dh`

n/a

Master switch for UME work hours

Lockout config URL

Standard root navigation

URL-pattern access via `programs_modules.mh?programID=1`

## 18\. Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Whether **Home Call (called in) now counts toward 24+4** based on recent ACGME consultation. The doc says this is "evolving" — confirm current state in production.
    
*   `[VERIFY]` Whether the "Two 24+4 violations on the same day" behavior (AMBS-5075) has been addressed or remains.
    
*   `[VERIFY]` Whether the **AMBS-10048 / MPP-101 Saturday-with-no-hours** behavior has been redesigned or is still as-designed.
    
*   `[VERIFY]` Whether the **email lockout verbiage** has been updated to respect multi-week access windows (Ticket 210459).
    
*   `[VERIFY]` Whether the **inadvertent global "Duty Hour Alerts" GME setting** has been removed from Institution Settings UI (AMBS-9326).
    
*   `[VERIFY]` Confirm `cron_global_timesheets_auto` is still scheduled `01 23 * * 6` (Saturday 23:01).
    
*   `[VERIFY]` Confirm UME "Potential Violation Alert Recipients" Spring 2024 feature is in production at all UME clients.
    
*   `[VERIFY]` Whether the **Work Hours Compliance Report print color fix** (AMBS-7635, AMBS-8423) has shipped.
    
*   `[VERIFY]` Whether **"Standard Service Hours" appearing in the Work Hours dropdown but not factoring into days-off calculation** (Ticket 231921) is being addressed in the Analytics work hours report rebuild.
    

## 19\. Database tables appendix

Table

Purpose

`sh_timesheets`

Daily timesheet entries — one row per trainee per day with Standard, Home Call (called in), Clinical Work from Home, and Moonlighting hours.

`ref_timesheets_periods`

Work Hour Review Periods — start/end dates, status (Pending/Reviewed/Partially Reviewed), alert dates.

`ref_timesheets_periods_residents`

Per-trainee row within a review period for tracking violations and PD review status.

`ref_timesheets_periods_comments`

PD review comments (per-violation Review Comments and Additional Comments).

`dh_unlock`

Trainee work hour unlock requests/grants.

`audit_dh`

Work hours audit trail — who submitted/edited a timesheet and when. Drives the "Duty Hours Submitted" Audit Trail Query.

`users_residents_pg`

Training history — drives PGY level lookup for week-level violation evaluation.

`sh_tracks_slots`

Service assignments — drives Recorded Activities and pre-population.

`sh_clinics`

Clinic assignments — drives clinic Recorded Activities and pre-population.

## Source material

This document is consolidated from:

*   Emma's consolidated work hours current-state document (the technical spike + FAQ synthesis).
    
*   Confluence: Work Hours FAQs (page 47416222) — institutional Q&A and ticket history accumulated since 2018.
    
*   Confluence: Work Hour Reports FAQs (page 47416372) — report-layer Q&A.
    
*   Confluence: Work Hours Root Settings (page 47425423) — settings reference.
    
*   Internal reference doc on the 24+4 calculation logic (Work Hours spike consolidation).
    
*   Ben's spike for the configurable start of week initiative (MED-565), capturing technical structure of timesheet, alert, and review period code paths.
    
*   Active Jira tickets: MED-565, MED-595, MED-809, MED-859, MED-184, MEDM-10643, MEDM-10662, MEDM-10817, MEDM-10914, MEDM-10938, AMBS-5075, AMBS-5644, AMBS-7635, AMBS-8033, AMBS-8423, AMBS-8503, AMBS-8688, AMBS-8730, AMBS-8786, AMBS-8908, AMBS-8953, AMBS-8997, AMBS-9022, AMBS-9108, AMBS-9174, AMBS-9209, AMBS-9326, AMBS-9510, AMBS-9665, AMBS-9841, AMBS-10048, AMBS-10321, AMBS-10323, AMBS-11339, AMBS-11843, MPP-101.
    
*   ACGME Common Program Requirements interpretations, where mentioned by support staff in tickets.
    
*   NYS 405 regulation interpretations, where mentioned in tickets and FAQs.

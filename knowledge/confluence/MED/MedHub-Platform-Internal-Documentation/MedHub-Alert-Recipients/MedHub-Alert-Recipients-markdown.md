# MedHub - Alert Recipients - markdown

# MedHub - Alert Recipients

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Alert Recipients is the configuration surface that controls **who receives notifications and at what cadence** across MedHub. Notifications come in two forms — **Email** alerts (sent to a user's institutional inbox) and **Portal** alerts (Urgent Tasks displayed on the user's MedHub home page). Most notifications are tied to a specific user role (Trainee, Faculty, Program Administrator, GME Office, Finance, etc.) by default, but several can be configured per-institution to add or change recipients.

This document is the canonical reference for **what notification goes to whom, when, and how**. It captures every notification MedHub generates, the recipient roles by default, the delivery cadence, the configuration path, and the operational patterns that come up when notifications appear to be misrouted.

It does not cover: notification _content_ configuration (per-feature template editing — see the relevant feature doc, e.g. **MedHub - Onboarding** for application reminder template variables); the alerts cron job mechanics (see **MedHub - Background Processes**); or specific evaluator alert configuration like Low Score Notifications (see **MedHub - Evaluations - GME** when drafted).

## Where it lives

Institutional alert recipients are configured at:

> **GME Office Home → Institutional Functions → Institutional Settings → Alerts → Institutional Alerts**

Inside the Institutional Alerts panel, each alert type (e.g., "Resident Status Updates," "Verification Requests," "Resident Applications") has its own Primary and (where supported) Secondary recipient configuration. Some alerts also support adding multiple GME Office staff members or designated alternate emails.

Program-level alerts (those that go to the Primary or Backup Administrator) are determined by Program Settings, not Institutional Alerts. The Primary Administrator is set in the Program List → individual program → Program Contacts tab.

Some alerts are gated by **root settings** that must be enabled before the alert is generated at all (e.g., GMEC Meeting Reminder requires `setting_gmec_committee_reminder`). Those gating settings are noted in the comprehensive table below.

## How the alerts cron works

Notification delivery is driven by a nightly cron job:

> **Deliver Email Alerts** — runs daily at **3:05 a.m. Eastern Time**.

This is the single cron job that processes nearly all of MedHub's email alerts. The cron iterates the queued alerts, evaluates the recipient configuration, and sends emails to the matching users.

A few specifics to know:

*   **Most "immediate" alerts are still queued** — they're flagged for immediate delivery in the queue, but actual sending happens at the next cron pass.
    
*   **Daily digests** (e.g., Demographic Expiration, Curriculum Notification) compile their content during the cron pass and send as a single email.
    
*   **Weekly emails** (e.g., Late Work Hours, Late Evaluations) check day-of-week before sending; some are hardcoded to specific days (Monday for Late Work Hours, Tuesday for Late Evaluations).
    
*   **Mobile push notifications** are delivered by a separate cron — **Deliver Mobile Application Notifications** — running at multiple times per day.
    

Failures or delays in the cron mean alerts may not arrive on time. **If a client reports missing alerts after a recent cron failure**, the alerts may need to be re-queued by Tier 2 / Data team.

## Comprehensive alert reference table

The table below is the canonical reference for every notification MedHub generates, drawn from the long-standing internal SKU. Each row captures: notification name, type (Email or Portal), default recipient role(s), the definition of when it fires, and frequency.

> **Y** = the role receives this notification by default. **Y\\**\* = conditional (see the Definition column for the condition).

Notification

Type

GME / Dean's

Finance

Primary Admin

Backup Admin

PD

Assoc PD

Faculty

Trainee / Alumni

Other

Definition

Frequency

Absence Approval

Portal

Y

A trainee has requested absence for vacation or away conference.

Absence Request Approved

Email

Y

Delivered when an absence request is given final approval (Program Setting).

Immediate

Absence Request Rejected

Email

Y

Delivered when an absence request has been rejected.

Immediate

Absence Requests

Portal

Y

Y

Pending absence requests with no other approver.

Absence Approval Request

Email

Y\\\*

Y\\\*

Y\\\*

\\\*Only sent to a Faculty member (Program Director or Service Head), or to a Chief Resident, **if** they are selected as a middle step in the Absence Approval Workflow for the program. The email is **not** sent to Administrators to request absence approval.

Conditional

ACLS / BLS Expiration

Email

Y

List of trainees with upcoming ACLS or BLS expirations.

Daily

Alumni - Exit Checklist for Approval

Portal

Y

Exit checklist ready for approval (Alumni functionality). Subject: "MedHub - Exit Checklist for Approval"

Alumni - Exit Checklist for Approval

Portal

Y

Exit checklist ready for approval — only if PD is configured as approver.

Alumni Survey

Email

Y

Delivered with a unique link on Alumni Survey delivery.

Immediate

Applicant Document Submission Report

Email

Y

Daily summary of documents submitted by resident applicants in the Onboarding portal.

Daily

Asynchronous Conference Credit Rejection

Email

Y

Delivered when a request for asynchronous credit is rejected.

Immediate

Certificate Pending Approval

Portal

Y

A training certificate is pending approval (if enabled).

Certificate Approval Required

Email

Y

Delivered to certificate signer if a certificate approval process is used.

Immediate

Conference Details Updated

Email

Y

Sent to all potential attendees on date or location change.

Immediate

Conference Details Updated

Email

Y

Sent to all potential attendees on date or location change.

Immediate

Conference Presenter Notification

Email

Y

Reminder to presenter of upcoming conference.

Daily

Conference Presenter Notification

Email

Y

Reminder to presenter (when the presenter is a Trainee).

Daily

Contract Ready for Approval

Portal

Y

Contract signed by all parties and ready for final approval.

Curriculum Notification

Email

Y

Delivered prior to starting a new Service. Number of days before based on Program Setting (Schedules subtab). See **MedHub - Curriculum Goals & Objectives**.

Daily

Cut-off Notification

Email

Y

Delivered prior to a schedule lock.

Daily

Demographic Expiration

Email

Y

Y

Y

Y

Upcoming expiration of license, certification, etc. (customizable).

Daily

Demographic Expiration

Portal

Y

Y

Y

Y

Upcoming expiration of license, certification, etc. (customizable).

Evaluation Removed

Email

Y

Delivered when an evaluation is removed for insufficient contact.

Immediate

Evaluation Reset

Email

Y

Y

Delivered when a completed evaluation is set back to "Partially Complete."

Immediate

Exit Checklist Available

Email

Y

Delivered on Exit Checklist delivery.

Immediate

Exit Checklist for Program Responses

Email

Y

Delivered on Exit Checklist completion.

Immediate

Exit Checklist Returned

Email

Y

Delivered if Exit Checklist is returned to the trainee.

Immediate

Expired site contract

Email

Y

A Site Contract just expired.

Daily

Expiring Medical License

Email

Y

Y

List of trainees with expiring medical licenses.

Daily

Expiring Site Contracts

Email

Y

Y

Y

A program-specific Site Contract is approaching expiration. Subject: "MedHub - Site Contract Expiration."

Daily

Expiring Site Contracts

Portal

Y

Y

Y

A program-specific Site Contract is approaching expiration.

Expiring VISA

Email

Y

Y

List of trainees with expiring VISA.

Daily

Faculty Service Notification (aka "Email Faculty on Incoming Resident(s)" / MedHub - Rotating Residents)

Email

Y

Enabled per Service Group via **Service/Shift Management → Service Groups → Email Faculty on Incoming Resident(s)**. Once enabled, page expands to select recipients (Service Heads, faculty with individually scheduled assignments, faculty with permanent assignments, or specific email addresses) and delivery timeframe. Curriculum Goals/Objectives can also be sent within this email.

Daily

GMEC Meeting Reminder

Email

Y (GMEC member)

Notification of an upcoming GMEC meeting. **Requires** `setting_gmec_committee_reminder` enabled. Then GME sees the option in Institutional Settings.

Daily

Inactive User List

Email

Y

Coordinators and GME accounts that have not logged in (last 30 days).

Monthly

Incomplete Evaluation

Portal

Y

Y

Displays count of incomplete evaluations.

Incomplete Exit Checklist

Portal

Y

(Alumni functionality.)

IRIS Data Set Generated

Email

Y

Delivered upon generation of an IRIS data set.

Immediate

Late Work Hours

Email

Y

Delivered **once per week on Monday morning**. Recipient is the Trainee. Day not customizable. Sent if the trainee (1) submitted at least one timesheet in the past, AND (2) has not yet submitted the previous week's (Sunday-Saturday) timesheet when the new week begins. **Not sent to Students with late timesheets** (Ticket 210749, AMBS-9209).

Weekly

Optional Late Work Hours

Email

Y

Y

Controlled by `setting_dh_admin_alert`. List of trainees who haven't submitted last week's timesheet, plus those non-compliant or not submitted (if non-compliance > 10% or incomplete > 30%). Recipients are Primary Admin and Backup Admin (Primary).

Weekly (specified day)

Late Evaluations

Email

Y

Y

Delivered **once per week on Tuesday morning**.

Weekly

Late Incomplete Evaluation

Portal

Y

Y

Displays count of late evaluations.

Late Procedure Verification

Email

Y

Delivered **once per week on Mondays**.

Weekly

MedHub Community Reply

Portal

Y

Y

A watched thread in the MedHub Community has been updated.

MedHub Login Information

Email

Y

Y

Y

Y

Y

Y

Y

Initial account email; contains username and temporary password (new user).

Immediate

MedHub Login Reset

Email

Y

Y

Y

Y

Y

Y

Y

Reset link for active accounts.

Immediate

Mentor Evaluation Alert

Email

Y

Y

Y

Low score alert.

Immediate

Message from a Resident Applicant

Email

Y

Y

Feedback from an incoming trainee in the Onboarding Portal.

Immediate

Missing Required Demographic Fields

Email

Y

List of trainees with missing required demographic fields. **To disable**, send request to Tier 2. **AMBS-8510**: alert is from `cron_global_alerts`; it does NOT obey the demographic-fields-required setting or `demo_resident_newA` — it runs the check regardless. Has worked this way since at least 2013.

Weekly (if 30 days or fewer to Projected Start Date)

Moonlighting Rejected

Email

Y

Delivered on rejection of moonlighting.

Immediate

New Affiliate Request

Portal

Y

New request from an Affiliate.

New conference materials available

Email

Y

Y

Delivered when conference materials uploaded (optional).

Immediate

New Work Hour Review

Portal

Y

Y

A new Work Hour Review period is available for review.

New Work Hour Review

Email

Y

A new Work Hour Review period is available for review.

New Evaluation

Email

Y

Y

One or more evaluations were delivered.

Immediate

New Learning Module

Email

Y

Y

Delivered with a new Learning Module.

Immediate

New Learning Module

Portal

Y

Y

A new Learning Module has been assigned.

New Mentor Evaluation

Portal

Y

A new evaluation has been completed on a Mentee.

New Message Posted

Email

Y

Y

Y

Y

Y

Delivered on new Message posting; includes content of message.

Immediate

New Moonlighting Request

Email

Y

Delivered to approver.

Immediate

New Moonlighting Request

Portal

Y

Y

A resident has requested approval for Moonlighting (if enabled).

New Procedure Verification

Email

Y

Y (Trainee Px supervisor)

Delivered no more than once per day.

Daily

New Procedure Verification

Portal

Y

Y (Trainee Px supervisor)

Displays count of pending verification requests.

New Resident Dashboard Report

Email

Y

Y

Y

Resident Dashboard documents are available (documents included).

Daily

New RIS Request

Email

Y

New request to identify supervisors (if enabled).

Daily

Late RIS Request (Optional)

Email

Y

Subject: "MedHub - Late Request to Identify Supervisors." Deploys weekly after original RIS request delivery + number of days specified in 'Send Late Alert (Weekly):' setting on Evaluations → Residents Identify Supervisors → Settings/Services subtab.

Weekly after specified offset

New Schedule Unlock

Email

Y

Delivered when an unlock is issued.

Immediate

New Site Added

Email

Y

Delivered when a new Site is added by GME (optional).

Immediate

New Site Requested

Email

Y

Delivered to GME when a program initiates a request for a new Site. Configured via Institutional Alerts → "New Site Requested."

Immediate

New Activities - Site Required

Portal

Y (Super Admin)

At an institution with **Site Locking** enabled (`setting_sitelock`), regular Administrators cannot set the site on Services they create. When a regular Admin creates a new Service, this alert shows in Urgent Tasks for any Super Admin to add the Site. (Ticket 122630, AMBS-2846.) Note: this is asking the Super Admin to assign a site to a Service, not to define a new site in Sites/Billing.

Immediate

New Termination/Graduation Request

Email

Y

Delivered when Program Coordinator uses the Termination Wizard. **Termination Type marked as Completion Event** (controlled by AMBS-10599).

Immediate

New Termination Request

Email

Y

Delivered when Program Coordinator uses the Termination Wizard. **Termination Type NOT marked as Completion Event** (AMBS-10599).

Immediate

New Test

Email

Y

Y

Delivered with a new Test.

Immediate

New Test

Portal

Y

Y

A new test has been assigned.

New Verification Request

Portal

Y

Y

New request for trainee verification (if enabled). See **MedHub - Verification Requests**.

Non-compliant work hours submitted

Email

Y

Y

Y

Y

Potential work hours violation. Enabled in Program Settings — allows client to enable/disable for Admins, PDs, and APDs. **Note:** UME non-compliant hours email notifications are determined by Program Settings in GME.

Immediate

Onboarding - New Application Package

Email

Y

Delivered when a new package is first delivered.

Immediate

Onboarding Document Review

Portal

Y

A document is ready for review and approval (if enabled).

Onboarding Documents Due

Portal

Y

Unsubmitted documents within an Application Package.

Pending Asynchronous Conference Credit

Portal

Y

A resident has requested asynchronous conference credit (if enabled).

Pending Termination

Portal

Y

A program-submitted Termination is awaiting approval.

Performance Evaluation Available

Email

Y

Delivered when a trainee receives a new performance evaluation.

Immediate

Program Director Change

Email

Y

Delivered to Primary GME user when a director is changed.

Immediate

Released Resident (unscheduled)

Portal

Y

Released residents are ready to be scheduled.

Relock Notification

Email

Y

Y

Sent one day before schedule locks following an unlock.

Daily

Resident Eligible for Procedure Certification

Email

Y

Delivered to PD or mentors when a procedure reaches the certification threshold.

Immediate

Resident has updated contact information

Email

Y

Delivered if Trainee is permitted to update contact info.

Immediate

Resident Release Notification

Email

Y

Delivered when a resident is given a General Release to another program.

Immediate

Resident Status Update

Email

Y

Changes to trainee status. See **MedHub - Training History** §"The Resident Status Update script."

Daily

RIS Request

Portal

Y

New request to identify supervisors (if enabled).

Termination Request Rejected

Email

Y

Delivered when a Termination Request is rejected by GME. **Per T2: this is part of the main alerts cron and cannot be disabled.** (CL 7/9/2021.)

Immediate

Trainee Application/Onboarding Reminder

Email

Y

Weekly or daily reminder for incoming trainees until all documents are complete. See **MedHub - Onboarding** for cadence configuration.

Weekly / Daily

Trainee Applications Changes

Email

Y

Daily digest of changes to Onboarding.

Daily

Unreviewed Performance Evaluation

Portal

Y

A new performance evaluation is ready for review.

Unsigned Contract

Email

Y

Y

Y

A trainee contract is ready for electronic signature (if enabled). See **MedHub - Contracts**.

Daily 3:00–4:00 a.m.

Unsigned Contract

Portal

Y

Y

Y

A trainee contract is ready for electronic signature (if enabled).

Unsubmitted Work Hours

Portal

Y

Work hours not submitted (prior week).

Unverified Trainee

Email

Y

Y

List of unverified trainees. **Tier 2 can disable via cron** (BG 6/4/2021).

Weekly

Unverified Trainee

Portal

Y

Y

Unverified trainees near the start of training. **Support can disable via root settings** (see Resident/Student Demographics FAQ for Ticket 172043).

Work Hour Sampling Period started

Email

Y

Trainee is alerted that a work hour sampling period has started, directed to submit a timesheet for each week, and informed of the sampling period dates.

First day of sampling period

Verify LOA

Portal

Y

LOA approved by program is awaiting GME approval.

Verify LOA

Email

Y

LOA approved by program is awaiting GME approval.

Immediate

Schedule Workflow Lock out Notification

Email

Y

**Must be disabled via the Cron.**

Monthly

## Configuration paths by alert type

Most alerts are configured in one of three places:

### Path 1: Institutional Alerts (Institutional Settings)

> **GME Office Home → Institutional Functions → Institutional Settings → Alerts → Institutional Alerts**

These alerts have configurable Primary and (optionally) Secondary recipients. The list visible here varies by client (some alerts are gated by root settings or client-specific feature flags). The most-configured alerts in this surface:

*   Resident Status Updates (controls who gets the daily Resident Status Update email)
    
*   Verification Requests (Verification Requests SKU — Primary + Secondary)
    
*   Resident Applications (Onboarding submission alerts)
    
*   New Site Requested
    
*   Pending Termination (LOA, Termination)
    
*   Trainee Applications Changes
    
*   Expiring Medical License / VISA / Site Contract
    
*   Custom and program-specific alerts as enabled
    

### Path 2: Program Settings

Per-program alert configuration lives in:

> **Program List → individual program → Program Settings → Alerts subtab**

OR per-feature within Program Settings (e.g., Conferences, Schedules, Work Hours). The settings that affect alert delivery from a program:

*   **Faculty Conference Attendance** — affects who appears on conference attendance sheets and who receives conference notifications
    
*   **Email Faculty on Incoming Resident(s)** — Service Group level; configures the Faculty Service Notification email recipients per service group
    
*   **Pre-populate Conference Attendance (Work Hours)** — affects auto-population
    
*   **Late Work Hours Admin Alerts** — `setting_dh_admin_alert` controls "Optional Late Work Hours" delivery to Primary Admin
    
*   **Non-compliant work hours** — Program Settings allows enable/disable for Admin, PD, APD recipients
    

### Path 3: Per-feature notification recipient configuration

Some features have their own notification recipient lists separate from Institutional Alerts:

*   **Service Group → Email Faculty on Incoming Resident(s)** — service group level (see above)
    
*   **Evaluations → Residents Identify Supervisors → Settings/Services subtab** — controls RIS Late Alert offset
    
*   **Conferences → Custom Alerts area** — institution-specific custom conference alerts
    

### Path 4: Root-level settings that gate alerts

Several alerts are entirely **off** until a root setting enables them:

*   `setting_gmec_committee_reminder` — gates GMEC Meeting Reminder
    
*   `setting_dh_admin_alert` — gates Optional Late Work Hours email
    
*   `settings_visitors_method` — affects visiting trainee alert routing
    
*   `setting_sitelock` — gates the New Activities - Site Required portal alert
    
*   `setting_verify` and `setting_verify_programs` — gate Verification Request alerts
    

## Common scenarios

### "We don't want the Late Work Hours email to go out"

The Late Work Hours email is **per-trainee** and goes to the trainee themselves, not to admins. It runs every Monday morning. The day-of-week is hardcoded — not customizable. If the email is producing complaints from trainees, the only options are:

*   Disable Work Hours entirely for the program (extreme).
    
*   Have each trainee submit timesheets every week (eliminating the trigger condition).
    

The **Optional Late Work Hours** email is a different alert that goes to Primary Admin and Backup Admin — that one IS gated by `setting_dh_admin_alert`. Disable that setting to remove the admin-facing version while keeping the trainee-facing one.

### "My GME Office isn't getting Resident Status Update emails"

Check:

1.  **Institutional Settings → Alerts → Resident Status Updates** — confirm GME staff is listed as Primary and/or Secondary recipient.
    
2.  The user's email address is correct in their GME profile.
    
3.  The user account has not been deactivated.
    
4.  The cron has run (not delayed).
    

### "Some staff aren't getting alerts they should be"

The most common cause: **email separator format** in their email field. MedHub requires **commas** between multiple email addresses, NOT semicolons. (See **MedHub - Demographics — Faculty** §"Common scenarios" — Ticket 135310.) Update to commas; cron will pick up correctly on next pass.

### "The Termination Request Rejected email keeps going to Program Admins and they don't want it"

By design and **cannot be disabled** — it's part of the main alerts cron. (Per T2, Ticket 168536, CL 7/9/2021.) The Program Admin who ran the wizard is informed when GME rejects.

### "The Missing Required Demographic Fields email runs even when we disabled Required Fields"

Known behavior since at least 2013. The alert is from `cron_global_alerts` and does not obey the Required Fields setting or `demo_resident_newA`. It runs the check regardless. **To disable**, request via Tier 2 to disable the cron job for this institution. (AMBS-8510.)

### "We added a new Faculty member to GMEC but they aren't getting GMEC Meeting Reminder emails"

Two checks:

1.  `setting_gmec_committee_reminder` is enabled.
    
2.  The Faculty member is added to the GMEC committee in **Institutional Settings → GMEC** (or equivalent location for the institution).
    

The GMEC roster, not the alert recipients list, drives delivery for this notification.

### "Mobile push notifications aren't arriving"

Mobile push is a separate cron from email. Check:

*   User has the iOS Mobile App installed and is logged in.
    
*   Push notifications enabled in app preferences.
    
*   The "Deliver Mobile Application Notifications" cron has run.
    

(See **MedHub - Mobile App** when drafted.)

### "We want Faculty to get notified about specific incoming residents to their service"

Configure **Service/Shift Management → Service Groups → Email Faculty on Incoming Resident(s)** — see the Faculty Service Notification row in the table above. The alert is the "MedHub - Rotating Residents" email, with curriculum link inclusion if Curriculum Goals/Objectives is configured. (See **MedHub - Curriculum Goals & Objectives**.)

### "An alert is going to too many people / we want to remove a recipient"

Most institutional alerts support adjusting recipients in Institutional Settings → Alerts → Institutional Alerts. For program-level alerts, adjust Program Settings or remove the user from the Primary / Backup Administrator role. Some alerts (like Termination Request Rejected) cannot be reconfigured.

### "We disabled Verification Requests — why are admins still getting alerts?"

Disabling `setting_verify` removes pending requests **but the alert is queued for any in-flight notifications.** Once the cron runs and the queue is processed, alerts stop. (See **MedHub - Verification Requests** §"What happens when the public request form is disabled" — Ticket 198699.)

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Whether any new alerts have been added since the SKU's last update. The reference table above is comprehensive as of the SKU; new alerts may have been introduced for recent features (e.g., AI-assisted Curriculum Mapping, new Work Hours modes).
    
*   `[VERIFY]` `setting_dh_admin_alert` configuration — confirm current default and whether the day-of-week for delivery has changed.
    
*   `[VERIFY]` Whether any "Termination Request Rejected" disable mechanism has been added since the 2021 confirmation that it cannot be disabled.
    
*   `[VERIFY]` Confirm the alert table is still accurate for the four currently-open Ad-Hoc Resident Demographics report bugs (AMBS-21778, etc.). Some of those bugs may have alerting implications.
    
*   `[VERIFY]` Whether the Mobile App now generates push notifications for additional alert types beyond what's currently in the Mobile Application Notifications cron.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_gmec_committee_reminder`

Gates GMEC Meeting Reminder notifications. Default off; enable to allow GMEC reminders.

`setting_dh_admin_alert`

Controls "Optional Late Work Hours" admin-facing email. Default determines whether the email fires; week-day timing is configured separately.

`setting_sitelock`

Gates the "New Activities - Site Required" Super Admin Portal alert.

`setting_verify`

Gates institutional Verification Request alerts.

`setting_verify_programs`

Gates program-level Verification Request alerts.

`cron_global_alerts`

Master cron job for global alerts including Missing Required Demographic Fields. **Tier 2 must disable per-institution to suppress** (AMBS-8510).

Institutional alert recipient lists (configured under **GME Office → Institutional Functions → Institutional Settings → Alerts → Institutional Alerts**):

*   Resident Status Updates
    
*   Verification Requests (Primary + Secondary)
    
*   Resident Applications
    
*   New Site Requested
    
*   Pending Termination
    
*   Trainee Applications Changes
    
*   Expiring Medical License / VISA / Site Contract
    
*   Plus other client-specific alerts as enabled
    

Per-program alert recipients (configured in Program Settings → Alerts):

*   Primary Administrator (drives many trainee-related alerts)
    
*   Backup Administrator (drives "Optional Late Work Hours" and certain absence alerts)
    

Per-service-group alert recipients (configured in Service/Shift Management → Service Groups):

*   Email Faculty on Incoming Resident(s) — selectable recipient categories per service group
    

## Database tables appendix

Table

Purpose

`alerts_queue`

Pending alert records waiting for the next cron pass to deliver.

`alerts_subscriptions`

Per-user alert subscription preferences (where applicable).

`alerts_recipients_institutional`

Institutional alert recipient configuration (Primary/Secondary per alert type).

`alerts_recipients_program`

Program-level alert recipient flags.

`alerts_log`

Audit of delivered alerts (per-recipient, per-alert, timestamp).

`alerts_failed`

Audit of failed deliveries — useful when troubleshooting "alert never arrived" tickets.

`cron_jobs_log`

Cron execution audit including the alerts cron. Useful for confirming the alerts cron ran on a specific date.

`users_residents` / `users_faculty` / `users_gme_staff`

User profile tables — source of email addresses for delivery.

`program_settings_alerts`

Per-program alert configuration.

`setting_value_overrides`

Root-level overrides to default alert behavior.

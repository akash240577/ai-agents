# MedHub - Mobile App - markdown

# MedHub - Mobile App

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The MedHub Mobile App is the iOS and Android version of MedHub for **end users only** — Residents, Fellows, Faculty, and Medical Students. **Administrators (Program Admin, GME Office, Student Admin, Course Coordinator) cannot use the mobile app.** They use the full website.

The Mobile App is intentionally a subset of the full website. It covers the most common end-user workflows — viewing the calendar, completing evaluations, submitting work hours, logging procedures, viewing conferences, reading messages — and omits many administrative or low-frequency features. The MedHub Mobile App Gaps spreadsheet (PM Sharepoint > documents > Mobile > MedHub Mobile Gaps) is the live tracker of unimplemented features; this document captures the canonical list as of 9/19/2022 plus tickets since, with annotations for items resolved as of the iOS 3.0.4 release (4/27/2026).

This document covers: who can use the app, the major workflows it supports, the gap list (what's missing vs. the full website), the settings-sync-on-login mechanic that explains why some settings changes don't take effect immediately on the app, push notifications, the inactivity-based session timeout (which is also the force-logout mechanism), and operational scenarios that come up in support tickets.

It does not cover: app architecture (covered in **MedHub - Mobile App architecture** when that exists for development reference); app store deployment; or the QR Code deep-linking work currently in flight (MED-672 / MED-715 — see "QR Code Integration in flight" below).

## Who can use the app

User type

Mobile App

Resident

✅ Yes

Fellow (uses Resident user type)

✅ Yes

Faculty

✅ Yes

Medical Student

✅ Yes

Program Administrator

❌ No

GME Office

❌ No

Student Administrator

❌ No

Course Coordinator

❌ No

Hospital Finance

❌ No

IT, Paging

❌ No

> **Administrators see "the mobile app is only for residents, faculty, and students"** when they attempt to log in. This is by design — the app's data model is end-user-centric. (Ticket 197237, ELD 5/19/2022.)

For Mentors who are also Faculty, the app works as Faculty-only — Mentor-specific views (mentee dashboards, mentor evaluations) are accessible through their Faculty experience.

## Where it lives

*   **iOS**: download from the Apple App Store. Search for "MedHub."
    
*   **Android**: download from Google Play Store. Search for "MedHub."
    

After install, the user selects their **institution** from a list (e.g., "Duke University," "Loma Linda," "MUSC - Charleston"). The institution dropdown is sourced from the production site name on MedHub's internal Sites page — when that name changes, the mobile app dropdown updates automatically. (Ticket 236065, AMBS-11159.)

The login screen then offers two methods, depending on whether the institution has SAML SSO configured:

*   **Institution Login (SSO)** — appears above the MedHub Login if the institution has a SAML link configured. Authenticates using the user's institutional credentials.
    
*   **MedHub Login** — uses MedHub username and password.
    

### Verifying SSO availability for the mobile app (CSC reference)

To confirm SSO works on the mobile app for a given institution:

1.  Go to **MedHub Support → Sites → \[select client production link from the first column\] → SAML Link field**.
    
2.  If a link is in the field, SSO works on the mobile app.
    
3.  If blank, SSO is NOT yet configured for the mobile app — it must be added (right-click the SSO link on the institution's login page, copy link, paste into the SAML Link field on the Sites page).
    

(Confirmed TM. See **MedHub - Login & Authentication** §"SAML Self-Serve" when drafted.)

## Major workflows

### What works on the app

*   **Calendar** — view personal calendar (rotations, shifts/calls, clinics, conferences, events, absences, and UME course sessions).
    
*   **Evaluations** — view pending evaluations, complete and submit. View evaluation history.
    
*   **Self-initiated evaluations** — start a Faculty/Resident-initiated evaluation. Subject to gap #14 (Off-program/Outside Evaluators added in iOS 8/16/2022) and gap #21 (released residents not selectable as targets).
    
*   **Work Hours / Timesheets** — submit timesheets. Push notifications for late timesheets. **As of iOS 3.0.4 (4/27/2026)**, residents can now consistently view and submit all weeks of timesheets their program has unlocked (MAPS-9374) — addressing gap #1.
    
*   **Procedures** — log new procedures. View procedure history (last 365 days).
    
*   **Conferences** — view conference attendance, mark attendance (when Trainee Attendance is enabled).
    
*   **Messages** — view and reply to MedHub Messages.
    
*   **Resources** (As of January 2024) — More → Resources includes URLs, PDFs, DOCs, and Curriculum Objectives. **Recently Viewed** shows the last **30** resources viewed.
    
*   **Profile and password reset.**
    

### What doesn't work on the app — the gap list

The canonical gap list as of 9/19/2022 (per Ticket 145199, last updated by Emma 9/19/2022). **Items annotated as resolved have shipped per release notes verified through the iOS 3.0.4 (4/27/2026) release.** Items without resolution annotations remain open or have unconfirmed status — verify against the live PM Sharepoint spreadsheet for current state.

#

Gap

Status

1

Ability to view timesheet by current week or by work hour review period (calendar and checklist)

**Resolved in iOS 3.0.4** — MAPS-9374 lets residents view all unlocked weeks

2

Mobile app to respect the new ability to disable work hour potential violation pop-up

Open

3

Ability to see evaluation expiration dates

Open

4

Ability to see all clinic hours on calendar

Open

5

Timesheet to bring in recorded activities information

Open

6

Ability for faculty to see evaluation reports

Open

7

Ability to pull in custom procedure fields

Open

8

Ability to respect procedure supervisor settings — including certification window not opening upon verification of last procedure

Open

9

Extend available procedure log dates (allow logging further back)

Open

10

Ability to view procedure requirements

Open

11

Add "finish later" option for evaluations

**Effectively resolved** — backing out of an evaluation auto-saves; no explicit Save Later button (see "Evaluation completion — no Save Later button" below)

12

Ability to view evaluation attachments

Open

13

Ability to choose whether to submit a self-initiated evaluation as anonymous when "user can choose to submit anonymously" is configured

Open

14

Extend evaluation target list to include off program and outside evaluators

**Resolved 8/16/2022 in iOS**

15

Ability for resident to verify procedure through an evaluation (Android only)

Open

16

Respect course/program setting to disable insufficient contact links / Respect evaluation delivery option to disable insufficient contact link

Open

17

Respect root-side List Management options for trainee types

Open

18

Respect root-side evaluation scale configuration ("Hide option titles") / Ability to hide scale values

Open

19

Click Zoom links loaded as conference materials

Open

20

When a resident is on an overnight shift/call, the calendar shows the shift on both days

Open

21

When a Faculty member self-initiates a form about a resident **released to your program**, the released resident does NOT appear as a target option on the mobile app

Open (Ticket 157426, AMBS-5662)

22

A resident's approved absence is not visible on the app calendar 2+ months out

Open

23

Submit evaluation where skip logic is enabled for a question that is also required

**Resolved in iOS 3.0.4** — MAPS-9186/9187 fix conditional display + required attribute handling for skip logic

24

UME question mapping — the leader can't see contributor answers on the app

Open

25

RIS (Resident Identifies Supervisors) and SIS (Student Identifies Supervisors) requests not available

Open

26

When Course Setting "Disable Insufficient Contacts link" is enabled, students can still remove evaluations via iOS

Open (Ticket 143135)

27

Procedure Verification not respected when disabled per-Procedure-Type vs. globally

Open (Ticket 165491) — see "Procedure Verification gap" below

28

Record attendance for a conference when "Attendance Tracked by Residents" program setting is enabled

Open

29

Option / header descriptions for scale display when "hide option titles" is configured

Open (Ticket 183788)

30

PGY level on evaluations (pending and history) when target is a resident; Year on evaluations when target is a student

Open

31

Cross site linking does not work on either mobile app when configured on the client site

Open

32

When a program has residents log procedures directly into ACGME, the mobile app continues to allow procedure logging

Open — programs need to communicate "do not use mobile app for procedure logging"

### Procedure Verification gap (Ticket 165491) — extra detail

This one needs explanation because it's not just "missing functionality" — it's a settings-sync issue with real data consequences.

**Setup**: A program has Procedure Verifications enabled in Program Settings ("Enable procedure verifications" + verify boxes next to roles). They later decide to disable Procedure Verification, so they deselect "Enable procedure verification" and the verify boxes.

**What happens on the full website**: works correctly. No more verification required.

**What happens on the mobile app**: the app continues to look at the **per-Procedure-Type "Verify Procedure" field** (which is now hidden in the UI but not actually disabled). Procedures logged on the mobile app continue to flag with `pending` verification status.

**Where the pending status shows**: NOT on the full website (the field is hidden). Only visible to the trainee under Procedure History on the mobile app.

**Impact**: The 'percentage' column in mentors' procedure requirements view is affected. Reports dealing with requirements likely also affected (pending procedures don't count toward requirements).

**Fix sequence**:

1.  Temporarily re-enable procedure verifications in Program Settings.
    
2.  Open every Procedure Type and deselect "Verify Procedure."
    
3.  Disable verifications again in Program Settings.
    
4.  Ask Jordan (data team) to remove the verification status from any 'pending' logs for that program.
    

(Ticket 165491, ES 2/25/2021.)

## Why some settings changes don't take effect on the app immediately

> **The mobile app only updates certain settings upon login or refresh.** Settings that change while the user is already logged in are NOT picked up until the user explicitly logs out and back in (or pulls down on the screen to refresh).
> 
> Settings checked **only at login** include:
> 
> *   Current program / current course
>     
> *   Program setting values (including signature requirements, attendance tracking, procedure verification, anonymous evaluation options)
>     
> *   Trainee type configuration
>     
> 
> This is the single most common cause of "the setting was changed but the app doesn't reflect it" support tickets. Always include "log out and log back in" as a first-step recommendation. (Ticket 225018, AMBS-9910.)

To partially address this, MedHub added two mechanisms:

1.  **The session timeout (force-logout) mechanism** — automatically logs users out after a period of inactivity, forcing them to re-authenticate so settings are resynced. See "Session timeout" below.
    
2.  **The "update available" pop-up** — encourages users to install app updates. Updating also resyncs settings. (Ticket 225018.)
    

Despite these, the most reliable fix when a user reports stale data is still: **log out → log back in.**

## Multi-program / multi-course context

> **The mobile app keeps the user in their previously-selected program or course until they log out and back in.** A student who completes one course period and starts a new one will continue to see the **old course** as the active context until they log out, log back in, and select the new course. Procedures logged during this time are attached to the old course — even though the new course is what shows in the full website. Same applies to residents transitioning to a new fellowship program.
> 
> **Recommendation to communicate**: at the start of any new course or fellowship year, students/residents should log out of the mobile app and log back in to ensure they're operating against the current context. (Ticket 205198, AMBS-8908, ELD 9/21/2022.)

The session timeout (`mobile_session_timeout_hours`) is the mechanism that eventually forces re-authentication and a fresh settings sync. See "Session timeout" below for the configurable inactivity period.

## Push notifications

When a user installs the app, they're prompted on first launch:

> _"We'd like to help you remember to submit your work hours every week by sending you timely notifications."_

If the user accepts:

*   **Late Work Hours notifications** — sent on the same schedule as the full website (Monday morning if last week's timesheet wasn't submitted). (Ticket 182943, ES 9/7/21.)
    
*   **Other push notifications** — for new evaluations, new conferences, posted calendar events, and other end-user-relevant events.
    
*   **Delivery cron**: Mobile push notifications run on a separate cron from email alerts — see **MedHub - Background Processes** for the schedule. Currently runs Monday at 7:03 a.m. and Friday at 3:14 a.m., plus per-feature crons for evaluations and other items.
    

If the user declines push notifications during install, they can re-enable them via the device's Settings → Notifications → MedHub.

## Session timeout

> **Mobile App default timeout: approximately 168 hours (1 week) of inactivity** before auto-logout. This is significantly longer than the 24-minute full-website timeout because mobile users are more likely to use the app sporadically.
> 
> The setting `mobile_session_timeout_hours` controls this. Per the April 2026 root settings export, the default is approximately 168 hours. Institutions can request adjustment via Support — most commonly extended for institutions with strict workflow requirements where users need persistent login.

The session timeout is also **the force-logout mechanism** that forces re-authentication and a fresh settings sync. After the inactivity period expires, the user must log in again, at which point the app pulls the latest settings (current program, program setting values, trainee type configuration). There is no separate "force logout after N continuous days" mechanism — the inactivity timeout is what serves that role.

(Ticket 233051. The full-website timeout is documented in **MedHub - Login & Authentication** §"Session timeout" when drafted.)

## QR Code Integration for Evaluations (in flight, not shipped)

> **Status: in Plan as of 5/1/2026** (MED-672 SAFe Epic, reporter Caitlin Moore, assignee Jenny Davis). Created 11/19/2025; not shipped to production.

The QR Code initiative builds a deep-linking system within MedHub that lets users jump straight to evaluation tasks through QR codes, links in emails, push notifications, and calendar events. From the epic scope:

*   QR code **generation** for evaluations (Administrators, Student Admins, Course Coordinators, GME Office can generate).
    
*   QR code **scanning** to initiate and/or complete evaluations.
    
*   No login required for QR code scanning when the user is already authenticated.
    
*   Institution settings may allow unauthenticated users to complete evaluation via QR code (institution accepts the risk).
    
*   Integration with mobile app for enhanced evaluation user experience, including a quick action for QR Code functionality.
    

Although the epic name uses "QR codes," the architecture document (Confluence page 504037396) clarifies that the primary goal is **automating common task initiation via deep links**, while still generating/managing QR codes for those links.

**Out of scope for the initial release**: new evaluation modules outside QR code integration; integration with non-standard QR code scanning devices.

The parent deep-linking work is **MED-715** ("QR Code Integration for Evaluations") — the broader system that QR codes hook into.

## Mobile-specific behaviors and limitations

### Evaluation completion — no Save Later button

> **The mobile app does NOT have a "Save answers — I will finish later" button** that exists on the full website. Mobile users have only Submit. However, **when the user backs out of an evaluation, the data is automatically saved** — there's no need for an explicit save action. Returning to the evaluation later resumes from the saved state. (Ticket 103880, CB confirmation.)

This produces complaints from users used to the desktop button. Reassure them that backing out auto-saves.

### Procedure history — last 365 days only

> **Procedure history on iOS is limited to the past 365 days.** To see older procedure logs, the user must log into the full website. (Mobile App FAQ.)

### Evaluation attachments — not visible on the app

> **Attachments to evaluation forms are NOT accessible on the mobile app.** Evaluators see the form but cannot view attached files. Recommend the evaluator complete the evaluation on the full website when attachments are present. (Ticket 136882, HN confirmation.)

### Leaderboard — current academic year, default program only

> **The "Leaderboard" tracking evaluations completed and time to complete** only counts:
> 
> *   **Current academic year**
>     
> *   **Default program** only
>     
> 
> If a user has access to multiple programs, evaluations completed in non-default programs don't show on the leaderboard. (Ticket 145174, BAM confirmation.)

If a user reports their leaderboard is not updating: confirm which program they completed the evaluation in, and confirm their default program assignment.

### Calendar Appointments/Meetings — multi-association quirk

> **Faculty associated with BOTH the School of Medicine AND a Residency/Fellowship program cannot see Appointments/Meetings posted by Program Administrators in the Mobile App.** They must use the full website. This is a known limitation when the user has cross-program associations.
> 
> Faculty who are associated with only ONE program work fine — Appointments/Meetings posted to them appear in the Mobile App as expected (since version 2.10.7, rolled out 9/2022). (Ticket 201920, AMBS-8679, ELD 9/23/2022.)

### Work Hours default view

> **The iOS Mobile App default work hours view is no longer driven by** `settings_dh_view_by_review_period`. Earlier versions of iOS defaulted to the "By Review Period" compliance layout when this institution-level setting was enabled, which some users found annoying (Ticket 172155, MAPS-3882). The mobile team has decoupled the iOS default view from this setting.
> 
> **Android already worked this way** — Android remembers the last view the user was on regardless of the institution setting.

### Procedure supervisor search — in-program faculty only

> **The Procedure supervisor search on the mobile app currently only searches in-program faculty.** The full website supports searching across programs. Planned to mirror desktop behavior eventually. (Mobile App FAQ.)

## iOS 26 compatibility (resolved)

> **iOS 26 compatibility shipped in iOS 3.0.4 (4/27/2026)** via MAPS-9426 ("Ensure App UI Layout Compatibility for Release Builds (Xcode 26+)") and MAPS-9391 ("Upgrade SPM and pod files to support minimum version as 17"). Both internal changes — not externally visible to users beyond the app continuing to work on iOS 26.

## Multi-Factor Authentication on the Mobile App

When MedHub MFA is configured for the institution (see **MedHub - Login & Authentication** §"Multi-Factor Authentication" when drafted), the mobile app supports MFA login. The user enters their MedHub username and password, then receives an OTP via the configured delivery method (Email, SMS, or Authenticator App), enters it in the app to complete login.

For SSO-based authentication, MFA is handled by the institution's IdP — the mobile app doesn't add an MFA layer beyond what the institution requires.

## Operational scenarios

### "The mobile app shows different data than the full website"

The user is logged in with stale settings or in the wrong program/course context.

1.  Have them log out and log back in.
    
2.  Have them refresh the screen by pulling down (where applicable).
    
3.  If still wrong, install any pending app updates.
    

### "Late work hour notifications aren't arriving on the mobile app"

Check:

1.  The user accepted push notifications during install. If not, enable in device Settings → Notifications → MedHub.
    
2.  The user has submitted at least one timesheet historically (the late notification only fires for users who have submitted before).
    
3.  The Mobile Application Notifications cron has run.
    
4.  The user has Faculty/Resident type access. Students don't get late work hours notifications.
    

### "I'm an admin and the mobile app says I can't use it"

By design. Mobile App is end-user-only. Use the full website. (Ticket 197237.)

### "User cannot see released residents as evaluation targets"

Gap #21 in the canonical list. The user must initiate the evaluation from the full website OR an Administrator must deliver the evaluation from the full website. After delivery, the form can be completed on the mobile app. (Ticket 157426, AMBS-5662.)

### "Student logged a procedure on the app and it shows in the wrong course"

The app is still in the previous course context. Have the student log out, log back in, select the correct course, and re-log the procedure. The procedures attached to the old course need to be removed/re-attributed. (Ticket 205198.)

### "Faculty can't see Appointments/Meetings posted to them in the app"

If they have BOTH School of Medicine AND a Residency program association, this is a known limitation — they need to use the full website. If they only have one association, ensure they have the latest app version (2.10.7+, rolled out 9/2022). (Ticket 201920.)

### "Procedure logs are flagged for verification even though we disabled it in Program Settings"

The Procedure Verification gap (Ticket 165491). See the dedicated section above. The fix sequence requires temporarily re-enabling verification, deselecting per-procedure-type, disabling, and asking the data team to clean up pending records.

### "Institution name is wrong in the app's institution dropdown"

The dropdown mirrors the production site name on MedHub's internal Sites page. Update the production site name there; the dropdown updates automatically. Dev confirmed this is low-risk to do. (Ticket 236065, AMBS-11159.)

### "I want a list of users at our institution who have the app installed"

Not available to MedHub Support. The CSM team has access to a utilization report showing percentage of users with the app per type (Android or iPhone) at the institution. Refer the client to their CSM. (Ticket 165428, ELD 12/14/2020.)

### "Resident can't access work hour timesheets older than current/last week despite root setting allowing more"

**Resolved in iOS 3.0.4 (4/27/2026)** — MAPS-9374. Trainees can now consistently view and submit all weeks of timesheets their program has unlocked. If they're still seeing the old behavior, ensure they have iOS 3.0.4 or later installed.

### "User says SSO doesn't work on Android" (UMMC-specific case)

Documented for University of Mississippi only: their SAML configuration treats the Android app as Chrome browser, which doesn't behave properly with their authentication. Workaround: Android UMMC users use **MedHub Login** (not University of Mississippi Login) on the mobile app, after first resetting their MedHub password via the web Forgot My Password flow. (Ticket 179272, AMBS-7314.)

### "Resources tab is missing in the More menu"

Resources was added in the **January 2024 release**. If a user doesn't see it, they're on an older app version. Update via App Store / Google Play. The Recently Viewed section displays the last 30 resources.

### "Skip logic on a required evaluation question doesn't behave correctly on the app"

**Resolved in iOS 3.0.4 (4/27/2026)** — MAPS-9186 (questions configured to "hide initially" now stay hidden until the trigger answer is selected) and MAPS-9187 (only visible questions are treated as required on form submission). If the user reports the old behavior, ensure they have iOS 3.0.4 or later.

## Open questions for Emma

`[VERIFY]` **PM Sharepoint gap spreadsheet sync** — the canonical 32-item list dates to 9/19/2022. The doc now annotates known resolutions through iOS 3.0.4 (4/27/2026), but a fresh sync against the live PM Sharepoint sheet would catch any items not visible in release notes. Emma to pull the latest version when convenient; the live sheet may not be fully up to date.

### Resolved during verify pass

*   Whether the iOS work hours default view (gap #1) has been resolved — **Resolved in iOS 3.0.4** via MAPS-9374. Inline annotation added; Common Scenario added.
    
*   Whether the QR Code Integration for Evaluations (MED-672, MED-715) is shipped or still in flight — **In flight, status "Plan" as of 5/1/2026.** Dedicated section added.
    
*   Whether the iOS 26 app compatibility work (MAPS-9426) introduced any new behaviors — **Shipped in iOS 3.0.4.**
    
*   Skip-logic / required-question gap (#23) — **Resolved in iOS 3.0.4** via MAPS-9186/9187.
    
*   Multi-program/course force-logout mechanism — **Same as the inactivity timeout.** No separate "force logout after N continuous days" feature exists; the `mobile_session_timeout_hours` inactivity timeout serves this role. Doc reframed: removed the speculative "Product was investigating force logout" framing, integrated the force-logout mechanism description into the Session timeout section.
    
*   Whether `settings_dh_view_by_review_period` still drives the iOS default view — **Decoupled.** iOS no longer respects this setting for the default view. Doc updated to describe the current decoupled state rather than the historical issue.
    
*   `mobile_session_timeout_hours` actual default — **Confirmed approximately 168 hours** via April 2026 root settings export.
    
*   Android parallel release for iOS 3.0.4 changes — **Removed from open questions.** When something shipped on a given platform is a release-tracking concern, not a documentation concern. The doc describes how the system works; platform-by-platform release timing belongs in release notes.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`mobile_session_timeout_hours`

Hours of inactivity before mobile app auto-logout. Default approximately 168 hours (1 week). Configurable via Support request. Also serves as the force-logout mechanism that ensures settings get resynced after inactivity.

`settings_dh_view_by_review_period`

Institution-level setting. **No longer affects the iOS mobile app default work hours view** — iOS has been decoupled. Still affects the full website.

`mfa_available_types`

MFA delivery methods (Email, SMS, Authenticator App). Mobile app respects whatever is enabled.

Per-program settings affecting mobile app behavior (changes require user logout/login to take effect):

*   **Enable procedure verification** — see Procedure Verification gap above.
    
*   **Verify Procedure** (per Procedure Type) — must be deselected individually, not just at program level.
    
*   **Attendance Tracked by Residents** — gates conference attendance recording.
    
*   **User can choose to submit anonymously** — not respected on mobile app for self-initiated evaluations (gap #13).
    
*   **Disable Insufficient Contacts link** — not respected on iOS (gap #26).
    
*   **Hide option titles** — not respected on mobile (gap #18, #29).
    

## Database tables appendix

Table

Purpose

`mobile_sessions`

Mobile app session records — driving the inactivity timeout.

`mobile_push_tokens`

Per-user push notification tokens (APNs for iOS, FCM for Android).

`mobile_push_log`

Audit of push notifications sent.

`mobile_app_versions`

Per-platform app version records. Drives the "update available" pop-up.

`users_residents` / `users_faculty` / `users_students`

Profile data accessed via the app.

`eval_results`

Evaluation completion records — drives both pending and completed evaluation views.

`procedures_log`

Procedure logs — drives Procedures tab on the app.

`dh_timesheets`

Work hours timesheets — drives Work Hours tab.

`ch_lectures_attendance`

Conference attendance — drives Conferences tab.

`messages`

MedHub Messages — drives Messages tab.

`mobile_resources_recent`

Per-user "Recently Viewed" resources list (last 30 items). Added in January 2024 release.

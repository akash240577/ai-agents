# MedHub - Calendars - markdown

# MedHub - Calendars

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Calendars in MedHub aggregate every dated thing on a user's plate into a single personal calendar — rotation assignments, shifts/calls, clinics, conferences, course sessions (UME), absences, and admin-posted events/notes. The calendar is **derived data**, not a primary record: the underlying assignments and events live in their own modules (Scheduling, Conferences, Curriculum Mapping), and the calendar surfaces them per user.

Two views matter:

*   **The in-MedHub calendar** — `View myCalendar` link on the user's home page. Always live. Always reflects the latest underlying records.
    
*   **External calendar sync** — Outlook, Google, iPhone, Android — via the `Sync Calendar` link inside View myCalendar. Subscription-based; refreshes on the external client's schedule.
    

This document covers Calendars as a feature: what populates the calendar (per user type), how administrators post events to user calendars, the calendar sync mechanics (window, refresh cadence, what's included), how UME course sessions flow to student calendars (and the schedule-driven eligibility), and the operational patterns that come up when calendar data appears wrong.

It does not cover: the underlying scheduling mechanics that drive rotation/shift display (see **MedHub - Scheduling**); conference creation and recurrence (see **MedHub - Conferences**); UME session mechanics and the "Course Sessions tab" (see **MedHub - Curriculum Mapping**); or absence requests (see **MedHub - Absences**).

## Where it lives

For all user types with Personal Calendar access, the calendar is accessed via **Home page → View myCalendar**. The link appears in the user's portal as part of their personalization controls.

Per the MedHub Functionality Grid, **Personal Calendar** is enabled for:

*   Student Administrator
    
*   Course Coordinator
    
*   Faculty (UME-side)
    
*   Medical Student
    
*   GME Office
    
*   Program Administrator
    
*   Faculty (GME-side)
    
*   Resident
    

Each user type sees their own calendar populated by the records associated with them.

For administrators, there is also a **Calendar - Post Item** link (Home → middle column → Portal Management → Calendar - Post Item) which posts events/notes to other users' calendars. See "Posting events to user calendars" below.

## What populates the calendar — per user type

### Resident calendar (GME)

A Resident's personal calendar shows:

*   **Rotations** — service assignments from the master rotation schedule (see **MedHub - Scheduling**)
    
*   **Calls/Shifts** — shift and call schedule entries
    
*   **Clinics** — clinic schedule entries
    
*   **Conferences** — conferences the resident is scheduled to attend (see **MedHub - Conferences** for the eligibility logic, especially shared conferences and PGY-level filters)
    
*   **Events/Notes** — items posted by Program Administrators or GME via Calendar - Post Item
    
*   **Absences** — approved absences
    
*   **Curriculum Goals & Objectives** — when applicable
    

Each item displays with its associated date/time and detail.

### Faculty calendar (GME)

A Faculty member's personal calendar shows:

*   Permanent and dated service assignments
    
*   Clinic assignments
    
*   Shift assignments (when applicable)
    
*   Conferences they're scheduled to attend (see **MedHub - Conferences**)
    
*   Events/Notes posted by administrators
    

### Student calendar (UME)

A Medical Student's personal calendar shows:

*   **Course/Clerkship enrollments** — the courses the student is currently enrolled in
    
*   **Course Sessions** — individual session records from the Curriculum Mapping module (see "Sessions on the student calendar" below)
    
*   **Schedule assignments** — when the student is scheduled to clinic locations, hospitals, or other site-based components
    
*   **Conferences** — when the student is scheduled to a service that has shared conferences (see "Cross-side display: GME conferences on UME calendars" below)
    
*   **Events/Notes** posted by Student Administrators or Course Coordinators
    

### Faculty calendar (UME)

UME Faculty calendars show:

*   Course associations (which courses they're tied to)
    
*   Sessions where they're tied as the lecturer/presenter or session faculty
    
*   Course-related events
    
*   Events/Notes posted by Student Administrators or Course Coordinators
    

### Administrator calendars (GME / UME)

Administrator personal calendars show:

*   Their own assignments (typically minimal)
    
*   Events posted to them by other administrators
    
*   Reference views of their program/course's events
    

## Sessions on the student calendar (UME)

A meaningful UME-specific behavior: **course sessions appear on each enrolled student's personal calendar** automatically. This is one of the primary reasons UME programs use Curriculum Mapping's Course Sessions feature — once a session is added with a date, time, and the course is configured, every enrolled student in that course sees the session on their personal calendar without the administrator needing to explicitly post each one.

(Tested by Jenny 10/7/20 — see **MedHub - Curriculum Mapping** for the underlying session record mechanics.)

### How session-to-calendar flow works

1.  A session is created in **Curriculum Mapping → Course Sessions** with a title, date, time, location, educational methods, etc.
    
2.  The session is associated with a specific course (clerkship).
    
3.  All students currently enrolled in that course see the session on their calendar.
    
4.  If the session is set to **Include in export** (Curriculum Map field) — only that toggle controls AAMC export, not calendar visibility. Calendar display is independent.
    

### Pre-populated future sessions and recurrence changes

> **A known limitation: when a session's recurrence is changed, already-scheduled future sessions on the calendar do NOT auto-update.** If a session was originally weekly and is changed to bi-weekly, the existing future weekly sessions remain on the calendar and must be deleted manually. There is no script to bulk-remove misaligned future sessions. Product is not planning an enhancement in the foreseeable future. (Ticket 231129, AMBS-10325 — see **MedHub - Curriculum Mapping**.)

### Sessions and student schedule alignment

Sessions appear on a student's calendar based on **course enrollment**, not on schedule assignment to a specific location. This means:

*   A student enrolled in IDC 243 sees all IDC 243 sessions, even those scheduled at a location they're not physically at.
    
*   Sessions don't filter by student schedule splits, group assignments, or clinical site.
    
*   Programs using student groups for differentiated session attendance must use the Schedule (clinical schedule) rather than course enrollment to differentiate display.
    

### Excluding sessions from calendar display

There is no per-session toggle to suppress calendar display while keeping the session active. The "Include in export" toggle on Course Sessions controls AAMC Curriculum Inventory inclusion only; it does not affect personal calendar display.

To suppress a session from a calendar:

*   Inactivate the session — but this also removes it from reports and AAMC export.
    
*   Delete the session — but this affects historical records.
    

There is **no clean way** to keep a session active for tracking purposes while hiding it from calendars.

## Cross-side display: GME conferences on UME calendars

> **A medical student scheduled to a GME service that has shared conferences will see those conferences on their UME calendar.** This is by design — when UME and GME programs are linked at the institution and a student rotates on a GME service, the shared conferences from that service appear in the student's calendar feed.
> 
> (Confirmed by Bill M.; see **MedHub - Conferences** §"Sharing conferences across programs" for the underlying mechanics.)

This is the primary cross-side calendar interaction. Most other display is one-sided: GME residents don't see UME course sessions; UME faculty don't see GME rotations.

## Posting events to user calendars

Administrators (Program Coordinators, Student Administrators, Course Coordinators, GME Office) can post events directly to user calendars via the **Calendar - Post Item** link.

### How to post

1.  From the Administrator's home page, in the middle column under **Portal Management**, click **Calendar - Post Item**.
    
2.  Define the recipients:
    
    *   A **Group** (PGY level, program, course, etc.)
        
    *   Specific **individual users**
        
3.  Set the **Date/Time** — start and end.
    
4.  Choose the **Type**:
    
    *   **Appointment/Meeting** — typically a real event with a time block
        
    *   **Note/Reminder** — typically a single-day flag without a specific time
        
5.  Enter the **Description**.
    
6.  Submit.
    

The posted item appears immediately on the recipients' calendars (in MedHub or via the iOS Mobile App) at next refresh.

(Confirmed BG.)

### Common use cases

*   Program-wide reminders ("Quarterly Faculty Meeting next Wednesday")
    
*   Individual reminders for specific trainees ("Resident X — please attend the M&M conference 7/15")
    
*   Faculty meeting announcements
    
*   Reminders posted by Student Administrators (e.g., upcoming OSCE date)
    
*   Notes attached to specific dates without time blocks
    

### Reaching deactivated or future-active users

*   **Active users** with current MedHub access see posted items on their next login or calendar sync.
    
*   **Future-active users** (incoming trainees not yet active): items posted to them are stored. They will see the items the day they activate.
    
*   **Inactive/archived users**: posting works, but they cannot see the items unless reactivated.
    

## Calendar sync to external calendars

The **Sync Calendar** link inside View myCalendar lets the user subscribe their MedHub calendar to:

*   Outlook (Microsoft 365 / Exchange)
    
*   Google Calendar
    
*   iPhone (iCal)
    
*   Android
    

The link generates a calendar feed URL that the user pastes into their external calendar app's "Add by URL" or "Subscribe to Calendar" function.

### What syncs

Per the SKU (Confirmed BG):

> The Calendar sync functionality allows residents to sync **all of**:
> 
> *   Rotations (master rotation schedule assignments)
>     
> *   Calls/Shifts (shift and call schedule entries)
>     
> *   Clinics (clinic assignments)
>     
> *   Conferences (the resident is scheduled to attend)
>     
> *   Events/Notes (items posted by administrators)
>     

Equivalent items sync for faculty, students, and other user types — anything visible on the in-MedHub calendar is synced.

### Sync window

> **Calendar sync pulls 1 month backward and 3 months forward** (a 4-month rolling window).
> 
> This is by design — keeping the feed bounded prevents the synced calendar from becoming unwieldy and ensures historical data isn't continuously re-synced. The window is fixed; there is no setting to extend it.
> 
> (Confirmed in **MedHub - Conferences** §"Calendar sync".)

### Refresh cadence

External calendar apps refresh subscribed feeds on their own schedules:

*   **Outlook**: typically every 3-6 hours, varies by version and Exchange policy
    
*   **Google Calendar**: typically every 24 hours
    
*   **iCal (iPhone)**: every 15 minutes to 1 day depending on user settings
    
*   **Android**: depends on the calendar app installed
    

> **Changes made in MedHub may take time to appear in synced calendars.** Users reporting "I don't see my new shift in Outlook yet" should be advised to manually refresh their subscription or wait for the next scheduled refresh. **Forcing refresh from MedHub side is not possible** — refresh is controlled by the external app.

### Subscribe vs. download

The sync link is a **subscription URL** — the external calendar always pulls fresh data on its refresh schedule. There is **no one-time download** of the MedHub calendar; the feed is always live. This is intentional but produces complaints from users wanting "a copy of my conference schedule" — the **Public Conference Schedule View** (per-program setting) is the recommended workaround for sharing conference dates externally without giving full calendar access. (See **MedHub - Conferences** §"Public conference schedule" — Ticket 200753.)

### Time zone considerations

The calendar sync uses the institution's `global_timezone` setting for time conversion. Affects:

*   When conferences appear in synced calendars
    
*   Display of shift/call start/end times
    
*   Comparison of MedHub conference start times to user device times for codeREADr scanning (see **MedHub - Conferences**)
    

> **For institutions in time zones not aligned with the institution's** `global_timezone` setting, calendar items may display at unexpected times in users' synced calendars. Confirm `global_timezone` is set correctly for the institution. (See **MedHub - Conferences** §"Time zone".)

## Mobile app and calendars

The **iOS Mobile App** displays the user's calendar with the same underlying data as the in-MedHub web calendar. (Confirmed BG.)

Specific behaviors:

*   Push notifications can be enabled for upcoming calendar items (configured per user in app preferences).
    
*   Calendar items posted from the web are visible in the app at next refresh.
    
*   The app does not provide a separate sync mechanism — the user can also subscribe via the Sync Calendar link from the web, but the in-app view is independent of external calendar subscriptions.
    

(See **MedHub - Mobile App** when drafted for more detail.)

## Common scenarios

### "My new shift isn't appearing in my Outlook calendar"

Cause: the external calendar's refresh hasn't yet pulled the updated MedHub feed. Outlook typically refreshes every 3-6 hours. Tell the user to manually refresh their subscription, or wait. There is no way to force refresh from the MedHub side.

### "A conference appears on my calendar but not on the attendance sheet"

The calendar shows conferences the user is _scheduled_ to attend; the attendance sheet shows who has been _recorded_ as attending. The two are related but distinct. See **MedHub - Conferences** for the eligibility logic.

### "I posted an event to my residents' calendars but they don't see it"

Three possible causes:

1.  **The event hasn't refreshed yet on their device** — wait or have them refresh.
    
2.  **The event was posted to the wrong group** (e.g., to PGY-1s when the resident is PGY-2). Re-check the post recipients.
    
3.  **The event was posted to a group that doesn't include any active users** — verify by attempting to view the post as the recipient.
    

### "I changed the recurrence of a session and old future sessions are still on my students' calendars"

By design — the system does not auto-clean up future sessions when recurrence changes. Manually delete the misaligned future sessions. (AMBS-10325; see **MedHub - Curriculum Mapping**.)

### "Sessions are showing on a student's calendar even though they're not enrolled in that course"

Check enrollment records — the student is likely still enrolled in the course (or was at some point and the enrollment wasn't properly removed). See **MedHub - Course Enrollments**.

### "I added a session but no students see it on their calendar"

Verify:

1.  **The session has a date/time** (sessions without a date won't appear on calendars).
    
2.  **The students are enrolled** in the course this session belongs to.
    
3.  **The session is Active** (not Inactive).
    
4.  **The course is Active** in the Course/Clerkship List.
    

### "A medical student is seeing GME conferences on their calendar — is this right?"

Yes, by design. When a medical student is scheduled to a GME service that has shared conferences, those shared conferences appear on the student's UME calendar. (Confirmed Bill M.)

### "I want to give an external person (e.g., a department admin) view of conference dates"

Calendar sync requires the user to have a MedHub account. For external sharing, use the **Public Conference Schedule View** (per-program setting) which generates a publicly-shareable link without requiring a MedHub login. This was the recommended approach in Ticket 200753.

### "My iCal subscription went stale and stopped updating"

iOS device subscriptions can get stuck. Recommend the user remove and re-add the subscription URL. The URL itself doesn't change — but iOS sometimes caches stale data.

### "I want to download a one-time export of all conferences for the year"

Not supported. The calendar is sync/subscription only. Workaround: Public Conference Schedule View link, or run the Conference Schedule Details report (see **MedHub - Conferences**).

### "Two trainees scheduled to the same shift are showing different times on their calendars"

Time zone mismatch. Each user's calendar uses the institution's `global_timezone` for display, not their personal time zone. If trainees are in different time zones, both will see the institution's time zone in their MedHub calendar — but their device's external calendar (synced) may convert to their local time zone. Verify `global_timezone` is set correctly for the institution.

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Whether the Personal Calendar feature has dedicated settings (root-level on/off) beyond what's already covered by user-type access controls. The Functionality Grid suggests it's enabled per-user-type by default, but a dedicated `setting_calendar_*` may exist.
    
*   `[VERIFY]` Whether students in UME programs that do NOT use Curriculum Mapping (and thus don't have Course Sessions) still get a populated calendar from other sources. Worth confirming if there's a UME-only "session-less" calendar mode.
    
*   `[VERIFY]` Whether GME conferences shared with UME populate the UME calendar via a different mechanism (e.g., via student enrollment to a particular GME service vs. a UME course).
    
*   `[VERIFY]` Whether the calendar sync window has been extended beyond 1 month back / 3 months forward in any recent release.
    
*   `[VERIFY]` Mobile app push notification configuration — confirm whether this is per-user, per-event-type, or global.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`global_timezone`

Institution-wide time zone. Affects calendar display, calendar sync time conversion, and conference start time comparisons (e.g., for codeREADr scanning). Confirm this is set correctly for the institution.

`setting_calendar_*`

Misc calendar-related settings (vary by institution and version). Default behavior is the calendar enabled per user type per the Functionality Grid.

Per-user settings (configured via Account → Preferences):

*   **Conference Option → Automatically Populate CME Credits** — affects whether faculty conferences flow to the Faculty Learning Portfolio's CME Tracking. See **MedHub - Portfolios**.
    
*   Mobile app push notification preferences — set per-user in the iOS Mobile App.
    

There are no per-program calendar settings in the standard configuration; calendar behavior is determined by what's been recorded in the underlying schedule, conference, session, and event records.

## Database tables appendix

Table

Purpose

`calendar_events`

Administrator-posted events and notes (Calendar - Post Item).

`calendar_events_recipients`

Many-to-many associations between events and the users who should see them.

`calendar_subscriptions`

External calendar subscription URLs and tokens for the Sync Calendar feature.

`sh_residents`

Resident rotation schedule entries — drives Rotations on the calendar.

`sh_residents_calls`

Resident call schedule entries.

`sh_residents_clinics`

Resident clinic assignments.

`sh_residents_shifts`

Resident shift entries.

`sh_faculty`

Faculty rotation schedule entries.

`sh_faculty_clinics`

Faculty clinic assignments.

`sh_faculty_shifts`

Faculty shift entries.

`ch_lectures`

Conference records — drives Conferences on the calendar.

`curriculum_sessions`

Course Sessions (UME) — drives Sessions on the student calendar via course enrollment.

`users_students_enrollments`

Student course enrollments — determines which sessions appear on which student calendar.

`absences`

Approved absences — drives Absences on the calendar.

`users_residents_apps_documents`

Onboarding requirements with due dates — may drive calendar reminder display.

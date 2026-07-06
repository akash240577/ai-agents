# MedHub - Institutional Release - markdown

# MedHub - Institutional Release

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

**Institutional Release** is a structured workflow for releasing a trainee from one MedHub institution to another for a portion of their training. It is gated by the root setting `settings_affiliate` — a legacy name that predates the current product term. Throughout the codebase, database schema, support documentation, and parts of the UI, the feature is referred to as "affiliate." In current client-facing terminology and this document, it is **Institutional Release**.

The model is straightforward conceptually: MedHub is single-tenant, meaning each institution runs on its own MedHub site (e.g., `duke.medhub.com`, `cc.medhub.com`). When a trainee at Duke needs to spend a rotation block training at Cleveland Clinic, both institutions need a record of the rotation:

*   **Duke** (the trainee's home institution) needs to track that the trainee was on an outgoing institutional release for that period.
    
*   **Cleveland Clinic** (the receiving institution) needs to know who the trainee is, what their basic demographics are, and that they're rotating there as a visitor.
    

Institutional Release manages the structured exchange of that information between the two MedHub instances — so neither side has to manually create a profile, neither side has to email demographics back and forth, and both sides retain a clean audit trail of who was released where and when.

This document covers Institutional Release as a feature: setting up institutional affiliate agreements, configuring what data exchanges, the trigger conditions for outgoing institutional releases, the search windows that determine when releases surface for review, the data set transferred to receiving institutions, the alert recipients, the operational scenarios that come up in support tickets, and the relationship to the underlying scheduling mechanics.

It does not cover: intra-institution releases (covered in **MedHub - Scheduling** §7); the underlying training history records that drive release identification (see **MedHub - Training History**); or the contract handling for visiting trainees (see **MedHub - Contracts** §"Visiting residents — overlap method").

## How Institutional Release relates to MedHub's single-tenant architecture

The single-tenant architecture is the reason this feature exists in the form it does. Two MedHub institutions cannot share data through a common database; they're physically separate deployments. Institutional Release is the bridge.

The data model:

*   **Outgoing institutional release** — from the home institution's perspective, a trainee on the home institution's roster who is rotating somewhere else.
    
*   **Incoming institutional release** — from the receiving institution's perspective, a trainee from another institution who is coming to rotate.
    

The same release shows up as outgoing on Duke's site and incoming on Cleveland Clinic's site (assuming both are using MedHub). Each side has its own controls, settings, and approval workflow.

If the receiving institution does NOT use MedHub, the institutional release is still useful on the home institution's side — it tracks the outgoing rotation and includes the receiving institution's contact information without requiring them to be on MedHub.

## Where it lives

For the **GME Office**, Institutional Release is accessed from:

> **GME Office Home → Institutional Release**

The link only appears for GME users with **Institution Settings/Lists access** selected on their account. Users without this access cannot see the link, even when they have other GME-level permissions. (Ticket 196498, BG/NE 5/6/2022.)

The Institutional Release page has subtabs:

*   **Affiliates** — manage institutional partnerships
    
*   **Releases (Outgoing)** — track home-institution trainees rotating elsewhere
    
*   **Releases (Incoming)** — track external trainees rotating at the home institution
    
*   **Settings** — configure data exchange permissions per affiliate
    
*   **Messages** — communications related to specific releases (per affiliate)
    
*   **Ignored Services** — services to exclude from automatic identification
    

## Setting up an institutional affiliate agreement

Before a release can occur, the home and receiving institutions must establish an **affiliate agreement**. The setup involves a request-and-acceptance handshake:

1.  **The home institution initiates the request.** From the Affiliates page → "Request New Affiliate" or equivalent action. The home institution selects the receiving institution from the MedHub-wide list (or enters details for a non-MedHub institution).
    
2.  **The two institutions configure data exchange permissions.** Each side decides what data they're willing to send/receive (see "Data exchange options" below).
    
3.  **The receiving institution accepts the request.** Their GME Office reviews and approves the agreement.
    
4.  **The agreement becomes active.** Trainees can be marked for release between the two institutions.
    

The agreement is bidirectional in the sense that both institutions must approve, but the data flow can be asymmetric — Institution A may agree to send Training History but Institution B may not. The data flowing in each direction is governed by the configured permissions per affiliate.

## Data exchange options — what gets transferred

When an institutional release occurs, the data sent to the receiving institution is determined by the options selected when setting up the affiliate agreement. The full list of available data transfer options:

Field

Notes

**Resident Name**

**FORCED** — always transferred. Without this, the release is meaningless.

**Release Date Period**

**FORCED** — always transferred. The receiving institution needs to know the rotation dates.

**Basic Demographics**

Gender, NPI, Date of Birth

**Social Security Number (SSN)**

Optional — typically only enabled for HR/payroll-relevant rotations

**Contact Information**

Address, phone, email

**Training History**

Current academic year start/end dates, program name, institution name

**Photo**

The trainee's profile photo

(Confirmed BG.)

> **What's in "Training History"** — the transferred field is limited. The exchange does NOT include the full training history record; it includes the **current academic year start/end dates**, the **program name**, and the **institution name**. This is enough for the receiving institution to know "Resident X is a PGY-3 from Duke Internal Medicine for AY 2025-26" without exposing prior years' data. (Confirmed BG.)

This is the canonical list of data fields. There is no option to add custom fields to the exchange. Institutions that need to exchange additional data (e.g., procedure logs, ACGME milestone data, evaluation comments) must do so outside of MedHub Institutional Release.

## How a trainee gets identified as needing an outgoing institutional release

The system automatically identifies potential outgoing institutional releases based on the trainee's rotation schedule. The identification logic:

1.  **A trainee is scheduled to a service** at the home institution.
    
2.  **That service has a site assigned** that is configured as an institutional release destination — typically a different physical location belonging to or associated with another institution.
    
3.  **The scheduled period meets the minimum-day threshold** set by `settings_affiliate_outgoing_min` (default 7 days). Shorter rotations are not automatically flagged.
    
4.  **The scheduled period falls within the search window** defined by `settings_affiliate_release_start_days` (default 30 days prior to today) and `settings_affiliate_release_end_days` (default 180 days after today).
    
5.  **Adjacent services are combined** if they're within `settings_affiliate_outgoing_gap` days of each other (default 7) — preventing a trainee from being flagged for two adjacent 4-day rotations as separate releases.
    

When all conditions are met, the trainee surfaces as a "potential release" on the Releases (Outgoing) page. The GME Office reviews each potential release and either:

*   **Confirms it** — the release becomes active and (if the receiving institution uses MedHub and the agreement supports it) the data exchange occurs.
    
*   **Cancels/ignores it** — the release is not pursued.
    

> **The "Identify New Releases" button** triggers a fresh scan of the rotation schedule for potential releases. This is run periodically (typically daily) but can be triggered manually from the Releases (Outgoing) page.

> **Ignored Services** — Services that should never trigger institutional release identification (e.g., a research block at an external institution that the home institution doesn't track this way) can be added to the Ignored Services list in Institutional Release Settings. Once ignored, those services don't appear as potential releases.

## Trigger conditions and timing

The interplay of `settings_affiliate_outgoing_min`, `settings_affiliate_outgoing_gap`, and the two `release_start/end_days` settings shapes how aggressively the system flags releases.

Setting

Effect

`settings_affiliate_outgoing_min`

Higher value = fewer false positives for short rotations. Lower value = more potential releases flagged.

`settings_affiliate_outgoing_gap`

Higher value = adjacent rotations are combined more readily. Lower value = each rotation is flagged separately.

`settings_affiliate_release_start_days`

How far back to look. Higher value = lookback for late-flagged releases (e.g., a release that started yesterday).

`settings_affiliate_release_end_days`

How far forward to look. Higher value = earlier preview of upcoming releases.

Most institutions tune these to match their planning cadence — a 30/180 split (default) gives ~6 months of forward visibility while still flagging the past 30 days for late-confirmed releases.

## Data flow during a release

Once a potential release is confirmed and the affiliate agreement is in place:

1.  **The home institution's MedHub** sends the trainee's data to the receiving institution's MedHub (or, for non-MedHub receivers, generates a transmittable record).
    
2.  **The receiving institution receives an "Incoming Institutional Release" alert** (per `settings_affiliate_email_incoming`).
    
3.  **The receiving institution's GME Office reviews and approves** the incoming release.
    
4.  **A profile for the visiting trainee is created or updated** at the receiving institution. If the trainee has been at this institution before, the existing profile is updated. If not, a new profile is created using the data sent.
    
5.  **The receiving institution can schedule the trainee** to services as a visiting trainee (see **MedHub - Scheduling** §7 for the visiting trainee scheduling mechanics).
    
6.  **The release period concludes** when the rotation date range ends.
    

For non-MedHub receiving institutions, steps 2-5 don't happen automatically — the home institution exports or shares the data manually with the receiving institution outside MedHub.

## Approval workflow at the receiving institution

The receiving institution's GME Office can configure whether incoming releases require explicit approval before the visiting trainee profile is created or activated. The setting `settings_affiliate_incoming_approval_email` (default 1 — enabled) controls whether a notification is sent to the GME Office when a new incoming release arrives.

Most institutions configure this so that a GME staff member reviews each incoming release before the trainee is added to the receiving institution's roster. This:

*   Catches data quality issues before they affect the visiting trainee's ability to access MedHub at the receiving institution
    
*   Ensures the trainee actually has the prerequisite institutional approvals to rotate
    
*   Lets the receiving institution coordinate with the home institution if any data is unclear
    

## Alert recipients

Institutional Release alerts are sent to GME Office staff designated in the Institutional Release Settings:

*   **Outgoing Release alerts** — recipients of `settings_affiliate_email_outgoing`. Notified when a new outgoing release is identified.
    
*   **Incoming Release alerts** — recipients of `settings_affiliate_email_incoming`. Notified when a new incoming visitor is received from another institution.
    
*   **Approval alerts** — recipients of `settings_affiliate_incoming_approval_email`. Notified when an incoming release is awaiting approval.
    

> **Setup gotcha** — A GME staff member listed in the Institutional Release Settings subtab cannot be set as an alert recipient unless they have **Super Administrator** access (a designation held only by select staff per institution). If a staff member is missing from the alert recipient dropdown despite being listed in the settings, contact MedHub Support to confirm their Super Admin designation. (Ticket 138798 / BG.)

## Common scenarios

### "I cancelled a potential release and now I can't bring it back"

> **Once a potential release is cancelled, there is nothing in the GME Office UI that allows un-cancelling it.** The cancelled release is suppressed from "Identify New Releases" runs going forward. To restore it, **a developer must delete the cancelled release record** from the database. After the developer deletes the record, click "Identify New Releases" — the release will re-surface as pending. (Ticket 138798, confirmed TM.)

This is a recurring frustration. The supported workflow is: contact Support, who escalates to development, who deletes the cancelled release record. Plan ahead — once you cancel, the un-cancel path is non-trivial.

### "Hyperlinked numbers in the Affiliates page don't navigate anywhere"

> **The hyperlinks for Residents Released, Received, Messages, and Ignored Services were not configured to redirect when the feature was originally designed.** The Product team is tracking this as a future enhancement (AMBS, no specific number). For now, hovering on the number shows a tooltip count, but clicking does not navigate to a detail page. (Ticket 177826, Kishor Jain 7/14/21.)

Inform the client and recommend they navigate to the appropriate subtab (Releases (Outgoing), Releases (Incoming), Messages, or Ignored Services) to view detail.

### "How was a trainee released to another institution when their service/site isn't currently set up for Institutional Release?"

> **The system has no audit trail for when Institutional Release settings or affiliate configurations changed.** The settings or characteristics may have changed between the time of the release and the time of the inquiry. Root cause analysis on configuration history is not supported by Customer Support — that level of investigation is dev-team-only. (Ticket 180367, AMBS-7316, ELD 8/5/2021.)

For tickets like this, the answer is "we cannot reconstruct the configuration as it was at the time of the release." If the institution has reason to believe a release was incorrectly authorized, escalate to development for investigation.

### "Our GME user has Institution Settings/Lists access but doesn't see the Institution Releases link"

Two things to check:

1.  **The GME user's profile** — confirm Institution Settings/Lists access is set in the correct subtab.
    
2.  **The setting** `settings_affiliate` — confirm it's set to 1 (enabled) for the institution. If disabled at the root, the link won't appear regardless of user access.
    

(Ticket 196498, BG/NE 5/6/2022.)

### "I want to know exactly what information will be released"

The Affiliates page → "Request New Affiliate" workflow displays the data exchange options that the receiving institution wants to be able to exchange. The "Data to Send/Receive" area lists each field. (Ticket 210818, ELR 5/30/2024.)

For a quick reference, the fields are:

*   Resident Name (forced)
    
*   Release Date Period (forced)
    
*   Basic Demographics (Gender/NPI/DOB)
    
*   Social Security Number (SSN)
    
*   Contact Information
    
*   Training History
    
*   Photo
    

This is the complete list. Custom field exchange is not supported.

### "We don't want service X to trigger institutional release"

Add it to the **Ignored Services** list in Institutional Release Settings. Going forward, that service won't appear as a potential release.

### "We need to extend the search window to capture older releases"

Modify `settings_affiliate_release_start_days` to increase the lookback. Be cautious — too high a value may surface very old rotations that should not be flagged. Most institutions stay within 30-90 days for the start window.

## Date corrections after the fact

The same constraint as intra-institution releases applies (see **MedHub - Scheduling** §7.8): if a release's dates need to change because the underlying training history end date was wrong, modifying the training history and the rotation schedule does **not** flow through to the institutional release record. The system tracks releases by name + start date and won't re-offer cancelled releases.

The supported fix is manual: Support removes the institutional release records, then they can be recreated with the correct dates after the underlying schedule and training history are corrected.

## Relationship to scheduling mechanics

Institutional Release is a layer above the rotation schedule, not a replacement for it. The trainee's actual rotation assignment must still be set up on the appropriate side:

*   **Outgoing release**: the home institution schedules the trainee to a service, but the service is associated with a site that triggers Institutional Release identification. The trainee remains on the home institution's master rotation schedule.
    
*   **Incoming release**: the receiving institution sees the trainee as a visiting trainee (`users_residents_spt`) — see **MedHub - Scheduling** §7 (Visiting trainees / overlap method) for how the trainee is scheduled at the receiving site.
    

Institutional Release does not, by itself, create a service assignment at the receiving institution. The receiving institution must still go through the normal scheduling mechanics to put the visiting trainee on a service.

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Whether the Hyperlinked Numbers issue (Ticket 177826) has been addressed in any release since 2021.
    
*   `[VERIFY]` Confirm `settings_affiliate_incoming_approval_email` default — the SKU references it but doesn't specify the default value. Worth confirming.
    
*   `[VERIFY]` Whether non-MedHub receiving institutions have any structured data export option (PDF, CSV) or whether the home institution must manually compile.
    
*   `[VERIFY]` Whether `settings_affiliate_release_split` (referenced in the Scheduling settings table) affects identification of releases for trainees scheduled to a service with split site assignments.
    
*   `[VERIFY]` Whether the Affiliate Request workflow has been streamlined since the original SKU — specifically the handshake between home and receiving institutions.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_affiliate`

Master switch for Institutional Release functionality. Default 0; set to 1 to enable. (Legacy setting name "affiliate" predates the current product term "Institutional Release.")

`settings_affiliate_outgoing_min`

Minimum days in an activity to trigger an outgoing institutional release. Default 7.

`settings_affiliate_outgoing_gap`

Combine adjacent services within N days when generating outgoing institutional releases. Default 7. Prevents a trainee with two consecutive 4-day rotations being flagged as two separate releases.

`settings_affiliate_release_start_days`

Days prior to today to search for new institutional releases. Default 30.

`settings_affiliate_release_end_days`

Days after today to search for new institutional releases. Default 180.

`settings_affiliate_release_split`

Whether to include services with split site assignments in release identification. Behavior worth verifying with current build — see Open Questions.

`settings_affiliate_email_incoming`

Send email when new incoming institutional release visitor is received. Default 1.

`settings_affiliate_email_outgoing`

Send email when new outgoing institutional release is identified. Default 1.

`settings_affiliate_incoming_approval_email`

Send email when an incoming release is awaiting approval. Default 1.

Institutional alert recipients (configured under **GME Office → Institutional Release → Settings**):

*   **Outgoing Release alerts**
    
*   **Incoming Release alerts**
    
*   **Approval alerts**
    

Recipients must have **Super Administrator** access (`users.sa = 1`) on the root side to be available as an alert recipient. (Ticket 138798.)

## Database tables appendix

Table

Purpose

`i_affiliates`

Affiliate agreements between institutions. Each row represents one bilateral agreement.

`i_affiliates_releases`

Outgoing institutional release records — releases the home institution has identified or confirmed.

`i_affiliates_incoming`

Incoming institutional release records — visitors received from other institutions.

`i_affiliates_data_options`

Per-affiliate data exchange permission configuration (which fields can be sent/received).

`i_affiliates_messages`

Communications between institutions tied to specific releases.

`i_affiliates_ignored_services`

Services excluded from automatic outgoing release identification.

`users_residents_spt`

Visiting trainee records — used for incoming releases on the receiving institution's side.

`users_residents_pg`

Resident training history — drives outgoing release identification (academic year dates, program info).

`sh_tracks_slots`

Service assignments — drives outgoing release identification when a trainee is assigned to a service with a release-eligible site.

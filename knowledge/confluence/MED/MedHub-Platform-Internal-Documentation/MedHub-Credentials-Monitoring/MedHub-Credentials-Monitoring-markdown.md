# MedHub - Credentials Monitoring - markdown

# MedHub - Credentials Monitoring

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Credentials Monitoring is the MedHub feature that automatically monitors trainee licenses for changes — new issuances, expirations, status changes, and DEA schedule updates — and surfaces those changes in MedHub for the GME Office to review and approve. It eliminates the manual work of periodically checking state license boards and the DEA database for every trainee.

The vendor that performs the actual monitoring is **Symplr** (previously named **Cactus**). Most setting names, table prefixes (`lemm_`), and code references in MedHub still use "cactus" because they were created before the rename — those names are unchanged. Customer-facing terminology and recent documentation use Symplr.

The functionality is term-translatable per institution. Most clients call it Credentials Monitoring; some call it License Aware. The display name is set on the root side and varies by client. **In this doc, we use Credentials Monitoring throughout.**

This document covers Credentials Monitoring as a feature: what it monitors, how the integration works, how the GME Office processes updates, troubleshooting common issues, and the settings that govern it. It does not cover NPI or PECOS Query workflows in depth — those have their own subsections at the end. It does not cover initial implementation/setup procedures, which are documented separately for the Implementation team.

## What gets monitored

Credentials Monitoring monitors three license types automatically:

*   **State Licenses** (training and permanent medical licenses)
    
*   **DEA Licenses** (federal Drug Enforcement Administration registrations)
    
*   **Controlled Substance Licenses** (state-level, separate from DEA)
    

It also offers two query tools:

*   **NPI Query** — search the NPPES registry for missing NPI numbers or verify existing ones
    
*   **PECOS Query** — search the PECOS database for Medicare provider enrollment status. **Currently unavailable** pending an enhancement; see "PECOS Query" below.
    

License data must be **manually entered** into MedHub on the trainee's Demographics → Certifications tab before Credentials Monitoring can begin tracking it. The integration cannot populate licenses into a blank field; it can only monitor licenses that already exist in the trainee record (Ticket 251374, AMBS-14842).

### What "monitoring" actually means

Credentials Monitoring does not give MedHub direct database access to state license boards or the DEA. Instead, MedHub generates a roster file listing the trainees and licenses to be monitored, sends that file to Symplr's FTP directory, and Symplr returns updates as it finds them. Symplr operates as a sophisticated user — entering license numbers into the public lookup sites and parsing the response.

This is why license number formatting matters so much: if the formatting differs between what the state board expects and what was entered in MedHub, Symplr's lookup fails and you get "No Match Found." See "Troubleshooting" below.

## Configuration

The GME Office accesses Credentials Monitoring from the homepage under Resident Management. The main interface has these tabs:

*   **License Updates** — pending updates from Symplr awaiting GME approval/rejection
    
*   **Import History** — log of all previously identified updates
    
*   **Settings** — define what to monitor (license types, programs, trainee types, levels)
    
*   **Custom Alerts** — email alerts triggered by specific update types
    

### What the institution monitors

The Settings tab defines what Symplr will check for. The GME Office selects:

*   **License Types** — which of the three license types to monitor (each can be toggled independently)
    
*   **Programs** — which programs' trainees are in scope
    
*   **Trainee Types** — which types of trainees (in-house Resident, Fellow, etc.) to include
    
*   **Levels/Years** — which PGY/year levels to include
    

The Monitoring Statistics panel on the right side updates as settings change, showing total trainees and licenses included in the roster. The panel should show approximately the number of trainees identified in the institution's signed agreement.

Settings are typically configured at implementation. They can be updated later, but changes to scope (especially adding new programs or trainee types) will produce a wave of monitoring events as the new licenses are processed for the first time.

### What kinds of trainees are monitored

Both **active and current** trainees are included — meaning the system uses a check of `(U.active=1 OR U.current=1)`, so a trainee just needs to be one or the other (not both) to be in scope (Ticket 188898). This means a recently-graduated trainee (current but not active) will continue to be monitored for some time after graduation.

**Visiting Resident types may be selectable in the settings, but Credentials Monitoring is intended for in-house employed residents only.** The system will only generate roster entries for active or current residents with an in-house training record showing employment by the home institution. Visiting records do not have this option, so visitors who are selected as a type will not actually be monitored even if their type appears checkable (Ticket 188898).

## Custom Alerts

The Custom Alerts tab lets the GME Office configure email alerts triggered by specific update types. Alerts are _email-only_ — they do not appear in Urgent Tasks. (Urgent Tasks are reserved for the standard License Updates flow that requires GME approval.)

For each alert, configure:

*   **Update Type** — matches one of the monitorable update types (status change, expiration change, etc.)
    
*   **Trigger** — `Monitor` (alert sent when the update is identified) or `GME Approval` (alert sent only after the GME Office approves it)
    
*   **Alert Status** — Active or Inactive
    
*   **Recipients** — Resident, Program Director, Program Administrator, GME Office, and/or Other (free text)
    
*   **Email Subject** and **Email Content**
    

The Email Content supports dynamic tokens that are replaced at send time. The complete list of tokens is shown in the manual. Common ones:

*   `{NAME_F}` / `{NAME_L}` — trainee first/last name
    
*   `{EID}` — trainee employee ID
    
*   `{NPI}` — trainee NPI
    
*   `{PROG}` — current program
    
*   `{LEVEL}` — current PGY/level
    
*   `{LICENSE_TYPE}` / `{LICENSE_EXPIRES}` / `{LICENSE_ISSUED}` — license details
    
*   `{LICENSE_UPDATE}` — the change itself
    
*   `{DIRECTOR}` / `{DIRECTOR_EMAIL}` / `{ADMIN}` / `{ADMIN_EMAIL}` — program contacts
    

Matches between MedHub and Symplr are performed by **license number + license type**.

## How the integration works

Credentials Monitoring runs as a continuous background interface. The end user sees license updates appear in their list periodically, but the actual mechanics are largely invisible to them.

### File pickup schedule

A service runs every few hours starting around **6 AM Central Time** to pick up files from Symplr's FTP directory. It runs through most of the day and disables around **midnight Central Time** for a maintenance window. Files left on the Symplr FTP directory are purged after **14 days**.

### License update check frequency

Symplr does not check every license every day. The check frequency depends on how close the license is to expiring:

*   **More than 4 weeks from expiration**: checked monthly
    
*   **2-4 weeks from expiration**: checked every 4 days
    
*   **Less than 2 weeks from expiration**: checked every 2 days
    
*   **Newly added licenses**: processed that day
    

This frequency cannot be adjusted per institution.

### When a roster entry is sent

The decision of whether MedHub sends a license to Symplr's roster depends on the license type and what's changed:

**State Licenses.** A roster entry is sent for licenses whose type matches the institution's selected license types in Settings → Licenses to Monitor. Within a trainee's record:

*   **Not modified**: A license already in the active roster, with the same license number and same state on the Certifications tab, is _not_ re-sent.
    
*   **Modified**: A license whose number or other key field differs from the active roster entry is sent as a modified record.
    
*   **New**: A license not currently in the roster is sent as new. Every 7 days, a new roster record is generated for new licenses still pending review from Symplr, while the license expiration date falls within a configurable window. **The default window is 75 days back to 40 days forward from today.** This window is configurable per institution via `cactus_check_days_prior_expire` (default 40 forward); behavior may vary slightly between sites.
    

**DEA Licenses.** Roster entries are only sent if the DEA number changes or the DEA expiration date falls within the same window (75 days back / 40 days forward by default). DEA monitoring runs **continuously every day** — an update was made in 2022 that switched DEA from a weekly to a daily pull (AMBS-8689, Ticket 202250). If a DEA number doesn't change, no new roster record is sent until the expiration date approaches the configured window.

**Controlled Substances.** Same pattern as DEA — only re-sent if the CS number changes or expiration date enters the window.

The August 2020 update changed the underlying logic to look for upcoming **expiration dates** rather than just status changes. This was specifically to capture temporary licenses, which trainees re-apply for each year and which therefore don't trigger a "status change" event. Institutions saw an increase in monitoring events after this update because more licenses were now flowing through (CK 7/24/2020).

## What to expect when entering a license

Because Credentials Monitoring runs as a background process, the end user has no direct feedback that it's working. This timeline helps set expectations:

*   **Day 0 (today)**: User enters or updates the license on the trainee's Demographics → Certifications tab. The trainee is added to the next outgoing roster file.
    
*   **Tonight**: MedHub's export cron generates the roster file and sends it to Symplr's FTP directory.
    
*   **Tomorrow night**: Symplr's service goes out to look up the license. Results may be returned the same night or the following night, depending on volume.
    
*   **Day 2-3**: MedHub's import process picks up the response file and creates a license update entry. The GME Office now sees the update in their Urgent Tasks and on the License Updates tab.
    
*   **Day 2-3+**: GME Office reviews and approves/rejects the update. Approved updates flow to the trainee's Certifications tab.
    

**Total expected turnaround: 2-3 business days from manual entry to having the license actively monitored.** This timeframe is not adjustable.

If a license has been entered for several days and nothing has appeared in License Updates, that's a signal something is wrong — most often a formatting issue or a missing field on the trainee record (see Troubleshooting).

## Required fields and formatting rules

A few formatting and field rules cause most of the "No Match Found" and "license not pulling through" tickets:

### State field is required for state licenses

The State field on the Certifications tab is **required** for state licenses, because every state has a different lookup site. Without a state, Symplr doesn't know which board to query (Ticket 169941).

A subtle gap: if the State field is populated through a **dynamic form** rather than direct entry, the system does not perform the same validation, and the State value may not actually flow into the field used by the integration. If a batch of trainees were onboarded through a dynamic form and none of their licenses are pulling through, this is a likely cause — Tier 2 can batch-update to populate the field correctly.

### License number prefix conventions

Most license types accept the license number with or without state-specific prefixes. The exceptions are **Physician** and **Resident Physician** license types, where the state categorizes by prefix (e.g., A, G, C in some states). For these, the prefix must be included exactly as the state lookup site expects.

For DO licenses with a 20A prefix, Symplr's code strips the prefix before searching.

The general rule: **enter the license number exactly as it appears on the state board's lookup site.** If you can find the trainee's license by searching for the entered number on the actual state board site, Symplr should be able to too.

### Allopathic license A-prefix

For allopathic licenses, the 'A' prefix should be entered in front of the license number. Without it, Symplr's lookup will not match and no updates will pull through (Confirmed TM, original SKU).

## Multi-state limitation

**Credentials Monitoring can only be configured for one state per institution for Controlled Substance monitoring.** The root setting `setting_cactus_configA['cs_state']` controls the single state used for CS lookups, and cannot list more than one state.

**This limitation applies only to Controlled Substance licenses.** State medical licenses, DEA, NPI, and PECOS are not affected by `cs_state` and will be monitored regardless of which state the trainee is licensed in (Tickets 171073, 200372, AMBS-8621, AMBS-6783).

For institutions with campuses in multiple states (e.g., Mayo Clinic with Minnesota, Arizona, and Florida campuses), state medical licenses for all three states will be monitored correctly. Only Controlled Substance is restricted to the single configured state.

If an institution needs Controlled Substance monitoring for multiple states, this is not currently supported and would require a product enhancement.

## Updating an existing license

There are two scenarios for updating a license, and they have different best practices.

**Going from Limited to Permanent Medical License.** Click +Add License and enter the new permanent license info. **Do not delete the limited license info** — this area is meant to be a log of all licenses the trainee has held. Having two licenses (one limited, one permanent) does not affect monitoring; deleting the old one only removes useful history (per Tom May).

**Correcting a typo or formatting issue.** Click +Add License and enter the correct info, then delete the row with the incorrect info. This is the only case where deletion is appropriate.

For non-medical license types like Controlled Substance or ACLS, updates work slightly differently: remove the current data, click Save for the tab, then re-enter the data, click Save for the tab.

> **Why this matters**: Editing an existing license entry directly may remove it from the monitoring roster and cause the license to no longer be monitored. The "add new + delete old" pattern preserves the roster association cleanly.

## Troubleshooting

### "No Match Found"

The most common Credentials Monitoring error. It means Symplr could not find a match on the state board's lookup site for the license number provided.

The cause is almost always **formatting** — a prefix that should or shouldn't be there, a space, a special character, or a number entered slightly differently from how the state board displays it.

The recommended workflow:

1.  **Leave the "No Match Found" entry in place.** Rejecting or accepting it does not help resolve the underlying issue, so it's best to leave it until the issue is fixed and re-evaluated.
    
2.  **Verify the license on the state board's lookup site directly,** using the license number as entered in MedHub. If you can find it, the formatting in MedHub is good. If you can't, the formatting is the problem.
    
3.  **Remove and re-enter the license info in MedHub.** For main Medical Licenses: delete the current entry, click +Add License to enter it back in. For other licenses (CS, ACLS): remove current data, click Save, re-enter data, click Save.
    
4.  **Wait 3 days** for Symplr to check the new entry and pull it back into MedHub.
    

If the license is still returning No Match Found after a re-entry and 3 days, escalate. There may be an integration issue with the specific state board's lookup page rendering — Symplr has periodically had to update their integration with state lookup sites (Ticket 185840 mentions DCA in California).

### License updates seem to have stopped or slowed

Check whether the institution is processing updates promptly. The system recommends processing all monitoring events within a month. If multiple monitoring events accumulate for the same license, **old data could overwrite newer data if approved in the wrong order.** This is one of the most common causes of "I'm not seeing updates I expect to see" — the queue has older entries that are out of date.

For a specific license that has stopped updating, check whether a key field changed (number, state) without the proper add-new-then-delete-old workflow being followed. Editing in place can drop the license from the monitoring roster.

### "Documentation" link returns a 500 error

This is by design. The documentation link expects a tagged file from Symplr behind it. For automated status updates that are based on expiration (i.e., the system marked a license as expired because the expiration date passed, and Symplr did not send a corresponding file), there is no documentation file to display, so a 500 error appears.

What _should_ have happened: the trainee's license should have been renewed before reaching expiration, and a renewal would have triggered a license expiration update accompanied by a new license document. **A license should never reach expiration when Credentials Monitoring is operating correctly.** A 500 on the documentation link is a downstream symptom of an unrenewed license (Ticket 232755, AMBS-10526).

### Multiple licenses for the same state

If a trainee has two active license records of the same state and one is already being tracked (not edited or updated in any way), the second record will be skipped and not added to the roster file. This is by design.

### Lookup site returns multiple results

For some state boards, when the initial license number search returns multiple results (e.g., the same number issued under variations of the trainee's name), Symplr matches further using **last name**. If the last name on file in MedHub doesn't match the last name as displayed on the state board's License Details page (e.g., due to a name change, hyphenation, or alternate name), the match will fail and "No Match Found" will be returned.

There is currently no way to submit alternate names through the integration. The name in MedHub must match the name on the state board's record (Ticket 185840 from California).

### Task script for orphan files

There is a root-side task script to identify monitoring records that reference a file but for which no file actually exists:

`https://{client}.medhub.com/functions/tasks/lemm_files_missing.mh`

Useful when monitoring records appear stuck or display behavior is inconsistent.

### How to check a DEA license manually

Support does not have direct access to DEA license lookups. Institutions typically have a paid subscription to a service like [deanumber.com](http://deanumber.com) (UAB's example). For a DEA-related question that can't be answered through the standard integration, the institution would need to use their subscription directly. The DEA's own current lookup site is `apps2.deadiversion.usdoj.gov/RDA/login.xhtml`, which requires login credentials (Ticket 167656).

## NPI Query

The NPI Query tool searches the National Provider Identifier registry. Two modes:

*   **Find missing NPI numbers**: Search by trainee first name + last name + state.
    
*   **Verify existing NPI numbers**: Verify the entered NPI matches the trainee's name in the registry.
    

NPI Query is run from Resident Management → Credentials Monitoring → NPI Query. Filters include Query Scope, Resident Status (active/incoming/current/all), Programs, Trainee Types, and Levels.

The query may take several minutes for large scopes. Common names (John Smith, James Smith) may not return unique matches, in which case manual verification is required.

After running, the GME Office can use Batch Action to apply NPI updates to multiple trainee records at once. Verify discrepancies before bulk-updating, since the registry data may not match what's intentionally in MedHub.

It is recommended to run NPI Query _before_ PECOS Query, since PECOS uses the NPI as a query parameter.

## PECOS Query

The PECOS Query tool searches the Provider Enrollment, Chain and Ownership System database for Medicare provider enrollment status.

> **PECOS Query is currently unavailable pending an enhancement.** See MEDM-6330 for status. The data team is able to query PECOS directly for clients who request it as a one-time pull (example: MHDP-3863).

When working again, PECOS Query uses the trainee's current NPI number (which must be entered in MedHub) to:

*   **Identify new enrollments**: search PECOS for any enrollment associated with the trainee's NPI
    
*   **Verify existing enrollment**: confirm the trainee's PECOS enrollment status
    

The PECOS checkbox field must exist on the Demographics tab and be checked for the trainee. If the field is missing, contact MedHub Support.

When this functionality is restored, the workflow will mirror NPI Query.

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_cactus`

Master toggle / configuration for Credentials Monitoring at the institution.

`setting_cactus_configA`

Configuration array. The `cs_state` value within this array sets the single state used for Controlled Substance lookups.

`cactus_check_days_prior_expire`

The window (forward in days) used to determine if a license is approaching expiration. Default 40. Combined with the implicit 75-day backward window for new roster records still pending review.

`settings_cactus_filename`

Defines the filename pattern for outbound roster files. Supports dynamic tokens (see implementation guide).

`settings_cactus_filetitle`

Roster file title configuration.

`settings_cactus_start_date`

Implementation start date for Credentials Monitoring at the institution.

`settings_cactus_title`

Display title for Credentials Monitoring at the institution (this is the term-translation setting — controls whether the institution sees "Credentials Monitoring," "License Aware," or another name).

`settings_npi_query`

Enables NPI Query functionality.

`settings_pecos_query`

Enables PECOS Query functionality. (Currently unavailable pending enhancement.)

`settings_demo_required_npi`

Whether NPI is a required field on demographics.

`settings_demo_duplicate_npi`

Controls handling of duplicate NPI numbers across trainees.

The setting names retain "cactus" because they were created before the rename to Symplr; the names themselves are unchanged.

## Database tables appendix

Table

Purpose

`ref_lemm_roster`

The active monitoring roster — what licenses are currently being monitored. (`lemm` = License Expiration Monitoring Module, the internal name for the integration.)

`ref_lemm_updates`

License update events received from Symplr awaiting GME approval. The License Updates tab displays records from here.

`ref_lemm_alerts`

Custom alerts configuration.

License data itself lives on the trainee's certifications, in the user-side certification tables — the `lemm` tables hold the integration state separately.

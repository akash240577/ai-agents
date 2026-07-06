# MedHub - Read-Only Accounts - markdown

# MedHub - Read-Only Accounts

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

A **Read-Only account** (user type 7, code `n`) is a MedHub account with view-only access — the user can see configured areas but cannot edit anything. Read-Only accounts are used in three primary scenarios:

1.  **Outside Faculty serving on a CCC or PEC** — physicians who aren't part of the program's Faculty roster but participate in the Clinical Competency Committee or Program Evaluation Committee.
    
2.  **Institutional reviewers / accreditation visitors** — ACGME site visitors, CLER reviewers, or institutional auditors who need to see specific data without the ability to make changes.
    
3.  **Read-only viewers for transparency or oversight** — for example, a Chief Medical Officer who wants visibility into evaluation completion rates or work hour compliance without an administrative role.
    

This document covers Read-Only accounts as their own access pattern: creation surfaces, the access points granted to a Read-Only account, the CCC/PEC integration (how Read-Only members on committees see evaluations), and the operational scenarios that come up.

It does not cover: the CCC/PEC committee membership feature itself (see **MedHub - Security & User Management** §"Committee membership"); the GMEC committee membership pattern (same doc §"GMEC and GMEC Subcommittees"); or full Faculty account creation (see **MedHub - Demographics — Faculty**).

## Where it lives

Read-Only accounts are created from two surfaces depending on scope:

> **Administrator → Security → Read-Only Access** — creates Read-Only accounts scoped to a specific program. Used most often for outside-faculty-on-CCC scenarios.
> 
> **GME Office → Security → Read-only Access** — creates Read-Only accounts at the institution level. Used for institutional reviewers, accreditation visitors, or oversight roles that span multiple programs.

The user type assigned in both cases is the same (Read-Only, type 7 / `n`); only the scope of access differs.

## Creating a Read-Only account

The creation form on either surface captures:

*   **Name** (first, last, optional middle)
    
*   **Username** and **password** (or SSO if institution uses SAML)
    
*   **Email** for password reset / notifications
    
*   **Program assignment** (Administrator-side) or **institution-wide** (GME Office side)
    
*   **Access points** — what areas the Read-Only account can see (see "Access points for Read-Only accounts" below)
    

A Read-Only account does NOT receive the same access points catalog as a Program Administrator. The access points available to Read-Only are tailored to view-only oversight — generally evaluations, demographics, schedules, conferences, procedures, work hours, and dashboards. They cannot be granted Security, Program Settings, Forms, Delivery, or any access point that implies write capability.

## Access points for Read-Only accounts

The Read-Only access point catalog is intentionally narrower than the Program Administrator catalog — it surfaces only viewing capability:

*   **Resident Demographics (view)** — see Resident Demographic profiles.
    
*   **Faculty (view)** — see Faculty Demographic profiles.
    
*   **Evaluations - Viewing** — see completed evaluation forms and responses.
    
*   **Reports - Evaluations** — run evaluation reports.
    
*   **Schedules - Rotations** — view rotation schedules.
    
*   **Schedules - Shifts/Calls/Clinics** — view shift/call/clinic schedules.
    
*   **Procedures (view)** — view procedure logs.
    
*   **Conferences (view)** — view conference data.
    
*   **Work Hours (view)** — view work hour timesheets.
    
*   **Resident Absences (view)** — view absence records.
    
*   **Resident Dashboards (view)** — view generated dashboards (when configured for Read-Only access on the dashboard).
    

The access points granted should match the role's purpose. For an outside CCC member, Evaluations - Viewing and Reports - Evaluations are typically the minimum (so they can review completed evals during CCC meetings). For an accreditation visitor, broader access (work hours, demographics, schedules) makes sense.

## Read-Only accounts on the CCC

The most common Read-Only scenario is the **Outside Faculty CCC member** — a physician from another department or institution who participates in the program's Clinical Competency Committee but isn't part of the program's faculty roster.

The standard workflow:

1.  **Administrator → Security → Read-Only Access → Add a Read-Only account** for the outside Faculty member.
    
    *   Grant Evaluations - Viewing and Reports - Evaluations as a minimum.
        
    *   Optionally also grant Resident Demographics and Resident Dashboards.
        
2.  **Administrator → Security → Clinical Competency Committee → Read-Only tab → Select the Outside Faculty member.**
    
    *   The Read-Only account now appears as a Read-Only-tab CCC member.
        
3.  The outside Faculty member logs in with their Read-Only credentials. The CCC link appears on their Home page (because they're a CCC member). They can review completed evaluations, milestone scores, and the Progress Report — but cannot modify anything.
    

(BG confirmation, source page 141230196.)

This pattern preserves the institution's faculty roster (the outside Faculty isn't added as a regular Faculty account they don't belong to) while still giving the person CCC visibility.

## Read-Only accounts on the PEC

Same pattern as CCC. The Program Evaluation Committee Read-Only tab on Administrator → Security → Program Evaluation Committee accepts Read-Only accounts in the same way — for outside reviewers participating in program evaluation.

## Read-Only accounts and Resident Dashboards

When Resident Dashboards are configured with Read-Only as one of the user types in the Dashboard Access list, Read-Only accounts can view dashboards through the UI as part of CCC review. See **MedHub - Resident Dashboards** §"Dashboard Access vs. Email Recipients."

The Read-Only user can also be added as an Email Recipient to receive the dashboard PDF directly when it auto-generates.

## What Read-Only accounts cannot do

*   **Cannot edit any data** — no Save, Submit, Update buttons appear in the UI for them.
    
*   **Cannot be granted write access points** like Security, Program Settings, Forms, Delivery, or any access that implies modification.
    
*   **Cannot create or modify other accounts** — Read-Only accounts are users, not administrators.
    
*   **Cannot complete evaluations.** When acting as an evaluator, the person needs a Faculty account or an Outside Evaluator setup, not a Read-Only account. (See **MedHub - Demographics — Faculty** §"Outside Evaluator" for the eval-specific outside-evaluator pattern.)
    
*   **Cannot self-register** — must be created by Administrator, GME Office, or MedHub Support.
    

## Comparison with related access patterns

Read-Only is one of several patterns for granting limited visibility. Choosing among them:

Need

Pattern

Outside Faculty needs to participate in CCC/PEC review

**Read-Only account** + add to committee Read-Only tab

Outside physician needs to complete evaluations only

**Outside Evaluator** (configured under Faculty Demographics → Outside Evaluators)

Faculty needs broader admin-like visibility (e.g., a PD wanting to see all resident eval data)

**Faculty Mentor with All Residents + Evaluations access** (avoids granting Risky Access Points)

Institutional auditor needs broad read access across the institution

**GME Office → Security → Read-only Access** (institution-scoped Read-Only)

Faculty member transitioning between programs and needs the old program's CCC visibility for one cycle

**Read-Only on the old program's CCC** (for the duration), then remove

## Operational scenarios

### "Outside Faculty member needs to be on the CCC but isn't in our faculty roster"

Standard Read-Only-on-CCC workflow above. Administrator → Security → Read-Only Access → add Read-Only account. Then Administrator → Security → Clinical Competency Committee → Read-Only tab → select.

### "An accreditation site visitor needs to see work hour and evaluation data for a week"

Create a GME Office-side Read-Only account with appropriate institution-wide access points (Work Hours, Reports - Evaluations, Resident Demographics, Schedules). Set a temporary password the visitor uses for the week. After the visit, set the account inactive (don't delete — keep an audit trail of who had access during accreditation).

### "Read-Only user can't see the CCC link on their Home page"

Same root cause as for Faculty CCC members: they need to be associated with the program. For Read-Only accounts, this is via the Read-Only tab on the CCC, which is also where the program assignment is implicitly captured. Re-check Administrator → Security → Clinical Competency Committee → Read-Only tab to confirm the Read-Only account is in the list. If they're listed but still don't see the link, escalate — possible regression, similar to the AMBS-7954 / Ticket 188152 pattern.

### "We need to revoke a Read-Only account immediately"

Same as any other account: GME Office → Security → Read-only Access (or Administrator → Security → Read-Only Access for program-scoped) → set Active checkbox to off → Save. The account is immediately disabled. Consider also removing them from any committee Read-Only tabs they were on, so they don't reappear if reactivated later.

### "Read-Only account holder is also a regular Faculty at a different program — can we link the accounts?"

Yes. User Links work for Read-Only accounts the same as for any other accounts, as long as both accounts belong to the same person. See **MedHub - Security & User Management** §"User Links."

### "Should this person be Read-Only or an Outside Evaluator?"

Distinct features:

*   **Read-Only** = view access to data. They can see things but cannot complete evaluations.
    
*   **Outside Evaluator** = ability to complete evaluations only. They get a per-evaluation login link and can fill out a form, but they don't have a MedHub Home page or broad data access.
    

If the person needs to **review existing evaluations** for CCC purposes → Read-Only.  
If the person needs to **complete new evaluations** about a trainee → Outside Evaluator.  
If they need both → consider whether they should just be a Faculty member instead.

### "Read-Only account on the CCC isn't seeing milestone scores"

The Read-Only account needs the right access points. For milestone visibility through the CCC, Reports - Evaluations and Evaluations - Viewing are usually required. Re-check the Read-Only account's access point grants on Security → Read-Only Access.

### "Reactivating a previously inactivated Read-Only account"

GME Office → Security → Read-only Access (or Administrator-side) → set Active checkbox back on. Access points and committee memberships are remembered from the prior active state. (Same behavior as Program Administrator inactivation/reactivation — see **MedHub - Security & User Management** §"Program Administrators (GME).")

## Settings appendix

Read-Only accounts don't have specific root settings. They're a user type — defined by the `7 / n` user type on the `users` table.

Per-account configuration:

*   **Active flag** — controls whether the account can log in.
    
*   **Access point grants** — per the catalog above.
    
*   **CCC / PEC membership** — controlled separately via Administrator → Security → Clinical Competency Committee → Read-Only tab and the equivalent for PEC.
    

## Database tables appendix

Table

Purpose

`users`

Master user record. Read-Only accounts have user type `7`.

`users_readonly`

Read-Only-specific profile data.

`users_access_points`

Per-account grant of access points. The values granted to a Read-Only account are limited to the view-only subset.

`admin_ccc_members`

CCC membership records. Read-Only members are stored here with a flag indicating they came from the Read-Only tab.

`admin_pec_members`

PEC membership records. Same pattern as CCC for Read-Only members.

`user_links`

When a Read-Only account is linked to another account for the same person.

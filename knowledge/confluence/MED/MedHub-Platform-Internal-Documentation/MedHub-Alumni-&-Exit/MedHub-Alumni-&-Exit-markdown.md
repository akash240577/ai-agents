# MedHub - Alumni & Exit - markdown

# MedHub - Alumni & Exit

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The **Alumni & Exit** functionality cluster covers what happens when a resident or fellow finishes their training: capturing their forwarding contact information, completing institutional checkout tasks (returning IDs, parking passes, completing pending evaluations), tracking them as alumni, and surveying them post-graduation about their training experience.

The cluster has three connected pieces:

1.  **Resident Termination/Graduation Wizard** — adds a Termination/Graduation record to the trainee's Training History, marking them as graduated, transferred, or otherwise no longer training.
    
2.  **Exit Checklist** — a customizable form delivered to graduating residents to capture forwarding contact information, confirm checkout tasks, and collect feedback. Some questions can be assigned to the Program Administrator instead of the trainee.
    
3.  **Alumni Tracking** — the alumni demographic record, alumni surveys (delivered to past graduates), and the workflow for keeping alumni contact info current.
    

This document covers all three pieces together because they share data flow (the Exit Checklist often populates Alumni demographic fields; the Termination Wizard is what unlocks Exit Checklist delivery) and because Support tickets on these features cross between them.

It does not cover: the Resident Advancement Task Wizard which handles year-over-year promotion of continuing trainees (see **MedHub - Onboarding** when expanded, or the Resident Advancement Task Wizard page); the Verification Request feature which supports post-graduation training verification (see **MedHub - Verification Requests**); contracts that flow from Training History (see **MedHub - Contracts**).

## Where it lives

For GME Office:

> **GME Office → Resident Management → Alumni Tracking** — manages Alumni Surveys and Exit Checklists, the master list of alumni records, and the delivery surfaces.
> 
> **GME Office → Task Wizards → Resident Termination/Graduation Wizard** — adds Termination/Graduation records to trainee training histories.

For Program Administrators: an Administrator with Resident Demographics access sees Exit Checklist delivery options on the trainee's profile (when the trainee has a Termination record or is in a "no future training" state).

For trainees: an Exit Checklist delivered to them appears as an **Urgent Task** ("Incomplete Exit Checklist") on their Home page. An Alumni Survey delivered after they've graduated arrives via email with a direct link — no MedHub login required.

## Resident Termination/Graduation Wizard

> **GME Office → Task Wizards → Resident Termination/Graduation Wizard**

The wizard adds a Termination/Graduation record to a trainee's Training History. Reasons include:

*   **Graduating / completing training** (the most common use)
    
*   **Changing programs** (e.g., transferring from IM to a fellowship within the same institution)
    
*   **Leaving the program** (resignation, transfer out, dismissal)
    

Adding a record via the wizard is **optional but recommended** for graduating trainees — many institutions value having the record on file for historical and reference purposes.

### Window of eligibility

> **Residents can only be terminated for up to 60 days after their training history ends.** Past 60 days, the wizard will not include them; instead, GME enters a Termination Date directly into the Training History record on the Demographic profile.

(Source: Resident Termination/Graduation Wizard SKU.)

The Resident Advancement Task Wizard has a similar 45-day window post-training-history-end (Ticket 182978) — different feature, different window.

### Approval

After the wizard generates Termination records, **GME approves them** before the records take effect. Until approval, the records sit in a pending state and the trainee is not yet terminated.

### Effect on the trainee's record

*   The trainee's Training History gets a Termination/Graduation record with the date and reason.
    
*   If `Set Alumni flag for recipients (if unset)` was selected when delivering an Exit Checklist, the Alumni checkbox in Resident Demographics → Training History is also flipped to true.
    
*   **30 days after the trainee's Training History end date, they automatically lose access to log into MedHub.**
    

### Special case: trainee advancing within the institution

When a trainee is graduating from one program and entering a fellowship at the same institution (e.g., IM resident → PCCM fellow), the Termination Wizard works correctly only because the **trainee type is changing** (Resident → Fellow). The future training history record stays in place along with the contract.

> **If the trainee type doesn't change** (e.g., a Resident with a future Resident record), running termination would remove the future record, contract, and schedule. Don't do this. (Ticket 150785, CD confirmation.)

If a trainee has a future training record at a different institution, you can still terminate them at the current one — but be aware that the next institution will set up their own training history record independently.

## Exit Checklist

The Exit Checklist is a form delivered to graduating residents to capture:

*   Forwarding contact information (post-residency address, phone, email) that will populate Alumni Address fields in their Demographic profile.
    
*   Checkout confirmations (returned ID badge, returned keys, returned parking pass, library materials returned, etc.).
    
*   Future training plans and reflections on their experience at the institution.
    

Some questions can be configured for the **Program Administrator to complete** rather than the trainee — typically the checkout-confirmation items.

### Creating an Exit Checklist

> **GME Office → Resident Management → Alumni Tracking → Exit Checklists tab**

GME builds the form (or modifies an existing one). Question types available:

*   **Free text** (short and long-form)
    
*   **Options** (a pull-down menu of choices the GME defines)
    
*   **Checkbox** (a single checkbox the trainee selects to confirm — used for "I have returned my ID badge" type confirmations)
    

> **There is no scale question type and no multi-select answer type** — the Exit Checklist is not the same as an Evaluation form. (Per the comprehensive ELR documentation 2/23/2024.)

> **Previewing the form does not show the Options pull-down or Checkbox correctly** — the preview view is different from how the trainee actually sees the form.

When the form is ready, GME changes the status to **Active (locked)** so it can be delivered.

#### Per-question responsible party

When building the form, each question can be assigned to **either the trainee or the Program Administrator**. Some institutions split: trainees fill in their forwarding info; Program Administrators confirm the checkout items.

> **If the responsible-party field is set incorrectly** (e.g., trainee assigned to a question that should have been the Program Admin's), the trainee will be unable to complete the form because they can't fill in the Admin's questions. Fix: change the responsible party on the question and re-deliver. (Ticket 125575, HN.)

> **The Program Admin only sees the Exit Checklist in their Urgent Tasks AFTER the trainee submits.** The system requires the trainee to submit first. (Ticket 147862, CD/TR.) This is by design — the trainee submits their portion, then the Program Admin gets the Urgent Task to complete their portion.

#### Cross-program visibility

> **When an Exit Checklist is pending Program Administrator responses or ready for review, ANY user with a Program Administrator role at the institution will see it in their Urgent Tasks** — regardless of whether they have access to that program. This is true even for Admins with no access boxes checked. (Ticket 150850, ES.)

In practice, this means a Surgery Program Administrator might see Exit Checklists for Internal Medicine residents in their Urgent Tasks. By design — but worth flagging to clients who find it surprising.

### Delivering an Exit Checklist

The **Deliver Exit Checklists** button on the Exit Checklists tab opens delivery options. Recipients can be selected by one of these filters:

1.  **Residents with (any) Recent Termination Records** — pulls residents who have a Termination record from 3 months before to 6 months after today's date. (Ticket 172855, AMBS-6893.)
    
2.  **Residents with Recent (completion) Termination Records** — same window as #1 but limited to "completed training" termination types.
    
3.  **Graduation Records Between Dates** — manual date range, useful for batch deliveries (e.g., "all 6/1/2024 - 8/1/2024 graduates").
    
4.  **Residents with no Future Training Records** — anyone whose training history ends without a future record at the institution. Useful when the GME hasn't run the Termination Wizard yet but wants to deliver early.
    

Two options at delivery:

*   **Don't resend if recipient was already delivered this form** — prevents duplicate assignments.
    
*   **Set Alumni flag for recipients (if unset)** — flips the Alumni checkbox in Training History on delivery. One way to bulk-mark trainees as Alumni.
    

> **Visiting Residents are NOT included** in any of these filters. The Alumni functionality does not support Visiting Residents. (Ticket 153176, SS confirmation.)

### Email behavior

> **An immediate "Exit Checklist Available" email is sent to the trainee on delivery.** No reminder emails are sent — only the immediate one.
> 
> If the Program Admin or PD returns the checklist to the trainee for additional information after submission, another email goes out at that time. Otherwise, no follow-up.

(Per ELR comprehensive documentation 2/23/2024.)

### Trainee experience

After the Exit Checklist is delivered:

1.  The trainee logs into MedHub.
    
2.  An **Urgent Task: "Incomplete Exit Checklist"** appears on their Home page.
    
3.  They click through and complete their assigned questions.
    
4.  After they submit, the Program Administrator (and PD, if configured for review) sees the checklist in their Urgent Tasks.
    
5.  The Program Admin completes any admin-assigned questions and approves.
    

> **The trainee has 30 days after their Training History ends before MedHub access is removed.** If the Exit Checklist isn't completed in that window, GME has to either extend the trainee's account or reset the checklist after access is restored.

### Approval

*   **Exit Checklists**: only the Program Administrator or Program Director can approve. GME cannot approve. (Ticket 87623.)
    
*   **Alumni Surveys**: there's no approval flow — the survey is just marked Complete or Incomplete based on submission status. (Ticket 87623.)
    

### Editing a delivered Exit Checklist

> **Cannot delete partially-completed Exit Checklists from the UI.** If a trainee has started but not finished, the only way to remove the response is via the data team (Tickets 168596, 176330, 218600, 250649 — recurring pattern at multiple institutions).

> **Can delete a not-yet-started Exit Checklist** from GME Office → Resident Management → Alumni Tracking → select the checkmark next to the assignment → Delete at the bottom.

If GME needs to add or modify questions in a delivered checklist:

*   Add the program associations to the new questions (if the question is supposed to apply to specific programs).
    
*   Click **Reset** on the completed responses for the affected residents.
    
*   The reset checklists reappear in the trainee's Urgent Tasks as "Incomplete Exit Checklists" with the new questions included. (Ticket 199543, JS 6/21/22.)
    

### Setting up Exit Checklist for a new client

The CSC enables Exit Checklist functionality by setting `setting_alumni` to `1` on the root side. Then they run the Alumni Setup task script via:

> `https://{client}.medhub.com/functions/tasks/setup_alumni.mh`

Follow the on-screen instructions. After completion, verify from a GME role that the Alumni Tracking link appears under Resident Management. (Confirmed BG.)

## Alumni Tracking

The Alumni piece sits alongside the Exit Checklist on the Alumni Tracking page. It captures:

*   **The Alumni demographic tab** on each former trainee's profile — Alumni Address, Alumni Email, Alumni Phone, Alumni Practice Type, and other Alumni-specific fields configured per institution.
    
*   **Alumni Surveys** — separate forms (different from Exit Checklists) delivered to past graduates to gather information about their post-residency careers, fellowships, board scores, satisfaction with their training, etc.
    
*   **The Alumni master list** — every trainee who has the Alumni flag set in their Training History tab.
    

### Alumni demographic fields

When the Alumni flag is set on a trainee, an **Alumni tab** appears on their Demographic profile. The default fields include Alumni Address fields and Exit Checklist Group / Alumni Survey Group views (showing past completed forms at-a-glance).

> **Alumni fields can be exposed to specific user types via permission settings, just like any other Demographics field.** Custom Alumni fields can be added by request.

### How Alumni address fields populate

Two paths:

*   **Auto-populate from Exit Checklist** — when the Exit Checklist has the **'Populate Alumni Address fields with response'** option enabled on the address-related questions, submitting the Exit Checklist automatically fills in the Alumni Address fields. (Confirmed BG.)
    
*   **Manual entry** — GME enters into the Alumni tab directly, or via the Resident Demographics Batch Import.
    

> **New Alumni demographic fields (added per-client request) do NOT auto-populate from the Exit Checklist** the way the original built-in fields do. They're populated via Resident Demographics Batch Import or via the Ad-hoc Resident Demographics report. (Confirmed CK.)

### Alumni Surveys

> **Alumni Surveys are functionally similar to evaluation forms but are NOT evaluations.** They're delivered via the Alumni Tracking page and are independent of the evaluation system.

Survey delivery:

*   GME builds the Alumni Survey under Alumni Tracking → Alumni Surveys tab.
    
*   Delivers to a list of Alumni filtered by graduation date or other criteria.
    
*   The Alumni receives an email with a direct link to the survey.
    

> **Alumni do NOT need to log into MedHub to complete an Alumni Survey.** The email contains a personalized link that takes them straight to the form. (Confirmed BG.)

This matters because by 30 days post-graduation, the alumni's MedHub login is automatically deactivated. The email-link survey path is the only way to reach them after that point.

#### Question types

Same set as Exit Checklists: free text, options (pull-down), and checkbox.

> **Alumni Survey "Checkbox" answer type is just one checkbox** — the user either selects it or leaves it unselected. It is NOT a multi-select. (Ticket 109709, ED documented by LS 2/7/2023.)

#### Approval

Alumni Surveys are only marked Complete/Incomplete. There is no GME approval workflow. (Ticket 87623, CS.)

### Alumni list maintenance

The Alumni master list shows every trainee with the Alumni flag set. Maintenance considerations:

*   **Inactive accounts**: when an alumnus's account becomes inactive (default is 30 days after Training History end), they no longer log in but their Alumni record persists.
    
*   **Address updates**: when an alumnus's contact info changes years later, GME has to update it manually in the Alumni tab. There's no self-service path for alumni to update their own info post-graduation.
    
*   **Long-term tracking**: institutions that want longitudinal Alumni Surveys (e.g., 1-year, 3-year, 5-year follow-ups) deliver each survey from the Alumni Tracking page, filtered to the appropriate cohort.
    

## Common scenarios

### "A resident has a termination record but isn't showing for Exit Checklist delivery"

Check when the termination record was approved. If approved very recently (today), the trainee status hasn't propagated yet. **Run the root-side script "Resident Status Update"**, then re-check the Exit Checklist delivery options. (Ticket 170760, JS 3/16/21.)

### "Exit Checklist questions show wrong programs after we copied a form from last year"

When an Exit Checklist is copied for a new academic year, program associations on the questions may need to be adjusted. Edit each question's program list, save, then reset any completed responses to surface the new questions to affected trainees. (Ticket 199543.)

### "We have a graduate going into our own fellowship — how do we handle their Exit Checklist?"

Run the Termination Wizard for the resident with **"completed training"** as the reason. Since the trainee type is changing (Resident → Fellow), the future training history record stays intact along with the contract. After approving the termination, the trainee will appear in the Exit Checklist delivery list. (Ticket 150785, CD.)

### "An Alumni Survey was sent and we want to know if it went out successfully"

The Alumni receives an email with a direct link. They don't log into MedHub. Check the email delivery log on the root side, or check the Alumni Survey response page in Alumni Tracking — submissions appear there.

### "Need to remove partially-completed Exit Checklists or duplicate Exit Checklist responses"

Cannot be done from the UI. Submit a Support ticket; the data team has scripts to remove these records. Recurring pattern at Geisinger, Cincinnati Children's, Advocate Health Care, and others (Tickets 168596, 176330, 218600, 250649).

### "Is there a way to send Visiting Residents an Alumni Checklist?"

No. Visiting Residents are not included in any of the Exit Checklist filters. The Alumni functionality does not support them. (Ticket 153176, SS.)

### "Why are Surgery Admins seeing Exit Checklists for Internal Medicine residents?"

By design. When an Exit Checklist is pending Program Administrator responses, ANY Program Administrator at the institution sees it in their Urgent Tasks. Even Admins with no access boxes checked. The system does not limit visibility to the primary admin of the relevant program. (Ticket 150850, ES.)

### "Trainee can't complete the Exit Checklist — gets an error about incomplete answers"

Some questions on the form are assigned to the Program Administrator instead of the trainee, but the trainee is being asked to complete them. Fix: GME edits the form, changes the responsible party on the affected questions to "Program Admin," save. Trainee can then complete their portion. (Ticket 125575, HN.)

### "Can GME approve an Exit Checklist?"

No. Only the Program Administrator or Program Director can approve. (Ticket 87623, CS.)

### "Alumni clicked the survey link but nothing loads"

Check if the survey is still active. If it's been inactivated, the link returns an error. If active, escalate — possible link expiration or email-mangling issue.

### "Auto-populate of Alumni Address from Exit Checklist isn't working"

Check that the **"Populate Alumni Address fields with response"** option is enabled on the address question on the Exit Checklist form. If the field is a custom Alumni field added later (not one of the original built-in Alumni Address fields), it does NOT auto-populate — those custom fields require Resident Demographics Batch Import or the Ad-hoc Resident Demographics report. (Confirmed CK.)

### "Trainee got an exit-checklist-style email but no Exit Checklist was delivered"

Check whether they received an Onboarding package email instead — package emails sometimes look similar. Check the trainee's package assignments first; the email subject line will clarify which feature it came from. (Ticket 236023, AMBS-11207.)

### "We need to send Verification request reminders that link to verify\_intro setting"

The `setting_verify_intro` setting holds HTML for the Verification Request introduction. **Some elements of the Verification Request form are hardcoded** and cannot be renamed via this setting (e.g., "Authority for Release" cannot be renamed in the form itself). HTML formatting (links, colors) within the intro is editable via inline HTML in the setting value. (Ticket 236128, AMBS-11148.) See **MedHub - Verification Requests** for the full doc.

## Open questions for Emma

None — the source material is comprehensive (ELR's 2/23/2024 walkthrough on Ticket 233462 covers most of the workflow end-to-end, and the cumulative ticket history fills in edge cases).

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_alumni`

Master toggle for Alumni & Exit functionality. `1` = on, `0` = off. Run the `setup_alumni.mh` task script after enabling.

Per-form options (configured per Exit Checklist or per question):

*   **Populate 'Alumni Address' fields with response** — populates Alumni Address fields in Demographics from the form response.
    
*   **Set Alumni flag for recipients (if unset)** — at delivery time, flip the Alumni checkbox on Training History.
    
*   **Don't resend if recipient was already delivered this form** — at delivery time, skip duplicates.
    
*   **Question responsible party** — Trainee vs. Program Administrator, per question.
    

## Database tables appendix

Table

Purpose

`users_residents`

Resident profile, including the Alumni flag and Alumni demographic fields.

`users_residents_pg`

Training History records. Includes Termination Date and reason.

`alumni_surveys`

Alumni Survey form definitions.

`alumni_surveys_responses`

Individual Alumni Survey submissions.

`exit_checklists`

Exit Checklist form definitions, including per-question responsible-party assignments.

`exit_checklists_responses`

Per-recipient Exit Checklist submissions and approval state.

`terminations`

Termination/Graduation records added via the Termination Wizard.

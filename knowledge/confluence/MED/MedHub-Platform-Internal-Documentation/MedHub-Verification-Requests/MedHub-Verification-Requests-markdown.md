# MedHub - Verification Requests - markdown

# MedHub - Verification Requests

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

Verification Requests is the MedHub feature that handles training verification letters — the official documentation an institution provides to confirm that a trainee did, in fact, train at the institution during specific dates, in a specific program, at a specific level. These letters are required by:

*   Future employers performing primary source verification
    
*   State medical licensing boards
    
*   Hospital credentialing offices
    
*   Other training programs (when the trainee transfers or applies elsewhere)
    
*   Visa applications and immigration
    

MedHub provides a **public-facing, login-free verification request portal** where external requesters (employers, licensing boards, etc.) can submit a verification request directly to the institution. The institution receives the request as an Urgent Task, generates a verification letter from a configured template, and the letter is digitally signed by the DIO (or Program Director, in program-level mode) and made available to the requester via a download link.

This document covers Verification Requests as a feature: the public request portal, GME vs. program-level modes, form templates and tokens, signature mechanics, the request processing workflow, the relationship to the legacy Forms/Files verification method, and the operational patterns that come up in support tickets.

It does not cover: ECFMG verifications (different feature, integrates with Resident Demographics); contract signature workflows (see **MedHub - Contracts**); or onboarding portal verifications by faculty reviewers (see **MedHub - Onboarding**).

## Where it lives

For the **GME Office**, Verification Requests are accessed from the home page → **Verification Requests** (label varies by client). The page lists incoming verification requests as Urgent Tasks, with options to process, reassign, or reject each request.

For **Program Administrators** (when program-level mode is enabled), Verification Requests are accessed from the program's home page; the link appears once `setting_verify_programs` is enabled and the program has opted in via Program Settings.

For **external requesters** (employers, boards), the public URL is constructed as:

This URL is the canonical entry point. The institution typically posts this link on the GME Office website with instructions for requesters.

### Form Templates (GME-controlled)

Form templates — the actual letter content with merge tokens — are managed by **GME Office → Form Templates** (or the institution-specific term for it). Templates support tokens that pull live data from the trainee's record (program, dates, PGY level, etc.) so the letter is dynamically generated at the time of the request.

> **Form Templates are GME-controlled, even in program-level mode.** When `setting_verify_programs` is enabled, GME Office still creates and maintains the templates; programs choose from the GME-authored library. GME can designate templates as for GME use, program use, or both.

## The two modes — GME-only vs. GME-and-Programs

Verification Requests support two modes:

### GME-only mode (default)

Default behavior. Verification Requests come into the GME Office. The GME Office processes each request, generates the letter from a template, and the **DIO's signature** appears on the letter.

The GME Office sees:

*   All incoming verification requests in Urgent Tasks
    
*   The processing options for each request
    

Requesters submit at the institutional public URL.

### Program-level mode (`setting_verify_programs = 1`)

When `setting_verify_programs` is enabled, programs can also use the verification request feature. The behavior:

*   **Functionality is disabled by default and enabled through Program Settings.** Each program decides whether to opt in.
    
*   **Requests are made through a different link** provided on the Program Settings page. The program's URL differs from the institution-wide URL.
    
*   **Program administrators receive alerts** and are responsible for processing new requests for their program.
    
*   **Program Director's signature is displayed** instead of the DIO's signature.
    

Additional behaviors with program-level mode:

*   GME Office still creates the form templates and designates which ones are for GME use, program use, or both.
    
*   GME Office has visibility of both institutional and program requests.
    
*   The "Reassign Program" option appears, allowing GME or programs to redirect a request to the correct program (see "Reassigning a request" below).
    

(Source: SKU on Verification Requests FAQs.)

## How a request is submitted

The external requester:

1.  Navigates to the institution's public verification request URL (typically posted on the GME Office website).
    
2.  Sees the public form with the introduction text from `setting_verify_intro`.
    
3.  Enters the trainee's identifying information (name, date of birth, training dates, etc.) and the requester's contact information.
    
4.  Submits the form.
    
5.  Receives an email confirmation with a unique link to download the letter once it's processed.
    

The trainee's training records are looked up from the submitted information. If the trainee can be matched, the request is queued in the GME Office's Urgent Tasks. If not, the request may be rejected or assigned manually.

### Introduction text

The setting `setting_verify_intro` controls the introduction text displayed at the top of the public verification request form. Used to provide instructions, contact information for questions, and any institution-specific guidance to the requester.

> **HTML required.** The setting value must use HTML tags for formatting. Plain text alone will display without formatting.

## How a request is processed

When a request appears in Urgent Tasks, the GME (or program) administrator:

1.  Opens the request and reviews the requester's information and the matched trainee.
    
2.  Selects the appropriate **Form Template** for the verification letter.
    
3.  The system generates the letter using the template, with merge tokens replaced by the trainee's live data.
    
4.  The administrator reviews the generated letter.
    
5.  The administrator approves the letter, which is then **digitally signed** (DIO in GME mode; Program Director in program mode).
    
6.  The requester receives an email notification with a download link.
    

### Reassigning a request

When `setting_verify_programs` is enabled, a **Reassign Program** option appears on the request. Used when:

*   GME Office determines the request should go to a specific program for processing
    
*   A program receives a request that should be handled by a different program
    
*   A program receives a request that should go back to GME (e.g., institution-wide verification needed)
    

(SKU confirmed.)

## Form Template tokens

The verification letter template supports merge tokens that pull live data from the trainee's record. The most-used tokens:

Token

What it pulls

`{PROG}`

The program name from the trainee's training history. **Use this instead of typing the program name** — typed names produce wrong-program errors when the template is copied from another program (see "Common pitfalls").

`{TRAINING}`

The trainee's training history dates. Calculates start of first record to end of last record.

`{TRAINING_LOA}`

Same as `{TRAINING}` but **adjusts for any LOA records** in the training history. Use this when the trainee has an LOA — `{TRAINING}` alone will produce incorrect end dates.

> **The** `{TRAINING_LOA}` token vs. `{TRAINING}` token. When a trainee has an LOA in their training history, `{TRAINING}` produces an incorrect end date because it doesn't account for the extension. **Switch to** `{TRAINING_LOA}` for that letter generation. A workaround when the institution doesn't want all letters to use TRAINING\_LOA: temporarily change the token in the template, print the letter, then switch the token back to its original state. (Ticket 197130, AMBS-8459.)

## Common pitfalls

### Wrong program in the verification letter

> **A verification letter shows a different program than the trainee was actually in.** The most common cause: the **Form Template was copied from another program** and the program name was **typed in** rather than using the `{PROG}` token. Open the Form Template, ensure the program reference is `{PROG}` (the merge token) instead of a hardcoded program name. (Ticket 141527.)

### Truncated download links

> **Verification letter PDF has a truncated download link.** This typically means the verification was created via the trainee's **Forms/Files tab** on their Demographics profile, NOT via the public verification request portal.
> 
> The Forms/Files method of verification requests is the **legacy ("old school") method** that predates the online verification request functionality. It produces truncated links and other display issues. **Recommended:** migrate to the online verification request functionality going forward. (Ticket 183904, confirmed JS 10/1/21.)

### LOA in training history producing wrong dates

See "`{TRAINING_LOA}` token" above. Switch to `{TRAINING_LOA}` for any letter where the trainee has an LOA.

## What happens when the public request form is disabled

If `setting_verify` is set to 0 (turning off the public verification request functionality), the behavior is non-trivial:

> **Pending verification requests are wiped.** When `setting_verify` is disabled, **outstanding verification requests are removed**. They cannot be processed after the setting is disabled.
> 
> If the institution wants to wind down the public form gradually:
> 
> 1.  Process all outstanding requests first
>     
> 2.  Then disable the setting
>     
> 
> (Ticket 198699, AMBS-8555, confirmed BG 6/10/2022.)

> **Disabled URL behavior.** Once `setting_verify` is disabled, anyone clicking the public URL `https://(client).medhub.com/functions/verifications/index.mh` will see an "invalid request" message. There is no way to redirect to a different URL with a custom message. (Ticket 198699.)

> **Re-enabling brings pending requests back as Urgent Tasks.** If MedHub Support re-enables `setting_verify`, the previously-disabled-incomplete verification requests will return as pending in the GME Office's Urgent Tasks. This was confirmed in testing. (Ticket 198699, AMBS-8555.)

For institutions worried about unintended consequences before disabling, the safe sequence is: process all pending → disable → if issues arise, re-enable; pending requests will reappear.

## Notification recipients

Verification request alerts are sent to users designated in **GME Office → Institution Settings → Alerts → Institutional Alerts → Verification Requests**. Both Primary and Secondary recipients receive alerts when:

*   A new public verification request is submitted
    
*   A request is reassigned (when `setting_verify_programs` is enabled)
    
*   A request requires processing
    

For program-level mode, the program's alerts go to the program's designated recipients (configured per program).

## Download limits

The setting `setting_verify_download_limit` controls how many times a generated verification letter can be downloaded by the requester. The default is **5**. Setting to 0 removes the limit.

This is a security/privacy mechanism — the letter contains the trainee's verified training history, and the institution may want to limit redistribution. Most clients leave the default at 5; some institutions with high-volume verification needs (e.g., during annual licensing cycles) increase or remove the limit.

## Common scenarios

### "An employer says they can't access the verification letter"

Three causes to check, in order:

1.  **Download limit exceeded.** The letter has been downloaded `setting_verify_download_limit` times. Either re-issue the request or temporarily raise the limit.
    
2.  **Public URL disabled.** The institution has disabled `setting_verify`. The link won't work; check with GME.
    
3.  **Email delivery failure.** The requester's email may have rejected the notification. The institution can resend or generate a new request.
    

### "A verification request hasn't been processed in weeks"

Most common cause: alerts not configured. Check **Institutional Settings → Alerts → Verification Requests** to ensure recipients are set. The Urgent Task itself is visible to GME Office in the verification requests page; if no one's checking, requests pile up.

### "Should I use the public form or generate a verification letter manually?"

Always use the **public form** going forward — it produces clean PDFs with correct download links and digital signatures. The Forms/Files tab method should only be used when the public form is unavailable (legacy clients, workarounds during outages).

### "We need verification letters for residents who graduated years ago"

The public form supports archived trainees. Submit a request through the public URL with the trainee's identifying info; the system pulls from training history regardless of current status. Confirm the trainee's training history is intact (some old records may need data team intervention).

### "We're disabling the public form temporarily — what happens to pending requests?"

Pending requests are removed when `setting_verify` is disabled. Process them first, OR re-enable the setting later (pending will reappear). (See "What happens when the public request form is disabled" above.)

### "We need a custom signature on the verification letter, not the DIO's"

In program-level mode (`setting_verify_programs = 1`), the **Program Director's signature** displays. To use a different signature, the institution would need to update the relevant signatory's profile or work with Support to configure custom signature behavior. There is no per-letter signature override in standard mode.

### "The form template is showing the wrong program"

Open Form Template → ensure `{PROG}` is used as the program reference, not a typed-in program name. Templates copied between programs often retain the original program name as plain text. (Ticket 141527.)

### "The training history dates on the letter are wrong because of an LOA"

Switch the template's `{TRAINING}` token to `{TRAINING_LOA}` for that generation. (Ticket 197130, AMBS-8459.)

### "We need to redirect a request to a specific program"

Enable `setting_verify_programs`. The Reassign Program option appears on each request, allowing GME or another program to reroute.

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` `setting_verify_intro` HTML requirements — the SKU notes the intro text "must use HTML tags." Worth confirming whether plain text is now supported or still strictly HTML.
    
*   `[VERIFY]` Whether the Forms/Files legacy method is officially deprecated — Ticket 183904 (10/1/21) recommends migrating away from it. Worth confirming if it's been formally retired.
    
*   `[VERIFY]` UME (student) verification request workflow — the SKU is GME-focused; confirm whether UME has its own equivalent (or if students request via dean's letters under a different feature).
    
*   `[VERIFY]` Schedule Verification (referenced in MHDP-3599 — UCLA Ticket 246417) — separate feature from the verification requests covered here? May warrant its own section or doc when more is known.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_verify`

Enables the public verification request functionality for GME. Default 0 (disabled); set to 1 to enable. **Disabling removes pending requests; re-enabling brings them back.**

`setting_verify_programs`

Enables program-level verification request functionality. Default 0; set to 1 to allow programs to opt in via Program Settings.

`setting_verify_intro`

Introduction text displayed at the top of the public verification request form. Must use HTML tags. Only used when `setting_verify` is enabled.

`setting_verify_download_limit`

Maximum number of times a generated verification letter can be downloaded by the requester. Default 5; set to 0 for no limit.

Institutional alert recipients (configured under **GME Office → Institution Settings → Alerts → Institutional Alerts**):

*   **Verification Requests** — Primary and Secondary recipients receive alerts when public requests come in or are reassigned.
    

## Database tables appendix

Table

Purpose

`verifications`

Primary verification request records — one per submitted request. Contains requester info, matched trainee, status, processing dates.

`verifications_files`

Generated verification letter PDFs and download metadata.

`verifications_downloads`

Audit of download attempts (used to enforce `setting_verify_download_limit`).

`verifications_templates`

Form Template definitions — letter body, tokens, designated use (GME-only, program-only, both).

`verifications_programs`

Program-level enablement flags and per-program template assignments (when `setting_verify_programs` is enabled).

`verifications_signatures`

Digital signature records on verification letters. DIO-level for GME mode, Program Director for program-level mode.

`users_residents_pg`

Resident training history — source of `{TRAINING}` and `{TRAINING_LOA}` token data, plus the `{PROG}` reference.

`users_residents`

Resident demographic data referenced in verification letters.

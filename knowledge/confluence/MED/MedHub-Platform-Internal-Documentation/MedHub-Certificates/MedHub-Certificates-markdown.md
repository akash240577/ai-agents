# MedHub - Certificates - markdown

# MedHub - Certificates

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The **Print Certificates** feature is the GME-only module that produces training-completion certificates for residents and fellows — the printable PDFs an institution issues to a graduating trainee documenting that they completed their training program at the institution. These certificates are the institutional document a trainee uses for board-eligibility paperwork, licensing applications, and the personal record.

Print Certificates is GME-only. There is no UME equivalent. There is no Faculty equivalent. **Certificates are not the same as "Certifications"** — Certifications are a subtab of the Resident Demographics profile that documents the trainee's professional certifications and licensure (BLS, ACLS, DEA, state medical license, etc.). Certifications are tracked-data; Print Certificates are issued-documents. This document covers Print Certificates only.

This document covers: where Print Certificates lives, how the link visibility is controlled (the institution-wide kill switch via `settings_certificates`), the two signature configuration paths (program-level via Program Information, institution-level via Print Certificates → Institution Signature Lines), how training history dates feed onto certificates, the LOA-induced date gap behavior, batch print considerations, the 2025 product policy change on custom certificates, and the operational patterns that come up in support tickets.

It does not cover: Demographics Certifications (the per-trainee tracking subtab — covered in **MedHub - Demographics — Resident**); CME certificates from conferences (covered in **MedHub - Conferences** §"CME certificates"); contract documents (see **MedHub - Contracts**).

## Where it lives

Print Certificates is accessed from the **GME Office home page → center column → Print Certificates** (label may vary slightly by client).

The page lists trainees eligible for certificates, with controls for:

*   Filtering by program, academic year, end date, certificate type
    
*   Selecting trainees to print
    
*   Configuring institution-level signature lines
    

> **The Print Certificates link can be hidden institution-wide via** `settings_certificates`. When `settings_certificates = 0`, the Print Certificates link does not appear on the GME home page at all. This is useful for institutions that handle certificate printing entirely outside MedHub (e.g., institutions where the medical staff office or a credentialing system owns the workflow, and MedHub data isn't the source). Default behavior at most institutions is enabled. Most users do not know this kill switch exists. (Confirmed by Emma 5/2/2026.)

## When certificates are typically printed

Per the editorial pattern documented in **MedHub - Training History**:

> **The standard year-end timing is end of April**, after GME has approved terminations submitted via the Termination Wizard by mid-April. The clean year-end sequence is:
> 
> 1.  **January-April**: Run the Termination Wizard for graduating trainees.
>     
> 2.  **By mid-April**: GME approves the terminations.
>     
> 3.  **By end of April**: Certificates are printed.
>     
> 4.  **May or later**: Run the Resident Advancement Wizard for continuing trainees.
>     

Certificates can be printed at any time (the system doesn't enforce a date), but the convention is to print after termination is approved so that the training history end date is final.

For trainees who graduate off-cycle (mid-year leave, transfer to another institution, voluntary departure), certificates are typically printed individually after the termination is approved.

## How training history dates feed onto certificates

Print Certificates pulls dates from the trainee's Training History records. Specifically:

*   **Start date** = start date of the trainee's **first** Training History record at the institution
    
*   **End date** = end date of the trainee's **last** Training History record at the institution
    

This is the simple case. It produces complications when there's anything between the first and last record.

### The LOA-induced date gap

> **When a trainee has an LOA-extension Training History record between their first and last records, the certificate displays the original start date and the (extended) final end date — but the LOA period itself appears as a gap.** The system is using the bookend dates of the trainee's overall training history, which can be a date range with discontinuities visible.
> 
> Example: Resident with original training 7/1/2018-6/30/2022, then a 90-day LOA extension producing a final record ending 9/30/2022. The certificate's date range is 7/1/2018-9/30/2022 — but if there's a Lapse in Training record reflecting the LOA between, the certificate may show a gap in the rendered date range.
> 
> **There is no setting to suppress this.** If the certificate needs to show a continuous date range, GME must edit the certificate manually after generation. (See **MedHub - Training History** §"Leave of Absence" for the underlying mechanics.)

### Date format inconsistency for Chief Residents (batch print)

> **A known by-design behavior: in batch print, Chief Resident certificates use the numeric date format while non-Chief certificates use the long date format.** When some certificates print as `7/1/2018 - 6/30/2022` and others as `July 1, 2018 - June 30, 2022` in the same batch, this is the cause.
> 
> The date formatting is based on the trainee's residency dates and the Chief Resident designation, not whether or not an LOA was recorded. Working as designed. (Ticket 173060, AMBS-6907, 8/24/21.)

If the institution wants consistent formatting across all batch-printed certificates, the certificates need to be edited manually after generation — there is no setting to override the formatting per-trainee.

## Signature configuration — two paths

Print Certificates supports signatures from program-level signatories (typically the Program Director, Department Chair, or both) and institution-level signatories (typically the DIO or institutional officials). The two signatures are configured in **different places**.

### Path 1: Program-level signatures (Program Information)

For signatories tied to a specific program — most commonly the Program Director and Department Chair:

1.  As GME Office, go to **Program List** → select the program.
    
2.  Open **Program Information**.
    
3.  The signature lines for resident certificates appear with two fields per signature line:
    
    *   A **blank text field** for the faculty's title (e.g., "Department Chair," "Program Director," "Chief, Internal Medicine")
        
    *   A **dropdown** listing all faculty in the program with uploaded signature files
        
4.  Select the appropriate faculty from the dropdown. Their signature image flows from their Faculty profile to the certificate at print time.
    

> **The faculty member must have a signature file uploaded** to their Faculty Demographics profile for their name to appear in the dropdown. (Faculty profile → upload signature image. See **MedHub - Demographics — Faculty** for signature image upload mechanics — same upload location as for contract signatures.)

### Path 2: Institution-level signatures (Print Certificates → Institution Signature Lines)

For signatories that apply across all programs — most commonly the DIO, but also possibly the Hospital CEO, the Department of GME representative, or other institutional roles:

1.  From the **Print Certificates** page (GME Office home → center column).
    
2.  Click the **Institution Signature Lines** button (bottom right).
    
3.  Configure the institution-level signature lines.
    

> **The faculty selectable here must also have a signature file uploaded** to their demographics profile. The dropdown only shows faculty with uploaded signatures. (Ticket 212682, JW 1/20/23, LS 12/19/2023.)

### Combining program and institution signatures

A typical certificate has both: the Program Director signs (program-level), and the DIO signs (institution-level). The certificate template determines the layout. Most institutions configure 2-3 signatures per certificate.

### "DIO's signature isn't appearing"

Same troubleshooting pattern as for contracts:

1.  Verify who is listed as DIO in **Institution Settings**.
    
2.  Go to **Home → GME Staff Members** → select the DIO's account.
    
3.  Confirm a signature file is uploaded to their profile.
    
4.  If no signature file is uploaded, the signature won't display.
    

(Same pattern as Contracts — see **MedHub - Contracts** §"DIO signature not appearing on contracts.")

### Re-saving signatures with the right format

If the signature file was renamed from `.gif` or `.png` to `.jpg` without actually re-saving as JPEG, the certificate may produce display errors (similar to the Contract HTTP 500 issue). **The fix: take a screenshot of the existing signature, save as a new JPEG with a different filename, and re-upload.** (See **MedHub - Contracts** §"Blank preview screen" for the same pattern.)

## The 2025 product policy change

> **As of 2025, MedHub no longer creates or customizes Print Certificates for client institutions.** Institutions that don't already have a configured certificate may use a basic default certificate. There is no statement-of-work pathway to commission certificate customization. (Ticket 217085, BG 4/14/2023; updated 3/25/2025.)

This is a meaningful change. Previously, institutions could submit a customer relationship manager (CRM) request with a statement of work for minor changes to their certificate (header text, font modifications, layout tweaks) — these were billed Dev work and produced a customized template.

After the 2025 policy change:

*   **Institutions with existing custom certificates**: keep what they have. The existing template continues to function.
    
*   **Institutions without custom certificates**: get the basic default. They cannot commission customization.
    
*   **Internal note for CSC**: Do not direct GME Office users to their CRM about certificate customization. CRMs have already been informed of the same policy.
    

If a client expresses dissatisfaction, the conversation is straightforward: the option to customize certificates is no longer available; the basic default certificate is what's offered going forward.

## Batch printing

The Print Certificates page supports batch printing — selecting multiple trainees and generating certificates as a single PDF document or set.

### Considerations for batch print

*   **Date format inconsistency** — see "Date format inconsistency for Chief Residents" above. Chief Resident certificates render in numeric format; non-Chief in long format.
    
*   **Memory/performance** — Batch printing very large cohorts (50+ trainees) can take time. Most institutions print in cohorts of 30 or fewer per batch.
    
*   **Filtering before printing** — use program, academic year, and end-date filters to narrow the cohort to the intended graduates. Don't print "All" without filtering, or you may include trainees still in training.
    

## Reissuing certificates

A graduated trainee may need a certificate re-issued years later (lost original, name change, certified copy needed for licensing).

### Standard reissue path

1.  Search for the trainee in the Resident Demographics profile (use the search-archived-residents path if needed).
    
2.  Confirm Training History is intact and dates are correct.
    
3.  Go to **Print Certificates** → filter to find the trainee → print.
    

The certificate generation pulls the same Training History dates as the original. **If the trainee's name has changed** (e.g., post-marriage), GME may need to update the demographic profile before reissuing.

> **GME can print a certificate for a trainee outside the typical year-end window.** The system does not lock certificate generation behind the termination workflow — but the Training History end date must be final. If the trainee was never properly terminated, run the Termination Wizard (or have GME add the termination record manually) before reissuing.

## When the certificate isn't accurate

Three common cases:

### "The certificate dates are wrong"

The Training History records are inaccurate. Fix the underlying Training History records first; certificates pull live data at generation time. (See **MedHub - Training History** for record modification mechanics.)

### "The wrong faculty signature is appearing"

For program-level signatures: check the Program List → Program Information → confirm the faculty member is selected in the signature dropdown and their signature file is uploaded.

For institution-level signatures: Print Certificates → Institution Signature Lines → confirm the correct faculty/DIO is selected.

> **The selected faculty must have a signature image uploaded** to their Faculty profile for their name to even appear in the dropdown. If they don't appear in the dropdown, ask them to upload one (or have GME upload one on their behalf).

### "The certificate header / language is wrong and we need to change it"

Per the 2025 policy change, **MedHub no longer customizes Print Certificates**. Institutions with a configured custom certificate continue to use it; institutions without one use the basic default. Customization requests are not accepted regardless of statement-of-work or billing path.

### "The Print Certificates link isn't appearing for our GME office"

Check `settings_certificates`. If set to 0, the link is hidden institution-wide. Set to 1 to enable the link.

## Common scenarios

### "We graduated 25 trainees but only 24 certificates printed"

A trainee was excluded by filter — typically by program filter, academic year filter, or end-date filter. Re-check filters or run the print individually for the missing trainee.

### "Our DIO is not on the certificates"

DIO is configured at the institution level. Check **Institution Settings** for the designated DIO, and confirm their signature image is uploaded to their GME Staff profile. The Institution Signature Lines section in Print Certificates pulls from this configuration.

### "We changed Program Directors mid-year — which PD signs the certificate?"

By design, certificates pull the **current** PD at the time the certificate is generated, not the PD at the time the trainee was active. This is similar to the Contract batch-print behavior (see **MedHub - Contracts** §"Old PD's signature appears on batch-printed contracts").

If a graduating trainee's certificate must show the PD who was in office during their training, the PD signature on the certificate must be configured before the new PD takes over, OR the certificate must be edited manually after generation.

### "The Print Certificates link disappeared overnight"

Check `settings_certificates`. If recently set to 0, the link is hidden — confirm with the institution if this was intentional. Set back to 1 if not.

### "Long date format on some certificates, numeric on others — looks unprofessional"

Working as designed (Ticket 173060, AMBS-6907). Numeric format is used for Chief Residents in batch print. Either edit the inconsistent certificates individually after generation, or print non-Chief and Chief separately for consistency within each batch.

### "We need a certificate for a trainee whose end date is incorrect"

Fix the Training History end date first (terminate via wizard or manually). Then print. Certificates pull live data; updating the certificate without fixing the underlying record will produce a temporary correction that doesn't persist if the certificate is re-printed later.

### "We don't use MedHub for certificates and want to remove the link"

Set `settings_certificates = 0`. The Print Certificates link will no longer appear on the GME home page. (Confirmed by Emma 5/2/2026.)

### "The Department Chair's signature isn't showing on a specific program's certificate"

Check Program List → select program → Program Information → resident certificate signature dropdown. Confirm the Chair is selected. If they aren't appearing in the dropdown, their signature file isn't uploaded — ask the Chair (or upload on their behalf via the Faculty profile).

### "We have customizations from years ago — are they grandfathered?"

Yes. Existing customizations continue to function. The 2025 policy change applies to **new** customization requests — institutions that already have a customized certificate keep it.

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Whether `settings_certificates` has any other side effects beyond hiding the link (e.g., does it affect background certificate generation, API access, or other certificate-related processes?). The setting was confirmed by you 5/2/2026 as a link-hider; confirming the full scope of its behavior is worth a Product check.
    
*   `[VERIFY]` The 2025 customization policy — confirm this is still in effect in 2026 and there hasn't been a softening of the rule.
    
*   `[VERIFY]` Whether the date format inconsistency for Chief Residents (AMBS-6907) has been addressed in any release since 2021.
    
*   `[VERIFY]` Whether the Institution Signature Lines feature has any UME-side equivalent (it shouldn't — Print Certificates is GME-only — but worth confirming there's no cross-feature interaction with Student Administrator signatures).
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`settings_certificates`

Hides the Print Certificates link on the GME Office home page when set to 0. Default is enabled (1) at most institutions. Useful for institutions that handle certificate printing outside of MedHub — set to 0 to suppress the link from view. (Discovered late by most users; confirmed by Emma 5/2/2026.)

The signature configuration uses no separate root settings — both program-level (via Program Information) and institution-level (via Print Certificates → Institution Signature Lines) configurations live in their respective UI surfaces, not as root settings.

There is no setting to override the date format inconsistency between Chief Resident (numeric) and non-Chief (long format) batch-printed certificates. Working as designed per AMBS-6907.

## Database tables appendix

Table

Purpose

`certificates`

Generated certificate records — one per trainee per academic year (when batched) or per generation event.

`certificates_templates`

Certificate template definitions — institution-specific layouts, header text, default formatting. The 2025 policy change means new customizations are not added to this table.

`certificates_signatures`

Per-certificate signature records — links the program-level and institution-level signatories.

`program_information`

Per-program signature line configuration (Program List → Program Information).

`institution_signatures`

Institution-level signature line configuration (Print Certificates → Institution Signature Lines).

`users_residents_pg`

Resident Training History — source of certificate dates (first record start date, last record end date).

`users_residents`

Resident demographics — source of trainee name on certificate.

`users_faculty`

Faculty profiles — source of signature images for both program-level and institution-level signatures.

`users_gme_staff`

GME staff profiles — source of DIO signature images.

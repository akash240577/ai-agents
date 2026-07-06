# MedHub - Contracts - markdown

# MedHub - Contracts

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The Contracts module lets the GME Office create, populate, deliver, sign, and store trainee contracts tied to each year of a trainee's Training History. Contracts in MedHub are **GME-only** (UME does not have an equivalent). Each trainee receives a contract for each appointment year — the contract is the legal document covering compensation, training expectations, signatures from the trainee/Program Director/DIO, and any institutional policies appended.

The contract lifecycle has six steps:

1.  **Update Pay Rate Table** — define salary amounts per academic year, per level, and (optionally) per appointment type
    
2.  **Create the contract** — author Contract Sections (the building blocks) and assemble them in a Contract Map
    
3.  **Add the trainee's Training History record** — when added, the system attempts to assign a default contract from the Contract Map
    
4.  **Assign the contract** — verify or override the default; reassign if needed
    
5.  **Deliver the contract** — Require Signature kicks off the e-sign workflow (or include in an Onboarding package)
    
6.  **Approve the contract** — once all parties have signed, GME approves
    

This document covers Contracts as a feature: Pay Rate Tables, Contract Sections, Contract Maps, the full token reference, signature line syntax (single and double signature lines, e-sign vs. pre-populated), the signature workflow, the 6-month e-sign window, contract delivery via Onboarding package, the approve workflow, batch print considerations, and the operational patterns that come up in support tickets.

It does not cover: Onboarding package configuration in detail (see **MedHub - Onboarding** §"Contracts in onboarding"); training history record mechanics that drive contract assignment (see **MedHub - Training History**); IRIS/billing aspects of contract data (see **MedHub - IRIS** when drafted).

## Where it lives

The GME Office accesses Contracts from the home page → **Contracts**. The page has these subtabs:

*   **Contracts** — the master list of contracts (per trainee, per academic year), with action menu options
    
*   **Contract Sections** — author the modular sections that make up the contract body
    
*   **Contract Maps** — assemble Contract Sections into the deliverable contract, with priority-based assignment to programs/levels/trainee types
    
*   **Define Contract Addenda** — upload addendum files (institutional policies, etc.) that appear alongside the contract
    

Pay Rate Tables are managed in **GME → Institution Settings → List Management → Pay Rate Tables** — a separate location from the Contracts module itself.

## Step 1: Pay Rate Table

The Pay Rate Table is the source of all salary data on contracts. The table contains rates per **academic year**, per **level (PGY)**, with columns for **Daily**, **Monthly**, and **Annual** salary amounts.

### Key behaviors

> **Pay Rate Table must be set up BEFORE creating the trainee's Training History record** for salary to flow into the contract automatically. If the Training History record is created first, the contract will be issued without a salary or with a $0 salary, and the Pay Rate Table addition won't retroactively populate the contract — the GME Office will need to re-modify the Training History record to trigger the lookup.

> **One default Pay Rate Table is the recommended pattern.** Each year, update the same default table for the new academic year. Multiple Pay Rate Tables are possible under special circumstances (e.g., institutional splits, separate funding sources for fellows vs. residents), but most institutions use one.

### How rates are looked up

When a contract is generated:

1.  The system looks for a Pay Rate Table for the **academic year of the contract**.
    
2.  If the year-specific table exists with non-zero rates → those rates are used.
    
3.  If the year-specific table exists but rates are $0 (table created but not yet populated) → **$0 is used**.
    
4.  If no year-specific table exists → the system looks back to the **most recent year that a Pay Rate Table was defined** and uses those rates, even if those rates are now stale.
    

This produces two recurring confusions:

*   **Last year's salary appears on a new contract.** The new academic year's Pay Rate Table hasn't been populated yet (or doesn't exist). The system fell back to the prior year's table. Update the new year's table, then re-modify the affected Training History records to refresh the lookup. (Ticket 83909, confirmed TR.)
    
*   **$0 salary appears on a contract.** Either the Pay Rate Table for the year exists with no amounts entered, OR a Date Effective field on the table doesn't encompass the trainee's training history dates. **Try re-saving the Pay Rate Table** without making changes — for new sites, this can resolve $0 salary issues. (Tickets 174426, 234320, AMBS-10707, confirmed MC 3/11/24.)
    

### "Pay rate says Undefined"

If the Pay Rate token displays "Undefined" instead of a value, no Pay Rate Table is set as the default. Go to List Management → Pay Rate Tables → designate a default → re-modify each affected Training History record. (Confirmed SS.)

### "I can't change the academic year in the Pay Rate Table"

The academic year defaults to the current academic year. To enter rates for next year (e.g., entering 2025-26 rates in spring of 2024-25), **change the academic year dropdown to 2025-26** before entering values. The Table itself is reused across years — the rates are scoped per academic year within the same table. (Ticket 147733, confirmed JS.)

### Effective Date field

The Date Effective field on the Pay Rate Table allows the institution to specify when a given rate set becomes active. **Common error**: a Date Effective is set that doesn't encompass the trainee's training history dates, producing $0 in the contract. Either remove the Date Effective constraint or expand it. (Tickets 174426, 234320.)

### Chief Bonus

The Chief Bonus field on the Pay Rate Table stores an additional amount to add to the trainee's PGY rate when the trainee is designated as a **Chief Resident** in their Training History record (chief checkbox checked).

> **The Chief Bonus is added on top of the PGY amount.** When the `{RATE_AMT}` (Rate Amount Default) token is used in the contract section AND the trainee is marked Chief, the system adds the Chief Bonus to the PGY rate. The trainee does NOT need to be a "Chief Resident" trainee type — the chief checkbox on their training history is what triggers the bonus. (Ticket 146552, confirmed SS.)
> 
> Alternatively, an institution can request a "Chief Resident" trainee type be created, then create a contract specifically for that trainee type. Both patterns work.

## Step 2: Create the Contract

A contract is composed of two structural elements:

*   **Contract Sections** — the modular building blocks (one for each numbered/lettered section of the contract body)
    
*   **Contract Map** — the assembly that ties Sections together into the deliverable contract, scoped to specific trainee types/programs
    

### Contract Sections

Each Section has a title and a body. The body is authored in a WYSIWYG editor with the following supported features:

*   **Tokens** from the "Select Insertion Data" dropdown (full reference below)
    
*   **Signature lines** — single and double signature line tokens
    
*   **Bold, italic, underline** — formatting controls in the WYSIWYG (note bold + underline together must use the combined `{BU:} ... {:BU}` syntax — see "Combined formatting" below)
    
*   **Pipe character** `|` for line breaks within signature line text before the user title
    

> **Maximum 30 tokens per contract.** Hard limit. (SKU confirmed; PDF GME-Contract FAQ.)

> **HTML beyond the WYSIWYG editor's controls is NOT supported.** Numbered lists, bulleted lists, and copy-pasted formatting do NOT translate. Only the controls available through the Section icons and the supported tokens are respected. (Ticket 123863, confirmed ES.)

> **Combined formatting (bold + underline)** must use the syntax `{BU:} content {:BU}` — both in the same brackets. Applying bold and underline separately produces only bold. (Ticket 191185, AMBS-8131, confirmed BG.)

### Contract Map

The Contract Map ties Sections together. The Map page has two structural areas:

*   **Above the line**: the **default contract** — used when no other Map row matches the trainee
    
*   **Below the line**: priority-ordered Map rows scoped to specific trainee types, levels, or programs
    

When a Training History record is added or saved, the system walks down the Map list (top to bottom, below the line) looking for the first row that matches the trainee's program/PGY/trainee type. If a match is found, that contract is assigned. If the system reaches the bottom of the list without a match, the **default contract** (above the line) is assigned.

> **The first matching row wins.** If multiple Map rows would match a trainee, only the highest-priority (topmost) match is used. Reorder rows to control assignment.

> **The default contract should be a generic one** that works for all programs and PGY levels. Most institutions configure the default as a "fallback" so that any trainee can have a contract; the program-/level-specific Maps below the line override the default for specific cases.

### Contract Addenda

Use **Define Contract Addenda** to upload separate files (institutional policies, NDAs, etc.) that appear alongside the contract. Trainees see the addenda as part of the contract package. To replace an outdated policy: inactivate the old addendum, upload the new file. (Ticket 197538, ELD 4/17/2023.)

### Versions

The "New Version" function on a Section lets the GME Office update a Section while preserving prior versions. Each new version has an **effective date** so contracts already sent out aren't affected by the update. To view prior versions: open the Section → Date Effective field → toggle between dates. (SKU confirmed.)

> **Contract Maps do NOT have an effective date.** Updating a Map prompts to save a contract whenever the system senses a Map change. This produces the recurring "different contract is mapped" warning when modifying old training history records. (Ticket 84087, confirmed TR.)

### Signature workflow

The signature workflow is configured at the **root** via setting `contract_signature_workflow`. This setting controls:

*   Who is required to sign (Trainee, Program Director, DIO, other faculty)
    
*   The order in which they sign
    

> **First-time setup or workflow changes require a Support ticket.** The institution must specify the desired signature order (e.g., Trainee → Program Director → DIO). MedHub Support configures `contract_signature_workflow` accordingly. (PDF GME-Contract FAQ.)

> **Removing the DIO from the workflow** is also done via `contract_signature_workflow`. The DIO's signature can still appear on the contract via a pre-populated signature (using the user ID) without being part of the e-sign workflow. (Ticket 84229, confirmed TR.)

### Logo and watermark

GME Office can request a contract logo and watermark be applied via Support ticket. (PDF GME-Contract FAQ.)

## Step 3: Add Training History record

When a Training History record is added or modified:

1.  The system walks the Contract Map and assigns a contract.
    
2.  The Contract Information section of the training history record displays the assigned Contract Form and Rate.
    
3.  GME can override the assigned Contract Form and Rate if it differs from the default.
    

The Custom Salary field on the Training History record allows GME to override the Pay Rate Table value for a specific trainee. (Useful for off-cycle salary changes, custom funding, etc.)

## Step 4: Assign the Contract

Most trainees will already have a contract assigned via the Map at Training History creation. To override or reassign:

1.  Go to **GME → Contracts**.
    
2.  Filter the list (by program, by status, by academic year, etc.).
    
3.  Select trainee(s).
    
4.  Use the action dropdown at the bottom of the page to choose the appropriate contract.
    

To **preview** a populated contract for a specific trainee before delivery: open the trainee's Training History record → click the **Contract** link. The contract preview shows what the trainee would see if delivered. **The trainee cannot see or sign the contract at this step** — preview is for GME's eyes only.

## Step 5: Deliver the Contract

Two delivery paths:

### Path A: Direct delivery via Contracts → Require Signature

1.  Go to GME → Contracts.
    
2.  Select trainee(s).
    
3.  Choose **Require Signature** from the action dropdown.
    
4.  The trainee receives an Urgent Task ("Unsigned Contract").
    
5.  The trainee logs in, reviews the contract, and signs.
    
6.  The next signer in the workflow receives an Urgent Task once the trainee has signed.
    

This path works well for **continuing trainees** who are already logging into MedHub regularly.

### Path B: Delivery via Onboarding package

The Contract is added as a requirement to an Onboarding package. When the package is delivered, the trainee accesses the contract from the package portal.

This path is typical for **incoming trainees** who don't yet have MedHub access. They access the package via the unique URL in the delivery email and sign the contract from within the package.

> **Don't deliver via BOTH paths.** Most clients use either Onboarding package OR direct Contracts delivery, not both. If both are used, the trainee may not be able to sign in the package because the system already issued the contract via Contracts. The package will display "Pending Approval" with no sign option. **Workaround**: have the trainee sign via the Urgent Task in MedHub (if they have access), or GME waives the package requirement after signing via Urgent Task. (Tickets 170898, 238488, ES 3/17/2021; AMBS-11472, ELR 7/24/2024.)

> **Delivery time of new contract emails: 3:00 a.m. Eastern Time.** Trainees receive the email overnight. (Tested by Jenny.)

### When the contract can be delivered relative to training history start date

*   **Direct delivery**: any time. There's no minimum window before training history start date.
    
*   **Onboarding package delivery**: the package due date must be within **120 days** (~4 months) of the Training History start date. The system uses this window to identify the appropriate Training History record. The earlier 6-month / 4-month window noted in older documentation is **not currently working as such** — testing in 2024 confirmed the actual operational window is 120 days. **Workaround**: temporarily set the package due date to within 120 days, run "Update Selected Packages", then change the due date back to the original. (Ticket 240387, AMBS-10239, ELR 8/6/2024.)
    

### The 6-month e-sign window

> **CRITICAL: Contracts can only be e-signed via MedHub for 180 days (6 months) past the Training History start date.** After that, e-sign is disabled.
> 
> If a contract has not been signed 6 months after the start date:
> 
> 1.  The "Unsigned Contract" Urgent Task disappears from the trainee's view.
>     
> 2.  The contract cannot be delivered or re-delivered electronically.
>     
> 3.  The GME Office must print a hard copy, have it physically signed, and upload to the trainee's Forms/Files tab.
>     
> 
> The 6-month window is by design — MedHub does not want historic contracts to flag alerts after the appointment is well underway. Contracts should be signed before/near the start date. (Confirmed BG, updated to 6 months per TM.)

> **GME signing is NOT subject to the 6-month window.** GME can approve contracts after the 6-month window has elapsed. The window only restricts the trainee and other signers (PD, etc.) from e-signing. (Confirmed SS.)

## Step 6: Approve the Contract

Once all parties have signed:

1.  The GME Office sees an **"Unapproved Contracts"** Urgent Task with the count of contracts ready to approve.
    
2.  GME goes to **Contracts** → selects trainee(s) → chooses **Approve Selected** from the action dropdown.
    

To view the final, approved contract: go to the trainee's Training History record → click the **Signed Contract** link.

> **The "Unapproved Contracts" tile may show a different number than the Contracts list.** This is by design: the Urgent Task tile shows ALL unapproved contracts regardless of academic year, while the Contracts list defaults to the current academic year. Older unsigned contracts (e.g., from 2014-15) still count in the urgent task tile. To reconcile, change the academic year filter on the Contracts list. (Ticket 85758, confirmed TR. Also referenced in MEDM-4717.)

> **Approving in Contracts does NOT auto-approve the package requirement.** If the contract was delivered via an Onboarding package, GME must ALSO approve the contract requirement in the package (Trainee Applications → Requirements tab → batch approve). The two systems do not directly talk to each other. (Confirmed BG; Ticket 235334, ELR 4/3/2024.)

> **What "approved" means at the data layer.** Once GME approves, the contract is "trapped in amber" — what the contract says at the time of approval is saved as the final document. Subsequent edits to the template do NOT flow to approved contracts.

## Editing approved contracts

If a contract has been signed but **not yet approved** by GME, edits to the template flow to the signed contract automatically.

If a contract has been **signed and approved**, the standard workflow is:

1.  Update the contract template (Section, Map, or Pay Rate Table).
    
2.  **Un-approve** the contract.
    
3.  **Approve** the contract again.
    

The newly approved contract reflects the template updates, and the previous approved version is preserved in the trainee's Forms/Files tab. (Ticket 147786, confirmed JS.)

### Special case: training history record dates change after signature/approval

When a trainee's start or end date changes after the contract has been signed and approved:

1.  **Un-approve Selected** via the Contracts module.
    
2.  **Approve Selected** via the Contracts module.
    

Both versions are maintained in the trainee's Forms/Files tab. (Confirmed TR.)

> **CAUTION: When a Training History record is modified, signatures may be removed.** If the modification triggers the system to re-evaluate the contract, the previous signatures can be wiped. The contract must be signed again, then re-approved. There is **no way to recover the original unapproved contract with signatures**. (Confirmed TR.)

## Token reference

Tokens are placed in the contract Section body using `{TOKEN_NAME}` syntax. The complete supported list:

### Resident demographic tokens

Token (in `{}`)

Pulls

Example

`{NAME_F}`

First Name

Joseph

`{NAME_M}`

Middle Name

Charles

`{NAME_L}`

Last Name

Wilson

`{TITLE}`

Name title

Dr / Mr / Ms

`{SUFFIX}`

Suffix after name

M.D.

`{ADDRESS_CUR}`

Address during training (Current Address)

123 Pine Dr, AA, 48103

`{ADDRESS_PER}`

Address before/after training (Permanent)

123 Gove Dr, Dexter, 48130

`{ADDRESS_OTHER}`

Other address

123 Oak St, Ada, 48112

`{APPT_TYPE}`

Trainee type from demo tab

resident, fellow, etc.

`{MEDSCH_DEGREE}`

Where attended med school

University of XX

`{SSN}`

Full SSN

333-33-3333

`{SSN4}`

Last 4 digits of SSN

xxx-xx-4444

`{EID}`

Employee ID (institution-specific label)

varies by institution

`{NPI}`

National Provider Identifier

10 digits

### Date tokens

Token

Pulls

Example

`{DATE}`

Numeric date (today)

1-1-2019

`{LDATE}`

Date spelled out

January 1, 2019

`{CDATE}`

Today's date (contract date)

5/29/19

`{CDATE_DAY}`

Day for the long date

29

`{CDATE_MONTH}`

Month for the long date

May

`{CDATE_YEAR}`

Year for the long date

2019

`{ORIENT_DATE}`

Orientation date from Training History

June 20, 2018

`{PROM_SD}`

Contract start date (Training History start date)

July 1, 2019

`{PROM_ED}`

Contract end date (Training History end date)

June 30, 2020

### Program / appointment tokens

Token

Pulls

Notes

`{PROG}`

Trainee's program

Internal Medicine

`{DEPT_CUR}`

Department name (if used)

Internal Medicine Department

`{DIV_CUR}`

Division (if institutional structure uses divisions)

Medicine Division (rare)

`{LEVEL}`

PGY level

3

`{LEVEL_ROMAN}`

PGY level in Roman numerals

III

`{CLEVEL}`

Billing level (defaults to same as PGY; pulls from Training History for the contract year)

3

`{CLEVEL_ROMAN}`

Billing level in Roman

III

`{PFTE}`

Appointment percentage FTE

100%

`{PROG_YEAR}`

Year in program

3rd

`{PROG_DURATION}`

Years to complete the program

5

### Pay rate tokens

Token

Pulls

`{RATE}`

Pay Rate name

STANDARD - PGY 1

`{RATE_AMT}`

Default rate amount (root-setting controlled, usually annual)

`{RATE_DS}`

Daily salary from Pay Rate Table

`{RATE_MS}`

Monthly salary

`{RATE_AS}`

Annual salary

`{RATE_OS}`

"Other" salary (parking/meals/other custom amount)

> **The** `{RATE_AMT}` default behavior is controlled by a root setting that determines whether the default is daily, monthly, annual, or other. Contact Support to change this. Most institutions set it to annual.

### Other tokens

Token

Pulls

`{NOTES}`

Notes from the Training History record

`{INST_NAM}`

Institution name

`{INST_ABB}`

Institution abbreviation

`{DIRECTOR}`

Program Director name (from Program Settings → General)

`{DCHIEF}`

Department Chief name (rare)

`{INILINE}`

Initials line for manual initial-by-page (does NOT auto-populate trainee initials when e-signed)

### Pronoun tokens

These pull from the trainee's Demographics → Gender field. Each defaults to one form (typically male) and switches based on demographics:

Token

Default

Function

`{He She}`

He

Subject pronoun

`{His Her}`

His

Possessive pronoun

`{he she}`

he

Lowercase subject

`{him her}`

him

Object pronoun

`{his her}`

his

Lowercase possessive

### Token caveats

> **Tokens are NOT user-creatable.** The list above is the complete set. To preview what a token pulls in for a specific trainee, save the Section with the token in place, then click Preview. (PDF GME-Contract FAQ; SKU confirmed.)

> **The** `{INILINE}` token does NOT auto-populate trainee initials when e-signed. It only inserts a manual-initial line for use when the contract is printed. The trainee's actual initials don't flow through this token. (Ticket 196414, AMBS-8437, LS 6/18/2024.)

> `{NAME_M}` (middle name) does NOT appear in e-signature. The e-signature pulls only first and last names by design. If two names are entered in the first-name field (e.g., "Joseph Henry"), both will appear. The middle name field is excluded. (Ticket 123353, confirmed SS.)

## Signature line syntax

Signature lines are placed in the Section body. Two types: single and double.

### Single signature line: `{SIGLINE: ... }`

Format: `{SIGLINE: NAME [or tokens] | ROLE TEXT [ROLE_CODE]}`

The pipe character (`|`) is a line break — the part before the pipe goes on the signature line, the part after goes below the signature.

**Example 1 — Trainee with tokens:**

Renders as:

**Example 2 — Program Director (uses** `{DIRECTOR}` token to pull the name):

Renders as:

### Double signature line: `{DSIGLINE: ... ; ... }`

Two signatures on one line, separated by `;`:

Renders as:

> **Tokens in a** `{DSIGLINE}` must come BEFORE the `[role]` or `[user ID]` bracket. A token placed after the role/ID bracket will not display. **Correct**: `... | {LDATE} [PD]`. **Incorrect**: `... | [PD] {LDATE}`. (Ticket 168513, SKU confirmed.)

### Role codes

The bracketed role code at the end of each signature determines who signs that line:

Code

Role

`[R]`

Trainee (Resident)

`[PD]`

Program Director

`[DIO]`

DIO

`[user ID]`

Specific MedHub user ID — for pre-populated signatures or other roles

### E-signature vs. pre-populated signatures

Two modes for placing a signature on the contract:

**E-signature (the default):**

*   The role code is `[R]`, `[PD]`, `[DIO]` (or another role)
    
*   The user is part of the signing workflow (configured in `contract_signature_workflow`)
    
*   The user receives an Urgent Task and signs by typing their name
    
*   Their typed signature is rendered as a digital font signature
    

**Pre-populated signature (auto-applied):**

*   The role code is the user's specific **MedHub ID** (numeric, e.g., `[7]` or `[26301]`)
    
*   The user is **NOT** part of the signing workflow
    
*   The user must have a signature image uploaded to their Faculty or GME profile
    
*   The signature is auto-applied when the contract is generated
    

Setting up pre-populated signatures requires a **Support ticket** to ensure the user is removed from the e-sign workflow. (PDF GME-Contract FAQ.)

> **A user CAN have a typed e-signature even without an uploaded signature image.** If `contract_signature_workflow` includes the user's role and `contract_signature_display` is configured for e-sign, the system will display a script-text signature based on the user's typed name. (Ticket 247792, AMBS-13284, LS 3/12/2025.)

### One program's Dean signature

If only one program needs a Dean signature (after the PD), use the user-ID format:

(Confirmed TR.)

### Line breaks within signature lines

The `|` (pipe) character creates line breaks within the signature line text before the role bracket. Example:

Renders with three lines per signature: name, title, date.

## Watching for signature problems

### "PDF cannot be opened because it is empty"

The contract appears signed but the PDF is empty. Common cause: the contract template was modified after signature, breaking the rendered PDF. Fix:

1.  Go to the trainee's Training History tab → Modify.
    
2.  Uncheck the **Approved** checkbox → Submit.
    
3.  A warning appears: "different contract is mapped... Please select one of the following options: 1) Leave contract as selected, or 2) Use default contract mapped." Select **option 1**.
    
4.  Return to Modify → check **Approved** → Submit.
    
5.  The warning appears again — select **option 1** again.
    

If this doesn't resolve, contact Support. (Confirmed BG.)

### Blank preview screen

When clicking Preview within Contract Section or Contract Map produces a blank screen:

*   **Token, signature line, or HTML tag is incorrectly configured/closed.** Check for missing brackets or unclosed tags. (ES 2/2/2022.)
    
*   **HTTP 500 error** indicates a signature image is uploaded but not properly saved as a JPEG. Even if the file extension is `.jpg`, it must be re-saved AS a JPEG (renaming a `.gif` to `.jpg` doesn't work). Take a screenshot of the existing signature, save the screenshot as a new JPEG with a different filename, and re-upload. (ES/BG/Ben S 1/19/2022.)
    

To **narrow down which signature is causing a 500 error**: navigate to GME → pick a program from the dropdown → Contracts → Contract Sections → Preview the section. If the error appears in some programs but not others, it's a **program-level (PD)** signature. If all programs show the error, it's an **institution-level (DIO)** signature.

### "Different contract is mapped" warning

Appears when modifying a Training History record where a Map change has been made since the original assignment. The system is asking whether to keep the original contract or use the (now-default) mapped contract. **For historical/alumni records: leave the contract as selected** (option 1). For new assignments: use the default. (Ticket 84087, confirmed TR.)

### "A typo in a token causes blank preview"

Common cause: an extra `{` at the start of a token (e.g., `{{NAME_F}` instead of `{NAME_F}`). Remove the redundant character and save. (Ticket 216015, JW 3/27/2023.)

### Faculty member can't sign their contract

Most common cause: the typed signature does NOT exactly match the faculty's name in their profile. The functionality is strict — extra spaces, missing/mismatched middle names, or inconsistent capitalization will fail.

Troubleshooting steps:

1.  **Confirm the logic with the faculty member**: extra spaces (before, after, or between names) will fail. Copy/paste their exact name from their profile to verify.
    
2.  **Re-save their name in their faculty profile**. Sometimes erroneous spaces from the original entry persist; re-saving resolves it.
    
3.  **Try a different browser**. Sometimes browser cache holds an invalid signature attempt.
    
4.  **As a last resort**: try signing on their behalf with a screenshot, and report to Support if the issue persists.
    

(SKU confirmed.)

### DIO signature not appearing on contracts

1.  As GME Office, go to **Institution Settings** → check who is listed as DIO.
    
2.  Go to Home → **GME Staff Members** → select the DIO's account.
    
3.  Verify a signature image is uploaded to their profile.
    

If no signature image is uploaded, the signature won't display. (Confirmed BG.)

### Program Director changed mid-cycle

When a PD is changed AFTER a contract has been issued but BEFORE it's signed by the PD, the signing task **transfers to the new PD**. The new PD will see the Urgent Task in their queue. (Ticket 239068, LS 7/8/2024.)

### Old PD's signature appears on batch-printed contracts

This is by design — though not always intuitive. **Batch-printed** contracts use the **current** Program Director's signature (pulled from current Program Settings). If the PD changed mid-year and old contracts are batch-printed, they will show the new PD's signature.

The contracts in the **resident's Training History** record show the original PD's signature at the time of signature. To get the original PD's signature on the printed contract, print from the resident's Training History tab, not via batch print. (Ticket 189651, AMBS-8038.)

## Visiting residents

> **Visiting residents using the OVERLAP method cannot receive contracts** through the standard Contracts module. The trainee's training history is structured differently in the overlap method (see **MedHub - Training History** §"Visiting residents") and contract delivery doesn't apply.
> 
> Workarounds:
> 
> 1.  Add the contract as an item in an Onboarding package with instructions to sign and return manually. The signed file is stored in the trainee's Orientation tab and Forms/Files, not in a Training History record.
>     
> 2.  Use the **inline method** for visiting residents (which has billing implications — confirm with the institution's IRIS team before switching).
>     
> 
> (Ticket 213598.)

## Auto-assigned contracts on visiting trainees (cleanup)

When a visiting trainee is initially entered as a regular Resident type and a contract auto-assigns, then the trainee type is later changed to Visiting (where Contracts isn't enabled), the contract assignment **persists**. There is no UI option to remove the assignment.

> **Resolution: send to data team.** A request to remove the contract assignment via SQL is the only path. (Ticket 241937, AMBS-11897, LS 10/31/2024.)

## ECFMG and J-1 visa considerations

The ECFMG (sponsor for J-1 visas) had previously not accepted MedHub digital signatures for J-1 contracts. The recommended workarounds:

1.  Print the MedHub Contract → have it physically signed → scan and submit to ECFMG.
    
2.  Submit an offer letter signed by the applicant and Program Director instead.
    

> **Recent ECFMG policy update (2/2023+):** ECFMG has indicated that MedHub electronic signatures may be acceptable, with email confirmation from MedHub supporting that residents must log into a secure account to sign. Confirm current ECFMG policy before relying on this. (Tickets 214336, 236670; documentation provided by Kelly Napolitano 5/9/2024.)

## Reports tied to Contracts

There is no built-in "Contract Report" with all contract data. Workarounds:

*   **Use the Contracts page filters** (e.g., Appointment Type) and Export to Excel to get a list of trainees with their contract status. Rates have to be mapped manually from the Pay Rate Table.
    
*   **Ad-Hoc Resident Demographics report** for incoming trainee salary fields (see **MedHub - Reports - Demographics**).
    
*   **Pay Rate Table** itself for rate-set reference.
    

(Ticket 84470, confirmed TR.)

## Alumni: contracts

> **Contracts are NOT applicable to alumni** but the contract Map will still flag a warning when modifying alumni Training History records. This is by design — Contract Maps don't have an effective date, so any Map change since the alumni record was created will trigger the warning. **For alumni: select option 1 ("Leave contract as selected")** to suppress the warning. (Ticket 84087, confirmed TR.)

## Common scenarios

### "The salary on the contract is $0"

Pay Rate Table not configured for the academic year, OR the Date Effective field doesn't encompass the trainee's training history. Fix the Pay Rate Table, then re-modify the Training History record. If still $0 on a new site, try re-saving the Pay Rate Table without changes (AMBS-10707).

### "Last year's salary appears on a new contract"

New academic year's Pay Rate Table not yet populated. Fall-back logic uses the most recent defined Pay Rate Table. Update the new year's table, then re-modify training history.

### "Pay rate says Undefined"

No default Pay Rate Table set. Designate one in List Management → Pay Rate Tables, then re-modify each affected Training History record.

### "Trainee can't sign even though I selected Require Signature"

Check whether the contract is more than 6 months past Training History start date. If so, e-sign is disabled — print and upload manually. If the contract is recent, ensure "Require Signature" was actually selected in the Contracts action dropdown (not just Assign).

### "I want to edit a signed contract"

If signed but not approved: edit the template; changes flow automatically. If signed and approved: un-approve, edit template, re-approve. The original is preserved in Forms/Files.

### "Trainee signed but their initials aren't on the {INILINE} lines"

`{INILINE}` is a manual-initial line; it does NOT auto-populate from e-signing. This is by design. (Ticket 196414, AMBS-8437.)

### "Bold and underline aren't both showing"

Use the combined `{BU:} ... {:BU}` syntax in the same brackets. Separate bold and underline don't combine.

### "I want a contract for the chief year"

Either: check the **Chief checkbox** on the Training History record and use `{RATE_AMT}` (the system adds the Chief Bonus from the Pay Rate Table to the PGY rate), OR: request a new "Chief Resident" trainee type and create a separate Chief Resident contract.

### "Trainee was set up as visiting overlap method — how do I send their contract?"

Not supported via the standard Contracts module. Add the contract as an Onboarding package item with instructions to sign and return manually.

### "Faculty member's signature image isn't appearing"

Verify it's a properly-saved JPEG (not a renamed GIF/PNG). Take a screenshot of an existing signature and save as a new JPEG with a different filename.

### "How do I number signatures or insert a date below each signature?"

Use the pipe character to add multiple lines within the signature block. Example: `{SIGLINE: {NAME_F} {NAME_L}|{LDATE}|Trainee Signature[R]}` produces name, date, and label on three lines.

### "I delivered a package with a contract but the trainee can't sign in the package"

The contract was likely also issued via the Contracts module, blocking the package signing path. Have the trainee sign via the Urgent Task in MedHub, then GME approves the package requirement (Trainee Applications → Requirements tab → batch approve).

### "Contract with Onboarding package — what does the trainee see?"

For a continuing trainee with MedHub access: the contract appears in their Urgent Tasks AND in their package. They sign once (preferably in Urgent Tasks).

For an incoming trainee without MedHub access: they receive the package URL email. After all parties sign and GME approves, a "Print Contract" button appears next to the contract requirement in the package. They can print directly without GME manually sending. (Ticket 235334.)

### "ECFMG asking for signature certificate"

Email signature confirmation document is available for J-1 visa applications. Contact Kelly Napolitano (or current MedHub Product representative) for the current document. (Ticket 236670, documented LS 5/9/2024.)

## Open questions for Emma

A few items I flagged that may benefit from your direct review when you have time. None are blocking; the doc is faithful to source material.

*   `[VERIFY]` Current ECFMG policy on MedHub e-signatures for J-1 contracts. The 2/2023 update suggested electronic signatures may now be acceptable. Worth confirming current state.
    
*   `[VERIFY]` The Onboarding package window — the SKU notes 4 months → 6 months change in 2/2024 was not in effect by 8/2024 (still 120 days). Worth confirming current behavior.
    
*   `[VERIFY]` `contract_signature_display` value matrix — AMBS-11025 (MC/ES 6/7/2024) confirmed dev tested values 0/1/2 against each user type. Would be useful to add the matrix in this doc when accessible.
    
*   `[VERIFY]` AMBS-13284 (Ticket 247792) — pulling-script-text-signatures-without-uploaded-image behavior. Confirm this is still working as documented.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`contract_signature_workflow`

Configures who signs and in what order. Required setting for any institution using contracts. Modified via Support ticket.

`contract_signature_display`

Controls when/how signatures appear in the workflow. Values 0/1/2 affect when signatures become visible at each step. AMBS-11025 has the dev test matrix.

`setting_contract_default_rate`

Determines whether `{RATE_AMT}` defaults to daily, monthly, annual, or other. Most institutions set to annual.

`setting_contract_logo`

Optional logo on contract PDFs. Set via Support.

`setting_contract_watermark`

Optional watermark. Set via Support.

`setting_contract_*`

Misc per-institution contract behavior. Confirm current defaults via the canonical settings list.

Onboarding package interaction settings:

*   The 120-day window from the package due date to Training History start date for the contract to attach to the package. Currently behaves as 120 days (per Ticket 240387 testing 8/6/2024).
    

## Database tables appendix

Table

Purpose

`contracts_sections`

Contract Section bodies, with versions and effective dates.

`contracts_sections_versions`

Audit of Section versions when "New Version" is created.

`contracts_maps`

Contract Map definitions — priority-ordered rows tying Sections to programs/levels/trainee types.

`contracts_maps_default`

The "above the line" default contract row.

`contracts_addenda`

Contract Addendum files (institutional policies, NDAs).

`contracts_assignments`

Per-trainee contract assignment records — which contract is assigned to which Training History record.

`contracts_signatures`

Digital signatures on contracts (typed, e-signed, or pre-populated from uploaded image).

`contracts_workflow`

Per-contract signature workflow state — who has signed, who's next.

`contracts_approvals`

GME approval records.

`pay_rate_tables`

Pay Rate Table definitions per institution.

`pay_rate_tables_amounts`

Daily/monthly/annual amounts per academic year, per level, per table.

`pay_rate_tables_chief_bonus`

Chief Bonus amounts.

`users_residents_pg`

Resident Training History — drives `{PROM_SD}`, `{PROM_ED}`, level/PGY tokens, contract assignment.

`users_residents`

Resident demographics — source of name, address, SSN, gender (for pronoun tokens).

`users_faculty`

Faculty profiles — source of `{DIRECTOR}` token, signature images for PD/DIO.

`users_residents_apps_documents`

Per-trainee package requirement records — where the contract requirement status lives when delivered via Onboarding.

# MedHub - Integrations - MyTIPReport (MTR)

# MedHub <-> myTIPreport (MTR) Integration

> **Scope.** This article documents how the myTIPreport (MTR) platform integrates with MedHub: how the two systems are connected, how user identities are kept in sync, and how completed MTR evaluations are pushed into MedHub for milestone tracking and ACGME compliance. It covers configuration, access requirements, runtime behavior, the data each system stores, and the failure modes that generate support tickets. It documents current behavior only.

* * *

## 1\. Overview

MedHub is the system of record many Graduate Medical Education (GME) offices require for resident evaluation and milestone data. MTR is a separate evaluation platform used by faculty and learners. The integration lets an institution use MTR for day-to-day evaluation while still satisfying the requirement that evaluation and milestone data live in MedHub.

The integration has two independently toggleable features:

Feature

What it does

Direction

**Identity Synchronization**

Links and imports MedHub users (residents/fellows and faculty) into MTR so the two systems share the same people without manual re-entry.

MedHub -> MTR

**Evaluation Publishing**

Pushes completed MTR evaluations into MedHub, including per-milestone-element ratings, so MedHub's official milestone tracking and compliance reporting are populated.

MTR -> MedHub

Identity synchronization is a prerequisite for evaluation publishing: MTR cannot push an evaluation about a resident unless that resident's MTR identity is linked to a MedHub identity. Both features are configured by an administrator in MTR under **Admin > Integrations > MedHub**.

## 2\. Connecting an institution (Configuration)

### 2.1 Where it lives

In the MTR web app: **Admin > Integrations > MedHub**. The MedHub blade presents a three-step setup flow. The integration is established at the MTR program level and is tied to two pieces of MedHub coordinates that an administrator must supply:

*   **MedHub site URL** — the host of the institution's MedHub instance. Every institution has its own MedHub account at its own host.
    
*   **MedHub program ID** — the numeric program identifier within that MedHub account that this MTR program maps to.
    

### 2.2 Who can configure it

Only an MTR administrator can configure the integration. Linking the institution-level coordinates (site URL and program ID) is an internal/Ascend administrative action performed in AdminWeb when an institution is onboarded; the per-institution MedHub-side setup (importing milestones and the evaluation form) is performed by that institution's MedHub administrator.

### 2.3 Why the connection is per-institution, not per-form

MedHub form IDs are local to each institution's MedHub account and are not stable — a form deleted and recreated receives a new ID. The integration therefore never stores a MedHub form ID. Instead it stores only the institution-level coordinates above and discovers the correct form by name at runtime (see 4.2). This is what allows a new institution to be added with no code change.

## 3\. Identity Integration

Identity integration is enabled by default at configuration time. It can be disabled later under **Admin > Integrations > MedHub > Identities** if an administrator needs to manage users directly in MTR.

### 3.1 What changes when identity integration is on

Once identity integration is enabled, the manual "add user" action is removed from MTR. New identities can only enter MTR by being imported from MedHub. This is deliberate: it prevents the two systems from drifting out of sync by blocking the creation of MTR-only users that have no MedHub counterpart.

### 3.2 The identity management screen

From the admin channel, under **Users and Roles**, an administrator opens **Residents** or **Fellows** (faculty are managed the same way) and clicks **Manage MedHub Identities**. The screen has four tabs:

Tab

Contents

Administrator action

**Linked Users**

Identities already linked between MTR and MedHub.

Review only; unlinking is possible and reversible.

**Suggested Links**

Identities not yet linked but sharing the same email address in both systems.

Link individually, or use **Link All Users**.

**Only in myTIPreport**

Identities created manually in MTR before integration was enabled, with no email-matched MedHub counterpart.

Find and link the corresponding MedHub identity for each.

**Only in MedHub**

Identities that exist in MedHub but not in MTR.

**Import** (create in MTR) or **Link** to an existing MTR user.

### 3.3 Link vs Import — a commonly confused distinction

> These two actions appear together on the **Only in MedHub** tab and are frequently confused. They are not interchangeable.

Link

Import

**What it does**

Associates a MedHub identity with an MTR identity that _already exists_.

Creates a _new_ MTR identity carrying the MedHub user's attributes.

**When to use**

The person is already in MTR (e.g. created before integration) and needs to be connected to their MedHub record.

A new learner/faculty member exists in MedHub and should be added to MTR.

**Side effect**

No new account; no email sent.

The new user receives an email with an auto-generated password.

**Scope**

One at a time, or implicitly via Suggested Links.

One at a time, or **Import All**.

### 3.4 Saving

Linking and importing actions are staged in the UI and do not take effect until the administrator clicks **Save Changes**. Linking actions are reversible.

## 4\. Evaluation Integration (pushing evaluations to MedHub)

With identities linked, an administrator can enable evaluation publishing so that completed MTR evaluations for active learners are pushed to MedHub. The push is one-directional (MTR -> MedHub) and is performed by a background job.

### 4.1 MedHub-side prerequisites (performed by the institution's MedHub administrator)

Before MTR can push, the institution's MedHub account must be prepared. This is a one-time setup per institution and requires no code change on the MTR side.

1.  **Import the latest milestones.** In MedHub, under **Site Management > Milestone Management**, import or update both the **Subcompetencies** and the **Milestone Elements** packages for the specialty. If "Update Package" shows no changes, the latest package is already present.
    
2.  **Copy the MTR evaluation form.** Under **Evaluations > Manage Evaluation Forms > New Evaluation Form > Copy from another institution**, search the title "myTIPreport integration" and copy the form matching the specialty and milestone version (for example, "myTIPreport integration - obgyn - v1").
    
3.  **Lock the form.** Open the copied form and set the **Design** dropdown to **Final (Locked)**, then save. MTR cannot post to a form that is still in Draft.
    

> **The form must be in "Final (Locked)" state.** On the MedHub side this corresponds to the evaluation form's design status being set to locked. A form left in Draft will not accept pushed submissions, and the integration's Test Connection check will report it.

### 4.2 How MTR finds the right MedHub form (name-based discovery)

Because MedHub form IDs are per-institution and unstable, MTR does not store a form ID. At push time it constructs a predictable form title and searches the institution's MedHub for a form with exactly that title (case-insensitive).

The constructed title follows the pattern:

Element

Source

**specialty**

The program's configured specialty short name (e.g. `obgyn`, `emergency`, `familymedicine`, `dermatology`).

**version**

Derived from the program's milestone version (a context-group identifier) via a fixed mapping in the MTR codebase. If the specialty has no entry in that mapping, the version defaults to `v1`.

MTR then calls the MedHub API to list the program's evaluation forms and matches by title:

Search result

Outcome

Exactly one title match

MTR uses that form's ID for this push (discovered fresh each time).

Zero matches

Error: the form has not been imported. The MedHub admin must copy the MTR form (4.1).

Two or more matches

Error: duplicate form. The MedHub admin must remove the extra copy.

Because discovery is by title, recreating the form (which changes its ID) does not break the integration, and adding a new institution requires no MTR configuration beyond the institution coordinates.

### 4.3 What MTR sends (the submission contents)

Each pushed submission populates a single MedHub evaluation form response containing three kinds of content:

Field

Contents

Purpose

**Evaluation Content**

The full text of the original MTR evaluation, human-readable.

Lets MedHub staff read the complete evaluation regardless of milestone mapping.

**System Information**

MTR's evaluation identifier, type, and timestamp, machine-readable.

Lets MTR detect whether this evaluation was already submitted, to prevent duplicates.

**Milestone element questions**

One question per milestone element, carrying the resident's rated level (or N/A).

Populates MedHub's official milestone tracking and ACGME compliance reporting.

The milestone questions are filled by translating each MTR milestone rating to the corresponding MedHub milestone-element question via a mapping maintained in the MTR codebase (one mapping file per specialty per milestone version). The mapping is keyed to MedHub's global milestone-element references, so the rating lands against the correct element in MedHub.

### 4.4 When the push happens

Control

Behavior

**Schedule**

A background job runs once per day and pushes evaluations that qualify. An administrator can also trigger a run with **Push Now** (asynchronous; may take a few minutes — do not click repeatedly).

**Evaluation Push Delay**

An evaluation is not pushed until a configurable interval (default **48 hours**) has elapsed since its last update. MedHub responses cannot be edited once submitted, whereas MTR evaluations can; the delay gives faculty a window to correct mistakes before the evaluation is locked into MedHub. Adjustable at any time.

**Earliest Evaluation to Push**

Only evaluations created on or after this date are eligible, so historical evaluations are not pushed wholesale. Defaults to the configuration date. Can be moved earlier later, but once an evaluation has been pushed it cannot be retracted from MedHub.

So an evaluation is pushed when it was created on or after the Earliest date, its last update is older than the Push Delay, and the learner is active.

### 4.5 Duplicate prevention

MTR cannot submit and record-that-it-submitted in one atomic step, so before posting it checks MedHub for an existing submission. It retrieves responses on the target form for the same evaluator, evaluatee, and date range, and inspects each one's **System Information** field for a matching MTR evaluation identifier. If a match is found the evaluation is skipped; otherwise the push proceeds.

### 4.6 Test Connection, Push Now, and Status

*   **Test Connection** verifies that MTR can reach the institution's MedHub and that the correct form has been imported and locked. Failures return directions for the fix.
    
*   **Push Now** triggers an immediate asynchronous push of all qualifying evaluations.
    
*   **Status** shows the result of the most recent push. Per-evaluation errors appear in a table with a reason and a corrective action; once the underlying issue is fixed, the affected evaluation is retried on the next push.
    

## 5\. The "element: none" silent failure

> This is the highest-value behavior in this article for troubleshooting, because it fails silently: the push reports success and MedHub stores the evaluation, yet no milestone progress is recorded.

### 5.1 What it is

On the MedHub side, each milestone question on the form must be linked to a specific milestone element. When a question is not linked to any element, it shows **element: none**. The question still exists and still receives the value MTR sends, but MedHub has nothing to attribute that value to.

### 5.2 Why it is silent

Current push behavior is: if milestones map correctly, send them; if a milestone cannot be mapped, skip that milestone question but still send the evaluation. As a result:

*   The **Evaluation Content** text is stored in MedHub — so the evaluation appears to have arrived.
    
*   The milestone questions linked to **element: none** contribute nothing to milestone tracking.
    
*   The institution's milestone/compliance reports show incomplete data even though the push succeeded.
    

Neither system raises an error, because from each system's point of view nothing went wrong: MTR sent what it could, and MedHub accepted what it received.

### 5.3 Common causes

Cause

Detail

Milestone package not (re-)imported

After an ACGME milestone update, the element links are lost until the package is re-imported, breaking the reference each question was tagged to.

Form copied before tagging

The form was copied into the institution before its questions were linked to elements, producing an untagged form.

Links deleted during editing

An administrator removed the element links while modifying the form.

Milestone data reset

The program's milestone data was reset, breaking existing tags.

### 5.4 How to confirm and resolve

Confirm by opening the MedHub form and checking whether its milestone questions are each linked to an element (rather than showing **element: none**). Resolve by re-importing the milestone package (Subcompetencies and Elements) and re-copying or re-tagging the form so each question is linked to its milestone element, then re-running the push. Evaluations that were pushed while the form was untagged were stored as text only; their milestone data must be re-pushed after the tagging is corrected, subject to duplicate-prevention behavior (4.5).

## 6\. Operational scenarios

### 6.1 Adding a new institution / client site

No code change is required.

1.  Internal/Ascend admin links the institution in AdminWeb: set the MedHub site URL and MedHub program ID on the MTR program.
    
2.  The institution's MedHub administrator imports the milestone packages, copies the MTR form, and sets it to Final (Locked).
    
3.  On first push, MTR discovers the form by title automatically.
    

### 6.2 Adding a new specialty to the integration

This requires code changes and a deployment, plus MedHub-side form setup. At a high level: a milestone-mapping file is generated for the specialty/version and committed to the MTR codebase, the version mapping is updated if the specialty needs a non-default version suffix, and the change is deployed. On the MedHub side a master form is created and each question is tagged to its milestone element so institutions can copy it. Full implementation details are in §10.

### 6.3 Updating an existing specialty after an ACGME milestone release

The milestone mapping is regenerated for the specialty. If ACGME released an incremental change, the existing context-group/version is reused and the mapping file is replaced. If ACGME released a new milestone version, a new context group is created, the version mapping is updated so the correct form title is generated, and a new MedHub form is created and tagged. Institutions must then re-import the updated milestone package and re-copy/re-tag the form — failing to do so is a leading cause of the **element: none** condition (5). Full implementation details are in §10.5.

## 7\. Data reference (MedHub side)

For agents troubleshooting against the MedHub database, the relevant tables are:

Table

Relevance to the integration

`eh_evals`

Evaluation forms. `title` is what MTR matches on during name-based discovery. `eval_status` = 1 means **Final (Locked)** (0 = Draft); MTR requires status 1. `foreign_evaluationID` records the source-form lineage when copied from another institution.

`eh_evals_items`

Form questions. The milestone questions MTR fills live here. `foreign_itemID` records lineage from the copied source form.

`eh_evals_items_links`

Links a question (`itemID`) to a milestone element (`objectiveID`). **A missing row here is the "element: none" condition** — the question exists but is tied to no element.

`ref_milestones_objectives`

Milestone elements. `global_objectiveID` is the global element reference that MTR's mapping files target; `global_packageID` ties the element to the import package an admin loads.

`eh_responses`

Submitted evaluation responses. `submission_source` = 3 (API) identifies responses that arrived via the integration. The System Information / duplicate-detection check reads back from here.

`eh_responses_answers`

The per-question values of a submitted response — where the milestone ratings MTR sends are stored (`optionID` / `textresponse`).

## 8\. Settings reference (MedHub side)

The MTR-side push controls (Status, Push Delay, Earliest Evaluation to Push) are configured in the MTR app, not in MedHub root settings, and are documented in 4.4. On the MedHub side the milestone-relevant settings are:

Setting

Effect

`settings_school_milestones`

Enables milestones functionality for a school (0 = disabled, 1 = enabled). Relevant on the UME/school side where milestone tracking applies.

`settings_schools_evaluations_locked_override`

Allows overriding linked competencies and milestones for locked evaluation questions.

## 9\. Reference links

*   MedHub Integration — Configuration: [https://mytipreport.org/guides/v1/medhub-integration](https://mytipreport.org/guides/v1/medhub-integration)
    
*   MedHub Identities: [https://mytipreport.org/guides/v1/medhub-identities](https://mytipreport.org/guides/v1/medhub-identities)
    
*   MedHub Evaluation Integration: [https://mytipreport.org/guides/v1/medhub-evaluations](https://mytipreport.org/guides/v1/medhub-evaluations)
    

## 10\. Developer tasks

This section documents the tasks required when the integration needs to be extended or maintained. All tasks here require code changes and deployment unless otherwise noted.

### 10.1 The milestone mapping system

MTR's milestone-element questions are filled by translating each evaluation's rated milestones into the specific question IDs on the MedHub form. This translation is defined in JSON mapping files — one per specialty per milestone version — that are committed to the MTR codebase and compiled in as embedded resources. The files live at:

Where `{specialty}` is the short name (e.g. `obgyn`, `emergency`, `familymedicine`) and `{contextGroupId}` is a GUID identifying the milestone version.

The version suffix in the form title (e.g. `v2.2`) is controlled by a dictionary in `MedHubFormSettings.cs` that maps each context-group GUID to a version string. If a specialty's GUID has no entry in that dictionary, the suffix defaults to `v1`.

### 10.2 The mapping script

Mapping files are generated by a developer CLI tool:

Run as:

bash

The script connects to the MedHub sandbox ([sandbox.medhub.com](http://sandbox.medhub.com), Program 614), downloads all milestone elements for the specialty including their `GlobalRefId` values, loads MTR's own milestone list, and matches elements by name. Matched elements are written to the JSON mapping file. Unmatched elements require manual correction (see 10.3).

The output file is reviewed by the developer and committed to the repository. The mapping files are not configurable per institution — they are compiled into the application and apply everywhere.

### 10.3 Handling name mismatches

The script matches by name. When MedHub and MTR use different names for the same element, or when ACGME has introduced additions/removals since the last run, the script will produce unmatched elements. Four correction dictionaries in the script handle these cases:

Dictionary

Purpose

`s_medHubTypoMappings`

Corrects known MedHub name errors before matching

`s_ourTypoMappings`

Corrects known MTR name differences

`s_medHubElementsToIgnore`

Skips MedHub elements that should not be mapped

`s_ourElementsToIgnore`

Skips MTR elements that should not be mapped

If the script outputs unmatched elements, add the necessary correction to the appropriate dictionary and re-run until all elements match.

### 10.4 Adding a new specialty

Requires code changes and deployment, plus MedHub sandbox setup.

**Developer steps:**

1.  Generate a new GUID — this becomes the `contextGroupId` for the new specialty.
    
2.  Run the mapping script: `dotnet run /download-medhub-milestones {specialty} {guid}`
    
3.  Fix any name mismatches (add to correction dictionaries and re-run, repeating until clean).
    
4.  Commit the JSON file to `Common/Data/specialties/{specialty}/MedHubMilestoneMappings/{guid}.json`.
    
5.  If the specialty needs a non-`v1` version suffix in the form title, update `s_milestoneContextGroupToVersionSpec` in `MedHubFormSettings.cs`.
    
6.  Deploy to production.
    

**MedHub sandbox setup (MTR admin, done once per specialty):**

1.  Create an evaluation form named `myTIPreport integration - {specialty} - {version}` in the sandbox.
    
2.  Add one question per milestone element.
    
3.  Tag each question to its `GlobalRefId` (milestone element link).
    

This sandbox form is what institutions copy when they onboard (4.1). It must be complete and correctly tagged before institutions can begin.

**Institution setup (per hospital, zero code changes):**

1.  Import the milestone package (4.1).
    
2.  Copy the MTR form from the sandbox (4.1).
    
3.  Set to Final (Locked) (4.1).
    

### 10.5 Updating an existing specialty after an ACGME milestone release

Scenario

Steps

**Incremental update** (same milestone version, elements added/removed/renamed)

Re-run the mapping script with the existing `contextGroupId`. Review the diff for added/removed elements. Fix any new mismatches. Commit the updated JSON, replacing the old file. Deploy.

**New milestone version** (ACGME releases a whole new version, e.g. v2 -> v3)

Generate a new GUID. Run the script with the new GUID. Update `s_milestoneContextGroupToVersionSpec` in `MedHubFormSettings.cs` so the new version generates the correct form title. Create and tag a new MedHub sandbox form for the new version. Deploy. Institutions must re-import the updated milestone package and copy the new form.

> **Important:** If a new context-group GUID is introduced without updating `MedHubFormSettings.cs`, the form title will default to `v1` regardless of the actual milestone version, causing a form-not-found error at push time.

After any milestone update, institutions using the affected specialty must re-import their milestone package (see 4.1 and 6.3). Failure to do so is the primary cause of the **element: none** silent failure (5).

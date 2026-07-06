# MedHub - Portal & Personalization - markdown

# MedHub - Portal & Personalization

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The **Portal** in MedHub is each user's Home page — the first page they see after logging in. It consists of three columns:

*   **Left column** — the standard MedHub navigation links (varies by user type and access points).
    
*   **Middle column** — Resources/Documents/Forums, MedHub Messages, Site Management links, etc.
    
*   **Right column** — **portal channels**, which are configurable widgets/feeds that display dashboards, news, evaluation summaries, work hour summaries, and other content.
    

The portal channels are where personalization lives: which channels appear, what content goes in custom channels, what news feeds appear, and what default channels new users see when their account is created.

This document covers: the standard portal channels catalog, how to add channels, how to embed images and links into portal channels, the news feed (RSS) management workflow, the Default Portal Feeds mechanism for new-user defaults, the Bulk Email Tool (which lives in the portal area), the MedHub Community discussion forum, and the operational quirks that come up.

It does not cover: the Resources/Documents/Forums file-sharing area (see **MedHub - Resources, Documents, Forums**); the Resident Dashboards portal-related visibility (see **MedHub - Resident Dashboards**); the Mobile App portal/home view (see **MedHub - Mobile App**).

## Where it lives

For all administrative users:

> **Home → middle column → Portal Channels/Surveys**

This page lets the user manage portal channels visible on their own portal AND, for GME/Student Admin users, manage the **Default Portal Feeds** that determine what new users see.

For root-side configuration:

> **MedHub Support → Portal**

Used by CSCs to add new RSS news feeds available to clients, manage existing feeds, and run the Grab & Sync Feeds operation.

## The standard portal channels

A user can add channels from a catalog. The channels available depend on user type. Examples:

### For administrative users (GME Office, Program Admins)

*   **Work Hours - Last Week Summary** — chart of trainees with non-compliant timesheets vs. total submitted timesheets last week. The bottom shows Details listing specific trainees.
    
*   **Evaluation Completion Summary** — graph of evaluations delivered vs. completed over the past year.
    
*   **MedHub Messages** — recent message activity.
    
*   **Upcoming Events** — conferences, calendar events.
    
*   **News feeds** — NEJM, JAMA, journal RSS feeds.
    
*   **Custom institutional content** — text/image/button blocks the GME or Admin builds (see "Custom portal channel content" below).
    

### For trainees and faculty

*   **MedHub Messages**
    
*   **Upcoming Events**
    
*   **News feeds**
    
*   **Custom content** added by GME or program leadership
    

### Channel-specific behavior worth knowing

#### Work Hours - Last Week Summary

*   **Numerator**: trainees who submitted "non-compliant" timesheets last week (timesheets that potentially contain ACGME work hour rule violations).
    
*   **Denominator**: total trainees who submitted timesheets last week. (Confirmed TM.)
    
*   **A trainee must have submitted at least 2 timesheets historically** to appear in the Details list. New trainees who haven't submitted before don't appear in their first week. (Confirmed BG.)
    
*   **Incoming residents won't appear** in their first week. They show up the following Sunday once the previous week includes a submitted timesheet.
    

#### Evaluation Completion Summary

*   **Drawing window**: past year (rolling 365 days from today).
    
*   **Admin view vs. GME view**: Admin's home page shows one column with program-scoped data. GME Office home page shows two columns (residents vs. faculty) with institution-wide data. The graphs are NOT customizable across user types. (Ticket 205968, LS 9/16/2022.)
    
*   **Use only with all statuses active**: when the user toggles individual statuses off, the percentage calculations become inconsistent and the graph displays misleading data. **Working as designed but a niche use case.** Recommendation: leave all statuses active for accurate data. (Ticket 182315, AMBS-7427, ML 10/6/2022.)
    

## Custom portal channel content

Beyond pre-built channels, GME and Administrators can build their own portal channels with custom HTML content — typically links, images, and buttons pointing to institutional resources, intranets, or external sites.

### Inserting an image

The standard pattern (Confirmed JS):

1.  As Administrator or GME Office, go to **Resources/Documents/Forums** in the middle column of Home.
    
2.  **Add Resource - File** to upload the image.
    
3.  Hover over the file in the list — note the URL preview (or right-click → Copy Link Location).
    
4.  Go to Home → middle column → **Portal Channels/Surveys**.
    
5.  Choose the appropriate Portal user type subtab.
    
6.  In the WYSIWYG editor toolbar, select the **picture icon** (third icon from the left).
    
7.  Paste the image URL into the **Source** box. Add a title if desired. Apply.
    
8.  Resize/manipulate as needed and Submit.
    

### Inserting a button (linked image)

The fancier "button" buttons that link to specific URLs require the Code View, since the standard editor doesn't expose link-on-image functionality (Confirmed CD):

1.  Upload the button image to the portal user's Resources area first.
    
2.  Click **Code View** in the editor (last icon on the right of the WYSIWYG editor).
    
3.  Paste this HTML (substitute the URL and image path):
    

 ![](*insertImagefilelocationHere*) \]\]>

`target="_blank"` opens the link in a new tab. Remove that attribute if you want the link to open in the current tab.

### Embedding a link in an existing image (updating button URLs)

When an image has been uploaded but no link is embedded — or an existing link needs to change — the workflow is:

1.  Upload the image (or use the existing image).
    
2.  Switch to **Code View**.
    
3.  Add the reference link (`<a href="...">`) wrapping the `<img>` element.
    
4.  Save.
    

Resources for HTML guidance: `https://www.w3schools.com/`. (Ticket 232190, AMBS-10487.)

### Apostrophe / quotation mark conversion when copying from Word

> **When text containing apostrophes or quotation marks is copied from a Word document and pasted into a portal channel, the punctuation is sometimes converted to weird characters** (smart quotes, curly apostrophes, or hex artifacts).
> 
> **Cause**: Word inserts non-standard characters that the portal's WYSIWYG/code parser doesn't always handle cleanly. The behavior is inconsistent — sometimes it works, sometimes it doesn't.
> 
> **Workaround**: type the text directly into the portal editor instead of copy-pasting from Word. Or paste, then manually replace the affected characters. (Ticket 158364, CD 1/13/21.)

### PDFs in portal — host externally

> **PDF documents cannot be uploaded directly to the portal.** No native PDF embed support. Workarounds:
> 
> *   Host the PDF on the institution's website and link to it.
>     
> *   Convert the PDF to an image and insert the image.
>     
> 
> (Ticket 147627, JS confirmation.)

## RSS news feeds

Portal channels can include RSS-based news feeds — typically medical journals, institutional news, or relevant external sources.

### Adding a new feed (CSC reference)

The CSC adds new feeds via the **MedHub Support Site** (root level), not via the client UI. Steps:

1.  Go to `https://support.medhub.com/` → Portal → **New Feed** hyperlink.
    
2.  Look under **Local/Other Resources** to confirm the feed isn't already on the list.
    
3.  If not present, in the Actions area select **New Feed**.
    
4.  Fill in the form:
    
    *   **Title** of the feed.
        
    *   **URL** — the RSS feed URL. Find this by searching `"<journal name> RSS feeds"` on Google and copying the URL from the journal's website (e.g., `https://www.nejm.org/rss-feed/`).
        
    *   **Recipients**: set to `0` for all clients (anyone can add the feed), OR set to specific institution global IDs separated by pipes: `|133|174|175|176|`. (Singapore example.)
        
5.  Submit.
    
6.  Click **Grab & Sync Feeds** and **Sync Feeds** in turn — let each complete.
    

(Confirmed BG, ELD 2/13/2023, AMBS-8601.)

### Per-client feed control — limited

> **You CANNOT remove a portal feed from one specific client's portal while leaving it for others.**
> 
> The portal feeds are managed institution-wide on the Support Site. Feeds can only be turned Active/Inactive globally — inactivating a feed removes it from ALL clients.
> 
> The "Recipient" field can theoretically scope which clients see the feed, but:
> 
> 1.  The field has a 255-character limit, too short to list "all clients except X."
>     
> 2.  Per dev, this would also create a maintenance nightmare since new clients would have to be manually added each time.
>     
> 
> **There is no per-client deactivation today.** This is a **standing structural gap.** When a client requests "remove the New England Journal of Medicine feed from our portal because they're publishing things we don't want to surface," the answer is: it can't be done at the platform level. Per-client feed control was identified as an enhancement opportunity but hasn't been built. Recommend the CSM raise it with Product. (Ticket 235835, AMBS-11061, JW 4/19/24.)

## Default Portal Feeds — defaults for new users

For institutions that want a consistent set of channels on every new user's portal:

> **GME Office → List Management → Default Portal Feeds**

Defines the default portal channels that get assigned to **NEWLY CREATED users** of each user type (Trainees, Faculty, Administrators, GME). Configurable per user type.

> **The defaults only apply to user profiles created AFTER the default portal feeds are defined.** There's no good way to bulk-apply default channels to existing users. (Ticket 243548, AMBS-12144, LS 10/23/2024.)

If no defaults are set, the system uses **institutional defaults** (a system-wide baseline).

This is also accessible from Home → middle column → **Portal Channels/Surveys → Default Portal Feeds tab** for GME and Administrator users.

## Bulk Email Tool

The Bulk Email Tool lives in the portal area and lets administrators send emails to groups of users at once. Key behavior:

> **When Program Administrators are selected as recipients in the Bulk Email Tool, only the Primary Administrator and main Backup Administrator receive the email** — even if multiple Admins exist on the program.
> 
> The Bulk Email Tool is hard-coded to pull only those two roles. Other Program Admins on the program won't receive the email. (Ticket 169921, CB 3/12/21.)

This mirrors the same Primary/Backup-only behavior that applies to Resident Dashboard email delivery (see **MedHub - Resident Dashboards** §"Email behavior nuances").

## Calendar sync — Appointments/Meetings excluded

> **The MedHub calendar sync (iCal/Outlook) excludes Appointments/Meetings.** The sync covers Rotations, Calls/Shifts, Clinics, Conferences, Events, and Notes — but NOT Appointments/Meetings posted by Program Administrators.
> 
> **Workaround**: post the event as a **Conference** instead, which DOES sync.
> 
> (Ticket 164169, JS 11/12/20.)

This is documented here because Appointments/Meetings appear on the user's personal calendar in the portal — a user reports "the meeting shows on my MedHub calendar but not on my Outlook" and the answer is the sync exclusion.

## Course session calendar visibility (UME)

For UME students:

> **Course Sessions DO appear on a student's personal calendar.** (Tested by JS 10/7/20.)

When students report missing sessions, this is rarely the cause. More often it's:

*   Course announcement scoping (announcements are posted per-Course; students in **overlapping Longitudinal classes** may not see announcements posted in their primary class). (Ticket 159356, JS 9/1/2020.) See user manual section 15.1.
    
*   Calendar sync exclusion (if they're checking Outlook rather than MedHub directly).
    

## MedHub Community

The **MedHub Community** is a cross-institution discussion forum hosted by MedHub for users at all client institutions. Accessed via:

> **Help tab → MedHub Community → Discussion Form**

### Adding to existing discussions

> **The discussion topics are predefined** by MedHub — users cannot add new top-level topics. But users CAN add a new discussion (thread) within an existing topic.
> 
> Steps to add a new discussion (Ticket 140477, JS):
> 
> 1.  Help tab → Community → Discussion Form.
>     
> 2.  Click into a current topic (e.g., "GME Conferences").
>     
> 3.  Click **+Create New Topic** and enter a title and comment.
>     

### Notification preferences

A user can enable email/alert notifications when new posts or replies are added to threads they've contributed to:

*   In MedHub Community → click the small down-arrow next to your name (upper right) → **Profile**.
    
*   Under **Preferences** → enable "Notify me by email/alert when new posts are added or replies are added to a contributed thread."
    

### Disabling new-reply alerts

> **The "MedHub Community - New Reply (1)" Urgent Task alert appears when someone posts a new thread in a topic the user follows OR replies to a thread the user posted.**
> 
> Clicking the alert does NOT remove it from the Urgent Tasks. The only way to stop these alerts is to **disable the notification preference** described above (deselect "Notify me by email/alert..." → Update Preferences). (Ticket 138652, JS confirmation.)

### Photos in MedHub Community

> **Photos shown in the MedHub Community Discussion Forum come from** `https://wordpress.com`. Users have to create a profile on [WordPress.com](http://WordPress.com) using the **same email address** that's in their MedHub profile, and upload a photo there. The photo then flows to the Community.
> 
> This is why most users don't have photos in the Community — they don't realize they need to create an external [WordPress.com](http://WordPress.com) profile.
> 
> [WordPress.com](http://WordPress.com) is a third-party vendor. MedHub Support cannot guide users through navigating [WordPress.com](http://WordPress.com). (Ticket 140477, JS confirmation.)

## Layout-breaking conferences

> **A conference whose Title or Place field contains certain characters (especially carrots** `<` and `>`) breaks the home page layout for users who see that conference in the Upcoming Events section. When this happens, portal channels in the center column don't display in the center column — they display directly under the left column.
> 
> **Cause**: characters in the conference field are interpreted as HTML.
> 
> **Fix**: edit the conference, remove the offending characters from the Title and Place fields, save. The portal layout returns to normal.
> 
> Recommendation: don't include carrot brackets in any conference fields. Common cause is users copy-pasting text that includes them. (Ticket 173631, CD 5/5/21.)

## Portal channel usage analytics — not available

> **MedHub does NOT track click counts on portal channels.** When a client asks "how many residents clicked our wellness link?" or similar, the answer is no — there's no tracking. (Ticket 230235, AMBS-10237, M. Comins documented by LS 12/4/2023.)

For institutions that need usage analytics, the workaround is to host the linked content externally on a platform that DOES track clicks (e.g., institution intranet with web analytics).

## Common scenarios

### "How do I add an image/button to our portal?"

Two steps: (1) upload to Resources/Documents/Forums first, (2) embed via Portal Channels/Surveys → WYSIWYG (image insert) or Code View (linked button via custom HTML). Follow the steps under "Custom portal channel content" above.

### "We pasted text from Word and the apostrophes look weird"

Type the text directly into the editor instead of pasting from Word, or manually replace the smart quotes with straight quotes. (Ticket 158364.)

### "Can we embed a PDF in the portal?"

No. Host the PDF externally and link to it, or convert to an image. (Ticket 147627.)

### "How do we control which portal channels new users see by default?"

GME Office → List Management → Default Portal Feeds. Configure per user type. Note: defaults apply only to NEW users created after the configuration. Existing users keep whatever they had. (Ticket 243548.)

### "Can we remove the NEJM feed from our portal but leave it for other institutions?"

No. Standing structural gap. Feeds are global — inactivating one removes it from all institutions. The Recipient field has a 255-character limit and managing exclusion lists is operationally infeasible. CSM should escalate to Product as an enhancement request. (Ticket 235835, AMBS-11061.)

### "How do I add a new RSS feed for our institution?"

CSC adds via Support Site → Portal → New Feed. Configure the feed URL and Recipients (`0` for all clients or pipe-separated global IDs for specific institutions). Run Grab & Sync Feeds + Sync Feeds. (AMBS-8601.)

### "Bulk Email Tool isn't sending to all my Program Admins"

By design — Bulk Email pulls only Primary Admin and main Backup Admin. Other Admins don't receive. (Ticket 169921.)

### "Calendar Appointments/Meetings aren't syncing to Outlook"

By design — sync excludes Appointments/Meetings. Workaround: post as a Conference instead. (Ticket 164169.)

### "Why does the Eval Completion Summary on my admin homepage look different from GME's?"

Admin homepage shows program-scoped data in one column; GME homepage shows institution-wide data in two columns (residents vs. faculty). The graphs are NOT customizable across user types. (Ticket 205968.)

### "Eval Completion Summary numbers seem inconsistent"

Make sure all statuses are checked/active. When you deselect a status, the calculation excludes that type from percentages and produces misleading numbers. By design but a niche use case. (Ticket 182315.)

### "Portal channels are showing in the wrong column on a user's homepage"

A conference Title or Place field contains carrot brackets (`<` or `>`) that are breaking the HTML layout. Find the offending conference (likely on the Upcoming Events list) and remove the special characters from its fields. (Ticket 173631.)

### "Can we count how many users clicked a button on our portal?"

No. MedHub does not track portal channel click activity. Host externally if analytics needed. (Ticket 230235.)

### "MedHub Community alerts won't go away"

The alert is a notification preference that has to be turned off, not dismissed. Help → MedHub Community → upper-right name → Profile → Preferences → deselect "Notify me by email/alert..." → save. (Ticket 138652.)

### "I want my photo in the MedHub Community"

Create a [WordPress.com](http://WordPress.com) account using the same email address as your MedHub profile, upload a photo to [WordPress.com](http://WordPress.com). It flows to the Community automatically. (Ticket 140477.)

### "Trainee says they don't see the new portal feeds we added"

Default Portal Feeds only apply to new users. Existing users have to add the feed themselves from their Portal Channels/Surveys → Add New Channel. (Ticket 243548.)

### "Resident name not appearing in Work Hours - Last Week Summary"

The resident hasn't submitted at least 2 timesheets historically. New trainees won't appear in their first week. They'll appear next week if they submit on time. (Confirmed BG.)

### "Course session not on student's calendar"

Sessions DO appear on personal calendars. (Tested JS 10/7/20.) If they're missing, it's likely an overlapping-Longitudinal-class scoping issue or the user is checking Outlook (which has its own sync exclusions). User manual 15.1.

## Open questions for Emma

None — all VERIFY items from initial draft cleared via direct sourcing in the SKU.

## Settings appendix

The Portal & Personalization features don't have many dedicated root settings — most configuration is done through the GME and Admin UIs. Where root settings come into play, they're typically institution-wide branding settings managed during onboarding.

Per-Forum / per-channel configuration:

*   **Portal channels** managed via Home → Portal Channels/Surveys.
    
*   **Default Portal Feeds** managed via List Management.
    
*   **News feeds catalog** managed via MedHub Support Site → Portal.
    

## Database tables appendix

Table

Purpose

`portal_channels`

Per-user channel configuration.

`portal_default_feeds`

Per-institution, per-user-type default channel set.

`portal_feeds`

RSS feed catalog (institution-wide, with optional Recipients restriction).

`medhub_community_threads`

MedHub Community threads (cross-institution).

`medhub_community_replies`

Community thread replies.

`medhub_community_preferences`

Per-user notification preferences for Community alerts.

`bulk_email_log`

Audit of Bulk Email Tool sends.

# MedHub - Schedule Lottery (UME) - markdown

# MedHub - Schedule Lottery (UME)

> **Source of truth for root setting current values.** Default values cited in this document come from the April 2026 Root Settings export. For the most current information on any setting — including descriptions and current default values that may have changed — the canonical source is `support.medhub.com > Lists > Settings`. Always check there when a setting's behavior or default appears to differ from what's documented.

## Overview

The Schedule Lottery is the UME-side scheduling tool that places medical students into courses based on their preferences, availability, and the institution's course rules. Used primarily for clerkship and elective enrollment, the Schedule Lottery is essentially a constraint-satisfaction optimizer that runs once the lottery deadline has passed and all student responses are in.

This document covers the Schedule Lottery as a feature: prerequisites for running a lottery (course list configuration that must be in place); the lottery setup and selection sets (Course Selection, Pathway Selection, Unavailability/Dual Program); the lottery options that affect student behavior; the optimization algorithm in summary form; common troubleshooting patterns; and what happens after optimization completes.

This document is heavily informed by the internal Confluence dev reference at `MED/47432253 — Schedule Lottery Algorithm`. That page is the canonical algorithmic reference; this doc summarizes the user-facing flow and adds operational context for support.

## Where it lives

Schedule Lottery is accessed UME-side under:

*   **Schedule Lottery** in the Student Administrator menu — the lottery subsystem
    
*   Within a lottery: **Setup / Optimization tab** for configuration and running the optimizer
    
*   **Selection Sets**, **Students**, **Responses** sub-pages
    

Student Administrators (Dean's Office) own the lottery configuration and run optimization. Course Coordinators may have visibility into their course's lottery participation but typically don't manage the lottery itself.

## Prerequisites — what must be configured before a lottery runs

The Schedule Lottery only works correctly if the underlying course list is **fully** configured. This is the single most important constraint to understand: lottery problems are almost always upstream course configuration issues, not lottery algorithm issues.

The course list must have, for every course participating in the lottery:

*   **Standard class size (min / max)** — minimum and maximum students per offering
    
*   **Academic terms** — defined in **Student Admin → List Management → Academic Terms**
    
*   **Block dates** — the date ranges for each clerkship period
    
*   **Course dates** — the specific offering dates per course
    
*   **Course Groups** — groupings used in selection sets. **Each course can only be part of one group.** Courses in a group are referred to as "tasked" courses.
    
*   **Schedule requirements** — three configurable requirements:
    
    *   **Schedule Immediately After** — the course must be scheduled in the block immediately following another course
        
    *   **Pair Scheduling** — the course must be scheduled consecutively with another course
        
    *   **Equivalent Course** — courses that count as equivalent for scheduling purposes (a student already scheduled to one is treated as having taken the other)
        
*   **Prerequisites** — individual or groups of courses that must have been completed before this course
    

> **If the course list isn't fully configured, the lottery will produce surprising results.** Students may be placed in wrong blocks, miss preferred courses they should have been eligible for, or be unscheduled for courses they expected. This is why lottery troubleshooting always starts with the course list, not the lottery itself.

## Setting up a lottery

Once the course list is configured, the lottery setup happens under **Schedule Lottery → Setup / Optimization tab**:

1.  Create a new lottery for the relevant academic term.
    
2.  Configure **selection sets** — the rules that govern what students can select. Three types (each is a separate selection set in the lottery):
    
    *   **Course Selection** — student selects courses from one or more groups
        
    *   **Pathway Selection** — student selects from a defined linear sequence of courses (a "pathway") that must be taken in order
        
    *   **Unavailability (Dual Program)** — student indicates date periods when they're unavailable (e.g., dual MD/PhD program demands)
        
3.  Configure **lottery options**:
    
    *   **Student can select pair** — students can request to be paired with another student for scheduling
        
    *   **Student must identify specialty / residency** — students can be required to indicate intended residency
        
    *   **Student can revise a completed optimization submission (prior to deadline)** — students can modify their submission before the deadline
        
    *   **Perform post-optimization check for unscheduled weeks** — checks for unscheduled date periods in the optimization summary
        
4.  Assign students to the lottery.
    
5.  Open the lottery for student responses.
    
6.  Wait for the deadline. Confirm all assigned students have responded (the optimizer requires this).
    
7.  Run optimization.
    

## Selection sets in detail

### Course Selection

The most common selection set type. Students see a list of course groups and select courses from those groups. Within Course Selection:

*   Student can rank preferences if the lottery allows ranking
    
*   Pair scheduling can be requested
    
*   Date period preferences can be indicated per course
    

The optimizer for Course Selection is the most complex of the three (per the algorithm reference) and handles the majority of lottery placements.

### Pathway Selection

Used for predefined linear sequences. Common example: a research pathway with required courses in order.

*   Each pathway has a fixed sequence of courses
    
*   Students rank pathway preferences
    
*   Optimizer places students in pathways based on slot availability
    

### Unavailability (Dual Program)

Used when students need to indicate periods when they're not available for scheduling — typically for dual-degree programs (MD/PhD, MD/MBA) where the student has commitments outside the medical school.

*   Student indicates blocker periods
    
*   Optimizer creates an enrollment record indicating the unavailable period
    
*   Other selection sets respect the unavailability
    

## How students respond to a lottery

Once assigned, students see the lottery on their home page → Schedule Lottery section. The student:

1.  Reviews the selection sets they're assigned to
    
2.  For Course Selection: picks courses from groups, optionally ranks preferences, optionally indicates date period preferences
    
3.  For Pathway Selection: ranks pathways
    
4.  For Unavailability: indicates blocker periods
    
5.  Optionally requests pairing with another student
    
6.  Optionally selects intended specialty/residency
    
7.  Submits
    

If the lottery allows revision, the student can modify their submission until the deadline. After the deadline, the lottery is closed for new responses.

## Running the optimizer

After the deadline:

1.  Confirm all students have responded. **The optimizer will not run until all assigned students have submitted.**
    
2.  Click **Run Optimization** on the Setup / Optimization page.
    
3.  The optimizer iterates through selection sets and places students. Progress is shown on screen.
    
4.  When complete, the lottery status moves to "Optimized."
    
5.  Review results.
    
6.  **Note: students are NOT actually enrolled at this point — they are placed in the lottery subsystem only.**
    

The actual enrollment commit happens as a separate step after the Student Administrator reviews and approves the optimization results. This separation lets the administrator review placements and re-run if needed before committing.

### What re-running does

If the optimization is re-run, **any enrollments that were done by this lottery are cleared out (deleted from the system)** — including, importantly, lottery-subsystem enrollments. This means a re-run starts fresh. Confirm before re-running that this is desired.

## The optimization algorithm — summary

The full algorithmic reference is in the dev Confluence page (`MED/47432253`). At a high level:

1.  **Past lottery state is cleared.** Any enrollments from the previous run are removed.
    
2.  **Pairing data is collected.** Students who chose to pair with each other are tracked for downstream placement.
    
3.  **Course rules are gathered.** Schedule Immediately After, Pair Scheduling, Equivalent Course, prerequisites are all loaded.
    
4.  **The main loop begins**, iterating over each selection set.
    
5.  **For Course Selection**:
    
    *   Course list is sorted by `lottery_courses_order` function. Sort priority: courses with cleared prerequisites first, then "Schedule Immediately After" courses, then courses with longer date periods, then smallest class size first.
        
    *   If students ranked preferences, optimization happens in **rounds** — one round per ranked preference. The number of rounds equals the highest rank the student with the most preferences chose.
        
    *   Within each round, courses are iterated in sorted order.
        
    *   For each course, available date periods are computed (slots × periods), considering cancellations, enrollment closures, and full-from-existing-enrollment.
        
    *   Students who chose this course are gathered and **ordered randomly**.
        
    *   Students who fail prerequisite checks are filtered out.
        
    *   For each remaining student:
        
        *   If automatically scheduled (via Schedule Immediately After or Pair Scheduling), the optimizer places them in the appropriate adjacent block.
            
        *   Otherwise, the optimizer iterates the student's date period preferences and places them in the first preference that has an available slot, doesn't overlap a no-overlap course, and clears prerequisites.
            
    *   Pair scheduling: if a student was placed and they have a pairing partner, the optimizer also tries to place the partner in a compatible block.
        
    *   Unscheduled students are tracked in `$unscheduledA` for retry at the end.
        
6.  **For Pathway Selection**:
    
    *   Pathways are loaded with their slot capacity.
        
    *   Students are ordered randomly.
        
    *   For each student, the optimizer iterates their pathway preferences and places them in the first pathway with available slots.
        
    *   Pair scheduling applies if pathway slots are available for both students.
        
    *   Unscheduled students are retried via random pathway placement.
        
7.  **For Unavailability (Dual Program)**:
    
    *   The optimizer iterates student responses with blocker periods.
        
    *   For each, an enrollment record is inserted indicating the unavailable period.
        
8.  **Lottery status is set to Optimized.**
    

## After optimization — review and commit

Once optimization completes:

1.  **Review the optimization summary** on the lottery's results page. The summary shows placements, unscheduled students, and (if "Perform post-optimization check for unscheduled weeks" is enabled) any unscheduled date periods.
    
2.  **Address unscheduled students.** If any students couldn't be placed, the administrator can:
    
    *   Re-run with adjusted parameters
        
    *   Manually place those students in available slots
        
    *   Adjust the lottery (open additional slots, etc.) and re-run
        
3.  **Commit enrollments.** This step finalizes the placements as actual course enrollments in the system.
    
4.  **Notify students.** Once committed, students see their schedule on their MedHub home page.
    

> **The lottery subsystem and the actual enrollment system are separate.** Until commit, all placements live in `sh_students_lottery_enrollment` only — not in `users_students_enrollment`. Re-running the lottery doesn't affect committed enrollments unless those committed enrollments came from this same lottery (in which case re-run clears them).

## Common scenarios

### "The lottery placed a student in a course they didn't pick"

Walk through:

1.  Was the course an "auto-schedule" course (e.g., Schedule Immediately After)?
    
2.  Did the student fall through preference matching (no preferred slots available, ended up in the unscheduled cleanup pass)?
    
3.  Was the course a required course in a Pathway the student selected?
    
4.  Are equivalent courses configured? The student may have selected an equivalent.
    

### "Optimization won't run — error about responses not received"

The optimizer requires all assigned students to have submitted. Check the Responses page for unsubmitted students. Either:

*   Wait for them to submit
    
*   Remove them from the lottery (if they're not actually participating)
    
*   Submit a placeholder on their behalf if the institution allows
    

### "Unscheduled students after optimization"

Possible causes:

1.  Course capacities are too low for the cohort
    
2.  Prerequisites are blocking placement (students don't have prereqs cleared)
    
3.  No-overlap rules are too restrictive
    
4.  Student's preferences don't match available slots
    

The optimization summary's unscheduled list is the starting point. Manual placement is often needed for these students.

### "Re-running the lottery cleared previously committed enrollments"

Re-running clears enrollments that came from this same lottery — including committed ones. To preserve committed enrollments, do NOT re-run; instead, manually adjust placements.

### "Lottery results don't match what students saw before submission"

Optimization happens after submission. Students see preview placements during submission only as informational. Final placements depend on the optimizer running across all students simultaneously.

### "Pair scheduling didn't work for two students who requested it"

Pair scheduling is best-effort. If the optimizer can't find slots for both students in compatible blocks (e.g., both have no available slots in the same period), one or both end up unscheduled or scheduled separately. This is by algorithmic design, not a bug.

### "Course has 'Schedule Immediately After' but didn't schedule that way"

Prerequisites for the parent course must be cleared first, AND the next block must have available slots, AND no no-overlap rule conflicts. If any of those fail, the optimizer falls back. Check the algorithm flow for the Schedule Immediately After path (described in detail in the dev reference at `MED/47432253`).

### "Pathway placement put students in the wrong order"

Pathway slots are assigned per pathway, not per course within a pathway. Within a pathway, the linear order is preserved by the courses themselves having sequential dates. If a pathway course has wrong dates, the order will appear wrong even though the pathway placement is correct.

## Open questions for Emma

*   `[VERIFY]` The exact UI flow for committing optimization results to actual enrollments. The algorithm reference doesn't cover the post-optimization commit flow in detail.
    
*   `[VERIFY]` Whether there's an "audit trail" for lottery runs — who ran the optimizer, when, what results were committed. Useful for support investigations.
    
*   `[VERIFY]` The exact behavior of equivalent courses in the lottery — specifically whether choosing an equivalent in one selection set affects placement in another.
    
*   `[VERIFY]` Whether students whose unsubmitted responses block optimization can be flagged automatically for follow-up.
    

## Settings appendix

> **Source of truth.** Default values and descriptions in this table reflect the April 2026 root settings export. The current default and description of any setting can drift over time; the canonical, always-current source is `support.medhub.com > Lists > Settings`. When a setting's behavior or default appears to differ from what's documented here, check there first and check the institution's actual configured value before troubleshooting.

Setting

Effect

`setting_lottery_pair_select`

Whether students can request pairing in lottery responses.

`setting_lottery_specialty_required`

Whether students must indicate intended specialty/residency.

`setting_lottery_revision_allowed`

Whether students can revise submitted responses prior to deadline.

`setting_lottery_post_check`

Whether to perform post-optimization unscheduled-weeks check.

Most lottery configuration is per-lottery (set during lottery creation), not via root settings.

## Database tables appendix

(Per the dev reference at `MED/47432253`):

Table

Purpose

`i_clerkships`

Course definitions (clerkship-flavored).

`i_clerkships_dates`

Course offering dates.

`i_clerkships_pathways_paths`

Pathway definitions (only used for Pathway Selection).

`i_clerkships_prereqs`

Course prerequisites.

`i_clerkships_requirements`

Course requirements (Schedule Immediately After, Pair Scheduling, Equivalent Course).

`ref_students_blocks_periods`

Block period reference.

`ref_students_terms`

Academic term reference.

`sh_students_lottery_enrollment`

Lottery subsystem enrollment records (pre-commit placements).

`sh_students_lottery`

Lottery records (one per lottery instance).

`sh_students_lottery_responses`

Student responses to a lottery.

`sh_students_lottery_responses_sets`

Response data per selection set.

`sh_students_lottery_sets`

Selection set definitions per lottery.

`sh_students_lottery_responses_sets_selections`

Individual student selections within a response.

`users`

User reference.

`users_students_deferments`

Student deferments (excluded from lottery placement for that course).

`users_students_enrollment`

Actual enrollment records (post-commit destination). See **MedHub - Course Enrollments**.

Lottery code: `lottery_generate` function in `app/includes/common/include_students_lottery.mh`. Course sorting: `lottery_courses_order` function. Validity check: `lottery_invalid_check`.

For the full algorithmic detail, see the internal Confluence dev reference: Schedule Lottery Algorithm (MED/47432253).

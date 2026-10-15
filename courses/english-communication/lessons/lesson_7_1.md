# Lesson 7.1: Giving Clear Standup Updates & Project Statuses

## 1. Lesson Information
- **Day/Topic Number:** 7.1
- **Core Concept:** The "Yesterday / Today / Blockers" (YTB) Framework for high-signal, low-noise status updates.
- **Learning Objective:** Deliver a structured, concise, and action-oriented verbal standup update in under 60 seconds that enables immediate team alignment and surfaces blockers effectively.

---

## 2. Theory & Spoken Patterns

### The Core Principle: Signal > Noise
In a standup, listeners are mentally filtering for three things: **Progress** (Done), **Momentum** (Doing), and **Risk** (Blocked). Rambling context hides the signal. Your job is to *curate* the information, not dump it.

### The YTB Structure (The "Gold Standard" Formula)
Use this mental template every time. Keep each section to **one sentence max**.

1.  **Yesterday (Completed Value):** *Past tense verb + Specific Outcome.*
    *   *Pattern:* "**Wrapped up** [specific deliverable] / **Finalized** [decision/doc] / **Shipped** [feature]."
2.  **Today (Focused Momentum):** *Present continuous + Specific Next Step.*
    *   *Pattern:* "**Moving on to** [next logical task] / **Focusing on** [specific module/edge case] / **Pairing with [Name] on** [integration]."
3.  **Blockers (Explicit Ask):** *Clear obstacle + Specific Owner/Action needed.*
    *   *Pattern:* "**Blocked on** [dependency] — **need [Name/Role] to** [action] by [time]." OR "**No blockers.**"

### High-Frequency "Connector" Phrases (For Flow)
*   *Transitioning:* "On that note…" / "Shifting gears to…" / "The one thing slowing me down is…"
*   *Quantifying:* "About 80% there…" / "Just the happy path done…" / "Rough cut ready for review…"
*   *Closing:* "That’s it from me." / "Happy to take questions offline." / "I’ll ping you in the thread."

### When & Why to Use This
*   **Daily Standups (Sync):** Keeps the 15-minute timebox sacred.
*   **Async Video/Voice Updates (Slack/Loom/Teams):** Respects the viewer's time; they can 2x speed it.
*   **Stakeholder "Quick Syncs":** Executives only want the headline: *Done, Doing, Danger.*

---

## 3. Natural Spoken Examples & Dialogue

### Scenario A: The Software Engineer (Feature Work)
| **How NOT to Say It (Rambling/Context-Heavy)** | **How a Clear Speaker Says It (YTB Structure)** |
| :--- | :--- |
| *"So yeah, I was working on the auth refactor yesterday. It took longer than I thought because the legacy code is messy. I had to debug a lot of weird session issues. Today I'm probably gonna finish the cleanup and maybe start the new OAuth flow if I have time. Oh, also waiting on DevOps for the staging env but they're busy."* | **"Yesterday, I wrapped up the auth refactor and merged the session fix. Today, I’m implementing the new OAuth flow. One blocker: I need DevOps to provision the staging env — I’ve pinged Sam, need it by EOD to test. That’s it."** |
| **Why:** Buries the lead ("wrapped up"), vague on "today" ("maybe start"), blocker is passive ("waiting on"). | **Why:** Past tense verb ("wrapped up"), specific next step ("implementing OAuth"), blocker has **Owner + Action + Deadline**. |

### Scenario B: The Product Manager (Cross-Functional)
| **How NOT to Say It** | **How a Clear Speaker Says It** |
| :--- | :--- |
| *"I had a lot of meetings yesterday. Met with sales about the pricing page, talked to design about the dashboard. Today I have more meetings. Writing the spec for Q3. No blockers really, just busy."* | **"Yesterday, I finalized the Q3 pricing spec with Sales and signed off on the dashboard mocks with Design. Today, I’m drafting the Q3 roadmap narrative for leadership review. No blockers, but I need quick feedback on the spec by noon — link in the channel."** |
| **Why:** "Had meetings" = zero value delivered. "Busy" is not a status. No clear ask. | **Why:** Names specific *artifacts* delivered (spec, mocks). Defines today's *output* (narrative). Turns "no blockers" into a proactive **pull request for feedback**. |

### Scenario C: The "Stuck" Developer (Honest Blocker)
| **How NOT to Say It** | **How a Clear Speaker Says It** |
| :--- | :--- |
| *"Uh, still working on the migration script. It's tricky. Keep getting errors. Might need help later."* | **"Yesterday, I hit a wall on the migration script — data type mismatch on the legacy export. Today, I’m debugging the parse logic. **Blocker:** I need a second pair of eyes on the regex — **can someone jump on a huddle at 10 AM?**"** |
| **Why:** "Tricky," "might need help" signals low ownership. No plan. | **Why:** Names the *exact* technical error. States the *plan* (debugging). Makes a **specific, time-boxed ask** (huddle @ 10 AM). |

### Scenario D: The "Green" Status (High Velocity)
> **"Yesterday, shipped the dark-mode toggle (PR #402). Today, writing integration tests for the payment webhook. No blockers. Back to it."**
> *(Time: ~12 seconds. High information density.)*

### Scenario E: The Designer (Handoff Focus)
> **"Yesterday, delivered the high-fid screens for the onboarding flow to Zeplin. Today, prepping the animation specs for the hand-off to iOS. **Blocker:** Waiting on final copy from Content — **pinged Maya, need it by 2 PM** to meet the sprint cutoff."**

---

## 4. Verbal Practice & Content Drills

### Drill 1: The 60-Second "Standup Simulator"
**Instructions:** Set a timer for **60 seconds**. Stand up (physically changes breath/voice). Deliver your update for *your actual current work* (or a realistic simulation) using **strict YTB structure**.
*   **Constraint:** Max 2 sentences per section. No "ums," "ahs," or "sort of."
*   **Record it.** Playback. Ask: *"Did I name a specific deliverable for Yesterday? Is Today a concrete next step? Does the Blocker have a Name + Action + Time?"*

### Drill 2: Workplace Scenario — The "Pivot" Update
**Task:** You finished Task A early. You are pivoting to Task B (unplanned). You have a new dependency on another team.
**Scenario:** It's Tuesday standup. Monday you said you'd finish the API docs. You finished them Monday afternoon. You started the load testing script today. You need the QA lead to configure the test data set.
**Model Spoken Response:**
> **"Yesterday, I completed the API docs ahead of schedule and pushed them to Confluence. Today, I’ve pivoted to the load testing script — currently scripting the ramp-up scenario. **Blocker:** I need the QA lead (Alex) to configure the synthetic test dataset in the staging env — **I’ll sync with him right after this standup to confirm timing.**"**

### Drill 3: Workplace Scenario — The "Risk Flag" (No Hard Blocker Yet)
**Task:** You are on track, but you see a *risk* coming next week (dependency on another team who hasn't confirmed).
**Scenario:** You are integrating the payment gateway. Code is written. Sandbox works. But Production credentials require Security Review, which hasn't been scheduled.
**Model Spoken Response:**
> **"Yesterday, finished the payment gateway integration — sandbox tests passing. Today, writing the idempotency key logic for retries. **Heads-up / Risk flag:** We’re clear for now, but **Production deploy is blocked on Security Review for PCI compliance.** I’ve emailed the Sec team; no slot yet. **I’ll escalate to [Manager] if no update by Wednesday.** No immediate action needed from the team today."**
> *Note: Distinguishing "Blocker" (stops me *now*) vs. "Risk" (stops me *soon*) is a senior communication skill.*

---

## 5. Daily Implementation Action

**The "Pre-Standup 30-Second Prep" Ritual:**
**Before your next standup (or before recording your async update), open a blank note/sticky and write exactly three bullet points:**
1.  **DONE:** [One past-tense verb + noun] *(e.g., Merged PR #404)*
2.  **NEXT:** [One -ing verb + noun] *(e.g., Writing integration tests)*
3.  **ASK:** [Name + Verb + Deadline] OR "None" *(e.g., Sarah to approve design by 11 AM)*

**Read these three bullets verbatim as your update.** Do not improvise sentences. Do not add context unless asked. Do this for **5 consecutive work days** to build the "YTB muscle memory."

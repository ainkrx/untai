# Crochet pattern sharing app design

## Overview

Personal project: a site where users upload crochet patterns and share the results ("Recreates") of following other people's patterns. Fully free, no payments (avoids building fake/half-working monetization).

## Stack

- Free tiers only: Vercel (Hobby) and Neon (Free)
- Next.js (fullstack: App Router and Route Handlers/Server Actions), deployed on Vercel
- Postgres via Neon
- Images: Vercel Blob. Hobby includes 1 GB storage, 2,000 uploads/month, 10 GB transfer; over the limit, Blob is locked for 30 days with no bill. Images are uploaded from the browser (client upload), because server uploads are capped at 4.5 MB per request. Max 10 MB per image; larger files are rejected. Hobby is for non-commercial, personal use only.
- Drizzle ORM
- Better Auth (login, session, email verification code, forgot-password code)
- Email: Nodemailer through the owner's own Gmail (SMTP and an app password), or Brevo or a similar provider. If none of them works, see Email fallback below.
- Testing: Vitest for pure logic; Playwright E2E for every flow
- Tailwind and shadcn/ui
- No likes, no points/ledger system (cut for v1: no clear purpose yet, and it adds takedown-retraction complexity for no payoff)

## Roles

- **User**: registers, must verify email before logging in at all. No verification, no login.
- **Admin**: exists only via seed. No admin signup flow.

## Entities

**User**
- Managed by Better Auth, which creates its own tables: `user`, `session`, `account` (password login goes through here), `verification` (verification codes live here)
- Better Auth's `user` table already has `name` (display name) and `image` (profile picture URL; the file lives in Vercel Blob)
- Added to Better Auth's `user` table: role (`user` | `admin`), bio

**Pattern**
- id, author_id, title, description, images (max 5; these are the opening images shown with the title and description, separate from step images)
- category: exactly one per Pattern, from this list: Outerwear, Tops, Dress, Skirt, Pants, Hats, Scarves, Gloves, Socks, Keychain, Amigurumi, Blankets, Home decor, Others
- tags: max 25, e.g. bunny, cat, strawberry, pink. The author picks existing tags or adds a new one; a tag that already exists is not added again. All tags are stored lowercase automatically.
- difficulty, one of 4 levels: Beginner, Easy, Intermediate, Advanced
- steps: an ordered list, max 50; each step has its own id, a description and 1 to 3 images
- status (`private` | `in_review` | `public`), created_at, updated_at (changes only when the author saves an edit, not on submit, approval, rejection or takedown), published_at (set once, when the admin first approves it; a later re-approval after a takedown does not change it)
- admin_reason: written by the admin when rejecting or taking down the Pattern; required for both; the author sees it in My patterns while the Pattern is `private`; it is cleared when the author submits the Pattern again
- `private`: only visible to the author. This covers a draft, a rejected Pattern, or a taken-down Pattern. `in_review`: submitted by the author, not visible to the public until an admin approves it. `public`: published, visible per access rules below.

**Recreate**
- a post showing a user followed someone else's Pattern
- id, pattern_id, author_id, rating (1 to 5 whole stars), images (max 3), caption, created_at
- One Recreate per user per Pattern. Once it is deleted (by the poster or through a takedown), the user has none on that Pattern and can post a new one.
- No status: a taken-down Recreate is deleted.
- Every Recreate on a `public` Pattern counts toward that Pattern's average rating and Recreate count.
- When a Pattern is taken down (back to `private`), its Recreates are hidden with it (including from public profile pages) and stop counting; the author still sees them on their own Pattern; the poster still sees them in My reviews, marked as belonging to a Pattern that is no longer public. It is the same Pattern record, so when it is approved again its Recreates show again and count toward its rating again.
- Deleting a Pattern also deletes its Recreates, and every user's StepProgress and PatternCounter on it.
- An image is deleted from Vercel Blob once nothing uses it any more: its Pattern or Recreate is deleted, the author removes or replaces it while editing, or the user replaces their profile picture.

**Report**
- id, target_type (`pattern` | `recreate`), target_id, reporter_id, reason (picked from a list: Inappropriate content, Spam, Other), note (optional text; required when the reason is Other)
- A user has at most one `open` Report per target.
- If the target is deleted before the admin acts (the poster deletes the Recreate, or the author deletes the Pattern), its `open` Reports become `resolved`.
- status (`open` | `resolved`), created_at

**StepProgress**
- tracks a user's checked-off steps on a Pattern (not the Pattern's own author)
- id, user_id, pattern_id, step_id, checked_at. A check is tied to the step itself, not its position, so reordering steps keeps each check on the right step; deleting a step deletes its checks

**PatternCounter**
- personal counters per (user, pattern), separate from StepProgress and not tied to any specific step
- two counters: Row and Stitch, shown under the Pattern's title, whether the Pattern is `public` or `private`; no adding, renaming or deleting counters
- each is incremented/decremented manually, and can be reset to 0
- id, user_id, pattern_id, row_count, stitch_count, updated_at
- scoped per pattern: opening a different Pattern shows that Pattern's own counters
- on the Create page the counters work from the draft's first save, since the Pattern has no id before that

## Access rules

- **Guest (not logged in):** can browse the home page, search page (pattern list), pattern detail, Recreates. Cannot open public profile pages. On a pattern's steps, sees only steps 1 to 3. Full steps require login.
- **Logged in (always verified, since verification gates login):** sees full pattern steps, can upload own Pattern, edit it only while it is `private`, delete it only while it is `private` or `in_review`, post a Recreate on another user's Pattern, delete their own Recreate (no editing), report a Pattern or Recreate.
- **Admin:** a separate kind of access. The admin account is only for admin work (the verification queue and the report queue), not the regular user features. The admin logs in on the same login page and is sent straight to the admin area, which has its own Logout button. Opening any regular page (home, search, Pattern detail, profile) sends the admin back to the admin area, so none of the logged-in user rules apply to the admin. Opens the full content of an `in_review` Pattern and approves it (it becomes `public`) or rejects it with a reason (it goes back to `private`). Sees reported queue, including the full content of each reported Pattern or Recreate, and can take down a reported Pattern (it goes from `public` back to `private`, with a reason) or a reported Recreate (it is deleted).

## Layout

- **Navbar:** logo (links to the home page), search bar (goes to the search page), an "Add Pattern" button (logged-in users only; hidden for guests), and the profile in the top-right corner, opening a dropdown: My patterns (the author's own Patterns, every status), My reviews (the user's Recreates), Settings (name, profile picture, bio, change password), Logout. Nothing else for now. A guest sees two buttons in place of the profile: Login and Register.
- **Public profile page:** one per user, open to every logged-in user (guests cannot open it): name, profile picture, bio, the user's `public` Patterns, and the Recreates the user has posted. The author's name on a Pattern or Recreate links to it; a guest who clicks it gets an info toast asking them to log in or register.
- **Pattern detail page:** shows the Pattern's published date (published_at) and last-updated date (updated_at). Left column: the steps, the StepProgress checklist, and the Recreates (reviews) at the bottom, where logged-in users (not the author) post a Recreate. Right sidebar: PatternCounter (Row and Stitch).
- **Toasts:** three kinds. Success: every action that goes through (save, submit, post, edit, delete, report, and so on). Error: every action that fails, with what went wrong. Info: guidance that is neither, such as telling a guest to log in or register.
- **Create/Edit Pattern page:** same layout. The right sidebar keeps the PatternCounter available while the author writes/edits steps. Pattern stays `private` until the author submits it for admin verification.

## Flows

1. Register (name, email, password), then the user gets an email with a code and enters the code on the web to verify. The user must verify before the first login. No code entered means unsuccessful registration. Registering again with an email that is already registered (verified or not) is rejected with "email already registered". The user can request a new code to be sent to the same email. A registered but unverified user who tries to log in is sent a new code and taken to the code-entry page (Better Auth's built-in behavior with `requireEmailVerification`).
1a. Forgot password: the user clicks "Forgot password" on the login page and enters their email, a code is sent (Better Auth Email OTP, type `forget-password`), and the user enters the code and a new password.
2. Guest browses patterns/recreates freely; hits a login wall past step 3 of any pattern. A guest cannot check off steps or use the counters, and nothing is kept for them in the browser session; pressing a step check or a counter shows an info toast asking them to log in or register.
3. Logged-in user uploads a Pattern (title, description, images, category, tags, difficulty, ordered steps). It is saved as `private`, and a draft can be saved half-finished. All of these must be filled before it can be submitted for admin verification: title, description, at least one image, category, at least one tag, difficulty, at least one step, and at least one image on every step.
3a. Author submits the Pattern, it waits for admin verification, and once the admin approves it, it becomes `public`. If the admin rejects it, the admin must write a reason, and it goes back to `private`, so the author can edit it and submit it again.
4. Who can edit and delete, by status:
   - Pattern `private`: the author can edit and delete it.
   - Pattern `in_review`: nobody can edit it; the author can delete it.
   - Pattern `public`: nobody can edit or delete it.
   - Recreate: nobody can edit it; its poster and the admin can delete it.
   - A taken-down Pattern is `private` again, so the `private` rule applies.
4a. Logged-in user (not the Pattern's author) checks off steps as they complete them while following the Pattern. A checked step can be unchecked again (toggle), and a "reset" clears every checked step on that Pattern.
4b. Logged-in user also has personal Row and Stitch counters on each Pattern they open, each incremented/decremented manually and resettable to 0, saved per (user, pattern), separate from the step checklist.
5. Logged-in user posts a Recreate against another user's Pattern (rating, images, caption), one per Pattern. All required: rating, at least one image, caption. It goes public immediately, with no admin verification; a bad Recreate is handled through a report and a takedown. The user can delete their own Recreate anytime; a Recreate cannot be edited.
6. Home page widgets. A "check this out" section with three rows (no likes): Top is sorted by average Recreate rating, with Patterns that have no Recreates yet shown last; Most reviewed is sorted by Recreate count; New shows the most recently published Patterns first (by published_at). Each row shows its top 5 Patterns with their rating and Recreate count, plus a "more" link.
7. Search page: this is the pattern list. It has a search bar (searches title and tags with a "contains" match using Postgres ILIKE, e.g. "bun" matches "Bunny Keychain" and the tag "bunny") and filters: category (pick one), tags (pick one or more; a Pattern must have all the picked tags), difficulty (pick one or more; a Pattern matches any of the picked levels), rating (a range; when it is set, Patterns with no Recreates yet are excluded). A sort control switches between New, Top and Most reviewed; the default is New. A home row's "more" link opens this page with that row's sort already applied (New sorts by published_at, Most reviewed by Recreate count, Top by average rating with Patterns that have no Recreates yet last). Sorting never hides Patterns; only filters do.
8. Any logged-in user reports a Pattern or Recreate, and the report enters the admin queue.
9. Admin reviews queue, takes down offending Pattern/Recreate: a Pattern goes from `public` back to `private` with a reason the author sees in My patterns; a Recreate is deleted. Either way the report, and every other `open` report on the same target, becomes `resolved`; a report on something that isn't offending is resolved without a takedown.
10. No notifications: authors see approvals, rejections and takedowns only as the status (and admin_reason) in My patterns. A taken-down Recreate is deleted, so it disappears from its poster's My reviews.

## Email fallback

This is the worst case: no way of sending email works (Gmail SMTP with an app password, Brevo, or a similar provider). The app then runs without email:

- Email verification is off. Registering logs the user in right away, with no code (flow 1 without the code steps), and Roles' "no verification, no login" does not apply.
- Forgot password (flow 1a) is not available. A user who forgets their password cannot get back into that account, and nothing else is offered.
- Everything else stays the same.

## Out of scope (v1)

- Payments/monetization
- Likes
- Points/rewards ledger: may revisit later if a concrete use case (badges, rewards) emerges
- Notifications (email or in-app)
- Account deletion
- Banning users

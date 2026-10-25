# Testing

What has to be tested, page by page, and with which kind of test. Rules and flows are in `docs/app-flow.md`; how it looks is in `docs/style.md`; what has been built is in `docs/progress.md`.

## Kinds of test

- **Integration**: Vitest (`*.itest.ts`) against the test database in `compose.test.yaml`, never the development one: a test run points `DATABASE_URL` and `DIRECT_URL` at it, since the seeder's `localhost` check does not tell the two apart. Calls a Server Action and checks what it returns and the rows it wrote; a refusal writes nothing. Reads use the seeded rows, and each test saves its own rows. Logged-in requests use `test.login({ userId })` from Better Auth's `testUtils`, with `next/headers` mocked. Vercel Blob is stubbed, and a test checks which image URLs the code asks it to delete.
- **Unit**: Vitest (`*.test.ts`, next to the code it checks) on a plain function that takes values, no database and no mocks. Checks the edges of a rule: the last value that passes and the first that fails.
- **E2E**: Playwright (`e2e/`) against the running app on the test database, seeded fresh before each run, only for flows that cross several pages and for the navbar. Every test runs in Desktop and Mobile Chrome, so one that uses the navbar works in both layouts. Logs in through the real login form with a seeded account, so every E2E also covers a successful login. Finds things by role and label. A test that changes shared data (a password, a name, a Pattern's status) uses seeded accounts and Patterns of its own that no other test reads; the seeder does not have these yet. Uploads go to the real Vercel Blob, which has a monthly limit, so only the few flows below upload.
- **Optional**: needs an email with a code to arrive, for email verification or Forgot password. Written once sending email works, and how a test gets the code is decided then.

Better Auth's own logic is not tested, only what this project decides. Not tested for that reason: Better Auth refusing an email that is already registered (only the error toast the register page shows for it is), and asking for a new code.

A test's title is a sentence saying what happens, as the items below do.

## Why these kinds

- Integration: every rule lives on the server, and the most important ones (one Recreate per user per Pattern, one check per step even when two requests arrive at once, deletes that take other rows with them) need a real Postgres. A refusal is checked here, since a hidden button does not stop a request.
- Unit: the validators have many edges (1 to 5 images, 1 to 25 tags, 1 to 50 steps), too slow to check each through Postgres.
- E2E: a redirect, something done on one page and seen on another, and what each role sees in the navbar need a browser and the whole app.
- No component tests: E2E already checks what each role sees.

## Every page

Navbar:

- [ ] **E2E** the search bar opens `/search?q=...` with the typed text and shows the matching Patterns.
- [ ] **E2E** picking a category opens the search page filtered by it, for a guest too.
- [ ] **E2E** on desktop the Category dropdown closes on a click outside it and when a category is picked.
- [ ] **E2E** the hamburger menu opens a sheet with About first, then Add Pattern.
- [ ] **E2E** a guest's profile menu shows Login and Register; a logged-in member's shows My patterns, My reviews, Settings and Logout, and no Login or Register.
- [ ] **E2E** picking Dark in the theme menu puts the dark theme on the page, and it is still dark after a reload.
- [ ] **E2E** Logout ends the session, and the next page shows the guest items.

Redirects:

- [ ] **E2E** a guest who opens a page that needs login by its URL (Create Pattern, My patterns, My reviews, Settings, a public profile) does not get the page.
- [ ] **E2E** the admin who opens any regular page (home, search, a Pattern, a profile, My patterns, Settings) is sent back to the admin area.
- [ ] **E2E** a member who opens the admin area by its URL does not get it.

Toasts:

- [ ] **E2E** an action that goes through shows the success toast: saving a Pattern.
- [ ] **E2E** a loading toast shows while an action runs: saving a Pattern.
- [ ] **E2E** an action that fails shows the error toast with what went wrong, and the user stays on the page: a wrong password on the login page.
- [ ] **E2E** a guest who presses a step check or a counter, or who clicks an author's name, gets the info toast asking them to log in or register, and nothing is saved.

## Register

- [ ] **Integration** a new account is always `member`, and sending `role` with the request does not change it.
- [ ] **E2E** registering with name, email and password creates the account; while email verification is off, the user is logged in right away. Once verification is on, the optional item below replaces this second half.
- [ ] **E2E** registering with an email that is already registered shows the error toast with what went wrong, and the user stays on the register page.
- [ ] **E2E, optional** after registering, a code is sent and the user lands on the code-entry page.

## Email verification (code entry)

- [ ] **E2E, optional** the right code verifies the account, and the user can log in after it.

## Login

- [ ] **E2E** a member who logs in on the login page gets the success toast and lands on the home page.
- [ ] **E2E** the admin who logs in on the login page is sent straight to the admin area.
- [ ] **E2E, optional** an unverified user who tries to log in is taken to the code-entry page.

## Forgot password

- [ ] **E2E, optional** from the login page the user asks for a code, enters it with a new password, then logs in with the new password.

## Home

- [ ] **Integration** Top sorts by average Recreate rating with Patterns that have no Recreates last, Most reviewed sorts by Recreate count, New sorts by `published_at`, newest first; the search page's sort control gives the same order. The fixtures have no ties, since `docs/app-flow.md` sets no tie-break.
- [ ] **Integration** the rows hold only `public` Patterns, at most 5 each.
- [ ] **E2E** each row's "more" link opens the search page with that row's sort applied.
- [ ] **E2E** the home page shows the same rows for a guest and for a logged-in member.

## Search

- [ ] **Integration** with no sort chosen, the list is sorted New.
- [ ] **Integration** text search matches title and tags with "contains", case insensitive: "bun" finds "Bunny Keychain" and the tag "bunny".
- [ ] **Integration** category: one; tags: the Pattern has every picked tag; difficulty: the Pattern has any picked level; rating range: Patterns with no Recreates are left out once it is set.
- [ ] **Integration** text and filters combine, and only `public` Patterns come back.

## Pattern detail

- [ ] **Integration** the detail page of a `private` or `in_review` Pattern opens only for its author.
- [ ] **Integration** a guest's request for the Pattern returns steps 1 to 3 only, so step 4 onward never reaches the page.
- [ ] **E2E** a guest hits the login wall at step 4, logs in, opens the same Pattern again, and sees every step.

Step checklist:

- [ ] **Integration** check and uncheck; reset clears every check the user has on that Pattern, and leaves other Patterns and other users' checks alone.
- [ ] **Integration** one check per step, even when two requests arrive at once.
- [ ] **Integration** a check belongs to the step, not its position: reordering steps keeps it, deleting the step deletes it; a check on a step that belongs to another Pattern is refused.
- [ ] **Integration** the author cannot check steps on their own Pattern, nobody can check steps on a Pattern they cannot open, and a guest cannot check anything.

Row and Stitch counters:

- [ ] **Integration** increment, decrement and reset to 0 change only that user's counter on that Pattern, and decrementing a counter at 0 is refused and leaves it at 0; there is one counter row per user per Pattern, even when two requests arrive at once, and another Pattern shows its own counters.
- [ ] **Integration** the author can use the counters on their own `private` Pattern, nobody can use them on a Pattern they cannot open, and a guest cannot write a counter.

Recreates:

- [ ] **Unit** rating is a whole number from 1 to 5 (1 and 5 pass; 0, 6 and 2.5 do not), 1 to 3 images (1 and 3 pass; 0 and 4 do not), caption required (an empty one does not pass).
- [ ] **Integration** the server refuses a Recreate that breaks those rules (for example rating 6, or 4 images) and writes nothing.
- [ ] **Integration** one Recreate per user per Pattern, even when two requests arrive at once, and a new one is allowed after the old one is deleted.
- [ ] **Integration** the author cannot post a Recreate on their own Pattern, nobody can post one on a Pattern that is not `public`, and a guest cannot post at all.
- [ ] **Integration** a member who did not post a Recreate cannot delete it.
- [ ] **Integration** posting and deleting a Recreate moves the Pattern's average rating and Recreate count.
- [ ] **Integration** deleting a Recreate, by its poster or through a takedown, deletes its images from Vercel Blob.
- [ ] **E2E** a user posts a Recreate on a Pattern and finds it on the Pattern right away, with no admin verification, and in My reviews; after they delete it, it is gone from both.

Reports:

- [ ] **Unit** the reason comes from the list, and a note is required when the reason is Other: Other with a note passes, Other with an empty note does not, and Spam with no note passes.
- [ ] **Integration** the server refuses a Report that breaks those rules (for example Other with no note) and writes nothing.
- [ ] **Integration** one Report per user per target, even when two requests arrive at once, and a guest cannot report.

## Create and Edit Pattern

- [ ] **Unit** a draft needs title, description, 1 to 5 images, a category from the list, 1 to 25 tags, one of the four difficulties, 1 to 50 steps, a description on every step, and 0 to 3 images per step. Each count is checked at both ends: 1 and 5 images pass, 0 and 6 do not; 1 and 25 tags pass, 0 and 26 do not; 1 and 50 steps pass, 0 and 51 do not; 0 and 3 images on a step pass, 4 does not.
- [ ] **Integration** the server refuses a draft that breaks those rules (for example 26 tags, 6 images, or a step with no description) and writes nothing.
- [ ] **Integration** tags are saved lowercase, so a tag typed as "Bunny" is saved as the existing tag "bunny".
- [ ] **Integration** every upload (Pattern, step, Recreate, profile picture) asks Vercel Blob for a token that allows images of at most 10 MB.
- [ ] **Integration** a saved Pattern is `private`, and its author is the logged-in user whatever the request says.
- [ ] **Integration** a guest cannot save a Pattern.
- [ ] **Integration** `updated_at` changes only when the author saves an edit, not on submit, approval, rejection or takedown.
- [ ] **Integration** only the author can edit, and only while the Pattern is `private`; an edit to `in_review` or `public` is refused on the server.
- [ ] **Integration** an image removed or replaced while editing is deleted from Vercel Blob.
- [ ] **E2E** the author fills every field and saves, then finds the Pattern in My patterns as `private`.

## My patterns

- [ ] **Integration** lists the author's own Patterns in every status, and nobody else's.
- [ ] **Integration** a guest and the admin cannot load My patterns.
- [ ] **Integration** submitting moves a Pattern from `private` to `in_review` and clears `admin_reason`; only its author can submit it, and only while it is `private`.
- [ ] **Integration** delete is allowed while `private` or `in_review`, refused while `public`, and only for the author.
- [ ] **Integration** deleting a Pattern deletes its Recreates, everyone's step checks and counters on it, and its images and its Recreates' images in Vercel Blob.

## My reviews

- [ ] **Integration** lists only the user's own Recreates, including those on Patterns that were taken down, each marked by whether its Pattern is still `public`.
- [ ] **Integration** a guest and the admin cannot load My reviews.

## Settings

- [ ] **Integration** an update that sends `role` does not change it, so nobody becomes `admin` from Settings.
- [ ] **Integration** replacing the profile picture deletes the old image from Vercel Blob.
- [ ] **Integration** a guest and the admin cannot update a profile through Settings.
- [ ] **E2E** the user changes name, bio and profile picture, and the change shows on their public profile.
- [ ] **E2E** the user changes password, logs out, and logs in with the new one.

## Public profile

- [ ] **Integration** lists only `public` Patterns, and only Recreates on Patterns that are `public`.
- [ ] **Integration** a guest cannot load a profile, even by its URL.
- [ ] **E2E** a logged-in user clicks the author's name on a Pattern and lands on that author's profile.

## Admin area

Verification queue:

- [ ] **Integration** approving moves `in_review` to `public` and sets `published_at`; a later re-approval after a takedown keeps the first `published_at`.
- [ ] **Integration** rejecting needs a reason and moves the Pattern back to `private`.
- [ ] **Integration** approving or rejecting is refused for a Pattern that is not `in_review`.
- [ ] **Integration** a member or a guest cannot approve or reject.
- [ ] **E2E** a member submits a Pattern, the admin logs in, lands in the admin area and approves it, and it shows on search; another is rejected, and its author sees it `private` with the reason in My patterns.

Report queue:

- [ ] **Integration** taking down a Pattern needs a reason and moves it from `public` to `private`; its Recreates stop counting toward rating and count, and the Pattern's author still sees them on the Pattern.
- [ ] **Integration** taking down a Pattern that is not `public` is refused.
- [ ] **Integration** approving that Pattern again brings its Recreates back into the rating and count.
- [ ] **Integration** taking down a Recreate deletes it.
- [ ] **Integration** a takedown deletes every Report on the same target, and dismissing a Report deletes it without a takedown.
- [ ] **Integration** when a target is deleted before the admin acts (a poster deletes their Recreate, or an author deletes their Pattern, which also deletes its Recreates), every Report on each deleted target is deleted.
- [ ] **Integration** a member or a guest cannot take anything down or dismiss a Report.
- [ ] **E2E** a member reports a Pattern, the report shows in the admin's report queue, the admin takes it down, and the Pattern is gone from search.
- [ ] **E2E** a member reports a Recreate, the report shows in the admin's report queue, the admin takes it down, and the Recreate is gone from the Pattern.

Admin access:

- [ ] **Integration** a member or a guest cannot load the verification queue or the report queue.
- [ ] **Integration** the admin account cannot use member actions: no Pattern, Recreate, Report, step check or counter is written for it.
- [ ] **E2E** the admin area's Logout ends the session, and the admin area no longer opens afterwards.

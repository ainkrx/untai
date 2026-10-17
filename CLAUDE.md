@AGENTS.md

# Project rules

## Writing

Applies to every piece of text in this project: docs, md files, code comments, commits, PRs, UI copy, error messages, seed data, and chat replies.

- **No em dash (—).** Use a comma, period, colon, or parentheses, or split the sentence. Also no en dash (–) in place of an em dash, no arrow (→) mid-sentence, and no decorative curly quotes. Write the plain word: "so", "then", "to".
- **No hard wrapping.** One paragraph is one line. A new line only starts a paragraph, list item, heading, or code block.
- **Write like a person.** Ordinary sentences, everyday words, a clear subject and verb. Not brochure copy, not a consultant's report, not an over-friendly assistant.
- **No filler.** Length is fine when the content needs it. Cut any sentence the reader would not miss:
  - openers and sign-offs ("Great question", "Hope this helps")
  - padding phrases ("it's worth noting that", "basically", "overall")
  - summaries that repeat what was just said
  - intensifiers that change nothing ("absolutely critical", "robust and flexible")

## Commits

- **Title:** `type: short description`. Type is `feat`, `fix`, `docs`, `refactor`, `chore`, or whatever the change actually is. Example: `feat: register page sends a verification code`.
- **Body:** optional. Says what changed and nothing else, no filler. It can be paragraphs or a table when asked for.
- **No attribution** in commits or PRs: no `Co-Authored-By`, no "Generated with", no links, no mention of anything.

## Change notes per page

- Every change goes in the md file of the page it touches: one file per page in `docs/pages/` (e.g. `docs/pages/register.md`). Create it if it does not exist.
- When a note changes, keep the old note and add an update block under it:

  ```md
  > **Update 2026-10-03:** password field now requires at least 8 characters.
  ```

- Notes and update blocks are one short line saying what changed. No explanation, no background.
- Update blocks apply only to md files for pages and features. `docs/progress.md` and `docs/style.md` do not use them.

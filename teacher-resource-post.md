# Formula Defense — Open-Source Game Engine for Any Subject's Exam Review

I built a tower defense game to help my AP Stats students review formulas before the exam. Enemies are formulas — students answer questions to destroy them. Wrong answers decompose formulas into their prerequisite concepts, all the way down to foundational skills.

**The engine is subject-agnostic.** The AP Stats content is a "cartridge" — a single JavaScript file. You can write your own cartridge for any subject that has formulas, vocabulary, or concepts to drill: AP Calc, Chemistry, Physics, Algebra 2, Geometry, a foreign language — anything.

**Live demo (AP Statistics):** <https://tmux-trainer.vercel.app>

## What the engine gives you for free

- 3D tower defense gameplay (works on phones, tablets, Chromebooks, desktops)
- 5 question types (identify, fill-blank, variable roles, application scenarios, relationships)
- Spaced repetition + Bayesian knowledge tracing per student
- Wrong-answer prerequisite decomposition (formulas fracture into building blocks)
- Optional cloud sync + class leaderboard
- Music editor, high-contrast mode, offline support
- No accounts required — works instantly from a URL

## What you provide

One JavaScript file defining your deck — the formulas, questions, answer choices, and prerequisite tree for your subject.

## Getting started

1. **Fork the GitHub repo** — [github.com/robjohncolson/tmux-trainer](https://github.com/robjohncolson/tmux-trainer)
2. **Read the Cartridge Authoring Guide** (attached: `cartridge-authoring-guide.md`)
3. **Copy the template** (attached: `dummy-cartridge.js`) as your starting point
4. **Fill in your subject's formulas and questions**
5. **Validate your work** — run `node validate-cartridge.js your-cartridge.js` (attached: `validate-cartridge.js`)
6. **Deploy for free** to [Vercel](https://vercel.com) or [GitHub Pages](https://pages.github.com) — your students get a link, that's it

## Using AI to help write your cartridge

The authoring guide is written to be AI-friendly. You can paste it into ChatGPT, Claude, or Gemini along with your curriculum standards and ask it to draft a cartridge for your subject. Then run the validator and refine. The AI does the heavy lifting; the validator catches the mistakes.

## Attachments

| File | What it is |
|------|-----------|
| `cartridge-authoring-guide.md` | Complete reference for writing a cartridge — metadata, command schema, question types, prerequisite DAG, validation checklist |
| `dummy-cartridge.js` | Minimal working template (2 commands) — copy and expand |
| `validate-cartridge.js` | Node.js script that checks your cartridge against all 12 rules from the guide |

## Questions?

The repo README and authoring guide cover everything. If you get stuck, open an issue on GitHub or reach out directly.

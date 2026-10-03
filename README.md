# Factory Demo: a three-agent software factory in BAND Desktop

A small project built by three AI agents working in one [BAND Desktop](https://docs.band.ai/band-desktop) room: a Planner, an Engineer and a
Reviewer. The humans wrote the spec and the three mandate files. The agents wrote everything else.

This is the companion repo for the lablab.ai tutorial **Build a Reviewer-Gated Software Factory in BAND Desktop (AI Hackathon Guide)**.
Add the tutorial link here once it is published.

It was built for the [WeAreDevelopers x BAND Dark Factory hackathon](https://lablab.ai/ai-hackathons/wearedevelopers-hackathon) as a practice target
for the factory pattern: spec, plan, build, independent review.

## What the factory built

**Focus Board**, a tiny kanban board with no build step:
- Three columns: To do, Doing, Done
- Add, move and delete cards
- A work-in-progress limit of 3 in Doing, with the error shown on the page
- The board and the light or dark theme survive a refresh
- Keyboard friendly, and the columns stack under 640px

## Run it

You need Node 18 or newer.

```bash
git clone https://github.com/vicdevman/factory-demo.git
cd factory-demo
node --test
```

The suite has 28 tests, all of which should pass. Then open `index.html` in a browser (double-click it, or use a static server such as VS Code Live Server).

## The seats

| Seat | Template | Runtime | Owns |
|---|---|---|---|
| Planner | Planner | Claude Code | `PLAN.md` |
| Engineer | Implementer | Claude Code | `index.html`, `style.css`, `board.js`, `app.js`, `board.test.js`, `HANDOFF.md` |
| Reviewer | Reviewer | OpenCode | `REVIEW.md` |

All three agents use this folder as their working directory. Each was created in BAND Desktop from a template, and the template's own role text was left in place.

## What is in the repo

| Path | Written by | What it is |
|---|---|---|
| `SPEC.md` | human | What to build, with six numbered acceptance criteria |
| `prompts/planner.md`, `engineer.md`, `reviewer.md` | human | One mandate per seat: what it owns, what it must not touch, how it hands off |
| `prompts/ROOM-STARTER.md` | human | The exact kickoff message posted in the room |
| `PLAN.md` | Planner | Seven tasks with one owner each, the risks and the decisions it made on gaps in the spec |
| `index.html`, `style.css`, `app.js`, `board.js`, `board.test.js` | Engineer | The app and its tests |
| `HANDOFF.md` | Engineer | Files changed, commands run, real output, and evidence for each criterion |
| `REVIEW.md` | Reviewer | The independent verdict, `APPROVED`, with the evidence it reproduced itself |

## How to run the factory yourself

1. Create three agents in BAND Desktop from the Planner, Implementer and Reviewer templates. Set each agent's working directory to your clone of this repo, and keep the template role text as it is.
2. Put the Reviewer on a different runtime from the Engineer if you can.
3. Create a room and add the three agents.
4. Paste the contents of `prompts/ROOM-STARTER.md` into the room, starting with an `@Planner` mention.
5. Watch the handoff: `PLAN.md`, then `HANDOFF.md`, then `REVIEW.md`.

To start from scratch, delete everything except `SPEC.md` and `prompts/`, commit, and run it again. To see the Reviewer block something, add a
seventh criterion to `SPEC.md` that the Engineer would not build unprompted.

## Notes
- `board.js` has no browser references, so Node can test it. The same file also loads in the browser through a plain script tag.
- The theme is stored under its own key, `focusboard.theme`, so it does not touch the board data in `focusboard.v1`.

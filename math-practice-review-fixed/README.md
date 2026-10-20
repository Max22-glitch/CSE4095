# Math Practice App — reconstructed implementation

A working React + TypeScript + Vite math practice application built from the supplied Cursor transcript and quiz descriptions. This is an independent reconstruction, **not** the original author's repository or a guaranteed exact implementation of all 89 tasks.

## Run

```sh
npm install
npm run dev
```

## Included

- Kid-friendly home page, setup and four difficulty levels
- Addition, subtraction, multiplication and exact whole-number division
- Four distinct multiple-choice answers; keyboard shortcuts 1–4
- Flashcard reveal followed by student self-report
- 5, 10, 20 and continuous practice sessions
- Session summary, statistics, recent answers, and localStorage persistence
- Mistake patterns and review with configurable mastery threshold (default 3)
- Settings and clear-progress confirmation

## Differences and limitations

- The uploaded 246-page transcript describes many implementation steps but is not a source-code archive. The original specification.md and TODO.md were not separately supplied.
- This project is a functional reconstruction, not a line-by-line recreation or proof that all 22 phases and 89 tasks are implemented.
- Review mode generates similar practice and tracks mastery; its matching is simplified compared with a production spaced-practice system.
- Sound effects, card animation, and explanation preferences are saved, but their advanced behaviors are not implemented.
- No account, backend, or cloud synchronization is included.

## GitHub

Do not commit `node_modules/` or `dist/`. Keep the project files together and commit this directory into your chosen repository.

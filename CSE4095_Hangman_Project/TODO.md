# CSE 4095 Hangman — Reduced TODO

The original specification describes a larger system. This assignment only requires the game engine, Flask REST API, browser client, testing, and deployment.

## Phase 1 — Engine and words
- [x] Add `game.py` and safe game-state responses
- [x] Add three word lists and random word selection
- [x] Implement difficulty levels, guesses, win/loss, and validation
- [ ] Student: review game logic and run tests

## Phase 2 — REST API
- [x] Add Flask server and three required endpoints
- [x] Return JSON and correct HTTP error codes
- [x] Keep secret word on server until game ends
- [ ] Student: test API requests in browser Developer Tools

## Phase 3 — Browser client
- [x] Add HTML, CSS, JavaScript
- [x] Add difficulty selector, new game, letter buttons, keyboard input
- [x] Add hangman drawing and win/loss messaging
- [ ] Student: play and verify several games

## Phase 4 — Testing
- [x] Add automated game-engine and API tests
- [ ] Student: run tests locally and record results
- [ ] Student: manually verify correct, incorrect, repeated and invalid guesses, win/loss and restart

## Phase 5 — Deployment and submission
- [x] Add README, requirements, Procfile, and .gitignore
- [ ] Student: push to own GitHub repository
- [ ] Student: deploy to Render and test public HTTPS URL
- [ ] Student: write 1–2 page PDF report based on real work and 2–3 prompts
- [ ] Student: record 2–3 minute demonstration with DevTools JSON response

## Out of scope
Terminal client, automated bots, evaluation, scoring, leaderboard, and replay.

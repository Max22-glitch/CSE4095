# CSE 4095 — Web-Based Hangman

A Flask-backed Hangman game with a browser interface, three difficulty levels, and a REST API. Built as an individual assignment starter implementation. **Review, test, and document your own development work before submitting.**

## Requirements
Python 3.10+ and pip.

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
```

Visit http://127.0.0.1:5000 in a browser.

## Run tests

```bash
python3 -m unittest discover -s tests -v
```

## API

- `POST /api/games` with JSON `{"difficulty":"easy"}` creates a game (201).
- `GET /api/games/<game_id>` returns game state (200).
- `POST /api/games/<game_id>/guess` with JSON `{"letter":"e"}` guesses a letter (200).
- Bad input returns 400; unknown game IDs return 404.
- The word is not returned until the game is won or lost.

## Deployment on Render

1. Push this folder's contents to a GitHub repository.
2. In Render choose **New > Web Service**, connect your repository.
3. Runtime: Python. Build command: `pip install -r requirements.txt`.
4. Start command: `gunicorn --bind 0.0.0.0:$PORT --workers 1 server:app`.
5. Deploy, open the public URL, and test a complete game.

**Note:** Game state is stored in process memory. It resets if the server restarts, and the single-worker command is important to keep games accessible. Render free instances may spin down when idle.

## Architecture
- `game.py`: independent Hangman game rules and safe state representation.
- `word_manager.py`: random word selection from difficulty lists.
- `server.py`: Flask routes and per-game state.
- `static/`: browser UI (HTML/CSS/JavaScript); JavaScript calls the API via `fetch()`.
- `tests/`: unit and API tests.

## Assignment scope
No terminal client, automated bots, evaluation, or leaderboard. The original `Specification.md` is retained for reference; `TODO.md` is the reduced implementation plan.

## Student verification before submission
Run tests, play games at all difficulties, inspect a guess request/JSON response in Chrome DevTools, and record your own 2–3 minute demonstration. Prepare a 1–2 page report describing your actual AI prompts, tests, fixes, deployment, and reflections.

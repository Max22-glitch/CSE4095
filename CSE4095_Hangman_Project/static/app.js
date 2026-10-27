const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const keyboard = document.querySelector('#keyboard');
const pattern = document.querySelector('#pattern');
const statusEl = document.querySelector('#status');
const remaining = document.querySelector('#remaining');
const incorrect = document.querySelector('#incorrect');
const newGameBtn = document.querySelector('#new-game');
let gameId = null;
let current = null;
let busy = false;

for (const letter of alphabet) {
  const button = document.createElement('button');
  button.textContent = letter;
  button.dataset.letter = letter.toLowerCase();
  button.disabled = true;
  button.addEventListener('click', () => submitGuess(letter.toLowerCase()));
  keyboard.appendChild(button);
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function render(state) {
  current = state;
  pattern.textContent = state.pattern;
  remaining.textContent = state.remaining_guesses;
  incorrect.textContent = state.incorrect_letters.join(', ').toUpperCase() || '—';
  if (state.status === 'won') statusEl.textContent = `You won! The word was ${state.word.toUpperCase()}.`;
  else if (state.status === 'lost') statusEl.textContent = `Game over! The word was ${state.word.toUpperCase()}.`;
  else statusEl.textContent = 'Pick a letter to reveal the word.';
  document.querySelectorAll('.part').forEach((part, index) => {
    part.classList.toggle('visible', index < state.incorrect_letters.length);
  });
  document.querySelectorAll('#keyboard button').forEach(button => {
    button.disabled = busy || state.status !== 'playing' || state.guessed_letters.includes(button.dataset.letter);
  });
}

async function startGame() {
  if (busy) return;
  busy = true;
  newGameBtn.disabled = true;
  statusEl.textContent = 'Starting a new game…';
  try {
    const state = await api('/api/games', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({difficulty: document.querySelector('#difficulty').value})
    });
    gameId = state.game_id;
    render(state);
  } catch (error) { statusEl.textContent = error.message; }
  finally { busy = false; newGameBtn.disabled = false; if (current) render(current); }
}

async function submitGuess(letter) {
  if (busy || !gameId || !current || current.status !== 'playing' || current.guessed_letters.includes(letter)) return;
  busy = true;
  render(current);
  try {
    const state = await api(`/api/games/${encodeURIComponent(gameId)}/guess`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({letter})
    });
    current = state;
  } catch (error) { statusEl.textContent = error.message; }
  finally { busy = false; render(current); }
}
newGameBtn.addEventListener('click', startGame);
document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLElement && ['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)) return;
  if (/^[a-z]$/i.test(event.key)) submitGuess(event.key.toLowerCase());
});
startGame();

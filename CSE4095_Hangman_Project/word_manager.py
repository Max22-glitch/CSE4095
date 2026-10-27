from pathlib import Path
import random

class WordManager:
    def __init__(self, folder=None):
        folder = Path(folder) if folder else Path(__file__).parent / 'words'
        self.words = {}
        for difficulty in ('easy', 'medium', 'hard'):
            lines = (folder / f'{difficulty}.txt').read_text(encoding='utf8').splitlines()
            words = sorted({w.strip().lower() for w in lines if w.strip().isascii() and w.strip().isalpha()})
            if not words:
                raise ValueError(f'No valid words for {difficulty}')
            self.words[difficulty] = words

    def random_word(self, difficulty):
        if not isinstance(difficulty, str) or difficulty not in self.words:
            raise ValueError('Difficulty must be easy, medium, or hard')
        return random.choice(self.words[difficulty])

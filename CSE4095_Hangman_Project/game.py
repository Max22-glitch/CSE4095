class InvalidGuessError(ValueError):
    pass

class HangmanGame:
    def __init__(self, word, max_incorrect_guesses=6):
        if not isinstance(word, str) or not word.isascii() or not word.isalpha():
            raise ValueError("Word must contain letters only")
        self.word = word.lower()
        self.max_incorrect_guesses = max_incorrect_guesses
        self.guessed_letters = set()
        self.incorrect_letters = set()

    @property
    def status(self):
        if all(letter in self.guessed_letters for letter in self.word):
            return 'won'
        if len(self.incorrect_letters) >= self.max_incorrect_guesses:
            return 'lost'
        return 'playing'

    def guess(self, letter):
        if self.status != 'playing':
            raise InvalidGuessError('This game has ended')
        if not isinstance(letter, str) or len(letter) != 1 or not letter.isascii() or not letter.isalpha():
            raise InvalidGuessError('Enter exactly one letter A-Z')
        letter = letter.lower()
        if letter in self.guessed_letters:
            raise InvalidGuessError('You already guessed that letter')
        self.guessed_letters.add(letter)
        if letter not in self.word:
            self.incorrect_letters.add(letter)
        return self.to_state()

    def to_state(self):
        result = {
            'pattern': ' '.join(c if c in self.guessed_letters else '_' for c in self.word),
            'guessed_letters': sorted(self.guessed_letters),
            'incorrect_letters': sorted(self.incorrect_letters),
            'remaining_guesses': self.max_incorrect_guesses - len(self.incorrect_letters),
            'status': self.status,
        }
        if self.status != 'playing':
            result['word'] = self.word
        return result

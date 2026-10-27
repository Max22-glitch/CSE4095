import unittest
from game import HangmanGame, InvalidGuessError
from server import app, games

class GameTests(unittest.TestCase):
    def test_correct_and_incorrect(self):
        game = HangmanGame('apple')
        self.assertNotIn('word', game.to_state())
        self.assertEqual(game.guess('p')['pattern'], '_ p p _ _')
        self.assertEqual(game.guess('z')['remaining_guesses'], 5)
        with self.assertRaises(InvalidGuessError): game.guess('p')
        with self.assertRaises(InvalidGuessError): game.guess('12')

    def test_win(self):
        game = HangmanGame('cat')
        for letter in 'cat': game.guess(letter)
        self.assertEqual(game.to_state()['status'], 'won')
        self.assertEqual(game.to_state()['word'], 'cat')
        with self.assertRaises(InvalidGuessError): game.guess('z')

    def test_loss(self):
        game = HangmanGame('cat')
        for letter in 'defghi': game.guess(letter)
        self.assertEqual(game.to_state()['status'], 'lost')
        self.assertEqual(game.to_state()['word'], 'cat')

class ApiTests(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        games.clear()

    def test_create_get_guess(self):
        for difficulty in ('easy', 'medium', 'hard'):
            r = self.client.post('/api/games', json={'difficulty':difficulty})
            self.assertEqual(r.status_code, 201)
            state = r.get_json()
            self.assertNotIn('word', state)
            game_id = state['game_id']
            self.assertEqual(self.client.get(f'/api/games/{game_id}').status_code, 200)
            r = self.client.post(f'/api/games/{game_id}/guess', json={'letter':'e'})
            self.assertEqual(r.status_code, 200)
            self.assertNotIn('word', r.get_json()) if r.get_json()['status']=='playing' else None

    def test_invalid_requests(self):
        self.assertEqual(self.client.post('/api/games', json={'difficulty':'impossible'}).status_code, 400)
        self.assertEqual(self.client.get('/api/games/notreal').status_code, 404)
        r = self.client.post('/api/games', json={'difficulty':'easy'})
        game_id = r.get_json()['game_id']
        self.assertEqual(self.client.post(f'/api/games/{game_id}/guess', json={'letter':'ab'}).status_code, 400)
        self.assertEqual(self.client.post(f'/api/games/{game_id}/guess', data='broken').status_code, 400)

if __name__ == '__main__': unittest.main()

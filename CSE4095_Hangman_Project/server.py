import os
import uuid
from flask import Flask, jsonify, request, send_from_directory
from game import HangmanGame, InvalidGuessError
from word_manager import WordManager

app = Flask(__name__, static_folder='static')
manager = WordManager()
games = {}

@app.get('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.post('/api/games')
def create_game():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or data.get('difficulty') not in ('easy', 'medium', 'hard'):
        return jsonify(error='Provide a valid difficulty: easy, medium, hard'), 400
    game_id = uuid.uuid4().hex
    games[game_id] = HangmanGame(manager.random_word(data['difficulty']))
    return jsonify(game_id=game_id, **games[game_id].to_state()), 201

@app.get('/api/games/<game_id>')
def get_game(game_id):
    game = games.get(game_id)
    if game is None:
        return jsonify(error='Unknown game'), 404
    return jsonify(game_id=game_id, **game.to_state())

@app.post('/api/games/<game_id>/guess')
def guess(game_id):
    game = games.get(game_id)
    if game is None:
        return jsonify(error='Unknown game'), 404
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error='Expected JSON object with letter'), 400
    try:
        game.guess(data.get('letter'))
    except InvalidGuessError as exc:
        return jsonify(error=str(exc)), 400
    return jsonify(game_id=game_id, **game.to_state())

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=int(os.environ.get('PORT', 5000)), debug=False)

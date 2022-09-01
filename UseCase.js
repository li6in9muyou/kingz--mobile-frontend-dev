import { GameState } from "./GameState.js";
import { Emitter } from "./common.js";

export const OnlineUseCase = new (class {
  _currentPlayer;

  get currentPlayer() {
    return this._currentPlayer;
  }

  async request_match() {
    new Promise((resolve) => setTimeout(resolve, 700));
  }
  async register(nickname) {
    this._currentPlayer = nickname;
    return new Promise((resolve) => setTimeout(resolve, 1700));
  }
  sendMove(cmd) {}
})();

export const PlayHistoryUseCase = new (class {
  game_saves = [];

  hasSavedGame() {
    return true;
  }

  loadSavedGame() {
    return {
      nickname: "刘荣曦",
      feedback: "bigger",
      lastAttempt: 50,
      attempts: 2,
    };
  }
})();

class _PlayUseCase extends Emitter(Object) {
  submit_command(cmd) {
    GameState.makeMove(cmd);
    OnlineUseCase.sendMove(cmd);
  }

  start_game() {
    GameState.start();
  }

  load_game() {
    GameState.start(PlayHistoryUseCase.loadSavedGame());
  }

  boot() {
    if (PlayHistoryUseCase.hasSavedGame()) {
      this.emit("GameSaveFound", PlayHistoryUseCase.loadSavedGame());
    }
  }

  start_new_game(nickname) {
    OnlineUseCase.register(nickname).then(() => this.start_game());
  }
}

export const PlayUseCase = new _PlayUseCase();

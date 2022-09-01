import { GameState } from "./GameState.js";
import { Emitter } from "./common.js";
import { HttpClient } from "./Infrastructure.js";

export const OnlineUseCase = new (class extends Emitter(Object) {
  _currentPlayer;

  get currentPlayer() {
    return this._currentPlayer;
  }

  constructor() {
    super();
    HttpClient.subscribe("ReceiveOpponentMove", this.onReceiveOpponentMove);
  }

  async request_match() {
    HttpClient.do_fetch();
  }
  async register(nickname) {
    HttpClient.do_fetch(1700, { nickname });
  }
  sendMove(cmd) {
    HttpClient.do_fetch(700, { cmd });
  }
  onReceiveOpponentMove(cmd) {
    GameState.opponentMakeMove(cmd);
  }
})();

export const PlayHistoryUseCase = new (class {
  game_saves = [];

  hasSavedGame() {
    return true;
  }

  loadSavedGame() {
    return {
      nickname: "刘荣曦",
      request: ["r", "s", "r"],
      response: ["p", "s", "s"],
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

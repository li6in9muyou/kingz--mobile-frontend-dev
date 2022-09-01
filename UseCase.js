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
    await HttpClient.do_fetch();
  }
  async register(nickname) {
    await HttpClient.do_fetch(1700, { nickname });
    this._currentPlayer = nickname;
  }
  async sendMove(cmd) {
    await HttpClient.do_fetch(700, { cmd });
  }
  onReceiveOpponentMove(cmd) {
    PlayUseCase.opponent_command(cmd);
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
      state: {
        request: ["r", "s", "r"],
        response: ["p", "s", "s"],
        maxRounds: 5,
      },
    };
  }
})();

class _PlayUseCase extends Emitter(Object) {
  get game_state() {
    return { nickname: OnlineUseCase.currentPlayer, state: GameState.state };
  }

  submit_command(cmd) {
    GameState.makeMove(cmd);
    this.emit("GameUpdate", this.game_state);
    this.post_command();
    OnlineUseCase.sendMove(cmd);
  }

  opponent_command(cmd) {
    GameState.opponentMakeMove(cmd);
    this.emit("GameUpdate", this.game_state);
    this.post_command();
  }

  post_command() {
    const { shouldTerminate, reason } = GameState.shouldTerminate();
    if (shouldTerminate) {
      this.emit("GameTerminate", { reason });
    }
  }

  load_game() {
    const { nickname, state } = PlayHistoryUseCase.loadSavedGame();
    OnlineUseCase.register(nickname).then(() => {
      GameState.start(state);
      this.emit("GameStart", this.game_state);
    });
  }

  boot() {
    if (PlayHistoryUseCase.hasSavedGame()) {
      this.emit("GameSaveFound", PlayHistoryUseCase.loadSavedGame());
    }
  }

  start_new_game(nickname) {
    OnlineUseCase.register(nickname).then(() => {
      GameState.start();
      this.emit("GameStart", this.game_state);
    });
  }
}

export const PlayUseCase = new _PlayUseCase();

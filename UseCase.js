import { GameState } from "./GameState.js";
import { Emitter } from "./common.js";
import { HttpClient } from "./Infrastructure.js";
import "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js";

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
  game_saves;

  constructor() {
    this.game_saves = JSON.parse(localStorage.getItem("SRP_saves")) ?? [];
  }

  hasSavedGame() {
    return _.countBy(this.game_saves, "type")["used"] > 0;
  }

  writeSave(which, state) {
    if (0 <= which && which <= 2) {
      this.game_saves[which] = { ...state, type: "used" };
      localStorage.setItem("SRP_saves", JSON.stringify(this.game_saves));
    }
  }

  readSave(which) {
    this.game_saves = JSON.parse(localStorage.getItem("SRP_saves")) ?? [];
    return {
      ...(this.game_saves[which] ?? {
        type: "empty",
        nickname: "",
        game_state: {},
      }),
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

  load_game(which) {
    const { type, nickname, state } = PlayHistoryUseCase.readSave(which);
    if (type !== "empty") {
      OnlineUseCase.register(nickname).then(() => {
        GameState.start(state);
        this.emit("GameStart", this.game_state);
      });
    } else {
      this.emit("GameCreate");
    }
  }

  boot() {
    if (PlayHistoryUseCase.hasSavedGame()) {
      this.emit("SystemNotification", {
        level: "info",
        msg: "Game saves are found.",
      });
      this.select_save_slot("Game saves are found", this.load_game);
    } else {
      this.emit("GameCreate");
    }
  }

  start_new_game(nickname) {
    OnlineUseCase.register(nickname).then(() => {
      GameState.start();
      this.emit("GameStart", this.game_state);
    });
  }

  select_save_slot(intent, next) {
    this.emit("SaveSlotSelect", {
      slots: [
        PlayHistoryUseCase.readSave(0),
        PlayHistoryUseCase.readSave(1),
        PlayHistoryUseCase.readSave(2),
      ],
      next: (w) => next.call(this, w),
      intent,
    });
  }

  save(which) {
    PlayHistoryUseCase.writeSave(which, this.game_state);
    this.emit("SystemNotification", { level: "info", msg: "game is saved" });
    this.emit("GameCreate");
  }
}

export const PlayUseCase = new _PlayUseCase();

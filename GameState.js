import { Emitter } from "./common.js";
import "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js";

const GAME_CONFIG = {
  maxRounds: 5,
};
const MOVES = {
  Scissor: "s",
  Rock: "r",
  Paper: "p",
};
const ROUND_RESULT = {
  Tie: "tie",
  Lose: "lose",
  Win: "win",
};
class __GameState extends Emitter(Object) {
  __state = {
    request: [],
    response: [],
    results: [],
    maxRounds: GAME_CONFIG.maxRounds,
  };

  start(save) {
    if (save) {
      this.__state = { ...this.__state, ...save };
    }
    this.battle();
    this.emit("GameStart", { ...this.__state });
  }

  makeMove(cmd) {
    this.__state.response.push(cmd.move);
    this.battle();
  }

  opponentMakeMove(cmd) {
    this.__state.request.push(cmd.move);
    this.battle();
  }

  battle() {
    if (this.__state.request.length > this.__state.response.length) {
      return;
    } else if (this.__state.request.length < this.__state.response.length) {
      return;
    }

    const battle = (mine, enemy) => {
      if (mine === enemy) {
        return ROUND_RESULT.Tie;
      } else if (
        (mine === MOVES.Paper && enemy === MOVES.Rock) ||
        (mine === MOVES.Rock && enemy === MOVES.Scissor) ||
        (mine === MOVES.Scissor && enemy === MOVES.Paper)
      ) {
        return ROUND_RESULT.Win;
      } else {
        return ROUND_RESULT.Lose;
      }
    };

    const results = [
      ..._.map(_.zip(this.__state.request, this.__state.response), battle),
    ];

    this.__state = { ...this.__state, results };

    if (results.length === GAME_CONFIG.maxRounds) {
      if (
        _.countBy(results, _.identity)[ROUND_RESULT.Lose] >=
        GAME_CONFIG.maxRounds / 2 - 1
      ) {
        this.emit("GameTerminate", { reason: "lost" });
      } else {
        this.emit("GameTerminate", { reason: "win" });
      }
    }
  }
}

export const GameState = new __GameState();

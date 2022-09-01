import { Emitter } from "./common.js";
import {
  countBy,
  zip,
  identity,
  map,
} from "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js";

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
  __state = { request: [], response: [] };

  start(save) {
    if (save) {
      this.__state = { ...save };
    }
    this.emit("GameStart", { ...this.__state });
  }

  makeMove(cmd) {
    this.__state.response.push(cmd.move);
    const results = [
      ...map(zip(this.__state.request, this.__state.response), (m, e) =>
        this.battle(m, e)
      ),
    ];
    this.emit("GameUpdate", {
      ...this.__state,
      results,
    });
    if (results.length === GAME_CONFIG.maxRounds) {
      if (
        countBy(results, identity)[ROUND_RESULT.Lose] >=
        GAME_CONFIG.maxRounds / 2 - 1
      ) {
        this.emit("GameTerminate", { reason: "lost" });
      } else {
        this.emit("GameTerminate", { reason: "win" });
      }
    }
  }

  battle(mine, enemy) {
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
  }
}

export const GameState = new __GameState();

import { Emitter } from "./common.js";

const GAME_CONFIG = {
  maxAttempts: 6,
  lowerBound: 0,
  upperBound: 100,
};
class __GameState extends Emitter(Object) {
  __secret = 0;
  __state = { attempts: 0, feedback: "" };
  __randint(low, high) {
    return low + Math.floor(Math.random() * (high - low));
  }

  start(save) {
    if (save) {
      switch (save.feedback) {
        case "smaller": {
          this.__secret = this.__randint(0, save.lastAttempt);
          break;
        }
        case "bigger": {
          this.__secret = this.__randint(save.lastAttempt, 100);
          break;
        }
        default: {
        }
      }
      this.__state = { ...save };
    } else {
      this.__secret = 100 * Math.floor(Math.random());
    }
    this.emit("GameStart", { ...this.__state });
  }

  makeMove(cmd) {
    this.__state.attempts += 1;
    if (cmd.guess < this.__secret) {
      this.emit("GameUpdate", { ...this.__state, feedback: "bigger" });
    } else if (cmd.guess > this.__secret) {
      this.emit("GameUpdate", { ...this.__state, feedback: "smaller" });
    } else {
      this.emit("GameTerminate", { ...this.__state, reason: "win" });
    }
    if (this.__state.attempts >= GAME_CONFIG.maxAttempts) {
      this.emit("GameTerminate", { ...this.__state, reason: "lose" });
    }
  }
}

export const GameState = new __GameState();

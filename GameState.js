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
class __GameState {
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
    this._battle();
  }

  #submitMove(where, cmd) {
    if (where.length < GAME_CONFIG.maxRounds) {
      where.push(cmd.move);
      this._battle();
    }
  }

  makeMove(cmd) {
    this.#submitMove(this.__state.response, cmd);
  }

  opponentMakeMove(cmd) {
    this.#submitMove(this.__state.request, cmd);
  }

  _battle() {
    const showHands = (mine, enemy) => {
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
      ..._.filter(
        _.map(_.zip(this.__state.response, this.__state.request), (pair) => {
          const [mine, enemy] = pair;
          return mine && enemy ? showHands(mine, enemy) : null;
        })
      ),
    ];

    this.__state = { ...this.__state, results };
  }

  get state() {
    return { ...this.__state };
  }

  shouldTerminate() {
    const lostCnt = _.countBy(this.__state.results, _.identity)[
      ROUND_RESULT.Lose
    ];
    const lostGame =
      this.__state.results.length === GAME_CONFIG.maxRounds &&
      lostCnt >= GAME_CONFIG.maxRounds / 2 - 1;
    return { shouldTerminate: lostGame, reason: lostGame ? "lost" : "win" };
  }
}

export const GameState = new __GameState();

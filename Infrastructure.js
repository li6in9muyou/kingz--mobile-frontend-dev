import { Emitter } from "./common.js";

export const HttpClient = new (class extends Emitter(Object) {
  do_fetch(wait = 700, data = {}) {
    console.log("HttpClient fetch with data:", data);
    this.emit("StartRequest");
    new Promise((resolve) => setTimeout(resolve, wait));
    this.emit("DoneRequest");
  }
  receive_opponent_move(move) {
    this.emit("ReceiveOpponentMove", move);
  }
})();

window.opp = (arg) => HttpClient.receive_opponent_move.call(HttpClient, arg);

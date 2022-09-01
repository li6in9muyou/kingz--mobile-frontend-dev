export const appDiv = document.getElementById("app");
export const Emitter = (base) =>
  class extends base {
    __subscription = {};

    subscribe(event, callback) {
      if (undefined !== this.__subscription[event]) {
        this.__subscription[event].push(callback);
      } else {
        this.__subscription[event] = [callback];
      }
    }

    emit(event, detail) {
      console.log(`emit: ${event} \nwith: ${JSON.stringify(detail)}`);
      for (const subscriber of this.__subscription[event] ?? [
        (d) =>
          console.log(
            `no subscriber for "${event}", detail:${JSON.stringify(d)}`
          ),
      ]) {
        subscriber.call(subscriber, detail);
      }
    }
  };

const { $Component } = require("boost_library");
const Interface = require("../module/Interface");

$Component({
  key: Interface.EVENT_SERVICE,
  name: "event.service.v1",
  injector: () => {
    const cache = {};

    const subscribe = (event, fn) => {
      const listeners = cache[event];
      const value = {
        fn,
      };
      if (listeners) {
        listeners.push(value);
      } else {
        cache[event] = [value];
      }
    };

    const publish = (event, data) => {
      const listeners = cache[event];
      if (listeners) {
        listeners.forEach((value) => {
          value.fn(data);
        });
      }
    };

    return {
      subscribe,
      publish,
    };
  },
});

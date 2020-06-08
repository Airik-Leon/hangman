const { $Component } = require("boost_library");
const Interface = require("../module/Interface");

$Component({
  key: Interface.VISUAL_STATUS_RENDERER,
  name: "visualstatus.renderer.v1",
  dependencies: [Interface.EVENT_SERVICE, Interface.IO_SERVICE],
  injector: ({ EVENT_SERVICE, IO_SERVICE }) => {
    const render = (data) => {
      const status = `Correct: ${
        data.answer.filter((val) => val.show).length
      }/${data.answer.length}\nMissed: ${data.failedAttempts}/${data.maxFailedAttempts}
        `;
      IO_SERVICE.display(status);
    };

    EVENT_SERVICE.subscribe("refresh", render);
    return {
      render,
    };
  },
});

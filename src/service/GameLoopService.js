const { $Component } = require("boost_library");
const Interface = require("../module/Interface");

$Component({
  key: Interface.GAME_LOOP_SERVICE,
  name: "gameloop.service.v1",
  dependencies: [Interface.EVENT_SERVICE, Interface.IO_SERVICE],
  injector: ({ EVENT_SERVICE, IO_SERVICE }) => {
    let state = null;

    const start = ({ guessCount = 0, answer = "" }) => {
      state = {
        guessCount,
        misses: 0,
        answer: answer.split("").map((val) => ({
          value: val,
          show: false,
        })),
      };

      console.log(state);
    };

    const end = () => {};
    const restart = () => {};
    EVENT_SERVICE.subscribe("startGame", start);
    EVENT_SERVICE.subscribe("endGame", end);
    EVENT_SERVICE.subscribe("restartGame", restart);
  },
});

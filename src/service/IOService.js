const { $Component } = require("boost_library");
const readline = require("readline");
const Interface = require("../module/Interface");

$Component({
  key: Interface.IO_SERVICE,
  name: "io.service.v1",
  injector: () => {
    const reservedKeys = {};
    const inout = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const io = ({ message, listener }) => {
      inout.question(message, (line) => {
        const reservedAction = reservedKeys[line];
        if (reservedAction) {
          reservedAction();
        } else {
          listener(line);
        }
      });
    };

    const display = (message) => {
      console.log(message);
    };

    const setReservedKeyEvents = (reservedKey, fn) => {
      reservedKeys[reservedKey] = fn;
    };

    const repeatQuestionTillConditionMet = (
      message = "",
      evaluateCondition,
      onFailMessage = "",
    ) => {
      return new Promise((resolve) => {
        const repeat = (displayMessage) => {
          io({
            message: displayMessage,
            listener: async (line) => {
              try {
                const isConditionMet = await evaluateCondition(line);
                if (!isConditionMet) {
                  repeat(onFailMessage);
                } else {
                  resolve(line);
                }
              } catch (e) {
                repeat(onFailMessage);
              }
            },
          });
        };
        repeat(message);
      });
    };

    return {
      io,
      display,
      setReservedKeyEvents,
      clear: console.clear,
      repeatQuestionTillConditionMet,
    };
  },
});

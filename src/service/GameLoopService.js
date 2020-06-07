const { $Component } = require("boost_library");
const Interface = require("../module/Interface");

$Component({
  key: Interface.GAME_LOOP_SERVICE,
  name: "gameloop.service.v1",
  dependencies: [
    Interface.EVENT_SERVICE,
    Interface.IO_SERVICE,
    Interface.VISUAL_STATUS_RENDERER,
    Interface.WORD_DISPLAY_RENDERER,
  ],
  injector: ({ EVENT_SERVICE, IO_SERVICE }) => {
    let failedAttempts = 0;
    let formattedAnswer = null;

    const checkForCorrectnessAndUpdate = (line = "") => {
      return new Promise((resolve) => {
        let correctGuess = false;
        
        line.split("").forEach((letter) => {
          formattedAnswer.forEach((val) => {
            if (letter.toLowerCase() === val.value.toLowerCase()) {
              val.show = true;
              correctGuess = true;
            }
          });
        });
        resolve(correctGuess);
      });
    };

    const start = ({ guessCount = 0, answer = "" }) => {
      formattedAnswer = answer.split("").map((val) => ({
        value: val,
        show: false,
      }));

      const repeatIfEndHasNotBeenMet = () => {
        if (
          failedAttempts < guessCount &&
          formattedAnswer.some((value) => !value.show)
        ) {
          EVENT_SERVICE.publish("refresh", {
            answer: formattedAnswer,
            failedAttempts,
            maxAttempts: guessCount,
          });

          IO_SERVICE.io({
            message: "Guess a letter or a word.\n",
            listener: async (line) => {
              const isACorrectGuess = await checkForCorrectnessAndUpdate(line);
              if (!isACorrectGuess) {
                failedAttempts = failedAttempts + 1;
              }
              repeatIfEndHasNotBeenMet();
            },
          });
        } else {
          process.exit(0);
        }
      };

      repeatIfEndHasNotBeenMet();
    };
    EVENT_SERVICE.subscribe("startGame", start);
  },
});

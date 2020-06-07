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

    const getLineChecker = (answer) => ({
      checkForCorrectnessAndUpdate: (line = "") => {
        return new Promise((resolve) => {
          let correctGuess = false;

          const compare = (value) => {
            value.split("").forEach((letter) => {
              formattedAnswer.forEach((val) => {
                if (letter.toLowerCase() === val.value.toLowerCase()) {
                  val.show = true;
                  correctGuess = true;
                }
              });
            });
            resolve(correctGuess);
          };

          if (line.length > 1) {
            if (!(answer.toLowerCase() === line.trim().toLowerCase())) {
              resolve(correctGuess);
            } else {
              compare(line);
            }
          } else {
            compare(line);
          }
        });
      },
    });

    const start = ({ guessCount = 0, answer = "" }) => {
      const lineChecker = getLineChecker(answer);
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
            maxFailedAttempts: guessCount,
          });

          IO_SERVICE.io({
            message: "Guess a letter or a word.\n",
            listener: async (line) => {
              const isACorrectGuess = await lineChecker.checkForCorrectnessAndUpdate(
                line
              );
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

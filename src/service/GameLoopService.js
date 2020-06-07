const { $Component } = require("boost_library");
const Interface = require("../module/Interface");

const displayGameEndReason = (ioservice) => (
  failedAttempts,
  guesscount,
  formattedAnswers
) => {
  if (failedAttempts >= guesscount) {
    ioservice.display(
      `Player 2 has reached the number of allowed guesses: ${failedAttempts}/${guesscount}`
    );
  }

  if (formattedAnswers.every((answer) => answer.show)) {
    ioservice.display(
      `Congratulations player 2 you have guessed the correct answer: ${formattedAnswers
        .map((v) => v.value)
        .join("")}`
    );
  }
};

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
    const previousIncorrectChoices = [];

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
          IO_SERVICE.clear();
          EVENT_SERVICE.publish("refresh", {
            answer: formattedAnswer,
            failedAttempts,
            maxFailedAttempts: guessCount,
            previousIncorrectChoices,
          });

          IO_SERVICE.io({
            message: "Guess a letter or a word.\n",
            listener: async (line) => {
              const isACorrectGuess = await lineChecker.checkForCorrectnessAndUpdate(
                line
              );
              if (!isACorrectGuess) {
                previousIncorrectChoices.push(line);
                failedAttempts = failedAttempts + 1;
              }
              repeatIfEndHasNotBeenMet();
            },
          });
        } else {
          EVENT_SERVICE.publish("refresh", {
            answer: formattedAnswer,
            failedAttempts,
            maxFailedAttempts: guessCount,
            previousIncorrectChoices,
          });
          displayGameEndReason(IO_SERVICE)(
            failedAttempts,
            guessCount,
            formattedAnswer
          );
          process.exit(0);
        }
      };
      repeatIfEndHasNotBeenMet();
    };
    EVENT_SERVICE.subscribe("startGame", start);
  },
});

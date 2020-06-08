const { $Component } = require("boost_library");
const Interface = require("../module/Interface");

const displayGameEndReason = (ioservice) => (
  failedAttempts,
  guesscount,
  formattedAnswers
) => {
  if (failedAttempts >= guesscount) {
    ioservice.display(
      `Player 2 has reached the number of allowed guesses: ${failedAttempts}/${guesscount}. Sorry you lose.`
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

const ifWordIsMatchUseLetterStrategy = (val, answer, letterStrategy) => {
  const isAMatchingWord = (compare1 = "", compare2 = "") => {
    const isAMatchingWord =
      compare1.trim().toLowerCase() === compare2.trim().toLowerCase();
    if (isAMatchingWord) {
      return letterStrategy();
    }
    return false;
  };

  if (val.length > 1) {
    return isAMatchingWord(val, answer);
  }
  return letterStrategy();
};

const getLineChecker = (answer) => (formattedAnswer) => ({
  checkForCorrectnessAndUpdate: (line = "") => {
    return new Promise((resolve) => {
      const compare = (value) => {
        let correctGuess = false;
        value.split("").forEach((letter) => {
          formattedAnswer.forEach((val) => {
            if (letter.toLowerCase() === val.value.toLowerCase()) {
              val.show = true;
              correctGuess = true;
            }
          });
        });
        return correctGuess;
      };

      resolve(
        ifWordIsMatchUseLetterStrategy(line, answer, () => compare(line))
      );
    });
  },
});

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

    const start = ({ guessCount = 0, answer = "" }) => {
      formattedAnswer = answer.split("").map((val) => ({
        value: val,
        show: false,
      }));
      const lineChecker = getLineChecker(answer)(formattedAnswer);

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

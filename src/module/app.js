const { $Component } = require("boost_library");
const fs = require("fs");
const Interface = require("./Interface");

const exit = (ioservice) => {
  ioservice.display("Thank you for trying! Goodbye.");
  process.exit(0);
};

//TODO: Candidate for externalized Menu component
const showBanner = (ioservice) => {
  ioservice.display(
    new String(fs.readFileSync("./banner.txt"), "utf8").toString()
  );
};

//TODO: Candidate for externalized Menu component
const getWordFromIO = (io) => (dictionaryService) => async (message) => {
  return io.repeatQuestionTillConditionMet(
    message,
    async (line) => {
      return dictionaryService.isValidWord(line);
    },
    "The word you have entered is not a word we recognize. Please try again.\n"
  );
};

const onStartGame = (ioservice) => (eventService) => (dictionaryService) => {
  showBanner(ioservice);
  ioservice.io({
    message: `Would you like to play (Y/n)?\n`,
    listener: async (line = "") => {
      if (line.toLowerCase() === "y") {
        const word = await getWordFromIO(ioservice)(dictionaryService)(
          "Great, Player one would you please select your word.\n"
        );
        eventService.publish("startGame", {
          answer: word,
          guessCount: 6,
        });
      } else {
        exit(ioservice);
      }
    },
  });
};

$Component({
  key: Interface.APPLICATION,
  name: "app.v1",
  dependencies: [
    Interface.GAME_LOOP_SERVICE,
    Interface.EVENT_SERVICE,
    Interface.IO_SERVICE,
    Interface.DICTIONARY_SERVICE,
  ],
  injector: ({ EVENT_SERVICE, DICTIONARY_SERVICE, IO_SERVICE }) => {
    const run = () => {
      onStartGame(IO_SERVICE)(EVENT_SERVICE)(DICTIONARY_SERVICE);
      IO_SERVICE.setReservedKeyEvents(".exit", () => exit(IO_SERVICE));
    };

    return {
      run,
    };
  },
});

const { $Component } = require("boost_library");
const fs = require("fs");
const Interface = require("./Interface");

const exit = (ioservice) => {
  ioservice.display("Thank you for trying! Goodbye.");
  process.exit(0);
};

const showBanner = (ioservice) => {
  ioservice.display(
    new String(fs.readFileSync("./banner.txt"), "utf8").toString()
  );
};

const getGreetingMessage = () => {
  return `Hangman is a 2 player game where the first player chooses a word & number of guesses and the second player must attempt to guess the word before they reach the number of guesses.

  \n - Player one please choose a guess count greater than 0. 
  \n - Player one please choose a word that exist in a common dictionary.
  
  \n - Player 2 may either guess an individual letter or attempt to guess a whole word.
  \n - If Player 2 guesses the whole word then Player 2 wins. 
  \n - If Player 2 guesses a letter then that will reveal all the matching letters for that word. 
  `;
};

const getWordFromIO = (io) => (dictionaryService) => async (message) => {
  return io.repeatQuestionTillConditionMet(
    message,
    async (line) => {
      return dictionaryService.isValidWord(line);
    },
    "The word you have entered is not a word we recognize. Please try again.\n"
  );
};

const getGuessCountFromIO = (io) => {
  return io.repeatQuestionTillConditionMet(
    "How many guesses would you like to allow?\n",
    (line) => {
      return parseInt(line.trim()) > 0 ? true : false;
    },
    `The number of guesses must be greater than 0 (zero). Please enter a number?\n`
  );
};

const onStartGame = (ioservice) => (eventService) => (dictionaryService) => {
  showBanner(ioservice);
  ioservice.io({
    message: `${getGreetingMessage()}\nWould you like to play (Y/n)?\n`,
    listener: async (line = "") => {
      if (line.toLowerCase() === "y") {
        const word = await getWordFromIO(ioservice)(dictionaryService)(
          "Great, Player one would you please select your word.\n"
        );
        const guessCount = await getGuessCountFromIO(ioservice);

        eventService.publish("startGame", {
          answer: word,
          guessCount,
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

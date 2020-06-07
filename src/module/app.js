const { $Component } = require("boost_library");
const fs = require("fs");
const Interface = require("./Interface");

const showBanner = () => {
  console.log(new String(fs.readFileSync("./banner.txt"), "utf8").toString());
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

const getWordFromIO = (ioservice) => (dictionaryService) => (message) => {
  return new Promise((resolve) => {
    const getWordRepeatIfNotValid = (request) => {
      ioservice.io({
        message: request,
        listener: async (line) => {
          const isValid = await dictionaryService.isValidWord(line);
          if (isValid) {
            resolve(line);
          } else {
            getWordRepeatIfNotValid(
              `${line} is not a word we know. Could you please try a different word?\n`
            );
          }
        },
      });
    };

    getWordRepeatIfNotValid(message);
  });
};

const getGuessCountFromIO = (ioservice) => {
  return new Promise((resolve) => {
    const getGuessCountRepeatIfNotValid = (request) => {
      const errorMessage = `The number of guesses must be greater than 0 (zero). Please enter a number?\n`;
      ioservice.io({
        message: request,
        listener: async (line = "0") => {
          try {
            const value = parseInt(line.trim());
            const isValid = value > 0 ? true : false;
            if (isValid) {
              resolve(value);
            } else {
              getGuessCountRepeatIfNotValid(errorMessage);
            }
          } catch (e) {
            getGuessCountRepeatIfNotValid(errorMessage);
          }
        },
      });
    };

    getGuessCountRepeatIfNotValid(
      "How many guesses would you like to allow?\n"
    );
  });
};

const onStartGame = (ioservice) => (eventService) => (dictionaryService) => {
  showBanner();
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
        console.log("Thank you for trying! Goodbye.");
        process.exit(0);
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
  injector: ({
    GAME_LOOP_SERVICE,
    EVENT_SERVICE,
    DICTIONARY_SERVICE,
    IO_SERVICE,
  }) => {
    const run = () => {
      onStartGame(IO_SERVICE)(EVENT_SERVICE)(DICTIONARY_SERVICE);
    };

    return {
      run,
    };
  },
});

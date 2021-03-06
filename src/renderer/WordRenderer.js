const { $Component } = require("boost_library");
const Interface = require("../module/Interface");

$Component({
  key: Interface.WORD_DISPLAY_RENDERER,
  name: "worddisplay.renderer.v1",
  dependencies: [Interface.EVENT_SERVICE, Interface.IO_SERVICE],
  injector: ({ EVENT_SERVICE, IO_SERVICE }) => {
    const render = (
      data = {
        answer: [],
        previousIncorrectChoices: [],
      }
    ) => {
      const word = data.answer
        .map((letter) => {
          if (letter.show) {
            return letter.value;
          }
          return "_";
        })
        .join(" ");
      IO_SERVICE.display(word);
      IO_SERVICE.display(
        `Previous wrong guesses:\n${data.previousIncorrectChoices.join(", ")}\n`
      );
    };

    EVENT_SERVICE.subscribe("refresh", render);

    return {
      render,
    };
  },
});

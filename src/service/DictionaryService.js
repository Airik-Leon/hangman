const { $Component } = require("boost_library");
const wordListPath = require("word-list");
const fs = require("fs");
const Interface = require("../module/Interface");

$Component({
  key: Interface.DICTIONARY_SERVICE,
  name: "dictionary.service.v1",
  injector: () => {
    const words = fs.readFileSync(wordListPath, "utf8").split("\n");

    //TODO: Comeback and swap to a binary search
    const isValidWord = async (value) => {
      return !!words.find((w) => w.toLowerCase() === value);
    };

    return {
      isValidWord,
    };
  },
});

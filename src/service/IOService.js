const { $Component } = require("boost_library");
const readline = require("readline");
const Interface = require("../module/Interface");

$Component({
  key: Interface.IO_SERVICE,
  name: "io.service.v1",
  injector: () => {
    const inout = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal:true,
    });

    const io = ({ message, listener }) => {
      inout.question(message, (line) => {
        listener(line);
      });
    };

    return {
      io,
    };
  },
});

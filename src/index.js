const { $ComponentScan, get } = require("boost_library");
const Interface = require("./module/Interface");

$ComponentScan({
  basePackages: [
    `${__dirname}/service`,
    `${__dirname}/module`,
    `${__dirname}/renderer`,
  ],
}).then(() => {
  get({ key: Interface.APPLICATION }).run();
});

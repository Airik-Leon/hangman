const { $ComponentScan, get } = require("boost_library");
const Interface = require("./module/Interface");

$ComponentScan({
  basePackages: [`${__dirname}/service`, `${__dirname}/module`],
}).then(() => {
  const application = get({ key: Interface.APPLICATION });
  application.run();
});

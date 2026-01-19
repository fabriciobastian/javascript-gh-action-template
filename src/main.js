const chalk = require('chalk');
const { safeExec } = require('./safe-exec');

function myHelpFunction(exampleInput) {
  return `${exampleInput} + my help text`;
}

async function main(exampleInput) {
  const helpText = myHelpFunction(exampleInput);
  await safeExec(`echo ${helpText}`);

  console.log(chalk.green('✅ My action executed successfully'));
}

module.exports = {
  myHelpFunction,
  main
};

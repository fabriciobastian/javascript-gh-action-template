const core = require('@actions/core');
const { main } = require('./main');
(async () => {
  try {
    // Get inputs from GitHub Action
    const exampleInput = core.getInput('example-input') || 'default-value';

    // Call the main function
    await main(exampleInput);
  } catch (error) {
    core.setFailed('Action failed with error: ' + error.message);
  }
})();

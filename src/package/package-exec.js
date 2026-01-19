#!/usr/bin/env node
const { parseArgs } = require('node:util');
const { main } = require('../main');

const args = process.argv;
const options = {
  exampleInput: {
    type: 'string',
    short: 'e',
    default: 'default-value'
  }
};

const { values } = parseArgs({
  args,
  options,
  allowPositionals: false
});

(async () => {
  try {
    // Validate required arguments
    if (!values.exampleInput) {
      console.error('❌ Error: --exampleInput (-e) is required');
      process.exit(1);
    }

    await main(values.exampleInput);

    console.log('\n✅ Process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Process failed with error: ' + error.message);
    process.exit(1);
  }
})();

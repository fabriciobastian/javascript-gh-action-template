const { execSync } = require('child_process');

/**
 * Execute a command with proper error handling and logging
 * @param {string} command - The command to execute
 * @param {string} description - Description of what the command does (optional)
 * @param {object} options - Additional options for execSync
 * @returns {string} The command output
 */
function execCommand(command, description, options = {}) {
  if (description) {
    console.log(`\n→ ${description}`);
    console.log(`Running: ${command}`);
  }

  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: options.cwd || process.cwd(),
      ...options
    });

    if (output.trim() && description) {
      console.log(output);
    }
    return output;
  } catch (error) {
    if (description) {
      console.log(`❌ Error: ${error.message}`);
    }
    // Always throw so callers can decide how to handle errors
    throw error;
  }
}

module.exports = { execCommand };

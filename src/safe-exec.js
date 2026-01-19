const { exec } = require('child_process');

async function safeExec(
  command,
  execOptions = { failOnStdErr: true, verbose: false }
) {
  const { failOnStdErr = true, verbose = false } = execOptions;
  const options = { failOnStdErr, verbose };

  // Set a higher default buffer to accommodate large outputs (e.g., `npm ls --all --json`).
  // Allow overriding via SAFE_EXEC_MAX_BUFFER env var.
  const defaultMaxBuffer =
    Number(process.env.SAFE_EXEC_MAX_BUFFER) || 1024 * 1024 * 200; // 200 MB
  const execOpts = { maxBuffer: defaultMaxBuffer };

  return new Promise((resolve, reject) => {
    options.verbose && console.log(`Running command: ${command}`);
    exec(command, execOpts, (error, stdout, stderr) => {
      if (error) {
        options.verbose && console.error('   - error:', error);
        reject(error);
        return;
      }
      if (stderr && options.failOnStdErr) {
        options.verbose && console.error('   - stderr:', stderr);
        reject(new Error(stderr));
        return;
      }
      resolve(stdout);
    });
  });
}

module.exports = { safeExec };

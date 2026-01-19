#!/usr/bin/env node

/**
 * Script to check if package.json version was updated when built files change
 */

const fs = require('fs');
const { execCommand } = require('./exec-command');

const BASE_RANGE = 'origin/main...HEAD';
const BUILT_FILES = ['dist/index.js', 'dist-package/index.js'];
const PACKAGE_JSON = 'package.json';

function checkVersionBump() {
  console.log('🔍 Checking if version bump is required...');

  // Check if any built files have changed compared to the base branch
  try {
    // Use git diff without --quiet to get the actual diff, then check if it's empty
    const diffOutput = execCommand(
      `git diff ${BASE_RANGE} ${BUILT_FILES.join(' ')}`,
      'Checking if built files have changed'
    );

    if (diffOutput.trim() === '') {
      console.log('✅ No changes to built files, version check skipped');
      return;
    } else {
      console.log(
        '📝 Built files have changes, continuing with version check...'
      );
    }
  } catch (error) {
    // If there's an actual error (not just differences), log it
    console.log('❌ Error checking for built file changes:', error.message);
    process.exit(1);
  }

  console.log(
    `🔍 Built files have changed, checking if ${PACKAGE_JSON} version was updated...`
  );

  // Check if package.json has changes compared to the base branch
  let packageJsonDiff = '';
  try {
    packageJsonDiff = execCommand(
      `git diff ${BASE_RANGE} ${PACKAGE_JSON}`,
      `Checking if ${PACKAGE_JSON} has changes`
    );

    if (packageJsonDiff.trim() === '') {
      console.log(
        `❌ Built files changed but ${PACKAGE_JSON} version was not updated`
      );
      console.log(
        `Please update the version in ${PACKAGE_JSON} when built files change`
      );
      console.log('');
      console.log('Changed files:');
      const changedFiles = execCommand(
        `git diff --name-only ${BASE_RANGE} ${BUILT_FILES.join(' ')}`,
        `Checking if built ${BUILT_FILES.join(' ')} have changed`
      );
      console.log(changedFiles);
      console.log('');
      console.log(
        `To fix this, update the version in ${PACKAGE_JSON} and commit`
      );
      process.exit(1);
    } else {
      console.log(
        `📝 ${PACKAGE_JSON} has changes, continuing with version check...`
      );
    }
  } catch (error) {
    // If there's an actual error, log it
    console.log('❌ Error checking package.json changes:', error.message);
    process.exit(1);
  }

  console.log(
    `✅ ${PACKAGE_JSON} has changes, checking if version was updated...`
  );

  // Get the current version from package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const currentVersion = packageJson.version;

  // Check if the version change is in the diff
  try {
    // Look for version field changes more precisely
    // Check for lines that show version field changes (with + or - prefixes)
    const versionChangePattern = /^[+-]\s*"version"\s*:\s*"[^"]*"/m;
    const hasVersionChange = versionChangePattern.test(packageJsonDiff);

    if (hasVersionChange) {
      // Validate that the version follows semantic versioning (major.minor.patch)
      const semverPattern = /^\d+\.\d+\.\d+$/;
      if (semverPattern.test(currentVersion)) {
        console.log(`✅ Version updated to ${currentVersion}`);
      } else {
        console.log(
          '❌ Version does not follow semantic versioning format (major.minor.patch)'
        );
        console.log(`Current version: ${currentVersion}`);
        console.log(
          'Please use the format: major.minor.patch (e.g., 1.0.0, 2.1.3)'
        );
        process.exit(1);
      }
    } else {
      console.log(
        `❌ ${PACKAGE_JSON} changed but version field was not updated`
      );
      console.log(`Current version: ${currentVersion}`);
      console.log(`Please update the version field in ${PACKAGE_JSON}`);
      console.log('');
      console.log(`${PACKAGE_JSON} changes:`);
      console.log(packageJsonDiff);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Error checking package.json diff');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the check
checkVersionBump();

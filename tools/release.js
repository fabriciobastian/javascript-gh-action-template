#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execCommand } = require('./exec-command');

function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function writePackageJson(filePath, packageData) {
  try {
    const content = JSON.stringify(packageData, null, 2) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.log(`❌ Error writing ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  console.log('🚀 Starting release process...');

  // Step 1: Read version from package.json
  console.log('\n📖 Step 1: Reading version from package.json');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = readPackageJson(packageJsonPath);
  const version = packageJson.version;

  if (!version) {
    console.log('❌ No version found in package.json');
    process.exit(1);
  }

  console.log(`✅ Found version: ${version}`);

  // Step 2: Check if tag already exists
  console.log('\n🔍 Step 2: Checking if tag already exists');
  const tag = `v${version}`;

  try {
    // Ensure tags are present in CI environments
    execCommand('git fetch --tags', 'Fetching git tags');
    // Check tag existence (non-zero exit means not found)
    execCommand(
      `git show-ref --tags --verify refs/tags/${tag}`,
      'Checking if tag already exists'
    );
    console.log(`✅ Tag ${tag} already exists, skipping release`);
    console.log('🎉 Release process completed (skipped - tag exists)!');
    return;
  } catch (error) {
    console.log(`📝 Tag ${tag} does not exist, proceeding with release`);
  }

  // Step 3: Run npm run build:package
  console.log('\n🔨 Step 3: Building package');
  execCommand('npm run build:package', 'Building package with rollup');

  // Step 4: Set version on dist-package/package.json
  console.log('\n📝 Step 4: Updating dist-package/package.json version');
  const distPackageJsonPath = path.join(
    process.cwd(),
    'dist-package',
    'package.json'
  );
  const distPackageJson = readPackageJson(distPackageJsonPath);

  const oldVersion = distPackageJson.version;
  distPackageJson.version = version;
  writePackageJson(distPackageJsonPath, distPackageJson);

  console.log(`✅ Updated version from ${oldVersion} to ${version}`);

  // Step 5: Run npm publish
  console.log('\n📦 Step 5: Publishing to npm');
  execCommand('npm publish', 'Publishing package to npm registry', {
    cwd: path.join(process.cwd(), 'dist-package')
  });

  // Step 6: Create GitHub release
  console.log('\n🏷️  Step 6: Creating GitHub release');
  const releaseTitle = tag;

  // Check if gh CLI is available
  try {
    execCommand('gh --version', 'Checking if GitHub CLI is available');
  } catch (error) {
    console.log('❌ GitHub CLI (gh) is not installed or not available');
    console.log('Please install it from: https://cli.github.com/');
    process.exit(1);
  }

  // Create the release
  const releaseCommand = `gh release create ${tag} --title "${releaseTitle}" --generate-notes --latest`;
  execCommand(releaseCommand, `Creating GitHub release ${tag}`);

  // Step 7: Move major tag (e.g., v2) to the latest release commit
  console.log('\n🏷️  Step 7: Updating major tag');
  try {
    // Determine major tag from version (e.g., 2.1.8 -> v2)
    const major = version.split('.')[0];
    const majorTag = `v${major}`;

    // Ensure tags are in sync
    execCommand('git fetch --tags', 'Fetching git tags');

    // Resolve the release commit and force-move major tag to it (no need to compare)
    const releaseCommit = execCommand(
      `git rev-list -n 1 ${tag}`,
      `Resolving commit for ${tag}`
    ).trim();

    console.log(`🔁 Moving ${majorTag} to ${releaseCommit}`);
    execCommand(
      `git tag -f ${majorTag} ${releaseCommit}`,
      `Updating ${majorTag}`
    );
    execCommand(
      `git push origin ${majorTag} --force`,
      `Pushing updated ${majorTag}`
    );
  } catch (err) {
    console.log('❌ Failed to update major tag');
    console.log(err.message);
    process.exit(1);
  }

  console.log('\n🎉 Release process completed successfully!');
  console.log(`📦 Package published to npm with version ${version}`);
  console.log(`🏷️  GitHub release created: ${tag}`);
  console.log(
    `🔗 You can view the release at: https://github.com/${
      process.env.GITHUB_REPOSITORY ||
      'Maersk-Global/update-jira-release-action'
    }/releases/tag/${tag}`
  );
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.log(`\n❌ Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(`\n❌ Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { main };

# JavaScript GitHub Action Template

A production-ready template for creating JavaScript-based GitHub Actions with built-in testing, building, and release automation.

## 🚀 Features

- **Modern JavaScript**: Built with Node.js 24 runtime
- **Bundling**: Uses Rollup to bundle dependencies into a single distributable file
- **Testing**: Jasmine test framework pre-configured
- **GitHub Actions SDK**: Pre-installed `@actions/core` and `@actions/github`
- **Command Execution**: Utility function for safe command execution
- **Formatting**: Prettier integration for code formatting
- **Release Automation**: Built-in release script with npm publishing and GitHub releases
- **Version Control**: Automatic version bump checking

## 📋 Prerequisites

- Node.js (version 20 or higher recommended)
- npm
- GitHub CLI (`gh`) - for releases
- Git

## 🎯 Getting Started

### 1. Use This Template

Click the "Use this template" button on GitHub to create a new repository from this template, or clone it directly:

```bash
git clone <your-repo-url>
cd <your-repo-name>
npm install
```

### 2. Customize Your Action

After creating your repository from this template, you need to update several files:

#### **Required Changes**

##### `action.yml`
Update the action metadata:
- **Line 3**: Change action name from `My Template Action` to your action's name
- **Line 4**: Update the description to describe what your action does
- **Lines 6-10**: Modify inputs to match your action's requirements (add, remove, or change as needed)
- **Lines 12-20**: Update or remove the example inputs (`github-token`, `repo-owner`, `repo-name`) based on your needs

##### `package.json`
Update package information:
- **Line 2**: Change `name` from `my-action` to your action's package name
- **Line 4**: Update `description` to match your action's purpose
- **Lines 13-17**: Update or replace `keywords` to reflect your action
- **Line 19**: Update `author` with your name and email

##### `CODEOWNERS`
- Update with your GitHub username or team to receive notifications for changes

#### **Recommended Changes**

##### `src/main.js`
Replace the example logic with your action's implementation:
- Keep the structure but replace `myHelpFunction` and `main` with your actual logic
- The `main` function receives inputs and contains your action's core logic

##### `src/index.js`
Update the input handling:
- **Line 6**: Change `example-input` to match your actual input names from `action.yml`
- Add additional `core.getInput()` calls for each input your action needs

##### `src/main.spec.js`
Replace example tests with tests for your actual functionality

##### `.npmrc` (if publishing to npm)
- **Line 4**: Replace `@your-gh-username` with your actual GitHub username or organization
- See the [Configuring npm Publishing](#configuring-npm-publishing) section for complete setup instructions

##### `LICENSE`
- Update with appropriate license information if needed

### 3. Remove Template Markers

Search for `TO BE UPDATED` comments throughout the codebase and address them.

## 📁 Project Structure

```
.
├── action.yml                    # GitHub Action metadata and configuration
├── CODEOWNERS                   # Code ownership configuration
├── dist/
│   └── index.js                 # Bundled action code (generated)
├── jasmine.json                 # Jasmine test configuration
├── LICENSE                      # License file
├── package.json                 # Node.js dependencies and scripts
├── README.md                    # This file
├── rollup.config.js             # Rollup bundler configuration for action
├── rollup-package.config.js     # Rollup configuration for npm package
├── src/
│   ├── index.js                 # Action entry point
│   ├── main.js                  # Main action logic
│   ├── main.spec.js             # Tests for main logic
│   ├── safe-exec.js             # Utility for safe command execution
│   └── package/                 # NPM package configuration (if publishing)
│       ├── package-exec.js      # Package entry point
│       └── package.json         # Package metadata
└── tools/
    ├── check-version-bump.js    # Version bump validation
    ├── exec-command.js          # Command execution utility
    └── release.js               # Automated release script
```

## 🛠️ Development

### Running Tests

```bash
npm test
```

Tests are configured to run all `*.spec.js` files in the `src/` directory using Jasmine.

### Code Formatting

Check formatting:
```bash
npm run format:check
```

Auto-fix formatting:
```bash
npm run format:write
```

### Building the Action

Build the action bundle:
```bash
npm run build
```

This creates/updates `dist/index.js` which is the file GitHub Actions will execute.

**Important**: Always run `npm run build` and commit the updated `dist/index.js` before pushing changes. GitHub Actions runs the bundled code, not the source files directly.

### Building the Package (Optional)

If you plan to publish your action as an npm package:

```bash
npm run build:package
```

This creates a `dist-package/` directory with the bundled package ready for npm publishing.

## 📦 Release Process

**Releases are fully automated via GitHub workflows.** When you update the version in `package.json` and push your changes, the configured workflows handle everything automatically.

### How It Works

The GitHub workflows orchestrate the release process using the included automation scripts. Here's what happens automatically:

1. **Version Detection**: Reads the version from `package.json`
2. **Tag Verification**: Checks if the release tag already exists (skips if it does)
3. **Building**: Runs `npm run build:package` to bundle the action
4. **Version Sync**: Updates `dist-package/package.json` with the current version
5. **Publishing**: Publishes to npm (if configured)
6. **GitHub Release**: Creates a GitHub release with auto-generated notes
7. **Tag Management**: Updates the major version tag (e.g., `v1`, `v2`) to point to the latest release

### Configuring npm Publishing

By default, the release workflow is configured to publish your action as an npm package to GitHub Package Registry.

#### If You Want to Publish to npm:

1. **Update `.npmrc`** (line 4):
   - Replace `@your-gh-username` with your GitHub username or organization name
   - Example: `@octocat:registry=https://npm.pkg.github.com`

2. **Set up the `NPM_GITHUB_TOKEN` secret**:
   - Go to your repository **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Name: `NPM_GITHUB_TOKEN`
   - Value: A GitHub Personal Access Token (classic) with **`write:packages`** and **`read:packages`** permissions
   - To create a token, go to **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)**

3. **Update `package.json`** (if needed):
   - Ensure your package name matches the scope (e.g., `"name": "@your-username/your-action"`)

#### If You DON'T Want to Publish to npm:

If you only want to create GitHub releases without publishing to npm, you need to modify the release script:

1. **Edit `tools/release.js`**:
   - Comment out or remove lines 62-85 (the npm publish section):
   ```javascript
   // Step 3: Run npm run build:package
   // Step 4: Set version on dist-package/package.json  
   // Step 5: Run npm publish
   ```

2. **Update `.github/workflows/cd.yml`**:
   - Remove the `.npmrc` move command (line 34):
   ```yaml
   - name: Release
     shell: bash
     run: |
       # mv .npmrc ~/.npmrc  <- Remove this line
       node tools/release.js
   ```
   - Optionally remove the `NPM_GITHUB_TOKEN` environment variable (lines 36-37)

3. **Delete `.npmrc`** (optional):
   - If you're not publishing to npm at all, you can delete this file

**Note**: Even without npm publishing, the workflow will still create GitHub releases and manage version tags automatically.

### Manual Release (Optional)

While workflows handle releases automatically, you can manually trigger the release script if needed:

```bash
node tools/release.js
```

**Note**: This is typically only needed for testing or troubleshooting the release process outside of CI/CD.

### Release Scripts

The template includes helper scripts in the `tools/` directory that the workflows use:

- **`tools/release.js`**: Main release orchestration script
- **`tools/check-version-bump.js`**: Validates version bumps in pull requests
- **`tools/exec-command.js`**: Utility for executing shell commands with error handling

These scripts are designed to run in CI/CD environments and handle all the automation behind the scenes.

## 🔧 Utilities

### Safe Command Execution

The template includes a `safeExec` utility for running shell commands safely:

```javascript
const { safeExec } = require('./safe-exec');

// Basic usage
await safeExec('echo "Hello World"');

// With options
await safeExec('some-command', {
  failOnStdErr: true,  // Fail if command writes to stderr (default: true)
  verbose: true         // Log command execution (default: false)
});
```

Features:
- Promise-based API
- Configurable stderr handling
- Large output buffer (200MB default, configurable via `SAFE_EXEC_MAX_BUFFER`)
- Verbose logging option

## 🎯 Using Your Action

Once published, users can reference your action in their workflows:

### By Version Tag

```yaml
- uses: your-username/your-action-name@v1
  with:
    example-input: 'some-value'
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### By Specific Version

```yaml
- uses: your-username/your-action-name@v1.2.3
  with:
    example-input: 'some-value'
```

### By Commit SHA

```yaml
- uses: your-username/your-action-name@abc123
  with:
    example-input: 'some-value'
```

## 📝 Best Practices

1. **Always bundle before committing**: Run `npm run build` and commit `dist/index.js`
2. **Write tests**: Add tests for your action logic in `*.spec.js` files
3. **Use semantic versioning**: Follow [semver](https://semver.org/) for version numbers
4. **Document inputs/outputs**: Keep `action.yml` documentation clear and up-to-date
5. **Handle errors gracefully**: Use try-catch blocks and `core.setFailed()` for errors
6. **Validate inputs**: Check required inputs and provide meaningful error messages
7. **Test locally**: Test your action in a test repository before releasing
8. **Keep dependencies minimal**: Only include necessary dependencies to reduce bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

See the [LICENSE](LICENSE) file for license rights and limitations.

## 🔗 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Toolkit](https://github.com/actions/toolkit)
- [Creating JavaScript Actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
- [Publishing Actions to Marketplace](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace)

## 📞 Support

If you encounter any issues or have questions, please [open an issue](../../issues) on GitHub.

---

**Happy Action Building! 🚀**

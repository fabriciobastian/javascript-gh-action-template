const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const config = {
  input: 'src/package/package-exec.js',
  output: {
    esModule: false,
    file: 'dist-package/index.js',
    format: 'cjs',
    sourcemap: false,
    banner: '#!/usr/bin/env node'
  },
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true })]
};

module.exports = config;

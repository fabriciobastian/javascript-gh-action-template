const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const config = {
  input: 'src/index.js',
  output: {
    esModule: false,
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: false
  },
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true })]
};

module.exports = config;

import next from 'eslint-config-next';

const config = [
  {
    ignores: ['.next', 'node_modules', 'coverage', 'dist'],
  },
  ...next,
];

export default config;


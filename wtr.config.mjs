import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  port: 8000,
  nodeResolve: true,
  files: 'target/**/*.spec.js',
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' })
  ]
};

/* Cross-platform CLI entry point without telemetry or global config writes. */
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const cli = path.resolve(__dirname, '../node_modules/astro/bin/astro.mjs');
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);

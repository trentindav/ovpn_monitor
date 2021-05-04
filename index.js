const yaml = require('js-yaml');
const fs = require('fs');

const args = require('minimist')(process.argv.slice(2), {
  string: ['config'],
  default: { config: './ovpn_monitor_config.yaml' },
});

try {
  const doc = yaml.load(fs.readFileSync(args.config, 'utf-8'));
  console.log(doc);
} catch (err) {
  console.error(err);
}

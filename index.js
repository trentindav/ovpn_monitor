const yaml = require("js-yaml");
const fs = require("fs");
const vpnStatus = require("./lib/ovpn_status");

const args = require("minimist")(process.argv.slice(2), {
  string: ["config"],
  default: { config: "./ovpn_monitor_config.yaml" },
});

function main() {
  try {
    const doc = yaml.load(fs.readFileSync(args.config, "utf-8"));
    //console.log(doc);
  } catch (err) {
    console.error(err);
    return;
  }

  vpnStatus.readOpenvpnStatusFile("res/openvpn-status.log");
}

main();

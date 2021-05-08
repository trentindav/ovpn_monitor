const yaml = require("js-yaml");
const fs = require("fs");
//const vpnStatus = require("./lib/ovpn_status");
//const influx = require("./lib/influxdb_client");
const { Worker } = require("worker_threads");

const args = require("minimist")(process.argv.slice(2), {
  string: ["config"],
  default: { config: "./ovpn_monitor_config.yaml" },
});

async function main() {
  let config;
  try {
    config = yaml.load(fs.readFileSync(args.config, "utf-8"));
  } catch (err) {
    console.error(err);
    return;
  }

  const ovpnWorker = new Worker("./lib/ovpn_status.js");
  ovpnWorker.on("exit", (retval) =>
    console.log(`OpenVPN worker exit: ${retval}`),
  );
  ovpnWorker.postMessage({
    command: "monitorOpenvpnStatus",
    filePath: config.ovpn_logs.client_status,
    influxdb: config.influxdb,
  });

  while (true) {
    await sleep(1000);
  }

  //ovpnWorker.terminate();
}

main();

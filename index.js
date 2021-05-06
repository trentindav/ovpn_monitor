const yaml = require("js-yaml");
const fs = require("fs");
const vpnStatus = require("./lib/ovpn_status");

const args = require("minimist")(process.argv.slice(2), {
  string: ["config"],
  default: { config: "./ovpn_monitor_config.yaml" },
});

function main() {
  let doc;
  try {
    doc = yaml.load(fs.readFileSync(args.config, "utf-8"));
    //console.log(doc);
  } catch (err) {
    console.error(err);
    return;
  }

  vpnStatus.readOpenvpnStatusFile(doc.ovpn_logs.client_status);

  const { InfluxDB } = require("@influxdata/influxdb-client");

  // You can generate a Token from the "Tokens Tab" in the UI
  const token =
    "o8EflygvzVNrjYY8DWV0_n0GEg2tth8kWDceiFD3j_6P-XgNPsteR8h4OHRM_aRL_bCzN8NT3LsEF6aqVrJJBg==";
  const org = "davideorg";
  const bucket = "davidebucket";

  const client = new InfluxDB({ url: "http://localhost:8086", token: token });
  const { Point } = require("@influxdata/influxdb-client");
  const writeApi = client.getWriteApi(org, bucket);
  writeApi.useDefaultTags({ host: "host1" });

  const point = new Point("mem").floatField("used_percent_4", 22.43234543);
  writeApi.writePoint(point);
  writeApi
    .close()
    .then(() => {
      console.log("FINISHED");
    })
    .catch((e) => {
      console.error(e);
      console.log("\\nFinished ERROR");
    });
}

main();

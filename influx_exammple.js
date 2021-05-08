const { InfluxDB } = require("@influxdata/influxdb-client");

// You can generate a Token from the "Tokens Tab" in the UI
const token =
  "o8EflygvzVNrjYY8DWV0_n0GEg2tth8kWDceiFD3j_6P-XgNPsteR8h4OHRM_aRL_bCzN8NT3LsEF6aqVrJJBg==";
const org = "davideorg";
const bucket = "davidebucket";

const client = new InfluxDB({ url: "http://localhost:8086", token: token });

const { Point } = require("@influxdata/influxdb-client");
const writeApi = client.getWriteApi(org, bucket);
writeApi.useDefaultTags({ host: "host2" });

const point = new Point("mem").floatField("used_percent", 21.443);
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

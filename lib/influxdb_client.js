const os = require("os");
const { InfluxDB } = require("@influxdata/influxdb-client");

class InfluxWriter {
  /**
   * Helper class to write points to InfluxDB
   * The constructor must receive an object which include the following keys:
   * - url {string} The InfluxDB connection URL
   * - token {string} Authentication token
   * - org {string} Organization
   * - bucket {string} Bucket
   */
  url;
  org;
  bucket;
  token;
  client;

  constructor(influxParams) {
    if (!influxParams.org || !influxParams.bucket) {
      throw 'Influx configuration for "org" and "bucket" is required';
    }
    this.org = influxParams.org;
    this.bucket = influxParams.bucket;
    this.url = influxParams.url ?? "http://localhost:8086";
    this.token = influxParams.token;
    console.log(`Created InfluxDB client for ${this.url}`);
    this.client = new InfluxDB({ url: this.url, token: this.token });
  }

  /**
   * Write a series of points to the bucket
   * @param {points} Array of influxdb-client points
   * @return {boolean} false is an error occurred
   */
  writePoints(points) {
    const writeApi = this.client.getWriteApi(this.org, this.bucket);
    writeApi.useDefaultTags({ host: os.hostname() });
    writeApi.writePoints(points);
    writeApi
      .close()
      .then(() => {
        return true;
      })
      .catch((e) => {
        console.error(`Error writing points: ${e}`);
        return false;
      });
  }
}

module.exports = {
  InfluxWriter: InfluxWriter,
};

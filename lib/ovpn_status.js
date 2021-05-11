const fs = require("fs");
const { Point } = require("@influxdata/influxdb-client");
const { parentPort } = require("worker_threads");
const influx = require("./influxdb_client");
const { sleep } = require("./utils");

module.exports = {
  readOpenvpnStatusFile: readOpenvpnStatusFile,
};

/**
 * This file is invoked as a worker from Main
 * The following message.command are accepted:
 *   - monitorOpenvpnStatus: start loop to monitor the status file
 *     In this case the message must also include influxdb object containing
 *     the keys required by InfluxWriter
 */
parentPort.on("message", (message) => {
  if ((message.command = "monitorOpenvpnStatus")) {
    let influxWriter = new influx.InfluxWriter(message.influxdb);
    const monitorPeriodSec = message.monitorPeriod ?? 10;
    monitorOpenvpnStatus(message.filePath, influxWriter, monitorPeriodSec);
  }
});

async function monitorOpenvpnStatus(filePath, influx, period) {
  while (true) {
    await readOpenvpnStatusFile(filePath, influx);
    await sleep(period * 1000);
  }
  influxWriter.close();
}

function readUserFromRouteLine(lineStr) {
  let words = lineStr.split(",");
  return words[1];
}

/**
 * Open OpenVPN status file, extract all data, and push them into Influx
 */
async function readOpenvpnStatusFile(filePath, influx) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      let users = {};
      if (err) {
        console.error(err);
        reject(err);
      }
      const lines = data.split("\n");
      // Updated since
      //let updatedSince = lines[1].split(",")[1];
      //console.debug("Last Update: " + updatedSince);
      // Read stats and initialize users
      for (var line = 3; line < lines.length; line++) {
        if (lines[line].startsWith("ROUTING")) {
          break;
        }
        let user = new User(lines[line]);
        users[user.name] = user;
      }
      for (var line2 = line + 2; line2 < lines.length; line2++) {
        if (lines[line2].startsWith("GLOBAL")) {
          break;
        }
        let username = readUserFromRouteLine(lines[line2]);
        users[username].setRoutingInfo(lines[line2]);
      }
      let userPoints = [];
      let totalRxBytes = 0;
      let totalTxBytes = 0;
      for (username in users) {
        const userPointRx = new Point("openvpn_status")
          .tag("username", username)
          .tag("realAddress", users[username].realAddress)
          .tag("virtualAddress", users[username].virtualAddress)
          .floatField("bits_rx", users[username].rxBytes * 8);
        userPoints.push(userPointRx);
        const userPointTx = new Point("openvpn_status")
          .tag("username", username)
          .tag("realAddress", users[username].realAddress)
          .tag("virtualAddress", users[username].virtualAddress)
          .floatField("bits_tx", users[username].txBytes * 8);
        userPoints.push(userPointTx);
        totalRxBytes += users[username].rxBytes * 8;
        totalTxBytes += users[username].txBytes * 8;
      }
      userPoints.push(
        new Point("openvpn_status").floatField("total_bits_rx", totalRxBytes),
      );
      userPoints.push(
        new Point("openvpn_status").floatField("total_bits_tx", totalTxBytes),
      );

      influx.writePoints(userPoints);
      resolve();
    });
  });
}

class User {
  name;
  realAddress;
  udpPort;
  rxBytes;
  txBytes;
  since;
  lastRef;
  virtualAddress;

  constructor(strStats) {
    // Name, Address:Port, Rx Bytes, Tx Bytes, Since
    let fields = strStats.split(",");
    this.name = fields[0];
    let addrPort = fields[1].split(":");
    this.realAddress = addrPort[0];
    this.udpPort = addrPort[1];
    this.rxBytes = parseInt(fields[2]);
    this.txBytes = parseInt(fields[3]);
    this.since = fields[4];
  }

  setRoutingInfo(strRoute) {
    let fields = strRoute.split(",");
    this.virtualAddress = fields[0];
    this.lastRef = fields[fields.length - 1];
  }
}

const fs = require("fs");

module.exports = {
  readOpenvpnStatusFile: readOpenvpnStatusFile,
};

function readUserFromRouteLine(lineStr) {
  let words = lineStr.split(",");
  return words[1];
}

function readOpenvpnStatusFile(filePath) {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    let users = {};
    let lines = data.split("\n");
    // Updated since
    let updatedSince = lines[1].split(",")[1];
    console.log("Last Update: " + updatedSince);
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
    console.log(Object.keys(users).length);
    for (user in users) {
      console.log(users[user]);
    }
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
    this.rxBytes = fields[2];
    this.txBytes = fields[3];
    this.since = fields[4];
  }

  setRoutingInfo(strRoute) {
    let fields = strRoute.split(",");
    this.virtualAddress = fields[0];
    this.lastRef = fields[fields.length - 1];
  }
}

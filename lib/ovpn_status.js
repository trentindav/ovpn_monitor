const fs = require("fs");

module.exports = {
  readOpenvpnStatusFile: readOpenvpnStatusFile,
};

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
      users[user.name] = User;
    }
    console.log(Object.keys(users).length);
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
}

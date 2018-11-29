// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const osc = require("osc");

const udpPort = new osc.UDPPort({
  localAddress: "localhost",
  localPort: 3333
});

udpPort.open();

udpPort.on("message", oscMsg => {
  console.log("An OSC message just arrived!", oscMsg);
});

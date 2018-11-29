{
  const osc = require("osc");

  const udpPort = new osc.UDPPort({
    localAddress: "localhost",
    localPort: 3333
  });

  const init = () => {
    udpPort.open();
  };

  udpPort.on("message", oscMsg => {
    console.log("An OSC message just arrived!", oscMsg);
  });

  init();
}

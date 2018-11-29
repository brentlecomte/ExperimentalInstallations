{
  const osc = require("osc");
  let currentTags = [];

  const udpPort = new osc.UDPPort({
    localAddress: "localhost",
    localPort: 3333
  });

  const init = () => {
    udpPort.open();
  };

  udpPort.on("message", Tag => {
    if (Tag.args[0] === "set") {
      console.log(Tag);

      //add figure logic
      checkTags(Tag.args[2]);
    } else {
      //Prompt to add icon
      // console.log("no tag detected");
    }
    deleteTags(Tag.args[1]);
  });

  const checkTags = currentTag => {
    const checkTag = currentTag;
    if (!currentTags.includes(checkTag)) {
      currentTags.push(checkTag);
      // console.log(currentTags);
    } else {
      // console.log("already on playfield");
    }
  };

  const deleteTags = tagToDelete => {
    // console.log("delete");
  };

  init();
}

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
      checkTags(Tag.args);
    } else {
      //Prompt to add figure
    }
    checkIfIdle(Tag);
  });

  const checkTags = currentTag => {
    const checkTag = currentTag[2];
    if (!currentTags.includes(checkTag)) {
      currentTags.push(checkTag);
    }
  };

  const checkIfIdle = Tag => {
    if (currentTags.includes(Tag)) {
      setTimeout(deleteTags(Tag), 2500);
    }
  };

  const deleteTags = tagToDelete => {
    //delete tags
    let index = currentTags.indexOf(tagToDelete);
    if (index > -1) {
      currentTags.splice(index, 1);
    }
  };

  init();
}

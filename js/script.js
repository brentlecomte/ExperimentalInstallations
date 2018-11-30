{
  const osc = require("osc");
  let currentTags = [];
  const $title = document.querySelector("h1");

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
      //Prompt to add figure
    }
    onScreen(Tag.args);
  });

  const checkTags = currentTag => {
    const checkTag = currentTag;
    if (!currentTags.includes(checkTag)) {
      currentTags.push(checkTag);
      return;
    }

    setTimeout(deleteTags(checkTag), 250);
  };

  const onScreen = currentTag => {};

  const deleteTags = tagToDelete => {
    let index = currentTags.indexOf(tagToDelete);
    if (index > -1) {
      currentTags.splice(index, 1);
    }
  };

  init();
}

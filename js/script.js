{
  const osc = require("osc");
  let currentTags = [];

  const Island = require("./classes/Island.js");
  const Sea = require("./classes/Sea.js");

  let container,
    renderer,
    camera,
    camHeight,
    fieldOfView,
    aspectRatio,
    near,
    far,
    scene,
    WIDTH,
    HEIGHT;

  let island, islandHeight, islandDepth, dist, sea;

  const udpPort = new osc.UDPPort({
    localAddress: "localhost",
    localPort: 3333
  });

  const init = () => {
    udpPort.open();
    threeInit();
  };

  udpPort.on("message", Tag => {
    if (Tag.args[0] === "set") {
      checkTags(Tag.args);
    } else {
      //Prompt to add figure
    }
    checkIfIdle(Tag);
  });

  //THREEJS

  const createScene = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    scene = new THREE.Scene();

    //renderer maken
    renderer = new THREE.WebGLRenderer({
      // Allow transparency to show the gradient background
      // we defined in the CSS
      alpha: true,

      // Activate the anti-aliasing; this is less performant,
      // but, as our project is low-poly based, it should be fine :)
      antialias: true
    });

    //set size of renderer
    renderer.setSize(WIDTH, HEIGHT);

    //enable shadow rendering

    container = document.querySelector(`.canvas`);
    container.appendChild(renderer.domElement);

    window.addEventListener("resize", handleWindowResize, false);
  };

  const handleWindowResize = () => {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  };

  setCamera = () => {
    islandHeight = 100;
    dist = 140;
    let fov = 2 * Math.atan(islandHeight / (2 * dist)) * (180 / Math.PI);

    console.log(fov);

    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    near = 1;
    far = 10000;
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);

    camHeight = 320;

    //camera positioneren
    camera.position.x = 0;
    camera.position.y = camHeight;
    camera.position.z = 0;
    camera.rotation.x = (-90 * Math.PI) / 180;
    // camera.lookAt(0,0,0)
  };

  const createLights = () => {
    //hemispherelight maken
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

    //shadowlight
    shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

    // positie lichtbron
    shadowLight.position.set(150, 350, 350);

    //shadowcasting toelaten
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.right = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    //resolution definen
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    //light activeren
    scene.add(hemisphereLight);
    scene.add(shadowLight);
  };

  const createIsland = () => {
    island = new Island();

    island.mesh.scale.set(2, 1, 2);
    console.log(island.mesh);

    scene.add(island.mesh);
  };

  const createSea = () => {
    sea = new Sea();
    sea.mesh.position.y = -74;
    scene.add(sea.mesh);
  };

  const loop = () => {
    requestAnimationFrame(loop);

    sea.moveWaves();

    renderer.render(scene, camera);
  };

  const threeInit = () => {
    createScene();
    setCamera();
    createLights();
    createIsland();
    createSea();

    loop();
  };
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

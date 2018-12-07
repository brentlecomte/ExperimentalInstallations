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

  let tagOnPlayField = [];

  let island, islandHeight, islandDepth, dist, sea, sphere;

  let islandObj = {
    lt: {
      value: 100,
      dead: false
    },
    lb: {
      value: 100,
      dead: false
    },
    mt: {
      value: 100,
      dead: false
    },
    mb: {
      value: 100,
      dead: false
    },
    rt: {
      value: 100,
      dead: false
    },
    rb: {
      value: 100,
      dead: false
    }
  };

  const init = () => {
    udpPort.open();
    gameInit();
    threeInit();
  };

  //THREEJS

  const createScene = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
      alpha: true,

      antialias: true
    });

    renderer.setSize(WIDTH, HEIGHT);

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
    // checkPosition();
    if (tagOnPlayField[3]) {
      console.log(sphere);

      sphere.position.x = mapValue(
        tagOnPlayField[3],
        0,
        1,
        WIDTH / 2,
        -WIDTH / 2
      );
      sphere.position.z = mapValue(
        tagOnPlayField[4],
        0,
        1,
        -HEIGHT / 2,
        HEIGHT / 2
      );
    }
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

  // OSC / GAME LOGIC

  const gameInit = () => {
    // document.addEventListener("mousemove", handleMouseMove, false);
  };

  const udpPort = new osc.UDPPort({
    localAddress: "localhost",
    localPort: 3333
  });

  udpPort.on("message", Tag => {
    if (Tag.args[0] === "set") {
      checkTags(Tag.args);
    } else {
      // nothingOnScreen();
    }
  });

  const checkPosition = () => {
    if (mousePos.x < WIDTH / 3 && mousePos.y < HEIGHT / 2) {
      updatePartIsland(islandObj.lt);
    }
    if (mousePos.x < WIDTH / 3 && mousePos.y > HEIGHT / 2) {
      updatePartIsland(islandObj.lb);
    }
    if (mousePos.x > WIDTH - WIDTH / 3 && mousePos.y < HEIGHT / 2) {
      updatePartIsland(islandObj.rt);
    }
    if (mousePos.x > WIDTH - WIDTH / 3 && mousePos.y > HEIGHT / 2) {
      updatePartIsland(islandObj.rb);
    }
    if (
      mousePos.x > WIDTH / 3 &&
      mousePos.x < WIDTH - WIDTH / 3 &&
      mousePos.y < HEIGHT / 2
    ) {
      updatePartIsland(islandObj.mt);
    }
    if (
      mousePos.x > WIDTH / 3 &&
      mousePos.x < WIDTH - WIDTH / 3 &&
      mousePos.y > HEIGHT / 2
    ) {
      updatePartIsland(islandObj.mb);
    }
  };

  const updatePartIsland = partToUpdate => {
    partToUpdate.value += 0.2;
  };

  const checkTags = currentTag => {
    const checkTag = currentTag[2];
    console.log(currentTag);

    // switch (checkTag) {
    //   case 0:
    //     fireOnField(currentTag);
    //     break;
    //   case 1:
    //     waterOnField(currentTag);
    //     break;
    //   default:
    //     nothingOnScreen();
    //     break;
    // }

    if (!currentTags.includes(checkTag)) {
      currentTags.push(checkTag);
      tagOnPlayField = currentTag;

      fireOnField();
      console.log(currentTags);
    } else {
      tagOnPlayField = currentTag;
    }
  };

  const fireOnField = () => {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sphere = new THREE.Mesh(geometry, material);

    sphere.position.x = mapValue(
      tagOnPlayField[3],
      0,
      1,
      WIDTH / 2,
      -WIDTH / 2
    );
    sphere.position.z = mapValue(
      tagOnPlayField[4],
      0,
      1,
      -HEIGHT / 2,
      HEIGHT / 2
    );

    scene.add(sphere);
  };

  const waterOnField = waterTag => {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xbada55 });
    sphere = new THREE.Mesh(geometry, material);

    console.log(WIDTH);

    // sphere.position.x = mapValue(fireTag[3], 0, 1, 0, WIDTH);
    sphere.position.x = mapValue(waterTag[3], 0, 1, WIDTH / 2, -WIDTH / 2);
    sphere.position.z = mapValue(waterTag[4], 0, 1, -HEIGHT / 2, HEIGHT / 2);

    scene.add(sphere);
  };

  const mapValue = (value, istart, istop, ostart, ostop) =>
    ostart + (ostop - ostart) * ((value - istart) / (istop - istart));

  const nothingOnScreen = () => {
    console.log("nothing");
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

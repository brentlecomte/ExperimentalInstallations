{
  let raycaster = new THREE.Raycaster();
  const osc = require("osc");

  const Island = require("./classes/Island.js");
  const IslandBiomes = require("./classes/IslandBiomes.js");
  const Sea = require("./classes/Sea.js");
  const AnimationPion = require("./classes/AnimationPion.js");

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
    HEIGHT,
    rayCaster,
    mouseVector,
    lastPosX,
    lastPosY,
    sunPion1,
    sunPion2,
    rainPion1,
    rainPion2;

  let checkTag = [];
  let idTags = [];
  let currentTags = [];

  const islandPieces = [
    `topLeft`,
    `botLeft`,
    `topRight`,
    `botRight`,
    `topMid`,
    `botMid`
  ];

  let island, islandHeight, islandBiomes, islandDepth, dist, sea;

  // let checkTag = [];

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
    threeInit();
    rayCaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector3();
  };

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

    scene.add(island.mesh);

    islandBiomes = new IslandBiomes();
    islandBiomes.mesh.scale.set(2, 1, 2);

    scene.add(islandBiomes.mesh);

    // islandPieces.forEach(piece => {
    //   islandBiome = new IslandBiome(piece);
    //   islandBiome.mesh.scale.set(2, 1, 2);
    //   console.log(islandBiome.mesh);
    //   scene.add(islandBiome.mesh);

    // })
  };

  const createSea = () => {
    sea = new Sea();
    sea.mesh.position.y = -74;
    scene.add(sea.mesh);
  };

  const loop = () => {
    requestAnimationFrame(loop);
    sea.moveWaves();
    checkPosition();

    currentTags.forEach(Tag => {
      if (Tag[3]) {
        Tag[Tag.length - 1].mesh.position.x = mapValue(
          Tag[3],
          0,
          1,
          WIDTH / 2,
          -WIDTH / 2
        );
        Tag[Tag.length - 1].mesh.position.z = mapValue(
          Tag[4],
          0,
          1,
          -HEIGHT / 2,
          HEIGHT / 2
        );
        Tag[Tag.length - 1].moveAnimation();
      }
    });

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

  const udpPort = new osc.UDPPort({
    localAddress: "localhost",
    localPort: 3333
  });

  udpPort.on("message", Tag => {
    if (Tag.args[0] === "set") {
      addTags(Tag.args);
    }
    if (Tag.args[0] === "alive") {
      checkTags(Tag.args);
    }
  });

  const checkPosition = () => {
    if (sunPion1) {
      if (
        sunPion1.mesh.position.x != lastPosX ||
        sunPion1.mesh.position.z != lastPosY
      ) {
        onSphereMove();
      }
      lastPosX = sunPion1.mesh.position.x;
      lastPosY = sunPion1.mesh.position.z;
    }

    if (
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) < WIDTH / 3 &&
      mapValue(checkTag[4], 0, 1, WIDTH / 2, -WIDTH / 2) < HEIGHT / 2
    ) {
      updatePartIsland(islandObj.lt, `top left`);
    } else {
      return;
    }
    if (
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) < WIDTH / 3 &&
      mapValue(checkTag[4], 0, 1, WIDTH / 2, -WIDTH / 2) > HEIGHT / 2
    ) {
      updatePartIsland(islandObj.lb, `bot left`);
    } else {
      return;
    }
    if (
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) > WIDTH - WIDTH / 3 &&
      mapValue(checkTag[4], 0, 1, WIDTH / 2, -WIDTH / 2) < HEIGHT / 2
    ) {
      updatePartIsland(islandObj.rt, `top right`);
    } else {
      return;
    }
    if (
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) > WIDTH - WIDTH / 3 &&
      mapValue(checkTag[4], 0, 1, WIDTH / 2, -WIDTH / 2) > HEIGHT / 2
    ) {
      updatePartIsland(islandObj.rb, `bot right`);
    } else {
      return;
    }
    if (
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) > WIDTH / 3 &&
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) < WIDTH - WIDTH / 3 &&
      mapValue(checkTag[4], 0, 1, WIDTH / 2, -WIDTH / 2) < HEIGHT / 2
    ) {
      updatePartIsland(islandObj.mt, `top mid`);
    } else {
      return;
    }
    if (
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) > WIDTH / 3 &&
      mapValue(checkTag[3], 0, 1, WIDTH / 2, -WIDTH / 2) < WIDTH - WIDTH / 3 &&
      mapValue(checkTag[4], 0, 1, WIDTH / 2, -WIDTH / 2) > HEIGHT / 2
    ) {
      updatePartIsland(islandObj.mb, `bot mid`);
    } else {
      return;
    }
  };

  const updatePartIsland = (partToUpdate, currentPos) => {
    partToUpdate.value += 0.2;
  };

  const addTags = currentTag => {
    checkTag = currentTag;
    if (!idTags.includes(checkTag[2])) {
      idTags.push(checkTag[2]);
      currentTags.push(checkTag);
      switch (checkTag[2]) {
        case 0:
          fireOnField(checkTag);
          break;
        case 1:
          fireOnField(checkTag);
          break;
        case 2:
          waterOnField(checkTag);
          break;
        case 3:
          waterOnField(checkTag);
          break;
      }
    } else {
      currentTags.forEach(Tag => {
        if (Tag[2] === checkTag[2]) {
          Tag[3] = checkTag[3];
          Tag[4] = checkTag[4];
        }
      });
    }
  };

  const checkTags = aliveTags => {
    if (!checkTag[0]) {
      return;
    }
    if (!aliveTags.includes(checkTag[1])) {
      currentTags.forEach(Tag => {
        if (Tag.includes(checkTag[1])) {
          scene.remove(Tag[Tag.length - 1].mesh);
        }
      });

      deleteTags(checkTag, currentTags);

      deleteTags(checkTag[2], idTags);

      checkTag[checkTag.length - 1] = undefined;
      checkTag = [];
    }
  };

  const fireOnField = tagToShow => {
    pion = new AnimationPion();

    pion.mesh.position.x = mapValue(tagToShow[3], 0, 1, WIDTH / 2, -WIDTH / 2);
    pion.mesh.position.z = mapValue(
      tagToShow[4],
      0,
      1,
      -HEIGHT / 2,
      HEIGHT / 2
    );

    if (tagToShow[2] === 0) {
      sunPion1 = pion;
      tagToShow.push(sunPion1);
      checkTag.push(sunPion1);
      scene.add(sunPion1.mesh);
    } else {
      sunPion2 = pion;
      tagToShow.push(sunPion2);
      checkTag.push(sunPion2);
      scene.add(sunPion2.mesh);
    }
  };

  const waterOnField = tagToShow => {
    pion = new AnimationPion();

    pion.mesh.position.x = mapValue(tagToShow[3], 0, 1, WIDTH / 2, -WIDTH / 2);
    pion.mesh.position.z = mapValue(
      tagToShow[4],
      0,
      1,
      -HEIGHT / 2,
      HEIGHT / 2
    );

    if (tagToShow[2] === 0) {
      rainPion1 = pion;
      tagToShow.push(rainPion1);
      checkTag.push(rainPion1);
      scene.add(rainPion1.mesh);
    } else {
      rainPion2 = pion;
      tagToShow.push(rainPion2);
      checkTag.push(rainPion2);
      scene.add(rainPion2.mesh);
    }
  };

  const mapValue = (value, istart, istop, ostart, ostop) =>
    ostart + (ostop - ostart) * ((value - istart) / (istop - istart));

  const deleteTags = (tagToDelete, arrayToDeleteFrom) => {
    let index = arrayToDeleteFrom.indexOf(tagToDelete);
    console.log(index);

    arrayToDeleteFrom.splice(index - 1, 1);
  };

  const onSphereMove = () => {
    mouseVector.x = -checkTag[3] * 4 + 2;
    mouseVector.y = -checkTag[4] * 4 + 2;

    rayCaster.setFromCamera(mouseVector, camera);
    intersects = rayCaster.intersectObjects(islandBiomes.mesh.children, true);

    if (intersects.length !== 0) {
      detailEvent();
    } else {
      return;
    }
  };

  const detailEvent = () => {
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.name === `biome`) {
        break;
      }
    }
  };

  init();
}

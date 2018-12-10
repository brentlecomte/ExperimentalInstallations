{
  const osc = require("osc");
  let currentTags = [];

  const Island = require("./classes/Island.js");
  const IslandBiomes = require("./classes/IslandBiomes.js");
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
    HEIGHT,
    rayCaster,
    mouseVector,
    lastPosX,
    lastPosY;

  let tagOnPlayField = [];

  let island, islandHeight, islandBiomes, islandDepth, dist, sea, sphere;

  let checkTag = [];

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
    projectorStart();
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

    islandBiomes = new IslandBiomes();
    islandBiomes.mesh.scale.set(2, 1, 2);
    console.log(islandBiomes.mesh);
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
    if (tagOnPlayField[3]) {
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

    if (sphere) {
      
      if (sphere.position.x != lastPosX || sphere.position.z != lastPosY) {
        onSphereMove();        
      }
      lastPosX = sphere.position.x;
      lastPosY = sphere.position.z;
    }
    
    if (
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) < WIDTH / 3 &&
      mapValue(tagOnPlayField[4], 0, 1, WIDTH / 2, -WIDTH / 2) < HEIGHT / 2
    ) {
      updatePartIsland(islandObj.lt, `top left`);
    } else {
      return;
    }
    if (
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) < WIDTH / 3 &&
      mapValue(tagOnPlayField[4], 0, 1, WIDTH / 2, -WIDTH / 2) > HEIGHT / 2
    ) {
      updatePartIsland(islandObj.lb, `bot left`);
    } else {
      return;
    }
    if (
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) >
        WIDTH - WIDTH / 3 &&
      mapValue(tagOnPlayField[4], 0, 1, WIDTH / 2, -WIDTH / 2) < HEIGHT / 2
    ) {
      updatePartIsland(islandObj.rt, `top right`);
    } else {
      return;
    }
    if (
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) >
        WIDTH - WIDTH / 3 &&
      mapValue(tagOnPlayField[4], 0, 1, WIDTH / 2, -WIDTH / 2) > HEIGHT / 2
    ) {
      updatePartIsland(islandObj.rb, `bot right`);
    } else {
      return;
    }
    if (
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) > WIDTH / 3 &&
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) <
        WIDTH - WIDTH / 3 &&
      mapValue(tagOnPlayField[4], 0, 1, WIDTH / 2, -WIDTH / 2) < HEIGHT / 2
    ) {
      updatePartIsland(islandObj.mt, `top mid`);
    } else {
      return;
    }
    if (
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) > WIDTH / 3 &&
      mapValue(tagOnPlayField[3], 0, 1, WIDTH / 2, -WIDTH / 2) <
        WIDTH - WIDTH / 3 &&
      mapValue(tagOnPlayField[4], 0, 1, WIDTH / 2, -WIDTH / 2) > HEIGHT / 2
    ) {
      updatePartIsland(islandObj.mb, `bot mid`);
    } else {
      return;
    }
  };

  const updatePartIsland = (partToUpdate, currentPos) => {
    partToUpdate.value += 0.2;
    //console.log(currentPos);

  };

  const addTags = currentTag => {
    //console.log(currentTag);

    checkTag = currentTag;
    if (!currentTags.includes(checkTag[2])) {
      currentTags.push(checkTag[2]);
      tagOnPlayField = currentTag;
      fireOnField();
    } else {
      tagOnPlayField = currentTag;
    }
  };

  const checkTags = aliveTags => {
    if (!aliveTags.includes(checkTag[1])) {
      deleteTags(checkTag[2]);
      scene.remove(sphere);
    }
  };

  const fireOnField = () => {
    const geometry = new THREE.CylinderGeometry(5, 5, 32, 10);
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
    let index = currentTags.indexOf(tagToDelete);
    if (index > -1) {
      currentTags.splice(index, 1);
    }
  };

  const projectorStart = () => {
    rayCaster = new THREE.Raycaster();
    //console.log(rayCaster);
  
    mouseVector = new THREE.Vector3();
    //console.log(mouseVector);
  
  
    //container.addEventListener(`mousemove`, onMouseMove);
  };

  const onSphereMove = () => {
  
    // mouseVector.x = (sphere.position.x / window.innerWidth) * 2 - 1;
    // mouseVector.z = (sphere.position.z / window.innerHeight) * 2 + 1;
    mouseVector.x = tagOnPlayField[3] * 2 - .5;
    mouseVector.z = - tagOnPlayField[4] * 2 + .5;
    console.log(tagOnPlayField[3])
    //console.log(mouseVector.x, mouseVector.y, mouseVector.z);
  
    rayCaster.setFromCamera(mouseVector, camera);
    intersects = rayCaster.intersectObjects(islandBiomes.mesh.children, true);
    //console.log(scene.children);
    
    //console.log(islandBiomes.mesh.children);
  
    console.log(intersects);
  
    if (intersects.length !== 0) {
      document.addEventListener(`click`, detailEvent);
    } else {
      return;
    }
  };

  const detailEvent = () => {
    //console.log(`click`);
  
  
    for (let i = 0;i < intersects.length;i ++) {
      if (intersects[i].object.name === `biome`) {
        console.log(`found`);
        console.log(intersects[i].object.parent.name);
  
        break;
      }
    }
  };
  

  init();
}

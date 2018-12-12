{
  const osc = require("osc");
  let currentTags = [];

  const Island = require("./classes/Island.js");
  const IslandBiomes = require("./classes/IslandBiomes.js");
  const Flower = require("./classes/Flower.js");
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
    flower,
    lastBiome;

    let flowers = [];
    let rainBiomes = [];

  let 
  //   topLeft,
  //   topMid,
  //   topRight,
  //   botLeft,
  //   botMid,
  //   botRight,
    pion;


  let tagOnPlayField = [];

  const prevRainItems = [];
  const rainItems = [];

  const islandPieces = [{
    topLeft: {
      name: `topLeft`,
      rain: 0,
      sun: 0,
    },
    botLeft: {
      name: `botLeft`,
      rain: 0,
      sun: 0,
    },
    topMid: {
      name: `topMid`,
      rain: 0,
      sun: 0,
    },
    botMid: {
      name: `botMid`,
      rain: 0,
      sun: 0,
    },
    topRight: {
      name: `topRight`,
      rain: 0,
      sun: 0,
    },
    botRight: {
      name: `botRight`,
      rain: 0,
      sun: 0,
    },

  }];

  let island, islandHeight, islandBiomes, islandDepth, dist, sea;

  let checkTag = [];

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
  };

  const createSea = () => {
    sea = new Sea();
    sea.mesh.position.y = -74;
    scene.add(sea.mesh);
  };

  const createFlower = (x, z, name, parent) => {
    flower = new Flower(name, parent);
    // flower.mesh.scale.set(.08, .08, .08);
    flower.mesh.scale.set(0);
    flower.mesh.position.y = 40;
    flower.mesh.position.x = x;
    flower.mesh.position.z = z;
    scene.add(flower.mesh);
    flowers.push(flower)
  }

  const loop = () => {
    requestAnimationFrame(loop);
    sea.moveWaves();
    checkPosition();
    if (tagOnPlayField[3]) {
      pion.mesh.position.x = mapValue(
        tagOnPlayField[3],
        0,
        1,
        WIDTH / 2,
        -WIDTH / 2
      );
      pion.mesh.position.z = mapValue(
        tagOnPlayField[4],
        0,
        1,
        -HEIGHT / 2,
        HEIGHT / 2
      );
      pion.moveAnimation();
    }

    renderer.render(scene, camera);

    checkRainStates();
    dryAll();
  };

  const threeInit = () => {
    createScene();
    setCamera();
    createLights();
    createIsland();
    createSea();
    createFlower(- 120, - 80, `topLeft1`, `topLeft`);
    createFlower(- 180, - 40, `topLeft2`, `topLeft`);
    createFlower(- 170, 40, `botLeft1`, `botLeft`);
    createFlower(- 110, 50, `botLeft2`, `botLeft`);
    createFlower(-20, 40, `botMid1`, `botMid`);
    createFlower(40, 80, `botMid2`, `botMid`);
    createFlower(-40, - 30, `topMid1`, `topMid`);
    createFlower(30, - 65, `topMid2`, `toMid`);
    createFlower(180, - 30, `topRight1`, `topRight`);
    createFlower(130, - 65, `topRight2`, `topRight`);
    createFlower(180, 30, `botRight1`, `botRight`);
    createFlower(110, 50, `botRight2`, `botRight`);
    //console.log(flowers);
    

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
    if (pion) {
      if (
        pion.mesh.position.x != lastPosX ||
        pion.mesh.position.z != lastPosY
      ) {
        onSphereMove();
      }
      lastPosX = pion.mesh.position.x;
      lastPosY = pion.mesh.position.z;
    }
  };
  
  const addTags = currentTag => {
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
    // console.log(aliveTags);
    // console.log(pion);

    if (!checkTag[0]) {
      //console.log("hallo");

      return;
    }
    if (!aliveTags.includes(checkTag[1])) {
      deleteTags(checkTag[2]);
      //console.log(checkTag);

      scene.remove(pion.mesh);
      tagOnPlayField = [];
      pion = undefined;
      checkTag = [];
    }
  };

  const fireOnField = () => {
    pion = new AnimationPion();

    pion.mesh.position.x = mapValue(
      tagOnPlayField[3],
      0,
      1,
      WIDTH / 2,
      -WIDTH / 2
    );
    pion.mesh.position.z = mapValue(
      tagOnPlayField[4],
      0,
      1,
      -HEIGHT / 2,
      HEIGHT / 2
    );

    scene.add(pion.mesh);
  };

  const waterOnField = waterTag => {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xbada55 });
    sphere = new THREE.Mesh(geometry, material);

    sphere.position.x = mapValue(waterTag[3], 0, 1, WIDTH / 2, -WIDTH / 2);
    sphere.position.z = mapValue(waterTag[4], 0, 1, -HEIGHT / 2, HEIGHT / 2);

    scene.add(sphere);
  };

  const mapValue = (value, istart, istop, ostart, ostop) =>
    ostart + (ostop - ostart) * ((value - istart) / (istop - istart));

  const deleteTags = tagToDelete => {
    let index = currentTags.indexOf(tagToDelete);
    if (index > -1) {
      currentTags.splice(index, 1);
    }
  };

  const checkRainStates = () => {
    
    for (let i = 0; i < rainItems.length; i++) {
      const item = islandPieces.find(o => o[rainItems[i]]);

      islandBiomes.mesh.children.forEach(c => {
        if (c.name === rainItems[i]) {
          makeItRain(item[rainItems[i]], c.children[0]);
          return;
        }
        
      });      
    }
  };

  const makeItRain = (rainObjItem, rainModel) => {

    
    if (rainObjItem.rain >= 100) {
      return
    } else {
      rainObjItem.rain += .4;
    

    rainModel.material.opacity = rainObjItem.rain / 100;    
  
    };
  }

  const dryAll = () => {

    for (let p in islandPieces[0]) {
      const piece = islandPieces[0][p];
      
      if (piece.rain > 0) {
        piece.rain -= .05;        
      }

      islandBiomes.mesh.children.forEach(c => {
        if (c.children[0]) {
          if (c.name === piece.name) {
                      
          c.children[0].material.opacity = piece.rain / 100;
          console.log(c.children[0].material.opacity );
          
        
          return;   
          }
        }    
      });

      
    }

    // islandBiomes.mesh.children.forEach(c => {
    //   if (c.children[0]) {
    //     // console.log(c.name);
        
    //     console.log(c.children[0].material.opacity);
      
    //     return;         
    //   }    
    // });

  }

  const onSphereMove = () => {
    mouseVector.x = -tagOnPlayField[3] * 4 + 2;
    mouseVector.y = -tagOnPlayField[4] * 4 + 2;

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
        let currentBiome = intersects[i].object.parent.name;
        
        if (currentBiome != lastBiome) {

          for (let i = 0; i < rainItems.length; i++) {
            if (rainItems[i] === lastBiome) {
              rainItems.splice(i, 1);
            };
            
          }

          if (!rainItems.includes(intersects[i].object.parent.name)) {
            rainItems.push(intersects[i].object.parent.name)
          }
  
        };

        // const item = islandPieces.find(o => o[intersects[i].object.parent.name]);
        // console.log(item[intersects[i].object.parent.name]);
        
        //updateBiome(intersects[i].object, item[intersects[i].object.parent.name])

        lastBiome = currentBiome;
        break;
      }
    }
  };

  init();
}

{
  const osc = require("osc");

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
    rayCaster0,
    rayCaster1,
    rayCaster2,
    rayCaster3,
    mouseVector0,
    mouseVector1,
    mouseVector2,
    mouseVector3,
    intersects1,
    intersects2,
    intersects3,
    intersects0,
    currentBiome0,
    currentBiome1,
    currentBiome2,
    currentBiome3,
    lastPosX,
    lastPosY,
    sunPion1,
    sunPion2,
    rainPion1,
    rainPion2,
    flower,
    lastBiome0,
    lastBiome1,
    lastBiome2,
    lastBiome3,
    pion;
  
  let checkTag = [];
  let idTags = [];
  let currentTags = [];

  let flowers = [];
  let rainBiomes = [];

  let tagOnPlayField = [];

  const prevRainItems = [];
  const rainItems = [];
  const sunItems = [];

  const islandPieces = [
    {
      topLeft: {
        name: `topLeft`,
        rain: 0,
        sun: 0
      },
      botLeft: {
        name: `botLeft`,
        rain: 0,
        sun: 0
      },
      topMid: {
        name: `topMid`,
        rain: 0,
        sun: 0
      },
      botMid: {
        name: `botMid`,
        rain: 0,
        sun: 0
      },
      topRight: {
        name: `topRight`,
        rain: 0,
        sun: 0
      },
      botRight: {
        name: `botRight`,
        rain: 0,
        sun: 0
      }
    }
  ];

  let island, islandHeight, islandBiomes, islandDepth, dist, sea;

  const init = () => {
    udpPort.open();
    rayCaster1 = new THREE.Raycaster();
    rayCaster2 = new THREE.Raycaster();
    rayCaster3 = new THREE.Raycaster();
    rayCaster0 = new THREE.Raycaster();
    mouseVector0 = new THREE.Vector3();
    mouseVector1 = new THREE.Vector3();
    mouseVector2 = new THREE.Vector3();
    mouseVector3 = new THREE.Vector3();
    threeInit();
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
    flowers.push(flower);
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

    checkRainStates();
    dryAll();

    checkSunStates();
    shrinkFlower();
  };

  const threeInit = () => {
    createScene();
    setCamera();
    createLights();
    createIsland();
    createSea();
    createFlower(-120, -80, `topLeft1`, `topLeft`);
    createFlower(-180, -40, `topLeft2`, `topLeft`);
    createFlower(-170, 40, `botLeft1`, `botLeft`);
    createFlower(-110, 50, `botLeft2`, `botLeft`);
    createFlower(-20, 40, `botMid1`, `botMid`);
    createFlower(40, 80, `botMid2`, `botMid`);
    createFlower(-40, -30, `topMid1`, `topMid`);
    createFlower(30, -65, `topMid2`, `toMid`);
    createFlower(180, -30, `topRight1`, `topRight`);
    createFlower(130, -65, `topRight2`, `topRight`);
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
    if (sunPion1) {
      if (
        sunPion1.mesh.position.x != lastPosX ||
        sunPion1.mesh.position.z != lastPosY
      ) {
        onSphereMove();
      }
      lastPosX = sunPion1.mesh.position.x;
      lastPosY = sunPion1.mesh.position.z;
    };
    if (sunPion2) {
      if (
        sunPion2.mesh.position.x != lastPosX ||
        sunPion2.mesh.position.z != lastPosY
      ) {
        onSphereMove();
      }
      lastPosX = sunPion2.mesh.position.x;
      lastPosY = sunPion2.mesh.position.z;
    };
    if (rainPion1) {
      if (
        rainPion1.mesh.position.x != lastPosX ||
        rainPion1.mesh.position.z != lastPosY
      ) {
        onSphereMove();
      }
      lastPosX = rainPion1.mesh.position.x;
      lastPosY = rainPion1.mesh.position.z;
    }
    if (rainPion2) {
      if (
        rainPion2.mesh.position.x != lastPosX ||
        rainPion2.mesh.position.z != lastPosY
      ) {
        onSphereMove();
      }
      lastPosX = rainPion2.mesh.position.x;
      lastPosY = rainPion2.mesh.position.z;
    }
  };

  const addTags = currentTag => {
    checkTag = currentTag;
    if (!idTags.includes(checkTag[2])) {
      idTags.push(checkTag[2]);
      currentTags.push(checkTag);
      
      currentTags.forEach(t => {
        console.log(t);
      });
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

          deleteTagsFromArray(checkTag, currentTags);

          deleteId(checkTag[2], idTags);
          scene.remove(Tag[Tag.length - 1].mesh);

          checkTag = [];
        }
      });
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
      checkTag.push(sunPion1);
      scene.add(sunPion1.mesh);
    } else {
      sunPion2 = pion;
      checkTag.push(sunPion2);
      scene.add(sunPion2.mesh);
    }
  };

  const waterOnField = tagToShow => {
    //console.log(tagToShow);

    pion = new AnimationPion();

    pion.mesh.position.x = mapValue(tagToShow[3], 0, 1, WIDTH / 2, -WIDTH / 2);
    pion.mesh.position.z = mapValue(
      tagToShow[4],
      0,
      1,
      -HEIGHT / 2,
      HEIGHT / 2
    );

    if (tagToShow[2] === 2) {
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



  const deleteTagsFromArray = (tagToDelete, arrayToDeleteFrom) => {
    for (let i = 0; i < arrayToDeleteFrom.length; i++) {
      if (
        arrayToDeleteFrom[i][0] == tagToDelete[0] &&
        arrayToDeleteFrom[i][1] == tagToDelete[1] &&
        arrayToDeleteFrom[i][2] == tagToDelete[2]
      ) {
        arrayToDeleteFrom.splice(i, 1);
        checkTag[checkTag.length - 1] = undefined;
      }
    }
  };

  const deleteId = (idToDelete, arrayToDeleteFrom) => {
    let index = arrayToDeleteFrom.indexOf(idToDelete);
    arrayToDeleteFrom.splice(index, 1);
    console.log(idToDelete);
    
    switch (idToDelete) {
      case 0:        
      console.log(intersects0[0].object.parent.name);
      for (let i = 0; i < sunItems.length; i++) {
        if (sunItems[i] === intersects0[0].object.parent.name) {
          sunItems.splice(i, 1);
        }
      }
      
      intersects0 = [];           break;
    
      case 1:
      console.log(intersects1[0].object.parent.name);
      for (let i = 0; i < sunItems.length; i++) {
        if (sunItems[i] === intersects1[0].object.parent.name) {
          sunItems.splice(i, 1);
        }
      }
      
      intersects1 = [];        
      
        break;
    
      case 2:

        console.log(intersects2[0].object.parent.name);
        for (let i = 0; i < rainItems.length; i++) {
          if (rainItems[i] === intersects2[0].object.parent.name) {
            rainItems.splice(i, 1);
          }
        }
        
        intersects2 = [];        
        
        break;
    
      case 3:

        console.log(intersects3[0].object.parent.name);
        for (let i = 0; i < rainItems.length; i++) {
          if (rainItems[i] === intersects3[0].object.parent.name) {
            rainItems.splice(i, 1);
          }
        }
        
        intersects3 = [];        
        
        break;
    
      default:
        break;
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
      return;
    } else {
      rainObjItem.rain += 0.4;

      rainModel.material.opacity = rainObjItem.rain / 100;
    }
  };

  const dryAll = () => {
    for (let p in islandPieces[0]) {
      const piece = islandPieces[0][p];

      if (piece.rain > 0) {
        piece.rain -= 0.05;
      }

      islandBiomes.mesh.children.forEach(c => {
        if (c.children[0]) {
          if (c.name === piece.name) {
            c.children[0].material.opacity = piece.rain / 100;

            return;
          }
        }
      });
    }
  };

  const checkSunStates = () => {
    for (let i = 0; i < sunItems.length; i++) {
      const item = islandPieces.find(o => o[sunItems[i]]);

      islandBiomes.mesh.children.forEach(c => {
        if (c.name === sunItems[i]) {
          makeSunShine(item[sunItems[i]], c.children[0]);
          return;
        }
      });
    }
  }

  const makeSunShine = (sunObjItem) => {
    for (let i = 0; i < flowers.length; i++) {
      const element = flowers[i];
      if (element.mesh.userData.parentName === sunObjItem.name) {
        if (sunObjItem.sun >= 70) {
          return;
        } else {
          sunObjItem.sun += 0.1;
          
          
          element.mesh.scale.set(sunObjItem.sun / 1000, sunObjItem.sun / 1000, sunObjItem.sun / 1000);
        }       
      }
      
    }
    
  }

  const shrinkFlower = () => {
    for (let p in islandPieces[0]) {
      const piece = islandPieces[0][p];

      if (piece.sun > 0) {
        piece.sun -= 0.05;
        
      }

      flowers.forEach(f => {
        if (f.mesh.userData.parentName === piece.name) {
          f.mesh.scale.set(piece.sun / 1000, piece.sun / 1000, piece.sun / 1000)
          
        }
      });
  }
}

  const onSphereMove = () => {    

    currentTags.forEach(t => {      

      switch (t[2]) {
        case 0:        
        mouseVector0.x = -checkTag[3] * 4 + 2;
        mouseVector0.y = -checkTag[4] * 4 + 2;
        rayCaster0.setFromCamera(mouseVector0, camera);
        intersects0 = rayCaster0.intersectObjects(islandBiomes.mesh.children, true);
        if (intersects0.length !== 0) {
          detailEvent(`0`);
        } else {
          return;
        }
          break;

        case 1:
        mouseVector1.x = -checkTag[3] * 4 + 2;
        mouseVector1.y = -checkTag[4] * 4 + 2;
        rayCaster1.setFromCamera(mouseVector1, camera);
        intersects1 = rayCaster1.intersectObjects(islandBiomes.mesh.children, true);
    
        if (intersects1.length !== 0) {
          detailEvent(`1`);
        } else {
          return;
        }
          break;


        case 2:
        mouseVector2.x = -checkTag[3] * 4 + 2;
        mouseVector2.y = -checkTag[4] * 4 + 2;
        rayCaster2.setFromCamera(mouseVector2, camera);
        intersects2 = rayCaster2.intersectObjects(islandBiomes.mesh.children, true);
    
        if (intersects2.length !== 0) {
          detailEvent(`2`);
        } else {
          return;
        }
          break;

        case 3:
        mouseVector3.x = -checkTag[3] * 4 + 2;
        mouseVector3.y = -checkTag[4] * 4 + 2;
        rayCaster3.setFromCamera(mouseVector3, camera);
        intersects3 = rayCaster3.intersectObjects(islandBiomes.mesh.children, true);
    
        if (intersects3.length !== 0) {
          detailEvent(`3`);
        } else {
          return;
        }
          break;
      
        default:
          break;
      }
      
    })
  };

  const detailEvent = state => {
   
    switch (state) {
      case `0` :
      for (let i = 0; i < intersects0.length; i++) {
        if (intersects0[i].object.name === `biome`) {
          currentBiome0 = intersects0[i].object.parent.name;

        if (currentBiome0 != lastBiome0) {
          for (let i = 0; i < sunItems.length; i++) {
            if (sunItems[i] === lastBiome0) {
              sunItems.splice(i, 1);
            }
          }

          if (!sunItems.includes(intersects0[i].object.parent.name)) {
            sunItems.push(intersects0[i].object.parent.name);
          }
        }

        lastBiome0 = currentBiome0;


        }
        
      }      
      break;

      case `1` :
      for (let i = 0; i < intersects1.length; i++) {
        if (intersects1[i].object.name === `biome`) {
          let currentBiome1 = intersects1[i].object.parent.name;

        if (currentBiome1 != lastBiome1) {
          for (let i = 0; i < sunItems.length; i++) {
            if (sunItems[i] === lastBiome1) {
              sunItems.splice(i, 1);
            }
          }

          if (!sunItems.includes(intersects1[i].object.parent.name)) {
            sunItems.push(intersects1[i].object.parent.name);
          }
        }

        lastBiome1 = currentBiome1;


        }
        
      }
    
      break;

      case `2`:
      
        for (let i = 0; i < intersects2.length; i++) {
          if (intersects2[i].object.name === `biome`) {
            let currentBiome2 = intersects2[i].object.parent.name;
                        
    
            if (currentBiome2 != lastBiome2) {
              for (let i = 0; i < rainItems.length; i++) {
                if (rainItems[i] === lastBiome2) {
                  rainItems.splice(i, 1);
                }
              }
    
              if (!rainItems.includes(intersects2[i].object.parent.name)) {
                rainItems.push(intersects2[i].object.parent.name);
              }
            }    
            lastBiome2 = currentBiome2;
          }
        }
          break;

      case `3`:
      
        for (let i = 0; i < intersects3.length; i++) {
          if (intersects3[i].object.name === `biome`) {
            let currentBiome3 = intersects3[i].object.parent.name;
                        
    
            if (currentBiome3 != lastBiome3) {
              for (let i = 0; i < rainItems.length; i++) {
                if (rainItems[i] === lastBiome) {
                  rainItems.splice(i, 1);
                }
              }
    
              if (!rainItems.includes(intersects3[i].object.parent.name)) {
                rainItems.push(intersects3[i].object.parent.name);
              }
            }
        
            lastBiome3 = currentBiome3;
          }
        }
          break;
      default:
        break;
    }

  };

  init();
}

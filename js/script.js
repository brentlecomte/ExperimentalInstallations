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
    rayCasters = [],
    rayCaster0,
    rayCaster1,
    rayCaster2,
    rayCaster3,
    mouseVectors = [],
    mouseVector0,
    mouseVector1,
    mouseVector2,
    mouseVector3,
    intersects1 = [],
    intersects2 = [],
    intersects3 = [],
    intersects0 = [],
    intersects = [],
    rainVals = [],
    currentBiome0,
    currentBiome1,
    currentBiome2,
    currentBiome3,
    currentBiomes = [],
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
    lastBiomes = [],
    //pion1,
    //pion2;
    pion,
    calpoint1,
    calpoint2,
    sphere1,
    sphere2;
  let calibrated = false;

  let checkTag = [];
  let idTags = [];
  let currentTags = [];
  let calibrateTags = [];

  let flowers = [];
  let rainBiomes = [];

  let tagOnPlayField = [];

  const prevRainItems = [];
  const rainItems = [];
  const sunItems = [];

  const islandPieces = [
    
      {
        name: `topLeft`,
        rain: 0,
        sun: 0
      },
      {
        name: `botLeft`,
        rain: 0,
        sun: 0
      },
      {
        name: `topMid`,
        rain: 0,
        sun: 0
      },
      {
        name: `botMid`,
        rain: 0,
        sun: 0
      },
      {
        name: `topRight`,
        rain: 0,
        sun: 0
      },
      {
        name: `botRight`,
        rain: 0,
        sun: 0
      }
    
  ];

  let island, islandHeight, islandBiomes, islandDepth, dist, sea;

  const init = () => {
    udpPort.open();

    rayCasters.push(rayCaster0, rayCaster1, rayCaster2, rayCaster3);
    for (let r = 0; r < rayCasters.length; r++) {
      rayCasters[r] = new THREE.Raycaster();
      
    };

    mouseVectors.push(mouseVector0, mouseVector1, mouseVector2, mouseVector3);
    for (let m = 0; m < mouseVectors.length; m++) {
      mouseVectors[m] = new THREE.Vector3();
    }

    console.log(mouseVectors);
    
    threeInit();
  };

  const createScene = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    console.log(WIDTH, HEIGHT);

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
    // camera.aspect = WIDTH / HEIGHT;

    //new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, near, far );
    camera.left = WIDTH / -2;
    camera.right = WIDTH / 2;
    camera.top = HEIGHT / 2;
    camera.bottom = HEIGHT / -2;

    camera.updateProjectionMatrix();
  };

  setCamera = () => {
    islandHeight = 100;
    dist = 140;

    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    near = 1;
    far = 10000;
    // camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
    camera = new THREE.OrthographicCamera(
      WIDTH / -2,
      WIDTH / 2,
      HEIGHT / 2,
      HEIGHT / -2,
      near,
      far
    );

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

    island.mesh.scale.set(3.8, 1, 3.8);

    scene.add(island.mesh);

    island.mesh.position.y = -20;
    islandBiomes = new IslandBiomes();
    islandBiomes.mesh.scale.set(3.8, 1, 3.8);

    scene.add(islandBiomes.mesh);
    
    console.log(islandBiomes.mesh.children);
    islandBiomes.mesh.position.y = -20;
  };

  const createSea = () => {
    sea = new Sea();
    sea.mesh.position.y = -94;
    scene.add(sea.mesh);
  };

  const createFlower = (x, z, name, parent) => {
    flower = new Flower(name, parent);

    flower.mesh.scale.set(0.001, 0.001, 0.001);
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

    if (!calpoint1 && calibrateTags.length === 2) {
      let i = 0;
      calibrateTags.forEach(Tag => {
        if (i === 0) {
          calpoint1 = Tag[3];
          i++;
        } else {
          calpoint2 = Tag[3];
        }
      });

      calibrated = true;
      scene.remove(sphere1);
      scene.remove(sphere2);
    }

    currentTags.forEach(Tag => {

      console.log(currentTags);

      if (Tag[3] && calibrated === true && Tag.length === 12) {
        Tag[Tag.length - 1].mesh.position.x = mapValue(
          Tag[3],
          calpoint1,
          calpoint2,
          360,
          -360
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

      //console.log(Tag);
      

      if (Tag.zone && Tag.zone[0]) {
        //console.log(Tag[2]);
        if (Tag[2] >= 2) {
          makeSunshine(Tag.zone[0].object)
        } else {
          makeItRain(Tag.zone[0].object);
        }
      }

      
    
      
      
      // Tag.zone
      // Tag type?
      //    > rain: makeItRain(tag.zone)
      //    > sun: makeItShine(tag.zone)



      
    });

    renderer.render(scene, camera);

    //checkRainStates();
    dryAll();

    //ƒcheckSunStates();
    shrinkFlower();
  };

  const threeInit = () => {
    createScene();
    setCamera();
    createLights();
    createIsland();
    createSea();

    createFlower(-320, -250, `topLeft1`, `topLeft`);
    createFlower(-400, -140, `topLeft2`, `topLeft`);
    createFlower(-425, 100, `botLeft1`, `botLeft`);
    createFlower(-280, 125, `botLeft2`, `botLeft`);
    createFlower(-50, 100, `botMid1`, `botMid`);
    createFlower(100, 200, `botMid2`, `botMid`);
    createFlower(-100, -75, `topMid1`, `topMid`);
    createFlower(75, -165, `topMid2`, `topMid`);
    createFlower(450, -75, `topRight1`, `topRight`);
    createFlower(325, -165, `topRight2`, `topRight`);
    createFlower(450, 75, `botRight1`, `botRight`);
    createFlower(275, 125, `botRight2`, `botRight`);

    intersects.push(intersects0, intersects1, intersects2, intersects3); 
    currentBiomes.push(currentBiome0, currentBiome1, currentBiome2, currentBiome3);   
    lastBiomes.push(lastBiome0, lastBiome1, lastBiome2, lastBiome3);   

    
    loop();
  };

  const calibration = () => {
    const geometry1 = new THREE.SphereGeometry(5, 32, 32);
    const material1 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sphere1 = new THREE.Mesh(geometry1, material1);
    sphere1.position.set(360, 0, 0);

    const geometry2 = new THREE.SphereGeometry(5, 32, 32);
    const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sphere2 = new THREE.Mesh(geometry2, material2);
    sphere2.position.set(-360, 0, 0);
    scene.add(sphere1);
    scene.add(sphere2);
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
        onSphereMove(0);
      }
      lastPosX = sunPion1.mesh.position.x;
      lastPosY = sunPion1.mesh.position.z;
    }
    if (sunPion2) {
      if (
        sunPion2.mesh.position.x != lastPosX ||
        sunPion2.mesh.position.z != lastPosY
      ) {
        onSphereMove(1);
      }
      lastPosX = sunPion2.mesh.position.x;
      lastPosY = sunPion2.mesh.position.z;
    };
    if (!rainPion1 == ``) {

      if (
        rainPion1.mesh.position.x != lastPosX ||
        rainPion1.mesh.position.z != lastPosY
      ) {
        onSphereMove(2);
      }
      lastPosX = rainPion1.mesh.position.x;
      lastPosY = rainPion1.mesh.position.z;
    }
    if (rainPion2) {
      if (
        rainPion2.mesh.position.x != lastPosX ||
        rainPion2.mesh.position.z != lastPosY
      ) {
        onSphereMove(3);
      }
      lastPosX = rainPion2.mesh.position.x;
      lastPosY = rainPion2.mesh.position.z;
    }
  };

  const addTags = currentTag => {
    checkTag = currentTag;

    if (calibrated === false && !idTags.includes(checkTag[2])) {
      idTags.push(checkTag[2]);
      calibrateTags.push(checkTag);
    } else {
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
    pion1 = new AnimationPion();

    pion1.mesh.position.x = mapValue(tagToShow[3], 0, 1, WIDTH / 2, -WIDTH / 2);
    pion1.mesh.position.z = mapValue(
      tagToShow[4],
      0,
      1,
      -HEIGHT / 2,
      HEIGHT / 2
    );

    if (tagToShow[2] === 0) {
      sunPion1 = pion1;
      checkTag.push(sunPion1);
      scene.add(sunPion1.mesh);
    } else {
      sunPion2 = pion1;
      checkTag.push(sunPion2);
      scene.add(sunPion2.mesh);
    }
  };

  const waterOnField = tagToShow => {
    //console.log(tagToShow);

    pion2 = new AnimationPion();

    pion2.mesh.position.x = mapValue(tagToShow[3], 0, 1, WIDTH / 2, -WIDTH / 2);
    pion2.mesh.position.z = mapValue(
      tagToShow[4],
      0,
      1,
      -HEIGHT / 2,
      HEIGHT / 2
    );

    if (tagToShow[2] === 2) {
      rainPion1 = pion2;
      //tagToShow.push(rainPion1);
      checkTag.push(rainPion1);
      scene.add(rainPion1.mesh);
    } else {
      rainPion2 = pion2;
      //tagToShow.push(rainPion2);
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

    if (idToDelete <= 1) {
      for (let i = 0; i < intersects.length; i++) {
        console.log(intersects[i]);
        if (intersects[idToDelete][0] != null) {
          console.log(`gotta Delete`);
          
          const indexToSplice = sunItems.indexOf(intersects[idToDelete][0].object.parent.name);
          if (indexToSplice > -1) {
            sunItems.splice(indexToSplice, 1);
          }

          // console.log(intersects[idToDelete][0].object.parent.name);
        } else {
          console.log(`dont delete`);
          
        }
      }
    
      
    }    
  };

  // const checkRainStates = () => {
  //   for (let i = 0; i < rainItems.length; i++) {
  //     const item = islandPieces.find(o => o[rainItems[i]]);

  //     islandBiomes.mesh.children.forEach(c => {
  //       if (c.name === rainItems[i]) {
  //         makeItRain(item[rainItems[i]], c.children[0]);
  //         return;
  //       }
  //     });
  //   }
  // };

  // const makeItRain = (rainObjItem, rainModel) => {
  //   if (rainObjItem.rain >= 100) {
  //     return;
  //   } else {
  //     rainObjItem.rain += 0.4;

  //     rainModel.material.opacity = rainObjItem.rain / 100;
  //   }
  // };
  
  const makeItRain = (z) => {
    
    // console.log(`rain`);
    
    if (z.material.opacity < 1) {
      z.material.opacity += .008;      

    }
  };

  const dryAll = () => {
    // islandBiomes.forEach(b => {
    //   console.log(b);
      
    // })

    islandBiomes.mesh.children.forEach(b => {
      
      if(b.children[0] != null){;        
        if (b.children[0].material.opacity >= 0) {
    
          b.children[0].material.opacity -= .0006;
        }
      }
      
      
    })
    
  };

  // const checkSunStates = () => {
  //   for (let i = 0; i < sunItems.length; i++) {
  //     const item = islandPieces.find(o => o[sunItems[i]]);
      
  //     // console.log(item[sunItems[i]]);
      

  //     islandBiomes.mesh.children.forEach(c => {
  //       if (c.name === sunItems[i]) {
  //         makeSunShine(item[sunItems[i]], c.children[0]);
  //         return;
  //       }
  //     });
  //   }
  // }

  // const makeSunShine = (sunObjItem) => {
  //   for (let i = 0; i < flowers.length; i++) {
  //     const element = flowers[i];
  //     if (element.mesh.userData.parentName === sunObjItem.name) {
  //       if (sunObjItem.sun >= 25) {
  //         return;
  //       } else {
  //         sunObjItem.sun += 0.03;

          
          
  //         element.mesh.scale.set(sunObjItem.sun / 100, sunObjItem.sun / 100, sunObjItem.sun / 100);
  //       }       
  //     }
      
  //   }
    
  // }
  const makeSunshine = e => {

    // console.log(e.parent.name);
    
    for (let i = 0; i < flowers.length; i++) {
      const flower = flowers[i];
      if (flower.mesh.userData.parentName === e.parent.name) {
        // console.log(flower.mesh);
        let targetScale = flower.mesh.scale;

        if (targetScale.x <= .16) {
          targetScale.x += .002;          
        }
        
        flower.mesh.scale.set(targetScale.x, targetScale.x, targetScale.x) 
        
      }

    }
  };

  const shrinkFlower = () => {
    for (let p in islandPieces[0]) {
      const piece = islandPieces[0][p];

      if (piece.sun > 0) {

        piece.sun -= 0.01;
        
      }

      flowers.forEach(f => {
        if (f.mesh.userData.parentName === piece.name) {

          let targetScale = Math.max(0.001, piece.sun / 100);
          f.mesh.scale.set(targetScale, targetScale, targetScale)
          
        }
      });
  }
}

  const onSphereMove = n => {    

    currentTags.forEach(t => { 
      
      if (n = t[2]) {
        mouseVectors[n].x = -checkTag[3] * 4 + 2;
        mouseVectors[n].y = -checkTag[4] * 4 + 2;       
        rayCasters[n].setFromCamera(mouseVectors[n], camera);

        intersects[n] = rayCasters[n].intersectObjects(islandBiomes.mesh.children, true);


        t.zone = intersects[n];
        
        
        //
        // t.zone = 3; //
        //
        
        
        if (intersects[n].length !== 0) {
            detailEvent(n);
        } else {
          return;
        }
      }
            
    })
    
  };

  const detailEvent = n => {

  
    if (n <= 1) {
      if (intersects[n][0].object.name === `biome`) {
               currentBiomes[n] = intersects[n][0].object.parent.name;    
     
            if (currentBiomes[n] != lastBiomes[n]) {
              const indexToSplice = sunItems.indexOf(lastBiomes[n]);
              if (indexToSplice > -1) {
                sunItems.splice(indexToSplice, 1);
              }
              
    
              if (!sunItems.includes(intersects[n][0].object.parent.name)) {
                sunItems.push(intersects[n][0].object.parent.name);
              }
            }        
            
            lastBiomes[n] = currentBiomes[n];
          }
    } else {
      if (intersects[n][0]) {
            if (intersects[n][0].object.name === `biome`) {
              currentBiomes[n] = intersects[n][0].object.parent.name;            
        
              if (currentBiomes[n] != lastBiomes[n]) {
                const indexToSplice = rainItems.indexOf(lastBiomes[n]);
                if (indexToSplice > -1) {
                  rainItems.splice(indexToSplice, 1);
                }
        
                if (!rainItems.includes(intersects[n][0].object.parent.name)) {
                  rainItems.push(intersects[n][0].object.parent.name);
                }
              }    
              
               lastBiomes[n] = currentBiomes[n];
              }            
          }
      
    }

    // console.log(rainItems);
    // console.log(sunItems);
                
  

  };

  init();
}

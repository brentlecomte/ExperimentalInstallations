const Colors = require('../objects/Colors.js');


class IslandBiome {
    constructor(piece) {
        this.mesh = new THREE.Object3D();
        const material = new THREE.MeshPhongMaterial({
          color: 0x14a311,
          flatShading: true,
          transparent: true,
          opacity: 0
          
        });


    
        const loader = new THREE.JSONLoader();
        loader.load(`./assets/objects/${piece}.json`, geometry => {

        
          geometry.computeVertexNormals();
          console.log(geometry);
          
          

          const object = new THREE.Mesh(geometry, material);
          
          
    
          this.mesh.add(object);
        });
    }
}

module.exports = IslandBiome;
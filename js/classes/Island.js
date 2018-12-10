const Colors = require('../objects/Colors.js');


class Island {
    constructor() {
        this.mesh = new THREE.Object3D();
        const material = new THREE.MeshPhongMaterial({
          color: 0xeaaa3c,
          flatShading: true
        });


    
        const loader = new THREE.JSONLoader();
        loader.load(`./assets/objects/island.json`, geometry => {

        
          geometry.computeVertexNormals();
          console.log(geometry);
          
          

          const object = new THREE.Mesh(geometry, material);
          
          
    
          this.mesh.add(object);
        });
    }
}

module.exports = Island;
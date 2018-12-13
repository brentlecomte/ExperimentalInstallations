const Colors = require("../objects/Colors.js");

class Island {
  constructor() {
    this.mesh = new THREE.Object3D();
    const material = new THREE.MeshPhongMaterial({
      color: 0xeaaa3c,
      // flatShading: true,
      side: THREE.DoubleSide
    });

    const loader = new THREE.JSONLoader();
    loader.load(`./assets/objects/island.json`, geometry => {
      geometry.computeVertexNormals();
      
      const object = new THREE.Mesh(geometry, material);
      var bbox = new THREE.Box3().setFromObject(object);
      console.log((bbox.max.x - bbox.min.x)*5);
      console.log((bbox.max.z - bbox.min.z)*5);
      this.mesh.add(object);
    });
  }
}

module.exports = Island;

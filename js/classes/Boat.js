const Colors = require("../objects/Colors.js");

class Boat {
  constructor() {
    this.mesh = new THREE.Object3D();
    const material = new THREE.MeshPhongMaterial({
      color: 0xeaaa3c,
      // flatShading: true,
      side: THREE.DoubleSide
    });

    const loader = new THREE.ObjectLoader();
    loader.load(`./assets/objects/boat.json`, geometry => {
      const object = new THREE.Mesh(geometry, material);
      this.mesh.add(object);
    });
  }
}

module.exports = Boat;

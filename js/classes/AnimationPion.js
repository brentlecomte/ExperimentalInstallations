const Colors = require("../objects/Colors.js");

class AnimationPion {
  constructor() {
    const geom = new THREE.RingGeometry(24, 26, 40);
    const mat = new THREE.MeshPhongMaterial({
      color: Colors.blue,
      flatShading: true
    });

    geom.mergeVertices();

    this.moves = [];

    geom.vertices.forEach(vertex => {
      this.moves.push({
        x: vertex.x,
        y: vertex.y,
        z: vertex.z,
        ang: Math.random() * Math.PI * 2,
        amp: 3 + Math.random() * 2,
        speed: 0.003 + Math.random() * 0.029
      });
    });

    this.mesh = new THREE.Mesh(geom, mat);

    this.mesh.position.y = 0;
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.receiveShadows = true;
    this.mesh.name = "animation";
  }

  moveAnimation() {
    this.mesh.geometry.vertices.forEach((vertex, index) => {
      const move = this.moves[index];

      // vertex.x = wave.x + Math.cos(wave.ang) * wave.amp;
      vertex.y = move.y + Math.sin(move.ang) * move.amp;

      move.ang += move.speed;
    });
    this.mesh.geometry.verticesNeedUpdate = true;

    this.circleGeom = new THREE.RingGeometry(12, 15, 32);
    this.circleMat = new THREE.MeshPhongMaterial({
      color: Colors.blue
    });
    this.circle = new THREE.Mesh(this.circleGeom, this.circleMat);
  }
}

module.exports = AnimationPion;

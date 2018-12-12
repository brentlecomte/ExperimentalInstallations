class Flower {
  constructor() {
    this.mesh = new THREE.Object3D();
    
    const stuifmeelMaterial = new THREE.MeshPhongMaterial({
        color: 0xD7C76E,
      });
  
      const stuifmeelLoader = new THREE.JSONLoader();
      stuifmeelLoader.load(`./assets/objects/bloem/stuifmeel.json`, geometry => {
        geometry.computeVertexNormals();
        const stuifmeel = new THREE.Mesh(geometry, stuifmeelMaterial);
        stuifmeel.position.y = -40;
        this.mesh.add(stuifmeel);
      });

    const blaadjesMaterial = new THREE.MeshPhongMaterial({
        color: 0xEDEDED,
      });
  
      const blaadjesLoader = new THREE.JSONLoader();
      blaadjesLoader.load(`./assets/objects/bloem/blaadjes.json`, geometry => {
        geometry.computeVertexNormals();
        const blaadjes = new THREE.Mesh(geometry, blaadjesMaterial);
        this.mesh.add(blaadjes);
      });
    
    const steelMaterial = new THREE.MeshPhongMaterial({
      color: 0x14a311,
    });

    const steelLoader = new THREE.JSONLoader();
    steelLoader.load(`./assets/objects/bloem/steel.json`, geometry => {
      geometry.computeVertexNormals();
      const steel = new THREE.Mesh(geometry, steelMaterial);
      this.mesh.add(steel);
    });
  }
}

module.exports = Flower;

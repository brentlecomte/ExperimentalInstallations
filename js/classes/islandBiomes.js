const Colors = require('../objects/Colors.js');
const IslandBiome = require("./IslandBiome.js");

class IslandBiomes {  
    constructor() {
      const islandPieces = [`topLeft`, `botLeft`, `topRight`, `botRight`, `topMid`, `botMid`]
      this.mesh = new THREE.Object3D();

      islandPieces.forEach(b => {
        const biome = new IslandBiome(b);
        this.mesh.add(biome.mesh);
      });
    }
}

module.exports = IslandBiomes;
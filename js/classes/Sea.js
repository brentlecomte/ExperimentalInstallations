const Colors = require('../objects/Colors.js');


class Sea {
    constructor() {
        const geom = new THREE.BoxGeometry(2000, 100, 2000, 40, 10, 40);
        geom.mergeVertices();
    
        this.waves = [];
    
        geom.vertices.forEach(vertex => {
            this.waves.push({
                x: vertex.x,
                y: vertex.y,
                z: vertex.z,
                ang: Math.random()*Math.PI*2,
                amp: 2 + Math.random()*1,
                speed: 0.006 + Math.random()*0.032
            });
        })
    
        const mat = new THREE.MeshPhongMaterial({
          color:Colors.blue,
          transparent:true,
          opacity:.6,
        //   flatShading: true
        });
    
    
        this.mesh = new THREE.Mesh(geom, mat);
        this.mesh.receiveShadows = true;
        this.mesh.name = 'sea';
    
    
      }
      moveWaves() {
        this.mesh.geometry.vertices.forEach((vertex, index) => {
            const wave = this.waves[index];
    
            // vertex.x = wave.x + Math.cos(wave.ang) * wave.amp;
            vertex.y = wave.y + Math.sin(wave.ang) * wave.amp;
    
            wave.ang += wave.speed;
    
            
            
        });
        this.mesh.geometry.verticesNeedUpdate = true;
    
      }
    }

module.exports = Sea;
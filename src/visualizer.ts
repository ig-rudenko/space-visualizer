import SpaceObjectData from "./orbits";
import {Line, Mesh, Sprite} from "three";
import * as THREE from "three";

class Visualizer {
    constructor(
        public planet: SpaceObjectData,
        public name: string,
    ) {}

    getOrbit(color: string): Line {
        return new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(this.planet.getPlanetOrbit3DPoints(1500)),
            new THREE.LineBasicMaterial({color: color})
        )
    }

    getSphere(color: string, scale: number): Mesh {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.planet.mean_radius * scale, 32, 32),
            new THREE.MeshBasicMaterial({color: color})
        )
        sphere.position.set(...this.planet.getCurrentPosition());
        sphere.name = this.name;
        return sphere;
    }

    getSprite(): Sprite {
        const material = new THREE.SpriteMaterial(
            {
                map: new THREE.TextureLoader().load('https://img.icons8.com/color-glass/20/circled.png')
            });
        const sprite = new THREE.Sprite(material)
        sprite.addEventListener("click", e => {
            console.log(e)
        })
        return sprite
    }
}

export default Visualizer

import SpaceObjectData from "./spaceObject";
import {Line, MathUtils, Mesh, Sprite, TextureLoader} from "three";
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

    getSphere(color: string, scale: number, textureName: string): Mesh {
        const texture = new TextureLoader().load(`images/textures/${textureName}.jpg`)
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.planet.meanRadius * scale, 128, 128),
            new THREE.MeshPhongMaterial({map: texture})
        )
        sphere.rotation.z = MathUtils.degToRad(this.planet.obliquityToOrbit)
        sphere.position.set(...this.planet.getCurrentPosition());
        sphere.name = this.name;
        return sphere;
    }

    getSprite(): Sprite {
        const material = new THREE.SpriteMaterial(
            {
                map: new THREE.TextureLoader().load('images/circle.png')
            });
        const sprite = new THREE.Sprite(material)
        sprite.addEventListener("click", e => {
            console.log(e)
        })
        return sprite
    }
}

export default Visualizer

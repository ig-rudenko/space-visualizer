import SpaceObjectData from "./spaceObject";
import {
    Line,
    Loader,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    RingGeometry,
    Sprite,
    TextureLoader
} from "three";
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

    getSphere(scale: number, textureName: string): Mesh {
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

function createRing(innerRadius: number, outerRadius: number, thetaSegments: number = 256, angle: number, textureName: string): Mesh<RingGeometry> {
    const texture = new TextureLoader().load(`images/textures/${textureName}.jpg`)
    const ring = new Mesh(
        new RingGeometry(innerRadius, outerRadius, thetaSegments),
        new MeshBasicMaterial({color: "#FFFFFF", side: THREE.DoubleSide, map: texture, transparent: true})
    )
    ring.rotation.x = Math.PI / 2 + (angle * Math.PI / 180)
    ring.receiveShadow = true
    return ring
}

export default Visualizer

export {createRing}

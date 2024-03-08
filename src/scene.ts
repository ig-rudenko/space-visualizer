import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

class SceneMaker {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public controls: OrbitControls;
    public renderer: THREE.WebGLRenderer;
    public scale: number;

    constructor(globalScale: number) {
        this.scale = globalScale;
        this.scene = new THREE.Scene();
    }

    addSkybox(imageURL: string): void {
        new THREE.TextureLoader().load(imageURL,
            (t) => {
                t.mapping = THREE.EquirectangularReflectionMapping;
                t.colorSpace = THREE.DisplayP3ColorSpace;
                this.scene.background = t;
            })
    }

    createCamera(fov: number, near: number, far: number): void {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
    }

    makeRender(canvas: HTMLCanvasElement): void {
        this.renderer = new THREE.WebGLRenderer({canvas: canvas});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    makeControls(rotateSpeed: number, zoomSpeed: number, panSpeed: number): void {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // controls.enableDamping = true;
        this.controls.rotateSpeed = rotateSpeed;
        this.controls.zoomSpeed = zoomSpeed;
        this.controls.panSpeed = panSpeed;

    }

    focusOn(object: THREE.Object3D): void {
        // Фокус на фигуре
        const position = object.position
        // Установка новой позиции камеры
        this.camera.lookAt(new THREE.Vector3().copy(position));
        // Установка новой цели (центра вращения) для controls
        this.controls.target.copy(position);
    }

    setCameraToObject(object: THREE.Object3D) {
        const boundingBox = new THREE.Box3().setFromObject(object);
        const orbitCenter = boundingBox.getCenter(new THREE.Vector3());

        const maxOrbitSize = Math.max(boundingBox.max.x - boundingBox.min.x, boundingBox.max.y - boundingBox.min.y, boundingBox.max.z - boundingBox.min.z);
        const distance = maxOrbitSize / Math.tan((Math.PI / 180) * (this.camera.fov / 2));

        this.camera.position.set(orbitCenter.x, orbitCenter.y + 1_200_000_000_000 * this.scale, -distance / 2);
        this.controls.target.copy(orbitCenter);
    }

}


export default SceneMaker;
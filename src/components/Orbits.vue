<template>
  <div class="relative">
    <div class="absolute about">
      <h2 style="margin: 0;">{{ about.planetName }}</h2>
      <div v-if="about.description.length > 0">
        <button class="toggle-button" @click="about.showDesc = !about.showDesc">
          {{ about.showDesc ? 'Свернуть' : 'Развернуть' }}
        </button>
        <div v-if="about.showDesc" v-html="about.description"></div>
      </div>
    </div>
    <canvas ref="orbitCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {ref, onMounted, reactive} from 'vue'
import SpaceObjectData from "../spaceObject"
import Visualizer, {createRing} from "../visualizer";
import {TextureLoader} from "three";
import {SUN, EARTH, JUPITER, MARS, MERCURY, NEPTUNE, SATURN, URANUS, VENUS} from "../solarSystem";
import ObjectsStorage from "../objectsStorage";

const orbitCanvas = ref(null);
const about = reactive({
  planetName: "",
  description: "",
  showDesc: true,
});

const scene = new THREE.Scene();
new THREE.TextureLoader().load("images/textures/skybox.jpg",
    (t) => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.DisplayP3ColorSpace;
      scene.background = t;
    })
const MAX_DISTANCE = 950_000_000_000 * 20
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, MAX_DISTANCE);

let controls: OrbitControls;
let renderer: THREE.WebGLRenderer;

const SpaceObjectStorage = new ObjectsStorage()
const sprites: THREE.Sprite[] = []
const SCALE = 1  // 1 / Астрономическая единица


onMounted(() => {
  renderer = new THREE.WebGLRenderer({canvas: orbitCanvas.value});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  // Создали controls
  // controls = <OrbitControls>(new AstroControls(camera, renderer.domElement));
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  // controls.noZoom = false;
  // controls.noPan = false;
  // controls.staticMoving = true;
  // controls.dynamicDampingFactor = 0.3;

  // При желании можно по колдовать с настройками, а можно этого не делать.
  // controls готов к работе и без этого.

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;

  MERCURY.setScale(SCALE);
  VENUS.setScale(SCALE);
  EARTH.setScale(SCALE);
  MARS.setScale(SCALE);
  JUPITER.setScale(SCALE);
  SATURN.setScale(SCALE);
  URANUS.setScale(SCALE);
  NEPTUNE.setScale(SCALE);

  const MercuryVisualizer = new Visualizer(MERCURY, "Меркурий")
  const VenusVisualizer = new Visualizer(VENUS, "Венера")
  const EarthVisualizer = new Visualizer(EARTH, "Земля")
  const MarsVisualizer = new Visualizer(MARS, "Марс")
  const JupiterMarsVisualizer = new Visualizer(JUPITER, "Юпитер")
  const SaturnVisualizer = new Visualizer(SATURN, "Сатурн")
  const UranusVisualizer = new Visualizer(URANUS, "Уран")
  const NeptuneVisualizer = new Visualizer(NEPTUNE, "Нептун")

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    SpaceObjectStorage.spaceBodiesObjects.forEach(p => {
      let scaleFactor = 28;
      if (p.children.length > 0) {
        let sprite = p.children[0];
        // console.log(sprite)
        let scale = new THREE.Vector3().subVectors(p.position, camera.position).length() / scaleFactor;
        sprite.scale.set(scale, scale, 1);
      }
    })

  };

  scene.add(MercuryVisualizer.getOrbit("#838383"))
  scene.add(VenusVisualizer.getOrbit("#f39932"))
  scene.add(EarthVisualizer.getOrbit("#3289f3"))
  scene.add(MarsVisualizer.getOrbit("#f33232"))
  scene.add(JupiterMarsVisualizer.getOrbit("#d37811"))
  scene.add(SaturnVisualizer.getOrbit("#f3b632"))
  scene.add(UranusVisualizer.getOrbit("#3293f3"))
  const neptuneOrbit = NeptuneVisualizer.getOrbit("#3259f3")
  scene.add(neptuneOrbit)

  const mercurySphere = MercuryVisualizer.getSphere(SCALE, "mercury")
  const venusSphere = VenusVisualizer.getSphere(SCALE, "venus")
  const earthSphere = EarthVisualizer.getSphere(SCALE, "earth")
  const marsSphere = MarsVisualizer.getSphere(SCALE, "mars")
  const jupiterSphere = JupiterMarsVisualizer.getSphere(SCALE, "jupiter")
  const saturnSphere = SaturnVisualizer.getSphere(SCALE, "saturn")
  const uranusSphere = UranusVisualizer.getSphere(SCALE, "uranus")
  const neptuneSphere = NeptuneVisualizer.getSphere(SCALE, "neptune")

  addSun(SUN)
  scene.add(mercurySphere)
  scene.add(venusSphere)
  scene.add(earthSphere)
  scene.add(marsSphere)
  scene.add(jupiterSphere)
  scene.add(saturnSphere)
  scene.add(uranusSphere)
  scene.add(neptuneSphere)

  SpaceObjectStorage.addSpaceObject(mercurySphere, MERCURY)
  SpaceObjectStorage.addSpaceObject(venusSphere, VENUS)
  SpaceObjectStorage.addSpaceObject(earthSphere, EARTH)
  SpaceObjectStorage.addSpaceObject(marsSphere, MARS)
  SpaceObjectStorage.addSpaceObject(jupiterSphere, JUPITER)
  SpaceObjectStorage.addSpaceObject(saturnSphere, SATURN)
  SpaceObjectStorage.addSpaceObject(uranusSphere, URANUS)
  SpaceObjectStorage.addSpaceObject(neptuneSphere, NEPTUNE)

  const mercurySprite = EarthVisualizer.getSprite();
  const venusSprite = EarthVisualizer.getSprite();
  const earthSprite = EarthVisualizer.getSprite();
  const marsSprite = EarthVisualizer.getSprite();
  const jupiterSprite = JupiterMarsVisualizer.getSprite();
  const saturnSprite = SaturnVisualizer.getSprite();
  const uranusSprite = UranusVisualizer.getSprite();
  const neptuneSprite = NeptuneVisualizer.getSprite();
  scene.add(mercurySprite);
  scene.add(venusSprite);
  scene.add(earthSprite);
  scene.add(marsSprite);
  scene.add(jupiterSprite);
  scene.add(saturnSprite);
  scene.add(uranusSprite);
  scene.add(neptuneSprite);

  sprites.push(mercurySprite);
  sprites.push(venusSprite);
  sprites.push(earthSprite);
  sprites.push(marsSprite);
  sprites.push(jupiterSprite);
  sprites.push(saturnSprite);
  sprites.push(uranusSprite);
  sprites.push(neptuneSprite);

  mercurySphere.add(mercurySprite);
  venusSphere.add(venusSprite);
  earthSphere.add(earthSprite);
  marsSphere.add(marsSprite);
  jupiterSphere.add(jupiterSprite);
  saturnSphere.add(saturnSprite);
  uranusSphere.add(uranusSprite);
  neptuneSphere.add(neptuneSprite);

  // Кольца
  saturnSphere.add(createRing(70_000_000, 136_500_000, 256, 23, "saturn-ring"))

  // Настройка камеры
  const boundingBox = new THREE.Box3().setFromObject(neptuneOrbit);
  const orbitCenter = boundingBox.getCenter(new THREE.Vector3());

  const maxOrbitSize = Math.max(boundingBox.max.x - boundingBox.min.x, boundingBox.max.y - boundingBox.min.y, boundingBox.max.z - boundingBox.min.z);
  const distance = maxOrbitSize / Math.tan((Math.PI / 180) * (camera.fov / 2));

  camera.position.set(orbitCenter.x, orbitCenter.y + 1_200_000_000_000, -distance / 2);
  controls.target.copy(orbitCenter);


  animate();

  // const onClick = (event) => {
  //   // Определение координат мыши в нормализованных координатах (-1 to 1)
  //   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //
  //   // Пускайте луч из камеры в направлении указания мыши
  //   raycaster.setFromCamera(mouse, camera);
  //
  //   // Получение массива объектов, с которыми пересекается луч
  //   const intersects = raycaster.intersectObjects(scene.children);
  //
  //   // Если есть пересечение с объектами
  //   if (intersects.length > 0) {
  //     // Найти объект
  //     const planetIndex = intersects.findIndex(obj => planets.indexOf(<THREE.Mesh>obj.object) !== -1);
  //     if (planetIndex === -1) return;
  //     const position = intersects[planetIndex].object.position
  //
  //     // Установка новой позиции камеры
  //     const newCameraPosition = position.clone().add(new THREE.Vector3(0, 0, 0.1));
  //     camera.position.copy(newCameraPosition);
  //
  //     // Направление, на которое смотрит камера
  //     const lookAtDirection = position.clone().sub(newCameraPosition).normalize();
  //
  //     // Установка нового вектора направления для камеры
  //     camera.lookAt(new THREE.Vector3().copy(position));
  //
  //     // Установка новой цели (центра вращения) для controls
  //     controls.target.copy(position);
  //   }
  // };

  window.addEventListener('click', onClick, false);
});


const onClick = (event) => {
  // Фокус на фигуре
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  // Определение координат мыши в нормализованных координатах (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Пускайте луч из камеры в направлении указания мыши
  raycaster.setFromCamera(mouse, camera);

  // Получение массива объектов, с которыми пересекается луч
  const intersects = raycaster.intersectObjects(scene.children);

  // Если есть пересечение с объектами
  if (intersects.length > 0) {
    // Найти объект
    const spriteIndex = intersects.findIndex(obj => sprites.indexOf(<THREE.Sprite>obj.object) !== -1);
    if (spriteIndex !== -1) {

      const spaceObject = intersects[spriteIndex].object.parent
      if (spaceObject) {
        showSpaceObjectDetail(spaceObject)
        // Найти объект
        // const planetIndex = intersects.findIndex(obj => planets.indexOf(<THREE.Mesh>obj.object) !== -1);
        // if (planetIndex === -1) return;
        focusOn(spaceObject)
      }

    }

    // Клик на космическом объекте
    const spaceObjectIndex = intersects.findIndex(obj => SpaceObjectStorage.spaceBodiesObjects.indexOf(<THREE.Mesh>obj.object) !== -1);
    if (spaceObjectIndex !== -1) {
      showSpaceObjectDetail(intersects[spaceObjectIndex].object)
      focusOn(intersects[spaceObjectIndex].object)
    }
  }

}


const showSpaceObjectDetail = (object: THREE.Object3D) => {
  const data = SpaceObjectStorage.getSpaceObjectData(object)
  if (data == null) return;
  about.planetName = object.name
  const match = data.ephemeris.match(/\*+(.+?)\*+/s)
  if (match) {
    about.description = match[1]
        .replace(/^\s+|\s+$/gm, '')
        .replace(/\n/g, "<br>")
        .replace(/ /g, "&nbsp;")
  } else {
    about.description = ""
  }
}

const focusOn = (object: THREE.Object3D) => {
  const position = object.position
  // Установка новой позиции камеры
  // const newCameraPosition = position.clone().add(new THREE.Vector3(0, 0, 9_000_000));
  // camera.position.copy(newCameraPosition);
  // Направление, на которое смотрит камера
  // const lookAtDirection = position.clone().sub(newCameraPosition).normalize();
  // Установка нового вектора направления для камеры
  camera.lookAt(new THREE.Vector3().copy(position));
  // Установка новой цели (центра вращения) для controls
  controls.target.copy(position);
}

const addSun = (sun: SpaceObjectData) => {
  // Создание сферы
  const texture = new TextureLoader().load(`images/textures/sun.jpg`)
  const sphereGeometry = new THREE.SphereGeometry(sun.meanRadius * SCALE, 128, 128);
  const sphereMaterial = new THREE.MeshBasicMaterial({map: texture});
  const SunSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  SunSphere.name = "Солнце"
  scene.add(SunSphere);
  // Создаем источник света
  const light = new THREE.PointLight(0xffffff, 250, MAX_DISTANCE, 0.15);
  scene.add(light);

  // Создаем свет для темных зон
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.02); // Небольшая подсветка для всех частей сцены
  scene.add(ambientLight);

  SpaceObjectStorage.addSpaceObject(SunSphere, SUN)
}

</script>

<style>
canvas {
  display: block;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.about {
  padding: 1.2rem;
  color: snow;
  font-size: 0.7rem;
  text-align: left;
  font-family: monospace;
}

.toggle-button {
  margin-bottom: 10px;
}

</style>

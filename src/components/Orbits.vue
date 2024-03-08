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
import {ref, onMounted, reactive} from 'vue'
import SpaceObjectData from "../spaceObject"
import Visualizer, {createRing} from "../visualizer";
import {TextureLoader} from "three";
import {SUN, EARTH, JUPITER, MARS, MERCURY, NEPTUNE, SATURN, URANUS, VENUS} from "../solarSystem";
import ObjectsStorage from "../objectsStorage";
import SceneMaker from "../scene";

const orbitCanvas = ref(null);
const about = reactive({
  planetName: "",
  description: "",
  showDesc: true,
});

const SCENE = new SceneMaker(1 / 555555555)

const SpaceObjectStorage = new ObjectsStorage()
const sprites: THREE.Sprite[] = []
const MAX_DISTANCE = 950_000_000_000 * 20 * SCENE.scale


onMounted(() => {

  SCENE.addSkybox("images/textures/skybox.jpg")
  SCENE.createCamera(75, 0.001, MAX_DISTANCE)
  SCENE.makeRender(orbitCanvas.value)
  SCENE.makeControls(1.0, 1.2, 0.8)

  MERCURY.setScale(SCENE.scale);
  VENUS.setScale(SCENE.scale);
  EARTH.setScale(SCENE.scale);
  MARS.setScale(SCENE.scale);
  JUPITER.setScale(SCENE.scale);
  SATURN.setScale(SCENE.scale);
  URANUS.setScale(SCENE.scale);
  NEPTUNE.setScale(SCENE.scale);

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
    SCENE.controls.update();
    SCENE.renderer.render(SCENE.scene, SCENE.camera);

    SpaceObjectStorage.spaceBodiesObjects.forEach(p => {
      let scaleFactor = 28;
      if (p.children.length > 0) {
        let sprite = p.children[0];
        // console.log(sprite)
        let scale = new THREE.Vector3().subVectors(p.position, SCENE.camera.position).length() / scaleFactor;
        sprite.scale.set(scale, scale, 1);
      }
    })

  };

  SCENE.scene.add(MercuryVisualizer.getOrbit("#838383"))
  SCENE.scene.add(VenusVisualizer.getOrbit("#f39932"))
  SCENE.scene.add(EarthVisualizer.getOrbit("#3289f3"))
  SCENE.scene.add(MarsVisualizer.getOrbit("#f33232"))
  SCENE.scene.add(JupiterMarsVisualizer.getOrbit("#d37811"))
  SCENE.scene.add(SaturnVisualizer.getOrbit("#f3b632"))
  SCENE.scene.add(UranusVisualizer.getOrbit("#3293f3"))
  const neptuneOrbit = NeptuneVisualizer.getOrbit("#3259f3")
  SCENE.scene.add(neptuneOrbit)

  const mercurySphere = MercuryVisualizer.getSphere(SCENE.scale, "mercury")
  const venusSphere = VenusVisualizer.getSphere(SCENE.scale, "venus")
  const earthSphere = EarthVisualizer.getSphere(SCENE.scale, "earth")
  const marsSphere = MarsVisualizer.getSphere(SCENE.scale, "mars")
  const jupiterSphere = JupiterMarsVisualizer.getSphere(SCENE.scale, "jupiter")
  const saturnSphere = SaturnVisualizer.getSphere(SCENE.scale, "saturn")
  const uranusSphere = UranusVisualizer.getSphere(SCENE.scale, "uranus")
  const neptuneSphere = NeptuneVisualizer.getSphere(SCENE.scale, "neptune")

  // Добавление небесных тел
  addSun(SUN)
  SCENE.scene.add(mercurySphere)
  SCENE.scene.add(venusSphere)
  SCENE.scene.add(earthSphere)
  SCENE.scene.add(marsSphere)
  SCENE.scene.add(jupiterSphere)
  SCENE.scene.add(saturnSphere)
  SCENE.scene.add(uranusSphere)
  SCENE.scene.add(neptuneSphere)

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
  SCENE.scene.add(mercurySprite);
  SCENE.scene.add(venusSprite);
  SCENE.scene.add(earthSprite);
  SCENE.scene.add(marsSprite);
  SCENE.scene.add(jupiterSprite);
  SCENE.scene.add(saturnSprite);
  SCENE.scene.add(uranusSprite);
  SCENE.scene.add(neptuneSprite);

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

  // Кольца Сатурна
  saturnSphere.add(createRing(85_000_000 * SCENE.scale, 136_500_000 * SCENE.scale, 256, SATURN.obliquityToOrbit, SATURN.trueAnomaly + SATURN.periapsisArgument + SATURN.omega, "saturn-ring"))

  // Настройка камеры
  SCENE.setCameraToObject(neptuneOrbit)

  animate();

  window.addEventListener('click', onClick, false);
});


const onClick = (event) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  // Определение координат мыши в нормализованных координатах (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Пускайте луч из камеры в направлении указания мыши
  raycaster.setFromCamera(mouse, SCENE.camera);
  // Получение массива объектов, с которыми пересекается луч
  const intersects = raycaster.intersectObjects(SCENE.scene.children);

  // Если есть пересечение с объектами
  if (intersects.length > 0) {
    const spriteIndex = intersects.findIndex(obj => sprites.indexOf(<THREE.Sprite>obj.object) !== -1);
    if (spriteIndex !== -1) {

      const spaceObject = intersects[spriteIndex].object.parent
      if (spaceObject) {
        showSpaceObjectDetail(spaceObject)
        SCENE.focusOn(spaceObject)
      }

    }

    // Клик на космическом объекте
    const spaceObjectIndex = intersects.findIndex(obj => SpaceObjectStorage.spaceBodiesObjects.indexOf(<THREE.Mesh>obj.object) !== -1);
    if (spaceObjectIndex !== -1) {
      showSpaceObjectDetail(intersects[spaceObjectIndex].object)
      SCENE.focusOn(intersects[spaceObjectIndex].object)
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


const addSun = (sun: SpaceObjectData) => {
  // Создание сферы
  const texture = new TextureLoader().load(`images/textures/sun.jpg`)
  const sphereGeometry = new THREE.SphereGeometry(sun.meanRadius * SCENE.scale, 128, 128);
  const sphereMaterial = new THREE.MeshBasicMaterial({map: texture});
  const SunSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  SunSphere.name = "Солнце"
  SCENE.scene.add(SunSphere);
  // Создаем источник света
  const light = new THREE.PointLight(0xffffff, 10, MAX_DISTANCE, 0.1);
  SCENE.scene.add(light);

  // Создаем свет для темных зон
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.02); // Небольшая подсветка для всех частей сцены
  SCENE.scene.add(ambientLight);

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

.about:hover {
  background-color: rgba(105, 105, 105, 0.78);
  border-radius: 20px;
}

.toggle-button {
  margin: 10px 0;
}

</style>

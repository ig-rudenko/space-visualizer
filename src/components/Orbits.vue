<template>
  <div class="relative">
    <div class="absolute about">
      {{ about.planetName }}
    </div>
    <canvas ref="orbitCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {ref, onMounted, reactive} from 'vue'
import SpaceObjectData from "../spaceObject"
import Visualizer from "../visualizer";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {TextureLoader} from "three";

const orbitCanvas = ref(null);
const about = reactive({
  planetName: "",
  description: "",
});

const scene = new THREE.Scene();
new THREE.TextureLoader().load("src/assets/textures/skybox.jpg",
    (t) => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.DisplayP3ColorSpace;
      scene.background = t;
    })
const MAX_DISTANCE = 950_000_000_000 * 20
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1000, MAX_DISTANCE);

let controls: OrbitControls;
let renderer: THREE.WebGLRenderer;

const SPACE_OBJECTS: THREE.Mesh[] = []
const sprites: THREE.Sprite[] = []
const SCALE = 1  // 1 / Астрономическая единица


onMounted(() => {
  const SUN = SpaceObjectData.fromEphemerisResult("Vol. Mean Radius (km) =  695700.0")
  const MERCURY = SpaceObjectData.fromEphemerisResult(
      `Vol. Mean Radius (km) =  2440+-1        Density (g cm^-3)     = 5.427
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 2.056423382048719E-01 QR= 4.600043736787058E+07 IN= 7.003547018647548E+00
           OM= 4.830053772173095E+01 W = 2.919485613696540E+01 Tp=  2460387.192538718693
           N = 4.736523292146832E-05 MA= 2.794111185695979E+02 TA= 2.558317855862489E+02
           A = 5.790897423198078E+07 AD= 6.981751109609097E+07 PR= 7.600511552363332E+06`
  )
  const VENUS = SpaceObjectData.fromEphemerisResult(
      `Vol. Mean Radius (km) =  6051.84+-0.01 Density (g/cm^3)      =  5.204
      2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 6.748931814975527E-03 QR= 1.074780717217784E+08 IN= 3.394390525298453E+00
           OM= 7.661202703982865E+01 W = 5.527434059866257E+01 Tp=  2460277.065121068154
           N = 1.854333067927339E-05 MA= 1.448896779334469E+02 TA= 1.453314302379854E+02
           A = 1.082083625826589E+08 AD= 1.089386534435395E+08 PR= 1.941398803842646E+07`
  )
  const EARTH = SpaceObjectData.fromEphemerisResult(
      `Vol. Mean Radius (km)    = 6371.01+-0.02   Mass x10^24 (kg)= 5.97219+-0.0006
          Obliquity to orbit, deg  = 23.4392911  Sidereal orb period  = 1.0000174 y
          2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 1.639957426111826E-02 QR= 1.470308061012795E+08 IN= 5.157264301763251E-03
           OM= 1.680371675998003E+02 W = 2.925553473849498E+02 Tp=  2460311.368181458674
           N = 1.142075082582530E-05 MA= 5.538823311998678E+01 TA= 5.695291317383499E+01
           A = 1.494822513835634E+08 AD= 1.519336966658472E+08 PR= 3.152157029693230E+07`
  )
  const MARS = SpaceObjectData.fromEphemerisResult(
      `Vol. Mean Radius (km) =  6051.84+-0.01 Density (g/cm^3)      =  5.204
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 9.328370302238161E-02 QR= 2.066718248999021E+08 IN= 1.847857388521854E+00
           OM= 4.948957342618561E+01 W = 2.866650397284963E+02 Tp= 2460438.923206833191
           N = 6.065459966239543E-06 MA= 3.225702584125132E+02 TA= 3.154320687131508E+02
           A = 2.279343887264482E+08 AD= 2.491969525529942E+08 PR= 5.935246494144984E+07`
  )
  const JUPITER = SpaceObjectData.fromEphemerisResult(
      `Vol. Mean Radius (km) = 69911+-6          Flattening            = 0.06487
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 4.822509252647478E-02 QR= 7.407356615532681E+08 IN= 1.303265987709862E+00
           OM= 1.005341247254163E+02 W = 2.736266669693536E+02 Tp=  2459966.965590192936
           N = 9.618163028176499E-07 MA= 3.328478137659240E+01 TA= 3.647647013460281E+01
           A = 7.782676930615264E+08 AD= 8.157997245697848E+08 PR= 3.742918465255544E+08`
  )
  const SATURN = SpaceObjectData.fromEphemerisResult(
      `Vol. Mean Radius (km) = 58232+-6        Flattening             =  0.09796
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 5.485312449279910E-02 QR= 1.352846534956769E+09 IN= 2.488371742408174E+00
           OM= 1.136373156712430E+02 W = 3.357727471730254E+02 Tp=  2463490.196422733366
           N = 3.854931440458000E-07 MA= 2.559935754518296E+02 TA= 2.500052722316908E+02
           A = 1.431361167258561E+09 AD= 1.509875799560353E+09 PR= 9.338687485379217E+08`
  )
  const URANUS = SpaceObjectData.fromEphemerisResult(
      `Vol. Mean Radius (km) = 25362+-12       Flattening             =  0.02293
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 4.463472614159238E-02 QR= 2.758819680413041E+09 IN= 7.711428177375869E-01
           OM= 7.406140316480688E+01 W = 9.068305519881442E+01 Tp=  2469665.640008967835
           N = 1.345107930543515E-07 MA= 2.519395038832322E+02 TA= 2.471650024592442E+02
           A = 2.887711910724022E+09 AD= 3.016604141035004E+09 PR= 2.676365158701694E+09`
  )
  const NEPTUNE = SpaceObjectData.fromEphemerisResult(
      `Vol. mean radius (km) = 24624+-21       Polar radius (km)      = 24342+-30
        2460367.500000000 = A.D. 2024-Feb-27 00:00:00.0000 TDB
           EC= 1.392748169118928E-02 QR= 4.461653632559234E+09 IN= 1.769627319905752E+00
           OM= 1.317663829477112E+02 W = 2.610516006353576E+02 Tp=  2466268.335760582704
           N = 6.858184078703230E-08 MA= 3.250347685652694E+02 TA= 3.241069609733041E+02
           A = 4.524670903729584E+09 AD= 4.587688174899934E+09 PR= 5.249202935772907E+09`
  )

  renderer = new THREE.WebGLRenderer({canvas: orbitCanvas.value});
  renderer.setSize(window.innerWidth, window.innerHeight);

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

    SPACE_OBJECTS.forEach(p => {
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

  const mercurySphere = MercuryVisualizer.getSphere("#838383", SCALE, "mercury")
  const venusSphere = VenusVisualizer.getSphere("#f39932", SCALE, "venus")
  const earthSphere = EarthVisualizer.getSphere("#3289f3", SCALE, "earth")
  const marsSphere = MarsVisualizer.getSphere("#f33232", SCALE, "mars")
  const jupiterSphere = JupiterMarsVisualizer.getSphere("#d37811", SCALE, "jupiter")
  const saturnSphere = SaturnVisualizer.getSphere("#f3b632", SCALE, "saturn")
  const uranusSphere = UranusVisualizer.getSphere("#3293f3", SCALE, "uranus")
  const neptuneSphere = NeptuneVisualizer.getSphere("#3259f3", SCALE, "neptune")

  addSun(SUN)
  scene.add(mercurySphere)
  scene.add(venusSphere)
  scene.add(earthSphere)
  scene.add(marsSphere)
  scene.add(jupiterSphere)
  scene.add(saturnSphere)
  scene.add(uranusSphere)
  scene.add(neptuneSphere)

  SPACE_OBJECTS.push(mercurySphere)
  SPACE_OBJECTS.push(venusSphere)
  SPACE_OBJECTS.push(earthSphere)
  SPACE_OBJECTS.push(marsSphere)
  SPACE_OBJECTS.push(jupiterSphere)
  SPACE_OBJECTS.push(saturnSphere)
  SPACE_OBJECTS.push(uranusSphere)
  SPACE_OBJECTS.push(neptuneSphere)

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
        about.planetName = spaceObject.name
        // Найти объект
        // const planetIndex = intersects.findIndex(obj => planets.indexOf(<THREE.Mesh>obj.object) !== -1);
        // if (planetIndex === -1) return;
        focusOn(spaceObject)
      }

    }

    // Клик на космическом объекте
    const spaceObjectIndex = intersects.findIndex(obj => SPACE_OBJECTS.indexOf(<THREE.Mesh>obj.object) !== -1);
    if (spaceObjectIndex !== -1) {
      focusOn(intersects[spaceObjectIndex].object)
    }
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
  const texture = new TextureLoader().load(`src/assets/textures/sun.jpg`)
  const sphereGeometry = new THREE.SphereGeometry(sun.meanRadius * SCALE, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({map: texture});
  const SunSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(SunSphere);
  // Создаем источник света
  const light = new THREE.PointLight(0xffffff, 250, MAX_DISTANCE, 0.15);

  // Создаем свет для темных зон
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.02); // Небольшая подсветка для всех частей сцены
  scene.add(ambientLight);

  scene.add(light);
  SPACE_OBJECTS.push(SunSphere)
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
}

</style>

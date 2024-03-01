<script lang="ts">
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import Visualizer, {createRing} from "../visualizer";
import {SATURN} from "../solarSystem";

export default {
  name: "Saturn",
  mounted() {
    this.init()
  },
  data() {
    return {
      SCALE: SATURN.meanRadius
    }
  },
  methods: {

    init() {
// Импорт библиотеки THREE.js

// Создание сцены
      const scene = new THREE.Scene();

      SATURN.meanRadius = 120
      const sphere = new Visualizer(SATURN, "Saturn").getSphere(1, "saturn")
      sphere.position.set(0, 0, 0)
      scene.add(sphere)

// Создание кольца
      const ring = createRing(220, 327, 256, 2, "saturn-ring")
      sphere.add(ring);

// Создание камеры
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 122000);
      camera.position.z = 1235;

// Создание источника света
      const light = new THREE.PointLight(0xffffff, 3, 50000044, 0.015);
      light.position.set(5, 5555, 3222);
      scene.add(light);

// Создание рендерера
      const renderer = new THREE.WebGLRenderer({canvas: this.$refs.canvas.value});
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);

// Анимация
      const animate = function () {
        requestAnimationFrame(animate);
        controls.update()
        renderer.render(scene, camera);
      };

// Вызов анимации
      animate();

    }
  }
}
</script>

<template>
  <div class="relative">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>

</style>
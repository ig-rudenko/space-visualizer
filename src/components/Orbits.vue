<template>
  <div class="relative main-wrapper">
    <!-- Информация о выбранном объекте (слева вверху) -->
    <div
        class="absolute container planet-info no-raycast"
        :class="{ 'is-collapsed': isPlanetInfoCollapsed }"
        v-if="about.planetName"
    >
      <div class="planet-header">
        <div class="planet-title-wrap">
          <h2 style="margin: 0;">{{ about.planetName }}</h2>
          <span v-if="isPlanetInfoCollapsed && about.distanceKm > 0" class="mini-summary">
            {{ formatDistance(about.distanceKm) }}
          </span>
        </div>
        <div class="panel-header-actions">
          <!-- Кнопка центрирования камеры на планете -->
          <button
              v-if="selectedMesh"
              class="small-btn icon-btn"
              @click="reFocusCurrentPlanet"
              title="Сфокусировать камеру на объекте"
          >
            🎯
          </button>
          <!-- Кнопка свернуть/развернуть карточку планеты -->
          <button
              class="small-btn icon-btn"
              @click="isPlanetInfoCollapsed = !isPlanetInfoCollapsed"
              :title="isPlanetInfoCollapsed ? 'Развернуть карточку' : 'Свернуть карточку'"
          >
            {{ isPlanetInfoCollapsed ? '▼' : '▲' }}
          </button>
          <button class="small-btn close-btn" @click="clearSelection" title="Закрыть">✕</button>
        </div>
      </div>

      <!-- Содержимое карточки (скрывается при сворачивании) -->
      <div v-show="!isPlanetInfoCollapsed" class="planet-body">
        <!-- Точные данные в реальном времени -->
        <div class="telemetry" v-if="about.distanceKm > 0">
          <div class="telemetry-row">
            <span>{{ about.isMoon ? 'До Земли:' : 'До Солнца:' }}</span>
            <strong>{{ formatDistance(about.distanceKm) }}</strong>
          </div>
          <div class="telemetry-row">
            <span>Скор. орбиты:</span>
            <strong>{{ about.orbitalSpeed.toFixed(2) }} км/с</strong>
          </div>
          <div class="telemetry-row">
            <span>Ист. аномалия:</span>
            <strong>{{ about.trueAnomaly.toFixed(2) }}°</strong>
          </div>
        </div>

        <!-- Физические данные из эфемерид без горизонтальной обрезки и двойных скроллбаров -->
        <div v-if="about.description.length > 0" class="desc-wrapper">
          <button class="toggle-button" @click="about.showDesc = !about.showDesc">
            {{ about.showDesc ? 'Скрыть физические данные' : 'Показать физические данные' }}
          </button>
          <div v-if="about.showDesc" class="desc-content">
            <pre class="desc-pre">{{ about.description }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Настройки отображения (справа вверху) -->
    <div class="absolute container settings no-raycast">
      <button class="toggle-button" @click="toggleOrbits">
        {{ options.showOrbits ? 'Скрыть орбиты' : 'Показать орбиты' }}
      </button>
      <button class="toggle-button" @click="resetCameraToSun">
        Фокус на Солнце
      </button>
    </div>

    <!-- Развернутая панель управления временем (по центру внизу) -->
    <div class="time-controls-panel no-raycast" v-if="!isBottomPanelCollapsed">
      <!-- Верхняя строка: текущее время, статус и кнопка сворачивания -->
      <div class="time-header-row">
        <div class="current-date-text">
          <span class="calendar-icon">📅</span>
          <span class="date-str">{{ formattedCurrentDate }}</span>
          <span class="jd-str">(JD: {{ formattedJulianDate }})</span>
        </div>
        <div class="status-badges-group">
          <span v-if="nasaStatusMsg" class="status-badge" :class="nasaStatusType === 'success' ? 'nasa-success-badge' : 'nasa-error-badge'">
            {{ nasaStatusMsg }}
          </span>
          <span class="status-badge" :class="{ 'paused-badge': isPaused, 'active-badge': !isPaused }">
            {{ isPaused ? '⏸ ПАУЗА' : (isReversed ? '⏪ НАЗАД: ' : '▶ ') + currentSpeedLabel }}
          </span>
          <!-- Кнопка свернуть нижнюю панель -->
          <button
              class="collapse-toggle-btn"
              @click="isBottomPanelCollapsed = true"
              title="Свернуть панель управления"
          >
            ▼
          </button>
        </div>
      </div>

      <!-- Средняя строка: плеер, дата/время, быстрые кнопки и синхронизация NASA -->
      <div class="time-actions-row">
        <!-- Пауза / Старт -->
        <button class="control-btn play-btn" :class="{ 'active': !isPaused }" @click="togglePause">
          {{ isPaused ? '▶ Старт' : '⏸ Пауза' }}
        </button>

        <!-- Направление движения -->
        <button
            class="control-btn dir-btn"
            :class="{ 'active': isReversed }"
            @click="toggleDirection"
            :title="isReversed ? 'Движение назад во времени' : 'Движение вперед во времени'"
        >
          {{ isReversed ? '⏪ Назад' : '⏩ Вперед' }}
        </button>

        <!-- Выбор и ручной ввод даты и времени -->
        <div class="datetime-picker-wrapper">
          <label class="picker-label">Дата/время:</label>
          <input
              ref="dateTextInputRef"
              type="text"
              class="datetime-input"
              v-model="dateInputText"
              @focus="onDateInputFocus"
              @blur="onDateInputBlur"
              @keydown.enter="applyManualDate"
              placeholder="ГГГГ-ММ-ДД ЧЧ:ММ:СС"
              title="Введите дату вручную (например: 3024-01-01 12:00:00 или 01.01.3024) и нажмите Enter или кнопку «Ввод»"
          />
          <!-- Кнопка вызова календаря -->
          <label class="calendar-picker-label" title="Выбрать из календаря">
            📅
            <input
                type="datetime-local"
                step="1"
                class="native-picker-hidden"
                @change="onNativePickerChange"
            />
          </label>
          <!-- Кнопка подтверждения ввода -->
          <button class="control-btn apply-btn" @click="applyManualDate" title="Перейти к введённой дате (Enter)">
            Ввод
          </button>
        </div>

        <!-- Кнопки действий: Сейчас и Синхронизация с NASA Horizons -->
        <div class="quick-jumps">
          <button class="control-btn" @click="jumpToNow" title="Перейти к текущему реальному моменту">
            ⏱ Сейчас
          </button>

          <!-- Кнопка вытягивания эфемерид из NASA JPL Horizons -->
          <button
              class="control-btn nasa-btn"
              :class="{ 'loading-btn': isSyncingNasa }"
              :disabled="isSyncingNasa"
              @click="syncWithNasa"
              title="Запросить с сайта NASA точные эфемериды для указанной даты и откалибровать расчет орбит"
          >
            <span v-if="!isSyncingNasa">📡 Откалибровать по NASA</span>
            <span v-else class="loading-label">{{ nasaSyncStepText }}</span>
          </button>
        </div>
      </div>

      <!-- Нижняя строка: шкала ускорения времени -->
      <div class="speed-presets-row">
        <span class="speed-title">Скорость:</span>
        <div class="presets-group">
          <button
              v-for="preset in SPEED_PRESETS"
              :key="preset.value"
              class="preset-btn"
              :class="{ 'active-preset': timeSpeed === preset.value }"
              @click="setSpeed(preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="speed-stepper">
          <button class="step-btn" @click="stepSpeedDown" title="Замедлить">-</button>
          <button class="step-btn" @click="stepSpeedUp" title="Ускорить">+</button>
        </div>
      </div>
    </div>

    <!-- Свернутая компактная нижняя панель -->
    <div
        class="time-controls-collapsed no-raycast"
        v-else
        @click="isBottomPanelCollapsed = false"
        title="Нажмите, чтобы развернуть панель управления"
    >
      <button class="mini-play-btn" @click.stop="togglePause" :title="isPaused ? 'Возобновить' : 'Пауза'">
        {{ isPaused ? '▶' : '⏸' }}
      </button>
      <div class="collapsed-info">
        <span class="collapsed-calendar">📅</span>
        <span class="collapsed-date">{{ formattedCurrentDate }}</span>
      </div>
      <span class="status-badge" :class="{ 'paused-badge': isPaused, 'active-badge': !isPaused }">
        {{ isPaused ? 'ПАУЗА' : currentSpeedLabel }}
      </span>
      <button class="mini-expand-btn" title="Развернуть панель управления">
        ▲ Развернуть
      </button>
    </div>

    <!-- 3D Canvas -->
    <canvas ref="orbitCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import SpaceObjectData, { EPHEMERIS_EPOCH_MS } from "../spaceObject"
import Visualizer, { createRing } from "../visualizer";
import { TextureLoader } from "three";
import { SUN, EARTH, JUPITER, MARS, MERCURY, NEPTUNE, SATURN, URANUS, VENUS, MOON } from "../solarSystem";
import ObjectsStorage from "../objectsStorage";
import SceneMaker from "../scene";

const orbitCanvas = ref<HTMLCanvasElement | null>(null);

const about = reactive({
  planetName: "",
  description: "",
  showDesc: false,
  distanceKm: 0,
  orbitalSpeed: 0,
  trueAnomaly: 0,
  isMoon: false,
});

const options = reactive({
  showOrbits: true,
});

// Состояния сворачивания панелей
const isPlanetInfoCollapsed = ref(false);
const isBottomPanelCollapsed = ref(false);

// Скоростные пресеты
const SPEED_PRESETS = [
  { label: '1x (Реал.)', value: 1, desc: '1 сек / сек (Реальное время)' },
  { label: '1 мин/с', value: 60, desc: '1 мин / сек (x60)' },
  { label: '1 ч/с', value: 3600, desc: '1 час / сек (x3 600)' },
  { label: '1 д/с', value: 86400, desc: '1 день / сек (x86 400)' },
  { label: '1 нед/с', value: 604800, desc: '1 неделя / сек (x604 800)' },
  { label: '1 мес/с', value: 2592000, desc: '1 месяц / сек (x2 592 000)' },
  { label: '1 год/с', value: 31536000, desc: '1 год / сек (x31 536 000)' },
];

// Состояние симуляции времени
const simTimeMs = ref(Date.now()); // Начало с текущего реального времени
const isPaused = ref(false);
const timeSpeed = ref(1); // По умолчанию реальное время 1x
const isReversed = ref(false);
const focusedObject = ref<THREE.Object3D | null>(null);
const selectedMesh = ref<THREE.Object3D | null>(null);
const selectedSpaceData = ref<SpaceObjectData | null>(null);

let lastTrackedObject: THREE.Object3D | null = null;
let lastTrackedPos: THREE.Vector3 | null = null;
let pointerDownPos = { x: 0, y: 0 };

// Ручной ввод даты и времени
const isEditingDate = ref(false);
const dateInputText = ref('');
const dateTextInputRef = ref<HTMLInputElement | null>(null);

// Состояние синхронизации с NASA Horizons
const isSyncingNasa = ref(false);
const nasaSyncStepText = ref('');
const nasaStatusMsg = ref('');
const nasaStatusType = ref<'success' | 'error' | ''>('');

let sunSphereRef: THREE.Mesh | null = null;
let earthSphereRef: THREE.Mesh | null = null;
let moonSphereRef: THREE.Mesh | null = null;
let moonOrbitRef: THREE.Line | null = null;

const formatYMDHMS = (d: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

// Текстовое описание текущей скорости
const currentSpeedLabel = computed(() => {
  const found = SPEED_PRESETS.find(p => p.value === timeSpeed.value);
  if (found) return found.label;
  return `x${timeSpeed.value}`;
});

// Форматирование даты для заголовка
const formattedCurrentDate = computed(() => {
  const d = new Date(simTimeMs.value);
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
});

// Юлианская дата (JD)
const formattedJulianDate = computed(() => {
  const jd = (simTimeMs.value / 86400000) + 2440587.5;
  return jd.toFixed(3);
});

const formatDistance = (km: number) => {
  if (km > 1e8) {
    const au = km / 149597870.7;
    return `${(km / 1e6).toFixed(2)} млн км (${au.toFixed(2)} а.е.)`;
  }
  if (km > 1e6) {
    return `${(km / 1e6).toFixed(2)} млн км`;
  }
  return `${Math.round(km).toLocaleString('ru-RU')} км`;
};

// Парсинг произвольного ввода даты (ГГГГ-ММ-ДД или ДД.ММ.ГГГГ с любым временем)
const parseUserDate = (input: string): Date | null => {
  if (!input) return null;
  const str = input.trim();
  // 1. Формат РФ: ДД.ММ.ГГГГ [ЧЧ:ММ[:СС]]
  const ruMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4,5})(?:[\s,T]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (ruMatch) {
    const day = parseInt(ruMatch[1], 10);
    const month = parseInt(ruMatch[2], 10) - 1;
    const year = parseInt(ruMatch[3], 10);
    const h = parseInt(ruMatch[4] || '0', 10);
    const m = parseInt(ruMatch[5] || '0', 10);
    const s = parseInt(ruMatch[6] || '0', 10);
    const d = new Date(year, month, day, h, m, s);
    if (!isNaN(d.getTime())) return d;
  }
  // 2. Стандартный ISO: ГГГГ-ММ-ДД [ЧЧ:ММ[:СС]]
  const isoMatch = str.match(/^(\d{1,5})-(\d{1,2})-(\d{1,2})(?:[\s,T]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const h = parseInt(isoMatch[4] || '0', 10);
    const m = parseInt(isoMatch[5] || '0', 10);
    const s = parseInt(isoMatch[6] || '0', 10);
    const d = new Date(year, month, day, h, m, s);
    if (!isNaN(d.getTime())) return d;
  }
  // 3. Fallback через конструктор Date
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) return fallback;
  return null;
};

// При клике на инпут: останавливаем симуляцию, чтобы цифры не бежали
const onDateInputFocus = () => {
  isEditingDate.value = true;
  isPaused.value = true;
};

// Применение вручную введенной даты
const applyManualDate = () => {
  const parsed = parseUserDate(dateInputText.value);
  if (parsed) {
    simTimeMs.value = parsed.getTime();
    updatePlanetsPositions(parsed);
    if (selectedSpaceData.value) {
      updateLiveTelemetry(selectedSpaceData.value, parsed);
    }
    dateInputText.value = formatYMDHMS(parsed);
    isEditingDate.value = false;
    if (dateTextInputRef.value) {
      dateTextInputRef.value.blur();
    }
  } else {
    nasaStatusType.value = 'error';
    nasaStatusMsg.value = 'Формат: ГГГГ-ММ-ДД ЧЧ:ММ:СС';
    setTimeout(() => {
      if (nasaStatusMsg.value.includes('Формат:')) {
        nasaStatusMsg.value = '';
      }
    }, 4000);
  }
};

const onDateInputBlur = () => {
  setTimeout(() => {
    if (document.activeElement !== dateTextInputRef.value) {
      isEditingDate.value = false;
      const parsed = parseUserDate(dateInputText.value);
      if (parsed) {
        simTimeMs.value = parsed.getTime();
        updatePlanetsPositions(parsed);
      }
    }
  }, 250);
};

// Выбор через всплывающий календарь
const onNativePickerChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.value) return;
  const parsed = new Date(input.value);
  if (!isNaN(parsed.getTime())) {
    simTimeMs.value = parsed.getTime();
    updatePlanetsPositions(parsed);
    if (selectedSpaceData.value) {
      updateLiveTelemetry(selectedSpaceData.value, parsed);
    }
    dateInputText.value = formatYMDHMS(parsed);
    isEditingDate.value = false;
  }
};

const SCENE = new SceneMaker(1 / 555555555);
const SpaceObjectStorage = new ObjectsStorage();
const sprites: THREE.Sprite[] = [];
const MAX_DISTANCE = 950_000_000_000 * 20 * SCENE.scale;

let animationFrameId: number | null = null;
let lastRealTime = performance.now();

// Список тел, их данные и 3D-орбиты
interface BodyConfigItem {
  id: string; // NASA Horizons COMMAND ID
  name: string;
  center: string;
  data: SpaceObjectData;
  body: THREE.Mesh;
  orbitLine?: THREE.Line;
}
const allBodiesConfig: BodyConfigItem[] = [];
const animatedPlanets: { body: THREE.Mesh; data: SpaceObjectData }[] = [];

onMounted(() => {
  if (!orbitCanvas.value) return;

  dateInputText.value = formatYMDHMS(new Date(simTimeMs.value));

  SCENE.addSkybox("images/textures/skybox.jpg");
  SCENE.createCamera(75, 0.001, MAX_DISTANCE);
  SCENE.makeRender(orbitCanvas.value);
  SCENE.makeControls(1.0, 1.2, 0.8);

  // Масштабирование орбитальных элементов
  MERCURY.setScale(SCENE.scale);
  VENUS.setScale(SCENE.scale);
  EARTH.setScale(SCENE.scale);
  MARS.setScale(SCENE.scale);
  JUPITER.setScale(SCENE.scale);
  SATURN.setScale(SCENE.scale);
  URANUS.setScale(SCENE.scale);
  NEPTUNE.setScale(SCENE.scale);
  MOON.setScale(SCENE.scale);
  MOON.basePoint = [0, 0, 0]; // Центр орбиты Луны привязывается к позиции Земли

  const MercuryVisualizer = new Visualizer(MERCURY, "Меркурий");
  const VenusVisualizer = new Visualizer(VENUS, "Венера");
  const EarthVisualizer = new Visualizer(EARTH, "Земля");
  const MarsVisualizer = new Visualizer(MARS, "Марс");
  const JupiterMarsVisualizer = new Visualizer(JUPITER, "Юпитер");
  const SaturnVisualizer = new Visualizer(SATURN, "Сатурн");
  const UranusVisualizer = new Visualizer(URANUS, "Уран");
  const NeptuneVisualizer = new Visualizer(NEPTUNE, "Нептун");
  const MoonVisualizer = new Visualizer(MOON, "Луна");

  // Линии орбит в точном 3D пространстве
  const mercuryOrbit = MercuryVisualizer.getOrbit("#838383");
  const venusOrbit = VenusVisualizer.getOrbit("#f39932");
  const earthOrbit = EarthVisualizer.getOrbit("#3289f3");
  const marsOrbit = MarsVisualizer.getOrbit("#f33232");
  const jupiterOrbit = JupiterMarsVisualizer.getOrbit("#d37811");
  const saturnVOrbit = SaturnVisualizer.getOrbit("#f3b632");
  const uranusVOrbit = UranusVisualizer.getOrbit("#3293f3");
  const neptuneOrbit = NeptuneVisualizer.getOrbit("#3259f3");
  const moonOrbit = MoonVisualizer.getOrbit("#818181");
  moonOrbitRef = moonOrbit;

  SCENE.scene.add(mercuryOrbit, venusOrbit, earthOrbit, marsOrbit, jupiterOrbit, saturnVOrbit, uranusVOrbit, neptuneOrbit, moonOrbit);
  SpaceObjectStorage.addOrbits(mercuryOrbit, venusOrbit, earthOrbit, marsOrbit, jupiterOrbit, saturnVOrbit, uranusVOrbit, neptuneOrbit, moonOrbit);

  // Планеты
  const sunSphere = addSun(SUN);
  sunSphereRef = sunSphere;

  const mercurySphere = MercuryVisualizer.getSphere(SCENE.scale, "mercury");
  const venusSphere = VenusVisualizer.getSphere(SCENE.scale, "venus");
  const earthSphere = EarthVisualizer.getSphere(SCENE.scale, "earth");
  earthSphereRef = earthSphere;
  const marsSphere = MarsVisualizer.getSphere(SCENE.scale, "mars");
  const jupiterSphere = JupiterMarsVisualizer.getSphere(SCENE.scale, "jupiter");
  const saturnSphere = SaturnVisualizer.getSphere(SCENE.scale, "saturn");
  const uranusSphere = UranusVisualizer.getSphere(SCENE.scale, "uranus");
  const neptuneSphere = NeptuneVisualizer.getSphere(SCENE.scale, "neptune");
  const moonSphere = MoonVisualizer.getSphere(SCENE.scale, "moon");
  moonSphereRef = moonSphere;

  SCENE.scene.add(mercurySphere, venusSphere, earthSphere, marsSphere, jupiterSphere, saturnSphere, uranusSphere, neptuneSphere, moonSphere);

  SpaceObjectStorage.addSpaceObject(mercurySphere, MERCURY);
  SpaceObjectStorage.addSpaceObject(venusSphere, VENUS);
  SpaceObjectStorage.addSpaceObject(earthSphere, EARTH);
  SpaceObjectStorage.addSpaceObject(marsSphere, MARS);
  SpaceObjectStorage.addSpaceObject(jupiterSphere, JUPITER);
  SpaceObjectStorage.addSpaceObject(saturnSphere, SATURN);
  SpaceObjectStorage.addSpaceObject(uranusSphere, URANUS);
  SpaceObjectStorage.addSpaceObject(neptuneSphere, NEPTUNE);
  SpaceObjectStorage.addSpaceObject(moonSphere, MOON);

  animatedPlanets.push(
      { body: mercurySphere, data: MERCURY },
      { body: venusSphere, data: VENUS },
      { body: earthSphere, data: EARTH },
      { body: marsSphere, data: MARS },
      { body: jupiterSphere, data: JUPITER },
      { body: saturnSphere, data: SATURN },
      { body: uranusSphere, data: URANUS },
      { body: neptuneSphere, data: NEPTUNE },
  );

  // Конфигурация тел для запросов к NASA Horizons (барицентры планет 1-8 и Луна 301)
  allBodiesConfig.push(
      { id: '1', name: 'Меркурий', center: '500@10', data: MERCURY, body: mercurySphere, orbitLine: mercuryOrbit },
      { id: '2', name: 'Венера', center: '500@10', data: VENUS, body: venusSphere, orbitLine: venusOrbit },
      { id: '3', name: 'Земля', center: '500@10', data: EARTH, body: earthSphere, orbitLine: earthOrbit },
      { id: '4', name: 'Марс', center: '500@10', data: MARS, body: marsSphere, orbitLine: marsOrbit },
      { id: '5', name: 'Юпитер', center: '500@10', data: JUPITER, body: jupiterSphere, orbitLine: jupiterOrbit },
      { id: '6', name: 'Сатурн', center: '500@10', data: SATURN, body: saturnSphere, orbitLine: saturnVOrbit },
      { id: '7', name: 'Уран', center: '500@10', data: URANUS, body: uranusSphere, orbitLine: uranusVOrbit },
      { id: '8', name: 'Нептун', center: '500@10', data: NEPTUNE, body: neptuneSphere, orbitLine: neptuneOrbit },
      { id: '301', name: 'Луна', center: '500@3', data: MOON, body: moonSphere, orbitLine: moonOrbit },
  );

  // Спрайты-маркеры для кликабельности и видимости на больших дистанциях
  const mercurySprite = EarthVisualizer.getSprite();
  const venusSprite = EarthVisualizer.getSprite();
  const earthSprite = EarthVisualizer.getSprite();
  const marsSprite = EarthVisualizer.getSprite();
  const jupiterSprite = JupiterMarsVisualizer.getSprite();
  const saturnSprite = SaturnVisualizer.getSprite();
  const uranusSprite = UranusVisualizer.getSprite();
  const neptuneSprite = NeptuneVisualizer.getSprite();
  const moonSprite = MoonVisualizer.getSprite();

  mercurySphere.add(mercurySprite);
  venusSphere.add(venusSprite);
  earthSphere.add(earthSprite);
  marsSphere.add(marsSprite);
  jupiterSphere.add(jupiterSprite);
  saturnSphere.add(saturnSprite);
  uranusSphere.add(uranusSprite);
  neptuneSphere.add(neptuneSprite);
  moonSphere.add(moonSprite);

  sprites.push(mercurySprite, venusSprite, earthSprite, marsSprite, jupiterSprite, saturnSprite, uranusSprite, neptuneSprite, moonSprite);

  // Кольца Сатурна в его экваториальной плоскости
  const saturnRing = createRing(85_000_000 * SCENE.scale, 136_500_000 * SCENE.scale, 256, 0, 0, "saturn-ring");
  saturnSphere.add(saturnRing);

  // Камера: общий вид на систему
  SCENE.setCameraToObject(neptuneOrbit);
  SCENE.focusOn(sunSphere);

  // Установка начальных позиций планет на текущую выбранную дату
  updatePlanetsPositions(new Date(simTimeMs.value));

  lastRealTime = performance.now();

  // Основной цикл анимации
  const animate = (currentTime: number) => {
    animationFrameId = requestAnimationFrame(animate);

    const deltaRealMs = Math.min(currentTime - lastRealTime, 500);
    lastRealTime = currentTime;

    if (!isPaused.value) {
      const sign = isReversed.value ? -1 : 1;
      simTimeMs.value += deltaRealMs * timeSpeed.value * sign;
    }

    const simDate = new Date(simTimeMs.value);

    // Обновляем текстовое поле только когда пользователь не редактирует его вручную
    if (!isEditingDate.value) {
      dateInputText.value = formatYMDHMS(simDate);
    }

    updatePlanetsPositions(simDate);

    // Следование камеры за выбранным объектом при его орбитальном движении
    if (focusedObject.value) {
      const currentPlanetPos = focusedObject.value.position;
      if (lastTrackedObject === focusedObject.value && lastTrackedPos) {
        // Добавляем только относительное смещение планеты по орбите за текущий кадр
        const deltaPlanet = new THREE.Vector3().subVectors(currentPlanetPos, lastTrackedPos);
        SCENE.camera.position.add(deltaPlanet);
        SCENE.controls.target.add(deltaPlanet);
      }
      if (!lastTrackedPos) {
        lastTrackedPos = new THREE.Vector3();
      }
      lastTrackedPos.copy(currentPlanetPos);
      lastTrackedObject = focusedObject.value;
    } else {
      lastTrackedObject = null;
      lastTrackedPos = null;
    }

    // Обновление телеметрии в реальном времени для выбранного объекта
    if (selectedSpaceData.value) {
      updateLiveTelemetry(selectedSpaceData.value, simDate);
    }

    SCENE.controls.update();
    SCENE.renderer.render(SCENE.scene, SCENE.camera);

    // Масштабирование спрайтов в зависимости от расстояния до камеры
    SpaceObjectStorage.spaceBodiesObjects.forEach(p => {
      const scaleFactor = 28;
      if (p.children.length > 0) {
        for (let i = 0; i < p.children.length; i++) {
          if (p.children[i].type === "Sprite") {
            const scale = new THREE.Vector3().subVectors(p.position, SCENE.camera.position).length() / scaleFactor;
            p.children[i].scale.set(scale, scale, 1);
            break;
          }
        }
      }
    });
  };

  animationFrameId = requestAnimationFrame(animate);

  window.addEventListener('pointerdown', onPointerDown, false);
  window.addEventListener('click', onClick, false);
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('resize', onWindowResize, false);
  if (orbitCanvas.value) {
    orbitCanvas.value.addEventListener('contextmenu', onContextMenu, false);
  }
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('pointerdown', onPointerDown);
  window.removeEventListener('click', onClick);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('resize', onWindowResize);
  if (orbitCanvas.value) {
    orbitCanvas.value.removeEventListener('contextmenu', onContextMenu);
  }
});

// Функция обновления позиций и суточного вращения всех планет на заданную дату
const updatePlanetsPositions = (simDate: Date) => {
  // 1. Позиция Земли
  const earthPos = EARTH.getPositionAtDate(simDate);
  if (earthSphereRef) {
    earthSphereRef.position.set(earthPos[0], earthPos[1], earthPos[2]);
  }

  // 2. Орбита и позиция Луны (относительно Земли)
  if (moonOrbitRef) {
    moonOrbitRef.position.set(earthPos[0], earthPos[1], earthPos[2]);
  }
  if (moonSphereRef) {
    const moonRelPos = MOON.getPositionAtDate(simDate);
    moonSphereRef.position.set(
        earthPos[0] + moonRelPos[0],
        earthPos[1] + moonRelPos[1],
        earthPos[2] + moonRelPos[2]
    );
  }

  // 3. Остальные планеты
  for (const item of animatedPlanets) {
    if (item.data === EARTH) continue;
    const pos = item.data.getPositionAtDate(simDate);
    item.body.position.set(pos[0], pos[1], pos[2]);
  }

  // 4. Суточное вращение вокруг оси (по точной физической угловой скорости rotRate из эфемерид)
  const deltaSec = (simDate.getTime() - EPHEMERIS_EPOCH_MS) / 1000;
  for (const item of animatedPlanets) {
    if (item.data.rotationRate) {
      item.body.rotation.y = (deltaSec * item.data.rotationRate) % (Math.PI * 2);
    }
  }
  if (moonSphereRef && MOON.rotationRate) {
    moonSphereRef.rotation.y = (deltaSec * MOON.rotationRate) % (Math.PI * 2);
  }
  if (sunSphereRef) {
    // Вращение Солнца (период ~25.38 дней)
    sunSphereRef.rotation.y = (deltaSec * 0.00000286) % (Math.PI * 2);
  }
};

const updateLiveTelemetry = (data: SpaceObjectData, date: Date) => {
  about.distanceKm = data.getDistanceAtDate(date) / 1000; // в км
  about.orbitalSpeed = data.getOrbitalSpeedAtDate(date);
  about.trueAnomaly = data.getTrueAnomalyAtDate(date);
};

// Функция запроса к NASA JPL Horizons с поддержкой прокси и фоллбэка
const fetchHorizonsData = async (cmdId: string, center: string, dateStr: string): Promise<string> => {
  const queryObj = {
    format: 'json',
    COMMAND: `'${cmdId}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'ELEMENTS',
    CENTER: `'${center}'`,
    START_TIME: `'${dateStr}'`,
    STOP_TIME: `'${dateStr}'`,
    STEP_SIZE: '1d',
  };
  const qs = new URLSearchParams(queryObj).toString();

  // 1. Попытка через локальный прокси Vite dev сервера
  try {
    const res = await fetch(`/api/horizons?${qs}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.result) return json.result;
    }
  } catch (_) {}

  // 2. Прямой запрос к NASA Horizons API
  try {
    const res = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${qs}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.result) return json.result;
    }
  } catch (_) {}

  // 3. Фоллбэк через публичный CORS прокси для GitHub Pages / Static Hosting
  const target = `https://ssd.jpl.nasa.gov/api/horizons.api?${qs}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const parsed = JSON.parse(json.contents);
  return parsed.result;
};

// Калибровка и получение точных позиций с сайта NASA Horizons
const syncWithNasa = async () => {
  if (isSyncingNasa.value) return;

  isSyncingNasa.value = true;
  nasaStatusMsg.value = '';
  nasaStatusType.value = '';

  const simDate = new Date(simTimeMs.value);
  const Y = simDate.getUTCFullYear();
  const M = String(simDate.getUTCMonth() + 1).padStart(2, '0');
  const D = String(simDate.getUTCDate()).padStart(2, '0');
  const h = String(simDate.getUTCHours()).padStart(2, '0');
  const m = String(simDate.getUTCMinutes()).padStart(2, '0');
  const dateStr = `${Y}-${M}-${D} ${h}:${m}`;

  let successCount = 0;

  try {
    for (let i = 0; i < allBodiesConfig.length; i++) {
      const item = allBodiesConfig[i];
      nasaSyncStepText.value = `NASA (${i + 1}/${allBodiesConfig.length}): ${item.name}...`;

      try {
        const resultText = await fetchHorizonsData(item.id, item.center, dateStr);
        const soe = resultText.indexOf('$$SOE');
        const eoe = resultText.indexOf('$$EOE');

        if (soe !== -1 && eoe !== -1) {
          const block = resultText.substring(soe + 5, eoe).trim();
          item.data.updateOrbitalElements(block);

          // Обновляем геометрию 3D-орбиты под новые элементы NASA
          if (item.orbitLine) {
            item.orbitLine.geometry.dispose();
            item.orbitLine.geometry = new THREE.BufferGeometry().setFromPoints(item.data.getPlanetOrbit3DPoints(1500));
          }
          successCount++;
        }
      } catch (err) {
        console.warn(`Не удалось обновить эфемериды для ${item.name}:`, err);
      }

      // Небольшая пауза между запросами во избежание rate-limit
      await new Promise(r => setTimeout(r, 60));
    }

    // Мгновенное обновление позиций на сцене
    updatePlanetsPositions(simDate);

    if (selectedSpaceData.value) {
      updateLiveTelemetry(selectedSpaceData.value, simDate);
    }

    if (successCount > 0) {
      nasaStatusType.value = 'success';
      nasaStatusMsg.value = `✓ NASA: ${successCount} тел откалибровано на ${Y}-${M}-${D}`;
    } else {
      nasaStatusType.value = 'error';
      nasaStatusMsg.value = `Ошибка связи с NASA API`;
    }
  } catch (error) {
    console.error('Ошибка при синхронизации с NASA:', error);
    nasaStatusType.value = 'error';
    nasaStatusMsg.value = `Ошибка запроса к NASA`;
  } finally {
    isSyncingNasa.value = false;
    nasaSyncStepText.value = '';
    // Скрываем статус через 7 секунд
    setTimeout(() => {
      nasaStatusMsg.value = '';
    }, 7000);
  }
};

// Управление временем
const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const toggleDirection = () => {
  isReversed.value = !isReversed.value;
};

const setSpeed = (val: number) => {
  timeSpeed.value = val;
};

const stepSpeedUp = () => {
  const currentIndex = SPEED_PRESETS.findIndex(p => p.value === timeSpeed.value);
  if (currentIndex !== -1 && currentIndex < SPEED_PRESETS.length - 1) {
    timeSpeed.value = SPEED_PRESETS[currentIndex + 1].value;
  } else {
    timeSpeed.value = Math.round(timeSpeed.value * 2);
  }
};

const stepSpeedDown = () => {
  const currentIndex = SPEED_PRESETS.findIndex(p => p.value === timeSpeed.value);
  if (currentIndex > 0) {
    timeSpeed.value = SPEED_PRESETS[currentIndex - 1].value;
  } else {
    timeSpeed.value = Math.max(1, Math.round(timeSpeed.value / 2));
  }
};

const jumpToNow = () => {
  simTimeMs.value = Date.now();
  const d = new Date(simTimeMs.value);
  updatePlanetsPositions(d);
  dateInputText.value = formatYMDHMS(d);
  isEditingDate.value = false;
};

const resetCameraToSun = () => {
  if (sunSphereRef) {
    SCENE.focusOn(sunSphereRef);
    focusedObject.value = null; // Солнце неподвижно в центре, не блокируем свободное панорамирование
  }
};

const focusOnBody = (object: THREE.Object3D) => {
  focusedObject.value = object;
  selectedMesh.value = object;
  lastTrackedObject = object;
  lastTrackedPos = object.position.clone();
  SCENE.focusOn(object);
};

const reFocusCurrentPlanet = () => {
  if (selectedMesh.value) {
    focusOnBody(selectedMesh.value);
  }
};

const clearSelection = () => {
  about.planetName = "";
  about.description = "";
  about.distanceKm = 0;
  selectedSpaceData.value = null;
  selectedMesh.value = null;
  isPlanetInfoCollapsed.value = false;
  focusedObject.value = null;
};

const onContextMenu = (e: MouseEvent) => {
  e.preventDefault();
};

const onPointerDown = (event: PointerEvent) => {
  pointerDownPos = { x: event.clientX, y: event.clientY };
  // Если пользователь нажал правую (2) или среднюю (1) кнопку мыши — он начинает панорамирование
  if (event.button === 2 || event.button === 1) {
    focusedObject.value = null;
  }
};

const onClick = (event: MouseEvent) => {
  // Игнорируем клики по элементам управления UI
  const target = event.target as HTMLElement;
  if (target && target.closest('.no-raycast, button, input, label')) {
    return;
  }

  // Если был перенос мыши (вращение или панорамирование), не считаем это кликом
  const dragDist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
  if (dragDist > 6) {
    return;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, SCENE.camera);
  const intersects = raycaster.intersectObjects(SCENE.scene.children);

  if (intersects.length > 0) {
    // 1. Клик по спрайту
    const spriteIndex = intersects.findIndex(obj => sprites.indexOf(obj.object as THREE.Sprite) !== -1);
    if (spriteIndex !== -1) {
      const spaceObject = intersects[spriteIndex].object.parent;
      if (spaceObject) {
        showSpaceObjectDetail(spaceObject);
        focusOnBody(spaceObject);
        return;
      }
    }

    // 2. Клик по небесному телу
    const spaceObjectIndex = intersects.findIndex(obj => SpaceObjectStorage.spaceBodiesObjects.indexOf(obj.object as THREE.Mesh) !== -1);
    if (spaceObjectIndex !== -1) {
      const spaceObject = intersects[spaceObjectIndex].object;
      showSpaceObjectDetail(spaceObject);
      focusOnBody(spaceObject);
    }
  } else {
    // Клик по пустому пространству — отвязываем слежение камеры
    focusedObject.value = null;
  }
};

const onKeyDown = (e: KeyboardEvent) => {
  // Не перехватываем горячие клавиши, если фокус в текстовом поле
  if ((e.target as HTMLElement).tagName === 'INPUT') return;

  if (e.code === 'Space') {
    e.preventDefault();
    togglePause();
  } else if (e.code === 'ArrowRight') {
    stepSpeedUp();
  } else if (e.code === 'ArrowLeft') {
    stepSpeedDown();
  }
};

const onWindowResize = () => {
  if (!orbitCanvas.value) return;
  SCENE.camera.aspect = window.innerWidth / window.innerHeight;
  SCENE.camera.updateProjectionMatrix();
  SCENE.renderer.setSize(window.innerWidth, window.innerHeight);
};

const showSpaceObjectDetail = (object: THREE.Object3D) => {
  const data = SpaceObjectStorage.getSpaceObjectData(object);
  if (data == null) return;
  about.planetName = object.name;
  about.isMoon = object.name === "Луна";
  selectedSpaceData.value = data;
  selectedMesh.value = object;
  isPlanetInfoCollapsed.value = false; // Автоматически раскрываем карточку при выборе новой планеты
  updateLiveTelemetry(data, new Date(simTimeMs.value));

  // Очистка и форматирование описания без неразрывных пробелов и двойных скроллбаров
  const match = data.ephemeris.match(/\*+([\s\S]+?)\*+/);
  if (match) {
    const lines = match[1]
        .split('\n')
        .map(l => l.replace(/^\s{2,10}/, ''))
        .filter(l => !l.trim().startsWith('***'));
    about.description = lines.join('\n').trim();
  } else {
    about.description = "";
  }
};

const addSun = (sun: SpaceObjectData): THREE.Mesh => {
  const texture = new TextureLoader().load(`images/textures/sun.jpg`);
  const sphereGeometry = new THREE.SphereGeometry(sun.meanRadius * SCENE.scale, 128, 128);
  const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const SunSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  SunSphere.name = "Солнце";
  SCENE.scene.add(SunSphere);

  const light = new THREE.PointLight(0xffffff, 6, MAX_DISTANCE, 0.1);
  SCENE.scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
  SCENE.scene.add(ambientLight);

  SpaceObjectStorage.addSpaceObject(SunSphere, SUN);
  return SunSphere;
};

const toggleOrbits = () => {
  if (options.showOrbits) {
    SCENE.scene.remove(...SpaceObjectStorage.orbits);
    options.showOrbits = false;
  } else {
    SCENE.scene.add(...SpaceObjectStorage.orbits);
    options.showOrbits = true;
  }
};
</script>

<style>
canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.main-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.container {
  padding: 1rem 1.2rem;
  color: #f3f4f6;
  font-size: 0.75rem;
  text-align: left;
  font-family: monospace, system-ui;
  background-color: rgba(18, 22, 31, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
  transition: all 0.25s ease;
  z-index: 10;
}

.container:hover {
  background-color: rgba(18, 22, 31, 0.95);
}

/* Карточка планеты: адаптивная ширина, сворачивание */
.planet-info {
  top: 1rem;
  left: 1rem;
  width: min(560px, 92vw);
  max-height: 84vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.planet-info.is-collapsed {
  width: auto;
  min-width: 200px;
  max-width: 380px;
  padding: 0.6rem 0.9rem;
}

.planet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.planet-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.mini-summary {
  font-size: 0.75rem;
  color: #60a5fa;
  font-weight: normal;
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.small-btn {
  padding: 0.2rem 0.5rem;
  font-size: 0.85rem;
  border-radius: 4px;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #9ca3af;
  cursor: pointer;
  padding: 0.2rem 0.45rem;
  font-size: 0.7rem;
}
.icon-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.close-btn {
  background: transparent;
  color: #9ca3af;
  border: none;
  cursor: pointer;
}
.close-btn:hover {
  color: #fff;
}

.planet-body {
  margin-top: 0.6rem;
}

.telemetry {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.65rem 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 0.6rem;
}

.telemetry-row {
  display: flex;
  justify-content: space-between;
  color: #d1d5db;
  font-size: 0.78rem;
}

.telemetry-row strong {
  color: #60a5fa;
}

.desc-wrapper {
  margin-top: 0.4rem;
}

.desc-content {
  margin-top: 0.5rem;
  width: 100%;
}

/* Преформатированный блок: естественные пробелы, без обрезки по ширине */
.desc-pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.72rem;
  line-height: 1.45;
  color: #d1d5db;
  white-space: pre;
  background: rgba(0, 0, 0, 0.45);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.toggle-button {
  margin: 4px 0;
  display: block;
  width: 100%;
}

.settings {
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Панель управления временем */
.time-controls-panel {
  position: absolute;
  bottom: 1.2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 20, 28, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  color: #f3f4f6;
  font-family: monospace, system-ui, sans-serif;
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
  max-width: 95vw;
  z-index: 100;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 15px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.time-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.4rem;
}

.current-date-text {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}

.calendar-icon {
  font-size: 0.9rem;
}

.date-str {
  color: #60a5fa;
  font-size: 0.88rem;
}

.jd-str {
  color: #9ca3af;
  font-size: 0.72rem;
}

.status-badges-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  font-size: 0.72rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.active-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.paused-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.nasa-success-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.4);
}

.nasa-error-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.4);
}

.collapse-toggle-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #9ca3af;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.15rem 0.45rem;
  font-size: 0.7rem;
  transition: all 0.15s;
}

.collapse-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* Компактная свернутая нижняя плашка */
.time-controls-collapsed {
  position: absolute;
  bottom: 1.2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 20, 28, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 9999px;
  padding: 0.45rem 1rem;
  color: #f3f4f6;
  font-family: monospace, system-ui, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s ease;
  animation: slideUp 0.25s ease-out;
}

.time-controls-collapsed:hover {
  background: rgba(20, 27, 38, 0.98);
  border-color: rgba(96, 165, 250, 0.4);
  transform: translateX(-50%) translateY(-2px);
}

.mini-play-btn {
  background: rgba(59, 130, 246, 0.3);
  border: 1px solid #3b82f6;
  color: #93c5fd;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0;
  transition: all 0.15s;
}

.mini-play-btn:hover {
  background: #2563eb;
  color: #fff;
}

.collapsed-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.collapsed-calendar {
  font-size: 0.85rem;
}

.collapsed-date {
  color: #60a5fa;
  font-size: 0.82rem;
  font-weight: 600;
}

.mini-expand-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #d1d5db;
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.15s;
}

.mini-expand-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.time-actions-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.76rem;
  font-weight: 500;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(96, 165, 250, 0.6);
  color: #fff;
}

.control-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.play-btn {
  min-width: 85px;
}

.play-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  color: #93c5fd;
}

.dir-btn.active {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  color: #fca5a5;
}

.nasa-btn {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(167, 139, 250, 0.4);
  color: #c4b5fd;
}

.nasa-btn:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.35);
  border-color: #a78bfa;
  color: #fff;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.loading-btn {
  background: rgba(139, 92, 246, 0.35);
  border-color: #a78bfa;
}

.loading-label {
  display: inline-block;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.datetime-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.25rem 0.55rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.picker-label {
  color: #9ca3af;
  font-size: 0.72rem;
  white-space: nowrap;
}

.datetime-input {
  background: transparent;
  border: none;
  color: #60a5fa;
  font-family: inherit;
  font-size: 0.78rem;
  outline: none;
  width: 155px;
  letter-spacing: 0.02em;
}

.datetime-input::placeholder {
  color: rgba(156, 163, 175, 0.5);
}

.calendar-picker-label {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
  transition: background 0.15s;
}

.calendar-picker-label:hover {
  background: rgba(255, 255, 255, 0.2);
}

.native-picker-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.apply-btn {
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(96, 165, 250, 0.4);
  color: #93c5fd;
}

.apply-btn:hover {
  background: rgba(59, 130, 246, 0.45);
  border-color: #60a5fa;
  color: #fff;
}

.quick-jumps {
  display: flex;
  gap: 0.4rem;
}

.speed-presets-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding-top: 0.2rem;
}

.speed-title {
  color: #9ca3af;
  font-size: 0.72rem;
}

.presets-group {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 0.25rem 0.55rem;
  font-size: 0.72rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(96, 165, 250, 0.5);
  color: #fff;
}

.preset-btn.active-preset {
  background: #2563eb;
  border-color: #60a5fa;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
}

.speed-stepper {
  display: flex;
  gap: 0.2rem;
  margin-left: auto;
}

.step-btn {
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d1d5db;
  cursor: pointer;
}

.step-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

@media (max-width: 768px) {
  .planet-info {
    width: 95vw;
    left: 2.5vw;
    top: 0.5rem;
    max-height: 70vh;
  }
  .time-controls-panel {
    bottom: 0.5rem;
    padding: 0.6rem 0.8rem;
    max-width: 98vw;
    font-size: 0.72rem;
  }
  .presets-group {
    overflow-x: auto;
    max-width: 100%;
  }
}
</style>

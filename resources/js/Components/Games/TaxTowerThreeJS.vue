<template>
  <div ref="containerRef" class="threejs-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import confetti from 'canvas-confetti';

const props = defineProps({
  currentFloor: {
    type: Number,
    default: 0
  },
  totalFloors: {
    type: Number,
    default: 15
  },
  isClimbing: {
    type: Boolean,
    default: false
  },
  isFalling: {
    type: Boolean,
    default: false
  },
  isVictory: {
    type: Boolean,
    default: false
  },
  selectedCharacter: {
    type: String,
    default: 'male-professional'
  }
});

const emit = defineEmits(['ready', 'animation-complete']);

const containerRef = ref(null);
let scene, camera, renderer, controls;
let building, character, floors = [];
let animationFrameId;
let clock = new THREE.Clock();

// Character colors based on selection
const characterColors = {
  'male-professional': 0x1e40af,
  'female-professional': 0x7c3aed,
  'young-male': 0x10b981,
  'young-female': 0xec4899,
  'athlete-male': 0x2563eb,
  'athlete-female': 0x8b5cf6
};

onMounted(() => {
  initThreeJS();
  animate();
  emit('ready');
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (controls) {
    controls.dispose();
  }
});

// Initialize Three.js Scene
const initThreeJS = () => {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue
  scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(25, 30, 50);
  camera.lookAt(0, 20, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  containerRef.value.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 20;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2;
  controls.target.set(0, 20, 0);

  // Lights
  setupLights();

  // Ground
  createGround();

  // Building
  createBuilding();

  // Character
  createCharacter();

  // Clouds
  createClouds();

  // Handle resize
  window.addEventListener('resize', handleResize);
};

// Setup Lighting
const setupLights = () => {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 200;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Hemisphere light for sky/ground color
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.5);
  scene.add(hemisphereLight);

  // Point lights for building highlights
  const pointLight1 = new THREE.PointLight(0xfbbf24, 0.5, 30);
  pointLight1.position.set(-10, 25, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xfbbf24, 0.5, 30);
  pointLight2.position.set(10, 25, 10);
  scene.add(pointLight2);
};

// Create Ground
const createGround = () => {
  const groundGeometry = new THREE.CircleGeometry(60, 64);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grass texture simulation with small details
  const grassGroup = new THREE.Group();
  for (let i = 0; i < 200; i++) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.3, 3),
      new THREE.MeshStandardMaterial({ color: 0x22c55e })
    );
    blade.position.set(
      (Math.random() - 0.5) * 50,
      0.15,
      (Math.random() - 0.5) * 50
    );
    blade.rotation.x = Math.PI;
    grassGroup.add(blade);
  }
  scene.add(grassGroup);
};

// Create Building with realistic 3D floors
const createBuilding = () => {
  building = new THREE.Group();
  const floorHeight = 3;
  const buildingWidth = 12;
  const buildingDepth = 10;

  for (let i = 0; i < props.totalFloors; i++) {
    const floorGroup = new THREE.Group();
    
    // Main floor structure
    const floorGeometry = new THREE.BoxGeometry(buildingWidth, floorHeight, buildingDepth);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: i <= props.currentFloor ? 0x3b82f6 : 0x9ca3af,
      roughness: 0.7,
      metalness: 0.3,
      emissive: i <= props.currentFloor ? 0x1e40af : 0x000000,
      emissiveIntensity: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = i * floorHeight + floorHeight / 2;
    floor.castShadow = true;
    floor.receiveShadow = true;
    floorGroup.add(floor);

    // Windows
    const windowPositions = [
      [-4, 0, buildingDepth / 2 + 0.01],
      [-2, 0, buildingDepth / 2 + 0.01],
      [0, 0, buildingDepth / 2 + 0.01],
      [2, 0, buildingDepth / 2 + 0.01],
      [4, 0, buildingDepth / 2 + 0.01]
    ];

    windowPositions.forEach(pos => {
      const windowGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.1);
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: i <= props.currentFloor ? 0xfde047 : 0x374151,
        emissive: i <= props.currentFloor ? 0xfbbf24 : 0x000000,
        emissiveIntensity: i <= props.currentFloor ? 0.8 : 0,
        roughness: 0.1,
        metalness: 0.9
      });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(pos[0], i * floorHeight + floorHeight / 2, pos[2]);
      floorGroup.add(window);
    });

    // Balcony every 5 floors
    if ((i + 1) % 5 === 0) {
      const balconyGeometry = new THREE.BoxGeometry(buildingWidth + 1, 0.3, 1.5);
      const balconyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4b5563,
        roughness: 0.8
      });
      const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
      balcony.position.y = (i + 1) * floorHeight;
      balcony.position.z = buildingDepth / 2 + 0.5;
      balcony.castShadow = true;
      floorGroup.add(balcony);
    }

    floorGroup.userData.floorNumber = i;
    floors.push(floorGroup);
    building.add(floorGroup);
  }

  // Roof
  const roofGeometry = new THREE.ConeGeometry(buildingWidth * 0.7, 4, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.6
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = props.totalFloors * floorHeight + 2;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  building.add(roof);

  scene.add(building);
};

// Create Character
const createCharacter = () => {
  character = new THREE.Group();
  
  const characterColor = characterColors[props.selectedCharacter] || 0x1e40af;
  
  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: characterColor,
    roughness: 0.5,
    metalness: 0.3
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1;
  body.castShadow = true;
  character.add(body);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.6
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 2;
  head.castShadow = true;
  character.add(head);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.12, 2.1, 0.3);
  character.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.12, 2.1, 0.3);
  character.add(rightEye);

  // Arms
  const armGeometry = new THREE.CapsuleGeometry(0.15, 0.8, 8, 16);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: characterColor,
    roughness: 0.5
  });
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.5, 1.2, 0);
  leftArm.rotation.z = Math.PI / 6;
  leftArm.castShadow = true;
  character.add(leftArm);
  character.userData.leftArm = leftArm;
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.5, 1.2, 0);
  rightArm.rotation.z = -Math.PI / 6;
  rightArm.castShadow = true;
  character.add(rightArm);
  character.userData.rightArm = rightArm;

  // Legs
  const legGeometry = new THREE.CapsuleGeometry(0.18, 0.9, 8, 16);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.7
  });
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.2, 0.2, 0);
  leftLeg.castShadow = true;
  character.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.2, 0.2, 0);
  rightLeg.castShadow = true;
  character.add(rightLeg);

  character.position.set(0, 0.5, 6);
  scene.add(character);
};

// Create Clouds
const createClouds = () => {
  const cloudGroup = new THREE.Group();
  
  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Group();
    
    // Multiple spheres to create cloud shape
    for (let j = 0; j < 5; j++) {
      const cloudGeometry = new THREE.SphereGeometry(
        1 + Math.random() * 1.5,
        16,
        16
      );
      const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        roughness: 1
      });
      const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloudPart.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 2
      );
      cloud.add(cloudPart);
    }
    
    cloud.position.set(
      (Math.random() - 0.5) * 80,
      30 + Math.random() * 20,
      (Math.random() - 0.5) * 80
    );
    cloud.userData.speed = 0.02 + Math.random() * 0.03;
    cloudGroup.add(cloud);
  }
  
  scene.add(cloudGroup);
  scene.userData.clouds = cloudGroup;
};

// Animation Loop
const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  
  // Update controls
  if (controls) {
    controls.update();
  }
  
  // Animate character idle
  if (character && !props.isClimbing && !props.isFalling) {
    character.position.y = 0.5 + Math.sin(elapsed * 2) * 0.1;
    character.rotation.y = Math.sin(elapsed * 0.5) * 0.1;
    
    // Arm swing
    if (character.userData.leftArm) {
      character.userData.leftArm.rotation.z = Math.PI / 6 + Math.sin(elapsed * 3) * 0.2;
    }
    if (character.userData.rightArm) {
      character.userData.rightArm.rotation.z = -Math.PI / 6 - Math.sin(elapsed * 3) * 0.2;
    }
  }
  
  // Animate clouds
  if (scene.userData.clouds) {
    scene.userData.clouds.children.forEach(cloud => {
      cloud.position.x += cloud.userData.speed;
      if (cloud.position.x > 50) {
        cloud.position.x = -50;
      }
    });
  }
  
  // Render
  renderer.render(scene, camera);
};

// Handle window resize
const handleResize = () => {
  if (!containerRef.value) return;
  
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create the scene
const scene = new THREE.Scene();

// Set up a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

// Set up a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10); 
scene.add(pointLight);

// Load the 3D model with textures
const loader = new GLTFLoader();
let model;
loader.load(
    'cute_island_3d/scene.gltf',  
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.8, 0.8, 0.8); 
        scene.add(model);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Set up raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Handle mouse click event
window.addEventListener('click', (event) => {
    // Normalize mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check if the ray intersects any object in the scene
    const intersects = getIntersects(raycaster, scene.children);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // If the clicked object is part of your model, open the URL
        // check whether clickedObject is part of the model by checking its parent or the model itself
        if (model && (clickedObject === model || clickedObject.parent === model || isChildOf(clickedObject, model))) {
            window.open('https://threejs-journey.com/', '_blank');  // Replace with your desired URL
        }
    }
});

// Function to check if the object is part of the model (recursively)
function isChildOf(object, parent) {
    let currentObject = object;
    while (currentObject) {
        if (currentObject === parent) {
            return true;
        }
        currentObject = currentObject.parent;
    }
    return false;
}

// Function to recursively check all objects in the scene, including children
function getIntersects(raycaster, objects) {
    const intersects = [];
    objects.forEach((object) => {
        if (object.isMesh) {
            const intersect = raycaster.intersectObject(object);
            if (intersect.length > 0) {
                intersects.push(intersect[0]);
            }
        }
        // Recursively check for intersections in all child objects (if any)
        if (object.children.length > 0) {
            intersects.push(...getIntersects(raycaster, object.children));
        }
    });
    return intersects;
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

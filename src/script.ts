import { AssetLoader } from './classes/AssetLoader';
import { Viewer } from './classes/Viewer';
import './style.css';
import * as THREE from 'three';

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
const clock = new THREE.Clock();

if (!canvas) {
    throw new Error('Canvas not found!');
}

/**
 * Renderer
 */
THREE.ColorManagement.enabled = true;
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, // MSAA
});
renderer.setPixelRatio(1); // for DPI scaling set to window.devicePixelRatio
renderer.setSize(1, 1, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 2.0;

let viewer: Viewer;
const assetLoader = new AssetLoader();

const inputs: { [key: string]: HTMLInputElement } = {
    idle: document.getElementById('idle')! as HTMLInputElement,
    forward_walk: document.getElementById('forward_walk')! as HTMLInputElement,
    forward_run: document.getElementById('forward_run')! as HTMLInputElement,
    left_walk: document.getElementById('left_walk')! as HTMLInputElement,
    left_run: document.getElementById('left_run')! as HTMLInputElement,
    right_walk: document.getElementById('right_walk')! as HTMLInputElement,
    right_run: document.getElementById('right_run')! as HTMLInputElement,
};

const weights: { [key: string]: number } = {
    idle: 0,
    forward_walk: 0,
    forward_run: 0,
    left_walk: 0,
    left_run: 0,
    right_walk: 0,
    right_run: 0,
};

const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;

    const newValue = Number(target.value) * 0.01; // 0 - 1 range

    // Insert the value into the obj
    weights[target.id] = newValue;

    // Find out the sum of all weights
    let sum = 0;
    for (const key in weights) {
        sum += weights[key];
    }

    // Normalise our values
    if (sum !== 0) {
        for (const key in weights) {
            weights[key] /= sum;

            inputs[key].value = `${weights[key] * 100}`;
        }
    }
};

// event listeners
for (const input in inputs) {
    inputs[input].addEventListener('input', handleInput);
}

function init() {
    clock.start();

    viewer = new Viewer(renderer, canvas!, assetLoader);

    update();
}

function update() {
    // Calculate delta
    const delta = clock.getDelta();

    // Update the viewer
    viewer.update(delta);

    window.requestAnimationFrame(update);
}

assetLoader.load().then(() => {
    init();
});

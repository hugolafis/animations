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
    walk_forward: document.getElementById('walk_forward')! as HTMLInputElement,
    run_forward: document.getElementById('run_forward')! as HTMLInputElement,
    walk_left: document.getElementById('walk_left')! as HTMLInputElement,
    run_left: document.getElementById('run_left')! as HTMLInputElement,
    walk_right: document.getElementById('walk_right')! as HTMLInputElement,
    run_right: document.getElementById('run_right')! as HTMLInputElement,
};

const weights: { [key: string]: number } = {
    idle: 1,
    walk_forward: 0,
    run_forward: 0,
    walk_left: 0,
    run_left: 0,
    walk_right: 0,
    run_right: 0,
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
    viewer.update(delta, weights);

    window.requestAnimationFrame(update);
}

assetLoader.load().then(() => {
    init();
});

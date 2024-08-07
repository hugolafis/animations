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
renderer.toneMappingExposure = 1.0;

let viewer: Viewer;

const assetLoader = new AssetLoader();

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

//init();

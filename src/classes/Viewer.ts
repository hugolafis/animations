import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AssetLoader } from './AssetLoader';

export class Viewer {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private readonly scene: THREE.Scene;

    private readonly canvasSize: THREE.Vector2;
    private readonly renderSize: THREE.Vector2;

    private readonly character: THREE.Group;

    constructor(
        private readonly renderer: THREE.WebGLRenderer,
        private readonly canvas: HTMLCanvasElement,
        private readonly assetLoader: AssetLoader
    ) {
        this.canvasSize = new THREE.Vector2();
        this.renderSize = new THREE.Vector2();

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight);
        this.camera.position.set(1.2, 2, 1.5);

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.target.set(0, 0.8, 0);

        const sun = new THREE.DirectionalLight(0xffffff, Math.PI); // undo physically correct changes
        sun.position.copy(new THREE.Vector3(0.2, 1, 1).normalize());

        const dirLightLeft = new THREE.DirectionalLight(0x03fcec, 1);
        dirLightLeft.position.set(-1, 1, -0.5).normalize();

        const dirLightRight = new THREE.DirectionalLight(0xff5e00, 1.5);
        dirLightRight.position.set(1, 1, -0.5).normalize();

        const ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(sun, dirLightLeft, dirLightRight);
        this.scene.add(ambient);

        this.character = this.assetLoader.meshes.get('character')!;
        this.scene.add(this.character);

        const grid = new THREE.GridHelper(10, 10);
        this.scene.add(grid);
    }

    readonly update = (dt: number) => {
        this.controls.update();

        // Do we need to resize the renderer?
        this.canvasSize.set(
            Math.floor(this.canvas.parentElement!.clientWidth),
            Math.floor(this.canvas.parentElement!.clientHeight)
        );
        if (!this.renderSize.equals(this.canvasSize)) {
            this.renderSize.copy(this.canvasSize);
            this.renderer.setSize(this.renderSize.x, this.renderSize.y, false);

            this.camera.aspect = this.renderSize.x / this.renderSize.y;
            this.camera.updateProjectionMatrix();
        }

        this.renderer.render(this.scene, this.camera);
    };
}

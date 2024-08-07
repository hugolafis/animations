import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export class AssetLoader {
    readonly meshes: Map<string, THREE.Group>;
    readonly animations: Map<string, THREE.AnimationClip[]>;
    readonly loadingManager: THREE.LoadingManager;

    constructor() {
        this.meshes = new Map();
        this.animations = new Map();
        this.loadingManager = new THREE.LoadingManager();
    }

    async load(): Promise<void> {
        const fbxLoader = new FBXLoader(this.loadingManager);
        this.loadModels(fbxLoader);
        this.loadAnimations(fbxLoader);

        return new Promise(resolve => {
            this.loadingManager.onLoad = () => {
                resolve();
            };

            this.loadingManager.onError = (url: string) => {
                throw new Error(`Failed to load asset: ${url}`);
            };
        });
    }

    // Character mesh
    private loadModels(fbxLoader: FBXLoader) {
        fbxLoader.load('./assets/Y Bot.fbx', data => {
            data.scale.multiplyScalar(0.01);

            // Tweak materials a bit
            data.traverse(obj => {
                if (obj instanceof THREE.Mesh) {
                    const originalMat = obj.material as THREE.MeshPhongMaterial;
                    const material = new THREE.MeshPhysicalMaterial({ color: originalMat.color });

                    if (originalMat.name.toLowerCase().includes('body')) {
                        material.roughness = 0.4;
                        material.ior = 1.4;
                    } else {
                        material.roughness = 0.75;
                        material.ior = 1.5;
                    }

                    obj.material = material;
                }
            });

            this.meshes.set('character', data);
        });
    }

    // Animations
    private loadAnimations(fbxLoader: FBXLoader) {
        fbxLoader.load('./assets/idle.fbx', data => {
            this.insertAnimation('character', 'idle', data);
        });

        fbxLoader.load('./assets/walking.fbx', data => {
            this.insertAnimation('character', 'walk_forward', data);
        });

        fbxLoader.load('./assets/walking_left.fbx', data => {
            this.insertAnimation('character', 'walk_left', data);
        });

        fbxLoader.load('./assets/walking_right.fbx', data => {
            this.insertAnimation('character', 'walk_right', data);
        });

        fbxLoader.load('./assets/running.fbx', data => {
            this.insertAnimation('character', 'run_forward', data);
        });

        fbxLoader.load('./assets/running_left.fbx', data => {
            this.insertAnimation('character', 'run_left', data);
        });

        fbxLoader.load('./assets/running_right.fbx', data => {
            this.insertAnimation('character', 'run_right', data);
        });
    }

    private insertAnimation(key: string, name: string, group: THREE.Group) {
        const existingClips = this.animations.get(key) ?? [];
        group.animations[0].name = name;

        existingClips.push(...group.animations);
        this.animations.set(key, existingClips);
    }
}

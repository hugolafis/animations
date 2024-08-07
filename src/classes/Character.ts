import * as THREE from 'three';
import { AssetLoader } from './AssetLoader';

export class Character extends THREE.Group {
    private readonly mesh: THREE.Group;
    private readonly mixer: THREE.AnimationMixer;
    private readonly actions: Map<string, THREE.AnimationAction>;

    constructor(private readonly assetLoader: AssetLoader) {
        super();

        this.actions = new Map();

        this.mesh = this.assetLoader.meshes.get('character')!;
        this.add(this.mesh);

        this.mixer = new THREE.AnimationMixer(this.mesh);
        const animClips = this.assetLoader.animations.get('character')!;
        animClips.forEach(clip => {
            const action = this.mixer.clipAction(clip);
            action.weight = 0;
            action.play();

            this.actions.set(clip.name, action);
        });
    }

    update(dt: number, weights: { [key: string]: number }) {
        //const priorityWeight = Array.from(weights);
        //const priorityAnim = this._animations.get(priorityWeight.name)!;

        // Find the priority anim (that is not idle!)
        let priorityAnimKey = 'walk_forward';
        for (const key in weights) {
            if (key === 'idle') continue;

            if (weights[key] > weights[priorityAnimKey]) {
                priorityAnimKey = key;
            }
        }

        const priorityAnim = this.actions.get(priorityAnimKey)!;
        priorityAnim.setEffectiveTimeScale(1);
        const priorityClipDuration = priorityAnim.getClip().duration;

        for (const key in weights) {
            const matchingAction = this.actions.get(key);

            if (!matchingAction) {
                continue;
            }

            matchingAction.weight = weights[key];

            if (key === 'idle') continue;

            const scaledDuration = matchingAction.getClip().duration / priorityClipDuration;
            matchingAction.setEffectiveTimeScale(scaledDuration);
        }

        this.mixer.update(dt);
    }
}

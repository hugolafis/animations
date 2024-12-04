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

        // Create a new mixer for our skeletal mesh

        // Get all the clips

        // Create actions for each clip, assign a default weight, and start them playing
    }

    /**
     *
     * @param dt Time in ms since the last frame
     * @param weights An object containing desired weights for each animation
     */
    update(dt: number, weights: { [key: string]: number }) {
        // Get each entry in our map from the weight key-value pairs, and assign the weight to the action

        // Fix cadence issue
        //this.fixTimescales(weights);

        this.mixer.update(dt);
    }

    // Feel free to optimise or integrate this into the main loop above to prevent multiple iterations over the same entries
    private fixTimescales(weights: { [key: string]: number }): void {
        const priorityClip = {
            key: 'walk_forward',
            weight: 0,
        };

        // Find the animation with the highest weighting to use as the primary animation
        for (const key in weights) {
            // Ignore idle
            if (key === 'idle') continue;

            if (weights[key] > priorityClip.weight) {
                priorityClip.key = key;
                priorityClip.weight = weights[key];
            }
        }

        const action = this.actions.get(priorityClip.key);

        // Shouldn't happen (hopefully...)
        if (!action) throw new Error('could not find primary animation');

        // Reset any modifications to this clips timescale
        action.setEffectiveTimeScale(1);

        // Find the duration of the priority animation
        const clip = action.getClip();
        const priorityClipDuration = clip.duration;

        // Assign a modified timescale to each secondary animation (except idle)
        for (const key in weights) {
            if (key === 'idle' || key === priorityClip.key) continue;

            const secondaryAnim = this.actions.get(key);

            if (!secondaryAnim) throw new Error('could not find secondary animation'); // shouldn't happen

            // Find out what this clips relative playing speed should be
            const scaledDuration = secondaryAnim.getClip().duration / priorityClipDuration;

            // Assign this new speed
            secondaryAnim.setEffectiveTimeScale(scaledDuration);
        }
    }
}

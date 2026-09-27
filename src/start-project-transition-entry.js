import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

async function bootStartProjectTransition() {
  try {
    // The canonical Start Project transition lives in /public so the exact
    // MacBook Pro 2020 integration deployed with its GLB/textures is used.
    // @vite-ignore prevents Vite from substituting the stale source copy.
    const module = await import(
      /* @vite-ignore */ '/assets/start-project/start-project-transition-core.js'
    )

    module.initStartProjectTransition({ THREE, GLTFLoader })
  } catch (error) {
    // Keep the rest of the portfolio usable if WebGL is unavailable, while
    // making transition failures visible in the console for diagnosis.
    console.error('The Start a Project 3D transition could not initialize.', error)
  }
}

bootStartProjectTransition()

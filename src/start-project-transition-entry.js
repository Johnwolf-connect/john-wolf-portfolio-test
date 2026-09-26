import * as THREE from 'three'
import { GLTFLoader as ThreeGLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { initStartProjectTransition } from './start-project-transition-core.js'

/*
  The replacement MacBook Air GLB carries a 0.01 scale inside its root
  hierarchy. The transition core positions the model correctly, but its
  original 9.48 outer scale assumed the raw mesh units were already world
  units. Correct the loaded scene to 948 so the effective mesh scale is
  9.48 after the GLB's internal 0.01 transform.
*/
class GLTFLoader extends ThreeGLTFLoader {
  load(url, onLoad, onProgress, onError) {
    return super.load(
      url,
      (gltf) => {
        onLoad?.(gltf)

        if (
          url === '/assets/start-project/macbook/macbook-ultra.glb' &&
          gltf?.scene
        ) {
          gltf.scene.scale.setScalar(948)
          gltf.scene.updateMatrixWorld(true)
        }
      },
      onProgress,
      onError,
    )
  }
}

try {
  initStartProjectTransition({ THREE, GLTFLoader })
} catch (error) {
  // Keep the portfolio usable on browsers or devices where WebGL is
  // unavailable. The 3D Start a Project transition is an enhancement,
  // not a requirement for rendering the site.
  console.warn(
    'The Start a Project 3D transition is unavailable.',
    error,
  )
}

import * as THREE from 'three'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { initStartProjectTransition } from './start-project-transition-core.js'

try {
  initStartProjectTransition({ THREE, OBJLoader })
} catch (error) {
  // Keep the portfolio usable on browsers or devices where WebGL is
  // unavailable. The 3D Start a Project transition is an enhancement,
  // not a requirement for rendering the site.
  console.warn(
    'The Start a Project 3D transition is unavailable.',
    error,
  )
}

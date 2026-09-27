import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { initStartProjectTransition } from './start-project-transition-core.js'

try {
  initStartProjectTransition({ THREE, GLTFLoader })
} catch (error) {
  console.error('The Start a Project transition could not initialize.', error)
}

const STYLE_ID = 'start-project-transition-styles'
const STAGE_ID = 'start-project-transition-stage'
const MODEL_URL = '/assets/start-project/macbook-m5/macbook-pro-14-m5.glb'
const VIDEO_URL = '/assets/start-project/environment.mp4'
const ROCK_URL = '/assets/start-project/black-stone.png'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const mix = (a, b, t) => a + (b - a) * t
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function solveLinearSystem(matrix) {
  const size = matrix.length
  for (let column = 0; column < size; column += 1) {
    let pivotRow = column
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivotRow][column])) pivotRow = row
    }
    if (Math.abs(matrix[pivotRow][column]) < 1e-10) return null
    ;[matrix[column], matrix[pivotRow]] = [matrix[pivotRow], matrix[column]]
    const pivot = matrix[column][column]
    for (let i = column; i <= size; i += 1) matrix[column][i] /= pivot
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue
      const factor = matrix[row][column]
      for (let i = column; i <= size; i += 1) matrix[row][i] -= factor * matrix[column][i]
    }
  }
  return matrix.map((row) => row[size])
}

function getProjectiveTransform(width, height, destination) {
  const source = [[0, 0], [width, 0], [width, height], [0, height]]
  const equations = []
  source.forEach(([x, y], index) => {
    const [tx, ty] = destination[index]
    equations.push([x, y, 1, 0, 0, 0, -tx * x, -tx * y, tx])
    equations.push([0, 0, 0, x, y, 1, -ty * x, -ty * y, ty])
  })
  const solution = solveLinearSystem(equations)
  if (!solution) return null
  const [a, b, c, d, e, f, g, h] = solution
  return `matrix3d(${[a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1].join(',')})`
}

function injectStylesheet() {
  if (document.getElementById(STYLE_ID)) return
  const link = document.createElement('link')
  link.id = STYLE_ID
  link.rel = 'stylesheet'
  link.href = '/assets/start-project/start-project-transition.css'
  document.head.append(link)
}

function createStage() {
  const existing = document.getElementById(STAGE_ID)
  if (existing) return existing
  const stage = document.createElement('section')
  stage.id = STAGE_ID
  stage.className = 'spt-stage'
  stage.setAttribute('aria-hidden', 'true')
  stage.innerHTML = `
    <video class="spt-environment-video" muted loop playsinline preload="auto" aria-hidden="true">
      <source src="${VIDEO_URL}" type="video/mp4" />
    </video>
    <div class="spt-environment-wash" aria-hidden="true"></div>
    <canvas class="spt-laptop-canvas" aria-hidden="true"></canvas>
    <div class="spt-rock-scene" aria-hidden="true"><div class="spt-underlight"></div><img src="${ROCK_URL}" alt="" draggable="false" /></div>
    <div class="spt-mobile-page-flow">
      <article class="spt-form-card" aria-label="Start a project form">
        <p class="spt-form-kicker">Creative partnership</p>
        <h2>Start a Project</h2>
        <p class="spt-form-intro">Tell me what you are building and where you want the work to take your brand.</p>
        <form class="spt-form" novalidate>
          <label><span>Name</span><input type="text" name="name" autocomplete="name" placeholder="Your name" /></label>
          <label><span>Email</span><input type="email" name="email" autocomplete="email" placeholder="you@example.com" /></label>
          <label><span>Project type</span><select name="projectType"><option value="" selected disabled>Select a service</option><option>Brand identity</option><option>Website design</option><option>Creative direction</option><option>Campaign design</option><option>Something custom</option></select></label>
          <label class="spt-upload-field"><span>Example image</span><div class="spt-upload-control"><div class="spt-upload-copy"><strong>Upload image</strong><small class="spt-upload-name">PNG, JPG or WEBP</small></div><span class="spt-upload-mark" aria-hidden="true">+</span><input type="file" name="exampleImage" accept="image/png,image/jpeg,image/webp" aria-label="Upload an example image" /></div></label>
          <label class="spt-form-message"><span>Project vision</span><textarea name="message" rows="4" placeholder="Tell me about the idea, goals, and timing."></textarea></label>
          <button type="submit">Begin the conversation <span aria-hidden="true">↗</span></button>
          <p class="spt-form-status" aria-live="polite"></p>
        </form>
      </article>
    </div>
    <button class="spt-close" type="button" aria-label="Return to portfolio"><span aria-hidden="true">×</span></button>`
  document.documentElement.append(stage)
  return stage
}

function clonePortfolioLayer() {
  const source = document.getElementById('root') || document.body.firstElementChild
  if (!source) return null
  const snapshotWidth = window.innerWidth
  const snapshotHeight = window.innerHeight
  const screen = document.createElement('div')
  screen.className = 'spt-live-screen'
  screen.setAttribute('aria-hidden', 'true')
  screen.style.width = `${snapshotWidth}px`
  screen.style.height = `${snapshotHeight}px`
  const scroll = document.createElement('div')
  scroll.className = 'spt-live-scroll'
  scroll.style.width = `${snapshotWidth}px`
  scroll.style.minWidth = `${snapshotWidth}px`
  scroll.style.height = `${snapshotHeight}px`
  const clone = source.cloneNode(true)
  clone.style.width = `${snapshotWidth}px`
  clone.style.minWidth = `${snapshotWidth}px`
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'))
  clone.querySelectorAll('video, audio').forEach((node) => { node.autoplay = false; node.removeAttribute('autoplay') })
  scroll.style.top = `${-window.scrollY}px`
  scroll.append(clone)
  screen.append(scroll)
  document.documentElement.append(screen)
  return { screen, width: snapshotWidth, height: snapshotHeight, destroy: () => screen.remove() }
}

function getLayout(camera, screenWidth) {
  const width = window.innerWidth
  const height = window.innerHeight
  const vertical = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
  const horizontal = vertical * (width / height)
  const mobile = width < 820
  return {
    width, height, mobile,
    initialScale: horizontal / screenWidth,
    finalScale: (horizontal * (mobile ? 0.254 : 0.306)) / screenWidth,
    finalX: mobile ? 0 : -horizontal * 0.225,
    finalY: mobile ? vertical * 0.36 : vertical * 0.055,
    vertical,
  }
}

export function initStartProjectTransition({ THREE, GLTFLoader }) {
  if (window.__johnWolfStartProjectTransition) return window.__johnWolfStartProjectTransition
  injectStylesheet()
  const stage = createStage()
  const video = stage.querySelector('.spt-environment-video')
  const canvas = stage.querySelector('.spt-laptop-canvas')
  const closeButton = stage.querySelector('.spt-close')
  const form = stage.querySelector('.spt-form')
  const status = stage.querySelector('.spt-form-status')
  const upload = stage.querySelector('input[name="exampleImage"]')
  const uploadName = stage.querySelector('.spt-upload-name')

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.06

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 3000)
  camera.position.set(0, 0, 900)
  const laptopRoot = new THREE.Group()
  scene.add(laptopRoot)
  scene.add(new THREE.HemisphereLight(0xf4f4ff, 0x210307, 2.15))
  const key = new THREE.DirectionalLight(0xffffff, 4.4); key.position.set(-320, 420, 540); scene.add(key)
  const red = new THREE.PointLight(0xff243f, 2700, 1100, 2); red.position.set(-260, -180, 260); scene.add(red)
  const cool = new THREE.PointLight(0x9db8ff, 1350, 900, 2); cool.position.set(250, 210, 160); scene.add(cool)

  const screenWidth = 310
  let layout = getLayout(camera, screenWidth)
  let active = false
  let animating = false
  let settled = false
  let frame = 0
  let livePage = null
  let lidPivot = null
  let screenPlane = null
  let screenCorners = []
  let lidOpenProgress = 0
  let modelLoaded = false
  let modelFailed = false
  let hoverStartedAt = 0
  let screenReveal = 0
  const CLOSED_ANGLE = Math.PI / 2

  function resize() {
    layout = getLayout(camera, screenWidth)
    camera.aspect = layout.width / layout.height
    camera.updateProjectionMatrix()
    renderer.setSize(layout.width, layout.height, false)
  }

  const modelReady = new Promise((resolve) => {
    new GLTFLoader().load(MODEL_URL, (gltf) => {
      try {
        const model = gltf.scene
        const lid = model.getObjectByName('RcexTyyhpuJYATQ')
        screenPlane = model.getObjectByName('tfTbkkzhxqpKRgC')
        if (!lid || !screenPlane) throw new Error('Required M5 lid/screen groups were not found')

        model.traverse((child) => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = true
          child.frustumCulled = false
        })

        model.updateMatrixWorld(true)
        const rawBounds = new THREE.Box3().setFromObject(model)
        const rawSize = new THREE.Vector3(); rawBounds.getSize(rawSize)
        const modelScale = rawSize.x > 0.001 ? 336 / rawSize.x : 1
        model.scale.setScalar(modelScale)
        model.updateMatrixWorld(true)
        const scaledBounds = new THREE.Box3().setFromObject(model)
        const center = new THREE.Vector3(); scaledBounds.getCenter(center)
        model.position.sub(center)
        laptopRoot.add(model)
        model.updateMatrixWorld(true)

        const lidBounds = new THREE.Box3().setFromObject(lid)
        const hingeWorld = new THREE.Vector3((lidBounds.min.x + lidBounds.max.x) / 2, lidBounds.min.y, (lidBounds.min.z + lidBounds.max.z) / 2)
        const hingeLocal = model.worldToLocal(hingeWorld.clone())
        lidPivot = new THREE.Group()
        lidPivot.name = 'JohnWolfMacBookM5LidPivot'
        lidPivot.position.copy(hingeLocal)
        model.add(lidPivot)
        model.updateMatrixWorld(true)
        lidPivot.updateMatrixWorld(true)
        lidPivot.attach(lid)
        lidPivot.attach(screenPlane)

        const positions = screenPlane.geometry.attributes.position
        const vertices = []
        for (let i = 0; i < positions.count; i += 1) vertices.push(new THREE.Vector3().fromBufferAttribute(positions, i))
        const minX = Math.min(...vertices.map((v) => v.x)); const maxX = Math.max(...vertices.map((v) => v.x))
        const minY = Math.min(...vertices.map((v) => v.y)); const maxY = Math.max(...vertices.map((v) => v.y))
        const pickCorner = (tx, ty) => vertices.reduce((best, v) => {
          const score = Math.abs(v.x - tx) / Math.max(0.001, maxX - minX) + Math.abs(v.y - ty) / Math.max(0.001, maxY - minY)
          return !best || score < best.score ? { score, v } : best
        }, null).v.clone()
        const corners = [pickCorner(minX, minY), pickCorner(maxX, minY), pickCorner(maxX, maxY), pickCorner(minX, maxY)]
        screenCorners = corners.map((position, index) => {
          const anchor = new THREE.Object3D()
          anchor.name = `JohnWolfM5ScreenCorner${index + 1}`
          anchor.position.copy(position)
          screenPlane.add(anchor)
          return anchor
        })
        screenPlane.visible = true
        lidPivot.rotation.x = CLOSED_ANGLE
        modelLoaded = true
        resolve(true)
      } catch (error) {
        modelFailed = true
        console.error('MacBook Pro 14-inch M5 setup failed.', error)
        resolve(false)
      }
    }, undefined, (error) => {
      modelFailed = true
      console.error('MacBook Pro 14-inch M5 model failed to load.', error)
      resolve(false)
    })
  })

  function projectScreen() {
    if (!livePage || screenCorners.length !== 4 || !modelLoaded) return
    const points = screenCorners.map((anchor) => {
      const point = new THREE.Vector3(); anchor.getWorldPosition(point); point.project(camera)
      return [(point.x * 0.5 + 0.5) * layout.width, (-point.y * 0.5 + 0.5) * layout.height]
    })
    const transform = getProjectiveTransform(livePage.width, livePage.height, points)
    if (transform) livePage.screen.style.transform = transform
    livePage.screen.style.opacity = String(clamp((lidOpenProgress - 0.12) / 0.25, 0, 1) * screenReveal)
  }

  function setPose(progress) {
    const travel = ease(clamp((progress - 0.08) / 0.92, 0, 1))
    laptopRoot.scale.setScalar(mix(layout.initialScale, layout.finalScale, travel))
    laptopRoot.position.set(layout.finalX * travel, layout.finalY * travel + Math.sin(travel * Math.PI) * layout.vertical * 0.055, Math.sin(travel * Math.PI) * -42)
    laptopRoot.rotation.set(Math.sin(travel * Math.PI) * -0.22 - 0.075 * travel, travel * Math.PI * 2 - 0.2 * travel, Math.sin(travel * Math.PI * 2) * 0.055 - 0.018 * travel)
    lidOpenProgress = ease(clamp((progress - 0.1) / 0.62, 0, 1))
    screenReveal = ease(clamp((progress - 0.82) / 0.12, 0, 1))
    if (lidPivot) lidPivot.rotation.x = mix(CLOSED_ANGLE, 0, lidOpenProgress)
    if (progress > 0.12) livePage?.screen.classList.add('is-framed')
    if (progress > 0.26) stage.classList.add('is-rock-visible')
    if (progress > 0.72) stage.classList.add('is-form-visible')
  }

  function render(timestamp) {
    if (!active) return
    if (settled && modelLoaded) {
      const elapsed = (timestamp - hoverStartedAt) / 1000
      laptopRoot.scale.setScalar(layout.finalScale)
      laptopRoot.position.set(layout.finalX + Math.sin(elapsed * 0.58) * 2.6, layout.finalY + Math.sin(elapsed * 1.15) * 5.2, 0)
      laptopRoot.rotation.set(-0.075, Math.PI * 2 - 0.2, -0.018)
      lidOpenProgress = 1
      screenReveal = 1
      if (lidPivot) lidPivot.rotation.x = 0
    }
    projectScreen()
    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }

  function animate(duration, update) {
    return new Promise((resolve) => {
      const start = performance.now()
      const tick = (now) => {
        const progress = clamp((now - start) / duration, 0, 1)
        update(progress)
        if (progress < 1) requestAnimationFrame(tick); else resolve()
      }
      requestAnimationFrame(tick)
    })
  }

  async function open() {
    if (active || animating) return
    animating = true
    status.textContent = ''
    resize()
    active = true
    settled = false
    stage.classList.remove('is-rock-visible', 'is-form-visible', 'is-settled')
    stage.classList.add('is-active')
    stage.setAttribute('aria-hidden', 'false')
    video.currentTime = 0
    video.play().catch(() => {})
    livePage = clonePortfolioLayer()
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(render)

    await modelReady
    if (modelFailed || !modelLoaded) {
      stage.classList.add('is-rock-visible', 'is-form-visible', 'is-settled')
      status.textContent = 'The project form is available while the 3D preview reloads.'
      animating = false
      return
    }

    laptopRoot.position.set(0, 0, 0)
    laptopRoot.rotation.set(0, 0, 0)
    laptopRoot.scale.setScalar(layout.initialScale)
    lidOpenProgress = 0
    screenReveal = 0
    if (lidPivot) lidPivot.rotation.x = CLOSED_ANGLE
    await animate(2860, setPose)
    settled = true
    hoverStartedAt = performance.now()
    stage.classList.add('is-settled', 'is-rock-visible', 'is-form-visible')
    animating = false
  }

  async function close() {
    if (!active || animating) return
    animating = true
    stage.classList.remove('is-form-visible', 'is-settled')
    if (modelLoaded) {
      const startScale = laptopRoot.scale.x
      const startPosition = laptopRoot.position.clone()
      const startRotation = laptopRoot.rotation.clone()
      await animate(900, (p) => {
        const t = ease(p)
        laptopRoot.scale.setScalar(mix(startScale, layout.initialScale, t))
        laptopRoot.position.lerpVectors(startPosition, new THREE.Vector3(), t)
        laptopRoot.rotation.set(mix(startRotation.x, 0, t), mix(startRotation.y, Math.PI * 4, t), mix(startRotation.z, 0, t))
        lidOpenProgress = 1 - t
        screenReveal = 1 - t
        if (lidPivot) lidPivot.rotation.x = mix(0, CLOSED_ANGLE, t)
      })
    }
    livePage?.destroy(); livePage = null
    active = false; settled = false
    stage.classList.remove('is-active', 'is-rock-visible', 'is-form-visible', 'is-settled')
    stage.setAttribute('aria-hidden', 'true')
    video.pause(); video.currentTime = 0
    cancelAnimationFrame(frame)
    animating = false
  }

  function trigger(event) {
    const target = event.target.closest?.('.header-cta, [data-start-project-trigger]')
    if (!target || !/start\s+a?\s*project/i.test((target.textContent || '').trim())) return
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation()
    open()
  }

  closeButton.addEventListener('click', close)
  window.addEventListener('click', trigger, true)
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && active) close() })
  window.addEventListener('resize', resize)
  upload?.addEventListener('change', () => { if (uploadName) uploadName.textContent = upload.files?.[0]?.name || 'PNG, JPG or WEBP' })
  form.addEventListener('submit', (event) => { event.preventDefault(); status.textContent = 'The visual form is ready. Submission wiring comes next.' })
  resize()

  const api = { open, close }
  window.__johnWolfStartProjectTransition = api
  return api
}

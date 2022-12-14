
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Clock,
  Vector2,
  BoxGeometry,
  Mesh,
  SphereGeometry,
  RepeatWrapping
} from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { WireframeMaterial } from './materials/WireframeMaterial'
import { SphereMaterial } from './materials/SphereMaterial'

import { textureLoader } from './loaders'

class App {
  #resizeCallback = () => this.#onResize()

  constructor(container, opts = { physics: false, debug: false }) {
    this.container = document.querySelector(container)
    this.screen = new Vector2(this.container.clientWidth, this.container.clientHeight)

    this.hasPhysics = opts.physics
    this.hasDebug = opts.debug
  }

  async init() {
    this.#createScene()
    this.#createCamera()
    this.#createRenderer()

    await this.#loadTextures()

    if (this.hasPhysics) {
      const { Simulation } = await import('./physics/Simulation')
      this.simulation = new Simulation(this)

      const { PhysicsBox } = await import('./physics/Box')
      const { PhysicsFloor } = await import('./physics/Floor')

      Object.assign(this, { PhysicsBox, PhysicsFloor })
    }

    this.#createClock()
    this.#createEffectOrigin()
    this.#createSphere()
    this.#addListeners()
    this.#createControls()
    this.#createTransformControls()
    this.#createPostprocess()

    if (this.hasDebug) {
      const { Debug } = await import('./Debug.js')
      new Debug(this)

      const { default: Stats } = await import('stats.js')
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
    }

    this.renderer.setAnimationLoop(() => {
      this.stats?.begin()

      this.#update()
      this.#render()

      this.stats?.end()
    })

    console.log(this)
  }

  destroy() {
    this.renderer.dispose()
    this.#removeListeners()
  }

  #update() {
    const elapsed = this.clock.getElapsedTime()

    this.effectOrigin.position.y = Math.sin(elapsed)

    this.sphere.material.uniforms.u_EffectOrigin.value = this.effectOrigin.position
    this.sphere.material.uniforms.u_Time.value = elapsed

    this.simulation?.update()
  }

  #render() {
    this.composer.render()
  }

  #createScene() {
    this.scene = new Scene()
  }

  #createCamera() {
    this.camera = new PerspectiveCamera(75, this.screen.x / this.screen.y, 0.1, 100)
    this.camera.position.set(-0.7, 0.8, 3)
  }

  #createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio === 1
    })

    this.container.appendChild(this.renderer.domElement)

    this.renderer.setSize(this.screen.x, this.screen.y)
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
    this.renderer.setClearColor(0x121212)
    this.renderer.physicallyCorrectLights = true
  }

  #createPostprocess() {
    const renderPass = new RenderPass(this.scene, this.camera)

    this.bloomPass = new UnrealBloomPass(this.screen, 0.8, 0.4, 0.7)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(renderPass)
    this.composer.addPass(this.bloomPass)
  }

  #createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  #createTransformControls() {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)

    this.transformControls.addEventListener('dragging-changed', event => {
      this.controls.enabled = !event.value
    })

    this.transformControls.attach(this.sphere)

    this.scene.add(this.transformControls)
  }

  #createClock() {
    this.clock = new Clock()
  }

  async #loadTextures() {
    const [noise, matcap] = await textureLoader.load([
      '/noise.jpg',
      '/matcap.png'
    ])

    noise.wrapS = noise.wrapT = RepeatWrapping

    this.textures = {
      noise,
      matcap
    }
  }

  #createEffectOrigin() {
    const geometry = new BoxGeometry(0.35, 0.35, 0.35)

    this.effectOrigin = new Mesh(geometry, WireframeMaterial)

    this.scene.add(this.effectOrigin)
  }

  #createSphere() {
    const geometry = new SphereGeometry(1, 32, 32)
    this.sphere = new Mesh(geometry, SphereMaterial)

    this.sphere.material.uniforms.t_Noise.value = this.textures.noise
    this.sphere.material.uniforms.t_Matcap.value = this.textures.matcap

    this.sphere.position.set(1.7, 0, 0)

    this.scene.add(this.sphere)
  }

  #addListeners() {
    window.addEventListener('resize', this.#resizeCallback, { passive: true })
  }

  #removeListeners() {
    window.removeEventListener('resize', this.#resizeCallback, { passive: true })
  }

  #onResize() {
    this.screen.set(this.container.clientWidth, this.container.clientHeight)

    this.camera.aspect = this.screen.x / this.screen.y
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.screen.x, this.screen.y)
  }
}

window._APP_ = new App('#app', {
  physics: window.location.hash.includes('physics'),
  debug: window.location.hash.includes('debug')
})

window._APP_.init()

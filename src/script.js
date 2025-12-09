import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import { CustomPass } from './shader/postProcessing/customPass.js'

import noiseVertex from './shader/distortion/vertex.glsl'
import noiseFragment from './shader/distortion/fragment.glsl'

import noiseVertexTwo from './shader/sphereTwo/vertex.glsl'
import noiseFragmentTwo from './shader/sphereTwo/fragment.glsl'

/**
 * Base
 */
// Debug
// const gui = new GUI()
// const debugObject = {}
// debugObject.progress = 0
// debugObject.mRefractionRatio = 1.1
// debugObject.mFresnelBias = 0
// debugObject.mFresnelScale = 1.2
// debugObject.mFresnelPower = 1.0

// gui.add(debugObject, 'progress').min(0).max(1).step(.1)
// gui.add(debugObject, 'mRefractionRatio').min(0).max(2).step(.1).onChange(() => {materialTwo.uniforms.mRefractionRatio.value = debugObject.mRefractionRatio})
// gui.add(debugObject, 'mFresnelBias').min(0).max(2).step(.1).onChange(() => {materialTwo.uniforms.mFresnelBias.value = debugObject.mFresnelBias})
// gui.add(debugObject, 'mFresnelScale').min(0).max(2).step(.1).onChange(() => {materialTwo.uniforms.mFresnelScale.value = debugObject.mFresnelScale})
// gui.add(debugObject, 'mFresnelPower').min(0).max(2).step(.1).onChange(() => {materialTwo.uniforms.mFresnelPower.value = debugObject.mFresnelPower})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipMapLinearFilter,
    colorSpace: THREE.SRGBColorSpace
})

const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget)

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.SphereGeometry(2, 128, 128)
const geometryTwo = new THREE.IcosahedronGeometry(1)

// Material
const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        uTime: new THREE.Uniform(0),
        uResolution: new THREE.Uniform(new THREE.Vector4()),
    },
    vertexShader: noiseVertex,
    fragmentShader: noiseFragment
})

const materialTwo = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        uTime: new THREE.Uniform(0),
        uResolution: new THREE.Uniform(new THREE.Vector4()),
        tCube: new THREE.Uniform(0),
        mRefractionRatio: new THREE.Uniform(1.02),
        mFresnelBias: new THREE.Uniform(0.1),
        mFresnelScale: new THREE.Uniform(2.0),
        mFresnelPower: new THREE.Uniform(1.0),
    },
    vertexShader: noiseVertexTwo,
    fragmentShader: noiseFragmentTwo
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)
const meshTwo = new THREE.Mesh(geometryTwo, materialTwo)
scene.add(mesh, meshTwo)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const imageAspect = 1;

let a1
let a2

if(sizes.height/sizes.width > imageAspect){
    a1 = (sizes.width/sizes.height) * imageAspect
    a2 = 1
} else {
    a1 = 1
    a2 = (sizes.height/sizes.width) * imageAspect
}

material.uniforms.uResolution.value.x = sizes.width
material.uniforms.uResolution.value.y = sizes.height
material.uniforms.uResolution.value.z = a1
material.uniforms.uResolution.value.w = a2

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    const imageAspect = 1;

    let a1
    let a2

    if(sizes.height/sizes.width > imageAspect){
        a1 = (sizes.width/sizes.height) * imageAspect
        a2 = 1
    } else {
        a1 = 1
        a2 = (sizes.height/sizes.width) * imageAspect
    }

    material.uniforms.uResolution.value.x = sizes.width
    material.uniforms.uResolution.value.y = sizes.height
    material.uniforms.uResolution.value.z = a1
    material.uniforms.uResolution.value.w = a2

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 10)
camera.position.set(0, 0, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const composer = new EffectComposer(renderer)
composer.setSize(sizes.width, sizes.height)
composer.addPass(new RenderPass(scene, camera))

const customPass = new ShaderPass(CustomPass)
customPass.uniforms[ 'scale' ].value = 4;
composer.addPass(customPass)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()
    material.uniforms.uTime.value = elapsedTime

    meshTwo.visible = false
    cubeCamera.update(renderer, scene)
    meshTwo.visible = true
    materialTwo.uniforms.tCube.value = cubeRenderTarget.texture

    // Render
    renderer.render(scene, camera)
    composer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
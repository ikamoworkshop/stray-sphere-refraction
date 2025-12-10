import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import { CustomPass } from './shader/postProcessing/customPass.js'

import noiseVertex from './shader/distortion/vertex.glsl'
import noiseFragment from './shader/distortion/fragment.glsl'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test mesh
 */
// Geometry
// const geometry = new THREE.PlaneGeometry(2.5, 2.5, 128, 128)
const geometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 128)

// Material
const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        uTime: new THREE.Uniform(0),
        uResolution: new THREE.Uniform(new THREE.Vector4()),
        mRefractionRatio: new THREE.Uniform(1.02),
        mFresnelBias: new THREE.Uniform(0.1),
        mFresnelScale: new THREE.Uniform(2.0),
        mFresnelPower: new THREE.Uniform(1.0),
    },
    vertexShader: noiseVertex,
    fragmentShader: noiseFragment
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.rotation.x = Math.PI * .5;
scene.add(mesh)

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
let mousePos = {x: 0, y: 0}
let lerpVector = new THREE.Vector3();
camera.position.set(0, 0, 2)
scene.add(camera)

window.addEventListener('mousemove', (e) => {
    mousePos.x = e.pageX / window.innerWidth * -2 + 1;
    mousePos.y = e.pageY / window.innerHeight * 2 - 1;
})

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
    material.uniforms.uTime.value = elapsedTime

    // Update Camera
    lerpVector.set(mousePos.x * .5, mousePos.y * .5, 1.5);
    camera.position.lerp(lerpVector, 0.05);
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // Render
    composer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
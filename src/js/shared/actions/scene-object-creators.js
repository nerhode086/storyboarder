const { createObject } = require('../reducers/shot-generator')

// all pose presets (so we can use `stand` for new characters)
const defaultPosePresets = require('../reducers/shot-generator-presets/poses.json')

// id of the pose preset used for new characters
const DEFAULT_POSE_PRESET_ID = '79BBBD0D-6BA2-4D84-9B71-EE661AB6E5AE'

const generatePositionAndRotation = (camera, room) => {
  let direction = new THREE.Vector3()
  camera.getWorldDirection( direction )

  let distance = 5

  if (room) {
    let vector = camera.getWorldDirection().normalize()
    let raycaster = new THREE.Raycaster()
    raycaster.set(camera.position, vector)
    let intersects = raycaster.intersectObject(room)
    if (intersects.length) {
      let intersect = intersects[0]
      console.log('nearest room surface is', intersect.distance, 'm away')
      // if the room surface is closer than the default distance ...
      if (intersect.distance < distance) {
        // ... use a distance of halfway to the room surface
        distance = intersect.distance / 2
      }
    }
  }

  let center = new THREE.Vector3().addVectors( camera.position, direction.multiplyScalar( distance ) )

  let obj = new THREE.Object3D()
  obj.position.set(center.x, 0, center.z)
  obj.position.x += (Math.random() * 2 - 1) * 0.3 // offset by +/- 0.3m
  obj.position.z += (Math.random() * 2 - 1) * 0.3 // offset by +/- 0.3m
  obj.lookAt(camera.position)

  let euler = new THREE.Euler()
    .setFromQuaternion(
      obj.quaternion.clone().normalize(),
      'YXZ'
    )

  return {
    x: obj.position.x,
    y: obj.position.z,
    z: obj.position.y,
    rotation: euler.y
  }
}

const createCamera = (id, cameraState, camera) => {
  let { x, y, z } = camera.position

  let rot = new THREE.Euler().setFromQuaternion( camera.quaternion, "YXZ" )
  let rotation = rot.y
  let tilt = rot.x
  let roll = rot.z

  // TODO base on current camera rotation so offset is always left-ward
  // offset by ~3 feet
  x -= 0.91

  let object = {
    id,
    type: 'camera',

    fov: cameraState.fov,

    x, y: z, z: y,
    rotation, tilt, roll
  }

  return createObject(object)
}

const createModelObject = (id, camera, room) => {
  let { x, y, z, rotation } = generatePositionAndRotation(camera, room)

  return createObject({
    id,
    type: 'object',
    model: 'box',

    width: 1, height: 1, depth: 1,

    x, y, z,

    rotation: { x: 0, y: rotation, z: 0 },

    visible: true
  })
}

const createCharacter = (id, camera, room) => {
  let { x, y, z, rotation } = generatePositionAndRotation(camera, room)

  return createObject({
    id,
    type: 'character',
    height: 1.8,
    model: 'adult-male',

    x, y, z,
    rotation,

    headScale: 1,

    morphTargets: {
      mesomorphic: 0,
      ectomorphic: 0,
      endomorphic: 0
    },

    posePresetId: DEFAULT_POSE_PRESET_ID,
    skeleton: defaultPosePresets[DEFAULT_POSE_PRESET_ID].state.skeleton,

    visible: true
  })
}

const createLight = (id) => {
  return createObject({
    id,
    type: 'light',

    x: 0, y: 0, z: 2,
    rotation: 0, tilt: 0, roll: 0,

    intensity: 0.8,
    visible: true,
    angle: 1.04,
    distance: 5,
    penumbra: 1.0,
    decay: 1,
  })
}

const createVolume = (id) => {
  return createObject({
    id,
    type: 'volume',

    x: 0, y: 2, z: 0,

    width: 5, height: 5, depth: 5,

    rotation: 0,

    visible: true,
    opacity: 0.3,
    color: 0x777777,
    numberOfLayers: 4,
    distanceBetweenLayers: 1.5,
    volumeImageAttachmentIds: ['rain2', 'rain1']
  })
}

module.exports = {
  createCamera,
  createModelObject,
  createCharacter,
  createLight,
  createVolume
}

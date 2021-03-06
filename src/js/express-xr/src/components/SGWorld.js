const { useEffect, useRef, useMemo } = (React = require('react'))
const buildSquareRoom = require('../../../shot-generator/build-square-room')

const onlyOfTypes = require('../../../shot-generator/only-of-types')

const materialFactory = () => new THREE.MeshLambertMaterial({
  color: 0xffffff,
  emissive: 0x0,
  specular: 0x0,
  skinning: true,
  shininess: 0,
  flatShading: false
})

const SGWorld = React.memo(({ groundTexture, wallTexture, world, modelData }) => {
  const ambientLight = useRef(null)
  const directionalLight = useRef(null)
  const ground = useRef(null)
  const room = useRef(null)

  const roomMesh = useMemo(
    () => {
      let mesh = buildSquareRoom(
        world.room.width,
        world.room.length,
        world.room.height,
        {
          textures: {
            wall: wallTexture
          }
        }
      )
      mesh.position.y = -0.03
      mesh.layers.enable(0)
      return mesh
    },
    [world, wallTexture]
  )

  useMemo(() => {
    if (directionalLight.current) {
      directionalLight.current.target.position.set(0, 0, 0.4)
      directionalLight.current.add(directionalLight.current.target)
      directionalLight.current.rotation.x = 0
      directionalLight.current.rotation.z = 0
      directionalLight.current.rotation.y = world.directional.rotation
      directionalLight.current.rotateX(world.directional.tilt + Math.PI / 2)
    }
  }, [directionalLight.current])

  const environmentRef = useRef()
  const environmentObject = useMemo(() => {
    if (!modelData) return null

    let g = new THREE.Group()

    let sceneData = onlyOfTypes(modelData.scene.clone(), ['Scene', 'Mesh', 'Group'])

    // update all Mesh textures
    sceneData.traverse(child => {
      if (child.isMesh) { child.material = materialFactory() }
    })

    g.add( ...sceneData.children )

    return g
  }, [modelData])

  return (
    <>
      <ambientLight ref={ambientLight} color={0xffffff} intensity={world.ambient.intensity} />
      <directionalLight
        ref={directionalLight}
        color={0xffffff}
        intensity={world.directional.intensity}
        position={[0, 1.5, 0]}
      />
      texture.image &&{' '}
      <mesh
        ref={ground}
        userData={{ type: 'ground' }}
        position={new THREE.Vector3(0, -0.03, 0)}
        rotation={new THREE.Euler(-Math.PI / 2, 0, 0)}
      >
        <planeGeometry attach="geometry" args={[135 / 3, 135 / 3, 32]} />
        <meshLambertMaterial attach="material" side={THREE.FrontSide} visible={!world.room.visible && world.ground}>
          <primitive attach="map" object={groundTexture} />
        </meshLambertMaterial>
      </mesh>
      <primitive ref={room} userData={{ type: 'room' }} object={roomMesh} visible={world.room.visible} />
      {environmentObject && (
        <primitive
          ref={environmentRef}
          object={environmentObject}
          scale={[world.environment.scale, world.environment.scale, world.environment.scale]}
          rotation={[0, world.environment.rotation, 0]}
          position={[world.environment.x, world.environment.z, world.environment.y]}
          visible={world.environment.visible}
        />
      )}
      />
    </>
  )
})

module.exports = SGWorld

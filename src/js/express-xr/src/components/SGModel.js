const { useRef, useEffect, useMemo } = React
const { updateObjectHighlight } = require('../utils/xrHelperFuncs')

const RoundedBoxGeometry = require('three-rounded-box')(THREE)

const materialFactory = () => new THREE.MeshLambertMaterial({
  color: 0xcccccc,
  emissive: 0x0,
  // specular: 0x0,
  // shininess: 0,
  flatShading: false
})

const meshFactory = originalMesh => {
  let mesh = originalMesh.clone()

  // create a skeleton if one is not provided
  if (mesh instanceof THREE.SkinnedMesh && !mesh.skeleton) {
    mesh.skeleton = new THREE.Skeleton()
  }

  let material = materialFactory()

  if (mesh.material.map) {
    material.map = mesh.material.map
    material.map.needsUpdate = true
  }
  mesh.material = material

  return mesh
}

const boxRadius = .005
const boxRadiusSegments = 5

const SGModel = ({ id, model, modelData, x, y, z, width, height, depth, rotation, visible, isSelected, ...props }) => {
  const object = useRef(null)
  
  const boxGeometry = useMemo(() => {
    const geometry = new RoundedBoxGeometry( 1, 1, 1, boxRadius, boxRadiusSegments )
    geometry.translate( 0, 1 / 2, 0 )
    return geometry
  })

  const children = useMemo(() => {
    if (model === 'box') {
      return [
        <mesh
          key={id}
          geometry={boxGeometry}
          material={materialFactory()}
        />
      ]
    }

    if (modelData) {
      let children = []
      modelData.scene.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          children.push(<primitive key={id} object={meshFactory(child.clone())} />)
        }
      })
      return children
    }

    return []
  }, [model, modelData])

  useEffect(() => {
    if (!object.current) return
    if (isSelected) updateObjectHighlight(object.current, 0.15)
    else updateObjectHighlight(object.current, 0)
  }, [modelData, isSelected])

  const forPanel = model === 'box' ? { width, height, depth } : { size: width }

  return <group
    ref={object}
    userData={{ id, displayName: props.name || props.displayName, type: props.type, forPanel }}
    visible={visible}
    position={[ x, z, y ]}
    scale={[ width, height, depth ]}
    rotation={[ rotation.x, rotation.y, rotation.z ]}
    >
      {children}
      {props.children}
    </group>
}

module.exports = SGModel

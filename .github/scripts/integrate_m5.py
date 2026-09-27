from pathlib import Path
p=Path('src/start-project-transition-core.js')
s=p.read_text()
s=s.replace("const MODEL_URL = '/assets/start-project/macbook/macbook-pro-2020.glb'", "const MODEL_URL = '/assets/start-project/macbook-m5/macbook-pro-14-m5.glb'")
s=s.replace("const CLOSED_ANGLE = Math.PI / 2", "const CLOSED_ANGLE = 1.93")
s=s.replace("const lid = model.getObjectByName('Rectangle004')\n        screenPlane = model.getObjectByName('Plane006')\n        if (!lid || !screenPlane) throw new Error('Required lid/screen groups Rectangle004 + Plane006 were not found')", "const lid = model.getObjectByName('RcexTyyhpuJYATQ')\n        screenPlane = model.getObjectByName('tfTbkkzhxqpKRgC')\n        if (!lid || !screenPlane) throw new Error('Required M5 lid/screen groups were not found')")
old="""        model.traverse((child) => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = true
          child.frustumCulled = false
          const name = child.name
          if (name === 'Object026') child.material = new THREE.MeshStandardMaterial({ color: 0x17181b, metalness: 0.12, roughness: 0.55 })
          else if (name === 'Object025') child.material = new THREE.MeshStandardMaterial({ color: 0x65686d, metalness: 0.72, roughness: 0.34 })
          else child.material = new THREE.MeshStandardMaterial({ color: 0x55585e, metalness: 0.84, roughness: 0.31 })
        })"""
new="""        model.traverse((child) => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = true
          child.frustumCulled = false
        })"""
if old not in s: raise SystemExit('material block not found')
s=s.replace(old,new)
s=s.replace("const hingeWorld = new THREE.Vector3((lidBounds.min.x + lidBounds.max.x) / 2, lidBounds.min.y, (lidBounds.min.z + lidBounds.max.z) / 2)", "const hingeWorld = new THREE.Vector3((lidBounds.min.x + lidBounds.max.x) / 2, lidBounds.max.y, lidBounds.max.z)")
s=s.replace("lidPivot.name = 'JohnWolfMacBook2020LidPivot'", "lidPivot.name = 'JohnWolfMacBookM5LidPivot'")
s=s.replace("        lidPivot.attach(lid)\n        lidPivot.attach(screenPlane)", "        lidPivot.attach(lid)")
start=s.index("        screenPlane.geometry.computeBoundingBox()")
end=s.index("        lidPivot.rotation.x = CLOSED_ANGLE", start)
replacement="""        const positions = screenPlane.geometry.attributes.position
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
"""
s=s[:start]+replacement+s[end:]
s=s.replace("console.error('MacBook Pro 2020 setup failed.'", "console.error('MacBook Pro 14-inch M5 setup failed.'")
s=s.replace("console.error('MacBook Pro 2020 model failed to load.'", "console.error('MacBook Pro 14-inch M5 model failed to load.'")
p.write_text(s)

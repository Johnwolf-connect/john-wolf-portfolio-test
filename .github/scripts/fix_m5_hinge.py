from pathlib import Path

p = Path('src/start-project-transition-core.js')
s = p.read_text()

old = "const hingeWorld = new THREE.Vector3((lidBounds.min.x + lidBounds.max.x) / 2, lidBounds.max.y, lidBounds.max.z)"
new = "const hingeWorld = new THREE.Vector3((lidBounds.min.x + lidBounds.max.x) / 2, lidBounds.min.y, (lidBounds.min.z + lidBounds.max.z) / 2)"
if old not in s:
    raise SystemExit('hinge expression not found')
s = s.replace(old, new, 1)

old = "        lidPivot.attach(lid)\n\n        const positions = screenPlane.geometry.attributes.position"
new = "        lidPivot.attach(lid)\n        // The display glass/screen is a separate mesh in the M5 asset. It must share\n        // the exact same hinge pivot as the lid shell or the laptop separates.\n        lidPivot.attach(screenPlane)\n\n        const positions = screenPlane.geometry.attributes.position"
if old not in s:
    raise SystemExit('lid attach block not found')
s = s.replace(old, new, 1)

old = "  let hoverStartedAt = 0\n  const CLOSED_ANGLE = 1.93"
new = "  let hoverStartedAt = 0\n  let screenReveal = 0\n  const CLOSED_ANGLE = Math.PI / 2"
if old not in s:
    raise SystemExit('state block not found')
s = s.replace(old, new, 1)

old = "    livePage.screen.style.opacity = String(clamp((lidOpenProgress - 0.12) / 0.25, 0, 1))"
new = "    // The HTML screen projection has no WebGL occlusion. Keep it hidden while\n    // the machine is rotating so it can never appear mirrored through the rear lid.\n    livePage.screen.style.opacity = String(clamp((lidOpenProgress - 0.12) / 0.25, 0, 1) * screenReveal)"
if old not in s:
    raise SystemExit('screen opacity line not found')
s = s.replace(old, new, 1)

old = "    lidOpenProgress = ease(clamp((progress - 0.1) / 0.62, 0, 1))\n    if (lidPivot) lidPivot.rotation.x = mix(CLOSED_ANGLE, 0, lidOpenProgress)"
new = "    lidOpenProgress = ease(clamp((progress - 0.1) / 0.62, 0, 1))\n    screenReveal = ease(clamp((progress - 0.82) / 0.12, 0, 1))\n    if (lidPivot) lidPivot.rotation.x = mix(CLOSED_ANGLE, 0, lidOpenProgress)"
if old not in s:
    raise SystemExit('pose block not found')
s = s.replace(old, new, 1)

old = "      lidOpenProgress = 1\n      if (lidPivot) lidPivot.rotation.x = 0"
new = "      lidOpenProgress = 1\n      screenReveal = 1\n      if (lidPivot) lidPivot.rotation.x = 0"
if old not in s:
    raise SystemExit('settled block not found')
s = s.replace(old, new, 1)

old = "    lidOpenProgress = 0\n    if (lidPivot) lidPivot.rotation.x = CLOSED_ANGLE"
new = "    lidOpenProgress = 0\n    screenReveal = 0\n    if (lidPivot) lidPivot.rotation.x = CLOSED_ANGLE"
if old not in s:
    raise SystemExit('open reset block not found')
s = s.replace(old, new, 1)

old = "        lidOpenProgress = 1 - t\n        if (lidPivot) lidPivot.rotation.x = mix(0, CLOSED_ANGLE, t)"
new = "        lidOpenProgress = 1 - t\n        screenReveal = 1 - t\n        if (lidPivot) lidPivot.rotation.x = mix(0, CLOSED_ANGLE, t)"
if old not in s:
    raise SystemExit('close block not found')
s = s.replace(old, new, 1)

p.write_text(s)
print('Applied M5 hinge/display repair')

export function sampleSegment(a, c, v, op = 1) {
  const lerp = (a, b, u) => a + (b - a) * u;
  const dx = c.p[0] - a.p[0], dy = c.p[1] - a.p[1], len = Math.hypot(dx, dy) || 1, off = (c.bend || 0) * 4 * v * (1 - v);
  return {
    x: lerp(a.p[0], c.p[0], v) - (dy / len) * off, y: lerp(a.p[1], c.p[1], v) + (dx / len) * off,
    z: lerp(a.z, c.z, v) + (c.peak || 0) * 4 * v * (1 - v), op,
  };
}

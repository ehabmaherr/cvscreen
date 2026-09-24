import * as THREE from "three";

/** Evenly spaced points on a sphere -- used for cluster (domain) centers so they never bunch up. */
export function fibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2; // 1..-1
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push(new THREE.Vector3(x, y, z).multiplyScalar(radius));
  }
  return points;
}

/** Uniform-random point inside a sphere of the given radius (cube-root radius sampling avoids center bunching). */
export function jitterInSphere(rand: () => number, radius: number): THREE.Vector3 {
  const u = rand();
  const r = radius * Math.cbrt(u);
  const theta = rand() * Math.PI * 2;
  const phi = Math.acos(2 * rand() - 1);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  );
}

import * as THREE from "three";

/**
 * One simple, low-poly primitive per domain -- a CVD-independent identity
 * channel alongside color, so domains stay distinguishable even where the
 * six-slot categorical palette can't guarantee separation for every pair
 * (see theme.ts). Order must match DOMAINS in data.ts.
 */
export function domainGeometry(index: number, size: number): THREE.BufferGeometry {
  switch (index % 6) {
    case 0:
      return new THREE.IcosahedronGeometry(size, 0);
    case 1:
      return new THREE.OctahedronGeometry(size * 1.1, 0);
    case 2:
      return new THREE.BoxGeometry(size * 1.5, size * 1.5, size * 1.5);
    case 3:
      return new THREE.ConeGeometry(size * 1.1, size * 2, 12);
    case 4:
      return new THREE.TorusGeometry(size * 0.9, size * 0.35, 10, 20);
    default:
      return new THREE.TetrahedronGeometry(size * 1.3, 0);
  }
}

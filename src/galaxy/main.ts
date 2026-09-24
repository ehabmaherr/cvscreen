import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DOMAINS, generateCandidates, computeEdges, type Candidate } from "./data";
import { DOMAIN_COLOR, THREE_TOKENS, TOKENS, getInitialTheme, persistTheme, type Theme } from "./theme";
import { domainGeometry } from "./shapes";
import { fibonacciSphere, jitterInSphere } from "./layout";
import "./style.css";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const candidates = generateCandidates(9);
const edges = computeEdges(candidates);
const domainIndex = new Map(DOMAINS.map((d, i) => [d.id, i]));
const clusterCenters = fibonacciSphere(DOMAINS.length, 16);
const rand = mulberry32(7);

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Chrome (DOM overlay)
// ---------------------------------------------------------------------------

const app = document.getElementById("app")!;
app.insertAdjacentHTML(
  "beforeend",
  `
  <div class="g-topbar">
    <div class="g-title">
      <span class="g-title-dot"></span>
      Candidate Galaxy
      <span class="g-title-sub">&middot; ${candidates.length} candidates</span>
    </div>
    <div class="g-actions">
      <button class="g-btn" id="g-reset" title="Reset view" aria-label="Reset view">&#9737;</button>
      <button class="g-btn" id="g-theme" title="Toggle theme" aria-label="Toggle theme">&#9788;</button>
    </div>
  </div>
  <div class="g-legend" id="g-legend">
    <div class="g-legend-title">Domains &middot; click to filter</div>
  </div>
  <div class="g-tooltip" id="g-tooltip" hidden></div>
  <div class="g-detail is-closed" id="g-detail" aria-hidden="true">
    <div class="g-detail-head">
      <div class="g-detail-name" id="g-detail-name"></div>
      <button class="g-detail-close" id="g-detail-close" aria-label="Close">&times;</button>
    </div>
    <div class="g-detail-domain" id="g-detail-domain"></div>
    <div class="g-detail-row"><span class="g-detail-row-label">Match score</span><span class="g-detail-row-value" id="g-detail-score"></span></div>
    <div class="g-detail-row"><span class="g-detail-row-label">Experience</span><span class="g-detail-row-value" id="g-detail-exp"></span></div>
    <div class="g-detail-row"><span class="g-detail-row-label">Connections</span><span class="g-detail-row-value" id="g-detail-conn"></span></div>
    <div class="g-detail-skills-label">Skills</div>
    <div class="g-detail-skills" id="g-detail-skills"></div>
    <div class="g-detail-hint">Connected candidates stay lit; unrelated ones dim.</div>
  </div>
  <div class="g-hint" id="g-hint">Drag to rotate &middot; scroll to zoom &middot; click a point</div>
`,
);

const legendEl = document.getElementById("g-legend")!;
const tooltipEl = document.getElementById("g-tooltip")!;
const detailEl = document.getElementById("g-detail")!;
const hintEl = document.getElementById("g-hint")!;

// ---------------------------------------------------------------------------
// Theme wiring
// ---------------------------------------------------------------------------

let theme: Theme = getInitialTheme();

function applyChromeTheme(t: Theme) {
  const tokens = TOKENS[t];
  const root = document.documentElement.style;
  root.setProperty("--g-bg", tokens.bg);
  root.setProperty("--g-surface", tokens.surface);
  root.setProperty("--g-surface-strong", tokens.surfaceStrong);
  root.setProperty("--g-border", tokens.border);
  root.setProperty("--g-text", tokens.text);
  root.setProperty("--g-text-muted", tokens.textMuted);
  root.setProperty("--g-text-h", tokens.textHeading);
  document.documentElement.dataset.theme = t;
}

// ---------------------------------------------------------------------------
// Three.js scene
// ---------------------------------------------------------------------------

const canvasHost = document.getElementById("canvas-host")!;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 6, 42);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
canvasHost.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 14;
controls.maxDistance = 90;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
keyLight.position.set(20, 30, 20);
scene.add(ambientLight, keyLight);

// Starfield -- a restrained decorative glow, not the main event. Kept on a
// distant shell (never near the camera) so no single star ever renders as a
// large, distracting square -- PointsMaterial draws points as flat squares
// with no texture, so size must stay tiny and distance must stay large.
const starGeometry = new THREE.BufferGeometry();
const STAR_COUNT = 700;
const starPositions = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
  const dir = jitterInSphere(rand, 1).normalize();
  const radius = 75 + rand() * 55; // shell from 75 to 130 units out
  starPositions[i * 3] = dir.x * radius;
  starPositions[i * 3 + 1] = dir.y * radius;
  starPositions[i * 3 + 2] = dir.z * radius;
}
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ size: 0.6, sizeAttenuation: true, transparent: true });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Candidate points, one mesh per candidate (shape = domain identity, color = domain).
interface PointEntry {
  candidate: Candidate;
  mesh: THREE.Mesh;
  baseScale: number;
}

const pointById = new Map<string, PointEntry>();
const domainGroups = new Map<string, THREE.Group>();
for (const d of DOMAINS) {
  const g = new THREE.Group();
  scene.add(g);
  domainGroups.set(d.id, g);
}

for (const candidate of candidates) {
  const di = domainIndex.get(candidate.domainId) ?? 0;
  const center = clusterCenters[di];
  const size = 0.42 + (candidate.score - 70) / 28 * 0.22; // subtle size-by-score
  const geometry = domainGeometry(di, size);
  const colorHex = DOMAIN_COLOR[theme][di];
  const material = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: THREE_TOKENS[theme].emissiveIntensity,
    roughness: 0.45,
    metalness: 0.15,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const offset = jitterInSphere(rand, 5.5);
  mesh.position.copy(center).add(offset);
  mesh.userData.candidateId = candidate.id;
  domainGroups.get(candidate.domainId)!.add(mesh);
  pointById.set(candidate.id, { candidate, mesh, baseScale: 1 });
}

// Edges -- k-nearest by shared skills, drawn as thin constellation lines.
const edgePositions = new Float32Array(edges.length * 6);
edges.forEach((edge, i) => {
  const a = pointById.get(edge.a)!.mesh.position;
  const b = pointById.get(edge.b)!.mesh.position;
  edgePositions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
});
const edgeGeometry = new THREE.BufferGeometry();
edgeGeometry.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
const edgeMaterial = new THREE.LineBasicMaterial({
  color: THREE_TOKENS[theme].edgeColor,
  transparent: true,
  opacity: THREE_TOKENS[theme].edgeOpacity,
});
const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
scene.add(edgeLines);

// Per-candidate adjacency, for click-to-focus highlighting.
const adjacency = new Map<string, Set<string>>();
for (const c of candidates) adjacency.set(c.id, new Set());
for (const e of edges) {
  adjacency.get(e.a)!.add(e.b);
  adjacency.get(e.b)!.add(e.a);
}

function applySceneTheme(t: Theme) {
  const tt = THREE_TOKENS[t];
  scene.background = new THREE.Color(tt.bg);
  scene.fog = new THREE.Fog(tt.bg, tt.fogNear, tt.fogFar);
  ambientLight.color.setHex(tt.ambientColor);
  ambientLight.intensity = tt.ambientIntensity;
  keyLight.color.setHex(tt.keyColor);
  keyLight.intensity = tt.keyIntensity;
  (starMaterial.color as THREE.Color).setHex(tt.starColor);
  starMaterial.opacity = tt.starOpacity;
  (edgeMaterial.color as THREE.Color).setHex(tt.edgeColor);
  edgeMaterial.opacity = tt.edgeOpacity;
  for (const { candidate, mesh } of pointById.values()) {
    const di = domainIndex.get(candidate.domainId) ?? 0;
    const colorHex = DOMAIN_COLOR[t][di];
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color.set(colorHex);
    mat.emissive.set(colorHex);
    mat.emissiveIntensity = tt.emissiveIntensity;
  }
}

function setTheme(t: Theme) {
  theme = t;
  applyChromeTheme(t);
  applySceneTheme(t);
  persistTheme(t);
  renderLegend();
}

// ---------------------------------------------------------------------------
// Legend (domain filter)
// ---------------------------------------------------------------------------

const domainVisible = new Map(DOMAINS.map((d) => [d.id, true]));

function renderLegend() {
  legendEl.querySelectorAll(".g-legend-item").forEach((el) => el.remove());
  DOMAINS.forEach((d, i) => {
    const count = candidates.filter((c) => c.domainId === d.id).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "g-legend-item" + (domainVisible.get(d.id) ? "" : " off");
    btn.innerHTML = `
      <span class="g-legend-swatch" style="background:${DOMAIN_COLOR[theme][i]}"></span>
      <span class="g-legend-label">${d.label}</span>
      <span class="g-legend-count">${count}</span>
    `;
    btn.addEventListener("click", () => {
      const next = !domainVisible.get(d.id);
      domainVisible.set(d.id, next);
      domainGroups.get(d.id)!.visible = next;
      updateEdgeVisibilityForFilters();
      renderLegend();
    });
    legendEl.appendChild(btn);
  });
}

function updateEdgeVisibilityForFilters() {
  const positions = edgeGeometry.attributes.position as THREE.BufferAttribute;
  edges.forEach((edge, i) => {
    const a = pointById.get(edge.a)!.candidate;
    const b = pointById.get(edge.b)!.candidate;
    const visible = domainVisible.get(a.domainId) && domainVisible.get(b.domainId);
    const pa = pointById.get(edge.a)!.mesh.position;
    const pb = pointById.get(edge.b)!.mesh.position;
    // Collapse hidden edges to a zero-length segment rather than rebuilding geometry.
    positions.setXYZ(i * 2, pa.x, pa.y, pa.z);
    positions.setXYZ(i * 2 + 1, visible ? pb.x : pa.x, visible ? pb.y : pa.y, visible ? pb.z : pa.z);
  });
  positions.needsUpdate = true;
}

renderLegend();

// ---------------------------------------------------------------------------
// Interaction: hover tooltip + click-to-focus detail card
// ---------------------------------------------------------------------------

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered: PointEntry | null = null;
let selected: PointEntry | null = null;

function meshesArray(): THREE.Mesh[] {
  return [...pointById.values()].filter((p) => domainVisible.get(p.candidate.domainId)).map((p) => p.mesh);
}

function setHover(entry: PointEntry | null, clientX: number, clientY: number) {
  if (hovered && hovered !== entry) resetEmissive(hovered);
  hovered = entry;
  if (!entry) {
    tooltipEl.hidden = true;
    canvasHost.style.cursor = "default";
    return;
  }
  canvasHost.style.cursor = "pointer";
  boostEmissive(entry);
  tooltipEl.hidden = false;
  tooltipEl.style.left = `${clientX}px`;
  tooltipEl.style.top = `${clientY}px`;
  const domain = DOMAINS[domainIndex.get(entry.candidate.domainId) ?? 0];
  tooltipEl.innerHTML = `<strong>${entry.candidate.name}</strong><div class="g-tooltip-sub">${domain.label} &middot; ${entry.candidate.score}% match</div>`;
}

function boostEmissive(entry: PointEntry) {
  const mat = entry.mesh.material as THREE.MeshStandardMaterial;
  mat.emissiveIntensity = THREE_TOKENS[theme].emissiveIntensityHover;
  entry.mesh.scale.setScalar(1.35);
}

function resetEmissive(entry: PointEntry) {
  if (selected === entry) return;
  const mat = entry.mesh.material as THREE.MeshStandardMaterial;
  mat.emissiveIntensity = THREE_TOKENS[theme].emissiveIntensity;
  entry.mesh.scale.setScalar(1);
}

function clearSelection() {
  if (selected) resetEmissive(selected);
  selected = null;
  detailEl.classList.add("is-closed");
  detailEl.setAttribute("aria-hidden", "true");
  edgeMaterial.opacity = THREE_TOKENS[theme].edgeOpacity;
  setAllMaterialsFocus(null);
}

function setAllMaterialsFocus(focusId: string | null) {
  for (const { candidate, mesh } of pointById.values()) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.transparent = true;
    const isFocus = candidate.id === focusId;
    const isNeighbor = !!focusId && adjacency.get(focusId)!.has(candidate.id);
    mat.opacity = !focusId || isFocus || isNeighbor ? 1 : 0.18;
    mat.needsUpdate = true;
  }
}

function selectCandidate(entry: PointEntry) {
  if (selected) resetEmissive(selected);
  selected = entry;
  boostEmissive(entry);
  setAllMaterialsFocus(entry.candidate.id);
  showDetail(entry);
}

function showDetail(entry: PointEntry) {
  const { candidate } = entry;
  const di = domainIndex.get(candidate.domainId) ?? 0;
  const domain = DOMAINS[di];
  detailEl.classList.remove("is-closed");
  detailEl.setAttribute("aria-hidden", "false");
  document.getElementById("g-detail-name")!.textContent = candidate.name;
  const domainEl = document.getElementById("g-detail-domain")!;
  domainEl.textContent = domain.label;
  domainEl.style.background = `${DOMAIN_COLOR[theme][di]}22`;
  domainEl.style.color = DOMAIN_COLOR[theme][di];
  document.getElementById("g-detail-score")!.textContent = `${candidate.score}%`;
  document.getElementById("g-detail-exp")!.textContent = `${candidate.experienceYears} yrs`;
  document.getElementById("g-detail-conn")!.textContent = String(adjacency.get(candidate.id)!.size);
  document.getElementById("g-detail-skills")!.innerHTML = candidate.skills
    .map((s) => `<span class="g-detail-skill">${s}</span>`)
    .join("");
  hintEl.hidden = true;
}

function onPointerMove(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(meshesArray(), false);
  if (hits.length) {
    const entry = pointById.get(hits[0].object.userData.candidateId as string) ?? null;
    setHover(entry, event.clientX, event.clientY);
  } else {
    setHover(null, event.clientX, event.clientY);
  }
}

function onClick(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(meshesArray(), false);
  if (hits.length) {
    const entry = pointById.get(hits[0].object.userData.candidateId as string);
    if (entry) selectCandidate(entry);
  } else {
    clearSelection();
  }
}

renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("click", onClick);

document.getElementById("g-detail-close")!.addEventListener("click", clearSelection);
document.getElementById("g-theme")!.addEventListener("click", () => setTheme(theme === "dark" ? "light" : "dark"));
document.getElementById("g-reset")!.addEventListener("click", () => {
  controls.reset();
  camera.position.set(0, 6, 42);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------------
// Render loop
// ---------------------------------------------------------------------------

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

setTheme(theme);
animate();

// Dev-only hook for automated verification (screen-project a candidate's
// world position so tests can click it reliably despite auto-rotate drift).
// Never active without the query flag, so it ships harmlessly.
if (new URLSearchParams(location.search).has("test")) {
  (window as unknown as { __galaxyTest: unknown }).__galaxyTest = {
    screenPositionFor(candidateId: string) {
      const entry = pointById.get(candidateId);
      if (!entry) return null;
      const v = entry.mesh.position.clone().project(camera);
      return {
        x: ((v.x + 1) / 2) * window.innerWidth,
        y: ((1 - v.y) / 2) * window.innerHeight,
      };
    },
    firstCandidateIdInDomain(domainId: string) {
      for (const { candidate } of pointById.values()) {
        if (candidate.domainId === domainId) return candidate.id;
      }
      return null;
    },
    setAutoRotate(on: boolean) {
      controls.autoRotate = on;
    },
  };
}

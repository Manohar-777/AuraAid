import React, { useRef, useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';


/* ─── Types ─── */
interface BodyModel3DProps {
  selectedPart: string | null;
  onPartSelect: (part: string | null) => void;
}

/* ─── Constants ─── */
export const BODY_PART_LABELS: Record<string, string> = {
  head: 'Head & Face',
  neck: 'Neck & Throat',
  shoulders: 'Shoulders',
  chest: 'Chest & Ribcage',
  upper_back: 'Upper Back',
  abdomen: 'Abdomen & Core',
  lower_back: 'Lower Back & Spine',
  pelvis: 'Pelvis & Groin',
  arms: 'Arms',
  hands: 'Hands & Wrists',
  legs: 'Legs & Knees',
  feet: 'Feet & Ankles',
};

/*
  The OBJ model (FinalBaseMesh.obj) spans:
    X: -5.84 to 5.84   (width ~11.68)
    Y: -0.06 to 20.68   (height ~20.74)
    Z: -1.85 to 1.92    (depth ~3.77)
  
  We normalize it to fit a ~4 unit tall model centered at origin
  Scale factor: 4 / 20.74 ≈ 0.193
  After centering, Y center is at ~10.31, so offset = -10.31 * scale
  
  Normalized bounds (approx):
    X: ±1.13
    Y: -2.0 to +2.0
    Z: ±0.37
*/
const MODEL_SCALE = 0.193;
const MODEL_Y_OFFSET = -1.87; // Shifted UP by 0.12 units to perfectly align hotspots to mesh

/* ─── Hotspot positions (in world model space) ─── */
interface HotspotConfig {
  id: string;
  position: [number, number, number];
  label: string;
  // Y range for hit detection zone (world)
  yMin: number;
  yMax: number;
}

const HOTSPOTS: HotspotConfig[] = [
  { id: 'head',       position: [0, 1.82, 0.12],     label: 'Head & Face',       yMin: 1.77, yMax: 2.2 },
  { id: 'neck',       position: [0, 1.55, 0.08],      label: 'Neck & Throat',     yMin: 1.60, yMax: 1.77 },
  { id: 'shoulders',  position: [0.45, 1.38, 0.05],   label: 'Right Shoulder',    yMin: 1.42, yMax: 1.60 },
  { id: 'shoulders',  position: [-0.45, 1.38, 0.05],  label: 'Left Shoulder',     yMin: 1.42, yMax: 1.60 },
  { id: 'chest',      position: [0, 1.2, 0.15],       label: 'Chest & Ribcage',   yMin: 1.12, yMax: 1.50 },
  { id: 'upper_back', position: [0, 1.25, -0.18],     label: 'Upper Back',        yMin: 1.12, yMax: 1.60 },
  { id: 'abdomen',    position: [0, 0.7, 0.13],       label: 'Abdomen & Core',    yMin: 0.62, yMax: 1.12 },
  { id: 'lower_back', position: [0, 0.65, -0.15],     label: 'Lower Back & Spine',yMin: 0.52, yMax: 1.12 },
  { id: 'pelvis',     position: [0, 0.35, 0.12],      label: 'Pelvis & Groin',    yMin: 0.27, yMax: 0.62 },
  { id: 'arms',       position: [0.72, 0.85, 0.05],   label: 'Right Arm',         yMin: 0.42, yMax: 1.42 },
  { id: 'arms',       position: [-0.72, 0.85, 0.05],  label: 'Left Arm',          yMin: 0.42, yMax: 1.42 },
  { id: 'hands',      position: [0.85, 0.1, 0.05],    label: 'Right Hand',        yMin: 0.02, yMax: 0.42 },
  { id: 'hands',      position: [-0.85, 0.1, 0.05],   label: 'Left Hand',         yMin: 0.02, yMax: 0.42 },
  { id: 'legs',       position: [0.3, -0.55, 0.08],   label: 'Right Leg',         yMin: -1.18, yMax: 0.27 },
  { id: 'legs',       position: [-0.3, -0.55, 0.08],  label: 'Left Leg',          yMin: -1.18, yMax: 0.27 },
  { id: 'feet',       position: [0.3, -1.7, 0.1],     label: 'Right Foot',        yMin: -1.88, yMax: -1.18 },
  { id: 'feet',       position: [-0.3, -1.7, 0.1],    label: 'Left Foot',         yMin: -1.88, yMax: -1.18 },
];


/* ─── HolographicOBJ: The main visual body rendered from OBJ ─── */
const HolographicOBJ: React.FC<{
  selectedPart: string | null;
  hoveredPart: string | null;
  onPartSelect: (part: string | null) => void;
  onHover: (part: string | null) => void;
  cameraTarget: 'front' | 'back';
}> = ({ selectedPart, hoveredPart, onPartSelect, onHover, cameraTarget }) => {
  const obj = useLoader(OBJLoader, '/models/FinalBaseMesh.obj');
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<{
    body: THREE.MeshPhysicalMaterial;
    wireframe: THREE.MeshBasicMaterial;
    fresnel: THREE.ShaderMaterial;
  } | null>(null);

  // Create materials once
  const materials = useMemo(() => {
    const body = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0c2d48'),
      emissive: new THREE.Color('#062a3e'),
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      metalness: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
      envMapIntensity: 0.8,
      depthWrite: false,
    });

    const wireframe = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#06b6d4'),
      wireframe: true,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Fresnel edge-glow shader for sci-fi holographic rim lighting
    const fresnel = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color('#06b6d4') },
        uIntensity: { value: 0.6 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPosition.xyz);
          vUv = uv;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
          float scanLine = sin(vUv.y * 120.0 + uTime * 2.0) * 0.5 + 0.5;
          scanLine = smoothstep(0.3, 0.7, scanLine) * 0.15;
          float alpha = fresnel * uIntensity + scanLine * 0.3;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    materialsRef.current = { body, wireframe, fresnel };
    return { body, wireframe, fresnel };
  }, []);

  // Build the mesh layers
  useEffect(() => {
    const currentGroup = groupRef.current;
    if (!currentGroup) return;

    // Clear previous children
    while (currentGroup.children.length > 0) {
      currentGroup.remove(currentGroup.children[0]);
    }

    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geom = child.geometry.clone();
        geom.computeVertexNormals();

        // 1. Main body mesh — holographic glass (interactive)
        const bodyMesh = new THREE.Mesh(geom, materials.body);
        bodyMesh.scale.setScalar(MODEL_SCALE);
        bodyMesh.position.y = MODEL_Y_OFFSET;

        // 2. Subtle wireframe grid overlay (non-interactive)
        const wireMesh = new THREE.Mesh(geom, materials.wireframe);
        wireMesh.scale.setScalar(MODEL_SCALE);
        wireMesh.position.y = MODEL_Y_OFFSET;
        wireMesh.raycast = () => {};

        // 3. Fresnel edge glow (non-interactive)
        const fresnelMesh = new THREE.Mesh(geom, materials.fresnel);
        fresnelMesh.scale.setScalar(MODEL_SCALE * 1.002); // Slightly larger to avoid z-fighting
        fresnelMesh.position.y = MODEL_Y_OFFSET;
        fresnelMesh.raycast = () => {};

        currentGroup.add(bodyMesh);
        currentGroup.add(wireMesh);
        currentGroup.add(fresnelMesh);
      }
    });
  }, [obj, materials]);

  // Animate materials
  useFrame((state) => {
    if (!materialsRef.current) return;
    const { body, wireframe, fresnel } = materialsRef.current;
    const t = state.clock.elapsedTime;

    // Animate fresnel scan lines
    fresnel.uniforms.uTime.value = t;

    // Subtle breathing opacity
    const breath = Math.sin(t * 0.8) * 0.03;
    body.opacity = 0.55 + breath;

    // Wireframe subtle pulse
    wireframe.opacity = 0.06 + Math.sin(t * 1.2) * 0.02;

    // Highlight effect based on selection/hover
    if (selectedPart) {
      body.emissive.set('#1a0505');
      body.emissiveIntensity = 0.1 + Math.sin(t * 3) * 0.05;
    } else if (hoveredPart) {
      body.emissive.set('#062a3e');
      body.emissiveIntensity = 0.2;
    } else {
      body.emissive.set('#062a3e');
      body.emissiveIntensity = 0.15;
    }
  });

  const findPartFromY = useCallback((y: number) => {
    const activeHotspots = HOTSPOTS.filter(h => {
      if (cameraTarget === 'front') {
        return h.id !== 'upper_back' && h.id !== 'lower_back';
      } else {
        return h.id !== 'chest' && h.id !== 'abdomen' && h.id !== 'pelvis';
      }
    });
    const match = activeHotspots.find(h => y >= h.yMin && y <= h.yMax);
    return match ? match.id : null;
  }, [cameraTarget]);

  const handlePointerMove = useCallback((e: any) => {
    e.stopPropagation();
    const part = findPartFromY(e.point.y);
    onHover(part);
    if (part) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [findPartFromY, onHover]);

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    const part = findPartFromY(e.point.y);
    if (part) {
      onPartSelect(selectedPart === part ? null : part);
    }
  }, [findPartFromY, selectedPart, onPartSelect]);

  return (
    <group
      ref={groupRef}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
};


/* ─── Interactive Hotspot: a clickable 3D marker ─── */
const InteractiveHotspot: React.FC<{
  config: HotspotConfig;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}> = ({ config, isSelected, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle float animation
    meshRef.current.position.y = Math.sin(t * 1.5 + config.position[0] * 3) * 0.015;

    // Scale pulse
    const baseSc = isSelected ? 1.4 : isHovered ? 1.2 : 1.0;
    const pulse = isSelected ? Math.sin(t * 4) * 0.15 : 0;
    meshRef.current.scale.setScalar(baseSc + pulse);

    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = t * (isSelected ? 2.0 : 0.5);
      ringRef.current.rotation.x = Math.sin(t * 0.7) * 0.3;
    }
  });

  const color = isSelected ? '#ef4444' : isHovered ? '#22d3ee' : '#06b6d4';
  const coreOpacity = isSelected ? 1.0 : isHovered ? 0.95 : 0.85;
  const glowOpacity = isSelected ? 0.45 : isHovered ? 0.35 : 0.20;
  const ringOpacity = isSelected ? 0.65 : isHovered ? 0.50 : 0.30;

  return (
    <group
      position={config.position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(config.id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(config.id); }}
    >
      {/* Core dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={coreOpacity} depthWrite={false} />
      </mesh>

      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={glowOpacity} depthWrite={false} />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.10, 0.13, 24]} />
        <meshBasicMaterial color={color} transparent opacity={ringOpacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Label on hover */}
      {(isHovered || isSelected) && (
        <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div className="body-part-label-3d">
            <span className="label-dot" />
            {config.label}
          </div>
        </Html>
      )}
    </group>
  );
};


/* ─── Ground plane with grid ─── */
const GroundPlane: React.FC = () => {
  return (
    <group position={[0, -1.91, 0]}>
      {/* Circular ground disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial color="#040810" transparent opacity={0.6} />
      </mesh>
      {/* Grid ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[1.8, 2.2, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.5, 0.52, 48]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};


/* ─── Particle field for depth ─── */
const ParticleField: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#06b6d4"
        size={0.015}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};


/* ─── AutoRotate ─── */
const AutoRotateController: React.FC<{ controlsRef: React.RefObject<any>; idle: boolean }> = ({
  controlsRef, idle,
}) => {
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = idle;
      controlsRef.current.autoRotateSpeed = 0.8;
      controlsRef.current.update();
    }
  });
  return null;
};


/* ─── CameraController: smooth focal centering ─── */
const CameraController: React.FC<{
  selectedPart: string | null;
  controlsRef: React.RefObject<any>;
  cameraTarget: 'front' | 'back';
}> = ({ selectedPart, controlsRef, cameraTarget }) => {
  useFrame((state) => {
    if (!controlsRef.current) return;

    // Default: centered on the body torso
    let targetY = 0.0;
    let targetDistance = 5.8;
    let targetAzimuth = cameraTarget === 'back' ? Math.PI : 0;

    const PART_CAMERA: Record<string, { y: number; dist: number }> = {
      head:       { y: 1.82,  dist: 2.8 },
      neck:       { y: 1.55,  dist: 2.8 },
      shoulders:  { y: 1.38,  dist: 3.2 },
      chest:      { y: 1.20,  dist: 3.2 },
      upper_back: { y: 1.25,  dist: 3.2 },
      abdomen:    { y: 0.70,  dist: 3.2 },
      lower_back: { y: 0.65,  dist: 3.2 },
      pelvis:     { y: 0.35,  dist: 3.2 },
      arms:       { y: 0.85,  dist: 3.8 },
      hands:      { y: 0.10,  dist: 3.2 },
      legs:       { y: -0.55, dist: 4.2 },
      feet:       { y: -1.70, dist: 3.0 },
    };

    if (selectedPart && PART_CAMERA[selectedPart]) {
      const cfg = PART_CAMERA[selectedPart];
      targetY = cfg.y;
      targetDistance = cfg.dist;
      
      const isBackOnly = selectedPart === 'upper_back' || selectedPart === 'lower_back';
      const isFrontOnly = selectedPart === 'chest' || selectedPart === 'abdomen' || selectedPart === 'pelvis';
      if (isBackOnly) {
        targetAzimuth = Math.PI;
      } else if (isFrontOnly) {
        targetAzimuth = 0;
      } else {
        targetAzimuth = cameraTarget === 'back' ? Math.PI : 0;
      }
    }

    // Smooth lerp
    const ctrl = controlsRef.current;
    ctrl.target.x = THREE.MathUtils.lerp(ctrl.target.x, 0, 0.06);
    ctrl.target.y = THREE.MathUtils.lerp(ctrl.target.y, targetY, 0.06);
    ctrl.target.z = THREE.MathUtils.lerp(ctrl.target.z, 0, 0.06);

    // Distance
    const camera = state.camera;
    const toCamera = camera.position.clone().sub(ctrl.target);
    const currentDist = toCamera.length();
    const newDist = THREE.MathUtils.lerp(currentDist, targetDistance, 0.06);
    toCamera.setLength(newDist);
    camera.position.copy(ctrl.target).add(toCamera);

    // Azimuthal angle
    const currentAz = ctrl.getAzimuthalAngle();
    let diff = targetAzimuth - currentAz;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    if (Math.abs(diff) > 0.001) {
      ctrl.setAzimuthalAngle(currentAz + diff * 0.06);
    }

    ctrl.update();
  });

  return null;
};


/* ─── Loader3D ─── */
const Loader3D: React.FC = () => (
  <Html center style={{ pointerEvents: 'none' }}>
    <div className="sci-fi-loader-container">
      <div className="sci-fi-loader-ring"></div>
      <div className="sci-fi-loader-text">Scanning Anatomy...</div>
    </div>
  </Html>
);


/* ─── Scene ─── */
const Scene: React.FC<{
  selectedPart: string | null;
  onPartSelect: (part: string | null) => void;
  cameraTarget: 'front' | 'back';
}> = ({ selectedPart, onPartSelect, cameraTarget }) => {
  const controlsRef = useRef<any>(null!);
  const [idle, setIdle] = useState(true);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);



  const resetIdleTimer = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 4000);
  }, []);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.setAzimuthalAngle(cameraTarget === 'back' ? Math.PI : 0);
    controlsRef.current.update();
  }, [cameraTarget]);

  const handleHotspotClick = useCallback(
    (id: string) => onPartSelect(selectedPart === id ? null : id),
    [selectedPart, onPartSelect]
  );

  return (
    <>
      {/* Lighting — cinematic 3-point setup */}
      <ambientLight intensity={0.3} color="#b8d4e3" />
      <directionalLight position={[4, 6, 5]} intensity={0.9} color="#e0f0ff" />
      <directionalLight position={[-3, 4, 3]} intensity={0.5} color="#b0d8ff" />
      <directionalLight position={[0, 3, -5]} intensity={0.35} color="#06b6d4" />
      <pointLight position={[0, -3, 2]} intensity={0.15} color="#1e3a5f" distance={8} />
      <pointLight position={[2, 5, 0]} intensity={0.1} color="#2dd4bf" distance={10} />
      {/* Rim light for dramatic back-edge */}
      <spotLight position={[0, 4, -4]} intensity={0.6} color="#0ea5e9" angle={0.4} penumbra={0.8} />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Ambient particles */}
      <ParticleField />

      {/* Ground */}
      <GroundPlane />

      <Suspense fallback={<Loader3D />}>
        {/* The OBJ holographic body */}
        <HolographicOBJ
          selectedPart={selectedPart}
          hoveredPart={hoveredPart}
          onPartSelect={onPartSelect}
          onHover={setHoveredPart}
          cameraTarget={cameraTarget}
        />

        {/* Interactive hotspots */}
        {HOTSPOTS.filter(h => {
          if (cameraTarget === 'front') {
            return h.id !== 'upper_back' && h.id !== 'lower_back';
          } else {
            return h.id !== 'chest' && h.id !== 'abdomen' && h.id !== 'pelvis';
          }
        }).map((h, i) => (
          <InteractiveHotspot
            key={`${h.id}-${i}`}
            config={h}
            isSelected={selectedPart === h.id}
            isHovered={hoveredPart === h.id}
            onHover={setHoveredPart}
            onClick={handleHotspotClick}
          />
        ))}
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={2.5}
        maxDistance={9}
        minPolarAngle={Math.PI * 0.05}
        maxPolarAngle={Math.PI * 0.95}
        onStart={resetIdleTimer}
        onChange={resetIdleTimer}
        dampingFactor={0.06}
        enableDamping
      />
      <AutoRotateController controlsRef={controlsRef} idle={idle && !selectedPart} />
      <CameraController selectedPart={selectedPart} controlsRef={controlsRef} cameraTarget={cameraTarget} />
    </>
  );
};


/* ─── Main export ─── */
export const BodyModel3D: React.FC<BodyModel3DProps> = ({ selectedPart, onPartSelect }) => {
  const [cameraView, setCameraView] = useState<'front' | 'back'>('front');

  useEffect(() => {
    if (selectedPart === 'upper_back' || selectedPart === 'lower_back') {
      setCameraView('back');
    } else if (selectedPart === 'chest' || selectedPart === 'abdomen' || selectedPart === 'pelvis') {
      setCameraView('front');
    }
  }, [selectedPart]);

  return (
    <div className="body-model-3d-container">
      <div className="canvas-gradient-bg" />

      <div className="view-toggle-bar">
        <button className={`view-toggle-btn ${cameraView === 'front' ? 'active' : ''}`}
          onClick={() => setCameraView('front')} aria-label="Front view">Front</button>
        <button className={`view-toggle-btn ${cameraView === 'back' ? 'active' : ''}`}
          onClick={() => setCameraView('back')} aria-label="Back view">Back</button>
      </div>

      <Canvas
        camera={{ position: [0, 0.0, 5.8], fov: 38 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Scene selectedPart={selectedPart} onPartSelect={onPartSelect} cameraTarget={cameraView} />
      </Canvas>

      <div className="canvas-scan-line" />
    </div>
  );
};

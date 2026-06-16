import React, { useRef, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html, Stars, RoundedBox } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';


/* ─── Types ─── */
interface BodyModel3DProps {
  selectedPart: string | null;
  onPartSelect: (part: string | null) => void;
}

interface BodyPartMeshProps {
  partId: string;
  selectedPart: string | null;
  hoveredPart: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  children: React.ReactNode;
}

/* ─── Constants ─── */
const HOVER_COLOR = new THREE.Color('#06b6d4');
const SELECTED_COLOR = new THREE.Color('#ef4444');
const BASE_COLOR = new THREE.Color('#1e2d4a');
const SKIN_COLOR = new THREE.Color('#2a3b5c');
const JOINT_COLOR = new THREE.Color('#1a2845');
const DETAIL_COLOR = new THREE.Color('#162038');

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

/* ─── BodyPartMesh: wraps geometry with interaction logic ─── */
const BodyPartMesh: React.FC<BodyPartMeshProps> = ({
  partId, selectedPart, hoveredPart, onHover, onClick, children,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const isSelected = selectedPart === partId;
  const isHovered = hoveredPart === partId;

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        if (isSelected) {
          const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.25 + 0.75;
          child.material.emissive.copy(SELECTED_COLOR);
          child.material.emissiveIntensity = pulse * 0.7;
          child.material.opacity = 0.45;
        } else if (isHovered) {
          child.material.emissive.copy(HOVER_COLOR);
          child.material.emissiveIntensity = 0.5;
          child.material.opacity = 0.25;
        } else {
          child.material.emissive.set('#000000');
          child.material.emissiveIntensity = 0;
          child.material.opacity = 0;
        }
      }
    });
  });


  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); onHover(partId); document.body.style.cursor = 'pointer';
  }, [partId, onHover]);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); onHover(null); document.body.style.cursor = 'auto';
  }, [onHover]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); onClick(partId);
  }, [partId, onClick]);

  return (
    <group ref={groupRef}
      onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
      {children}
      {isHovered && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="body-part-label-3d">
            <span className="label-dot" />
            {BODY_PART_LABELS[partId]}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ─── Material helpers ─── */
const M = {
  body: () => <meshStandardMaterial color={BASE_COLOR} roughness={0.4} metalness={0.1} transparent opacity={0} />,
  skin: () => <meshStandardMaterial color={SKIN_COLOR} roughness={0.38} metalness={0.08} transparent opacity={0} />,
  joint: () => <meshStandardMaterial color={JOINT_COLOR} roughness={0.5} metalness={0.12} transparent opacity={0} />,
  detail: () => <meshStandardMaterial color={DETAIL_COLOR} roughness={0.55} metalness={0.05} transparent opacity={0} />,
};

interface HotspotConfig {
  id: string;
  position: [number, number, number];
  label: string;
}

const HOTSPOTS: HotspotConfig[] = [
  { id: 'head', position: [0, 2.9, 0.18], label: 'Head & Face' },
  { id: 'neck', position: [0, 2.42, 0.15], label: 'Neck & Throat' },
  { id: 'shoulders', position: [0.48, 2.15, 0.1], label: 'Right Shoulder' },
  { id: 'shoulders', position: [-0.48, 2.15, 0.1], label: 'Left Shoulder' },
  { id: 'chest', position: [0, 1.85, 0.22], label: 'Chest & Ribcage' },
  { id: 'upper_back', position: [0, 1.9, -0.22], label: 'Upper Back' },
  { id: 'abdomen', position: [0, 1.3, 0.2], label: 'Abdomen & Core' },
  { id: 'lower_back', position: [0, 1.25, -0.2], label: 'Lower Back & Spine' },
  { id: 'pelvis', position: [0, 0.95, 0.18], label: 'Pelvis & Groin' },
  { id: 'arms', position: [0.58, 1.6, 0.1], label: 'Right Arm' },
  { id: 'arms', position: [-0.58, 1.6, 0.1], label: 'Left Arm' },
  { id: 'hands', position: [0.72, 0.85, 0.1], label: 'Right Hand' },
  { id: 'hands', position: [-0.72, 0.85, 0.1], label: 'Left Hand' },
  { id: 'legs', position: [0.22, 0.45, 0.12], label: 'Right Leg' },
  { id: 'legs', position: [-0.22, 0.45, 0.12], label: 'Left Leg' },
  { id: 'feet', position: [0.22, -0.4, 0.15], label: 'Right Foot' },
  { id: 'feet', position: [-0.22, -0.4, 0.15], label: 'Left Foot' },
];


/* ════════════════════════════════════════════════════════════════
   HUMAN BODY — Comprehensive Anatomical Model (~80+ meshes)
   Covers every region from crown to toes, front and back
   ════════════════════════════════════════════════════════════════ */
const HumanBody: React.FC<{
  selectedPart: string | null;
  onPartSelect: (part: string | null) => void;
}> = ({ selectedPart, onPartSelect }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const handleClick = useCallback(
    (id: string) => onPartSelect(selectedPart === id ? null : id),
    [selectedPart, onPartSelect]
  );

  const bp = (partId: string, children: React.ReactNode) => (
    <BodyPartMesh partId={partId} selectedPart={selectedPart}
      hoveredPart={hoveredPart} onHover={setHoveredPart} onClick={handleClick}>
      {children}
    </BodyPartMesh>
  );

  return (
    <group position={[0, -0.3, 0]}>
      <OBJModel />

      {/* 3D Pulsing Hotspots Overlay */}
      {HOTSPOTS.map((h, index) => {
        const isActive = selectedPart === h.id;
        return (
          <Html
            key={`${h.id}-${index}`}
            position={h.position}
            center
            distanceFactor={8}
          >
            <div
              className={`sci-fi-hotspot-container ${isActive ? 'active' : ''}`}
              onPointerOver={() => setHoveredPart(h.id)}
              onPointerOut={() => setHoveredPart(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(h.id);
              }}
              title={h.label}
            >
              <div className="sci-fi-hotspot" />
            </div>
          </Html>
        );
      })}

      {/* ══ HEAD & FACE ═══════════════════════════════════════ */}
      {bp('head', <>
        {/* Cranium */}
        <mesh position={[0, 3.02, -0.02]} scale={[1, 1.1, 1]}>
          <sphereGeometry args={[0.34, 32, 32]} />{M.skin()}
        </mesh>
        {/* Forehead plate */}
        <mesh position={[0, 3.18, 0.18]} scale={[0.85, 0.4, 0.3]}>
          <sphereGeometry args={[0.2, 20, 16]} />{M.skin()}
        </mesh>
        {/* Face / mid-face */}
        <mesh position={[0, 2.88, 0.22]} scale={[0.75, 0.7, 0.45]}>
          <sphereGeometry args={[0.22, 20, 16]} />{M.skin()}
        </mesh>
        {/* Jaw / mandible */}
        <mesh position={[0, 2.68, 0.1]} scale={[0.82, 0.45, 0.65]}>
          <sphereGeometry args={[0.22, 20, 16]} />{M.skin()}
        </mesh>
        {/* Chin */}
        <mesh position={[0, 2.58, 0.18]} scale={[0.5, 0.35, 0.4]}>
          <sphereGeometry args={[0.12, 14, 14]} />{M.skin()}
        </mesh>
        {/* Left cheekbone */}
        <mesh position={[-0.22, 2.88, 0.2]} scale={[0.35, 0.3, 0.25]}>
          <sphereGeometry args={[0.12, 12, 12]} />{M.skin()}
        </mesh>
        {/* Right cheekbone */}
        <mesh position={[0.22, 2.88, 0.2]} scale={[0.35, 0.3, 0.25]}>
          <sphereGeometry args={[0.12, 12, 12]} />{M.skin()}
        </mesh>
        {/* Nose bridge + tip */}
        <mesh position={[0, 2.85, 0.33]} scale={[0.28, 0.45, 0.5]}>
          <sphereGeometry args={[0.055, 12, 12]} />{M.skin()}
        </mesh>
        <mesh position={[0, 2.78, 0.35]} scale={[0.4, 0.25, 0.35]}>
          <sphereGeometry args={[0.05, 10, 10]} />{M.skin()}
        </mesh>
        {/* Left eye socket */}
        <mesh position={[-0.12, 2.92, 0.28]} scale={[0.5, 0.3, 0.2]}>
          <sphereGeometry args={[0.06, 10, 10]} />{M.detail()}
        </mesh>
        {/* Right eye socket */}
        <mesh position={[0.12, 2.92, 0.28]} scale={[0.5, 0.3, 0.2]}>
          <sphereGeometry args={[0.06, 10, 10]} />{M.detail()}
        </mesh>
        {/* Brow ridge */}
        <mesh position={[0, 2.98, 0.26]} rotation={[0.2, 0, 0]} scale={[1, 0.3, 0.3]}>
          <capsuleGeometry args={[0.04, 0.22, 6, 10]} />{M.skin()}
        </mesh>
        {/* Left ear */}
        <mesh position={[-0.34, 2.88, 0]} scale={[0.18, 0.35, 0.4]}>
          <sphereGeometry args={[0.11, 12, 12]} />{M.skin()}
        </mesh>
        {/* Right ear */}
        <mesh position={[0.34, 2.88, 0]} scale={[0.18, 0.35, 0.4]}>
          <sphereGeometry args={[0.11, 12, 12]} />{M.skin()}
        </mesh>
        {/* Back of skull / occipital */}
        <mesh position={[0, 2.98, -0.2]} scale={[0.9, 0.9, 0.65]}>
          <sphereGeometry args={[0.25, 20, 20]} />{M.skin()}
        </mesh>
        {/* Mouth area */}
        <mesh position={[0, 2.72, 0.26]} scale={[0.55, 0.18, 0.2]}>
          <sphereGeometry args={[0.08, 10, 10]} />{M.detail()}
        </mesh>
      </>)}

      {/* ══ NECK & THROAT ═════════════════════════════════════ */}
      {bp('neck', <>
        {/* Main neck column */}
        <mesh position={[0, 2.42, 0]}>
          <cylinderGeometry args={[0.13, 0.16, 0.32, 16]} />{M.skin()}
        </mesh>
        {/* Adam's apple / larynx */}
        <mesh position={[0, 2.42, 0.14]} scale={[0.5, 0.55, 0.4]}>
          <sphereGeometry args={[0.06, 10, 10]} />{M.skin()}
        </mesh>
        {/* Left sternocleidomastoid muscle */}
        <mesh position={[-0.1, 2.38, 0.06]} rotation={[0.15, 0.2, 0.15]}>
          <capsuleGeometry args={[0.035, 0.2, 6, 10]} />{M.body()}
        </mesh>
        {/* Right sternocleidomastoid */}
        <mesh position={[0.1, 2.38, 0.06]} rotation={[0.15, -0.2, -0.15]}>
          <capsuleGeometry args={[0.035, 0.2, 6, 10]} />{M.body()}
        </mesh>
        {/* Left trapezius slope */}
        <mesh position={[-0.28, 2.3, -0.02]} rotation={[0, 0, 0.55]} scale={[1, 0.8, 0.7]}>
          <capsuleGeometry args={[0.065, 0.2, 6, 12]} />{M.body()}
        </mesh>
        {/* Right trapezius slope */}
        <mesh position={[0.28, 2.3, -0.02]} rotation={[0, 0, -0.55]} scale={[1, 0.8, 0.7]}>
          <capsuleGeometry args={[0.065, 0.2, 6, 12]} />{M.body()}
        </mesh>
        {/* Nape of neck (back) */}
        <mesh position={[0, 2.44, -0.12]} scale={[0.7, 0.8, 0.5]}>
          <sphereGeometry args={[0.1, 12, 12]} />{M.body()}
        </mesh>
      </>)}

      {/* ══ SHOULDERS ═════════════════════════════════════════ */}
      {bp('shoulders', <>
        {/* Left deltoid — front */}
        <mesh position={[-0.52, 2.14, 0.04]} scale={[1, 0.7, 0.85]}>
          <sphereGeometry args={[0.14, 18, 18]} />{M.body()}
        </mesh>
        {/* Left deltoid — side */}
        <mesh position={[-0.56, 2.12, -0.02]} scale={[0.7, 0.6, 0.8]}>
          <sphereGeometry args={[0.12, 14, 14]} />{M.body()}
        </mesh>
        {/* Left shoulder joint ball */}
        <mesh position={[-0.48, 2.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />{M.joint()}
        </mesh>
        {/* Right deltoid — front */}
        <mesh position={[0.52, 2.14, 0.04]} scale={[1, 0.7, 0.85]}>
          <sphereGeometry args={[0.14, 18, 18]} />{M.body()}
        </mesh>
        {/* Right deltoid — side */}
        <mesh position={[0.56, 2.12, -0.02]} scale={[0.7, 0.6, 0.8]}>
          <sphereGeometry args={[0.12, 14, 14]} />{M.body()}
        </mesh>
        {/* Right shoulder joint ball */}
        <mesh position={[0.48, 2.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />{M.joint()}
        </mesh>
        {/* Left clavicle */}
        <mesh position={[-0.24, 2.2, 0.08]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.025, 0.28, 6, 8]} />{M.joint()}
        </mesh>
        {/* Right clavicle */}
        <mesh position={[0.24, 2.2, 0.08]} rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.025, 0.28, 6, 8]} />{M.joint()}
        </mesh>
        {/* Left acromion (top of shoulder) */}
        <mesh position={[-0.48, 2.22, -0.04]} scale={[0.8, 0.3, 0.7]}>
          <sphereGeometry args={[0.07, 10, 10]} />{M.body()}
        </mesh>
        {/* Right acromion */}
        <mesh position={[0.48, 2.22, -0.04]} scale={[0.8, 0.3, 0.7]}>
          <sphereGeometry args={[0.07, 10, 10]} />{M.body()}
        </mesh>
      </>)}

      {/* ══ CHEST & RIBCAGE ═══════════════════════════════════ */}
      {bp('chest', <>
        {/* Upper chest plate */}
        <RoundedBox args={[0.82, 0.4, 0.38]} radius={0.1} smoothness={4} position={[0, 2.0, 0.02]}>
          {M.body()}
        </RoundedBox>
        {/* Lower chest / ribcage */}
        <RoundedBox args={[0.78, 0.35, 0.36]} radius={0.08} smoothness={4} position={[0, 1.66, 0.01]}>
          {M.body()}
        </RoundedBox>
        {/* Left pec major */}
        <mesh position={[-0.18, 1.98, 0.2]} scale={[1.15, 0.65, 0.45]}>
          <sphereGeometry args={[0.15, 16, 16]} />{M.body()}
        </mesh>
        {/* Right pec major */}
        <mesh position={[0.18, 1.98, 0.2]} scale={[1.15, 0.65, 0.45]}>
          <sphereGeometry args={[0.15, 16, 16]} />{M.body()}
        </mesh>
        {/* Left pec minor */}
        <mesh position={[-0.2, 1.82, 0.18]} scale={[1, 0.5, 0.35]}>
          <sphereGeometry args={[0.1, 12, 12]} />{M.body()}
        </mesh>
        {/* Right pec minor */}
        <mesh position={[0.2, 1.82, 0.18]} scale={[1, 0.5, 0.35]}>
          <sphereGeometry args={[0.1, 12, 12]} />{M.body()}
        </mesh>
        {/* Sternum */}
        <mesh position={[0, 1.88, 0.2]}>
          <cylinderGeometry args={[0.015, 0.018, 0.55, 8]} />{M.detail()}
        </mesh>
        {/* Left rib lines (3 ribs) */}
        <mesh position={[-0.2, 1.72, 0.16]} rotation={[0, 0, 0.35]} scale={[1, 0.8, 0.5]}>
          <capsuleGeometry args={[0.012, 0.18, 4, 6]} />{M.detail()}
        </mesh>
        <mesh position={[-0.22, 1.62, 0.14]} rotation={[0, 0, 0.4]} scale={[1, 0.8, 0.5]}>
          <capsuleGeometry args={[0.012, 0.2, 4, 6]} />{M.detail()}
        </mesh>
        <mesh position={[-0.22, 1.52, 0.12]} rotation={[0, 0, 0.5]} scale={[1, 0.8, 0.5]}>
          <capsuleGeometry args={[0.012, 0.2, 4, 6]} />{M.detail()}
        </mesh>
        {/* Right rib lines (3 ribs) */}
        <mesh position={[0.2, 1.72, 0.16]} rotation={[0, 0, -0.35]} scale={[1, 0.8, 0.5]}>
          <capsuleGeometry args={[0.012, 0.18, 4, 6]} />{M.detail()}
        </mesh>
        <mesh position={[0.22, 1.62, 0.14]} rotation={[0, 0, -0.4]} scale={[1, 0.8, 0.5]}>
          <capsuleGeometry args={[0.012, 0.2, 4, 6]} />{M.detail()}
        </mesh>
        <mesh position={[0.22, 1.52, 0.12]} rotation={[0, 0, -0.5]} scale={[1, 0.8, 0.5]}>
          <capsuleGeometry args={[0.012, 0.2, 4, 6]} />{M.detail()}
        </mesh>
        {/* Left nipple area marker */}
        <mesh position={[-0.18, 1.9, 0.22]}>
          <sphereGeometry args={[0.015, 8, 8]} />{M.detail()}
        </mesh>
        {/* Right nipple area marker */}
        <mesh position={[0.18, 1.9, 0.22]}>
          <sphereGeometry args={[0.015, 8, 8]} />{M.detail()}
        </mesh>
      </>)}

      {/* ══ UPPER BACK ════════════════════════════════════════ */}
      {bp('upper_back', <>
        {/* Upper back plate */}
        <RoundedBox args={[0.8, 0.65, 0.28]} radius={0.08} smoothness={4} position={[0, 1.88, -0.18]}>
          {M.body()}
        </RoundedBox>
        {/* Left scapula (shoulder blade) */}
        <mesh position={[-0.22, 1.92, -0.25]} scale={[0.65, 1.0, 0.35]}>
          <sphereGeometry args={[0.14, 14, 14]} />{M.body()}
        </mesh>
        {/* Right scapula */}
        <mesh position={[0.22, 1.92, -0.25]} scale={[0.65, 1.0, 0.35]}>
          <sphereGeometry args={[0.14, 14, 14]} />{M.body()}
        </mesh>
        {/* Left rhomboid */}
        <mesh position={[-0.12, 1.95, -0.2]} scale={[0.4, 0.8, 0.3]}>
          <capsuleGeometry args={[0.05, 0.12, 6, 10]} />{M.body()}
        </mesh>
        {/* Right rhomboid */}
        <mesh position={[0.12, 1.95, -0.2]} scale={[0.4, 0.8, 0.3]}>
          <capsuleGeometry args={[0.05, 0.12, 6, 10]} />{M.body()}
        </mesh>
        {/* Upper spine / thoracic vertebrae (visible bumps) */}
        <mesh position={[0, 2.05, -0.22]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0, 1.92, -0.22]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0, 1.79, -0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />{M.detail()}
        </mesh>
        {/* Left lat (latissimus dorsi) — side of back */}
        <mesh position={[-0.36, 1.72, -0.1]} scale={[0.5, 1.0, 0.6]}>
          <capsuleGeometry args={[0.08, 0.18, 6, 12]} />{M.body()}
        </mesh>
        {/* Right lat */}
        <mesh position={[0.36, 1.72, -0.1]} scale={[0.5, 1.0, 0.6]}>
          <capsuleGeometry args={[0.08, 0.18, 6, 12]} />{M.body()}
        </mesh>
      </>)}

      {/* ══ ABDOMEN & CORE ════════════════════════════════════ */}
      {bp('abdomen', <>
        {/* Main abdomen block */}
        <RoundedBox args={[0.72, 0.42, 0.34]} radius={0.06} smoothness={4} position={[0, 1.3, 0.02]}>
          {M.body()}
        </RoundedBox>
        {/* Left rectus abdominis (abs) */}
        <mesh position={[-0.1, 1.38, 0.18]} scale={[0.55, 1.2, 0.3]}>
          <capsuleGeometry args={[0.05, 0.16, 6, 10]} />{M.body()}
        </mesh>
        {/* Right rectus abdominis */}
        <mesh position={[0.1, 1.38, 0.18]} scale={[0.55, 1.2, 0.3]}>
          <capsuleGeometry args={[0.05, 0.16, 6, 10]} />{M.body()}
        </mesh>
        {/* Left oblique */}
        <mesh position={[-0.32, 1.3, 0.04]} scale={[0.45, 1.2, 0.6]}>
          <capsuleGeometry args={[0.055, 0.18, 6, 12]} />{M.body()}
        </mesh>
        {/* Right oblique */}
        <mesh position={[0.32, 1.3, 0.04]} scale={[0.45, 1.2, 0.6]}>
          <capsuleGeometry args={[0.055, 0.18, 6, 12]} />{M.body()}
        </mesh>
        {/* Abs midline (linea alba) */}
        <mesh position={[0, 1.3, 0.19]}>
          <cylinderGeometry args={[0.01, 0.01, 0.38, 8]} />{M.detail()}
        </mesh>
        {/* Navel */}
        <mesh position={[0, 1.22, 0.2]}>
          <sphereGeometry args={[0.025, 10, 10]} />{M.detail()}
        </mesh>
        {/* Ab separation lines (horizontal) */}
        <mesh position={[0, 1.42, 0.19]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.008, 0.1, 4, 6]} />{M.detail()}
        </mesh>
        <mesh position={[0, 1.32, 0.19]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.008, 0.1, 4, 6]} />{M.detail()}
        </mesh>
      </>)}

      {/* ══ LOWER BACK & SPINE ════════════════════════════════ */}
      {bp('lower_back', <>
        {/* Lower back mass */}
        <RoundedBox args={[0.7, 0.42, 0.28]} radius={0.06} smoothness={4} position={[0, 1.3, -0.16]}>
          {M.body()}
        </RoundedBox>
        {/* Lumbar spine segments */}
        <mesh position={[0, 1.4, -0.2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0, 1.3, -0.2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0, 1.2, -0.2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0, 1.1, -0.18]}>
          <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />{M.detail()}
        </mesh>
        {/* Left erector spinae (lower back muscles) */}
        <mesh position={[-0.12, 1.25, -0.18]} scale={[0.5, 1.2, 0.5]}>
          <capsuleGeometry args={[0.04, 0.22, 6, 10]} />{M.body()}
        </mesh>
        {/* Right erector spinae */}
        <mesh position={[0.12, 1.25, -0.18]} scale={[0.5, 1.2, 0.5]}>
          <capsuleGeometry args={[0.04, 0.22, 6, 10]} />{M.body()}
        </mesh>
        {/* Sacrum */}
        <mesh position={[0, 1.02, -0.16]} scale={[0.6, 0.5, 0.4]}>
          <sphereGeometry args={[0.1, 12, 12]} />{M.body()}
        </mesh>
      </>)}

      {/* ══ PELVIS & GROIN ════════════════════════════════════ */}
      {bp('pelvis', <>
        {/* Pelvis girdle — front */}
        <RoundedBox args={[0.72, 0.3, 0.32]} radius={0.08} smoothness={4} position={[0, 0.98, 0.02]}>
          {M.body()}
        </RoundedBox>
        {/* Left iliac crest (hip bone top) */}
        <mesh position={[-0.32, 1.06, 0]} scale={[0.5, 0.35, 0.7]}>
          <sphereGeometry args={[0.1, 12, 12]} />{M.body()}
        </mesh>
        {/* Right iliac crest */}
        <mesh position={[0.32, 1.06, 0]} scale={[0.5, 0.35, 0.7]}>
          <sphereGeometry args={[0.1, 12, 12]} />{M.body()}
        </mesh>
        {/* Left hip joint */}
        <mesh position={[-0.24, 0.9, 0.02]}>
          <sphereGeometry args={[0.09, 14, 14]} />{M.joint()}
        </mesh>
        {/* Right hip joint */}
        <mesh position={[0.24, 0.9, 0.02]}>
          <sphereGeometry args={[0.09, 14, 14]} />{M.joint()}
        </mesh>
        {/* Groin / inguinal area — center low */}
        <mesh position={[0, 0.86, 0.1]} scale={[0.65, 0.35, 0.45]}>
          <sphereGeometry args={[0.12, 14, 14]} />{M.body()}
        </mesh>
        {/* Pubic region */}
        <mesh position={[0, 0.82, 0.12]} scale={[0.5, 0.25, 0.35]}>
          <sphereGeometry args={[0.1, 12, 12]} />{M.body()}
        </mesh>
        {/* Left inner groin crease */}
        <mesh position={[-0.14, 0.84, 0.08]} rotation={[0, 0, 0.3]} scale={[0.3, 0.8, 0.3]}>
          <capsuleGeometry args={[0.015, 0.1, 4, 8]} />{M.detail()}
        </mesh>
        {/* Right inner groin crease */}
        <mesh position={[0.14, 0.84, 0.08]} rotation={[0, 0, -0.3]} scale={[0.3, 0.8, 0.3]}>
          <capsuleGeometry args={[0.015, 0.1, 4, 8]} />{M.detail()}
        </mesh>
        {/* Left gluteus (buttock) */}
        <mesh position={[-0.18, 0.9, -0.16]} scale={[0.9, 0.85, 0.7]}>
          <sphereGeometry args={[0.14, 16, 16]} />{M.body()}
        </mesh>
        {/* Right gluteus */}
        <mesh position={[0.18, 0.9, -0.16]} scale={[0.9, 0.85, 0.7]}>
          <sphereGeometry args={[0.14, 16, 16]} />{M.body()}
        </mesh>
        {/* Gluteal cleft line */}
        <mesh position={[0, 0.88, -0.2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />{M.detail()}
        </mesh>
        {/* Coccyx / tailbone */}
        <mesh position={[0, 0.82, -0.18]} scale={[0.3, 0.25, 0.3]}>
          <sphereGeometry args={[0.06, 10, 10]} />{M.detail()}
        </mesh>
      </>)}

      {/* ══ ARMS ══════════════════════════════════════════════ */}
      {bp('arms', <>
        {/* -- Left arm -- */}
        {/* Left bicep */}
        <mesh position={[-0.64, 1.88, 0.04]} rotation={[0, 0, 0.58]}>
          <capsuleGeometry args={[0.09, 0.38, 8, 16]} />{M.body()}
        </mesh>
        {/* Left bicep peak */}
        <mesh position={[-0.64, 1.92, 0.1]} scale={[0.7, 0.5, 0.5]}>
          <sphereGeometry args={[0.07, 10, 10]} />{M.body()}
        </mesh>
        {/* Left tricep (back of upper arm) */}
        <mesh position={[-0.67, 1.86, -0.06]} rotation={[0, 0, 0.58]} scale={[0.8, 1.2, 0.7]}>
          <capsuleGeometry args={[0.06, 0.2, 6, 10]} />{M.body()}
        </mesh>
        {/* Left elbow */}
        <mesh position={[-0.8, 1.65, 0]}>
          <sphereGeometry args={[0.07, 14, 14]} />{M.joint()}
        </mesh>
        {/* Left olecranon (elbow point) */}
        <mesh position={[-0.82, 1.63, -0.06]} scale={[0.6, 0.5, 0.5]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.joint()}
        </mesh>
        {/* Left forearm */}
        <mesh position={[-0.95, 1.57, 0.03]} rotation={[0.06, 0, 0.85]}>
          <cylinderGeometry args={[0.055, 0.078, 0.48, 12]} />{M.body()}
        </mesh>
        {/* Left forearm muscle bulk */}
        <mesh position={[-0.93, 1.62, 0.04]} rotation={[0, 0, 0.85]} scale={[0.8, 0.8, 0.6]}>
          <capsuleGeometry args={[0.05, 0.12, 6, 10]} />{M.body()}
        </mesh>
        {/* Left wrist */}
        <mesh position={[-1.09, 1.48, 0.05]}>
          <sphereGeometry args={[0.048, 12, 12]} />{M.joint()}
        </mesh>

        {/* -- Right arm -- */}
        <mesh position={[0.64, 1.88, 0.04]} rotation={[0, 0, -0.58]}>
          <capsuleGeometry args={[0.09, 0.38, 8, 16]} />{M.body()}
        </mesh>
        <mesh position={[0.64, 1.92, 0.1]} scale={[0.7, 0.5, 0.5]}>
          <sphereGeometry args={[0.07, 10, 10]} />{M.body()}
        </mesh>
        <mesh position={[0.67, 1.86, -0.06]} rotation={[0, 0, -0.58]} scale={[0.8, 1.2, 0.7]}>
          <capsuleGeometry args={[0.06, 0.2, 6, 10]} />{M.body()}
        </mesh>
        <mesh position={[0.8, 1.65, 0]}>
          <sphereGeometry args={[0.07, 14, 14]} />{M.joint()}
        </mesh>
        <mesh position={[0.82, 1.63, -0.06]} scale={[0.6, 0.5, 0.5]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.joint()}
        </mesh>
        <mesh position={[0.95, 1.57, 0.03]} rotation={[0.06, 0, -0.85]}>
          <cylinderGeometry args={[0.055, 0.078, 0.48, 12]} />{M.body()}
        </mesh>
        <mesh position={[0.93, 1.62, 0.04]} rotation={[0, 0, -0.85]} scale={[0.8, 0.8, 0.6]}>
          <capsuleGeometry args={[0.05, 0.12, 6, 10]} />{M.body()}
        </mesh>
        <mesh position={[1.09, 1.48, 0.05]}>
          <sphereGeometry args={[0.048, 12, 12]} />{M.joint()}
        </mesh>
      </>)}

      {/* ══ HANDS & WRISTS ════════════════════════════════════ */}
      {bp('hands', <>
        {/* -- Left hand -- */}
        <group position={[-1.09, 1.48, 0.05]} rotation={[0, 0, 0.85]}>
          <RoundedBox args={[0.09, 0.11, 0.05]} radius={0.015} smoothness={3} position={[0, 0, 0.01]}>
            {M.skin()}
          </RoundedBox>
          {/* Left 4 fingers */}
          <mesh position={[0, -0.1, 0]} scale={[1, 1, 0.75]}>
            <capsuleGeometry args={[0.028, 0.1, 6, 8]} />{M.skin()}
          </mesh>
          {/* Left index finger */}
          <mesh position={[0.03, -0.12, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.015, 0.08, 4, 6]} />{M.skin()}
          </mesh>
          {/* Left pinky */}
          <mesh position={[-0.03, -0.09, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.013, 0.06, 4, 6]} />{M.skin()}
          </mesh>
          {/* Left thumb */}
          <mesh position={[0.07, -0.01, 0.02]} rotation={[0, 0, 0.6]}>
            <capsuleGeometry args={[0.02, 0.07, 6, 8]} />{M.skin()}
          </mesh>
          {/* Left knuckles */}
          <mesh position={[0, -0.06, 0.02]} scale={[1.1, 0.25, 0.5]}>
            <capsuleGeometry args={[0.02, 0.04, 4, 6]} />{M.joint()}
          </mesh>
        </group>

        {/* -- Right hand -- */}
        <group position={[1.09, 1.48, 0.05]} rotation={[0, 0, -0.85]}>
          <RoundedBox args={[0.09, 0.11, 0.05]} radius={0.015} smoothness={3} position={[0, 0, 0.01]}>
            {M.skin()}
          </RoundedBox>
          <mesh position={[0, -0.1, 0]} scale={[1, 1, 0.75]}>
            <capsuleGeometry args={[0.028, 0.1, 6, 8]} />{M.skin()}
          </mesh>
          <mesh position={[-0.03, -0.12, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.015, 0.08, 4, 6]} />{M.skin()}
          </mesh>
          <mesh position={[0.03, -0.09, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.013, 0.06, 4, 6]} />{M.skin()}
          </mesh>
          <mesh position={[-0.07, -0.01, 0.02]} rotation={[0, 0, -0.6]}>
            <capsuleGeometry args={[0.02, 0.07, 6, 8]} />{M.skin()}
          </mesh>
          <mesh position={[0, -0.06, 0.02]} scale={[1.1, 0.25, 0.5]}>
            <capsuleGeometry args={[0.02, 0.04, 4, 6]} />{M.joint()}
          </mesh>
        </group>
      </>)}

      {/* ══ LEGS & KNEES ══════════════════════════════════════ */}
      {bp('legs', <>
        {/* -- Left leg -- */}
        {/* Left thigh (quadriceps) */}
        <mesh position={[-0.22, 0.6, 0.02]}>
          <cylinderGeometry args={[0.09, 0.135, 0.52, 14]} />{M.body()}
        </mesh>
        {/* Left quad muscle bulk */}
        <mesh position={[-0.22, 0.65, 0.1]} scale={[0.8, 1.0, 0.5]}>
          <capsuleGeometry args={[0.075, 0.18, 6, 12]} />{M.body()}
        </mesh>
        {/* Left hamstring (back of thigh) */}
        <mesh position={[-0.22, 0.62, -0.08]} scale={[0.75, 1.1, 0.5]}>
          <capsuleGeometry args={[0.065, 0.18, 6, 12]} />{M.body()}
        </mesh>
        {/* Left inner thigh / adductor */}
        <mesh position={[-0.14, 0.65, 0.02]} scale={[0.4, 1.0, 0.6]}>
          <capsuleGeometry args={[0.06, 0.15, 6, 10]} />{M.body()}
        </mesh>
        {/* Left knee */}
        <mesh position={[-0.22, 0.3, 0.03]}>
          <sphereGeometry args={[0.085, 16, 16]} />{M.joint()}
        </mesh>
        {/* Left kneecap (patella) */}
        <mesh position={[-0.22, 0.3, 0.1]} scale={[0.75, 0.85, 0.4]}>
          <sphereGeometry args={[0.055, 12, 12]} />{M.joint()}
        </mesh>
        {/* Left back of knee (popliteal) */}
        <mesh position={[-0.22, 0.3, -0.06]} scale={[0.7, 0.6, 0.4]}>
          <sphereGeometry args={[0.05, 10, 10]} />{M.detail()}
        </mesh>
        {/* Left shin (tibia) */}
        <mesh position={[-0.22, -0.02, 0.03]}>
          <cylinderGeometry args={[0.06, 0.08, 0.54, 12]} />{M.body()}
        </mesh>
        {/* Left shin bone ridge */}
        <mesh position={[-0.22, -0.02, 0.08]} scale={[0.2, 1.0, 0.3]}>
          <capsuleGeometry args={[0.02, 0.3, 4, 8]} />{M.detail()}
        </mesh>
        {/* Left calf muscle (gastrocnemius) */}
        <mesh position={[-0.22, 0.06, -0.04]} scale={[0.75, 0.9, 0.6]}>
          <capsuleGeometry args={[0.065, 0.18, 6, 12]} />{M.body()}
        </mesh>
        {/* Left calf inner head */}
        <mesh position={[-0.18, 0.08, -0.04]} scale={[0.4, 0.7, 0.45]}>
          <capsuleGeometry args={[0.04, 0.1, 6, 8]} />{M.body()}
        </mesh>

        {/* -- Right leg (mirror) -- */}
        <mesh position={[0.22, 0.6, 0.02]}>
          <cylinderGeometry args={[0.09, 0.135, 0.52, 14]} />{M.body()}
        </mesh>
        <mesh position={[0.22, 0.65, 0.1]} scale={[0.8, 1.0, 0.5]}>
          <capsuleGeometry args={[0.075, 0.18, 6, 12]} />{M.body()}
        </mesh>
        <mesh position={[0.22, 0.62, -0.08]} scale={[0.75, 1.1, 0.5]}>
          <capsuleGeometry args={[0.065, 0.18, 6, 12]} />{M.body()}
        </mesh>
        <mesh position={[0.14, 0.65, 0.02]} scale={[0.4, 1.0, 0.6]}>
          <capsuleGeometry args={[0.06, 0.15, 6, 10]} />{M.body()}
        </mesh>
        <mesh position={[0.22, 0.3, 0.03]}>
          <sphereGeometry args={[0.085, 16, 16]} />{M.joint()}
        </mesh>
        <mesh position={[0.22, 0.3, 0.1]} scale={[0.75, 0.85, 0.4]}>
          <sphereGeometry args={[0.055, 12, 12]} />{M.joint()}
        </mesh>
        <mesh position={[0.22, 0.3, -0.06]} scale={[0.7, 0.6, 0.4]}>
          <sphereGeometry args={[0.05, 10, 10]} />{M.detail()}
        </mesh>
        <mesh position={[0.22, -0.02, 0.03]}>
          <cylinderGeometry args={[0.06, 0.08, 0.54, 12]} />{M.body()}
        </mesh>
        <mesh position={[0.22, -0.02, 0.08]} scale={[0.2, 1.0, 0.3]}>
          <capsuleGeometry args={[0.02, 0.3, 4, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0.22, 0.06, -0.04]} scale={[0.75, 0.9, 0.6]}>
          <capsuleGeometry args={[0.065, 0.18, 6, 12]} />{M.body()}
        </mesh>
        <mesh position={[0.18, 0.08, -0.04]} scale={[0.4, 0.7, 0.45]}>
          <capsuleGeometry args={[0.04, 0.1, 6, 8]} />{M.body()}
        </mesh>
      </>)}

      {/* ══ FEET & ANKLES ═════════════════════════════════════ */}
      {bp('feet', <>
        {/* -- Left foot -- */}
        {/* Left ankle */}
        <mesh position={[-0.22, -0.34, 0.02]}>
          <sphereGeometry args={[0.06, 14, 14]} />{M.joint()}
        </mesh>
        {/* Left lateral malleolus (outer ankle bone) */}
        <mesh position={[-0.28, -0.34, 0]} scale={[0.35, 0.45, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.joint()}
        </mesh>
        {/* Left medial malleolus (inner ankle bone) */}
        <mesh position={[-0.16, -0.34, 0]} scale={[0.35, 0.45, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.joint()}
        </mesh>
        {/* Left Achilles tendon */}
        <mesh position={[-0.22, -0.32, -0.06]} scale={[0.35, 0.6, 0.3]}>
          <capsuleGeometry args={[0.02, 0.06, 4, 8]} />{M.detail()}
        </mesh>
        {/* Left heel */}
        <mesh position={[-0.22, -0.42, -0.04]} scale={[0.85, 0.5, 0.8]}>
          <sphereGeometry args={[0.065, 12, 12]} />{M.body()}
        </mesh>
        {/* Left midfoot */}
        <RoundedBox args={[0.12, 0.05, 0.22]} radius={0.02} smoothness={3} position={[-0.22, -0.44, 0.06]}>
          {M.body()}
        </RoundedBox>
        {/* Left arch (inside) */}
        <mesh position={[-0.18, -0.42, 0.02]} scale={[0.25, 0.3, 0.8]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.detail()}
        </mesh>
        {/* Left toes (ball of foot) */}
        <mesh position={[-0.22, -0.44, 0.2]} scale={[1.1, 0.4, 0.55]}>
          <sphereGeometry args={[0.055, 12, 12]} />{M.body()}
        </mesh>
        {/* Left big toe */}
        <mesh position={[-0.17, -0.44, 0.25]} scale={[0.6, 0.35, 0.5]}>
          <sphereGeometry args={[0.03, 8, 8]} />{M.skin()}
        </mesh>
        {/* Left small toes */}
        <mesh position={[-0.25, -0.44, 0.24]} scale={[0.8, 0.3, 0.4]}>
          <capsuleGeometry args={[0.015, 0.04, 4, 6]} />{M.skin()}
        </mesh>
        {/* Left top of foot (dorsum) */}
        <mesh position={[-0.22, -0.41, 0.1]} scale={[0.9, 0.25, 0.8]}>
          <sphereGeometry args={[0.06, 10, 10]} />{M.skin()}
        </mesh>

        {/* -- Right foot (mirror) -- */}
        <mesh position={[0.22, -0.34, 0.02]}>
          <sphereGeometry args={[0.06, 14, 14]} />{M.joint()}
        </mesh>
        <mesh position={[0.28, -0.34, 0]} scale={[0.35, 0.45, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.joint()}
        </mesh>
        <mesh position={[0.16, -0.34, 0]} scale={[0.35, 0.45, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.joint()}
        </mesh>
        <mesh position={[0.22, -0.32, -0.06]} scale={[0.35, 0.6, 0.3]}>
          <capsuleGeometry args={[0.02, 0.06, 4, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0.22, -0.42, -0.04]} scale={[0.85, 0.5, 0.8]}>
          <sphereGeometry args={[0.065, 12, 12]} />{M.body()}
        </mesh>
        <RoundedBox args={[0.12, 0.05, 0.22]} radius={0.02} smoothness={3} position={[0.22, -0.44, 0.06]}>
          {M.body()}
        </RoundedBox>
        <mesh position={[0.18, -0.42, 0.02]} scale={[0.25, 0.3, 0.8]}>
          <sphereGeometry args={[0.04, 8, 8]} />{M.detail()}
        </mesh>
        <mesh position={[0.22, -0.44, 0.2]} scale={[1.1, 0.4, 0.55]}>
          <sphereGeometry args={[0.055, 12, 12]} />{M.body()}
        </mesh>
        <mesh position={[0.17, -0.44, 0.25]} scale={[0.6, 0.35, 0.5]}>
          <sphereGeometry args={[0.03, 8, 8]} />{M.skin()}
        </mesh>
        <mesh position={[0.25, -0.44, 0.24]} scale={[0.8, 0.3, 0.4]}>
          <capsuleGeometry args={[0.015, 0.04, 4, 6]} />{M.skin()}
        </mesh>
        <mesh position={[0.22, -0.41, 0.1]} scale={[0.9, 0.25, 0.8]}>
          <sphereGeometry args={[0.06, 10, 10]} />{M.skin()}
        </mesh>
      </>)}

    </group>
  );
};

/* ─── AutoRotate ─── */
const AutoRotateController: React.FC<{ controlsRef: React.RefObject<any>; idle: boolean }> = ({
  controlsRef, idle,
}) => {
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = idle;
      controlsRef.current.autoRotateSpeed = 1.0;
      controlsRef.current.update();
    }
  });
  return null;
};

/* ─── Loader3D: sci-fi loading component ─── */
const Loader3D: React.FC = () => {
  return (
    <Html center style={{ pointerEvents: 'none' }}>
      <div className="sci-fi-loader-container">
        <div className="sci-fi-loader-ring"></div>
        <div className="sci-fi-loader-text">Scanning Anatomy...</div>
      </div>
    </Html>
  );
};

/* ─── OBJModel: High-fidelity holographic OBJ mesh ─── */
const OBJModel: React.FC = () => {
  const obj = useLoader(OBJLoader, '/models/FinalBaseMesh.obj');
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const currentGroup = groupRef.current;
    if (!currentGroup) return;
    
    // Clear previous children
    while (currentGroup.children.length > 0) {
      currentGroup.remove(currentGroup.children[0]);
    }

    // Traverse loaded OBJ and construct glassmorphic and wireframe layers
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Clone geometry so we don't modify shared cache
        const geom = child.geometry.clone();
        geom.center();
        geom.computeBoundingBox();
        const boundingBox = geom.boundingBox;
        
        let scaleFactor = 1;
        if (boundingBox) {
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const targetHeight = 3.89; // Align height exactly with colliders
          scaleFactor = targetHeight / size.y;
        }

        // 1. Holographic body layer
        const bodyMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#083344'),
          emissive: new THREE.Color('#083344'),
          emissiveIntensity: 0.1,
          transparent: true,
          opacity: 0.45,
          roughness: 0.25,
          metalness: 0.85,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          transmission: 0.45,
          thickness: 0.4,
          side: THREE.DoubleSide,
        });
        const bodyMesh = new THREE.Mesh(geom, bodyMat);
        bodyMesh.scale.setScalar(scaleFactor);
        bodyMesh.raycast = () => {};

        // 2. Wireframe diagnostic grid overlay
        const wireMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#06b6d4'),
          wireframe: true,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
        });
        const wireMesh = new THREE.Mesh(geom, wireMat);
        wireMesh.scale.setScalar(scaleFactor);
        wireMesh.raycast = () => {};

        currentGroup.add(bodyMesh);
        currentGroup.add(wireMesh);
      }
    });
  }, [obj]);

  return <group ref={groupRef} position={[0, 1.45, 0]} />;
};

/* ─── CameraController: smooth focal centering and zooming ─── */
const CameraController: React.FC<{ selectedPart: string | null; controlsRef: React.RefObject<any> }> = ({
  selectedPart,
  controlsRef,
}) => {
  useFrame((state) => {
    if (!controlsRef.current) return;

    // Default target: centered around chest/abdomen area, zoomed out
    let targetY = 1.0; 
    let targetDistance = 4.8;
    let targetAzimuth = controlsRef.current.getAzimuthalAngle();

    // Map each part to its focus settings
    const PART_CAMERA_TARGETS: Record<string, { y: number; distance: number; angle: number }> = {
      head: { y: 2.7, distance: 2.5, angle: 0 },
      neck: { y: 2.3, distance: 2.5, angle: 0 },
      shoulders: { y: 2.0, distance: 3.0, angle: 0 },
      chest: { y: 1.7, distance: 3.0, angle: 0 },
      upper_back: { y: 1.9, distance: 3.0, angle: Math.PI },
      abdomen: { y: 1.3, distance: 3.2, angle: 0 },
      lower_back: { y: 1.2, distance: 3.2, angle: Math.PI },
      pelvis: { y: 0.8, distance: 3.2, angle: 0 },
      arms: { y: 1.4, distance: 3.6, angle: 0 },
      hands: { y: 0.9, distance: 3.0, angle: 0 },
      legs: { y: 0.2, distance: 3.8, angle: 0 },
      feet: { y: -0.4, distance: 2.8, angle: 0 },
    };

    if (selectedPart && PART_CAMERA_TARGETS[selectedPart]) {
      const cfg = PART_CAMERA_TARGETS[selectedPart];
      targetY = cfg.y - 0.3; // align with the position offset of HumanBody group
      targetDistance = cfg.distance;
      targetAzimuth = cfg.angle;
    }

    // 1. Lerp OrbitControls target point
    controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, 0, 0.08);
    controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.08);
    controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, 0, 0.08);

    // 2. Lerp camera distance (zoom)
    const camera = state.camera;
    const toCamera = camera.position.clone().sub(controlsRef.current.target);
    const currentDistance = toCamera.length();
    const newDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, 0.08);
    toCamera.setLength(newDistance);
    camera.position.copy(controlsRef.current.target).add(toCamera);

    // 3. Lerp azimuthal rotation angle
    const currentAzimuth = controlsRef.current.getAzimuthalAngle();
    let diff = targetAzimuth - currentAzimuth;
    // Normalize to [-PI, PI]
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    if (Math.abs(diff) > 0.001) {
      controlsRef.current.setAzimuthalAngle(currentAzimuth + diff * 0.08);
    }

    controlsRef.current.update();
  });

  return null;
};

/* ─── Scene ─── */
const Scene: React.FC<{
  selectedPart: string | null;
  onPartSelect: (part: string | null) => void;
  cameraTarget: 'front' | 'back';
}> = ({ selectedPart, onPartSelect, cameraTarget }) => {
  const controlsRef = useRef<any>(null!);
  const [idle, setIdle] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 3000);
  }, []);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.setAzimuthalAngle(cameraTarget === 'back' ? Math.PI : 0);
    controlsRef.current.update();
  }, [cameraTarget]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={0.85} color="#e8f4ff" />
      <directionalLight position={[-3, 3, 2]} intensity={0.45} color="#cde8ff" />
      <directionalLight position={[0, 2, -4]} intensity={0.35} color="#06b6d4" />
      <pointLight position={[0, -3, 2]} intensity={0.25} color="#1e3a5f" />
      <pointLight position={[0, 3, -2]} intensity={0.15} color="#2a4a7f" />

      <Stars radius={50} depth={30} count={800} factor={2.5} saturation={0} fade speed={0.5} />

      <Suspense fallback={<Loader3D />}>
        <HumanBody selectedPart={selectedPart} onPartSelect={onPartSelect} />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false} enableZoom={true}
        minDistance={2.5} maxDistance={8}
        minPolarAngle={Math.PI * 0.1} maxPolarAngle={Math.PI * 0.9}
        onStart={resetIdleTimer} onChange={resetIdleTimer}
        dampingFactor={0.08} enableDamping
      />
      <AutoRotateController controlsRef={controlsRef} idle={idle && !selectedPart} />
      <CameraController selectedPart={selectedPart} controlsRef={controlsRef} />
    </>
  );
};

/* ─── Main export ─── */
export const BodyModel3D: React.FC<BodyModel3DProps> = ({ selectedPart, onPartSelect }) => {
  const [cameraView, setCameraView] = useState<'front' | 'back'>('front');

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
        camera={{ position: [0, 1.5, 5], fov: 38 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <Scene selectedPart={selectedPart} onPartSelect={onPartSelect} cameraTarget={cameraView} />
      </Canvas>

      <div className="canvas-scan-line" />
    </div>
  );
};

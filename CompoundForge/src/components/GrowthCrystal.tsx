import React, { useEffect, useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Tier } from '@/types';
import { colors } from '@/theme';

type BurstParticle = {
  points: THREE.Points;
  velocities: Float32Array;
  life: number;
  maxLife: number;
};

type SceneRefs = {
  renderer: Renderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  group: THREE.Group;
  mesh: THREE.Mesh;
  wire: THREE.LineSegments;
  glow: THREE.Sprite;
  glowMaterial: THREE.SpriteMaterial;
  ring: THREE.Points;
  ringMaterial: THREE.PointsMaterial;
  fillLight: THREE.PointLight;
  rimLight: THREE.PointLight;
  circleTexture: THREE.DataTexture;
  bursts: BurstParticle[];
  raf: number;
  drag: { yaw: number; pitch: number; vy: number; vp: number };
  autoYaw: number;
  pulse: number;
  clock: THREE.Clock;
  currentTierId: string;
};

export type GrowthCrystalHandle = {
  burst: (count?: number) => void;
  levelUpBurst: () => void;
};

type Props = {
  tier: Tier;
  burstToken: number;
  levelUpToken: number;
  scrollRef?: React.MutableRefObject<number>;
  size?: number;
};

function makeCircleTexture(size = 64): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const center = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center + 0.5;
      const dy = y - center + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy) / center;
      const alpha = Math.pow(Math.max(0, 1 - dist), 1.8);
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.floor(alpha * 255);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

function buildCrystalMaterial(color: string): THREE.MeshPhysicalMaterial {
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c,
    emissive: c.clone().multiplyScalar(0.32),
    metalness: 0.4,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transmission: 0.12,
    thickness: 0.6,
    reflectivity: 0.9,
    ior: 1.45,
  });
}

function ringGeometry(count: number, radius: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * 0.3;
    const y = (Math.random() - 0.5) * 0.5;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function GrowthCrystal({ tier, burstToken, levelUpToken, scrollRef, size = 260 }: Props) {
  const sceneRef = useRef<SceneRefs | null>(null);
  const prevBurstToken = useRef(burstToken);
  const prevLevelUpToken = useRef(levelUpToken);

  const spawnBurst = (color: string, count = 70, speed = 1.6) => {
    const s = sceneRef.current;
    if (!s) return;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const v = speed * (0.4 + Math.random() * 0.8);
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * v;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * v;
      velocities[i * 3 + 2] = Math.cos(phi) * v;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.1,
      map: s.circleTexture,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, material);
    s.group.add(points);
    s.bursts.push({ points, velocities, life: 0, maxLife: 1.1 });
  };

  useEffect(() => {
    if (burstToken !== prevBurstToken.current) {
      prevBurstToken.current = burstToken;
      spawnBurst(tier.color, 70);
    }
  }, [burstToken, tier.color]);

  useEffect(() => {
    if (levelUpToken !== prevLevelUpToken.current) {
      prevLevelUpToken.current = levelUpToken;
      spawnBurst(tier.color, 160, 2.2);
      if (sceneRef.current) sceneRef.current.pulse = 1;
    }
  }, [levelUpToken, tier.color]);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s || s.currentTierId === tier.id) return;
    s.currentTierId = tier.id;
    s.mesh.geometry.dispose();
    (s.mesh.material as THREE.Material).dispose();
    s.mesh.geometry = new THREE.IcosahedronGeometry(1.15, tier.detail);
    s.mesh.material = buildCrystalMaterial(tier.color);
    s.wire.geometry.dispose();
    s.wire.geometry = new THREE.EdgesGeometry(s.mesh.geometry);
    (s.wire.material as THREE.LineBasicMaterial).color = new THREE.Color(tier.secondary);
    s.glowMaterial.color = new THREE.Color(tier.color);
    s.ringMaterial.color = new THREE.Color(tier.secondary);
    s.fillLight.color = new THREE.Color(tier.secondary);
    s.rimLight.color = new THREE.Color(tier.color);
  }, [tier]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gesture) => {
        const s = sceneRef.current;
        if (!s) return;
        s.drag.vy = gesture.vx * 0.02;
        s.drag.vp = -gesture.vy * 0.02;
        s.drag.yaw += gesture.dx * 0.006;
        s.drag.pitch = Math.max(-0.5, Math.min(0.5, s.drag.pitch - gesture.dy * 0.004));
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View style={{ width: size, height: size }} {...pan.panHandlers}>
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={(gl: ExpoWebGLRenderingContext) => {
          const width = gl.drawingBufferWidth;
          const height = gl.drawingBufferHeight;

          const renderer = new Renderer({ gl });
          renderer.setSize(width, height);
          renderer.setClearColor(colors.bg, 1);

          const scene = new THREE.Scene();
          scene.fog = new THREE.FogExp2(0x0a0b10, 0.12);

          const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
          camera.position.set(0, 0, 3.3);

          const hemi = new THREE.HemisphereLight(0x8fa5ff, 0x140022, 0.65);
          scene.add(hemi);

          const key = new THREE.PointLight(0xffffff, 1.2, 20);
          key.position.set(2.2, 3, 3.5);
          scene.add(key);

          const fillLight = new THREE.PointLight(new THREE.Color(tier.secondary), 0.9, 20);
          fillLight.position.set(-3, -1, 2);
          scene.add(fillLight);

          const rimLight = new THREE.PointLight(new THREE.Color(tier.color), 1.1, 20);
          rimLight.position.set(0, -1.5, -3);
          scene.add(rimLight);

          const group = new THREE.Group();
          scene.add(group);

          const geometry = new THREE.IcosahedronGeometry(1.15, tier.detail);
          const material = buildCrystalMaterial(tier.color);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);

          const wireGeo = new THREE.EdgesGeometry(geometry);
          const wireMat = new THREE.LineBasicMaterial({ color: new THREE.Color(tier.secondary), transparent: true, opacity: 0.5 });
          const wire = new THREE.LineSegments(wireGeo, wireMat);
          group.add(wire);

          const circleTexture = makeCircleTexture(64);

          const glowMaterial = new THREE.SpriteMaterial({
            map: circleTexture,
            color: new THREE.Color(tier.color),
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const glow = new THREE.Sprite(glowMaterial);
          glow.scale.set(3.4, 3.4, 1);
          glow.position.z = -0.3;
          group.add(glow);

          const ringGeo = ringGeometry(48, 1.9);
          const ringMaterial = new THREE.PointsMaterial({
            color: new THREE.Color(tier.secondary),
            size: 0.05,
            map: circleTexture,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
          });
          const ring = new THREE.Points(ringGeo, ringMaterial);
          group.add(ring);

          const s: SceneRefs = {
            renderer,
            scene,
            camera,
            group,
            mesh,
            wire,
            glow,
            glowMaterial,
            ring,
            ringMaterial,
            fillLight,
            rimLight,
            circleTexture,
            bursts: [],
            raf: 0,
            drag: { yaw: 0, pitch: 0, vy: 0, vp: 0 },
            autoYaw: 0,
            pulse: 0,
            clock: new THREE.Clock(),
            currentTierId: tier.id,
          };
          sceneRef.current = s;

          const render = () => {
            const dt = Math.min(s.clock.getDelta(), 0.05);
            const t = s.clock.elapsedTime;

            s.autoYaw += dt * 0.28;
            s.drag.yaw += s.drag.vy;
            s.drag.pitch += s.drag.vp;
            s.drag.vy *= 0.92;
            s.drag.vp *= 0.92;
            s.drag.pitch = Math.max(-0.6, Math.min(0.6, s.drag.pitch));

            const scroll = scrollRef?.current ?? 0;

            s.group.rotation.y = s.autoYaw + s.drag.yaw;
            s.group.rotation.x = s.drag.pitch * 0.7 + scroll * 0.5;
            s.group.position.y = Math.sin(t * 0.6) * 0.06 - scroll * 0.25;

            s.pulse *= 0.9;
            const pulseScale = 1 + s.pulse * 0.22;
            s.mesh.scale.setScalar(pulseScale);
            s.wire.scale.setScalar(pulseScale);

            s.ring.rotation.y -= dt * 0.15;
            s.glow.material.opacity = 0.45 + Math.sin(t * 1.4) * 0.1 + s.pulse * 0.3;

            s.camera.position.z = 3.3 - scroll * 0.7;
            s.camera.position.y = scroll * 0.35;
            s.camera.lookAt(0, 0, 0);

            for (let i = s.bursts.length - 1; i >= 0; i--) {
              const b = s.bursts[i];
              b.life += dt;
              const posAttr = b.points.geometry.getAttribute('position') as THREE.BufferAttribute;
              for (let p = 0; p < posAttr.count; p++) {
                const vx = b.velocities[p * 3] * dt;
                const vy = b.velocities[p * 3 + 1] * dt;
                const vz = b.velocities[p * 3 + 2] * dt;
                posAttr.setXYZ(p, posAttr.getX(p) + vx, posAttr.getY(p) + vy, posAttr.getZ(p) + vz);
              }
              posAttr.needsUpdate = true;
              for (let vi = 0; vi < b.velocities.length; vi++) b.velocities[vi] *= 0.94;
              (b.points.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - b.life / b.maxLife);
              if (b.life >= b.maxLife) {
                s.group.remove(b.points);
                b.points.geometry.dispose();
                (b.points.material as THREE.PointsMaterial).dispose();
                s.bursts.splice(i, 1);
              }
            }

            renderer.render(scene, camera);
            gl.endFrameEXP();
            s.raf = requestAnimationFrame(render);
          };
          render();
        }}
      />
    </View>
  );
}

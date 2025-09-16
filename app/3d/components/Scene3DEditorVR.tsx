"use client"

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Grid, Environment, Html } from '@react-three/drei'
import { use3DStore } from '../store/use3DStore'
import { InstancedMesh, Object3D, Color, Vector3, Euler, MathUtils } from 'three'
import { useRef, useEffect, useMemo, useState } from 'react'

interface InstancedElementsProps {
  elements: any[];
  geometryType: string;
  colorKey?: string;
  geometryArgs?: number[];
}

function InstancedElements({ elements, geometryType, colorKey = "color", geometryArgs = [] }: InstancedElementsProps) {
  const meshRef = useRef<InstancedMesh>(null)
  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new Object3D()
    elements.forEach((el: any, i: number) => {
      dummy.position.set(el.position.x, el.position.y || 0, el.position.z)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.count = elements.length
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [elements])

  let geometry = null
  if (geometryType === "sphere") geometry = <sphereGeometry args={geometryArgs as [number, number, number]} />
  if (geometryType === "box") geometry = <boxGeometry args={geometryArgs as [number, number, number]} />
  if (geometryType === "line") geometry = <boxGeometry args={geometryArgs as [number, number, number]} />

  // Her element için ayrı mesh oluştur (renk için)
  return (
    <>
      {elements.map((el: any, index: number) => (
        <mesh
          key={`${el.id}-${index}`}
          position={[el.position.x, el.position.y || 0, el.position.z]}
        >
          {geometry}
          <meshBasicMaterial color={el[colorKey] || "#fff"} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  )
}

// Geliştirilmiş FPS Controls ile Air Strafe ve Bunny Hop
function FPSControls({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const [isLocked, setIsLocked] = useState(false);
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));

  // Ayarlar
  const mouseSensitivity = 0.002;
  const walkSpeed = 5;
  const runSpeed = 8;
  const jumpForce = 11;
  const gravity = -25;
  const groundHeight = 0.8;

  const maxGroundSpeed = 10;
  const maxAirSpeed = 50;
  const airAcceleration = 30;
  const groundFriction = 6;
  const airFriction = 0.05;
  const strafeMultiplier = 1.4;
  const airStrafeBonus = 2.5;

  const bobFrequency = 10;
  const bobAmplitude = 0.08;

  const velocity = useRef(new Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const bobTime = useRef(0);

  // Mouse rotasyonu
  const yaw = useRef(0);
  const pitch = useRef(0);
  const lastMouseYaw = useRef(0);

  // FOV
  const originalFOV = useRef(60);

  // Pointer lock fonksiyonları
  const requestPointerLock = () => {
    if (!enabled) return;
    const canvas = gl.domElement;
    canvas.requestPointerLock?.() ||
      (canvas as any).mozRequestPointerLock?.() ||
      (canvas as any).webkitRequestPointerLock?.();
  };

  const exitPointerLock = () => {
    document.exitPointerLock?.();
    (document as any).mozExitPointerLock?.();
    (document as any).webkitExitPointerLock?.();
  };

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Escape') exitPointerLock();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;

      const movementX = e.movementX || (e as any).mozMovementX || (e as any).webkitMovementX || 0;
      const movementY = e.movementY || (e as any).mozMovementY || (e as any).webkitMovementY || 0;

      yaw.current -= movementX * mouseSensitivity;
      pitch.current -= movementY * mouseSensitivity;
      pitch.current = MathUtils.clamp(pitch.current, -Math.PI / 2, Math.PI / 2);

      euler.current.set(pitch.current, yaw.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler.current);
    };

    const handleClick = () => {
      if (!isLocked && enabled) requestPointerLock();
    };

    const handlePointerLockChange = () => {
      const locked =
        document.pointerLockElement === gl.domElement ||
        (document as any).mozPointerLockElement === gl.domElement ||
        (document as any).webkitPointerLockElement === gl.domElement;
      setIsLocked(locked);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mozpointerlockchange', handlePointerLockChange);
    document.addEventListener('webkitpointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mozpointerlockchange', handlePointerLockChange);
      document.removeEventListener('webkitpointerlockchange', handlePointerLockChange);
    };
  }, [enabled, isLocked, camera, gl.domElement]);

  useFrame((_, delta) => {
    if (!enabled || !isLocked) return;

    // Input
    const moveForward = keys.current['KeyW'] ? 1 : 0;
    const moveBackward = keys.current['KeyS'] ? 1 : 0;
    const moveLeft = keys.current['KeyA'] ? 1 : 0;
    const moveRight = keys.current['KeyD'] ? 1 : 0;
    const jump = keys.current['Space'];
    const isRunning = keys.current['ShiftLeft'] || keys.current['ShiftRight'];

    // Doğru yön: ileri pozitif, geri negatif
    const inputDir = new Vector3(moveRight - moveLeft, 0, moveForward - moveBackward);
    const hasInput = inputDir.lengthSq() > 0;
    if (hasInput) inputDir.normalize();

    // Kamera yönleri
    const forward = new Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new Vector3();
    right.crossVectors(forward, camera.up).normalize();

    // Dünya koordinatlarında hareket yönü
    const wishDir = new Vector3();
    wishDir.addScaledVector(right, inputDir.x);
    wishDir.addScaledVector(forward, inputDir.z);

    // Mevcut yatay hız
    const currentVel = new Vector3(velocity.current.x, 0, velocity.current.z);
    const currentSpeed = currentVel.length();

    if (isGrounded.current) {
      // Zemin hareketi
      if (jump) {
        velocity.current.y = jumpForce;
        isGrounded.current = false;

        // Bunny hop: momentum koru ve artır
        if (currentSpeed > walkSpeed) {
          const preSpeedBonus = Math.min(1.1, maxGroundSpeed / currentSpeed);
          velocity.current.x *= preSpeedBonus;
          velocity.current.z *= preSpeedBonus;
        }
      } else {
        if (hasInput) {
          const targetSpeed = isRunning ? runSpeed : walkSpeed;
          const isStrafing = (moveLeft || moveRight) && (moveForward || moveBackward);
          const finalSpeed = isStrafing ? targetSpeed * strafeMultiplier : targetSpeed;
          velocity.current.x = wishDir.x * finalSpeed;
          velocity.current.z = wishDir.z * finalSpeed;
        } else {
          // Zemin sürtünmesi
          const friction = Math.max(0, 1 - groundFriction * delta);
          velocity.current.x *= friction;
          velocity.current.z *= friction;
        }
      }
    } else {
      // Air strafe
      if (hasInput) {
        // Mouse yönü ve delta
        const mouseYaw = yaw.current;
        const mouseYawDelta = mouseYaw - lastMouseYaw.current;
        lastMouseYaw.current = mouseYaw;

        // Strafe yönü ve mouse hareketi senkronizasyonu
        const isTurningRight = mouseYawDelta < -0.001;
        const isTurningLeft = mouseYawDelta > 0.001;
        const isStrafingRight = moveRight > 0;
        const isStrafingLeft = moveLeft > 0;

        // Perfect sync bonusu
        let syncBonus = 1.0;
        if ((isTurningRight && isStrafingRight) || (isTurningLeft && isStrafingLeft)) {
          syncBonus = airStrafeBonus;
        }

        // Sadece yan hareket (A/D) için ekstra bonus
        const pureStrafe = Math.abs(inputDir.x) > Math.abs(inputDir.z);
        if (pureStrafe) {
          syncBonus *= 1.5;
        }

        // Air acceleration
        const wishSpeed = maxAirSpeed * syncBonus;
        const currentWishSpeed = currentVel.dot(wishDir);
        const addSpeed = wishSpeed - currentWishSpeed;

        if (addSpeed > 0) {
          let accelerationSpeed = airAcceleration * syncBonus * delta;
          // Mouse hareketi bonusu
          const mouseTurnSpeed = Math.abs(mouseYawDelta) * 1000;
          accelerationSpeed *= (1 + Math.min(mouseTurnSpeed, 3));
          accelerationSpeed = Math.min(addSpeed, accelerationSpeed);

          velocity.current.x += wishDir.x * accelerationSpeed;
          velocity.current.z += wishDir.z * accelerationSpeed;
        }

        // Hız limiti
        const newSpeed = new Vector3(velocity.current.x, 0, velocity.current.z).length();
        if (newSpeed > maxAirSpeed * 3) {
          const limitedVel = new Vector3(velocity.current.x, 0, velocity.current.z);
          limitedVel.normalize().multiplyScalar(maxAirSpeed * 3);
          velocity.current.x = limitedVel.x;
          velocity.current.z = limitedVel.z;
        }
      } else {
        // Hava sürtünmesi
        const airFric = Math.max(0, 1 - airFriction * delta);
        velocity.current.x *= airFric;
        velocity.current.z *= airFric;
      }

      // Yerçekimi
      velocity.current.y += gravity * delta;
    }

    // Pozisyon güncelleme
    camera.position.x += velocity.current.x * delta;
    camera.position.y += velocity.current.y * delta;
    camera.position.z += velocity.current.z * delta;

    // Zemin kontrolü
    if (camera.position.y <= groundHeight) {
      camera.position.y = groundHeight;
      isGrounded.current = true;
      velocity.current.y = 0;
    }

    // FOV efekti
    const speed = new Vector3(velocity.current.x, 0, velocity.current.z).length();
    if ('fov' in camera) {
      const speedFactor = Math.min(speed / maxGroundSpeed, 2);
      const targetFOV = originalFOV.current + speedFactor * 20;
      camera.fov = MathUtils.lerp(camera.fov, targetFOV, delta * 8);
      camera.updateProjectionMatrix();
    }

    // Head bobbing
    const isMoving = speed > 0.1;
    if (isGrounded.current && isMoving) {
      bobTime.current += delta * bobFrequency * Math.min(speed / walkSpeed, 2);
      const bobOffset = Math.sin(bobTime.current) * bobAmplitude * Math.min(speed / walkSpeed, 1);
      camera.position.y = groundHeight + bobOffset;
    } else {
      bobTime.current = 0;
      if (isGrounded.current) {
        camera.position.y = MathUtils.lerp(camera.position.y, groundHeight, delta * 10);
      }
    }
  });

  return null;
}

// Crosshair
function Crosshair() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
        pointerEvents: 'none',
        color: 'rgb(0, 0, 0)',
        fontSize: '20px',
        fontWeight: 'bold',
        textShadow: '0 0 4px rgba(0,0,0,0.8)'
      }}
    >
      +
    </div>
  );
}

// Merkez yön göstergesi (Canvas içinde)
function CenterIndicator() {
  const { camera } = useThree();
  const [indicatorRotation, setIndicatorRotation] = useState(0);

  useFrame(() => {
    // Merkeze doğru yönü hesapla
    const angleToCenter = Math.atan2(-camera.position.x, -camera.position.z);
    setIndicatorRotation(angleToCenter * (180 / Math.PI));
  });

  return (
    <Html position={[0, 0, 0]} center>
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: `translateX(-50%) rotate(${indicatorRotation}deg)`,
          zIndex: 5,
          pointerEvents: 'none',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 0 8px rgba(0,0,0,0.9)',
          transition: 'transform 0.1s ease-out'
        }}
      >
        ↑
      </div>
    </Html>
  );
}

// Controls info
function ControlsInfo({ show }: { show: boolean }) {
  if (!show) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 5,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'monospace',
        lineHeight: '1.4',
        maxWidth: '300px'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>3D Editor Controls</div>
      <div> WASD - Movement</div>
      <div> Shift+WASD - Run</div>
      <div> Space - Jump</div>
      <div> Mouse - Look around</div>
      <div> ESC - Exit</div>
    </div>
  );
}

export function Scene3DEditorVR() {
  const vertices = use3DStore(state => state.vertices)
  const shapes = use3DStore(state => state.shapes)

  const [showOverlay, setShowOverlay] = useState(true);
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handleOverlayClick = () => {
    setShowOverlay(false);
    setTimeout(() => {
      setControlsEnabled(true);
    }, 100);
    setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  const allElements = useMemo(() => {
    const vertexElements = Array.from(vertices.values()).map(vertex => ({
      id: vertex.id,
      type: "free",
      position: vertex.position,
      color: vertex.color || "#fff"
    }))

    const shapeElements = shapes.map(shape => ({
      id: shape.id,
      type: shape.type === "cube" ? "square" : shape.type,
      position: shape.position,
      color: shape.color || "#fff"
    }))

    return [...vertexElements, ...shapeElements]
  }, [vertices, shapes])

  const freeElements = useMemo(() => allElements.filter(e => e.type === "free"), [allElements])
  const circleElements = useMemo(() => allElements.filter(e => e.type === "circle"), [allElements])
  const squareElements = useMemo(() => allElements.filter(e => e.type === "square"), [allElements])
  const lineElements = useMemo(() => allElements.filter(e => e.type === "line"), [allElements])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {showOverlay && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '20px'
          }}
          onClick={handleOverlayClick}
        >
          <div style={{ fontSize: '28px', marginBottom: '20px' }}>3D Scene Editor</div>
          <div style={{ marginBottom: '15px' }}>Click to start navigating!</div>
          <div style={{ fontSize: '14px', opacity: '0.8', lineHeight: '1.5' }}>
            WASD to move • Space to jump • Mouse to look around
            <br />
            ESC to exit navigation
          </div>
        </div>
      )}
      
      <Crosshair />
      <ControlsInfo show={showControls && controlsEnabled} />
      
      <Canvas
        camera={{ position: [0, 2, 5], fov: 60 }}
        style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', minHeight: 400 }}
      >
        <Environment files="/t.hdr" background />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, 5, -5]} intensity={0.3} color="#4080ff" />
        
        <Grid 
          args={[1000, 1000]} 
          cellSize={1} 
          cellThickness={0.6} 
          cellColor="#333" 
          sectionSize={10} 
          sectionThickness={1.2} 
          sectionColor="#555" 
          position={[0, -0.5, 0]} 
        />
        
        {freeElements.length > 0 && (
          <InstancedElements elements={freeElements} geometryType="sphere" geometryArgs={[0.07, 8, 8]} />
        )}
        {circleElements.length > 0 && (
          <InstancedElements elements={circleElements} geometryType="sphere" geometryArgs={[0.12, 12, 12]} />
        )}
        {squareElements.length > 0 && (
          <InstancedElements elements={squareElements} geometryType="box" geometryArgs={[0.25, 0.25, 0.25]} />
        )}
        {lineElements.length > 0 && (
          <InstancedElements elements={lineElements} geometryType="line" geometryArgs={[0.6, 0.06, 0.06]} />
        )}
        
        {allElements.filter(e => !["free", "circle", "square", "line"].includes(e.type)).map(el => (
          <mesh
            key={el.id}
            position={[el.position.x, el.position.y || 0, el.position.z]}
          >
            <boxGeometry args={[0.2, 0.2, 0.01]} />
            <meshBasicMaterial color={el.color || "#fff"} transparent opacity={0.85} />
          </mesh>
        ))}
        
        <FPSControls enabled={controlsEnabled} />
        <CenterIndicator />
      </Canvas>
    </div>
  );
}
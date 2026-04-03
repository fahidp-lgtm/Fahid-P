import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from '../hooks/useControls';
import { useStore } from '../store';
import { portfolioData } from '../portfolioData';
import * as THREE from 'three';

// Persist kinemantics outside render loop (super fast memory state)
let speed = 0;
let angle = 0;

export default function Car() {
  const controls = useControls();
  const carRef = useRef();
  const openModal = useStore(state => state.openModal);

  useFrame((state, delta) => {
    // Ensure delta is sane (prevents massive jumps if tab was inactive)
    const dt = Math.min(delta, 0.1);
    
    // Freeze updates when a modal is active
    if (useStore.getState().activeModal) return; 

    // Performance-based Car Kinematics (No Heavy Physics Engine!)
    const maxSpeed = controls.boost ? 35 : 18;
    const acceleration = 25;
    const friction = 12;
    const brakeForce = 40;
    
    // Engine Control
    if (controls.forward) speed += acceleration * dt;
    else if (controls.backward) speed -= acceleration * dt;
    else {
        // Apply friction natively
        if (speed > 0) {
            speed -= friction * dt;
            if (speed < 0) speed = 0;
        }
        else if (speed < 0) {
            speed += friction * dt;
            if (speed > 0) speed = 0;
        }
    }

    // Spacebar Brake Control
    if (controls.jump) {
        if (speed > 0) speed -= brakeForce * dt;
        if (speed < 0) speed += brakeForce * dt;
        if (Math.abs(speed) < 1) speed = 0;
    }

    // Clamp speed bounds
    if (speed > maxSpeed) speed = maxSpeed;
    if (speed < -maxSpeed/2) speed = -maxSpeed/2;

    // Steering
    // The faster we go, the slower we steer, giving a realistic car feel
    if (Math.abs(speed) > 0.1) {
        // Base turn speed, slightly inverted so driving backwards reverses turn logic perfectly
        let turnSpeed = 2.5 * dt * (speed > 0 ? 1 : -1); 
        if (controls.left) angle += turnSpeed;
        if (controls.right) angle -= turnSpeed;
    }

    // Apply Transformations natively without rigidbodies
    carRef.current.rotation.y = angle;
    const velocityX = Math.sin(angle) * speed;
    const velocityZ = Math.cos(angle) * speed;

    carRef.current.position.x += velocityX * dt;
    carRef.current.position.z += velocityZ * dt;

    // Manual Boundary Clamp (Don't let them drive off the 1000x1000 plane)
    if (carRef.current.position.x > 490) carRef.current.position.x = 490;
    if (carRef.current.position.x < -490) carRef.current.position.x = -490;
    if (carRef.current.position.z > 490) carRef.current.position.z = 490;
    if (carRef.current.position.z < -490) carRef.current.position.z = -490;

    // Reset Function
    if (controls.reset) {
        carRef.current.position.set(0, 0.5, 0);
        speed = 0;
        angle = 0;
    }

    // Native Distance Collision Check (Math instead of Physics Engine bounds!)
    const cx = carRef.current.position.x;
    const cz = carRef.current.position.z;

    portfolioData.forEach(item => {
        const dx = cx - item.position[0];
        const dz = cz - item.position[2];
        const distance = Math.sqrt(dx*dx + dz*dz);
        if (distance < item.zoneRadius) {
            // Collision triggered! Halt the car instantly
            speed = 0; 
            // Bounce backwards slightly to prevent getting stuck infinitely in trigger loop
            carRef.current.position.x -= Math.sin(angle) * 1.5; 
            carRef.current.position.z -= Math.cos(angle) * 1.5;
            
            // Pop the HTML UI logic through Zustand cleanly
            openModal(item);
        }
    });

    // Third Person Camera Setup
    const position = carRef.current.position;
    // Follow distance dynamically stretches based on relative speed
    const chaseFactor = 12 + (Math.abs(speed) * 0.2); 
    
    const cameraOffset = new THREE.Vector3(
        position.x - Math.sin(angle) * chaseFactor,
        position.y + 6,
        position.z - Math.cos(angle) * chaseFactor
    );
    // Smooth Lerp Camera transition mapped to Framerate
    state.camera.position.lerp(cameraOffset, 0.1);
    state.camera.lookAt(position.x + Math.sin(angle)*5, position.y + 2, position.z + Math.cos(angle)*5);

  }); // end useFrame

  // Return programmatic hierarchy explicitly allowing dynamic .gltf replacement later
  return (
    <group ref={carRef} position={[0, 0.5, 0]}>
      <mesh castShadow receiveShadow>
        {/* Chassis */}
        <boxGeometry args={[1.8, 1, 3.8]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.6}/>
        
        {/* Windshield Voxel Component */}
        <mesh position={[0, 0.8, -0.4]} castShadow>
             <boxGeometry args={[1.5, 0.6, 2]} />
             <meshStandardMaterial color="#0f172a" />
        </mesh>
        
        {/* Headlights */}
        <mesh position={[-0.7, 0.2, 1.95]}>
             <boxGeometry args={[0.4, 0.2, 0.1]} />
             <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[0.7, 0.2, 1.95]}>
             <boxGeometry args={[0.4, 0.2, 0.1]} />
             <meshBasicMaterial color="#fef08a" />
        </mesh>
      </mesh>
    </group>
  );
}

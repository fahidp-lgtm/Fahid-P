import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import Car from './Car';
import World from './World';

export default function GameCanvas() {
  return (
    <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
      {/* Soft Fog to blend edges */}
      <fog attach="fog" args={['#0f172a', 30, 200]} />
      <color attach="background" args={['#0f172a']} />
      
      <Sky sunPosition={[100, 20, 100]} turbidity={0.1} />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[100, 100, 100]} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        intensity={1.5} 
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      <World />
      <Car />
    </Canvas>
  );
}

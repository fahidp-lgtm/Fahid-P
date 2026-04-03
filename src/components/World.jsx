import { portfolioData } from '../portfolioData';
import * as THREE from 'three';

function InteractiveMarker({ data }) {
  return (
    <group position={data.position}>
        <mesh castShadow receiveShadow>
            <boxGeometry args={data.scale} />
            <meshStandardMaterial color={data.color} roughness={0.7} />
        </mesh>
        
        {/* Interaction Halo below the structure */}
        <mesh position={[0, -data.scale[1]/2 + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[Math.max(data.scale[0], data.scale[2]) + 1, 0.4, 16, 64]} />
            <meshBasicMaterial color="#10b981" />
        </mesh>
    </group>
  );
}

export default function World() {
  return (
    <>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Grid overlay */}
      <gridHelper args={[1000, 100, '#334155', '#0f172a']} position={[0, 0.1, 0]} />

      {/* Interactive elements */}
      {portfolioData.map((data, i) => (
         <InteractiveMarker key={i} data={data} />
      ))}
    </>
  );
}

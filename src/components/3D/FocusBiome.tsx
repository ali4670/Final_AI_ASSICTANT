import React, { Suspense } from 'react';
import { Float, ContactShadows, Environment, PerspectiveCamera, Stage } from '@react-three/drei';
import { 
    Tree, House, Barn, Windmill, Sheep, 
    RobotFarmer, Fountain, Monolith, Bush, Fence 
} from './GardenItems';

interface FocusBiomeProps {
    type: string;
    growth: number;
}

const FocusBiome: React.FC<FocusBiomeProps> = ({ type, growth }) => {
    const renderItem = () => {
        const props = { position: [0, 0, 0] as [number, number, number], scale: 1 };
        switch (type) {
            case 'tree': return <Tree {...props} />;
            case 'house': return <House {...props} />;
            case 'barn': return <Barn {...props} />;
            case 'windmill': return <Windmill {...props} />;
            case 'sheep': return <Sheep {...props} />;
            case 'robot': return <RobotFarmer {...props} />;
            case 'fountain': return <Fountain {...props} />;
            case 'monolith': return <Monolith {...props} />;
            case 'bush': return <Bush {...props} />;
            case 'fence': return <Fence {...props} />;
            default: return <Tree {...props} />;
        }
    };

    return (
        <group>
            <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={40} />
            <Environment preset="city" />
            
            <Suspense fallback={null}>
                <Stage intensity={0.5} environment="city" adjustCamera={true} shadows={false}>
                    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
                        {renderItem()}
                    </Float>
                </Stage>
            </Suspense>

            <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} />
        </group>
    );
};

export default FocusBiome;

import { useMemo } from "react";
import Leaf from "./Leaf";
import { Task } from "./types";

interface LeafClusterProps {
  tasks: Task[];
}

const LeafCluster = ({ tasks }: LeafClusterProps) => {
  const leafPositions = useMemo(() => {
    return tasks.map((task, index) => {
      // Strategic placement based on importance
      const importance = task.strategicImportance;
      
      // Y position: Higher importance = higher on tree
      // Level 1-4: Base (y: 0-1.5)
      // Level 5-7: Middle (y: 1.5-3.5)
      // Level 8-10: Top (y: 3.5-5.5)
      let baseY: number;
      if (importance <= 4) {
        baseY = (importance - 1) * 0.4;
      } else if (importance <= 7) {
        baseY = 1.5 + (importance - 5) * 0.6;
      } else {
        baseY = 3.5 + (importance - 8) * 0.6;
      }
      
      // Add some randomness
      const y = baseY + Math.random() * 0.5;
      
      // Radial position around the trunk
      const angle = (index / tasks.length) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 0.8 + Math.random() * 1.2 + (importance / 10) * 0.5;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      return { task, position: [x, y, z] as [number, number, number] };
    });
  }, [tasks]);

  return (
    <group>
      {leafPositions.map(({ task, position }) => (
        <Leaf key={task.id} task={task} position={position} />
      ))}
    </group>
  );
};

export default LeafCluster;

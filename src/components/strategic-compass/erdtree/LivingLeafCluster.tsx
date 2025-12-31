import { useMemo } from "react";
import LivingLeaf from "./LivingLeaf";
import { Task } from "./types";

interface LivingLeafClusterProps {
  tasks: Task[];
  newTaskIds?: string[];
}

const LivingLeafCluster = ({ tasks, newTaskIds = [] }: LivingLeafClusterProps) => {
  const leafPositions = useMemo(() => {
    return tasks.map((task, index) => {
      // Strategic placement based on importance
      const importance = task.strategicImportance;
      
      // Y position: Higher importance = higher on tree (closer to branches)
      // Level 1-4: Lower branches (y: 1-2)
      // Level 5-7: Middle branches (y: 2-3.5)
      // Level 8-10: Top branches (y: 3.5-5)
      let baseY: number;
      if (importance <= 4) {
        baseY = 1 + (importance - 1) * 0.25;
      } else if (importance <= 7) {
        baseY = 2 + (importance - 5) * 0.5;
      } else {
        baseY = 3.5 + (importance - 8) * 0.5;
      }
      
      // Add some randomness but keep bounded
      const y = baseY + (Math.random() - 0.5) * 0.4;
      
      // Radial position - closer to branches (smaller radius)
      const angle = (index / tasks.length) * Math.PI * 2 + Math.random() * 0.4;
      
      // Smaller radius to be closer to the tree branches
      const baseRadius = 0.6 + (importance / 10) * 0.3;
      const radius = baseRadius + Math.random() * 0.5;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      return { 
        task, 
        position: [x, y, z] as [number, number, number],
        isNew: newTaskIds.includes(task.id)
      };
    });
  }, [tasks, newTaskIds]);

  return (
    <group>
      {/* Floating leaves near branches */}
      {leafPositions.map(({ task, position, isNew }) => (
        <LivingLeaf key={task.id} task={task} position={position} isNew={isNew} />
      ))}
    </group>
  );
};

export default LivingLeafCluster;

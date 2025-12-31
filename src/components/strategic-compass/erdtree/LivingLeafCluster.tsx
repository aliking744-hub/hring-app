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
      
      // Y position: Higher importance = higher on tree (but keep within bounds)
      // Level 1-4: Base (y: 0.5-1.5)
      // Level 5-7: Middle (y: 1.5-3)
      // Level 8-10: Top (y: 3-4.5)
      let baseY: number;
      if (importance <= 4) {
        baseY = 0.5 + (importance - 1) * 0.25;
      } else if (importance <= 7) {
        baseY = 1.5 + (importance - 5) * 0.5;
      } else {
        baseY = 3 + (importance - 8) * 0.5;
      }
      
      // Add some randomness but keep bounded
      const y = baseY + Math.random() * 0.3;
      
      // Radial position around the trunk - floating freely
      const angle = (index / tasks.length) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 1.0 + Math.random() * 1.5 + (importance / 10) * 0.5;
      
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
      {/* Floating leaves without tendrils */}
      {leafPositions.map(({ task, position, isNew }) => (
        <LivingLeaf key={task.id} task={task} position={position} isNew={isNew} />
      ))}
    </group>
  );
};

export default LivingLeafCluster;

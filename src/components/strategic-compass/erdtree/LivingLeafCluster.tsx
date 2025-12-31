import { useMemo } from "react";
import LivingLeaf from "./LivingLeaf";
import { Task } from "./types";

interface LivingLeafClusterProps {
  tasks: Task[];
  newTaskIds?: string[];
}

const LivingLeafCluster = ({ tasks, newTaskIds = [] }: LivingLeafClusterProps) => {
  const leafPositions = useMemo(() => {
    const now = new Date();
    
    return tasks.map((task, index) => {
      // Check if task is expired (completed more than 30 days ago = fallen to ground)
      const daysSinceCompletion = Math.floor((now.getTime() - task.completedAt.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysSinceCompletion > 30;
      
      const importance = task.strategicImportance;
      
      let y: number;
      
      if (isExpired) {
        // Expired tasks fall to the ground
        y = -0.3 + Math.random() * 0.2;
      } else {
        // Active tasks: Y position based on strategic importance
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
        y = baseY + Math.random() * 0.3;
      }
      
      // Radial position - expired tasks scatter further on ground
      const angle = (index / tasks.length) * Math.PI * 2 + Math.random() * 0.5;
      const radius = isExpired 
        ? 2.5 + Math.random() * 2.0 // Scattered on ground
        : 1.0 + Math.random() * 1.5 + (importance / 10) * 0.5;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      return { 
        task, 
        position: [x, y, z] as [number, number, number],
        isNew: newTaskIds.includes(task.id),
        isExpired
      };
    });
  }, [tasks, newTaskIds]);

  return (
    <group>
      {/* Floating leaves without tendrils */}
      {leafPositions.map(({ task, position, isNew, isExpired }) => (
        <LivingLeaf key={task.id} task={task} position={position} isNew={isNew} isExpired={isExpired} />
      ))}
    </group>
  );
};

export default LivingLeafCluster;

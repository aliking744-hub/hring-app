import { useMemo } from "react";
import LivingLeaf from "./LivingLeaf";
import Tendrils from "./Tendrils";
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
      
      // Y position: Higher importance = higher on tree
      // Level 1-4: Base (y: 1.5-2.5)
      // Level 5-7: Middle (y: 2.5-4.5)
      // Level 8-10: Top (y: 4.5-6)
      let baseY: number;
      if (importance <= 4) {
        baseY = 1.5 + (importance - 1) * 0.3;
      } else if (importance <= 7) {
        baseY = 2.5 + (importance - 5) * 0.6;
      } else {
        baseY = 4.5 + (importance - 8) * 0.5;
      }
      
      // Add some randomness
      const y = baseY + Math.random() * 0.4;
      
      // Radial position around the trunk - further out
      const angle = (index / tasks.length) * Math.PI * 2 + Math.random() * 0.4;
      const radius = 1.5 + Math.random() * 1.0 + (importance / 10) * 0.8;
      
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
      {/* Tendrils connecting leaves to branches */}
      <Tendrils tasks={tasks} leafPositions={leafPositions} />
      
      {/* Leaves */}
      {leafPositions.map(({ task, position, isNew }) => (
        <LivingLeaf key={task.id} task={task} position={position} isNew={isNew} />
      ))}
    </group>
  );
};

export default LivingLeafCluster;

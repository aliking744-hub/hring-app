import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, SAMPLE_TASKS } from "@/components/strategic-compass/erdtree/types";

export const useStrategicAchievements = () => {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [newTaskIds, setNewTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch achievements from database
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("strategic_achievements")
        .select("*")
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching achievements:", error);
        // Fall back to sample data if there's an error
        return;
      }

      if (data && data.length > 0) {
        const mappedTasks: Task[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          ownerName: item.owner_name,
          departmentId: item.department_id,
          departmentName: item.department_name,
          strategicImportance: item.strategic_importance,
          completedAt: new Date(item.completed_at),
        }));
        setTasks(mappedTasks);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchAchievements();

    const channel = supabase
      .channel("strategic-achievements-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "strategic_achievements",
        },
        (payload) => {
          console.log("New achievement:", payload);
          const newItem = payload.new as {
            id: string;
            name: string;
            owner_name: string;
            department_id: string;
            department_name: string;
            strategic_importance: number;
            completed_at: string;
          };

          const newTask: Task = {
            id: newItem.id,
            name: newItem.name,
            ownerName: newItem.owner_name,
            departmentId: newItem.department_id,
            departmentName: newItem.department_name,
            strategicImportance: newItem.strategic_importance,
            completedAt: new Date(newItem.completed_at),
          };

          // Mark as new for animation
          setNewTaskIds((prev) => [...prev, newTask.id]);
          setTasks((prev) => [newTask, ...prev]);

          // Remove from new list after animation completes
          setTimeout(() => {
            setNewTaskIds((prev) => prev.filter((id) => id !== newTask.id));
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tasks, newTaskIds, loading, error, refetch: fetchAchievements };
};

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_TASKS } from '../utils/mockData';
import { supabase, TASKS_TABLE } from '../config/supabase';

const STORAGE_KEY = '@task_manager_tasks';
const VERSION_KEY = '@task_manager_version';
const CURRENT_VERSION = '2'; // Increment this when mock data structure changes

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  initializeTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { data: supabaseTasks, error: supabaseError } = await supabase
        .from(TASKS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (!supabaseError && supabaseTasks && supabaseTasks.length > 0) {
        const tasksWithDates = supabaseTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          completed: task.completed,
          time: task.time,
          date: new Date(task.date),
          reminderEnabled: task.reminder_enabled,
          notificationId: task.notification_id,
          createdAt: new Date(task.created_at),
        }));
        set({ tasks: tasksWithDates, loading: false });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksWithDates));
        return;
      }

      const storedVersion = await AsyncStorage.getItem(VERSION_KEY);
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedVersion !== CURRENT_VERSION || !storedTasks) {
        set({ tasks: MOCK_TASKS, loading: false });
        await AsyncStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        await get().saveTasks();
      } else {
        const parsed = JSON.parse(storedTasks);
        const tasksWithDates = parsed.map(task => ({
          ...task,
          date: new Date(task.date),
          createdAt: new Date(task.createdAt),
        }));
        set({ tasks: tasksWithDates, loading: false });
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      set({ error: error.message, loading: false, tasks: MOCK_TASKS });
    }
  },

  saveTasks: async () => {
    try {
      const { tasks } = get();

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

      const supabaseTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
        time: task.time,
        date: task.date.toISOString(),
        reminder_enabled: task.reminderEnabled,
        notification_id: task.notificationId,
        created_at: task.createdAt.toISOString(),
      }));

      const { error } = await supabase
        .from(TASKS_TABLE)
        .upsert(supabaseTasks, { onConflict: 'id' });

      if (error) {
        console.error('Supabase sync error:', error);
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
      set({ error: error.message });
    }
  },

  addTask: async (task) => {
    set({ loading: true, error: null });
    try {
      const newTask = {
        ...task,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date(),
        date: task.date || new Date(),
      };

      const { tasks } = get();
      const updatedTasks = [newTask, ...tasks];
      set({ tasks: updatedTasks, loading: false });
      await get().saveTasks();

      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  toggleTask: async (taskId) => {
    try {
      const { tasks } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      set({ tasks: updatedTasks });
      await get().saveTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
      set({ error: error.message });
    }
  },

  updateTask: async (taskId, updates) => {
    set({ loading: true, error: null });
    try {
      const { tasks } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      set({ tasks: updatedTasks, loading: false });
      await get().saveTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const { tasks } = get();
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      set({ tasks: updatedTasks });

      const { error } = await supabase
        .from(TASKS_TABLE)
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Supabase delete error:', error);
      }

      await get().saveTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: error.message });
    }
  },

  getTasksByPriority: (priority) => {
    const { tasks } = get();
    return tasks.filter(task => task.priority === priority);
  },

  getTasksByDate: (date) => {
    const { tasks } = get();
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  },

  getCompletedTasksCount: () => {
    const { tasks } = get();
    return tasks.filter(task => task.completed).length;
  },

  getProductivity: () => {
    const { tasks } = get();
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  },

  searchTasks: (query) => {
    const { tasks } = get();
    const lowerQuery = query.toLowerCase();
    return tasks.filter(
      task =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery)
    );
  },
}));

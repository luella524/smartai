import { useState, useEffect } from 'react';
import { Task, TimeBlock } from '../types';
import { format } from 'date-fns';

export const useTasks = (selectedDate: Date) => {
  // Sample tasks for this week
  const getSampleTasks = (): Task[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    return [
      {
        id: '1',
        title: 'Apple for internship',
        description: 'Prepare for Apple internship application',
        date: format(new Date(startOfWeek.getTime() + 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Monday
        priority: 'high',
        completed: false,
        startTime: '09:00',
        endTime: '10:00'
      },
      {
        id: '2',
        title: 'Clean the room',
        description: 'Organize and clean bedroom',
        date: format(new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Tuesday
        priority: 'medium',
        completed: false,
        startTime: '14:00',
        endTime: '16:00'
      },
      {
        id: '3',
        title: 'Go to gym',
        description: 'Workout session at the gym',
        date: format(new Date(startOfWeek.getTime() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Wednesday
        priority: 'medium',
        completed: false,
        startTime: '18:00',
        endTime: '19:30'
      },
      {
        id: '4',
        title: 'Study for exam',
        description: 'Prepare for upcoming exam',
        date: format(new Date(startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Thursday
        priority: 'high',
        completed: false,
        startTime: '19:00',
        endTime: '21:00'
      }
    ];
  };

  // In a real app, these would come from a database or API
  const [tasks, setTasks] = useState<Task[]>(getSampleTasks());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  
  // Filter tasks for the selected date
  const filteredTasks = tasks.filter(
    task => task.date === format(selectedDate, 'yyyy-MM-dd')
  );
  
  // Filter time blocks for the selected date
  const filteredTimeBlocks = timeBlocks.filter(
    block => block.date === format(selectedDate, 'yyyy-MM-dd')
  );
  
  // Add a new task
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };
  
  // Update a task
  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };
  
  // Delete a task
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  // Add a time block
  const addTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    const newTimeBlock: TimeBlock = {
      ...timeBlock,
      id: Date.now().toString(),
    };
    setTimeBlocks(prevBlocks => [...prevBlocks, newTimeBlock]);
  };
  
  // Update a time block
  const updateTimeBlock = (updatedBlock: TimeBlock) => {
    setTimeBlocks(prevBlocks =>
      prevBlocks.map(block => (block.id === updatedBlock.id ? updatedBlock : block))
    );
  };
  
  // Delete a time block
  const deleteTimeBlock = (blockId: string) => {
    setTimeBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Load initial demo data
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd');
    
    // Demo tasks
    setTasks([
      {
        id: '1',
        title: 'Team meeting',
        description: 'Weekly team sync',
        date: today,
        startTime: '09:00',
        endTime: '10:00',
        completed: false,
        priority: 'high',
        tags: ['work', 'meeting']
      },
      {
        id: '2',
        title: 'Grocery shopping',
        description: 'Buy fruits, vegetables, and milk',
        date: today,
        completed: false,
        priority: 'medium',
        tags: ['personal', 'errands']
      },
      {
        id: '3',
        title: 'Project deadline',
        description: 'Submit final report',
        date: today,
        completed: false,
        priority: 'high',
        tags: ['work', 'deadline']
      }
    ]);
    
    // Demo time blocks
    setTimeBlocks([
      {
        id: '1',
        title: 'Focus time',
        startTime: '10:30',
        endTime: '12:00',
        date: today,
        color: '#93C5FD'
      },
      {
        id: '2',
        title: 'Lunch break',
        startTime: '12:00',
        endTime: '13:00',
        date: today,
        color: '#FBBF24'
      },
      {
        id: '3',
        title: 'Workout',
        startTime: '17:30',
        endTime: '18:30',
        date: today,
        color: '#34D399'
      }
    ]);
  }, []);
  
  return {
    tasks: filteredTasks,
    timeBlocks: filteredTimeBlocks,
    allTasks: tasks,
    allTimeBlocks: timeBlocks,
    addTask,
    updateTask,
    deleteTask,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    toggleTaskCompletion
  };
};

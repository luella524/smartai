
export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO format date
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  date: string; // ISO format date
  color?: string;
}

export interface AISuggestion {
  id: string;
  type: 'task' | 'timeBlock' | 'schedule';
  content: string;
  task?: Partial<Task>;
  timeBlock?: Partial<TimeBlock>;
}

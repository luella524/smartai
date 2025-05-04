
import React from 'react';
import { Task, TimeBlock } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Clock, 
  Plus, 
  CalendarRange, 
  ClipboardList,
  MoreVertical 
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskListProps {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  onToggleComplete: (taskId: string) => void;
  onAddTask: () => void;
  onAddTimeBlock: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  timeBlocks,
  onToggleComplete,
  onAddTask,
  onAddTimeBlock,
}) => {
  // Combine tasks and time blocks into a single timeline
  const allItems = [
    ...tasks.map(task => ({
      id: task.id,
      type: 'task',
      title: task.title,
      startTime: task.startTime,
      endTime: task.endTime,
      completed: task.completed,
      description: task.description,
      priority: task.priority,
    })),
    ...timeBlocks.map(block => ({
      id: block.id,
      type: 'timeBlock',
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
    })),
  ];

  // Sort the combined items by start time
  const sortedItems = allItems.sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  // Group items with no time separately
  const unscheduledTasks = sortedItems.filter(item => !item.startTime);
  const scheduledItems = sortedItems.filter(item => item.startTime);

  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Schedule</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddTimeBlock}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Add Time Block
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddTask}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {scheduledItems.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <CalendarRange className="h-4 w-4 mr-2" />
            <h3 className="font-medium">Scheduled</h3>
          </div>
          <div className="space-y-2">
            {scheduledItems.map(item => (
              <div 
                key={`${item.type}-${item.id}`} 
                className={`
                  flex items-start p-3 rounded-md
                  ${item.type === 'timeBlock' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}
                  ${item.type === 'task' && item.completed ? 'opacity-60' : ''}
                  border
                `}
              >
                {item.type === 'task' && (
                  <Checkbox 
                    checked={item.completed}
                    onCheckedChange={() => onToggleComplete(item.id)} 
                    className="mr-2 mt-1"
                  />
                )}
                {item.type === 'timeBlock' && (
                  <div 
                    className="w-4 h-4 rounded-full mr-2 mt-1"
                    style={{ backgroundColor: item.color || '#93C5FD' }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${item.type === 'task' && item.completed ? 'line-through' : ''}`}>
                      {item.title}
                    </h4>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.startTime} - {item.endTime}
                  </div>
                  {item.type === 'task' && item.description && (
                    <p className="text-sm mt-1 text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-md mb-6">
          <CalendarRange className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-2">No scheduled items for today</p>
          <Button 
            variant="outline" 
            onClick={onAddTimeBlock}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Add Time Block
          </Button>
        </div>
      )}

      {unscheduledTasks.length > 0 && (
        <div>
          <div className="flex items-center mb-2">
            <ClipboardList className="h-4 w-4 mr-2" />
            <h3 className="font-medium">Unscheduled Tasks</h3>
          </div>
          <div className="space-y-2">
            {unscheduledTasks.map(item => (
              <div 
                key={`${item.type}-${item.id}`} 
                className={`
                  flex items-start p-3 rounded-md bg-white dark:bg-gray-800 border
                  ${item.type === 'task' && item.completed ? 'opacity-60' : ''}
                `}
              >
                {item.type === 'task' && (
                  <Checkbox 
                    checked={item.completed}
                    onCheckedChange={() => onToggleComplete(item.id)} 
                    className="mr-2 mt-1"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${item.type === 'task' && item.completed ? 'line-through' : ''}`}>
                      {item.title}
                    </h4>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  {item.type === 'task' && item.description && (
                    <p className="text-sm mt-1 text-muted-foreground">{item.description}</p>
                  )}
                  {item.type === 'task' && item.priority && (
                    <div className={`
                      inline-block px-2 py-0.5 mt-1 rounded-full text-xs
                      ${item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }
                    `}>
                      {item.priority} priority
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;

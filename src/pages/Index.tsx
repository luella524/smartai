
import React, { useState } from 'react';
import { format } from 'date-fns';

import Layout from '@/components/Layout/Layout';
import Header from '@/components/Layout/Header';
import CalendarView from '@/components/Calendar/CalendarView';
import TaskList from '@/components/Tasks/TaskList';
import TaskForm from '@/components/Tasks/TaskForm';
import AISuggestions from '@/components/AI/AISuggestions';

import { useCalendar } from '@/hooks/useCalendar';
import { useTasks } from '@/hooks/useTasks';
import { useAI } from '@/hooks/useAI';
import { Task, TimeBlock, AISuggestion } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [timeBlockFormOpen, setTimeBlockFormOpen] = useState(false);
  
  const {
    currentDate,
    selectedDate,
    currentMonth,
    daysInMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    isToday,
    isCurrentMonth,
    isSelected,
    formattedSelectedDate,
  } = useCalendar();
  
  const {
    tasks,
    timeBlocks,
    addTask,
    updateTask,
    deleteTask,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    toggleTaskCompletion,
  } = useTasks(selectedDate);
  
  const {
    suggestions,
    isGenerating,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    clearAllSuggestions,
  } = useAI(tasks, timeBlocks, selectedDate);
  
  const handleSaveTask = (task: Omit<Task, 'id'>) => {
    addTask(task);
    toast({
      title: "Task created",
      description: `"${task.title}" has been added to your schedule.`,
    });
  };
  
  const handleSaveTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    addTimeBlock(timeBlock);
    toast({
      title: "Time block created",
      description: `"${timeBlock.title}" has been added to your schedule.`,
    });
  };
  
  const handleApplySuggestion = (suggestion: AISuggestion) => {
    if (suggestion.type === 'task' && suggestion.task) {
      addTask({
        ...suggestion.task,
        completed: false,
        priority: suggestion.task.priority || 'medium',
        date: suggestion.task.date || format(selectedDate, 'yyyy-MM-dd'),
      });
      toast({
        title: "Task created",
        description: `"${suggestion.task.title}" has been added to your schedule.`,
      });
    } else if (suggestion.type === 'timeBlock' && suggestion.timeBlock) {
      addTimeBlock({
        ...suggestion.timeBlock,
        title: suggestion.timeBlock.title || 'Time Block',
        date: suggestion.timeBlock.date || format(selectedDate, 'yyyy-MM-dd'),
        color: '#93C5FD',
      });
      toast({
        title: "Time block created",
        description: `"${suggestion.timeBlock.title}" has been added to your schedule.`,
      });
    }
    
    applySuggestion(suggestion);
  };
  
  const handleGenerateSuggestions = () => {
    generateSuggestions();
    toast({
      title: "Generating suggestions",
      description: "AI is analyzing your schedule to provide personalized recommendations.",
    });
  };

  return (
    <>
      <Layout
        header={
          <Header 
            date={formattedSelectedDate}
            onGenerateSuggestions={handleGenerateSuggestions} 
            isGenerating={isGenerating}
          />
        }
        calendar={
          <CalendarView
            currentMonth={currentMonth}
            daysInMonth={daysInMonth}
            onPrevMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onToday={goToToday}
            onSelectDate={selectDate}
            isToday={isToday}
            isCurrentMonth={isCurrentMonth}
            isSelected={isSelected}
          />
        }
        content={
          <>
            <AISuggestions
              suggestions={suggestions}
              onApply={handleApplySuggestion}
              onDismiss={dismissSuggestion}
              onClearAll={clearAllSuggestions}
            />
            <TaskList
              tasks={tasks}
              timeBlocks={timeBlocks}
              onToggleComplete={toggleTaskCompletion}
              onAddTask={() => setTaskFormOpen(true)}
              onAddTimeBlock={() => setTimeBlockFormOpen(true)}
            />
          </>
        }
        sidebar={
          <div className="bg-card rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold mb-4">SmartDay AI</h2>
            <p className="text-muted-foreground mb-4">
              Your AI assistant is ready to help you plan your day more efficiently. 
              Use the "Get AI Suggestions" button for personalized recommendations.
            </p>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Today's Focus</h3>
              <ul className="space-y-2">
                {tasks
                  .filter(task => task.priority === 'high')
                  .slice(0, 3)
                  .map(task => (
                    <li key={task.id} className="text-sm">
                      • {task.title}
                    </li>
                  ))}
                {tasks.filter(task => task.priority === 'high').length === 0 && (
                  <li className="text-sm text-muted-foreground">No high priority tasks today</li>
                )}
              </ul>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-muted rounded-md p-2">
                  <p className="text-2xl font-bold">{tasks.filter(t => t.completed).length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-2xl font-bold">{timeBlocks.length}</p>
                  <p className="text-xs text-muted-foreground">Time Blocks</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => t.priority === 'high').length}
                  </p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
              </div>
            </div>
          </div>
        }
      />
      
      {/* Task form dialog */}
      <TaskForm
        isOpen={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        onSave={handleSaveTask}
        selectedDate={selectedDate}
        type="task"
      />
      
      {/* Time block form dialog */}
      <TaskForm
        isOpen={timeBlockFormOpen}
        onClose={() => setTimeBlockFormOpen(false)}
        onSave={handleSaveTask}
        onSaveTimeBlock={handleSaveTimeBlock}
        selectedDate={selectedDate}
        type="timeBlock"
      />
    </>
  );
};

export default Index;

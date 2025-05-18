import React, { useState } from 'react';
import { format } from 'date-fns';

import Layout from '@/components/Layout/Layout';
import Header from '@/components/Layout/Header';
import CalendarView from '@/components/Calendar/CalendarView';
import TaskList from '@/components/Tasks/TaskList';
import TaskForm from '@/components/Tasks/TaskForm';
import AISuggestions from '@/components/AI/AISuggestions';
import ChatBox from '@/components/AI/ChatBox';
import ActionLog from '@/components/AI/ActionLog';
import ContextDebugger from '@/components/AI/ContextDebugger';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useCalendar } from '@/hooks/useCalendar';
import { useTasks } from '@/hooks/useTasks';
import { useAI } from '@/hooks/useAI';
import { Task, TimeBlock, AISuggestion } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [timeBlockFormOpen, setTimeBlockFormOpen] = useState(false);
  const [showActionLog, setShowActionLog] = useState(false);
  const [showContextDebugger, setShowContextDebugger] = useState(false);
  const [dayDetailOpen, setDayDetailOpen] = useState(false); // State for day detail dialog
  
  // Add a subtle background pattern style
  const backgroundStyle = {
    backgroundImage: `radial-gradient(rgba(120, 120, 250, 0.1) 1px, transparent 1px), 
                     radial-gradient(rgba(120, 120, 250, 0.1) 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
  };
  
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
    allTasks,
    allTimeBlocks,
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
    messages,
    isChatLoading,
    sendChatMessage,
    actionLog,
    clearActionLog,
    lastSystemContext
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
        title: suggestion.task.title || 'New Task',
      });
      toast({
        title: "Task created",
        description: `"${suggestion.task.title || 'New Task'}" has been added to your schedule.`,
      });
    } else if (suggestion.type === 'timeBlock' && suggestion.timeBlock) {
      addTimeBlock({
        ...suggestion.timeBlock,
        title: suggestion.timeBlock.title || 'Time Block',
        date: suggestion.timeBlock.date || format(selectedDate, 'yyyy-MM-dd'),
        color: '#93C5FD',
        startTime: suggestion.timeBlock.startTime || '09:00',
        endTime: suggestion.timeBlock.endTime || '10:00',
      });
      toast({
        title: "Time block created",
        description: `"${suggestion.timeBlock.title || 'Time Block'}" has been added to your schedule.`,
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

  // Handle sending messages to the AI chat
  const handleSendChatMessage = (message: string) => {
    // Pass all the necessary calendar functions
    sendChatMessage(
      message,
      addTask,
      updateTask,
      deleteTask,
      addTimeBlock,
      updateTimeBlock,
      deleteTimeBlock
    );
  };
  
  // Add a handler for clearing the action log with toast notification
  const handleClearActionLog = () => {
    clearActionLog();
    toast({
      title: "Action log cleared",
      description: "The AI action log has been cleared.",
    });
  };

  // For development use - toggle context debugger (not shown in production)
  const toggleContextDebugger = () => {
    setShowContextDebugger(!showContextDebugger);
  };

  // Handle double click on a day in the calendar
  const handleDayDoubleClick = (date: Date) => {
    selectDate(date);
    setDayDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900" style={backgroundStyle}>
      <Layout
        header={
          <Header 
            date={formattedSelectedDate}
            onGenerateSuggestions={handleGenerateSuggestions} 
            isGenerating={isGenerating}
            showActionLog={showActionLog}
            onToggleActionLog={() => setShowActionLog(!showActionLog)}
            onDebugContext={import.meta.env.DEV ? toggleContextDebugger : undefined}
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
            tasks={allTasks}
            timeBlocks={allTimeBlocks}
            onDayDoubleClick={handleDayDoubleClick}
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
            {/* TaskList component commented out
            <TaskList
              tasks={tasks}
              timeBlocks={timeBlocks}
              onToggleComplete={toggleTaskCompletion}
              onAddTask={() => setTaskFormOpen(true)}
              onAddTimeBlock={() => setTimeBlockFormOpen(true)}
            />
            */}
          </>
        }
        sidebar={
          <ChatBox
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendChatMessage}
          />
        }
      />
      
      {/* Action Log */}
      <ActionLog 
        logs={actionLog}
        onClear={handleClearActionLog}
        show={showActionLog}
        onClose={() => setShowActionLog(false)}
      />
      
      {/* Context Debugger - only in development */}
      {import.meta.env.DEV && (
        <ContextDebugger 
          context={lastSystemContext}
          show={showContextDebugger}
          onClose={() => setShowContextDebugger(false)}
        />
      )}
      
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

      {/* Day detail dialog */}
      <Dialog open={dayDetailOpen} onOpenChange={setDayDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-1">
            <DialogTitle className="text-2xl font-bold text-primary">
              {formattedSelectedDate}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              View and manage your schedule for this day
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 my-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTaskFormOpen(true)}
              className="flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 12 2 2 4-4" /></svg>
              Add Task
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTimeBlockFormOpen(true)}
              className="flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Add Time Block
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto py-4 -mx-6 px-6">
            <TaskList
              tasks={tasks}
              timeBlocks={timeBlocks}
              onToggleComplete={toggleTaskCompletion}
              onAddTask={() => setTaskFormOpen(true)}
              onAddTimeBlock={() => setTimeBlockFormOpen(true)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

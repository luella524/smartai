import React from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useTasks } from '@/hooks/useTasks';
import { useAI } from '@/hooks/useAI';
import { format } from 'date-fns';
import Header from '@/components/Layout/Header';
import CalendarView from '@/components/Calendar/CalendarView';
import TaskForm from '@/components/Tasks/TaskForm';
import TaskList from '@/components/Tasks/TaskList';
import Top3TodoList from '@/components/Tasks/Top3TodoList';
import AISuggestions from '@/components/AI/AISuggestions';
import ChatBox from '@/components/AI/ChatBox';
import Layout from '@/components/Layout/Layout';

const Index = () => {
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
  } = useAI(allTasks, allTimeBlocks, selectedDate);

  // Calculate Top 3 tasks for this week
  const getTop3Tasks = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    
    const startOfWeekStr = format(startOfWeek, 'yyyy-MM-dd');
    const endOfWeekStr = format(endOfWeek, 'yyyy-MM-dd');
    
    const weekTasks = allTasks
      .filter(task => task.date >= startOfWeekStr && task.date <= endOfWeekStr && !task.completed)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
        return bPriority - aPriority;
      })
      .slice(0, 3);

    const completedThisWeek = allTasks.filter(task => task.date >= startOfWeekStr && task.date <= endOfWeekStr && task.completed).length;
    const totalThisWeek = allTasks.filter(task => task.date >= startOfWeekStr && task.date <= endOfWeekStr).length;
    
    return {
      tasks: weekTasks.map(task => ({ id: task.id, title: task.title, priority: task.priority })),
      progress: { completed: completedThisWeek, total: totalThisWeek, rate: totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0 }
    };
  };

  const top3Data = getTop3Tasks();

  return (
    <Layout
      header={
        <Header />
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
        />
      }
      sidebar={
        <div className="space-y-6">
          <Top3TodoList
            tasks={top3Data.tasks}
            weekProgress={top3Data.progress}
          />
          <AISuggestions
            suggestions={suggestions}
            onApply={applySuggestion}
            onDismiss={dismissSuggestion}
            onClearAll={clearAllSuggestions}
          />
          <ChatBox
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={sendChatMessage}
            actionLog={actionLog}
            onClearActionLog={clearActionLog}
            lastSystemContext={lastSystemContext}
          />
        </div>
      }
    />
  );
};

export default Index;
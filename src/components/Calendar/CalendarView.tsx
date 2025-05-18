import React from 'react';
import { format, isSameDay, isToday as isDateToday, isWithinInterval, startOfDay, addHours, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarClock, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TimeBlock } from '@/types';

interface CalendarViewProps {
  currentMonth: string;
  daysInMonth: Date[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectDate: (date: Date) => void;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
  isSelected: (date: Date) => boolean;
}

const CalendarView: React.FC<CalendarViewProps & { 
  tasks: Task[];
  timeBlocks: TimeBlock[];
}> = ({
  currentMonth,
  daysInMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate,
  isToday,
  isCurrentMonth,
  isSelected,
  tasks,
  timeBlocks,
}) => {
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    
    const dayTasks = tasks.filter(task => task.date === formattedDay);
    const dayTimeBlocks = timeBlocks.filter(block => block.date === formattedDay);
    
    return { tasks: dayTasks, timeBlocks: dayTimeBlocks };
  };

  // Function to truncate text
  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  // Calculate max events to show per day (will depend on screen size in a real app)
  const MAX_VISIBLE_EVENTS = 5;

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl shadow-md overflow-hidden mb-6">
      {/* Calendar header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold dark:text-white">{currentMonth}</h2>
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 rounded-md p-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("rounded-sm px-2.5 py-1.5 h-auto text-sm font-medium")}
              onClick={onToday}
            >
              Today
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-[auto_1fr_1fr_1fr_1fr_1fr] auto-rows-fr min-h-[500px]">
        {daysInMonth.map((day) => {
          const formattedDate = format(day, 'd');
          const { tasks: dayTasks, timeBlocks: dayTimeBlocks } = getEventsForDay(day);
          const allEvents = [...dayTasks, ...dayTimeBlocks];
          const hasMore = allEvents.length > MAX_VISIBLE_EVENTS;
          
          // Sort events by start time
          const sortedEvents = allEvents.sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          });
          
          const visibleEvents = sortedEvents.slice(0, MAX_VISIBLE_EVENTS);
          
          return (
            <div
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[100px] p-1 border-b border-r border-gray-200 dark:border-gray-800 flex flex-col",
                !isCurrentMonth(day) && "bg-gray-50 dark:bg-gray-900/40",
                isSelected(day) && "bg-blue-50 dark:bg-blue-900/20",
                "hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer",
                "overflow-hidden"
              )}
            >
              <div 
                className={cn(
                  "self-start px-2 py-0.5 rounded-full text-xs font-medium mt-1 mb-1.5",
                  isToday(day) && "bg-blue-500 text-white", 
                  !isToday(day) && "text-gray-600 dark:text-gray-400"
                )}
              >
                {formattedDate}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {visibleEvents.map((event, index) => {
                  const isTask = 'completed' in event;
                  let bgColor = isTask 
                    ? ((event as Task).completed ? 'bg-gray-200 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900/40') 
                    : (event as TimeBlock).color || 'bg-indigo-100 dark:bg-indigo-900/40';
                    
                  let textColor = isTask 
                    ? ((event as Task).completed ? 'text-gray-600 dark:text-gray-400' : 'text-blue-800 dark:text-blue-200') 
                    : 'text-indigo-800 dark:text-indigo-200';
                    
                  // For priority high tasks
                  if (isTask && (event as Task).priority === 'high') {
                    bgColor = 'bg-red-100 dark:bg-red-900/40';
                    textColor = 'text-red-800 dark:text-red-200';
                  }
                  
                  // For priority medium tasks
                  if (isTask && (event as Task).priority === 'medium') {
                    bgColor = 'bg-amber-100 dark:bg-amber-900/40';
                    textColor = 'text-amber-800 dark:text-amber-200';
                  }
                  
                  return (
                    <div 
                      key={`${isTask ? 'task' : 'block'}-${event.id}-${index}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering day selection
                        // You could add custom handling for clicking on an event here
                      }}
                      className={cn(
                        "px-2 py-1 rounded-sm mb-1 text-xs flex items-center",
                        bgColor,
                        textColor,
                        "truncate shadow-sm hover:shadow transition-all",
                        "cursor-pointer hover:brightness-95 dark:hover:brightness-110"
                      )}
                    >
                      {isTask && (
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-1.5",
                          (event as Task).completed ? "bg-green-500" : "bg-blue-500"
                        )} />
                      )}
                      {!isTask && (
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-indigo-500" />
                      )}
                      <div className="truncate flex-1">
                        {event.startTime && (
                          <span className="inline-block mr-1 font-medium">{event.startTime}</span>
                        )}
                        <span className={cn(
                          isTask && (event as Task).completed && "line-through opacity-70"
                        )}>
                          {truncate(event.title, 20)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {hasMore && (
                  <div 
                    className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 flex items-center"
                    onClick={(e) => e.stopPropagation()} // Prevent triggering day selection
                  >
                    <MoreHorizontal className="h-3 w-3 mr-1" />
                    <span>{allEvents.length - MAX_VISIBLE_EVENTS} more</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;

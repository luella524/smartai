
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  daysInMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate,
  isToday,
  isCurrentMonth,
  isSelected,
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{currentMonth}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday}>
            <CalendarClock className="h-4 w-4 mr-1" />
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="calendar-grid mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center font-medium py-2 text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {daysInMonth.map((day) => {
          const formattedDate = format(day, 'd');
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "flex justify-center items-center py-2",
                !isCurrentMonth(day) && "opacity-40"
              )}
            >
              <button
                onClick={() => onSelectDate(day)}
                className={cn(
                  "calendar-day",
                  isSelected(day) && "calendar-day-selected",
                  isToday(day) && "calendar-day-today"
                )}
              >
                {formattedDate}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;

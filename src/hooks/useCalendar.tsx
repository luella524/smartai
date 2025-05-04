
import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();

  const currentMonth = format(currentDate, 'MMMM yyyy');
  
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });
  
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };
  
  const isToday = (date: Date) => isSameDay(date, today);
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  const formattedSelectedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  
  return {
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
  };
};

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, subDays, getDay } from 'date-fns';

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();

  const currentMonth = format(currentDate, 'MMMM yyyy');
  
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Get days in the current month
  const monthDays = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });
  
  // Get the correct representation for Monday first calendar
  // If firstDayOfMonth is Sunday (0), we need to move it to the end
  // For other days, we just need to shift back by 1 (Monday = 1 -> 0 index)
  const firstWeekDay = getDay(firstDayOfMonth);
  
  // Calculate how many days we need to prepend (empty days or from previous month)
  // If first day is Monday (1), we don't prepend anything (0)
  // If first day is Sunday (0), we add 6 days to make it the last day of the week
  // For other days, we subtract 1 to get the right number of days to shift
  const daysToAdd = firstWeekDay === 0 ? 6 : firstWeekDay - 1;
  
  // Create days from previous month to fill the first row
  const prevMonthDays = [];
  for (let i = 0; i < daysToAdd; i++) {
    prevMonthDays.unshift(subDays(firstDayOfMonth, i + 1));
  }
  
  // Get days in the next month to complete the grid if needed
  const totalDaysToShow = 42; // 6 rows × 7 days
  const remainingDays = totalDaysToShow - monthDays.length - prevMonthDays.length;
  
  const nextMonthDays = [];
  for (let i = 1; i <= remainingDays; i++) {
    nextMonthDays.push(addDays(lastDayOfMonth, i));
  }
  
  // Create the calendar grid with days properly aligned
  const daysInMonth = [...prevMonthDays, ...monthDays, ...nextMonthDays];
  
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

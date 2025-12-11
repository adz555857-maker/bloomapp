import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Habit } from '../types';

interface CalendarViewProps {
  habits: Habit[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ habits }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDayColor = (day: number) => {
    if (habits.length === 0) return 'bg-gray-100 dark:bg-stone-800';

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    let completedCount = 0;

    habits.forEach(habit => {
      if (habit.type === 'boolean') {
        if (habit.completedDates.includes(dateStr)) {
          completedCount++;
        }
      } else {
        // Numeric logic
        const val = habit.progress[dateStr] || 0;
        const metMin = val >= habit.target;
        const metMax = habit.maxTarget ? val <= habit.maxTarget : true;
        if (metMin && metMax) {
          completedCount++;
        }
      }
    });

    const percentage = completedCount / habits.length;

    // 0% -> No color (or very light)
    if (completedCount === 0) return 'bg-earth-100 dark:bg-stone-800 text-stone-400';

    // 100% -> Dark Green
    if (percentage === 1) return 'bg-nature-700 text-white shadow-md shadow-nature-200 dark:shadow-none';
    
    // 66% < x < 100% -> Green
    if (percentage > 0.66) return 'bg-nature-500 text-white';
    
    // 33% < x <= 66% -> Yellow
    if (percentage > 0.33) return 'bg-yellow-400 text-white';
    
    // <= 33% -> Red
    return 'bg-red-400 text-white';
  };

  const renderDays = () => {
    const days = [];
    const emptySlots = firstDay;

    // Empty slots for previous month
    for (let i = 0; i < emptySlots; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-12" />);
    }

    // Days of actual month
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      const colorClass = getDayColor(d);
      
      days.push(
        <div 
          key={d} 
          className={`
            h-10 sm:h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 relative group
            ${colorClass}
            ${isToday ? 'ring-2 ring-stone-900 dark:ring-white ring-offset-2 dark:ring-offset-stone-900 z-10' : ''}
          `}
        >
          {d}
          {/* Tooltip logic could go here, but omitted for clean UI */}
        </div>
      );
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="w-full max-w-md mx-auto animate-grow">
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-earth-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-earth-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-stone-600 dark:text-stone-300" />
          </button>
          <div className="text-xl font-bold text-nature-900 dark:text-stone-100 flex items-center gap-2">
            <CalendarIcon size={20} className="text-nature-500" />
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-earth-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <ChevronRight size={20} className="text-stone-600 dark:text-stone-300" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[10px] sm:text-xs mb-6 px-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-stone-500 dark:text-stone-400">&lt;33%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-stone-500 dark:text-stone-400">33-66%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-nature-500"></div>
            <span className="text-stone-500 dark:text-stone-400">Good</span>
          </div>
           <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-nature-700"></div>
            <span className="text-stone-500 dark:text-stone-400">Perfect</span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {renderDays()}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-6 border-t border-earth-100 dark:border-stone-800 text-center">
           <p className="text-sm text-stone-500 dark:text-stone-400">
             Consistent small steps lead to big changes.
           </p>
        </div>

      </div>
    </div>
  );
};

export default CalendarView;
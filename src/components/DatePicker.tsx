import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
  const handlePrevDay = () => {
    const currentDate = new Date(selectedDate);
    const newDate = addDays(currentDate, -1);
    onDateChange(format(newDate, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    const newDate = addDays(currentDate, 1);
    onDateChange(format(newDate, 'yyyy-MM-dd'));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevDay}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                   text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <button
        onClick={handleNextDay}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};
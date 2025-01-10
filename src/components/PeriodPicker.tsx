import React from 'react';
import { Clock } from 'lucide-react';

export type Period = '15min' | '1h';

interface PeriodPickerProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export const PeriodPicker: React.FC<PeriodPickerProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <select
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value as Period)}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="15min">15 minutes</option>
        <option value="1h">1 hour</option>
      </select>
    </div>
  );
};
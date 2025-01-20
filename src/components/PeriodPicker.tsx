import { Clock } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

export type Period = "15min" | "1h";

type PeriodPickerProps = {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
} & ComponentPropsWithoutRef<"div">;

const periodOptions = [
  { value: "15min", label: "15 minutes" },
  { value: "1h", label: "1 hour" },
] satisfies Array<{ value: Period; label: string }>;

export const PeriodPicker = ({
  selectedPeriod,
  onPeriodChange,
  ...props
}: PeriodPickerProps) => {
  const handlePeriodChange = (value: string) => {
    if (value === "15min" || value === "1h") {
      onPeriodChange(value);
    }
  };

  return (
    <div {...props} className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />

      <select
        value={selectedPeriod}
        onChange={(e) => handlePeriodChange(e.target.value)}
        className={[
          // Base styles
          `px-3 py-2 border rounded-lg outline-none`,
          // Light mode
          `bg-white border-gray-300 text-gray-900`,
          // Dark mode
          `dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`,
          // Focus state
          `focus:ring-2 focus:ring-blue-500`,
        ].join(" ")}
      >
        {periodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

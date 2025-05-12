'use client';

import { ComplexityLevel } from '../lib/types';

interface ComplexitySelectProps {
  value: ComplexityLevel;
  onChange: (value: ComplexityLevel) => void;
}

export const ComplexitySelect = ({ value, onChange }: ComplexitySelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ComplexityLevel)}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow"
    >
      {Object.values(ComplexityLevel).map((level) => (
        <option key={level} value={level}>
          {level}
        </option>
      ))}
    </select>
  );
};
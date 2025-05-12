import { useState } from "react";

interface CheckboxProps {
  legend: string;
  label: string;
  description: string;
  onChange: (value: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ legend, label, description, onChange }) => {
  const [checked, setChecked] = useState(false);

  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">{legend}</legend>
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            id="custom-checkbox"
            name="custom-checkbox"
            type="checkbox"
            value={checked as any}
            onChange={() => {
              setChecked(!checked);
              onChange(!checked);
            }}
            className="focus:ring-lumerin-aqua h-4 w-4 text-lumerin-aqua border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="custom-checkbox" className="font-medium">
            {label}
          </label>
          <p id="custom-description" className="text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </fieldset>
  );
};

Checkbox.displayName = "Checkbox";

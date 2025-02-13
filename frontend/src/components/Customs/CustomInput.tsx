"use client";

import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useState } from "react";

interface CustomInputProps {
  type: string;
  id: string;
  placeHolder: string;
  options?: { label: string; value: string | number }[];
  prefix?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput = ({ type, id, placeHolder, options, prefix, defaultValue, value, onChange }: CustomInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (onChange) {
      onChange(e as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div>
      <div className="relative flex w-full items-center overflow-hidden rounded border border-stroke dark:border-strokedark">
        {prefix && (
          <span className="border-r border-stroke bg-gray-100 px-4 py-3 text-black dark:border-strokedark dark:bg-gray-700 dark:text-white">{prefix}</span>
        )}
        {type === "select" && options ? (
          <select
            defaultValue={defaultValue} // Use defaultValue if value is not provided
            value={value} // Only apply value if it exists
            onChange={handleChange}
            className="relative z-20 w-full appearance-none bg-transparent bg-white px-4 py-3 outline-none transition focus:border-primary active:border-primary dark:bg-form-input"
            name={id}
            id={id}
          >
            <option value="" disabled className="text-body dark:text-bodydark">
              {placeHolder}
            </option>
            {options.map((option, index) => (
              <option key={index} value={option.value} className="text-body dark:text-bodydark">
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="w-full bg-transparent bg-white px-4 py-3 text-black focus:border-primary focus-visible:outline-none dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            type="text"
            name={id}
            id={id}
            placeholder={placeHolder}
            {...(value !== undefined ? { value } : { defaultValue })} // Apply value if exists, otherwise use defaultValue
            onChange={handleChange}
          />
        )}
      </div>
    </div>
  );
};

export default CustomInput;

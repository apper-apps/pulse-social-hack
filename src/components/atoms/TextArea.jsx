import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const TextArea = forwardRef(({ 
  className,
  label,
  error,
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-3 border border-gray-300 rounded-lg resize-none transition-all duration-200",
          "focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none",
          "placeholder:text-gray-400",
          error && "border-red-300 focus:ring-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

TextArea.displayName = "TextArea";

export default TextArea;
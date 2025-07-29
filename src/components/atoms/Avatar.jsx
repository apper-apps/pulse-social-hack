import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Avatar = forwardRef(({ 
  src, 
  alt, 
  size = "md", 
  className,
  fallback,
  ...props 
}, ref) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-xl"
  };

  if (!src && !fallback) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center",
          sizes[size],
          className
        )}
        {...props}
      >
        <span className={cn("text-white font-medium", textSizes[size])}>
          {alt ? alt.charAt(0).toUpperCase() : "?"}
        </span>
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn(
        "rounded-full object-cover border-2 border-white shadow-sm",
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Avatar.displayName = "Avatar";

export default Avatar;
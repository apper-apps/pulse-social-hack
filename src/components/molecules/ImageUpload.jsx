import React, { useState, useRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const ImageUpload = ({ onImageSelect, preview, onRemove, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect?.(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (preview) {
    return (
      <div className={cn("relative", className)}>
        <img
          src={preview}
          alt="Preview"
          className="w-full h-64 object-cover rounded-lg"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragging 
            ? "border-primary-400 bg-primary-50" 
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
        )}
      >
        <ApperIcon 
          name="ImagePlus" 
          className={cn(
            "w-12 h-12 mx-auto mb-4 transition-colors duration-200",
            isDragging ? "text-primary-500" : "text-gray-400"
          )} 
        />
        <p className="text-gray-600 mb-2">
          Drag and drop an image, or click to select
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
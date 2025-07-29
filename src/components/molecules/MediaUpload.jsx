import React, { useRef, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MediaUpload = ({ mediaFiles = [], onMediaChange, className, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverIndex(null);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    
    if (validFiles.length > 0) {
      processFiles(validFiles);
    }
  };

  const processFiles = (files) => {
    const newMediaFiles = [];
    let processedCount = 0;

    files.forEach((file, index) => {
      if (mediaFiles.length + newMediaFiles.length >= 10) {
        return; // Limit to 10 files
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaFile = {
          id: Date.now() + index,
          file,
          preview: e.target.result,
          type: file.type.startsWith("video/") ? "video" : "image"
        };
        
        newMediaFiles.push(mediaFile);
        processedCount++;
        
        if (processedCount === files.length || newMediaFiles.length + mediaFiles.length === 10) {
          onMediaChange([...mediaFiles, ...newMediaFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    e.target.value = '';
  };

  const removeMedia = (id) => {
    onMediaChange(mediaFiles.filter(media => media.id !== id));
  };

  const handleMediaDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleMediaDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleMediaDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    const newMediaFiles = [...mediaFiles];
    const draggedItem = newMediaFiles[dragIndex];
    newMediaFiles.splice(dragIndex, 1);
    newMediaFiles.splice(dropIndex, 0, draggedItem);
    
    onMediaChange(newMediaFiles);
    setDragOverIndex(null);
  };

  if (mediaFiles.length > 0) {
    return (
      <div className={cn("w-full", className)}>
        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {mediaFiles.map((media, index) => (
            <div
              key={media.id}
              draggable={!disabled}
              onDragStart={(e) => handleMediaDragStart(e, index)}
              onDragOver={(e) => handleMediaDragOver(e, index)}
              onDrop={(e) => handleMediaDrop(e, index)}
              onDragLeave={() => setDragOverIndex(null)}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden cursor-move",
                dragOverIndex === index && "ring-2 ring-primary-400",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {media.type === "video" ? (
                <video
                  src={media.preview}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={media.preview}
                  alt="Media preview"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Media Type Indicator */}
              <div className="absolute top-2 left-2">
                <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                  <ApperIcon 
                    name={media.type === "video" ? "Video" : "Image"} 
                    size={12} 
                  />
                  <span className="capitalize">{media.type}</span>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeMedia(media.id)}
                disabled={disabled}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <ApperIcon name="X" size={14} />
              </button>

              {/* Drag Handle */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white p-1 rounded">
                  <ApperIcon name="GripVertical" size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Button */}
        {mediaFiles.length < 10 && (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={cn(
              "w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <ApperIcon name="Plus" size={16} />
            <span className="text-sm text-gray-600">Add more media ({mediaFiles.length}/10)</span>
          </button>
        )}
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
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <ApperIcon 
          name="FileImage" 
          className={cn(
            "w-12 h-12 mx-auto mb-4 transition-colors duration-200",
            isDragging ? "text-primary-500" : "text-gray-400"
          )} 
        />
        <p className="text-gray-600 mb-2">
          Drag and drop images or videos, or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supports images (PNG, JPG, GIF) and videos (MP4, MOV) up to 50MB • Max 10 files
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default MediaUpload;
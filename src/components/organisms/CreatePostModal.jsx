import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import TextArea from "@/components/atoms/TextArea";
import Avatar from "@/components/atoms/Avatar";
import ImageUpload from "@/components/molecules/ImageUpload";
import ApperIcon from "@/components/ApperIcon";
import userService from "@/services/api/userService";
import postService from "@/services/api/postService";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !imagePreview) {
      toast.error("Please add some content or an image");
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        content: content.trim(),
        imageUrl: imagePreview
      };
      
      await postService.create(postData);
      toast.success("Post created successfully!");
      
      setContent("");
      setImagePreview(null);
      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent("");
      setImagePreview(null);
      onClose();
    }
  };

  if (!currentUser) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-display font-semibold text-gray-900">
                  Create Post
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    {/* Author */}
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar
                        src={currentUser.profilePicture}
                        alt={currentUser.displayName}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {currentUser.displayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{currentUser.username}
                        </p>
                      </div>
                    </div>

                    {/* Text Content */}
                    <TextArea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={4}
                      className="mb-4 border-none resize-none focus:ring-0 p-0 text-lg placeholder:text-gray-400"
                      disabled={isSubmitting}
                    />

                    {/* Image Upload */}
                    <ImageUpload
                      onImageSelect={setImagePreview}
                      preview={imagePreview}
                      onRemove={() => setImagePreview(null)}
                      className="mb-4"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <ApperIcon name="Globe" className="w-4 h-4" />
                      <span>Everyone can reply</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {content.length}/280
                    </span>
                    <Button
                      type="submit"
                      disabled={(!content.trim() && !imagePreview) || isSubmitting || content.length > 280}
                      loading={isSubmitting}
                      className="px-6"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
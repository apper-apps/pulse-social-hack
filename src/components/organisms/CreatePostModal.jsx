import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import userService from "@/services/api/userService";
import postService from "@/services/api/postService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import MediaUpload from "@/components/molecules/MediaUpload";
import { cn } from "@/utils/cn";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [users, setUsers] = useState([]);
  const [popularHashtags] = useState(['#technology', '#design', '#photography', '#travel', '#food', '#fitness', '#art', '#music']);
  const textareaRef = useRef(null);

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

useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const allUsers = await userService.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setContent(value);
    setCursorPosition(position);

    // Check for mentions
    const beforeCursor = value.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setShowHashtags(false);
    } else {
      // Check for hashtags
      const hashtagMatch = beforeCursor.match(/#(\w*)$/);
      if (hashtagMatch) {
        setHashtagQuery(hashtagMatch[1]);
        setShowHashtags(true);
        setShowMentions(false);
      } else {
        setShowMentions(false);
        setShowHashtags(false);
      }
    }
  };

  const insertSuggestion = (suggestion, type) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const regex = type === 'mention' ? /@\w*$/ : /#\w*$/;
    const newBefore = beforeCursor.replace(regex, suggestion);
    const newContent = newBefore + afterCursor;
    
    setContent(newContent);
    setShowMentions(false);
    setShowHashtags(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = newBefore.length;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleFormatting = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + replacement.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media");
      return;
    }

    if (content.length > 500) {
      toast.error("Post content cannot exceed 500 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        content: content.trim(),
        mediaFiles: mediaFiles
      };
      
      await postService.create(postData);
      toast.success("Post created successfully!");
      
      setContent("");
      setMediaFiles([]);
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
      setMediaFiles([]);
      setShowMentions(false);
      setShowHashtags(false);
      onClose();
    }
  };

  if (!currentUser) return null;

  return (
    <AnimatePresence>
    {isOpen && <>
        {/* Backdrop */}
        <motion.div
            initial={{
                opacity: 0
            }}
            animate={{
                opacity: 1
            }}
            exit={{
                opacity: 0
            }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleClose}>
            {/* Modal */}
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: 20
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0
                }}
                exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: 20
                }}
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div
                    className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-display font-semibold text-gray-900">Create Post
                                        </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50">
                        <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                {/* Content */}
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {/* Author */}
                            <div className="flex items-center space-x-3 mb-4">
                                <Avatar src={currentUser.profilePicture} alt={currentUser.displayName} size="md" />
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {currentUser.displayName}
                                    </p>
                                    <p className="text-sm text-gray-500">@{currentUser.username}
                                    </p>
                                </div>
                            </div>
                            {/* Formatting Toolbar */}
                            <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => handleFormatting("bold")}
                                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                                    disabled={isSubmitting}>
                                    <ApperIcon name="Bold" size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFormatting("italic")}
                                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                                    disabled={isSubmitting}>
                                    <ApperIcon name="Italic" size={16} />
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-2" />
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <span>@mention</span>
                                    <span>•</span>
                                    <span>#hashtag</span>
                                </div>
                            </div>
                            {/* Rich Text Area */}
                            <div className="relative mb-4">
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={handleContentChange}
                                    placeholder="What's on your mind?"
                                    rows={4}
                                    className="w-full border-none resize-none focus:ring-0 p-0 text-lg placeholder:text-gray-400 bg-transparent"
                                    disabled={isSubmitting}
                                    maxLength={500} />
                                {/* Mention Suggestions */}
                                {showMentions && <div
                                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {users.filter(user => user.username.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5).map(user => <button
                                        key={user.Id}
                                        type="button"
                                        onClick={() => insertSuggestion(`@${user.username} `, "mention")}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                                        <Avatar src={user.profilePicture} alt={user.displayName} size="sm" />
                                        <div>
                                            <div className="font-medium">{user.displayName}</div>
                                            <div className="text-sm text-gray-500">@{user.username}</div>
                                        </div>
                                    </button>)}
                                </div>}
                                {/* Hashtag Suggestions */}
                                {showHashtags && <div
                                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {popularHashtags.filter(tag => tag.toLowerCase().includes(`#${hashtagQuery}`.toLowerCase())).slice(0, 5).map(hashtag => <button
                                        key={hashtag}
                                        type="button"
                                        onClick={() => insertSuggestion(`${hashtag} `, "hashtag")}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                                        <ApperIcon name="Hash" size={16} className="text-primary-500" />
                                        <span>{hashtag}</span>
                                    </button>)}
                                </div>}
                            </div>
                            {/* Media Upload */}
                            <MediaUpload
                                mediaFiles={mediaFiles}
                                onMediaChange={setMediaFiles}
                                className="mb-4"
                                disabled={isSubmitting} />
                            {/* Actions */}
                            <div
                                className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-4">
                                    <p
                                        className={cn(
                                            "text-sm",
                                            content.length > 450 ? "text-red-500" : content.length > 400 ? "text-yellow-500" : "text-gray-500"
                                        )}>
                                        {content.length}/500 characters
                                                                </p>
                                    {mediaFiles.length > 0 && <p className="text-sm text-gray-500">
                                        {mediaFiles.length}media file{mediaFiles.length !== 1 ? "s" : ""}
                                    </p>}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleClose}
                                        disabled={isSubmitting}>Cancel
                                                                </Button>
                                    <Button
                                        type="submit"
                                        disabled={!content.trim() && mediaFiles.length === 0 || isSubmitting || content.length > 500}>Post
                                                            </Button>
                                </div>
                            </div>
                        </div></div></form>
            </motion.div>
        </motion.div>
    </>}
</AnimatePresence>
  );
};

export default CreatePostModal;
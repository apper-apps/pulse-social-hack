import comments from '../mockData/comments.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CommentService {
  constructor() {
    this.comments = [...comments];
    this.nextId = Math.max(...comments.map(c => c.Id)) + 1;
  }

  async getByPostId(postId) {
    await delay(300);
    
    const postComments = this.comments
      .filter(comment => comment.postId === parseInt(postId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return [...postComments];
  }

  async getById(id) {
    await delay(200);
    
    const comment = this.comments.find(c => c.Id === parseInt(id));
    return comment ? { ...comment } : null;
  }

  async create(commentData) {
    await delay(500);
    
    if (!commentData.postId || !commentData.authorId || !commentData.content?.trim()) {
      throw new Error("Post ID, author ID, and content are required");
    }

    const newComment = {
      Id: this.nextId++,
      postId: parseInt(commentData.postId),
      authorId: parseInt(commentData.authorId),
      content: commentData.content.trim(),
      timestamp: new Date().toISOString()
    };

    this.comments.push(newComment);
    return { ...newComment };
  }

  async update(id, updates) {
    await delay(400);
    
    const index = this.comments.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Comment not found");
    }

    const updatedComment = {
      ...this.comments[index],
      ...updates,
      Id: parseInt(id),
      timestamp: this.comments[index].timestamp // Preserve original timestamp
    };

    this.comments[index] = updatedComment;
    return { ...updatedComment };
  }

  async delete(id) {
    await delay(300);
    
    const index = this.comments.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Comment not found");
    }

    const deletedComment = { ...this.comments[index] };
    this.comments.splice(index, 1);
    return deletedComment;
  }

  async getAll() {
    await delay(300);
    return [...this.comments];
  }
}

export default new CommentService();
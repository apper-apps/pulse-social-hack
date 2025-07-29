import users from "../mockData/users.json";

class UserService {
  constructor() {
    this.users = [...users];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.users];
  }

  async getById(id) {
    await this.delay();
    return this.users.find(user => user.Id === parseInt(id));
  }

  async getCurrentUser() {
    await this.delay();
    // Return the first user as the current logged-in user
    return this.users[0];
  }

  async updateProfile(id, data) {
    await this.delay();
    const userIndex = this.users.findIndex(user => user.Id === parseInt(id));
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...data };
      return this.users[userIndex];
    }
    throw new Error("User not found");
  }
}

export default new UserService();
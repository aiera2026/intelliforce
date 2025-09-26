const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdlc-ai-platform');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users
    const demoUsers = [
      {
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User',
        role: 'user',
        skills: [
          { name: 'JavaScript', level: 'advanced' },
          { name: 'React', level: 'advanced' },
          { name: 'Node.js', level: 'intermediate' }
        ],
        department: 'Engineering',
        title: 'Full Stack Developer',
        agentProfile: {
          isAgent: true,
          agentId: 'demo-agent-1',
          capabilities: {
            codeGeneration: 0.85,
            debugging: 0.80,
            testing: 0.75,
            documentation: 0.70,
            design: 0.60,
            deployment: 0.65
          },
          availability: {
            status: 'available',
            workload: 25
          }
        }
      },
      {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        skills: [
          { name: 'System Architecture', level: 'expert' },
          { name: 'DevOps', level: 'expert' },
          { name: 'Project Management', level: 'advanced' }
        ],
        department: 'Engineering',
        title: 'Technical Lead'
      }
    ];

    // Create users (password will be hashed by the pre-save hook)
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create demo project
    const demoProject = {
      name: 'E-Commerce Platform',
      description: 'Modern e-commerce platform with AI-powered recommendations',
      requirements: 'Build a scalable e-commerce platform with user authentication, product catalog, shopping cart, payment integration, and admin dashboard.',
      owner: createdUsers[0]._id,
      team: [
        { userId: createdUsers[0]._id, role: 'owner' },
        { userId: createdUsers[1]._id, role: 'developer' }
      ],
      selectedAgents: ['expert-programmer', 'python-expert', 'uiux-designer'],
      stages: ['planning', 'design', 'development', 'testing', 'deployment'],
      status: 'active',
      progress: 65,
      priority: 'high',
      tags: ['e-commerce', 'ai', 'web-app']
    };

    const project = new Project(demoProject);
    await project.save();
    
    // Add project to users' project lists
    for (const teamMember of demoProject.team) {
      await User.findByIdAndUpdate(teamMember.userId, {
        $push: { projects: project._id }
      });
    }
    
    console.log(`Created project: ${project.name}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('👤 Demo User: demo@example.com / demo123');
    console.log('👑 Admin User: admin@example.com / admin123');
    console.log('\n🚀 You can now login with these accounts!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase();

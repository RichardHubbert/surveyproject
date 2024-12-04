const mongoose = require('mongoose');

// Define Schemas
const surveySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  questions: [{
    id: String,
    type: { type: String, required: true },
    text: { type: String, required: true },
    options: [String],
    required: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const responseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  respondentId: { type: String, required: true },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  submittedAt: { type: Date, default: Date.now }
});

// Create models
const Survey = mongoose.model('Survey', surveySchema);
const Response = mongoose.model('Response', responseSchema);

// Database operations
const db = {
  // Survey operations
  surveys: {
    create: async (surveyData) => {
      const survey = new Survey(surveyData);
      return await survey.save();
    },

    getById: async (id) => {
      return await Survey.findById(id);
    },

    getByUser: async (userId) => {
      return await Survey.find({ userId });
    },

    update: async (id, updateData) => {
      return await Survey.findByIdAndUpdate(id, 
        { ...updateData, updatedAt: Date.now() },
        { new: true }
      );
    },

    delete: async (id) => {
      return await Survey.findByIdAndDelete(id);
    }
  },

  // Response operations
  responses: {
    create: async (responseData) => {
      const response = new Response(responseData);
      return await response.save();
    },

    getBySurvey: async (surveyId) => {
      return await Response.find({ surveyId });
    },

    getByRespondent: async (respondentId) => {
      return await Response.find({ respondentId });
    },

    delete: async (id) => {
      return await Response.findByIdAndDelete(id);
    }
  }
};

// Connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'surveyapp',
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  db,
  models: {
    Survey,
    Response
  }
};


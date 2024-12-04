const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const { connectDB, db, models } = require('./db');

// Initialize Firebase Admin with credentials
admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "surveyproject-803e9",
        "private_key_id": "69f4d847ca",
        "private_key": process.env.FIREBASE_PRIVATE_KEY,
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": process.env.FIREBASE_CERT_URL
    })
});

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow both ports
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Firebase Auth Middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        console.log('Verifying token:', token.substring(0, 20) + '...');
        
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Decoded token:', decodedToken);
        
        if (!decodedToken.uid) {
            throw new Error('No UID found in token');
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.body,
        query: req.query
    });
    next();
});

// Routes
app.post('/api/surveys', authenticateUser, async (req, res) => {
    try {
        console.log('Creating survey for user:', req.user.uid);
        
        const { questions, title } = req.body;
        const survey = new models.Survey({
            userId: req.user.uid,  // Use the UID from the decoded token
            title: title || 'New Survey',
            questions: questions.map(q => ({
                ...q,
                id: q.id || Math.random().toString(36).substr(2, 9)
            }))
        });

        const savedSurvey = await survey.save();
        console.log('Survey saved:', savedSurvey);
        
        res.status(201).json(savedSurvey);
    } catch (error) {
        console.error('Save Survey Error:', error);
        res.status(500).json({ 
            error: 'Failed to save survey', 
            details: error.message 
        });
    }
});

// New endpoint to create a survey and generate an ID
app.post('/api/surveys/create', authenticateUser, async (req, res) => {
    try {
        const { title } = req.body;  // Get the title from the request body
        const survey = new models.Survey({
            userId: req.user.uid,
            title: title || 'New Survey',  // Use the provided title or default
            questions: []
        });

        const savedSurvey = await survey.save();
        console.log('New survey created:', savedSurvey);

        res.status(201).json({ 
            surveyId: savedSurvey._id.toString()
        });
    } catch (error) {
        console.error('Create Survey Error:', error);
        res.status(500).json({ error: 'Failed to create survey', details: error.message });
    }
});

// Update existing survey endpoint to check user ownership
app.put('/api/surveys/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { questions, title } = req.body;

        const survey = await models.Survey.findOne({ _id: id, userId: req.user.uid });
        if (!survey) {
            return res.status(404).json({ error: 'Survey not found or unauthorized' });
        }

        survey.title = title || survey.title;
        survey.questions = questions;
        const updatedSurvey = await survey.save();

        res.status(200).json(updatedSurvey);
    } catch (error) {
        console.error('Update Survey Error:', error);
        res.status(500).json({ error: 'Failed to update survey', details: error.message });
    }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add a root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Survey API Server' });
});

// Add this new route to get all surveys for a user
app.get('/api/surveys', authenticateUser, async (req, res) => {
    try {
        const surveys = await models.Survey.find({ userId: req.user.uid })
            .sort({ createdAt: -1 }); // Sort by creation date, newest first
        res.json(surveys);
    } catch (error) {
        console.error('Get Surveys Error:', error);
        res.status(500).json({ error: 'Failed to fetch surveys', details: error.message });
    }
});

app.get('/api/surveys/:id/results', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching results for survey:', id);
    
    const survey = await models.Survey.findOne({ _id: id, userId: req.user.uid });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found or unauthorized' });
    }

    // For now, return a simple response to test the endpoint
    res.json({
      surveyId: id,
      responses: [] // We'll add actual responses later
    });
  } catch (error) {
    console.error('Get Survey Results Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch survey results', 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
connectDB().then(() => {
  const server = app.listen(PORT)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
        server.listen(PORT + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      console.log(`Server running on port ${server.address().port}`);
    });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

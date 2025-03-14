const express = require('express');
const cors = require('cors');
const LinkedInAutomation = require('./linkedin-automation');
const config = require('./config');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Store automation instance
let linkedInBot = null;
let isRunning = false;
let applicationStatus = {
  status: 'idle',
  message: 'Ready to start',
  appliedJobs: [],
  totalApplied: 0,
  errors: []
};

// Initialize LinkedIn automation
async function initializeAutomation() {
  try {
    if (linkedInBot) {
      await linkedInBot.close();
    }
    
    linkedInBot = new LinkedInAutomation();
    const initialized = await linkedInBot.init();
    
    if (!initialized) {
      throw new Error('Failed to initialize browser');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing automation:', error);
    applicationStatus.errors.push(`Initialization error: ${error.message}`);
    return false;
  }
}

// Start the application process
async function startApplicationProcess() {
  try {
    if (isRunning) {
      return { success: false, message: 'Application process already running' };
    }
    
    isRunning = true;
    applicationStatus = {
      status: 'running',
      message: 'Starting application process',
      appliedJobs: [],
      totalApplied: 0,
      errors: []
    };
    
    // Initialize automation
    const initialized = await initializeAutomation();
    if (!initialized) {
      throw new Error('Failed to initialize automation');
    }
    
    // Login to LinkedIn
    applicationStatus.message = 'Logging in to LinkedIn';
    const loggedIn = await linkedInBot.login();
    if (!loggedIn) {
      throw new Error('Failed to log in to LinkedIn');
    }
    
    // Apply to jobs
    applicationStatus.message = 'Searching and applying for jobs';
    await linkedInBot.applyToJobs();
    
    // Update status
    applicationStatus.status = 'completed';
    applicationStatus.message = 'Application process completed';
    applicationStatus.totalApplied = linkedInBot.applicationCount;
    
    return { success: true, message: 'Application process completed' };
  } catch (error) {
    console.error('Error in application process:', error);
    applicationStatus.status = 'error';
    applicationStatus.message = `Error: ${error.message}`;
    applicationStatus.errors.push(error.message);
    return { success: false, message: error.message };
  } finally {
    isRunning = false;
  }
}

// API Routes
app.get('/api/status', (req, res) => {
  res.json(applicationStatus);
});

app.post('/api/start', async (req, res) => {
  if (isRunning) {
    return res.status(400).json({ success: false, message: 'Application process already running' });
  }
  
  // Start the application process in the background
  startApplicationProcess().catch(error => {
    console.error('Error in background process:', error);
  });
  
  res.json({ success: true, message: 'Application process started' });
});

app.post('/api/stop', async (req, res) => {
  if (!isRunning || !linkedInBot) {
    return res.status(400).json({ success: false, message: 'No application process running' });
  }
  
  try {
    await linkedInBot.close();
    linkedInBot = null;
    isRunning = false;
    applicationStatus.status = 'stopped';
    applicationStatus.message = 'Application process stopped by user';
    
    res.json({ success: true, message: 'Application process stopped' });
  } catch (error) {
    console.error('Error stopping application process:', error);
    res.status(500).json({ success: false, message: `Error stopping process: ${error.message}` });
  }
});

app.get('/api/config', (req, res) => {
  // Return a sanitized version of the config (without credentials)
  const sanitizedConfig = {
    MAX_APPLICATIONS_PER_RUN: config.MAX_APPLICATIONS_PER_RUN,
    WAIT_TIME_BETWEEN_APPLICATIONS: config.WAIT_TIME_BETWEEN_APPLICATIONS,
    JOB_SEARCH_KEYWORDS: config.JOB_SEARCH_KEYWORDS,
    JOB_LOCATION: config.JOB_LOCATION,
    REMOTE_ONLY: config.REMOTE_ONLY,
    EASY_APPLY_ONLY: config.EASY_APPLY_ONLY,
    DATE_POSTED: config.DATE_POSTED,
    BLACKLISTED_COMPANIES: config.BLACKLISTED_COMPANIES,
    BLACKLISTED_KEYWORDS: config.BLACKLISTED_KEYWORDS
  };
  
  res.json(sanitizedConfig);
});

// Start the server
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to use the application`);
});

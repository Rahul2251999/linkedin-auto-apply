require('dotenv').config();

module.exports = {
  // LinkedIn credentials
  LINKEDIN_USERNAME: process.env.LINKEDIN_USERNAME || '',
  LINKEDIN_PASSWORD: process.env.LINKEDIN_PASSWORD || '',
  
  // Application settings
  MAX_APPLICATIONS_PER_RUN: parseInt(process.env.MAX_APPLICATIONS_PER_RUN || '10'),
  WAIT_TIME_BETWEEN_APPLICATIONS: parseInt(process.env.WAIT_TIME_BETWEEN_APPLICATIONS || '30000'), // 30 seconds
  
  // Job search criteria
  JOB_SEARCH_KEYWORDS: process.env.JOB_SEARCH_KEYWORDS || 'Software Engineer',
  JOB_LOCATION: process.env.JOB_LOCATION || 'United States',
  REMOTE_ONLY: process.env.REMOTE_ONLY === 'true',
  EASY_APPLY_ONLY: process.env.EASY_APPLY_ONLY === 'true',
  DATE_POSTED: process.env.DATE_POSTED || 'past_month', // past_24h, past_week, past_month
  
  // Application filters
  BLACKLISTED_COMPANIES: (process.env.BLACKLISTED_COMPANIES || '').split(',').filter(Boolean),
  BLACKLISTED_KEYWORDS: (process.env.BLACKLISTED_KEYWORDS || '').split(',').filter(Boolean),
  
  // Server settings
  PORT: parseInt(process.env.PORT || '3000'),
  
  // Profile data for applications
  PROFILE: {
    firstName: process.env.FIRST_NAME || '',
    lastName: process.env.LAST_NAME || '',
    email: process.env.EMAIL || '',
    phone: process.env.PHONE || '',
    location: process.env.LOCATION || '',
    yearsOfExperience: process.env.YEARS_OF_EXPERIENCE || '',
    education: process.env.EDUCATION || '',
    resumePath: process.env.RESUME_PATH || './resume.pdf',
  }
};

const LinkedInAutomation = require('./linkedin-automation');

// Create a sample resume file for testing
const fs = require('fs');
const path = require('path');

// Check if resume.pdf exists, if not create a placeholder file
const resumePath = path.join(__dirname, '..', 'resume.pdf');
if (!fs.existsSync(resumePath)) {
  console.log('Creating placeholder resume.pdf file for testing...');
  // This is just a placeholder. In a real scenario, the user would provide their actual resume
  fs.writeFileSync(resumePath, 'This is a placeholder resume file for testing purposes.');
}

// Main function to run the automation
async function main() {
  console.log('Starting LinkedIn Auto Apply test...');
  
  const bot = new LinkedInAutomation();
  
  try {
    // Initialize browser
    console.log('Initializing browser...');
    const initialized = await bot.init();
    if (!initialized) {
      throw new Error('Failed to initialize browser');
    }
    
    // Login to LinkedIn
    console.log('Logging in to LinkedIn...');
    const loggedIn = await bot.login();
    if (!loggedIn) {
      throw new Error('Failed to log in to LinkedIn');
    }
    
    // Search for jobs
    console.log('Searching for jobs...');
    const searchSuccess = await bot.searchJobs();
    if (!searchSuccess) {
      throw new Error('Failed to search for jobs');
    }
    
    // Get job listings
    console.log('Getting job listings...');
    const jobListings = await bot.getJobListings();
    console.log(`Found ${jobListings.length} job listings`);
    
    // Print job listings
    jobListings.forEach((job, index) => {
      console.log(`Job ${index + 1}: ${job.title} at ${job.company} (${job.location}) - Easy Apply: ${job.isEasyApply}`);
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close the browser
    await bot.close();
  }
}

// Run the test
main().catch(console.error);

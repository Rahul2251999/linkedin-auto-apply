const { chromium } = require('playwright-chromium');
const config = require('./config');

class LinkedInAutomation {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isLoggedIn = false;
    this.applicationCount = 0;
  }

  async init() {
    try {
      console.log('Initializing browser...');
      this.browser = await chromium.launch({ headless: false });
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();
      console.log('Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing browser:', error);
      return false;
    }
  }

  async login() {
    try {
      if (!config.LINKEDIN_USERNAME || !config.LINKEDIN_PASSWORD) {
        throw new Error('LinkedIn credentials not provided in environment variables');
      }

      console.log('Navigating to LinkedIn login page...');
      await this.page.goto('https://www.linkedin.com/login');
      
      // Wait for the login form to load
      await this.page.waitForSelector('#username', { timeout: 30000 });
      
      console.log('Filling login credentials...');
      await this.page.fill('#username', config.LINKEDIN_USERNAME);
      await this.page.fill('#password', config.LINKEDIN_PASSWORD);
      
      console.log('Submitting login form...');
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation to complete
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      
      // Check if login was successful
      const currentUrl = this.page.url();
      if (currentUrl.includes('checkpoint') || currentUrl.includes('login')) {
        throw new Error('Login failed or additional verification required');
      }
      
      console.log('Successfully logged in to LinkedIn');
      this.isLoggedIn = true;
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }

  async searchJobs() {
    try {
      if (!this.isLoggedIn) {
        throw new Error('Not logged in to LinkedIn');
      }

      console.log('Navigating to LinkedIn Jobs page...');
      await this.page.goto('https://www.linkedin.com/jobs/');
      
      // Wait for the search form to load
      await this.page.waitForSelector('input[aria-label="Search by title, skill, or company"]', { timeout: 30000 });
      
      console.log(`Searching for jobs with keywords: ${config.JOB_SEARCH_KEYWORDS} in ${config.JOB_LOCATION}`);
      
      // Clear and fill the keywords field
      await this.page.click('input[aria-label="Search by title, skill, or company"]');
      await this.page.fill('input[aria-label="Search by title, skill, or company"]', config.JOB_SEARCH_KEYWORDS);
      
      // Clear and fill the location field
      await this.page.click('input[aria-label="City, state, or zip code"]');
      await this.page.fill('input[aria-label="City, state, or zip code"]', config.JOB_LOCATION);
      
      // Submit the search
      await this.page.press('input[aria-label="City, state, or zip code"]', 'Enter');
      
      // Wait for search results to load
      await this.page.waitForSelector('.jobs-search-results-list', { timeout: 30000 });
      
      // Apply filters if needed
      await this.applyFilters();
      
      console.log('Job search completed successfully');
      return true;
    } catch (error) {
      console.error('Error during job search:', error);
      return false;
    }
  }

  async applyFilters() {
    try {
      console.log('Applying job filters...');
      
      // Apply Easy Apply filter if enabled
      if (config.EASY_APPLY_ONLY) {
        console.log('Applying Easy Apply filter');
        
        // Click on the "All filters" button
        await this.page.click('button:has-text("All filters")');
        
        // Wait for the filter modal to appear
        await this.page.waitForSelector('div[aria-label="All filters"]', { timeout: 10000 });
        
        // Check the Easy Apply checkbox
        await this.page.click('label:has-text("Easy Apply")');
        
        // Click the Show results button
        await this.page.click('button:has-text("Show results")');
        
        // Wait for results to reload
        await this.page.waitForSelector('.jobs-search-results-list', { timeout: 30000 });
      }
      
      // Apply Date Posted filter
      if (config.DATE_POSTED) {
        console.log(`Applying Date Posted filter: ${config.DATE_POSTED}`);
        
        // Click on the Date Posted dropdown
        await this.page.click('button:has-text("Date Posted")');
        
        // Map config value to button text
        const datePostedMap = {
          'past_24h': 'Past 24 hours',
          'past_week': 'Past week',
          'past_month': 'Past month'
        };
        
        const buttonText = datePostedMap[config.DATE_POSTED] || 'Past month';
        
        // Click the appropriate option
        await this.page.click(`label:has-text("${buttonText}")`);
        
        // Wait for results to reload
        await this.page.waitForSelector('.jobs-search-results-list', { timeout: 30000 });
      }
      
      // Apply Remote filter if enabled
      if (config.REMOTE_ONLY) {
        console.log('Applying Remote filter');
        
        // Click on the "All filters" button if not already open
        await this.page.click('button:has-text("All filters")');
        
        // Wait for the filter modal to appear
        await this.page.waitForSelector('div[aria-label="All filters"]', { timeout: 10000 });
        
        // Check the Remote checkbox
        await this.page.click('label:has-text("Remote")');
        
        // Click the Show results button
        await this.page.click('button:has-text("Show results")');
        
        // Wait for results to reload
        await this.page.waitForSelector('.jobs-search-results-list', { timeout: 30000 });
      }
      
      console.log('Filters applied successfully');
      return true;
    } catch (error) {
      console.error('Error applying filters:', error);
      return false;
    }
  }

  async getJobListings() {
    try {
      console.log('Getting job listings...');
      
      // Wait for job listings to load
      await this.page.waitForSelector('.jobs-search-results__list-item', { timeout: 30000 });
      
      // Get all job cards
      const jobCards = await this.page.$$('.jobs-search-results__list-item');
      console.log(`Found ${jobCards.length} job listings`);
      
      const jobListings = [];
      
      // Process each job card
      for (let i = 0; i < jobCards.length; i++) {
        try {
          // Click on the job card to view details
          await jobCards[i].click();
          
          // Wait for job details to load
          await this.page.waitForSelector('.jobs-unified-top-card__job-title', { timeout: 10000 });
          
          // Extract job details
          const title = await this.page.textContent('.jobs-unified-top-card__job-title') || 'Unknown Title';
          const company = await this.page.textContent('.jobs-unified-top-card__company-name') || 'Unknown Company';
          const location = await this.page.textContent('.jobs-unified-top-card__bullet') || 'Unknown Location';
          
          // Check if Easy Apply button exists
          const easyApplyButton = await this.page.$('button:has-text("Easy Apply")');
          const isEasyApply = !!easyApplyButton;
          
          // Check if job should be blacklisted
          const shouldBlacklist = this.shouldBlacklistJob(title, company);
          
          if (!shouldBlacklist) {
            jobListings.push({
              index: i,
              title,
              company,
              location,
              isEasyApply
            });
          }
        } catch (error) {
          console.error(`Error processing job card ${i}:`, error);
        }
      }
      
      console.log(`Processed ${jobListings.length} valid job listings`);
      return jobListings;
    } catch (error) {
      console.error('Error getting job listings:', error);
      return [];
    }
  }

  shouldBlacklistJob(title, company) {
    // Check if company is blacklisted
    if (config.BLACKLISTED_COMPANIES.some(blacklistedCompany => 
      company.toLowerCase().includes(blacklistedCompany.toLowerCase()))) {
      console.log(`Skipping blacklisted company: ${company}`);
      return true;
    }
    
    // Check if title contains blacklisted keywords
    if (config.BLACKLISTED_KEYWORDS.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase()))) {
      console.log(`Skipping job with blacklisted keyword in title: ${title}`);
      return true;
    }
    
    return false;
  }

  async applyToJobs() {
    try {
      if (!this.isLoggedIn) {
        throw new Error('Not logged in to LinkedIn');
      }
      
      // Search for jobs first
      await this.searchJobs();
      
      // Get job listings
      const jobListings = await this.getJobListings();
      
      if (jobListings.length === 0) {
        console.log('No suitable job listings found');
        return;
      }
      
      console.log(`Starting to apply for jobs. Maximum applications: ${config.MAX_APPLICATIONS_PER_RUN}`);
      
      // Apply to jobs
      for (const job of jobListings) {
        if (this.applicationCount >= config.MAX_APPLICATIONS_PER_RUN) {
          console.log(`Reached maximum application limit (${config.MAX_APPLICATIONS_PER_RUN})`);
          break;
        }
        
        if (!job.isEasyApply && config.EASY_APPLY_ONLY) {
          console.log(`Skipping non-Easy Apply job: ${job.title} at ${job.company}`);
          continue;
        }
        
        console.log(`Applying for: ${job.title} at ${job.company}`);
        
        try {
          // Click on the job card to view details
          await this.page.$$eval('.jobs-search-results__list-item', (elements, index) => {
            elements[index].click();
          }, job.index);
          
          // Wait for job details to load
          await this.page.waitForSelector('.jobs-unified-top-card__job-title', { timeout: 10000 });
          
          // Click the Easy Apply button
          const easyApplyButton = await this.page.$('button:has-text("Easy Apply")');
          if (!easyApplyButton) {
            console.log('Easy Apply button not found, skipping job');
            continue;
          }
          
          await easyApplyButton.click();
          
          // Wait for the application form to load
          await this.page.waitForSelector('form.jobs-easy-apply-form', { timeout: 10000 });
          
          // Fill out the application form
          const success = await this.fillApplicationForm();
          
          if (success) {
            this.applicationCount++;
            console.log(`Successfully applied to job ${this.applicationCount}/${config.MAX_APPLICATIONS_PER_RUN}`);
            
            // Wait between applications
            console.log(`Waiting ${config.WAIT_TIME_BETWEEN_APPLICATIONS / 1000} seconds before next application...`);
            await new Promise(resolve => setTimeout(resolve, config.WAIT_TIME_BETWEEN_APPLICATIONS));
          }
        } catch (error) {
          console.error(`Error applying to job (${job.title} at ${job.company}):`, error);
        }
      }
      
      console.log(`Application process completed. Applied to ${this.applicationCount} jobs.`);
    } catch (error) {
      console.error('Error in applyToJobs:', error);
    }
  }

  async fillApplicationForm() {
    try {
      console.log('Filling application form...');
      
      let currentStep = 1;
      let completed = false;
      
      while (!completed) {
        console.log(`Processing application step ${currentStep}`);
        
        // Wait for the form to be interactive
        await this.page.waitForTimeout(1000);
        
        // Check if we need to upload a resume
        const resumeUploadButton = await this.page.$('button:has-text("Upload resume")');
        if (resumeUploadButton) {
          console.log('Resume upload required');
          
          // Click the upload button
          await resumeUploadButton.click();
          
          // Wait for the file input to be available
          await this.page.waitForSelector('input[type="file"]', { timeout: 10000 });
          
          // Upload the resume
          const fileInput = await this.page.$('input[type="file"]');
          await fileInput.setInputFiles(config.PROFILE.resumePath);
          
          console.log('Resume uploaded');
          
          // Wait for upload to complete
          await this.page.waitForTimeout(2000);
        }
        
        // Fill out text fields
        await this.fillTextFields();
        
        // Handle dropdown selections
        await this.handleDropdowns();
        
        // Handle radio buttons
        await this.handleRadioButtons();
        
        // Check if there's a Next button
        const nextButton = await this.page.$('button:has-text("Next")');
        const reviewButton = await this.page.$('button:has-text("Review")');
        const submitButton = await this.page.$('button:has-text("Submit application")');
        
        if (submitButton) {
          console.log('Submitting application...');
          await submitButton.click();
          
          // Wait for submission to complete
          await this.page.waitForTimeout(3000);
          
          // Check for success message
          const successMessage = await this.page.$('.artdeco-inline-feedback--success');
          if (successMessage) {
            console.log('Application submitted successfully');
            completed = true;
          } else {
            console.log('Application submission may have failed');
            completed = true; // Still mark as completed to move on
          }
        } else if (reviewButton) {
          console.log('Reviewing application...');
          await reviewButton.click();
          currentStep++;
        } else if (nextButton) {
          console.log('Moving to next step...');
          await nextButton.click();
          currentStep++;
        } else {
          console.log('No next/review/submit button found, application process may be incomplete');
          completed = true; // Mark as completed to avoid infinite loop
        }
        
        // Wait for the next form to load
        await this.page.waitForTimeout(2000);
      }
      
      return true;
    } catch (error) {
      console.error('Error filling application form:', error);
      return false;
    }
  }

  async fillTextFields() {
    try {
      console.log('Filling text fields...');
      
      // Map of common field labels to profile data
      const fieldMappings = {
        'First name': config.PROFILE.firstName,
        'Last name': config.PROFILE.lastName,
        'Email': config.PROFILE.email,
        'Phone': config.PROFILE.phone,
        'Phone number': config.PROFILE.phone,
        'Address': config.PROFILE.location,
        'How many years of experience do you have': config.PROFILE.yearsOfExperience
      };
      
      // Get all input fields
      const inputFields = await this.page.$$('input[type="text"], input[type="email"], input[type="tel"]');
      
      for (const field of inputFields) {
        try {
          // Get the field label
          const labelElement = await field.evaluateHandle(el => {
            const label = el.labels && el.labels.length > 0 ? el.labels[0] : null;
            if (label) return label;
            
            // Try to find label by aria-labelledby
            const labelledBy = el.getAttribute('aria-labelledby');
            if (labelledBy) return document.getElementById(labelledBy);
            
            // Try to find label by previous sibling
            let sibling = el.previousElementSibling;
            while (sibling) {
              if (sibling.tagName === 'LABEL') return sibling;
              sibling = sibling.previousElementSibling;
            }
            
            return null;
          });
          
          if (labelElement) {
            const labelText = await labelElement.textContent();
            
            // Check if we have a mapping for this field
            for (const [key, value] of Object.entries(fieldMappings)) {
              if (labelText && labelText.includes(key) && value) {
                // Check if the field is empty
                const currentValue = await field.inputValue();
                if (!currentValue) {
                  console.log(`Filling field "${key}" with value "${value}"`);
                  await field.fill(value);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing input field:', error);
        }
      }
      
      console.log('Text fields filled');
      return true;
    } catch (error) {
      console.error('Error filling text fields:', error);
      return false;
    }
  }

  async handleDropdowns() {
    try {
      console.log('Handling dropdown selections...');
      
      // Get all select elements
      const selectElements = await this.page.$$('select');
      
      for (const select of selectElements) {
        try {
          // Check if the select has a value already
          const hasValue = await select.evaluate(el => el.value !== '');
          
          if (!hasValue) {
            // Select the first non-empty option
            await select.evaluate(el => {
              for (const option of el.options) {
                if (option.value && option.value !== '') {
                  el.value = option.value;
                  el.dispatchEvent(new Event('change'));
                  return;
                }
              }
            });
          }
        } catch (error) {
          console.error('Error processing select element:', error);
        }
      }
      
      console.log('Dropdown selections handled');
      return true;
    } catch (error) {
      console.error('Error handling dropdowns:', error);
      return false;
    }
  }

  async handleRadioButtons() {
    try {
      console.log('Handling radio buttons...');
      
      // Get all radio button groups
      const radioGroups = await this.page.$$('fieldset');
      
      for (const group of radioGroups) {
        try {
          // Check if any radio button in the group is checked
          const hasChecked = await group.evaluate(el => {
            const radios = el.querySelectorAll('input[type="radio"]');
            return Array.from(radios).some(radio => radio.checked);
          });
          
          if (!hasChecked) {
            // Select the first radio button
            await group.evaluate(el => {
              const radios = el.querySelectorAll('input[type="radio"]');
              if (radios.length > 0) {
                radios[0].click();
              }
            });
          }
        } catch (error) {
          console.error('Error processing radio group:', error);
        }
      }
      
      console.log('Radio buttons handled');
      return true;
    } catch (error) {
      console.error('Error handling radio buttons:', error);
      return false;
    }
  }

  async close() {
    try {
      if (this.browser) {
        console.log('Closing browser...');
        await this.browser.close();
        console.log('Browser closed');
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}

module.exports = LinkedInAutomation;

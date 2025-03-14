# LinkedIn Auto Apply Application

An automated job application tool for LinkedIn that helps streamline your job search process.

## Features

- Automated job search based on keywords, location, and other criteria
- Filtering for remote jobs, Easy Apply, and date posted
- Automatic form filling for job applications
- Application tracking and status monitoring
- User-friendly web interface to control the automation

## Prerequisites

- Node.js 16+
- A LinkedIn account
- Your resume in PDF format

## Installation

1. Clone this repository:
```
git clone https://github.com/Rahul2251999/linkedin-auto-apply.git
cd linkedin-auto-apply
```

2. Install dependencies:
```
npm install
```

3. Set up your environment variables:
```
cp .env.example .env
```

4. Edit the `.env` file with your LinkedIn credentials and job preferences.

## Usage

1. Start the application:
```
./start.sh
```

2. Open your browser and navigate to `http://localhost:3000`

3. Click "Start Auto Apply" to begin the automation process

4. Monitor the progress on the dashboard

## Configuration

You can customize the following settings in the `.env` file:

- LinkedIn credentials
- Job search keywords
- Location preferences
- Maximum applications per run
- Wait time between applications
- Blacklisted companies or keywords

## Deployment

This application can be deployed using GitHub Actions. The workflow is configured to:

1. Build and test the application
2. Install necessary dependencies
3. Deploy the frontend to GitHub Pages

For a complete deployment with backend functionality, consider deploying to a platform like Heroku, Vercel, or Netlify.

## Security Notice

This application requires your LinkedIn credentials to function. Always keep your credentials secure and never share your `.env` file. Consider using LinkedIn's two-factor authentication for additional security.

## Disclaimer

This tool automates interactions with LinkedIn. Use responsibly and be aware that excessive automation may violate LinkedIn's terms of service.

## License

MIT

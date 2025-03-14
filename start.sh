#!/bin/bash

# Create a sample PDF resume for testing
echo "Creating sample resume.pdf for testing..."
echo "This is a sample resume for testing the LinkedIn Auto Apply application.

Name: John Doe
Email: john.doe@example.com
Phone: 555-123-4567
Location: San Francisco, CA

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2014-2018

EXPERIENCE
Software Engineer
Tech Solutions Inc., 2020-Present
- Developed web applications using React and Node.js
- Implemented RESTful APIs and database integrations
- Collaborated with cross-functional teams to deliver projects

Junior Developer
WebDev Co., 2018-2020
- Assisted in frontend development using HTML, CSS, and JavaScript
- Participated in code reviews and testing
- Supported maintenance of existing applications

SKILLS
- JavaScript, React, Node.js
- Python, Django
- HTML, CSS
- Git, GitHub
- MongoDB, PostgreSQL
- Docker, AWS
" > resume.pdf

echo "Sample resume created successfully."

# Start the server
echo "Starting LinkedIn Auto Apply server..."
node src/server.js

**Project Overview**

This is a web-based book borrowing system where users can list their books and borrow books from others. It includes user authentication, book search functionality, notifications for requests, and real-time request handling.

**The system supports**

1. User registration and authentication
2. Adding and viewing books
3. Sending and receiving borrowing requests
4. Notifications of new requests and actions
5. Managing book listings

**Features**

1. User Authentication: Sign up, log in, password recovery, email verification.
2. Book Listings: Users can add books and view available books listed by others.
3. Book Requests: Borrowers can send requests to borrow books, and owners can accept or reject requests.
4. Notifications: Real-time notifications for requests and status updates.
5. Responsive Design: Mobile-friendly interface with a responsive dashboard and profile pages.
6. Search Functionality: Search for books by title or author.
   
**Tech Stack**

1. Backend: Node.js, Express.js, MongoDB, Mongoose
2. Frontend: HTML, CSS, JavaScript, EJS
3. Authentication: Passport.js
4. File Storage: Firebase Storage (for book and user profile images)
5. Deployment: Render

**Installation**

1. Clone this repository

2. Install the dependencies:
  
   `cd Share-Reads-WebAPP`

   `npm install`


**Environment Variables**

Create a .env file in the root directory and add the following environment variables:

`DB_CONNECTION = your_mongo_db_connection_string`

`GMAIL = your_email_for_sending_verification_code_to_user`

`APP_PASSWORD = your_email_app_password`

`FIREBASE_PROJECT_ID = your_firebase_project_id`

`FIREBASE_CLIENT_EMAIL = your_firebase_client_email`

`FIREBASE_PRIVATE_KEY = your_firebase_private_key`

`FIREBASE_BUCKET_URL = your_firebase_bucket_url`

**Usage**

1. Start the server:
  
   `node app.js`

2. Visit http://localhost:3000 in your browser to view the site.

**Contributing**

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.


# Event Manager API

## Overview
The Event Manager API allows users to create, manage, and register for events. It includes features for user authentication, event creation, updating, deletion, and attendance verification with email notifications.

## Live Demo
The API is deployed and accessible at:
```
https://event-manager-api-c7eq.onrender.com
```

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-manager-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_LIFETIME=1d
   EMAIL_USERNAME=your_email_username
   EMAIL_PASSWORD=your_email_password
   EMAIL_HOST=your_email_host
   EMAIL_PORT=your_email_port
   ```

4. **Start the server**
   ```bash
   node app.js
   ```
   
   For development with auto-restart:
   ```bash
   npx nodemon app.js
   ```

5. **Access the API**
   The API will be available at `http://localhost:5000/api/v1`

## Base URL
```
https://event-manager-api-c7eq.onrender.com/api/v1
```

## Authentication
The API uses token-based authentication. After login, you'll receive a token that should be included in subsequent requests.

## Endpoints

### User Management

#### Register New User
Register a new user account with email verification.

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
    "email": "example@gmail.com",
    "name": "username",
    "password": "password123456"
}
```

**Response:**
```json
{
    "msg": "Success! Please check your email to verify account"
}
```

#### Login Existing User
Authenticate and receive user details.

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
    "email": "example@gmail.com",
    "password": "password1234"
}
```

**Response:**
```json
{
    "user": {
        "name": "username",
        "userId": "67c5dbffd463677a33d09488",
        "role": "admin"
    }
}
```

### Event Management

#### Create a New Event
Create a new event with details including price tiers.

**Endpoint:** `POST /event/createEvent`

**Request:**
```json
{
  "title": "Startup Founders Meetup",
  "description": "An exclusive networking event for startup founders and investors.",
  "date": "2025-05-15T19:00:00.000Z",
  "location": "San Francisco, CA",
  "type": "private",
  "ticketPrice": 50,
  "ticketTiers": {
    "regular": 50,
    "vip": 120
  }
}
```

**Response:**
```json
{
    "message": "Event created successfully",
    "event": {
        "title": "Startup Founders Meetup",
        "description": "An exclusive networking event for startup founders and investors.",
        "date": "2025-05-15T19:00:00.000Z",
        "location": "San Francisco, CA",
        "type": "private",
        "organizer": "67c5dbffd463677a33d09488",
        "attendees": [],
        "ticketPrice": 50,
        "ticketTiers": {
            "regular": 50,
            "vip": 120
        },
        "_id": "67c9a6c2c1d7484997b055bc",
        "createdAt": "2025-03-06T13:44:34.030Z",
        "__v": 0
    }
}
```

#### Get All Events
Retrieve all public events and the user's private events.

**Endpoint:** `GET /event/getUserEvents`

**Response:**
```json
{
    "message": "Events fetched successfully",
    "events": [
        {
            "ticketTiers": {
                "regular": 50,
                "vip": 100
            },
            "_id": "67c5df264447dbf296b0d8b1",
            "title": "Tech Conference 2023",
            "description": "Annual tech conference for developers",
            "date": "2023-12-15T09:00:00.000Z",
            "location": "San Francisco, CA",
            "type": "public",
            "organizer": {
                "_id": "67c5dbffd463677a33d09488",
                "name": "anjali",
                "email": "govindwar.anjali@gmail.com"
            },
            "attendees": [
                "67c5e4e0b3bc446cc422941b"
            ],
            "ticketPrice": 50,
            "createdAt": "2025-03-03T16:56:06.318Z",
            "__v": 1
        },
        // Additional events...
    ]
}
```

#### Delete Event
Delete an event and notify all registered attendees via email.

**Endpoint:** `DELETE /event/deleteEvent/:eventId`

**Response:**
```json
{
    "message": "Event deleted successfully"
}
```

#### Update Event
Update an event's details and notify all registered attendees.

**Endpoint:** `PUT /event/updateEvent/:eventId`

**Request:**
```json
{
  "title": "Updated Startup Founders Meetup",
  "description": "Updated description for the Startup Founders Meetup",
  "ticketPrice": 70
}
```

**Response:**
```json
{
    "message": "Event updated successfully",
    "event": {
        "ticketTiers": {
            "regular": 50,
            "vip": 120
        },
        "_id": "67c9a6c2c1d7484997b055bc",
        "title": "Updated Startup Founders Meetup",
        "description": "Updated description for the Startup Founders Meetup",
        "date": "2025-05-15T19:00:00.000Z",
        "location": "San Francisco, CA",
        "type": "private",
        "organizer": "67c5dbffd463677a33d09488",
        "attendees": [],
        "ticketPrice": 70,
        "createdAt": "2025-03-06T13:44:34.030Z",
        "__v": 0
    }
}
```

### Event Registration and Attendance

#### Register for an Event
Register for an event and select a ticket tier.

**Endpoint:** `POST /event/registerEvent/:eventId`

**Request:**
```json
{ 
  "tier": "vip" 
}
```

**Response:**
```json
{
    "message": "Registration successful. Show this QR code to the organizer.",
    "verificationLink": "https://event-manager-api-c7eq.onrender.com/api/v1/event/verify/67c9a959c1d7484997b055cf",
    "ticketId": "67c9a959c1d7484997b055cf",
    "price": 120
}
```

> Note: The verification link will be scanned by the organizer to verify attendance of the user.

#### Verify Attendance
Organizers verify attendee presence by accessing the verification link.

**Endpoint:** `PATCH /event/verify/:ticketId`

**Response:**
```json
{
    "message": "Attendance verified successfully.",
    "event": "Updated Startup Founders Meetup",
    "user": "anjali"
}
```

### Event Search and Filtering

#### Filter Events by Location and Type
Search for events based on location and event type.

**Endpoint:** `GET /event/search?location=Los&type=public`

**Response:**
```json
{
    "message": "Events retrieved successfully",
    "count": 1,
    "events": [
        {
            "ticketTiers": {
                "regular": 75,
                "vip": 150
            },
            "_id": "67c5e7e67179ffc0c9ae2c5e",
            "title": "Updated Music Event",
            "description": "Updated description for the tech conference",
            "date": "2023-11-25T18:00:00.000Z",
            "location": "Los Angeles, CA",
            "type": "public",
            "organizer": {
                "_id": "67c5e4e0b3bc446cc422941b",
                "name": "ayush",
                "email": "swayush.govindwar@gmail.com"
            },
            "attendees": [
                "67c5e4e0b3bc446cc422941b"
            ],
            "ticketPrice": 60,
            "createdAt": "2025-03-03T17:33:26.213Z",
            "__v": 1
        }
    ]
}
```

#### Sort Events by Date
Sort events by their scheduled date.

**Endpoint:** `GET /event/search?lsort=date`

**Response:**
```json
{
    "message": "Events retrieved successfully",
    "count": 3,
    "events": [
        // Events sorted by date
    ]
}
```

#### Get User Registered Events
Retrieve all events the current user has registered for.

**Endpoint:** `GET /event/getRegisteredEvents`

**Response:**
```json
{
    "registeredEvents": [
        {
            "eventId": "67c9a6c2c1d7484997b055bc",
            "title": "Updated Startup Founders Meetup",
            "date": "2025-05-15T19:00:00.000Z",
            "location": "San Francisco, CA",
            "tier": "vip",
            "price": 120
        }
    ]
}
```

## Dependencies
- express: Web framework
- mongoose: MongoDB object modeling
- jsonwebtoken: JWT implementation for authentication
- bcryptjs: Password hashing
- nodemailer: Email sending functionality
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- validator: Input validation
- cookie-parser: Parse cookies
- razorpay: Payment integration

## Error Handling
The API returns appropriate HTTP status codes along with error messages in JSON format.


## Feature Highlights
- Security measures have been implimented to avoid Cross-Site Scripting (XSS) along with DDos attacks by the 
  use of rate limiter.
- User authentication with email verification
- Event creation with ticket tier pricing
- Email notifications for event updates and deletions
- QR code-based attendance verification
- Event filtering and sorting capabilities
- User registration tracking
- Organisers can only edit their own events.





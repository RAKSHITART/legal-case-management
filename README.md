Got it 👍 Clean, professional, and without icons. No major content changes — just proper formatting.

---

# Legal Case Management System

A comprehensive full-stack web application for attorneys and legal professionals to efficiently manage cases, clients, schedules, and legal documents with real-time data visualization.

---

## Features

### User Authentication

- Secure registration with professional details (name, email, phone, office address, working hours)
- JWT-based login system with password encryption
- Profile management with editable information

---

### Interactive Dashboard

#### KPI Cards

- Total Cases
- Active Cases
- Completion Rate
- Notifications

#### 5 Dynamic Charts

- Cases by Priority – Bar chart (Low, Medium, High, Emergency)
- Cases by Status – Pie chart (Open, Progress, Closed)
- Cases by Practice Area – Horizontal bar chart
- Case Activity Timeline – Area chart (Monthly trends)
- Cases by Outcome – Donut chart (Won, Lost, Settled)

#### Upcoming Hearings

Color-coded table:

- Red = Today
- Yellow = This Week
- Blue = Scheduled

#### Recent Cases

Quick access to the latest cases.

---

### Case Management

- Full CRUD operations (Create, Read, Update, Delete)
- Detailed case information including:
  - Case number, title, client
  - Practice area
  - Priority (Low, Medium, High, Emergency)
  - Status (Open, Progress, Closed)
  - Outcome (Won, Lost, Settled, In Progress, Dismissed)
  - Hearing date and time
  - Court location
  - Judge and opposing party details

- PDF generation for case summaries
- Search, filter, and pagination support

---

### Client Management

- Maintain client database with name, email, phone, address, profession, company
- View all cases associated with each client
- Business logic enforcement: Cannot delete clients with active cases
- Search functionality

---

### Calendar Integration

- Monthly, weekly, and daily views
- Click hearings to navigate directly to case details
- Visual indicators for upcoming hearings

---

### Notification System

- Automatic notifications for:
  - Upcoming hearings
  - Emergency priority cases
  - Case status changes

- Real-time notification counter
- Mark-as-read functionality

---

### Profile Management

- View and edit personal information
- Update working hours
- Account statistics overview

---

## Tech Stack

### Frontend

- React 18
- React Router DOM 6
- Recharts
- FullCalendar
- Axios
- React Hot Toast
- React Icons
- Tailwind CSS
- React Modal

---

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcryptjs
- PDFKit
- CORS
- Dotenv

---

## Project Structure

```
legal-case-management/
│
├── backend/
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── CaseController.js
│   │   ├── clientController.js
│   │   ├── DashboardController.js
│   │   ├── fileController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Case.js
│   │   ├── Client.js
│   │   ├── Notification.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── caseRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── fileRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   └── addTestData.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── Sidebar.js
│   │   │   └── Topbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── CalendarPage.js
│   │   │   ├── CaseDetails.js
│   │   │   ├── Cases.js
│   │   │   ├── Clients.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Notifications.js
│   │   │   ├── Profile.js
│   │   │   ├── Register.js
│   │   │   └── Tasks.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .gitignore
│   ├── package.json
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
Installation Guide
Prerequisites

Node.js (v14 or higher)

MongoDB (local installation or MongoDB Atlas account)

npm or yarn package manager

Step 1: Clone the Repository
git clone https://github.com/yourusername/legal-case-management.git
cd legal-case-management
Step 2: Backend Setup
cd backend
npm install

Create a .env file inside the backend folder:

PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/legal_case_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development

Start the backend server:

npm run dev
Step 3: Frontend Setup
cd frontend
npm install
npm start
Step 4: Access the Application

Frontend:

http://localhost:3000

Backend API:

http://localhost:5000
Environment Variables

Create a .env file in the backend folder:

# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection (Local)
MONGODB_URI=mongodb://127.0.0.1:27017/legal_case_management

# MongoDB Atlas (Example)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/legal_case_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
Usage Guide
Registration

Navigate to /register

Fill in professional details:

Full Name

Email

Password

Phone Number

Office Address

Working Hours

Login

Use registered email and password

JWT token is automatically stored for authenticated requests

Dashboard

View KPI cards for quick statistics

Analyze cases through 5 different charts

Check upcoming hearings (color-coded by urgency)

Review recent cases

Managing Cases

Go to Cases in the sidebar

Click Add New Case

Fill in required details (client must exist first)

Use search and filters to find cases

Click the eye icon to view case details

Download PDF summary from case details page

Edit or delete cases as needed

Managing Clients

Navigate to Clients

Add new clients with complete information

View all cases associated with each client

Edit or delete client information
(Cannot delete clients with active cases)

Calendar

View all hearing dates in calendar format

Switch between month, week, and day views

Click on any hearing to view case details

Notifications

Bell icon shows unread notification count

Click to view all notifications

Mark as read individually or all at once

Profile

Update personal information

Modify working hours

View account statistics

API Documentation

Authentication Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/auth/me	Get current user
PUT	/api/auth/profile	Update profile

Case Endpoints
Method	Endpoint	Description
GET	/api/cases	Get all cases
POST	/api/cases	Create new case
GET	/api/cases/:id	Get single case
PUT	/api/cases/:id	Update case
DELETE	/api/cases/:id	Delete case

Client Endpoints
Method	Endpoint	Description
GET	/api/clients	Get all clients
POST	/api/clients	Create new client
GET	/api/clients/:id	Get single client
PUT	/api/clients/:id	Update client
DELETE	/api/clients/:id	Delete client

Dashboard Endpoints
Method	Endpoint	Description
GET	/api/dashboard/stats	Get dashboard statistics
GET	/api/dashboard/calendar	Get calendar events
File Endpoints
Method	Endpoint	Description
GET	/api/files/cases/:id/download	Download case PDF

Notification Endpoints
Method	Endpoint	Description
GET	/api/notifications	Get notifications
PUT	/api/notifications/:id/read	Mark notification as read
PUT	/api/notifications/read-all	Mark all as read
DELETE	/api/notifications/:id	Delete notification

License
This project is licensed under the MIT License.
```

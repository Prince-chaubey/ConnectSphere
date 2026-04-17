# 🌏 ConnectSphere

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)

**ConnectSphere** is a premium collaborative ecosystem designed for creators, developers, and entrepreneurs. It bridges the gap between project ideas and talented builders, streamlining the recruitment process through AI-powered insights and a modern, high-performance interface.

---

## ✨ Key Features

### 🚀 For Creators & Project Leads
- **Multiplex Project Creation:** Post projects with granular roles, each with specific skill requirements and member counts.
- **AI Resume Shortlisting:** Automate the screening phase. The system analyzes PDF resumes against role requirements to provide a match score and detailed strengths/gaps analysis.
- **Centralized Admin Dashboard:** Manage all projects, track application statuses (Pending/Accepted/Rejected), and view applicant profiles in one place.
- **Dynamic Applicant Tracking:** Receive real-time insights into who is applying and their suitability for specific roles.

### 🛠 For Builders & Applicants
- **Intelligent Project Discovery:** Search and filter through high-quality projects (Open Source, Freelancing, Startups).
- **One-Click Applications:** Apply to specific roles with your resume and a customized cover letter.
- **Application Tracking:** Monitor the status of all your applications and receive email notifications for updates.
- **Developer Profiles:** Showcase your skills, experience, and historical contributions to potential collaborators.

### 🛡 Core System Features
- **Secure Authentication:** JWT-based auth with secure password hashing and OTP-based password recovery.
- **Email Automation:** Automated transactional emails via Nodemailer for confirmations and status changes.
- **Cloud Infrastructure:** Integrated with Cloudinary for seamless high-performance image and document storage.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 (Functional Components, Hooks)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 (Modern utility-first CSS)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Routing:** React Router DOM 7

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** MongoDB with Mongoose ODM
- **Authenticaion:** JSON Web Tokens (JWT) & Bcrypt
- **File Handling:** Multer & Cloudinary
- **Email:** Nodemailer

---

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account (for file uploads)
- Gmail account (for Nodemailer)

### 1. Clone the Repository
```bash
git clone https://github.com/Prince-chaubey/ConnectIn.git
cd ConnectSphere
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```
Create a `.env` file in the `Frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚦 Running the Application

### Start Backend
```bash
cd Backend
npm start
```

### Start Frontend
```bash
cd Frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🛣 API Routes (Overview)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user |
| **POST** | `/api/auth/login` | Authenticate user & get token |
| **GET** | `/api/projects` | Fetch all open projects |
| **POST** | `/api/projects` | Create a new project (Creators) |
| **POST** | `/api/projects/:id/apply` | Apply for a role in a project |
| **GET** | `/api/projects/my-projects` | Get projects created by the user |
| **POST** | `/api/projects/analyze/:id` | Trigger AI resume analysis |

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact
Project Link: [https://github.com/Prince-chaubey/ConnectIn](https://github.com/Prince-chaubey/ConnectIn)


+


# 🏥 CareConnect - Hospital Management System

**CareConnect** is a high-fidelity, secure, and intuitive web application designed for seamless hospital appointment scheduling and patient management. This platform bridges the gap between expert medical professionals and patients, providing a premium user experience for booking appointments, managing health records, and accessing care from anywhere.

---

## 📌 Project Details
- **Objective**: Build a world-class, responsive hospital management system that simplifies the appointment booking process for both patients and doctors.
- **Key Modules**: Role-Based Dashboards (Patient, Doctor & Admin), Doctor Verification and Approval, Appointment Scheduling, Advanced Filtering & Pagination, and Profile Management.
- **Design Philosophy**: Strict adherence to a clean, modern, and accessible design system, ensuring pixel-perfect layout and interaction patterns across all desktop and mobile viewports.
- **Tech Stack**:
  - **Frontend**: React + Vite
  - **Styling**: Tailwind CSS (Modern Design System)
  - **Icons**: Lucide React
  - **Backend**: Node.js + Express.js
  - **Database**: MongoDB (Mongoose)

---

## ✨ Features
- **High-Fidelity UI**: Clean, premium aesthetic with smooth gradients, glassmorphism hover effects, and micro-animations for enhanced engagement.
- **Role-Based Authentication**: Secure login and registration flows tailored for Doctors and Patients using JWT authentication.
- **Doctor Verification**: Doctor registrations remain pending until an administrator verifies the account. Only verified doctors can sign in or access doctor-only data.
- **Admin Review Portal**: Administrators can review pending doctor applications and approve or reject them from the protected admin dashboard.
- **Patient Privacy**: Doctors can view only patients connected to their appointments, with only the fields needed for the patient directory.
- **Dynamic Dashboards**: 
  - **Patients**: View history, check appointment statuses, and seamlessly book new consultations.
  - **Doctors**: Manage daily schedules, update appointment statuses (Scheduled, Confirmed, Completed, Cancelled), and view patient details.
- **Advanced Data Handling**: Client-side filtering, sorting, and responsive pagination for optimized data rendering.
- **Enterprise Security**: Highly sensitive health data and user passwords protected with state-of-the-art bcrypt encryption.
- **Performance Optimized**: Built with modern React standards for industry-leading speed, lazy loading, and skeleton states for a flawless user experience.

---

## 📦 Project Setup

### 🔹 Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
# Create a .env file and add your MONGODB_URI, JWT_SECRET, PORT

# Run development server
npm run dev
```

### 🔹 Create the first admin

Admin accounts cannot be created through public registration. Create the first
admin locally with private environment variables and the production MongoDB URI
(or your development database URI):

```powershell
$env:ADMIN_NAME = "Hospital Admin"
$env:ADMIN_USERNAME = "hospitaladmin"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PHONE = "+919876543210"
$env:ADMIN_PASSWORD = "use-a-unique-password-of-at-least-12-characters"
npm run admin:create
```

Run this command from the `backend` directory. The script reads `MONGODB_URI`
from `backend/.env` or the current process environment (the process environment
takes precedence), creates one admin only, hashes the password, and refuses to
create another admin if one already exists. Do not commit the admin credentials
or put them in frontend/Vercel environment variables.

Admins sign in at `/admin/login`. The `/admin/dashboard` page lists pending
doctor applications and supports approval or rejection. Doctors can sign in and
use doctor features only after approval. Verify a clinician's credentials
before approving; rejected applications cannot sign in.

The production admin account is provisioned separately. Never add its username,
password, or contact details to this public README, source control, or frontend
configuration; keep login credentials in a private password manager.

### 🔹 Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Doctor approval workflow

1. A doctor applies using the doctor registration form.
2. The application is stored with pending status; it does not create an
   authenticated doctor session.
3. An admin signs in at `/admin/login`, reviews the application, and approves
   or rejects it from the dashboard.
4. Approved doctors can log in. Rejected doctors cannot log in.

---

## 🔗 Live Implementation
- **Frontend (Vercel)**: [https://hospital-management-system-brown-three.vercel.app](https://hospital-management-system-brown-three.vercel.app)
- **Backend API (Render)**: [https://hospital-management-system-oklk.onrender.com](https://hospital-management-system-oklk.onrender.com)
- **Health Check**: [https://hospital-management-system-oklk.onrender.com/api/health](https://hospital-management-system-oklk.onrender.com/api/health)
- **GitHub Repository**: [Kunalsahuji/hospital-management-system](https://github.com/Kunalsahuji/hospital-management-system)

---

## 🤝 Connect with Me
📦 GitHub: [github.com/Kunalsahuji](https://github.com/Kunalsahuji)  
🔗 LinkedIn: [linkedin.com/in/kunal-sahu-7688ba1b0](https://www.linkedin.com/in/kunal-sahu-7688ba1b0)  
📌 Notion: [Watch my content](https://www.notion.so/1dff7c6ce1bb803787fbddd34e422ab4?v=1e0f7c6ce1bb8052b14c000cb57448ee&pvs=4)  
📧 Email: [ksahu0103@gmail.com](mailto:ksahu0103@gmail.com)  

---

## 🙌 Acknowledgements
Developed with ❤️ by [Kunal Sahu](https://github.com/Kunalsahuji).  

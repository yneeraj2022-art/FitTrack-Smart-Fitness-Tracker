# FitTrack – Smart Fitness Tracker 🏃‍♂️

A smart fitness tracking mobile application built using React Native, Expo, Node.js, Express.js, and MongoDB.

FitTrack helps users track their daily fitness activities, monitor workouts, calculate BMI, maintain water intake, and manage their personal fitness profile.

## 📱 Project Overview

FitTrack is designed to make daily fitness tracking simple and convenient. Users can create an account, log in, track workouts, view their workout history, calculate their Body Mass Index (BMI), and monitor daily water consumption.

## ✨ Features

- **User Authentication:** Signup and login using email and password.
- **Home Dashboard:** Displays fitness summaries and recent workout activity.
- **Workout Timer:** Start, pause, resume, complete, and cancel workouts.
- **Workout History:** View previous workouts and filter records.
- **BMI Calculator:** Calculate BMI and view the corresponding category.
- **Water Tracker:** Track daily water intake and customize the water goal.
- **Profile Management:** Manage profile information and profile photo.
- **Data Persistence:** Save fitness records locally using AsyncStorage.
- **Backend Integration:** Store and manage user authentication data using MongoDB.
- **Logout:** Securely return to the login screen.

## 🛠️ Technologies Used

### Frontend
- React Native
- Expo
- JavaScript
- React Hooks
- AsyncStorage
- Expo Image Picker
- Lucide / Expo icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- CORS
- dotenv

## 📂 Project Structure

```text
FitTrack/
│
├── assets/
│   └── fittrack-runner-header.png
│
├── App.js
├── AuthScreen.js
├── ActivityScreen.js
├── HistoryScreen.js
├── BMIScreen.js
├── WaterScreen.js
├── ProfileScreen.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── app.json
├── eas.json
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- VS Code
- Expo Go mobile application
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/yneeraj2022-art/FitTrack-Smart-Fitness-Tracker.git
```

### 2. Open the Project

```bash
cd FitTrack-Smart-Fitness-Tracker
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Configure Backend

Open the server folder:

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_private_jwt_secret
```

Replace the placeholder values with your own credentials. Never upload your actual `.env` file to GitHub.

### 5. Start the Backend

Inside the server folder, run:

```bash
npm run dev
```

The backend should connect to MongoDB and start on port 5000.

### 6. Start the Frontend

Open another terminal in the project root:

```bash
npx expo start --go
```

Scan the QR code using Expo Go to run the application on your mobile device.

**Note:** Configure the API URL in `AuthScreen.js` with your computer's local IPv4 address when testing on a physical mobile device. Keep both devices connected to the same Wi-Fi network.

## 🔐 Security

- Environment variables are stored in `.env`.
- `.env` files are excluded through `.gitignore`.
- Passwords are hashed before database storage.
- Authentication uses JWT tokens.

## 🚀 Future Improvements

- Step counter integration.
- Advanced fitness analytics.
- Cloud-based workout synchronization.
- Fitness goals and achievement badges.
- Push notifications.
- Improved dashboard and progress reports.

## 👨‍💻 Developer

**Project Name:** FitTrack – Smart Fitness Tracker

**GitHub:** https://github.com/yneeraj2022-art

**Repository:** https://github.com/yneeraj2022-art/FitTrack-Smart-Fitness-Tracker

## 📄 License

This project is intended for educational and internship purposes.

---

**FitTrack – Track Your Fitness, Improve Your Life! 💪**
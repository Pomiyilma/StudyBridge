# StudyBridge

**StudyBridge** is an intelligent learning platform designed to help Ethiopian high school students develop a deep, connected understanding of academic subjects. Rather than relying on a manually curated database of linked topics, StudyBridge uses **cognitive computing–driven topic connection logic** to dynamically relate concepts across subjects. This architectural choice ensures **high accuracy, adaptability, and long-term scalability**.

The platform delivers a smooth learning flow that encourages exploration, reinforces conceptual links, and supports meaningful learning progression.

---

## Platform Highlights

StudyBridge integrates modern web technologies and secure authentication to deliver a reliable and scalable learning experience:

* **Secure, email-verified authentication (OTP-based)**
* **React-powered interactive frontend**
* **Cloud-based backend with MongoDB Atlas**
* **Intelligent topic linking using trusted academic sources**

Learning resources are drawn from **curated YouTube educational videos, published academic books, and Wikipedia summaries**, enabling students to move beyond isolated topics toward connected understanding.

---

## What We Built

### 1. Authentication System

A robust and secure authentication workflow was implemented with the following features:

* OTP-based email verification for first-time registration
* Secure password creation after successful OTP verification
* Password-based login for returning users (OTP required only once)
* OTP-based **Forgot Password** workflow for secure credential recovery
* JWT-based authentication for protecting backend routes

### 2. StudyBridge Core Platform

* React-based frontend for topic analysis and guided learning flow
* Backend services for topic storage, intelligent linking, and retrieval
* API-driven integration of trusted learning sources
* Modular backend architecture to support future feature expansion

### 3. Profile Management (Improved)

* User profile viewing and editing
* Secure update of personal details
* Token-protected profile routes
* Improved validation and error handling to ensure data consistency

### 4. Password Recovery & Account Management (Improved)

* Reliable OTP-based password reset
* Email-based recovery flow with expiration handling
* Enhanced validation and feedback for better user experience

---

## How to Run the Project

### Start the Backend

Navigate to:

```
STUDYbridgee/backend
```

Run:

```
npm install
npm start
```

Expected console output:

```
OPENAI_API_KEY: FOUND
Server running on port 5000
Auth DB connected
Main DB connected
```

---

### Start the React Frontend

Navigate to:

```
STUDYbridgee/studybridge-frontend
```

Run:

```
npm install
npm start
```

The React application will run at:

```
http://localhost:3000
```

---

## Important Runtime Notes

* **Authentication Redirection Delay**
  If redirection does not occur immediately after registration or login, restart the React application. This may occur due to React state caching during token updates. Backend authentication remains correct.

* **Email & OTP System**
  OTPs and system-generated emails are sent using a team member’s configured email account.

* **Learning Sources**
  StudyBridge integrates YouTube educational content, published books, and Wikipedia explanations to create meaningful conceptual bridges rather than isolated topic descriptions.

---

## Project Information

**Project Name:** StudyBridge
**Date:** January 9, 2026
**Institution:** Addis Ababa University
**College:** CTBE
**Department:** SiTE
**Section:** 3
**Group:** 7

---

## Team Members

| No | Name               | ID          |
| -- | ------------------ | ----------- |
| 1  | Ayantu Lemi        | UGR/3757/16 |
| 2  | Fiker Mesfin       | UGR/1820/16 |
| 3  | Helina Taddese     | UGR/2446/16 |
| 4  | Krutias Temare     | UGR/2368/16 |
| 5  | Nahom Eyayaw       | UGR/4016/16 |
| 6  | Rahel Firdawek     | UGR/0838/16 |
| 7  | Tsedalemariam Getu | UGR/8326/16 |
| 8  | Pomi Yilma         | UGR/8500/16 |
| 9  | Eyob Fikre         | UGR/9963/15 |

---

© 2026 StudyBridge. All rights reserved.

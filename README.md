# OpenHacks - The Retro Hackathon Management Platform

## 🚀 Overview

OpenHacks is a full-stack hackathon management platform designed for organizers, participants, and judges. It supports event creation, team management, project submissions, judging, scoring, and certificate generation, all with a unique retro-themed UI. The platform is built for scalability, security, and extensibility, leveraging modern web technologies and cloud services.

<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/6cc67c01-25f2-4412-952b-c4259bd27466" />

---

## ✨ Features

### 1. Event Creation & Management
- **Custom Events:** Organizers can create events with custom themes, tracks, rules, timelines, prizes, and sponsors.
- **Flexible Formats:** Supports both online and offline/hybrid events.
- **Organizer Dashboard:** A centralized dashboard for managing events, teams, and judges.

<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/9878447d-218c-4c95-ba03-5e7ff0d0975d" />


### 2. User Authentication & Profiles
- **Secure Auth:** Authentication handled by Clerk.
- **Rich Profiles:** Users can manage their profiles with pronouns, bios, social links, education, and skills.
- **Profile Tracker:** Includes a profile completion tracker and options for public profile sharing.
<img width="900" height="431" alt="image" src="https://github.com/user-attachments/assets/93a66245-9dc1-44e2-8ee9-1f4c5a3b7dbc" />


### 3. Team Formation & Registration
- **Team Dynamics:** Users can easily create and join teams for events.
- **Team Dashboard:** A dedicated dashboard displays team members, status, and registration info.
- **Organizer View:** Organizers can view and manage all registered teams and participants.

<img width="900" height="431" alt="image" src="https://github.com/user-attachments/assets/f9355402-a477-474c-8a8b-9d7f901c8463" />


### 4. Project Submission Workflow
- **Simple Submissions:** Teams can submit projects with a name, description, and GitHub URL.
- **Scalable Storage:** Submissions are stored in MongoDB for flexibility and scalability.
- **Live Status:** Submission status and details are displayed in the UI for real-time tracking.
<img width="900" height="524" alt="image" src="https://github.com/user-attachments/assets/2f295c6c-dbb0-45e6-a7f4-ffafbc428649" />
<img width="1544" height="924" alt="image" src="https://github.com/user-attachments/assets/c303ddfe-81f4-4526-9dae-9ee9fca50a06" />


### 5. Organizer & Judge Dashboards
- **Judge Management:** Organizers can add judges (including themselves) via the UI.
- **Dedicated Judging Interface:** Judges get a dedicated interface to review and score submissions.
- **Reliable Scoring:** The scoring API uses upsert logic to prevent duplicate scores and stores results in a SQL database for relational integrity.
- **Detailed Feedback:** Judges can provide numeric scores and written feedback for each submission.
<img width="900" height="456" alt="image" src="https://github.com/user-attachments/assets/d4e283da-01e8-4e26-aa90-987190de437d" />

<img width="900" height="415" alt="image" src="https://github.com/user-attachments/assets/41e0e21f-b046-44d2-974f-c8022cf9d8c4" />


### 6. Certificate Generation
- **Dynamic Certificates:** Participants can download event completion certificates.
- **Custom Templates:** Certificates are generated dynamically using SVG templates and custom pixel fonts.
- **Easy Download:** PNG certificates are served via an API endpoint for easy downloading.
- <img width="900" height="404" alt="image" src="https://github.com/user-attachments/assets/3fd50745-5cc5-4be4-bd65-864a804cbf66" />


<img width="900" height="474" alt="image" src="https://github.com/user-attachments/assets/9186b1ba-3a50-41e5-9130-b40293a2c308" />


### 7. Retro-Themed UI
- **Consistent Design:** The entire platform features consistent retro styling using CSS variables and custom pixel fonts.
- **Responsive:** The UI is fully responsive for both desktop and mobile devices.
- **Custom Components:** Includes a library of themed components like Cards, Buttons, Inputs, and Tabs.
<img width="1919" height="923" alt="image" src="https://github.com/user-attachments/assets/2df7f22f-6521-4491-b28f-a8c4fcc88159" />

### 8. Cloud Integration
- **Image Uploads:** Seamlessly handles image uploads via Cloudinary.
- **Hybrid Database:** Uses a multi-DB architecture with Azure SQL and MongoDB Atlas.
- **Cloud-Ready:** Prepared for deployment on Azure with standalone mode support.
<img width="1488" height="592" alt="image" src="https://github.com/user-attachments/assets/28864a5b-eaa8-421b-b87f-53ca60332703" />

---

## 🏗️ Architecture

### Frontend
- **Framework:** Next.js 15 (App Router, Server Components, API Routes)
- **Styling:** Tailwind CSS, CSS Custom Properties, Custom Fonts (`Press Start 2P`, `VT323`)
- **UI Library:** Custom-built retro UI components (Card, Button, Input, etc.)
- **State Management:** TanStack Query (React Query)
- **Authentication:** Clerk

### Backend
- **API:** Next.js API Routes for all business logic.
- **Database:** Azure SQL (managed with Prisma ORM) and MongoDB Atlas (managed with the native driver).
- **File Storage:** Cloudinary for image upload and management.
- **Certificate Generation:** Satori + Resvg for dynamic SVG-to-PNG conversion.

### Security and Authorization
- **RBAC:** Role-based access control for organizers, judges, and participants.
- **API Protection:** Middleware for API-level authorization checks (`requireAuth`, `requireEventJudge`).
- **Validation:** Input validation using Zod schemas.

### Deployment
- **Host:** Optimized for Azure (`standalone` mode enabled in `next.config.ts`).
- **Configuration:** Environment variables managed via a `.env` file.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, TanStack Query
- **UI:** Custom Retro UI, CSS Variables, Pixel Fonts
- **Auth:** Clerk
- **Backend:** Next.js API Routes
- **SQL DB:** Azure SQL + Prisma
- **NoSQL DB:** MongoDB Atlas + Native Driver
- **File Storage:** Cloudinary
- **Certificate Generation:** Satori, Resvg
- **Deployment:** Azure (standalone)
- **Validation:** Zod

---

## 💡 Key Codebase Highlights

- **Event Creation:** `page.tsx` and `route.ts` handle event setup and validation.
- **Team Management:** `page.tsx` displays teams and integrates project uploads.
- **Project Submission:** `route.ts` (MongoDB logic) and `SubmissionSection.tsx` (UI).
- **Judging:** `page.tsx` provides the themed judge interface; `route.ts` handles scoring logic.
- **Certificate Generation:** `route.ts` dynamically generates PNG certificates from SVG.
- **Profile & Dashboard:** `page.tsx` for user information and stats.
- **Cloudinary Integration:** `cloudinary.js` for handling all uploads.
- **Authorization:** `auth.ts` for role checks and session management.

---

## 📝 Notable Implementation Details

- **Multi-DB Architecture:** SQL for core relational entities (users, events) and MongoDB for flexible, document-based submissions.
- **Upsert Scoring Logic:** Prevents duplicate judge scores per submission, round, or judge.
- **Dynamic Certificate Rendering:** On-the-fly generation of certificates with custom pixel fonts.
- **Flexible Judge Management:** Organizers can add or remove judges, including themselves.
- **Consistent Theming:** A global `globals.css` file ensures a consistent retro theme across the app.
- **Robust Error Handling:** Clear API errors and status codes for a better developer experience.
- **Extensible Design:** The architecture is designed to be easily extendable with new fields, roles, or integrations.

---

## 💻 How to Run Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Create a `.env` file and set up the necessary keys for Clerk, Cloudinary, Azure SQL, and MongoDB.

3.  **Run Database Migrations:**
    ```bash
    npx prisma migrate dev
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:3000`.

---

## ✅ Conclusion

OpenHacks is a robust hackathon platform with a modern tech stack, a scalable architecture, and a unique retro aesthetic. It covers the full lifecycle of hackathons—from creation and registration to submission, judging, scoring, and certificate generation—making it an ideal solution for all stakeholders.

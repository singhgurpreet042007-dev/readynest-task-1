# ReadyNest Task 1 - Dynamic Form Builder

A full-stack Dynamic Form Builder application developed as part of the ReadyNest Full Stack Development Internship Program.

## 🚀 Features

* User Authentication (Sign Up / Login)
* Create Dynamic Forms
* Add Multiple Field Types

  * Text Input
  * Email
  * Number
  * Dropdown
  * Checkbox
  * Radio Button
  * Textarea
* Publish Forms
* Share Public Form Links
* Collect Responses
* Dashboard Overview
* Form Management

  * Create
  * Edit
  * Delete
  * Duplicate
* Profile Settings
* Responsive UI

## 🛠️ Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn UI

### Backend & Database

* Supabase
* PostgreSQL

### Authentication

* Supabase Auth

## 📂 Project Structure

```bash
app/
components/
context/
hooks/
lib/
public/
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/readynest-task-1.git
```

Navigate to the project folder:

```bash
cd readynest-task-1
```

Install dependencies:

```bash
npm install
```

Create environment file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## 🌐 Deployment

This project can be deployed on:

* Vercel
* Netlify
* Any Next.js compatible hosting platform

## 📋 Project Workflow

1. User signs up or logs in.
2. User creates a form.
3. Form can be published.
4. Public users can submit responses.
5. Responses are stored in Supabase.
6. Dashboard displays form data and analytics.

## 👨‍💻 Developed By

**Gurpreet Singh**

ReadyNest Full Stack Development Internship – Week 1 Task

## 📜 License

This project is created for educational and internship evaluation purposes.

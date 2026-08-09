# Airport Navigator Pro

Here's a prompt you can give to Claude Code, GPT-5, Lovable, Bolt, Cursor, or any AI frontend generator. It is written to produce a production-quality React frontend with a modern design rather than just a basic CRUD interface.

Prompt

You are a senior Frontend Engineer and UI/UX Designer.

Your task is to build a complete React frontend for an AI-powered Airport Navigation & Passenger Assistance System.

The frontend should look like a real-world enterprise product used in modern international airports such as Singapore Changi, Dubai, Heathrow, or Delhi Airport.

The design should be extremely polished, responsive, modern, and minimal with smooth animations.

Do NOT generate backend code.

Assume the backend already exists.

The frontend should only consume REST APIs.

Tech Stack

Use:

React

React Router DOM

Axios

CSS Modules or modern CSS

Lucide React Icons

Framer Motion for animations

React Context API for state management

Google Maps Component placeholder

Responsive Design

Mobile First

Folder Structure

frontend/

public/
    index.html

src/

components/
    Navbar.jsx
    Login.jsx
    Dashboard.jsx
    AmenitySearch.jsx
    AIChat.jsx
    PanicModal.jsx
    MapView.jsx
    ProgressTimeline.jsx
    StatusCard.jsx
    LanguageSelector.jsx

pages/
    LoginPage.jsx
    DashboardPage.jsx

services/
    api.js

context/
    UserContext.jsx

styles/
    globals.css

App.jsx
index.js


Application Flow

The frontend follows this exact architecture.

React Frontend

↓

Spring Boot Backend

↓

Firebase
Google Maps API

↓

FastAPI + Gemini AI

↓

Spring Boot

↓

React Frontend


When a user sends a request:

User types

"Find coffee near Gate 22"

↓

POST request

/api/ask

↓

Backend returns

{
 response,
 directions,
 nearbyPlaces,
 estimatedTime
}

↓

Render

AI response

Nearby locations

Map update

Walking time

Step-by-step instructions


Pages

1. Login Page

The first screen users see.

Include:

Airport logo

Welcome message

Email

Password

Passenger Name

Flight Number

Accessibility Preferences

Dropdown

Standard

Elderly

Wheelchair

Preferred Language

Dropdown

Examples:

English

Hindi

Marathi

Spanish

Arabic

Chinese

Large Login button

Beautiful glassmorphism card

Airport background image

Subtle floating animation

2. Dashboard

After login navigate to Dashboard.

Dashboard contains:

Navbar

User profile

Flight Status Card

Gate Number

Departure Time

Boarding Status

Countdown Timer

Progress Timeline

✓ Check-In

✓ Security

Current

Immigration

Gate

Boarding


Each step should animate when completed.

3. AI Assistant Section

Large chat window.

Contains

Search Bar

Microphone Button

Send Button

Placeholder:

"Ask me anything about the airport..."

Example Questions

Find nearest coffee

Where is Gate B12?

How long to security?

Find wheelchair assistance

Lost baggage

The conversation should appear like ChatGPT.

User messages on right.

AI messages on left.

Typing animation.

Loading indicator.

4. Airport Map

Large interactive map section.

Initially use a placeholder Google Maps component.

Display

Current User Location

Destination Gate

Nearby Amenities

Walking Route

Markers

Coffee

Restroom

ATM

Medical

Food Court

Charging Station

Use animated markers.

5. Amenity Search Cards

Below the search bar.

Display quick buttons.

☕

Coffee

🍔

Food

🚻

Restrooms

🏧

ATM

💺

Lounges

🔋

Charging

Clicking them automatically sends API request.

6. Emergency Panic Button

Floating red circular button.

Bottom right.

Click opens modal.

Modal options

Missed Flight

Lost Baggage

Medical Emergency

Need Airport Staff

Request Wheelchair

Emergency Contacts

Call Airport Help

The modal should have smooth animations.

7. Flight Information Card

Beautiful card displaying

Flight Number

Current Gate

Departure Time

Boarding Time

Delay Status

Terminal

Airline Logo Placeholder

Countdown Timer

8. Navigation Timeline

Visual checklist.

Check-In

↓

Security

↓

Immigration

↓

Gate

↓

Boarding


Current step highlighted.

Completed steps green.

Pending steps grey.

Navbar

Contains

Airport Logo

App Name

Current Language

Notification Bell

Online Status

Profile Avatar

Dark Mode Toggle

Backend Integration

Create a single API service using Axios.

Example endpoints

POST /api/login

POST /api/ask

GET /api/profile

GET /api/flight

GET /api/map

POST /api/panic


Store JWT token.

Handle loading states.

Handle API errors.

Show toast notifications.

AI Chat

When user submits

Find coffee near Gate A12


Send

POST /api/ask


Receive

{
response:

"The nearest coffee shop is Starbucks.

Walk straight for 120 meters.

Turn left.

Estimated walking time: 3 minutes."

route:[...]

markers:[...]

time:"3 min"
}


Render

AI message

Map update

Directions card

State Management

Maintain

Logged In User

Language

Accessibility Preference

Current Flight

Chat History

Current Map Route

Emergency State

Notifications


using Context API.

UI Style

Theme

Primary

#2563EB


Secondary

#0F172A


Accent

#22C55E


Danger

#EF4444


Background

#F8FAFC


Cards

Rounded 20px

Soft Shadows

Glassmorphism

Animations

Framer Motion

Transitions

300ms

Typography

Inter

Responsive

Desktop

Tablet

Mobile

Extra Features

Implement

Dark Mode

Voice Search Button

Loading Skeletons

Animated Timeline

Animated Chat

Responsive Sidebar

Notification Badge

Smooth Page Transitions

Hover Effects

Floating Cards

Beautiful Empty States

Error Screens

Loading Screens

Code Requirements

Write clean production-ready code.

Separate components properly.

No inline CSS.

Reusable components.

Proper folder structure.

Comments where necessary.

Responsive layout.

No placeholder lorem ipsum.

Use realistic airport data.

Follow React best practices.

Final Output

Generate:

Complete React project structure

All components

Routing

Styling

Context API

Axios service

Responsive UI

Dummy API integration

Clean code ready to connect to Spring Boot backend

The final UI should feel like a premium airport assistant application comparable to products from major airlines or international airports, with a sleek, intuitive, and professional user experience.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c002d96f-f09e-45bd-9115-b53809c3b16e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

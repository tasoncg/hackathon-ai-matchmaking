# ⚽ MatchBall – Overall System Specification (overall.md)

## 1. Product Overview

**MatchBall** is a football team management and opponent matchmaking platform designed to solve real-world coordination problems between amateur and semi-pro teams.

### Core Problems

* Skill levels are subjective and unreliable (e.g., Facebook groups)
* Communication between teams is inefficient
* Scheduling conflicts (time + location)
* No trust/reputation system for teams

### Objective

Build a **data-driven + AI-assisted matchmaking system** that:

* Scores teams objectively
* Matches compatible opponents
* Improves reliability via behavior tracking

---

## 2. System Architecture

### Architecture Style

* Clean Architecture
* Layered separation:

```
Controller → Service → Repository → Database
```

### High-Level Components

* Frontend (React)
* Backend API (.NET 8)
* Database (PostgreSQL / SQL Server)
* Matching Engine (Service Layer)
* Authentication Service (JWT + OAuth)

---

## 3. Tech Stack

### Frontend

* React (Vite or Next.js)
* TailwindCSS
* Zustand (preferred) or Redux

### Backend

* .NET 8 Web API (C#)
* Entity Framework Core
* Clean Architecture pattern

### Database

* PostgreSQL (preferred) or SQL Server
* Code-first migrations

### Authentication

* JWT-based authentication
* OAuth (Google required, Facebook optional mock)

### AI / Matching

* Heuristic scoring engine (MVP)
* Optional OpenAI integration for insights

### Deployment

* Docker (mandatory)
* docker-compose for local dev
* Hosting:

  * Backend: Azure App Service / Render / Railway
  * Frontend: Vercel / Netlify

---

## 4. User Roles

### Player

* Register / login
* Create profile:

  * Name, nickname
  * Position (GK, DF, MF, FW)
  * Skill level
  * Age
  * Location
  * Weekly availability
  * Experience years
* Apply to teams
* Create team (optional)

---

### Team Captain (Admin)

* Create / manage team
* Add/remove members
* View team stats
* Send match invitations
* Accept/reject matches

---

### Field Owner

* Register football field
* Manage:

  * Address
  * Contact
  * Rating
  * Time slots
  * Pricing

---

## 5. Database Design

### Core Entities

#### Users

* Id
* Name
* Nickname
* Email
* SkillLevel
* Position
* Age
* Location
* Availability (JSON)
* ExperienceYears

---

#### Teams

* Id
* Name
* Address
* CaptainId
* BehaviorScore (1–100)

---

#### TeamMembers

* TeamId
* UserId
* Role

---

#### Matches

* Id
* TeamAId
* TeamBId
* MatchTime
* Location
* FieldId
* Status

---

#### MatchResults

* MatchId
* ScoreA
* ScoreB
* SubmittedBy
* Confirmed

---

#### BehaviorLogs

* TeamId
* MatchId
* ScoreChange
* Reason

---

#### Fields

* Id
* Name
* Address
* OwnerId
* Rating
* Status (Available / Unavailable / Maintenance)
* PricingModel (Hourly / Fixed)
* PricePerHour

---

#### FieldTimeSlots (IMPORTANT)

* Id
* FieldId
* StartTime
* EndTime
* Price
* Status (Available / Booked / Blocked)

---

### Relationships

* One Field → Many FieldTimeSlots
* One Team → Many Members
* Matches reference FieldId
* Matching engine must consider:

  * Availability overlap
  * Field availability
  * Optional pricing compatibility

---

## 6. Matchmaking Engine

### Function

```
GetBestMatches(teamId)
```

### Output

```
[
  {
    teamId,
    score,
    explanation
  }
]
```

### Scoring Criteria

| Criteria                     | Weight |
| ---------------------------- | ------ |
| Skill similarity             | HIGH   |
| Behavior score               | HIGH   |
| Availability overlap         | HIGH   |
| Location distance            | MEDIUM |
| Match history (avoid repeat) | MEDIUM |

### Notes

* Must return **top 3 matches**
* Must include explanation (AI-readable + user-readable)

---

## 7. Behavior Score System

### Range

* 1 → 100

### Rules

* Match completed → +5
* No-show → -15
* Late result submission → -5
* Confirm opponent → +3

### Flow

1. Team A submits result
2. Team B confirms
3. Save result
4. Update BehaviorScore
5. Log into BehaviorLogs

---

## 8. Core Features (MVP)

### Phase 1 – Mock Data

* Seed:

  * 50 users
  * 5 teams (9 players each)
* Run matchmaking engine
* Display suggestions

---

### Phase 2 – Real Usage

* OAuth login
* Invite via link
* Basic real-time notifications (polling OK)

---

## 9. API Design

### Auth

* POST /auth/login

### Teams

* GET /teams/{id}
* POST /teams
* POST /teams/{id}/invite

### Matchmaking

* GET /matchmaking/{teamId}

### Matches

* POST /matches
* POST /matches/{id}/result
* POST /matches/{id}/confirm

---

## 10. Frontend Pages

* Login / Register
* Dashboard

  * Suggested opponents (Top 3)
* Team Management
* Match History
* Profile Page
* Field Listings

---

## 11. UI Requirements

* Tailwind-based modern UI
* Highlight:

  * Behavior Score (color-coded)
  * Skill Level
* Show:

  * Match confidence score
  * Explanation of match

---

## 12. Docker Setup

### Required Files

* Backend Dockerfile
* Frontend Dockerfile
* docker-compose.yml

---

## 13. Deployment

### Must Provide

* Step-by-step deployment guide
* Environment variables
* Sample production URLs

---

## 14. Bonus Features (Optional)

* Chat between teams
* Post-match rating
* AI-generated team insights

---

## 15. Output Requirements (FOR AI GENERATION)

When using this spec, the AI must generate:

1. Folder structure
2. Backend (.NET 8 Clean Architecture)
3. Frontend (React + Tailwind)
4. Database migrations
5. Seed scripts
6. Matching engine implementation
7. Docker setup
8. Deployment guide

---

## 16. Engineering Constraints

* Code must be runnable immediately
* No pseudo-code
* Follow Clean Architecture strictly
* API must integrate with frontend
* Add comments where necessary

---

## 17. Execution Instruction (FOR CLAUDE / AI)

Use this document as **source of truth**.

When generating code:

* Do NOT skip layers
* Do NOT simplify database
* Do NOT mock business logic
* Always include real implementations

---

## END OF SPEC

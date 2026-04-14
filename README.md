MatchBall MVP - Complete
What's Built
Backend (.NET 8 Clean Architecture)
4 projects: Api, Application, Domain, Infrastructure
8 entities: User, Team, TeamMember, Match, MatchResult, BehaviorLog, Field, FieldTimeSlot
8 enums: SkillLevel, Position, UserRole, TeamMemberRole, MatchStatus, FieldStatus, PricingModel, TimeSlotStatus
6 controllers: Auth, Teams, Matches, Matchmaking, Fields, Users
5 services: AuthService, TeamService, MatchService, FieldService, MatchmakingService
JWT authentication with Bearer tokens
EF Core migrations + auto-migrate on startup
Matchmaking Engine (Verified Working)
Weighted scoring with 5 criteria:

Criteria	Weight	Method
Skill similarity	30%	Average member skill level comparison
Behavior score	25%	Team reliability rating (1-100)
Schedule overlap	25%	JSON availability intersection
Location distance	15%	Haversine formula (km)
History penalty	5%	Avoid recent rematches (30-day window)
Behavior Score System
+5 match completed properly
+3 confirming opponent's result
-15 no-show / cancellation
Range clamped to 1-100, logged to BehaviorLogs table
Seed Data
50 users (5 captains, 40 players, 5 field owners)
5 teams (9 members each)
5 football fields with 7-day time slots
8 historical matches with results
Frontend (React + Vite + TailwindCSS + Zustand)
6 pages: Login, Register, Dashboard, Teams (list + detail), Matches, Profile, Fields
4 components: Navbar, ScoreBadge (color-coded), SkillBadge, ConfidenceMeter

Docker
Dockerfile.api, Dockerfile.client, nginx.conf
docker-compose.yml (API + SQL Server + Frontend)
How to Run

# Backend
dotnet run --project src/MatchBall.Api --launch-profile http

# Frontend (separate terminal)
cd matchball-client && npm run dev
Open http://localhost:5173 and login with player1@matchball.dev / Password123!

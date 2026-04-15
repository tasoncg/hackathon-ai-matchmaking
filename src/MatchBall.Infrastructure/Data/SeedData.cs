using MatchBall.Domain.Entities;
using MatchBall.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        var random = new Random(42);

        if (await db.Users.AnyAsync())
        {
            await SeedSchedulesIfMissingAsync(db, random);
            return;
        }

        var firstNames = new[] { "Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Vo", "Dang", "Bui", "Do",
            "Ho", "Ngo", "Duong", "Ly", "Truong", "Lam", "Luong", "Dinh", "Mai", "Doan" };
        var lastNames = new[] { "Minh", "Duc", "Thanh", "Hung", "Tuan", "Anh", "Hieu", "Long", "Khanh", "Phuc",
            "Dat", "Quang", "Vinh", "Huy", "Tai", "Sang", "Duy", "Nam", "Son", "Khoa" };

        var positions = Enum.GetValues<Position>();
        var skills = Enum.GetValues<SkillLevel>();
        var days = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
        var timeSlots = new[] { "06:00-08:00", "08:00-10:00", "16:00-18:00", "18:00-20:00", "20:00-22:00" };

        // Ho Chi Minh City area coordinates
        var locations = new (string Name, double Lat, double Lng)[]
        {
            ("District 1, HCMC", 10.7769, 106.7009),
            ("District 2, HCMC", 10.7870, 106.7470),
            ("District 7, HCMC", 10.7340, 106.7218),
            ("Binh Thanh, HCMC", 10.8065, 106.7093),
            ("Thu Duc, HCMC", 10.8488, 106.7728),
            ("Go Vap, HCMC", 10.8386, 106.6652),
            ("Tan Binh, HCMC", 10.8014, 106.6529),
            ("Phu Nhuan, HCMC", 10.7990, 106.6826),
            ("District 3, HCMC", 10.7827, 106.6857),
            ("District 10, HCMC", 10.7728, 106.6605)
        };

        // Create 50 users
        var users = new List<User>();
        for (int i = 0; i < 50; i++)
        {
            var loc = locations[i % locations.Length];
            var avail = Enumerable.Range(0, random.Next(2, 5))
                .Select(_ => $"{days[random.Next(days.Length)]} {timeSlots[random.Next(timeSlots.Length)]}")
                .Distinct().ToList();

            users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = $"{firstNames[i % firstNames.Length]} {lastNames[i / firstNames.Length % lastNames.Length]}",
                Nickname = $"player{i + 1}",
                Email = $"player{i + 1}@matchball.dev",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                SkillLevel = skills[random.Next(skills.Length)],
                Position = positions[random.Next(positions.Length)],
                Role = i < 5 ? UserRole.Captain : (i >= 45 ? UserRole.FieldOwner : UserRole.Player),
                Age = random.Next(18, 40),
                Location = loc.Name,
                Latitude = loc.Lat + (random.NextDouble() - 0.5) * 0.02,
                Longitude = loc.Lng + (random.NextDouble() - 0.5) * 0.02,
                Availability = System.Text.Json.JsonSerializer.Serialize(avail),
                ExperienceYears = random.Next(1, 15)
            });
        }
        db.Users.AddRange(users);
        await db.SaveChangesAsync();

        // Create 5 teams (9 players each + 1 captain)
        var teamNames = new[] { "Saigon FC", "Thunder Hawks", "Red Dragons", "Phoenix United", "Golden Stars" };
        var teams = new List<Team>();
        for (int t = 0; t < 5; t++)
        {
            var captain = users[t]; // First 5 users are captains
            var loc = locations[t * 2 % locations.Length];
            var team = new Team
            {
                Id = Guid.NewGuid(),
                Name = teamNames[t],
                Address = loc.Name,
                Latitude = loc.Lat,
                Longitude = loc.Lng,
                CaptainId = captain.Id,
                BehaviorScore = random.Next(55, 95)
            };
            teams.Add(team);
        }
        db.Teams.AddRange(teams);
        await db.SaveChangesAsync();

        // Add members: captain + 8 players per team
        var memberIndex = 5; // Start after captains
        for (int t = 0; t < 5; t++)
        {
            // Captain as member
            db.TeamMembers.Add(new TeamMember
            {
                TeamId = teams[t].Id,
                UserId = users[t].Id,
                Role = TeamMemberRole.Captain
            });

            // 8 more players
            for (int p = 0; p < 8 && memberIndex < 45; p++, memberIndex++)
            {
                db.TeamMembers.Add(new TeamMember
                {
                    TeamId = teams[t].Id,
                    UserId = users[memberIndex].Id,
                    Role = TeamMemberRole.Player
                });
            }
        }
        await db.SaveChangesAsync();

        // Create 5 fields
        var fieldNames = new[] { "Sân Thống Nhất", "Sân Phú Thọ", "Sân 7 người Q7", "Sân mini Bình Thạnh", "Sân Cỏ Nhân Tạo TD" };
        for (int f = 0; f < 5; f++)
        {
            var loc = locations[f];
            var owner = users[45 + f]; // Last 5 users are field owners
            var field = new Field
            {
                Id = Guid.NewGuid(),
                Name = fieldNames[f],
                Address = loc.Name,
                OwnerId = owner.Id,
                Rating = Math.Round(3.0 + random.NextDouble() * 2.0, 1),
                Status = FieldStatus.Available,
                PricingModel = f % 2 == 0 ? PricingModel.Hourly : PricingModel.Fixed,
                PricePerHour = 200_000 + random.Next(0, 5) * 50_000,
                Latitude = loc.Lat,
                Longitude = loc.Lng
            };
            db.Fields.Add(field);

            // Add time slots for next 7 days
            for (int d = 0; d < 7; d++)
            {
                var date = DateTime.UtcNow.Date.AddDays(d);
                var hours = new[] { 6, 8, 16, 18, 20 };
                foreach (var h in hours)
                {
                    db.FieldTimeSlots.Add(new FieldTimeSlot
                    {
                        Id = Guid.NewGuid(),
                        FieldId = field.Id,
                        StartTime = date.AddHours(h),
                        EndTime = date.AddHours(h + 2),
                        Price = null,
                        Status = random.NextDouble() > 0.3 ? TimeSlotStatus.Available : TimeSlotStatus.Booked
                    });
                }
            }
        }
        await db.SaveChangesAsync();

        // Create weekly schedule slots for each team: 3 available + 1-2 booked
        var fieldList = db.Fields.ToList();
        var scheduleDays = new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday };
        var scheduleHours = new[] { (18, 20), (20, 22), (16, 18) };

        for (int t = 0; t < 5; t++)
        {
            var chosen = scheduleDays.OrderBy(_ => random.Next()).Take(4).ToList();
            for (int d = 0; d < chosen.Count; d++)
            {
                var (s, e) = scheduleHours[d % scheduleHours.Length];
                var field = fieldList[random.Next(fieldList.Count)];
                var bookedCount = random.Next(1, 3); // 1-2 booked per team
                db.TeamScheduleSlots.Add(new TeamScheduleSlot
                {
                    Id = Guid.NewGuid(),
                    TeamId = teams[t].Id,
                    DayOfWeek = chosen[d],
                    StartHour = s,
                    EndHour = e,
                    FieldId = field.Id,
                    FieldName = field.Name,
                    Status = d < bookedCount ? ScheduleSlotStatus.Booked : ScheduleSlotStatus.Available,
                    Notes = d < bookedCount ? "Weekly training / friendly" : null
                });
            }
        }
        await db.SaveChangesAsync();

        // Create some past matches
        for (int i = 0; i < 8; i++)
        {
            var a = i % 5;
            var b = (i + 1 + random.Next(1, 4)) % 5;
            if (a == b) b = (b + 1) % 5;

            var match = new Match
            {
                Id = Guid.NewGuid(),
                TeamAId = teams[a].Id,
                TeamBId = teams[b].Id,
                MatchTime = DateTime.UtcNow.AddDays(-random.Next(1, 30)),
                Location = locations[random.Next(locations.Length)].Name,
                Status = MatchStatus.Completed
            };
            db.Matches.Add(match);
            await db.SaveChangesAsync();

            db.MatchResults.Add(new MatchResult
            {
                Id = Guid.NewGuid(),
                MatchId = match.Id,
                ScoreA = random.Next(0, 6),
                ScoreB = random.Next(0, 6),
                SubmittedBy = teams[a].Id,
                Confirmed = true
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedSchedulesIfMissingAsync(AppDbContext db, Random random)
    {
        if (await db.TeamScheduleSlots.AnyAsync()) return;

        var teams = await db.Teams.ToListAsync();
        var fieldList = await db.Fields.ToListAsync();
        if (teams.Count == 0 || fieldList.Count == 0) return;

        var scheduleDays = new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday };
        var scheduleHours = new[] { (18, 20), (20, 22), (16, 18) };

        foreach (var team in teams)
        {
            var chosen = scheduleDays.OrderBy(_ => random.Next()).Take(4).ToList();
            for (int d = 0; d < chosen.Count; d++)
            {
                var (s, e) = scheduleHours[d % scheduleHours.Length];
                var field = fieldList[random.Next(fieldList.Count)];
                var bookedCount = random.Next(1, 3);
                db.TeamScheduleSlots.Add(new TeamScheduleSlot
                {
                    Id = Guid.NewGuid(),
                    TeamId = team.Id,
                    DayOfWeek = chosen[d],
                    StartHour = s,
                    EndHour = e,
                    FieldId = field.Id,
                    FieldName = field.Name,
                    Status = d < bookedCount ? ScheduleSlotStatus.Booked : ScheduleSlotStatus.Available,
                    Notes = d < bookedCount ? "Weekly training / friendly" : null
                });
            }
        }
        await db.SaveChangesAsync();
    }
}

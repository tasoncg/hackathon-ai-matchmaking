using MatchBall.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchResult> MatchResults => Set<MatchResult>();
    public DbSet<BehaviorLog> BehaviorLogs => Set<BehaviorLog>();
    public DbSet<Field> Fields => Set<Field>();
    public DbSet<FieldTimeSlot> FieldTimeSlots => Set<FieldTimeSlot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Name).HasMaxLength(100).IsRequired();
            e.Property(u => u.Email).HasMaxLength(200).IsRequired();
            e.Property(u => u.Nickname).HasMaxLength(50);
            e.Property(u => u.Location).HasMaxLength(200);
            e.Property(u => u.Availability).HasMaxLength(2000);
        });

        // Team
        modelBuilder.Entity<Team>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Name).HasMaxLength(100).IsRequired();
            e.Property(t => t.Address).HasMaxLength(300);
            e.HasOne(t => t.Captain)
                .WithMany(u => u.CaptainedTeams)
                .HasForeignKey(t => t.CaptainId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TeamMember (composite key)
        modelBuilder.Entity<TeamMember>(e =>
        {
            e.HasKey(tm => new { tm.TeamId, tm.UserId });
            e.HasOne(tm => tm.Team)
                .WithMany(t => t.Members)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(tm => tm.User)
                .WithMany(u => u.TeamMembers)
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Match
        modelBuilder.Entity<Match>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Location).HasMaxLength(300);
            e.HasOne(m => m.TeamA)
                .WithMany(t => t.HomeMatches)
                .HasForeignKey(m => m.TeamAId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.TeamB)
                .WithMany(t => t.AwayMatches)
                .HasForeignKey(m => m.TeamBId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Field)
                .WithMany(f => f.Matches)
                .HasForeignKey(m => m.FieldId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // MatchResult
        modelBuilder.Entity<MatchResult>(e =>
        {
            e.HasKey(mr => mr.Id);
            e.HasOne(mr => mr.Match)
                .WithOne(m => m.Result)
                .HasForeignKey<MatchResult>(mr => mr.MatchId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // BehaviorLog
        modelBuilder.Entity<BehaviorLog>(e =>
        {
            e.HasKey(bl => bl.Id);
            e.Property(bl => bl.Reason).HasMaxLength(500);
            e.HasOne(bl => bl.Team)
                .WithMany(t => t.BehaviorLogs)
                .HasForeignKey(bl => bl.TeamId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(bl => bl.Match)
                .WithMany(m => m.BehaviorLogs)
                .HasForeignKey(bl => bl.MatchId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Field
        modelBuilder.Entity<Field>(e =>
        {
            e.HasKey(f => f.Id);
            e.Property(f => f.Name).HasMaxLength(200).IsRequired();
            e.Property(f => f.Address).HasMaxLength(300);
            e.Property(f => f.PricePerHour).HasPrecision(10, 2);
            e.HasOne(f => f.Owner)
                .WithMany(u => u.OwnedFields)
                .HasForeignKey(f => f.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // FieldTimeSlot
        modelBuilder.Entity<FieldTimeSlot>(e =>
        {
            e.HasKey(fts => fts.Id);
            e.Property(fts => fts.Price).HasPrecision(10, 2);
            e.HasOne(fts => fts.Field)
                .WithMany(f => f.TimeSlots)
                .HasForeignKey(fts => fts.FieldId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

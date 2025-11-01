using Microsoft.EntityFrameworkCore;
using RestaurantBooking.API.Models;

namespace RestaurantBooking.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Table> Tables { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
            
            entity.Property(e => e.Role)
                .HasDefaultValue("customer");
            
            entity.ToTable(t => t.HasCheckConstraint("chk_role", "role IN ('customer', 'admin')"));
        });

        // Table entity configuration
        modelBuilder.Entity<Table>(entity =>
        {
            entity.HasIndex(e => e.TableNumber).IsUnique();
            
            entity.ToTable(t => t.HasCheckConstraint("chk_capacity", "capacity > 0"));
        });

        // Booking entity configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(e => e.Reference).IsUnique();
            entity.HasIndex(e => e.BookingDate);
            entity.HasIndex(e => e.Status);
            
            entity.Property(e => e.Status)
                .HasDefaultValue("confirmed");
            
            entity.ToTable(t => 
            {
                t.HasCheckConstraint("chk_status", "status IN ('confirmed', 'cancelled')");
                t.HasCheckConstraint("chk_number_of_guests", "number_of_guests > 0");
            });

            // Configure relationships
            entity.HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(b => b.Table)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TableId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

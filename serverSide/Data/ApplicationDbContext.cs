using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using serverSide.Data.Models;

namespace serverSide.Data;
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    :IdentityDbContext<ApplicationUser, IdentityRole<int>,int>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
    }
}


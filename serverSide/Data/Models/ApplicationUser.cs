using Microsoft.AspNetCore.Identity;

namespace serverSide.Data.Models;
public class ApplicationUser : IdentityUser<int>
{
    public required DateOnly BirthDate { get; set; }
    public string? AvatarUrl { get; set; }
}
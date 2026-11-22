using System.ComponentModel.DataAnnotations;

namespace serverSide.DTO;
public class UserRegisterationDTO
{
    [Required]
    [MinLength(2)]
    public required string Username { get; set; }
    [DataType(DataType.Date)]
    public DateOnly BirthDate { get; set; } = new DateOnly(DateTime.Today.Year, DateTime.Today.Month, DateTime.Today.Day);
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    [DataType(DataType.Password)]
    public required string Password { get; set; }
    [Required(ErrorMessage = "Confirm password is required.")]
    [Compare(nameof(Password), ErrorMessage = "Passwords do not match.")]
    [DataType(DataType.Password)]
    public required string ConfirmPassword { get; set; }
}
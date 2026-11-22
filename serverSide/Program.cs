using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using serverSide.Data;
using serverSide.Data.Models;
using serverSide.DTO;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");


builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// this must come first, then ConfigureApplicationCookie so it does not mess the 401 to 404.
builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
    options.User.RequireUniqueEmail = true;
})
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddProblemDetails();

builder.Services.AddValidation();

builder.Services.AddSwaggerGen();

builder.Services.AddOpenApi();

builder.Services.AddAuthorization()
    .ConfigureApplicationCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Unspecified;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseExceptionHandler();

app.UseStatusCodePages();

app.MapPost("/signup", async (UserRegisterationDTO model, UserManager<ApplicationUser> userManager, HttpContext context) =>
{
    var user = new ApplicationUser
    {
        UserName = model.Username,
        Email = model.Email,
        BirthDate = model.BirthDate,
    };
    var result = await userManager.CreateAsync(user,model.Password);
    if (!result.Succeeded)
    {
        var errors = result.Errors
        .GroupBy(e => e.Code)
        .ToDictionary(
            g => g.Key,
            g => g.Select(e => e.Description).ToArray()
        );

        var problemDetails = new ValidationProblemDetails(errors)
        {
            Title = "Failed creating a user for the following errors",
            Status = StatusCodes.Status400BadRequest,
            Instance = context.Request.Path
        };

        return Results.BadRequest(problemDetails);
    }
    return Results.Ok();
});

app.MapPost("/signin", async (UserLoginModel model, UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager) =>
{
    var user = await userManager.FindByEmailAsync(model.email);

    if (user == null || !await userManager.CheckPasswordAsync(user, model.password)) return Results.Unauthorized();

    await signInManager.SignInAsync(user,model.rememberMe);

    return Results.Ok();

});

app.MapGet("/getme", (ClaimsPrincipal context) =>
{
    var claims = context.Claims.Select(x => new {TYPE=x.Type.Split('/').Last(), VALUE=x.Value });

    return Results.Ok(claims);
}).RequireAuthorization();

app.MapPost("logout", async(SignInManager<ApplicationUser> signInManager) =>
{
    await signInManager.SignOutAsync();
});

app.Run();
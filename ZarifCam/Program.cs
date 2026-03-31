using KampanyaYonetim.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using ZarifCam.Data;
using ZarifCam.IService;
using ZarifCam.Service;
using ZarifCam.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// ==================== SERVICES ====================
builder.Services.AddControllersWithViews();

// Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// ==================== DATABASE ====================
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer( // PostgreSQL yerine SQL Server kullanýyoruz
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure());
});

// ==================== SESSION & CACHE ====================
builder.Services.AddDistributedMemoryCache(); // In-memory cache
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// ==================== AUTHENTICATION ====================
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Admin/Login";
        options.AccessDeniedPath = "/Home/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
    });

// ==================== SERVICES (DEPENDENCY INJECTION) ====================
builder.Services.AddScoped<IWebUrunService, WebUrunService>();
builder.Services.AddScoped<IAnaSayfaService, AnaSayfaService>();
builder.Services.AddScoped<IKampanyaService, KampanyaService>();

// Database Services
//builder.Services.AddScoped<ISliderService, SliderService>();
//builder.Services.AddScoped<IKategoriService, KategoriService>();
//builder.Services.AddScoped<IKampanyaService, KampanyaService>();
//builder.Services.AddScoped<IUrunService, UrunService>();
//builder.Services.AddScoped<ISiparisService, SiparisService>();

// Admin Services
//builder.Services.AddScoped<IAdminAnaSayfaService, AdminAnaSayfaService>();
//builder.Services.AddScoped<IAdminUrunService, AdminUrunService>();
//builder.Services.AddScoped<IAdminKategoriService, AdminKategoriService>();
//builder.Services.AddScoped<IAdminKampanyaService, AdminKampanyaService>();

// File Upload Service
//builder.Services.AddScoped<IDosyaYuklemeService, DosyaYuklemeService>();

// Email Service
//builder.Services.AddScoped<IEmailService, EmailService>();

// ==================== HTTP CLIENT ====================
builder.Services.AddHttpClient("InstagramAPI", client =>
{
    client.BaseAddress = new Uri("https://graph.instagram.com/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// ==================== CORS (API için) ====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:3000", "https://zarifcam.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// ==================== API CONTROLLERS ====================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// ==================== API VERSIONING ====================
//builder.Services.AddApiVersioning(options =>
//{
//    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
//    options.AssumeDefaultVersionWhenUnspecified = true;
//    options.ReportApiVersions = true;
//});

// ==================== APPLICATION BUILDER ====================
var app = builder.Build();

// ==================== MIDDLEWARE PIPELINE ====================
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

// ==================== STATIC FILES ====================
app.UseHttpsRedirection();

// Özel static file konfigürasyonu
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Cache static files for 30 days
        ctx.Context.Response.Headers.Append(
            "Cache-Control",
            "public,max-age=2592000"); // 30 days
    }
});

// ==================== SESSION ====================
app.UseSession();

// ==================== ROUTING & AUTH ====================
app.UseRouting();

// CORS
app.UseCors("AllowFrontend");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// ==================== AREA ROUTING ====================
app.MapAreaControllerRoute(
    name: "Admin",
    areaName: "Admin",
    pattern: "Admin/{controller=Dashboard}/{action=Index}/{id?}");

// ==================== DEFAULT ROUTING ====================
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// ==================== API ROUTING ====================
app.MapControllers(); // API controller'lar için

// ==================== FALLBACK ====================
app.MapFallbackToController("Index", "Home");

// ==================== DATABASE MIGRATION ====================
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Otomatik migration (development'ta)
    if (app.Environment.IsDevelopment())
    {
        try
        {
            dbContext.Database.Migrate();
            Console.WriteLine("Database migration completed.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migration error: {ex.Message}");
        }
    }
}

// ==================== RUN ====================
app.Run();
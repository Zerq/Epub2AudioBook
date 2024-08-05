using System.Text.Json;
using Microsoft.Extensions.FileProviders;
using TabPlayer.Hubs;

var builder = WebApplication.CreateBuilder();
builder.WebHost.UseUrls(new string[] { "http://localhost:5117" });
builder.Services.AddCors();
builder.Services.AddControllers().AddJsonOptions(opt=> {
    opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

// builder.Services.AddSignalR()
//     .AddJsonProtocol(options =>
//     {
//         options.PayloadSerializerOptions.PropertyNamingPolicy = new LowerCaseNamingPolicy();
//     });

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNameCaseInsensitive = false;
    o.JsonSerializerOptions.PropertyNamingPolicy = null;
    o.JsonSerializerOptions.WriteIndented = true;
});

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var app = builder.Build();
app.UseCors(MyAllowSpecificOrigins);
//app.MapHub<EventHub>("/events");

app.UseRouting();
 
app.MapControllers();
app.MapGet("/test", () => "test123");

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapDefaultControllerRoute();
app.Start();

//  WebWindowNetCore.WebView.Create()
//   .InitialBounds(1200, 1800)
//   .Title("ABZ player")
//   .SetAppId("ABZPlayer")
//   .DebuggingEnabled()
//   .DefaultContextMenuEnabled()  
//   .SaveBounds()
//   .OnClosing(() =>
//   {
//       return true;
//   })
//   .Url("http://localhost:5117")
//   .Build()
//   .Run(); 
  
app.WaitForShutdown();
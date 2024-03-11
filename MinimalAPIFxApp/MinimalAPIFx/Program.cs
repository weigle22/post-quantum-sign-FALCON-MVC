using DataAccess.DbAccess;
using Microsoft.AspNetCore.Http.Features;
using MinimalAPIFx;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.OperationFilter<FileUploadOperationFilter>();
});

builder.Services.AddSingleton<ISqlDataAccess, SqlDataAccess>();
builder.Services.AddSingleton<IUserData, UserData>();

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 52428800; //50MB
    options.Limits.MaxRequestBufferSize = 302768;
    options.Limits.MaxRequestLineSize = 302768;
});

var app = builder.Build();

app.UseLognValidation();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.ConfigureApi();
app.ConfigureApiDynamic();
//app.ConfigureDemoDB();
app.ConfigureApiSigFileAppend();

app.Run();

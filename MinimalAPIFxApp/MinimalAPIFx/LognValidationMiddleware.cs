
namespace MinimalAPIFx
{
    public class LognValidationMiddleware
    {
        private readonly RequestDelegate _next;

        public LognValidationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/api/dyn"))
            {
                if (!int.TryParse(context.Request.Query["logn"], out int logn) || logn < 1 || logn > 10)
                {
                    context.Response.StatusCode = 400;
                    context.Response.ContentType = "text/plain";
                    await context.Response.WriteAsync("logn must be an int from 1 to 10");
                    return;
                }
            }

            await _next(context);
        }
    }

    public static class LognValidationMiddlewareExtensions
    {
        public static IApplicationBuilder UseLognValidation(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<LognValidationMiddleware>();
        }
    }
}

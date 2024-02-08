using BrunoZell.ModelBinding;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using static MinimalAPIFx.FalconModels;
namespace MinimalAPIFx;

public static class ApiFileHandler
{
    public static void ConfigureApiFileHandler(this WebApplication app)
    {
        // Mappings
        app.MapPost("api/file/GetMessageSignature2", GetMessageSignature2)
            .Accepts<IFormFile>("multipart/form-data");
    }


    private static IResult GetMessageSignature2(HttpRequest request)
    {
        try
        {
            if (!request.Form.Files.Any())
                return Results.BadRequest("Atleast one file is required");

            var privateKeyStr = request.Form["private_key_str"];

            foreach (var file in request.Form.Files)
            {
                using (var stream = new FileStream(@"D:\DEV FILES\MIT CAPSTONE\MIT CAPSTONE-repo\MinimalAPIFxApp\MinimalAPIFx\Upload\" + file.FileName, FileMode.CreateNew))
                {
                    file.CopyTo(stream);
                }
            }

            return Results.Ok("Files uploaded successfully");
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }


}

namespace MinimalAPIFx;

public static class ApiFileAppend
{
    public static void ConfigureApiFileAppend(this WebApplication app)
    {
        // Mappings
        app.MapPost("api/fileappend/GetMessageSignatureFileAppend", GetMessageSignatureFileAppend)
            .Accepts<IFormFile>("multipart/form-data");
    }

    private static async Task<IResult> GetMessageSignatureFileAppend(HttpRequest request)
    {
        try
        {
            const int logn = 10;
            var results = "";

            // Check if private key is provided
            var private_key_str = request.Form["private_key_str"];

            if (string.IsNullOrEmpty(private_key_str))
                return Results.BadRequest("Private key is required");

            // Check if there are files attached
            if (!request.Form.Files.Any())
                return Results.BadRequest("At least one file is required");

            // List to store any file upload problems
            List<string> uploadProblems = new List<string>();

            // Process each file asynchronously
            foreach (var file in request.Form.Files)
            {
                try
                {
                    // Process each file asynchronously
                    using (var memoryStream = new MemoryStream())
                    {
                        await file.CopyToAsync(memoryStream);

                        // Convert MemoryStream content to byte array
                        byte[] file_data = memoryStream.ToArray();

                        results = FalconWrapper.generateSignatureFromMemoryStream(file_data, private_key_str, logn);

                        //mangita ug pamaagi unsaon pag append sa signature sa files
                        //await AppendResultsToFile(filePath, results);
                    }
                }
                catch (Exception ex)
                {
                    uploadProblems.Add($"Error uploading file '{file.FileName}': {ex.Message}");
                }
            }

            if (uploadProblems.Any())
            {
                // If any upload problem occurred, return a problem result
                return Results.Problem(string.Join("\n", uploadProblems));
            }

            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            // Catch any unexpected exception and return a problem result
            return Results.Problem(ex.Message);
        }
    }

    private static async Task AppendResultsToFile(string filePath, string results)
    {
        using (StreamWriter sw = File.AppendText(filePath))
        {
            await sw.WriteLineAsync(results);
        }
    }
}


namespace MinimalAPIFx;

public static class ApiFile
{
    public static void ConfigureApiFile(this WebApplication app)
    {
        // Mappings
        app.MapPost("api/file/GetMessageSignature", GetMessageSignature)
            .Accepts<IFormFile>("multipart/form-data");

        app.MapPost("api/file/GetMessageVerification", GetMessageVerification)
            .Accepts<IFormFile>("multipart/form-data");

        app.MapPost("api/file/GetMessageSignatureStream", GetMessageSignatureStream)
            .Accepts<IFormFile>("multipart/form-data");

        app.MapPost("api/file/GetMessageVerificationStream", GetMessageVerificationStream)
            .Accepts<IFormFile>("multipart/form-data");
    }


    private static async Task<IResult> GetMessageSignature(HttpRequest request)
    {
        try
        {
            const int logn = 10;
            string uploadPath = "Upload/";
            var results = "";

            // Check if private key is provided
            var private_key_str = request.Form["private_key_str"];

            if (string.IsNullOrEmpty(private_key_str))
                return Results.BadRequest("Private key is required");

            if (!request.Form.Files.Any())
                return Results.BadRequest("At least one file is required");

            // Create directory if it doesn't exist
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // List to store any file upload problems
            List<string> uploadProblems = new List<string>();

            // Process each file asynchronously
            foreach (var file in request.Form.Files)
            {
                try
                {
                    string file_path = Path.Combine(uploadPath, file.FileName);
                    using (var stream = new FileStream(file_path, FileMode.Create))
                    {
                        // Copy file asynchronously
                        await file.CopyToAsync(stream);
                    }
                    results = FalconWrapper.generateSignatureFromFile(file_path, private_key_str, logn);

                    // Delete the file after generating results
                    File.Delete(file_path);
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

    private static async Task<IResult> GetMessageVerification(HttpRequest request)
    {
        try
        {
            const int logn = 10;
            string uploadPath = "Upload/";
            var results = "";

            // Check if private key is provided
            var public_key_str = request.Form["public_key_str"];

            if (string.IsNullOrEmpty(public_key_str))
                return Results.BadRequest("Public key is required");

            // Check if signature is provided
            var signature_str = request.Form["signature_str"];

            if (string.IsNullOrEmpty(signature_str))
                return Results.BadRequest("Signature is required");

            // Check if there are files is attached
            if (!request.Form.Files.Any())
                return Results.BadRequest("At least one file is required");

            // Create directory if it doesn't exist
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // List to store any file upload problems
            List<string> uploadProblems = new List<string>();

            // Process each file asynchronously
            foreach (var file in request.Form.Files)
            {
                try
                {
                    string file_path = Path.Combine(uploadPath, file.FileName);
                    using (var stream = new FileStream(file_path, FileMode.Create))
                    {
                        // Copy file asynchronously
                        await file.CopyToAsync(stream);
                    }
                    results = FalconWrapper.verifySignatureOfFile(file_path, signature_str, public_key_str, logn);

                    // Delete the file after generating results
                    File.Delete(file_path);
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

    private static async Task<IResult> GetMessageSignatureStream(HttpRequest request)
    {
        try
        {
            const int logn = 10;
            var results = "";

            // Check if private key is provided
            var private_key_str = request.Form["private_key_str"];

            if (string.IsNullOrEmpty(private_key_str))
                return Results.BadRequest("Private key is required");

            // Check if there are files is attached
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

    private static async Task<IResult> GetMessageVerificationStream(HttpRequest request)
    {
        try
        {
            const int logn = 10;
            var results = "";

            // Check if private key is provided
            var public_key_str = request.Form["public_key_str"];

            if (string.IsNullOrEmpty(public_key_str))
                return Results.BadRequest("Public key is required");

            // Check if signature is provided
            var signature_str = request.Form["signature_str"];

            if (string.IsNullOrEmpty(signature_str))
                return Results.BadRequest("Signature is required");

            // Check if there are files is attached
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

                        results = FalconWrapper.verifySignatureFromMemoryStream(file_data, signature_str, public_key_str, logn);

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
}

using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Net.Mime;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using static MinimalAPIFx.FalconModels;

namespace MinimalAPIFx
{
    public static class ApiFileSigAppend
    {
        public static void ConfigureApiSigFileAppend(this WebApplication app)
        {
            // Mappings
            app.MapPost("api/purefile/GetKeyPair", GetKeyPair);

            app.MapPost("api/purefile/GetPrivateKey", GetPrivateKey);

            app.MapPost("api/purefile/GetPublicKey", GetPublicKey)
                .Accepts<IFormFile>("multipart/form-data");
            app.MapPost("api/purefile/GetMessageSignature", GetMessageSignature)
                .Accepts<IFormFile>("multipart/form-data");
            app.MapPost("api/purefile/GetMessageVerification", GetMessageVerification)
                .Accepts<IFormFile>("multipart/form-data");
        }

        public class ZipFileResult : IResult
        {
            private readonly byte[] _zipContent;
            private readonly string _fileName;

            public ZipFileResult(byte[] zipContent, string fileName)
            {
                _zipContent = zipContent;
                _fileName = fileName;
            }

            public async Task ExecuteAsync(HttpContext httpContext)
            {
                httpContext.Response.ContentType = "application/zip";
                httpContext.Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{_fileName}\"");

                await httpContext.Response.Body.WriteAsync(_zipContent, 0, _zipContent.Length);
            }
        }

        private static IResult GetKeyPair()
        {
            try
            {
                const int logn = 10;
                var results = FalconWrapper.generateKeyPair(logn);
                var private_key_str = results.Split(',')[0].Trim();
                var public_key_str = results.Split(',')[1].Trim();

                // Create a memory stream to hold the zip file content
                using (var zipMemoryStream = new MemoryStream())
                {
                    // Create a zip archive
                    using (var zipArchive = new ZipArchive(zipMemoryStream, ZipArchiveMode.Create, true))
                    {
                        // Add private key to the zip archive
                        var privateKeyEntry = zipArchive.CreateEntry("private.key");
                        using (var privateKeyEntryStream = privateKeyEntry.Open())
                        using (var writer = new StreamWriter(privateKeyEntryStream))
                        {
                            writer.Write(private_key_str);
                        }

                        // Add public key to the zip archive
                        var publicKeyEntry = zipArchive.CreateEntry("public.key");
                        using (var publicKeyEntryStream = publicKeyEntry.Open())
                        using (var writer = new StreamWriter(publicKeyEntryStream))
                        {
                            writer.Write(public_key_str);
                        }
                    }

                    // Return the zip file content as a custom IResult
                    zipMemoryStream.Seek(0, SeekOrigin.Begin);
                    return new ZipFileResult(zipMemoryStream.ToArray(), "key_pair.zip");
                }
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        }

        private static IResult GetPrivateKey()
        {
            try
            {
                const int logn = 10;
                var results = FalconWrapper.generatePrivateKey(logn);
                var private_key_str = results;

                // Create a memory stream to hold the zip file content
                using (var zipMemoryStream = new MemoryStream())
                {
                    // Create a zip archive
                    using (var zipArchive = new ZipArchive(zipMemoryStream, ZipArchiveMode.Create, true))
                    {
                        // Add private key to the zip archive
                        var privateKeyEntry = zipArchive.CreateEntry("private.key");
                        using (var privateKeyEntryStream = privateKeyEntry.Open())
                        using (var writer = new StreamWriter(privateKeyEntryStream))
                        {
                            writer.Write(private_key_str);
                        }
                    }

                    // Return the zip file content as a custom IResult
                    zipMemoryStream.Seek(0, SeekOrigin.Begin);
                    return new ZipFileResult(zipMemoryStream.ToArray(), "private.zip");
                }
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        }

        private static async Task<IResult> GetPublicKey(HttpRequest request)
        {
            try
            {
                const int logn = 10;
                string private_key_str;
                var results = "";
                var private_key_File = request.Form.Files[0];

                // Check if the user file and sig file are present
                if (private_key_File == null)
                    return Results.BadRequest("Private key file is required");

                // Read the content of the sig file
                using (var privateKeyMemoryStream = new MemoryStream())
                {
                    await private_key_File.CopyToAsync(privateKeyMemoryStream);
                    private_key_str = Encoding.UTF8.GetString(privateKeyMemoryStream.ToArray());
                    results = FalconWrapper.generatePublicKey(private_key_str, logn);

                    // Create a zip archive
                    using (var zipArchive = new ZipArchive(privateKeyMemoryStream, ZipArchiveMode.Create, true))
                    {
                        // Add private key to the zip archive
                        var publicKeyEntry = zipArchive.CreateEntry("public.key");
                        using (var publicKeyEntryStream = publicKeyEntry.Open())
                        using (var writer = new StreamWriter(publicKeyEntryStream))
                        {
                            writer.Write(results);
                        }
                    }

                    // Return the zip file content as a custom IResult
                    privateKeyMemoryStream.Seek(0, SeekOrigin.Begin);
                    return new ZipFileResult(privateKeyMemoryStream.ToArray(), "public.zip");
                }

            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        }

        private static async Task<IResult> GetMessageSignature(HttpRequest request)
        {
            try
            {
                const int logn = 10;
                var signature = "";
                string private_key_str;

                // Check if there are files attached
                if (!request.Form.Files.Any())
                    return Results.BadRequest("At least one file is required");

                // Check if private key is provided
                var private_key_File = request.Form.Files[1];
                // Check if the user file and sig file are present
                if (private_key_File == null)
                    return Results.BadRequest("Private key file is required");

                // List to store any file upload problems
                List<string> uploadProblems = new List<string>();

                // Get the first file name to use for naming the zip file
                string firstFileName = request.Form.Files[0].FileName;
                string zipFileName = Path.GetFileNameWithoutExtension(firstFileName) + ".zip";

                // Read the content of the sig file
                using (var privateKeyMemoryStream = new MemoryStream())
                {
                    await private_key_File.CopyToAsync(privateKeyMemoryStream);
                    private_key_str = Encoding.UTF8.GetString(privateKeyMemoryStream.ToArray());

                    // Create a memory stream to hold the zip file content
                    using (var zipMemoryStream = new MemoryStream())
                    {
                        // Create a zip archive
                        using (var zipArchive = new ZipArchive(zipMemoryStream, ZipArchiveMode.Create, true))
                        {
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
                                        byte[] fileData = memoryStream.ToArray();

                                        // Generate signature
                                        signature = FalconWrapper.generateSignatureFromMemoryStream(fileData, private_key_str, logn);

                                        // Save original file to zip archive
                                        var entry = zipArchive.CreateEntry(file.FileName);
                                        using (var entryStream = entry.Open())
                                        {
                                            entryStream.Write(fileData, 0, fileData.Length);
                                        }

                                        // Save signature to .sig file
                                        string sigFileName = Path.GetFileNameWithoutExtension(file.FileName) + ".sig";
                                        var sigEntry = zipArchive.CreateEntry(sigFileName);
                                        using (var sigEntryStream = sigEntry.Open())
                                        using (var writer = new StreamWriter(sigEntryStream))
                                        {
                                            await writer.WriteAsync(signature);
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    uploadProblems.Add($"Error uploading file '{file.FileName}': {ex.Message}");
                                }
                            }
                        }

                        if (uploadProblems.Any())
                        {
                            // If any upload problem occurred, return a problem result
                            return Results.Problem(string.Join("\n", uploadProblems));
                        }

                        // Reset memory stream position to beginning
                        zipMemoryStream.Seek(0, SeekOrigin.Begin);

                        // Return the zip file as a custom IResult
                        return new ZipFileResult(zipMemoryStream.ToArray(), zipFileName);
                    }
                }
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
                var results = "";

                // Check if there are files attached
                if (request.Form.Files.Count < 3) // Ensure at least two files are attached
                    return Results.BadRequest("At least three files are required");

                // Extract files from the request
                var userFile = request.Form.Files[0];
                var sigFile = request.Form.Files[1];
                var publicKeyFile = request.Form.Files[2];

                // Check if the user file and sig file are present
                if (userFile == null || sigFile == null)
                    return Results.BadRequest("User file and Signature file are required");

                try
                {
                    // Read the content of the sig file
                    string signature_str;
                    using (var sigMemoryStream = new MemoryStream())
                    {
                        await sigFile.CopyToAsync(sigMemoryStream);
                        signature_str = Encoding.UTF8.GetString(sigMemoryStream.ToArray());
                    }

                    // Read the content of the public key file
                    string public_key_str;
                    using (var publicKeyMemoryStream = new MemoryStream())
                    {
                        await publicKeyFile.CopyToAsync(publicKeyMemoryStream);
                        public_key_str = Encoding.UTF8.GetString(publicKeyMemoryStream.ToArray());
                    }

                    // Process the user file
                    using (var userMemoryStream = new MemoryStream())
                    {
                        await userFile.CopyToAsync(userMemoryStream);
                        byte[] file_data = userMemoryStream.ToArray();

                        results = FalconWrapper.verifySignatureFromMemoryStream(file_data, signature_str, public_key_str, logn);
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem(ex.Message);
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
}

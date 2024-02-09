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

namespace MinimalAPIFx
{
    public static class ApiFileSigAppend
    {
        public static void ConfigureApiSigFileAppend(this WebApplication app)
        {
            // Mappings
            app.MapPost("api/fileappend/GetMessageSignatureFileAppend", GetMessageSignatureStreamAppend)
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

        private static async Task<IResult> GetMessageSignatureStreamAppend(HttpRequest request)
        {
            try
            {
                const int logn = 10;
                var signature = "";

                // Check if private key is provided
                var private_key_str = request.Form["private_key_str"];

                if (string.IsNullOrEmpty(private_key_str))
                    return Results.BadRequest("Private key is required");

                // Check if there are files attached
                if (!request.Form.Files.Any())
                    return Results.BadRequest("At least one file is required");

                // List to store any file upload problems
                List<string> uploadProblems = new List<string>();

                // Get the first file name to use for naming the zip file
                string firstFileName = request.Form.Files[0].FileName;
                string zipFileName = Path.GetFileNameWithoutExtension(firstFileName) + ".zip";

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
            catch (Exception ex)
            {
                // Catch any unexpected exception and return a problem result
                return Results.Problem(ex.Message);
            }
        }
    }
}

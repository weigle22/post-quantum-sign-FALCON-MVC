

using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace MinimalAPIFx
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            //throw new NotImplementedException();
            if(operation.RequestBody == null || !operation.RequestBody.Content.Any(x => x.Key.Equals("multipart/form-data", StringComparison.OrdinalIgnoreCase)))
            {
                return;
            }
            operation.Parameters.Clear();

            if (context.ApiDescription.ParameterDescriptions[0].Type == typeof(IFormFile) ||
                context.ApiDescription.ParameterDescriptions[0].Type == typeof(List<IFormFile>))
            {
                var uploadedFileMediaType = new OpenApiMediaType()
                {
                    Schema = new OpenApiSchema()
                    {
                        Type = "object",
                        Properties =
                        {
                            ["files"] = new OpenApiSchema()
                            {
                                Type = "array",
                                Items = new OpenApiSchema
                                {
                                    Type = "string",
                                    Format = "binary"
                                }
                            },
                            ["private_key_str"] = new OpenApiSchema
                            {
                                Type = "string",
                                Items = new OpenApiSchema
                                {
                                    Type = "string",
                                    Format = "text"
                                }
                            },
                            ["public_key_str"] = new OpenApiSchema
                            {
                                Type = "string",
                                Items = new OpenApiSchema
                                {
                                    Type = "string",
                                    Format = "text"
                                }
                            },
                            ["signature_str"] = new OpenApiSchema
                            {
                                Type = "string",
                                Items = new OpenApiSchema
                                {
                                    Type = "string",
                                    Format = "text"
                                }
                            }
                        },
                        Required = new HashSet<string>() { "files", "private_key_str", "public_key_str", "signature_str" }
                    }
                };
                operation.RequestBody = new OpenApiRequestBody()
                {
                    Content = { ["multipart/form-data"] = uploadedFileMediaType }
                };
            }
        }
    }
}

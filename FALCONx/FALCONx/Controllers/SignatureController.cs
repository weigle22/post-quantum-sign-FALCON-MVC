using FALCONx.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using static FALCONx.Models.FalconModels;

namespace FALCONx.Controllers
{
    [SessionTimeout]
    public class SignatureController : Controller
    {

        private readonly HttpClient _httpClient = HttpClientHelper.GetClient();
        FLCNX_DBEntities dbFlcn = new FLCNX_DBEntities();
        private DateTime dtNow = DateTime.Now;

        // GET: Signature
        [User]
        public ActionResult SignText()
        {
            return View();
        }

        public class SignParams
        {
            public string textMessage { get; set; }
            public HttpPostedFileBase privateKeyFile { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult> SignTextMessage(SignParams _SignParams)
        {
            var message = "Success";
            try
            {
                // Check if a file is uploaded
                if (_SignParams.privateKeyFile != null && _SignParams.privateKeyFile.ContentLength > 0)
                {
                    // Read the text content from the uploaded file
                    using (var reader = new StreamReader(_SignParams.privateKeyFile.InputStream))
                    {
                        string privateKeyText = await reader.ReadToEndAsync();

                        // Escape the private key text
                        string encodedPrivateKey = Uri.EscapeDataString(privateKeyText);
                        string encodedTextMessage = Uri.EscapeDataString(_SignParams.textMessage);
                        string apiUrl = $"api/GetMessageSignature?message={encodedTextMessage}&private_key_str={encodedPrivateKey}";

                        HttpResponseMessage response = await _httpClient.GetAsync(apiUrl);
                        Signature result = new Signature();

                        if (!response.IsSuccessStatusCode)
                        {
                            return Json(new
                            {
                                message = "Failed"
                            }, JsonRequestBehavior.AllowGet);
                        }

                        string data = response.Content.ReadAsStringAsync().Result;
                        result = JsonConvert.DeserializeObject<Signature>(data);

                        return Json(new
                        {
                            message,
                            result
                        }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new
                    {
                        message = "No file uploaded"
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    message = ex.Message,
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [User]
        public ActionResult SignFile()
        {
            return View();
        }


        public class SignFileParams
        {
            public HttpPostedFileBase userFile { get; set; }
            public HttpPostedFileBase privateKeyFile { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult> SignFileMessage(SignFileParams _SignFileParams)
        {
            try
            {
                if (_SignFileParams.userFile != null && _SignFileParams.privateKeyFile != null)
                {
                    // Assuming _httpClient is initialized in your controller
                    string apiUrl = "api/purefile/GetMessageSignature";

                    // Create a multipart form content to send files
                    var formData = new MultipartFormDataContent
                    {
                        { new StreamContent(_SignFileParams.userFile.InputStream), "userFile", _SignFileParams.userFile.FileName },
                        { new StreamContent(_SignFileParams.privateKeyFile.InputStream), "privateKeyFile", _SignFileParams.privateKeyFile.FileName }
                    };

                    // Send the POST request to the API endpoint
                    HttpResponseMessage response = await _httpClient.PostAsync(apiUrl, formData);

                    // Check if the request was successful
                    if (response.IsSuccessStatusCode)
                    {
                        // Get the content of the response
                        byte[] fileBytes = await response.Content.ReadAsByteArrayAsync();
                        string fileName = "downloaded_file.zip"; // Provide a default file name for the downloaded ZIP file

                        // Check if the response contains a file name
                        IEnumerable<string> contentDisposition;
                        if (response.Content.Headers.TryGetValues("Content-Disposition", out contentDisposition))
                        {
                            // Extract the file name from the content disposition header
                            string contentFileName = contentDisposition.FirstOrDefault()?.Split('=')[1].Trim('"');
                            fileName = contentFileName ?? fileName;
                        }

                        // Return the file for download
                        return File(fileBytes, "application/zip", fileName);
                    }
                    else
                    {
                        // Handle the case where the request was not successful
                        return Json(new { message = "Failed to call the API" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { message = "No file uploaded" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}
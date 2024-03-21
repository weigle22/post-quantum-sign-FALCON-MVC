using FALCONx.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using static FALCONx.Controllers.SignatureController;
using static FALCONx.Models.FalconModels;

namespace FALCONx.Controllers
{
    public class VerifyController : Controller
    {
        private readonly HttpClient _httpClient = HttpClientHelper.GetClient();
        FLCNX_DBEntities dbFlcn = new FLCNX_DBEntities();
        private DateTime dtNow = DateTime.Now;

        // GET: Verify
        public ActionResult VerifyText()
        {
            return View();
        }

        public class VerifyParams
        {
            public HttpPostedFileBase textMessageFile { get; set; }
            public HttpPostedFileBase textSignatureFile { get; set; }
            public HttpPostedFileBase publicKeyFile { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult> VerifyText(VerifyParams _VerifyParams)
        {
            var message = "Success";
            try
            {
                // Check if a file is uploaded
                if (
                    _VerifyParams.textMessageFile != null && _VerifyParams.textMessageFile.ContentLength > 0 &&
                    _VerifyParams.textSignatureFile != null && _VerifyParams.textSignatureFile.ContentLength > 0 &&
                    _VerifyParams.publicKeyFile != null && _VerifyParams.publicKeyFile.ContentLength > 0
                    
                    )
                {
                    // Read the text content from the uploaded file
                    string textMessageFileText, textSignatureFileText, publicKeyFileText;

                    using (var reader = new StreamReader(_VerifyParams.textMessageFile.InputStream))
                    {
                        textMessageFileText = await reader.ReadToEndAsync();
                    }

                    using (var reader = new StreamReader(_VerifyParams.textSignatureFile.InputStream))
                    {
                        textSignatureFileText = await reader.ReadToEndAsync();
                    }

                    using (var reader = new StreamReader(_VerifyParams.publicKeyFile.InputStream))
                    {
                        publicKeyFileText = await reader.ReadToEndAsync();
                    }
                    // Escape the text content
                    string encodedTextMessageFile = Uri.EscapeDataString(textMessageFileText);
                    string encodedTextSignatureFile = Uri.EscapeDataString(textSignatureFileText);
                    string encodedPublicKeyFile = Uri.EscapeDataString(publicKeyFileText);

                    // Assuming _httpClient is instantiated elsewhere
                    string apiUrl = $"api/GetMessageVerification?message={encodedTextMessageFile}&signature_str={encodedTextSignatureFile}&public_key_str={encodedPublicKeyFile}";

                    HttpResponseMessage response = await _httpClient.GetAsync(apiUrl);
                    Verification result = new Verification();

                    if (!response.IsSuccessStatusCode)
                    {
                        return Json(new
                        {
                            message = "Failed"
                        }, JsonRequestBehavior.AllowGet);
                    }

                    string data = await response.Content.ReadAsStringAsync();
                    result = JsonConvert.DeserializeObject<Verification>(data);

                    return Json(new
                    {
                        message,
                        result
                    }, JsonRequestBehavior.AllowGet);

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



    }
}
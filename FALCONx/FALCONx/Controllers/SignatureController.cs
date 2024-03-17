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
using static FALCONx.Models.FalconModels;

namespace FALCONx.Controllers
{
    public class SignatureController : Controller
    {

        private readonly HttpClient _httpClient = HttpClientHelper.GetClient();
        FLCNX_DBEntities dbFlcn = new FLCNX_DBEntities();
        private DateTime dtNow = DateTime.Now;

        // GET: Signature
        public ActionResult Index()
        {
            return View();
        }

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


    }
}
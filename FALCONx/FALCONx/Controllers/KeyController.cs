using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;
using FALCONx.Models;
using System.Linq;
using System.Web.Services.Description;
using static FALCONx.Models.FalconModels;
using System.Text;

namespace FALCONx.Controllers
{
    [SessionTimeout]
    public class KeyController : Controller
    {
        private readonly HttpClient _httpClient = HttpClientHelper.GetClient();
        FLCNX_DBEntities dbFlcn = new FLCNX_DBEntities();
        private DateTime dtNow = DateTime.Now;

        // GET: Key
        public ActionResult PrivateKey()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetUserKeys(tUserKey _tUserKey)
        {
            var userID = Session["userID"].ToString();
            var userKey = dbFlcn.tUserKeys
                .Where(a => a.userID == userID && (a.revoked == null || a.revoked == false))
                .FirstOrDefault();
            
            return Json(new { userKey }, JsonRequestBehavior.AllowGet);
        }

        public async Task<ActionResult> GeneratePrivateKey()
        {
            var message = "Success";
            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync("api/GetPrivateKey");
                PrivateKey result = new PrivateKey();

                if (!response.IsSuccessStatusCode)
                {
                    return Json(new
                    {
                        message = "Failed"
                    }, JsonRequestBehavior.AllowGet);
                }

                string data = response.Content.ReadAsStringAsync().Result;
                result = JsonConvert.DeserializeObject<PrivateKey>(data);

                return Json(new
                {
                    message,
                    result
                }, JsonRequestBehavior.AllowGet);
            }
            catch (HttpRequestException ex)
            {
                return Json(new
                {
                    message = ex.Message,
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult AcceptPrivateKey(tUserKey _tUserKey)
        {
            var userID = Session["userID"].ToString();
            var userKeyRec = dbFlcn.tUserKeys.Where(a => a.userID == userID && (a.revoked == null || a.revoked == false)).FirstOrDefault();
            var message = "Success";

            if (_tUserKey == null)
            {
                return Json(new
                {
                    message = "Invalid"
                }, JsonRequestBehavior.AllowGet);
            }

            if (userKeyRec != null)
            {
                return Json(new
                {
                    message = "Has Private Key"
                }, JsonRequestBehavior.AllowGet);
            }

            tUserKey userKeyData = new tUserKey
            {
                keyID = Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty).Substring(0, 30).ToUpper(),
                userID = userID,
                privateKey = _tUserKey.privateKey,
                revoked = false,
                dtCreated = dtNow,
                privAccepted = true
            };
            dbFlcn.tUserKeys.Add(userKeyData);
            try
            {
                dbFlcn.SaveChanges();
            }
            catch { message = "error"; }

            var userKey = dbFlcn.tUserKeys.Where(a => a.userID == userID && (a.revoked == null || a.revoked == false)).FirstOrDefault();

            return Json(new { message, userKey }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult PublicKey()
        {
            return View();
        }

        public async Task<ActionResult> GeneratePublicKey(tUserKey _tUserKey)
        {
            var message = "Success";

            try
            {
                string encodedPrivateKey = Uri.EscapeDataString(_tUserKey.privateKey);
                string apiUrl = $"api/GetPublicKey?private_key_str={encodedPrivateKey}";

                HttpResponseMessage response = await _httpClient.GetAsync(apiUrl);
                PublicKey result = new PublicKey();

                if (!response.IsSuccessStatusCode)
                {
                    return Json(new
                    {
                        message = "Failed"
                    }, JsonRequestBehavior.AllowGet);
                }

                string data = response.Content.ReadAsStringAsync().Result;
                result = JsonConvert.DeserializeObject<PublicKey>(data);

                return Json(new
                {
                    message,
                    result
                }, JsonRequestBehavior.AllowGet);
            }
            catch (HttpRequestException ex)
            {
                return Json(new
                {
                    message = ex.Message,
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult AcceptPublicKey(tUserKey _tUserKey)
        {
            var userID = Session["userID"].ToString();
            var userKeyRec = dbFlcn.tUserKeys.Where(a => a.keyID == _tUserKey.keyID).FirstOrDefault();
            var message = "Success";

            if (_tUserKey == null)
            {
                return Json(new
                {
                    message = "Invalid"
                }, JsonRequestBehavior.AllowGet);
            }

            if (userKeyRec == null)
            {
                return Json(new
                {
                    message = "No Keys Found"
                }, JsonRequestBehavior.AllowGet);
            }

            //userKeyRec.privateKey = null;
            userKeyRec.publicKey = _tUserKey.publicKey;
            userKeyRec.dtModified = dtNow;
            userKeyRec.pubAccepted = true;

            try
            {
                dbFlcn.SaveChanges();
            }
            catch { message = "error"; }

            var userKey = dbFlcn.tUserKeys.Where(a => a.userID == userID && (a.revoked == null || a.revoked == false)).FirstOrDefault();

            return Json(new { message, userKey }, JsonRequestBehavior.AllowGet);
        }
    }
}

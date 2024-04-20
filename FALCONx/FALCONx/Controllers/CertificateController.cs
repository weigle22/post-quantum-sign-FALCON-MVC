using FALCONx.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using static FALCONx.Models.FalconModels;
using static FALCONx.Controllers.CertificateController;
using static FALCONx.Controllers.SignatureController;
using static System.Collections.Specialized.BitVector32;
using System.Web.Services.Description;

namespace FALCONx.Controllers
{
    [SessionTimeout]
    public class CertificateController : Controller
    {

        private readonly HttpClient _httpClient = HttpClientHelper.GetClient();
        FLCNX_DBEntities dbFlcn = new FLCNX_DBEntities();
        private DateTime dtNow = DateTime.Now;

        // GET: Certificate
        public ActionResult Certify()
        {
            return View();
        }

        public class FileParams
        {
            public string userID { get; set; }
            public string fileType { get; set; }
            public HttpPostedFileBase imageFile { get; set; }
        }

        [HttpPost]
        public ActionResult UploadFile(FileParams _FileParams)
        {
            var message = "Success";
            try
            {
                // Check if a file is uploaded
                if (_FileParams.userID != null && _FileParams.imageFile.ContentLength > 0 )
                {
                    var record = dbFlcn.tUserImages.Where(a => a.userID == _FileParams.userID).FirstOrDefault();

                    if (record != null)
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            _FileParams.imageFile.InputStream.CopyTo(ms);

                            switch(_FileParams.fileType)
                            {
                                case "valid_id1": record.valid_id1 = ms.ToArray();
                                    break;
                                case "valid_id2": record.valid_id2 = ms.ToArray();
                                    break;
                                default:
                                    record.profile_picture = ms.ToArray();
                                    break;
                            } // Assuming profile_picture is a byte[] field in your database
                        }

                        dbFlcn.SaveChanges(); // Save changes to the database
                    }
                    else
                    {
                        message = "User not found";
                    }

                    //var session = dbFlcn.tUsers.Where(a => a.userID == _FileParams.userID).FirstOrDefault();

                    return Json(new
                    {
                        message,
                        //session
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

        public ActionResult GetImage(string userID, int type)
        {
            byte[] cover = GetImageFromDataBase(userID, type);

            if (cover != null)
            {
                return File(cover, "image/jpeg");
            }
            else
            {
                return null;
            }
        }

        public byte[] GetImageFromDataBase(string userID, int type)
        {
            switch (type)
            {
                case 1:
                    var valid_id1 = dbFlcn.tUserImages.Where(a => a.userID == userID).FirstOrDefault();
                    byte[] valid_id1_img = valid_id1 == null ? new byte[0] :  valid_id1.valid_id1;
                    return valid_id1_img;
                case 2:
                    var valid_id2 = dbFlcn.tUserImages.Where(a => a.userID == userID).FirstOrDefault();
                    byte[] valid_id2_img = valid_id2 == null ? new byte[0] : valid_id2.valid_id2;
                    return valid_id2_img;
                default:
                    var profile_picture = dbFlcn.tUserImages.Where(a => a.userID == userID).FirstOrDefault();
                    byte[] profile_picture_img = profile_picture == null ? new byte[0] : profile_picture.profile_picture;
                    return profile_picture_img;
            }
        }

        [HttpPost]
        public ActionResult UpdateUser(tUser _tUser)
        {
            var userID = Session["userID"].ToString();
            var user = dbFlcn.tUsers.Where(a => a.userID == _tUser.userID).FirstOrDefault();
            var message = "Success";

            if (_tUser == null)
            {
                return Json(new
                {
                    message = "Invalid"
                }, JsonRequestBehavior.AllowGet);
            }

            user.given_name = _tUser.given_name;
            user.family_name = _tUser.family_name;
            user.middle_name = _tUser.family_name;
            user.company = _tUser.company;
            user.position = _tUser.position;
            user.mobile_number = _tUser.mobile_number;
            user.address = _tUser.address;

            try
            {
                dbFlcn.SaveChanges();
            }
            catch { message = "Error"; }

            var session = dbFlcn.tUsers.Where(a => a.userID == userID).FirstOrDefault();

            return Json(new { message, session }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<ActionResult> CertifyUser(tUser _tUser, tUserKey _tUserKey)
        {
            var userID = Session["userID"].ToString();
            var userRec = dbFlcn.tUsers.Where(a => a.userID == _tUser.userID).FirstOrDefault();
            var userKeyRec = dbFlcn.tUserKeys.Where(a => a.userID == _tUserKey.userID && (a.revoked == null || a.revoked == false)).FirstOrDefault();

            var message = "Success";

            if (userRec == null)
            {
                return Json(new
                {
                    message = "User not found",
                }, JsonRequestBehavior.AllowGet);
            }

            if (userKeyRec == null)
            {
                return Json(new
                {
                    message = "User keys not found",
                }, JsonRequestBehavior.AllowGet);
            }

            string jsonString = JsonConvert.SerializeObject(userRec);

            string encodedPrivateKey = Uri.EscapeDataString(_tUserKey.privateKey);
            string encodedTextMessage = Uri.EscapeDataString(jsonString.ToString());
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
            string hashedPrivateKey = Hasher.HashPassword(_tUserKey.privateKey);

            string data = response.Content.ReadAsStringAsync().Result;
            result = JsonConvert.DeserializeObject<Signature>(data);
            userRec.signature = result.signature_str;
            userKeyRec.privateKey = hashedPrivateKey;

            dbFlcn.SaveChanges();

            var session = dbFlcn.tUsers.Where(a => a.userID == _tUser.userID).FirstOrDefault();
            var sessionKeys = dbFlcn.tUserKeys.Where(a => a.userID == _tUserKey.userID && (a.revoked == null || a.revoked == false)).FirstOrDefault();

            return Json(new
            {
                message,
                session,
                sessionKeys
            }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public async Task<ActionResult> VerifyPrivateKey(tUserKey _tUserKey)
        {
            // Retrieve userID from session
            var userID = Session["userID"]?.ToString();

            // Check if userID is null or empty
            if (string.IsNullOrEmpty(userID))
            {
                return Json(new { message = "User ID not found in session" }, JsonRequestBehavior.AllowGet);
            }

            // Retrieve user record including necessary fields
            var userRec = await dbFlcn.tUsers
                .Where(a => a.userID == userID)
                .Select(a => new
                {
                    a.userID,
                    a.email,
                    a.given_name,
                    a.family_name,
                    a.middle_name,
                    a.company,
                    a.position,
                    a.mobile_number,
                    a.address,
                    a.username,
                    a.password,
                    a.date_added,
                    a.role,
                    a.isActive
                })
                .FirstOrDefaultAsync();

            // Check if user record is found
            if (userRec == null)
            {
                return Json(new { message = "User record not found" }, JsonRequestBehavior.AllowGet);
            }

            // Retrieve user key record
            var userKeyRec = await dbFlcn.tUserKeys
                .Where(a => a.userID == userID && (a.revoked == null || a.revoked == false))
                .FirstOrDefaultAsync();

            // Check if user key record is found
            if (userKeyRec == null)
            {
                return Json(new { message = "User keys not found" }, JsonRequestBehavior.AllowGet);
            }

            string hashedPrivateKey = Hasher.HashPassword(_tUserKey.privateKey);

            var userPrivateKeyRec = dbFlcn.tUserKeys.Where(a => a.privateKey == hashedPrivateKey).FirstOrDefault();

            if ( userPrivateKeyRec == null)
            {
                return Json(new { message = "Invalid Private Key" }, JsonRequestBehavior.AllowGet);
            }

            if (userPrivateKeyRec.revoked == true)
            {
                return Json(new { message = "Private Key Revoked" }, JsonRequestBehavior.AllowGet);
            }

            // Serialize user record to JSON
            string jsonString = JsonConvert.SerializeObject(userRec);

            // Encode private key and JSON message
            string encodedPrivateKey = Uri.EscapeDataString(_tUserKey.privateKey); // uploaded private key
            string encodedTextMessage = Uri.EscapeDataString(jsonString.ToString()); // certified user data

            // Sign the message with the private key
            string apiUrlSignatory = $"api/GetMessageSignature?message={encodedTextMessage}&private_key_str={encodedPrivateKey}";
            HttpResponseMessage signatoryResponse = await _httpClient.GetAsync(apiUrlSignatory);

            // Check if signing process failed
            if (!signatoryResponse.IsSuccessStatusCode)
            {
                return Json(new { message = "Failed to generate signature at this moment" }, JsonRequestBehavior.AllowGet);
            }

            // Deserialize signature from response
            string signatureData = await signatoryResponse.Content.ReadAsStringAsync();
            Signature result = JsonConvert.DeserializeObject<Signature>(signatureData);

            // Check if signature is valid
            if (string.IsNullOrEmpty(result?.signature_str))
            {
                return Json(new { message = "Unable to generate signature at this moment" }, JsonRequestBehavior.AllowGet);
            }

            // Encode signature and public key
            string encodedSignature = Uri.EscapeDataString(result.signature_str); // Signature from private key
            string encodedPublicKey = Uri.EscapeDataString(userKeyRec.publicKey); // Public key from user record

            // Verify the signature with the public key
            string apiUrlVerification = $"api/GetMessageVerification?message={encodedTextMessage}&signature_str={encodedSignature}&public_key_str={encodedPublicKey}";
            HttpResponseMessage verificationResponse = await _httpClient.GetAsync(apiUrlVerification);

            // Check if verification process failed
            if (!verificationResponse.IsSuccessStatusCode)
            {
                return Json(new { message = "Failed to verify signature at this moment" }, JsonRequestBehavior.AllowGet);
            }

            // Deserialize verification result from response
            string verificationData = await verificationResponse.Content.ReadAsStringAsync();
            Verification verificationResult = JsonConvert.DeserializeObject<Verification>(verificationData);
            Session["verificationResult"] = verificationResult.result;

            // Return success message and verification result
            return Json(new { message = "Success", verificationResult }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult Users()
        {
            var users = dbFlcn.tUsers
                .Where(a => a.isActive == true)
                .Select(a => new
                {
                    a.userID,
                    full_name = "@" + a.username + ": " + a.given_name + " " + a.family_name,
                    a.username
                })
                .ToList();

            return Json(new { users }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult SignerKey(string userID)
        {
            var signerKey = dbFlcn.tUserKeys
                .Where(a => a.userID == userID && (a.revoked == null || a.revoked == false))
                .Select(a => new
                {
                    a.publicKey,
                    a.revoked
                })
                .FirstOrDefault();

            return Json(new { signerKey }, JsonRequestBehavior.AllowGet);

        }

        public ActionResult Revocation()
        {
            return View();
        }

        [HttpPost]
        public ActionResult RevokeUserKey(tUser _tUser, tUserKey _tUserKey)
        {
            var userID = Session["userID"].ToString();
            var userRec = dbFlcn.tUsers.Where(a => a.userID == _tUser.userID).FirstOrDefault();
            var userKeyRec = dbFlcn.tUserKeys.Where(a => a.userID == _tUserKey.userID && (a.revoked == null || a.revoked == false)).FirstOrDefault();

            var message = "Success";

            if (userRec == null)
            {
                return Json(new
                {
                    message = "User not found",
                }, JsonRequestBehavior.AllowGet);
            }

            if (userKeyRec == null)
            {
                return Json(new
                {
                    message = "User keys not found",
                }, JsonRequestBehavior.AllowGet);
            }

            userKeyRec.revoked = true;
            userKeyRec.dtRevoked = DateTime.Now;
            userRec.signature = null;

            dbFlcn.SaveChanges();

            var session = dbFlcn.tUsers.Where(a => a.userID == _tUser.userID).FirstOrDefault();
            var sessionKeys = dbFlcn.tUserKeys.Where(a => a.userID == _tUserKey.userID && (a.revoked == null || a.revoked == false)).FirstOrDefault();

            return Json(new
            {
                message,
                session,
                sessionKeys
            }, JsonRequestBehavior.AllowGet);

        }

    }
}
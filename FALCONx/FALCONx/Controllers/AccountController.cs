using System;
using System.Linq;
using System.Web.Mvc;
using FALCONx.Models;

namespace FALCONx.Controllers
{
    public class AccountController : Controller
    {
        FLCNX_DBEntities dbFlcn = new FLCNX_DBEntities();
        private DateTime dtNow = DateTime.Now;


        public ActionResult SignOut()
        {
            Session.RemoveAll();
            return RedirectToAction("Index", "Home");
        }

        // GET: Account
        public ActionResult SignIn()
        {
            //var clientId = "128694056230-81hbfpiprlfgr0g7f261ii0r9q5f5q4b.apps.googleusercontent.com";
            //var url = "https://localhost:44335/Home/About";
            //var response = GoogleAuth.GetAuthUrl(clientId, url);
            //ViewBag.response = response;

            return View();
        }

        public ActionResult SignUp()
        {
            return View();
        }

        [HttpPost]
        public ActionResult SignUpUser(tUser _tUser)
        {
            var response = "ok";
            var message = "success";
            var record = dbFlcn.tUsers.Where(a => a.email == _tUser.email).FirstOrDefault();

            if (_tUser == null)
            {
                return Json(new
                {
                    message = "invalid"
                }, JsonRequestBehavior.AllowGet);
            }

            if (record != null)
            {
                return Json(new
                {
                    message = "exists"
                }, JsonRequestBehavior.AllowGet);
            }

            string hashedPassword = Hasher.HashPassword(_tUser.password);

            // Add user record
            tUser user = new tUser
            {
                userID = "FLCN" + Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty).Substring(0, 26).ToUpper(),
                email = _tUser.email,
                username = _tUser.username,
                password = hashedPassword,
                date_added = dtNow,
                isActive = true
            };
            dbFlcn.tUsers.Add(user);

            // Add user image record
            tUserImage userImageData = new tUserImage
            {
                recNo = Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty).Substring(0, 20).ToUpper(),
                userID = user.userID
            };
            dbFlcn.tUserImages.Add(userImageData);

            try
            {
                dbFlcn.SaveChanges();
            }
            catch { message = "error"; }
            return Json(new { message, response }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult SignInUser(tUser _tUser)
        {
            
            var message = "success";
            var record = dbFlcn.tUsers.Where(a => a.email == _tUser.email).FirstOrDefault();

            if (_tUser == null)
            {
                return Json(new
                {
                    message = "invalid"
                }, JsonRequestBehavior.AllowGet);
            }

            if (record == null)
            {
                return Json(new
                {
                    message = "unauthorized"
                }, JsonRequestBehavior.AllowGet);
            }

            bool verificationResult = Hasher.VerifyPassword(record.password, _tUser.password);

            if (record.email == _tUser.email && verificationResult == true)
            {
                var key = dbFlcn.tUserKeys.Where(a => a.userID == _tUser.userID && (a.revoked == false || a.revoked == null)).FirstOrDefault();
                var userImage = dbFlcn.tUserImages.Where(a => a.userID == _tUser.userID).FirstOrDefault();

                Session["userID"] = record.userID;
                Session["username"] = record.username ?? "";
                Session["role"] = record.role ?? "";
                Session["family_name"] = record.family_name ?? "";
                Session["signature"] = record.signature ?? "";
                Session["profile_picture"] = userImage == null ? new byte[0] : userImage.profile_picture;
                Session["publicKey"] = key != null ? key.publicKey : "";
                Session["verificationResult"] = "clear";

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { message = "invalid credentials" }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}
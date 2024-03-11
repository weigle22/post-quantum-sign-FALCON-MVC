using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FALCONx.Models;
using GoogleAuthentication.Services;
using System.Security.Cryptography;
using System.Text;
using System.Data.Entity;

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
            var clientId = "128694056230-81hbfpiprlfgr0g7f261ii0r9q5f5q4b.apps.googleusercontent.com";
            var url = "https://localhost:44335/Home/About";
            var response = GoogleAuth.GetAuthUrl(clientId, url);
            ViewBag.response = response;

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

            tUser user = new tUser
            {
                userID = "FLCN" + Guid.NewGuid().ToString().Replace("-", string.Empty).Replace("+", string.Empty).Substring(0, 26).ToUpper(),
                email = _tUser.email,
                password = hashedPassword,
                dtAdded = dtNow,
                isActive = true
            };
            dbFlcn.tUsers.Add(user);

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

            if (record == null)
            {
                return Json(new
                {
                    message = "unauthorized"
                }, JsonRequestBehavior.AllowGet);
            }

            string hashedPassword = Hasher.HashPassword(_tUser.password);

            if(record.email == _tUser.email && Hasher.VerifyPassword(hashedPassword, _tUser.password))
            {
                var key = dbFlcn.tUserKeys.Where(a => a.userID == _tUser.userID && (a.revoked == false || a.revoked == null)).FirstOrDefault();

                Session["userID"] = record.userID;
                Session["username"] = record.username ?? "";
                Session["role"] = record.role ?? "";
                Session["family_name"] = record.family_name ?? "";
                Session["signature"] = record.signature ?? "";
                Session["picture"] = record.picture ?? "";
                Session["publicKey"] = key != null ? key.publicKey : "";

                return Json(new { message, response }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { message = "invalid credentials" }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}
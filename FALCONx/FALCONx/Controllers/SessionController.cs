using FALCONx.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static System.Collections.Specialized.BitVector32;

namespace FALCONx.Controllers
{
    [SessionTimeout]
    public class SessionController : Controller
    {
        FLCNX_DBEntities dbFlcn = new FLCNX_DBEntities();

        // GET: Session
        public JsonResult GetSession()
        {
            
            var userID = Session["userID"].ToString();

            var session = dbFlcn.tUsers.Where(a => a.userID == userID).FirstOrDefault();

            var sessionKeys = dbFlcn.tUserKeys.Where(a => a.userID == userID && (a.revoked == false || a.revoked == null)).FirstOrDefault();

            var result = Json(new
            {
                session,
                sessionKeys
            }, JsonRequestBehavior.AllowGet);

            result.MaxJsonLength = int.MaxValue;
            return result;
        }

        public JsonResult ClearVerificationResult()
        {
            Session["verificationResult"] = "clear";
            var verificationResult = Session["verificationResult"];
            return Json(new
            {
                verificationResult
            }, JsonRequestBehavior.AllowGet);
        }

    }
}
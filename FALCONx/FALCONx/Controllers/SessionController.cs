using FALCONx.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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
            var username = Session["username"].ToString();
            var role = Session["role"].ToString();
            var family_name = Session["family_name"].ToString();
            var signature = Session["signature"]?.ToString();
            var picture = Session["picture"]?.ToString();
            var publicKey = Session["publicKey"]?.ToString();

            return Json(new
            {
                userID,
                username,
                role,
                family_name,
                picture,
                signature,
                publicKey
            }, JsonRequestBehavior.AllowGet);
        }
    }
}
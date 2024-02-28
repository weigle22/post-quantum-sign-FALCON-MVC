using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FALCONx.Controllers
{
    public class KeyController : Controller
    {
        // GET: Key
        public ActionResult PrivateKey()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GeneratePrivateKey()
        {
            var msg = "Success";

            return Json(new
            {
                msg
            }, JsonRequestBehavior.AllowGet);
        }
    }
}
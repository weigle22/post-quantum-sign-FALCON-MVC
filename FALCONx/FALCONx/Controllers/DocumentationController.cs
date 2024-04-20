using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FALCONx.Controllers
{
    public class DocumentationController : Controller
    {
        // GET: Documentation
        public ActionResult Introduction()
        {
            return View();
        }

        public ActionResult ApiDocumentation()
        {
            return View();
        }
    }
}
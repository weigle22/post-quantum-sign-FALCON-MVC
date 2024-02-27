using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using GoogleAuthentication.Services;

namespace FALCONx.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        //public ActionResult About()
        //{
        //    ViewBag.Message = "Your application description page.";

        //    return View();
        //}

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public async Task<ActionResult> About(string code)
        {
            if (code == "ok")
            {
                return View();
            } 
            else
            {
                var clientId = "128694056230-81hbfpiprlfgr0g7f261ii0r9q5f5q4b.apps.googleusercontent.com";
                var url = "https://localhost:44335/Home/About";
                var clientsecret = "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";
                var token = await GoogleAuth.GetAuthAccessToken(code, clientId, clientsecret, url);

                var userProfile = await GoogleAuth.GetProfileResponseAsync(token.AccessToken.ToString());
                ViewBag.Message = userProfile.ToString();
                return View();
            }

            
        }
    }
}
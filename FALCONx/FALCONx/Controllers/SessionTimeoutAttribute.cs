using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;

namespace FALCONx.Controllers
{
    public class SessionTimeoutAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext ctx = HttpContext.Current;
            try
            {
                if (ctx.Session["userID"] == null)
                {
                    filterContext.Result = new RedirectResult("~/Account/SignOut");
                }

                return;
            }
            catch (Exception)
            {
                filterContext.Result = new RedirectResult("~/Account/SignOut");
                return;
            }
        }
    }

    public class UserAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext ctx = HttpContext.Current;
            try
            {
                if (ctx.Session["userID"] == null)
                {
                    filterContext.Result = new RedirectResult("~/Account/SignOut");
                }

                var userID = ctx.Session["userID"].ToString();
                var verificationResult = ctx.Session["verificationResult"].ToString();

                if (verificationResult != "0")
                {
                    filterContext.Result = new RedirectResult("~/Signa/Home");
                }

                return;
            }
            catch (Exception)
            {
                filterContext.Result = new RedirectResult("~/Account/SignOut");
                return;
            }
            //base.OnActionExecuting(filterContext);
        }
    }

}
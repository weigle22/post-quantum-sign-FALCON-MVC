using System;
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
}
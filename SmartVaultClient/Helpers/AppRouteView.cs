using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using SmartVaultClient.Services;

namespace SmartVaultClient.Helpers;

public class AppRouteView : RouteView
{
    [Inject]
    public required NavigationManager NavigationManager { get; set; }

    [Inject]
    public required IAccountService AccountService { get; set; }

    protected override void Render(RenderTreeBuilder builder)
    {
        var authorize =
            Attribute.GetCustomAttribute(RouteData.PageType, typeof(AuthorizeAttribute)) != null;
        if (authorize && AccountService.User == null)
        {
            var returnUrl = WebUtility.UrlEncode(new Uri(NavigationManager.Uri).PathAndQuery);
            NavigationManager.NavigateTo($"account/login?returnUrl={returnUrl}");
        }
        else
        {
            base.Render(builder);
        }
    }
}

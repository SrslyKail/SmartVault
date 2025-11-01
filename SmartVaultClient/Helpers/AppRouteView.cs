using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using SmartVaultClient.Services;

namespace SmartVaultClient.Helpers;

/// <summary>
/// Custom RouteView used for most pages.
/// The only difference from RouteView is that this has its own authorization logic.
/// </summary>
public class AppRouteView : RouteView
{
    [Inject]
    public required NavigationManager NavigationManager { get; set; }

    [Inject]
    public required IAccountService AccountService { get; set; }

    protected override void Render(RenderTreeBuilder builder)
    {
        bool userAuthorize = false;
        bool adminAuthorize = false; // Role = "Admin"

        // Using reflection to identify pages that have the [Authorize] attribute
        var attribute = Attribute.GetCustomAttribute(
            RouteData.PageType,
            typeof(AuthorizeAttribute)
        );

        // decide authorization level
        if (
            attribute is AuthorizeAttribute authorizeAttribute
            && authorizeAttribute.Roles?.Contains(
                "Admin",
                StringComparison.InvariantCultureIgnoreCase
            ) == true
        )
        {
            adminAuthorize = true;
        }
        else if (attribute is not null)
        {
            userAuthorize = true;
        }

        // check current authorization level and redirect
        if (userAuthorize && AccountService.User == null)
        {
            var returnUrl = WebUtility.UrlEncode(new Uri(NavigationManager.Uri).PathAndQuery);
            NavigationManager.NavigateTo($"account/login?returnUrl={returnUrl}");
        }
        else if (adminAuthorize && AccountService.User?.IsAdmin != true)
        {
            if (AccountService.User == null)
            {
                var returnUrl = WebUtility.UrlEncode(new Uri(NavigationManager.Uri).PathAndQuery);
                NavigationManager.NavigateTo($"account/login?returnUrl={returnUrl}");
            }
            else
            {
                // TODO: have specific page for user not having admin privileges
                // richard says to use code 418 :)
            }
        }
        else
        {
            base.Render(builder);
        }
    }
}

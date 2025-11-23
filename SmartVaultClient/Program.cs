using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using SmartVaultClient.Services;

namespace SmartVaultClient;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);
        builder.RootComponents.Add<App>("app");

        builder
            .Services.AddScoped<IAccountService, AccountService>()
            .AddScoped<IAlertService, AlertService>()
            .AddScoped<IHttpService, HttpService>();

        // configure http client
        builder.Services.AddScoped(x =>
        {
            var apiUrl = new Uri(
                builder.Configuration["apiUrl"] ?? throw new Exception("apiUrl not set in appsettings.json file")
            );

            // use fake backend if "fakeBackend" is "true" in appsettings.json
            // if (builder.Configuration["fakeBackend"] == "true")
            // {
            //     return new HttpClient(fakeBackendHandler) { BaseAddress = apiUrl };
            // }

            return new HttpClient() { BaseAddress = apiUrl };
        });

        var host = builder.Build();

        var accountService = host.Services.GetRequiredService<IAccountService>();
        await accountService.Initialize();

        await host.RunAsync();
    }
}

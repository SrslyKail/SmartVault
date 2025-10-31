using Microsoft.AspNetCore.Components;
using SmartVaultClient.Models;
using SmartVaultClient.Models.Account;

namespace SmartVaultClient.Services;

public interface IAccountService
{
    User? User { get; }
    Task Initialize();
    Task Login(Login model);
    Task Logout();
    Task Register(Registration model);
    Task<IList<User>> GetAll();
    Task<User> GetById(string id);
    Task Delete(string id);
}

public class AccountService(
    IHttpService httpService,
    NavigationManager navigationManager,
    ILocalStorageService localStorageService
) : IAccountService
{
    private readonly IHttpService _httpService = httpService;
    private readonly NavigationManager _navigationManager = navigationManager;
    private readonly ILocalStorageService _localStorageService = localStorageService;
    private readonly string _userKey = "user";

    public User? User { get; private set; }

    public async Task Initialize()
    {
        User = await _localStorageService.GetItem<User>(_userKey);
    }

    public async Task Login(Login model)
    {
        User = await _httpService.Post<User>("/users/authenticate", model);
        await _localStorageService.SetItem(_userKey, User);
    }

    public async Task Logout()
    {
        User = null;
        await _localStorageService.RemoveItem(_userKey);
        _navigationManager.NavigateTo("account/login");
    }

    public async Task Register(Registration model)
    {
        await _httpService.Post("/users/register", model);
    }

    public async Task<IList<User>> GetAll()
    {
        return await _httpService.Get<IList<User>>("/users");
    }

    public async Task<User> GetById(string id)
    {
        return await _httpService.Get<User>($"/users/{id}");
    }

    public async Task Delete(string id)
    {
        await _httpService.Delete($"/users/{id}");

        // auto logout if the logged in user deleted their own record
        if (id == User?.Id)
            await Logout();
    }
}

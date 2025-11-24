using Microsoft.AspNetCore.Components;
using SmartVaultClient.Models;
using SmartVaultClient.Models.Account;

namespace SmartVaultClient.Services;

public interface IAccountService
{
    User? User { get; }
    Task Initialize();
    Task Login(LoginRequestDTO model);
    Task Logout();
    Task Register(RegistrationRequestDTO model);
    Task<IList<User>> GetAll();
    Task<User> GetById(string id);
    Task Delete(string id);
}

public class AccountService(IHttpService httpService, NavigationManager navigationManager)
    : IAccountService
{
    private readonly IHttpService _httpService = httpService;
    private readonly NavigationManager _navigationManager = navigationManager;
    private readonly string _userKey = "user";

    public User? User { get; private set; }

    // don't cache anything in local storage
    public async Task Initialize()
    {
        // get user from API, not from local storage
        User = await GetCurrentUser();
    }

    // server won't send anything back on login, so we can't get the user information just from a log in
    public async Task Login(LoginRequestDTO model)
    {
        await _httpService.Post<RegistrationResponseDTO>("/api/auth/login", model);
    }

    public async Task Logout()
    {
        await Task.Run(() =>
        {
            User = null; // don't cache anything in local storage
            _navigationManager.NavigateTo("/api/auth/logout");
        });
        
    }

    public async Task Register(RegistrationRequestDTO model)
    {
        await _httpService.Post("/api/auth/signup", model);
    }

    public async Task<User> GetCurrentUser()
    {
        User = await _httpService.Get<User>("/api/auth/me"); // todo: ensure cookies are in header
        return User;
    }

    // admin only
    public async Task<IList<User>> GetAll()
    {
        return await _httpService.Get<IList<User>>("/users");
    }

    // id not needed, server already knows who's sending the request from the token
    public async Task<User> GetById(string id)
    {
        return await _httpService.Get<User>($"/users/{id}");
    }

    // admin only
    public async Task Delete(string id)
    {
        await _httpService.Delete($"/users/{id}");

        // auto logout if the logged in user deleted their own record
        if (id == User?.Id)
            await Logout();
    }

    /*
    one to make someone an admin (use PATCH)
    one to delete a user (use DELETE)
    one to send the prompt like you said
    one to get another user's information
    */
}

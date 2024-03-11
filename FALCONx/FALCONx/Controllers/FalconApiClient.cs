using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Threading.Tasks;

public class ApiService
{
    private readonly HttpClient _client;

    public ApiService(HttpClient client)
    {
        _client = client ?? throw new ArgumentNullException(nameof(client));
        _client.BaseAddress = new Uri("http://localhost:8082/"); // Update with your API base URL
    }

    public async Task<int> GetPrivKeySize()
    {
        var response = await _client.GetAsync("/api/GetPrivKeySize");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<int>(content);
    }

    // Implement other methods for other endpoints similarly
}

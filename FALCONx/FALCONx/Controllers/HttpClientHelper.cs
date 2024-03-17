using System;
using System.Net.Http;

public static class HttpClientHelper
{
    private static readonly HttpClient _httpClient;
    private static readonly Uri baseAddress = new Uri("http://localhost:8082/");

    static HttpClientHelper()
    {
        _httpClient = new HttpClient();
        _httpClient.BaseAddress = baseAddress;
    }

    public static HttpClient GetClient()
    {
        return _httpClient;
    }
}

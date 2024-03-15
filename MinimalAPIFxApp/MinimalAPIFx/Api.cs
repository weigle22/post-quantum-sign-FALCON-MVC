using Microsoft.AspNetCore.Mvc;
using static MinimalAPIFx.FalconModels;

namespace MinimalAPIFx;

public static class Api
{
    public static void ConfigureApi(this WebApplication app)
    {
        // Mappings
        // ====================== STANDARD SECURITY ======================
        // dll miscellaneous functions
        app.MapGet("/api/sample", sample);
        app.MapGet("/api/GetPrivKeySize", GetPrivKeySize);
        app.MapGet("/api/GetPublKeySize", GetPublKeySize);
        app.MapGet("/api/GetTmpsizeKeygen", GetTmpsizeKeygen);

        // dll main functions
        app.MapGet("/api/GetKeyPair", GetKeyPair);
        app.MapGet("/api/GetPrivateKey", GetPrivateKey);
        app.MapGet("/api/GetPublicKey", GetPublicKey);
        app.MapGet("/api/GetMessageSignature", GetMessageSignature);
        app.MapGet("/api/GetMessageVerification", GetMessageVerification);

    }

    private static IResult sample()
    {
        try
        {
            var results = "Success";
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    // ====================== STANDARD SECURITY ======================
    private static IResult GetPrivKeySize()
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.falcon_dll_falcon_privkey_size(logn);
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetPublKeySize()
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.falcon_dll_falcon_pubkey_size(logn);
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetTmpsizeKeygen()
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.falcon_dll_falcon_tmpsize_keygen(logn);
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetKeyPair()
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.generateKeyPair(logn);
            var keyPair = new KeyPair
            {
                logn = logn,
                private_key_str = results.Split(',')[0].Trim(),
                public_key_str = results.Split(',')[1].Trim()
            };
            return Results.Ok(keyPair);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetPrivateKey()
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.generatePrivateKey(logn);
            var keyPair = new PrivateKey
            {
                private_key_str = results
            };
            return Results.Ok(keyPair);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetPublicKey(string private_key_str)
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.generatePublicKey(private_key_str, logn);
            var keyPair = new PublicKey
            {
                public_key_str = results
            };
            return Results.Ok(keyPair);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetMessageSignature(string message, string private_key_str)
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.generateSignature(message, private_key_str, logn);
            var signature = new Signature
            {
                logn = logn,
                message = message,
                //private_key_str = private_key_str,
                signature_str = results
            };
            return Results.Ok(signature);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetMessageVerification(string message, string signature_str, string public_key_str)
    {
        try
        {
            const int logn = 10;
            var results = FalconWrapper.verifySignature(message, signature_str, public_key_str, logn);
            var verification = new Verification
            {
                logn = logn,
                message = message,
                signature_str = signature_str,
                public_key_str = public_key_str,
                result = results
            };
            return Results.Ok(verification);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

}

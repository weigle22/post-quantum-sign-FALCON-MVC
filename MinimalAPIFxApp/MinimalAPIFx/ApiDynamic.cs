using Newtonsoft.Json;
using static MinimalAPIFx.FalconModels;

namespace MinimalAPIFx;

public static class ApiDynamic
{
    public static void ConfigureApiDynamic(this WebApplication app)
    {
        // ====================== DYNAMIC SECURITY ======================
        // dll miscellaneous functions
        app.MapGet("/api/dyn/GetPrivKeySize", GetPrivKeySize);
        app.MapGet("/api/dyn/GetPublKeySize", GetPublKeySize);
        app.MapGet("/api/dyn/GetTmpsizeKeygen", GetTmpsizeKeygen);

        // dll main functions
        app.MapGet("/api/dyn/GetKeyPair", GetKeyPair);
        app.MapGet("/api/dyn/GetPrivateKey", GetPrivateKey);
        app.MapGet("/api/dyn/GetPublicKey", GetPublicKey);
        app.MapGet("/api/dyn/GetMessageSignature", GetMessageSignature);
        app.MapGet("/api/dyn/GetMessageVerification", GetMessageVerification);
    }

    // ====================== DYNAMIC SECURITY ======================
    private static IResult GetPrivKeySize(uint logn)
    {
        try
        {
            var results = FalconWrapper.falcon_dll_falcon_privkey_size(logn);
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetPublKeySize(uint logn)
    {
        try
        {
            var results = FalconWrapper.falcon_dll_falcon_pubkey_size(logn);
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static IResult GetTmpsizeKeygen(uint logn)
    {
        try
        {
            var results = FalconWrapper.falcon_dll_falcon_tmpsize_keygen(logn);
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }


    private static IResult GetKeyPair(uint logn)
    {
        try
        {
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

    private static IResult GetPrivateKey(uint logn)
    {
        try
        {
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

    private static IResult GetPublicKey(uint logn, string private_key_str)
    {
        try
        {

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

    private static IResult GetMessageSignature(uint logn, string message, string private_key_str)
    {
        try
        {
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

    private static IResult GetMessageVerification(uint logn, string message, string signature_str, string public_key_str)
    {
        try
        {
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

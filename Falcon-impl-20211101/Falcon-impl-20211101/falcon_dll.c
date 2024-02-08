// falcon_dll.c

#include "falcon.h"
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>

// Exported functions from the DLL

__declspec(dllexport) void falcon_dll_shake256_init(shake256_context *sc)
{
    shake256_init(sc);
}

__declspec(dllexport) void falcon_dll_shake256_inject(shake256_context *sc, const void *data, size_t len)
{
    shake256_inject(sc, data, len);
}

__declspec(dllexport) void falcon_dll_shake256_flip(shake256_context *sc)
{
    shake256_flip(sc);
}

__declspec(dllexport) void falcon_dll_shake256_extract(shake256_context *sc, void *out, size_t len)
{
    shake256_extract(sc, out, len);
}

__declspec(dllexport) void falcon_dll_shake256_init_prng_from_seed(shake256_context *sc,
                                                                   const void *seed, size_t seed_len)
{
    shake256_init_prng_from_seed(sc, seed, seed_len);
}

__declspec(dllexport) int falcon_dll_shake256_init_prng_from_system(shake256_context *sc)
{
    return shake256_init_prng_from_system(sc);
}

__declspec(dllexport) int falcon_dll_falcon_make_public(
    void *pubkey, size_t pubkey_len,
    const void *privkey, size_t privkey_len,
    void *tmp, size_t tmp_len)
{
    return falcon_make_public(pubkey, pubkey_len, privkey, privkey_len, tmp, tmp_len);
}

__declspec(dllexport) int falcon_dll_falcon_get_logn(void *obj, size_t len)
{
    return falcon_get_logn(obj, len);
}

__declspec(dllexport) int falcon_dll_falcon_sign_dyn(
    shake256_context *rng,
    void *sig, size_t *sig_len, int sig_type,
    const void *privkey, size_t privkey_len,
    const void *data, size_t data_len,
    void *tmp, size_t tmp_len)
{
    return falcon_sign_dyn(rng, sig, sig_len, sig_type, privkey, privkey_len, data, data_len, tmp, tmp_len);
}

__declspec(dllexport) int falcon_dll_falcon_expand_privkey(
    void *expanded_key, size_t expanded_key_len,
    const void *privkey, size_t privkey_len,
    void *tmp, size_t tmp_len)
{
    return falcon_expand_privkey(expanded_key, expanded_key_len, privkey, privkey_len, tmp, tmp_len);
}

__declspec(dllexport) int falcon_dll_falcon_sign_tree(
    shake256_context *rng,
    void *sig, size_t *sig_len, int sig_type,
    const void *expanded_key,
    const void *data, size_t data_len,
    void *tmp, size_t tmp_len)
{
    return falcon_sign_tree(rng, sig, sig_len, sig_type, expanded_key, data, data_len, tmp, tmp_len);
}

__declspec(dllexport) int falcon_dll_falcon_sign_start(
    shake256_context *rng,
    void *nonce,
    shake256_context *hash_data)
{
    return falcon_sign_start(rng, nonce, hash_data);
}

__declspec(dllexport) int falcon_dll_falcon_sign_dyn_finish(
    shake256_context *rng,
    void *sig, size_t *sig_len, int sig_type,
    const void *privkey, size_t privkey_len,
    shake256_context *hash_data, const void *nonce,
    void *tmp, size_t tmp_len)
{
    return falcon_sign_dyn_finish(rng, sig, sig_len, sig_type, privkey, privkey_len, hash_data, nonce, tmp, tmp_len);
}

__declspec(dllexport) int falcon_dll_falcon_sign_tree_finish(
    shake256_context *rng,
    void *sig, size_t *sig_len, int sig_type,
    const void *expanded_key,
    shake256_context *hash_data, const void *nonce,
    void *tmp, size_t tmp_len)
{
    return falcon_sign_tree_finish(rng, sig, sig_len, sig_type, expanded_key, hash_data, nonce, tmp, tmp_len);
}

__declspec(dllexport) int falcon_dll_falcon_verify(
    const void *sig, size_t sig_len, int sig_type,
    const void *pubkey, size_t pubkey_len,
    const void *data, size_t data_len,
    void *tmp, size_t tmp_len)
{
    return falcon_verify(sig, sig_len, sig_type, pubkey, pubkey_len, data, data_len, tmp, tmp_len);
}

__declspec(dllexport) int falcon_dll_falcon_verify_start(
    shake256_context *hash_data,
    const void *sig, size_t sig_len)
{
    return falcon_verify_start(hash_data, sig, sig_len);
}

__declspec(dllexport) int falcon_dll_falcon_verify_finish(
    const void *sig, size_t sig_len, int sig_type,
    const void *pubkey, size_t pubkey_len,
    shake256_context *hash_data,
    void *tmp, size_t tmp_len)
{
    return falcon_verify_finish(sig, sig_len, sig_type, pubkey, pubkey_len, hash_data, tmp, tmp_len);
}

__declspec(dllexport) size_t falcon_dll_falcon_privkey_size(unsigned logn)
{
    return FALCON_PRIVKEY_SIZE(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_pubkey_size(unsigned logn)
{
    return FALCON_PUBKEY_SIZE(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_sig_compressed_maxsize(unsigned logn)
{
    return FALCON_SIG_COMPRESSED_MAXSIZE(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_sig_padded_size(unsigned logn)
{
    return FALCON_SIG_PADDED_SIZE(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_sig_ct_size(unsigned logn)
{
    return FALCON_SIG_CT_SIZE(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_tmpsize_keygen(unsigned logn)
{
    return FALCON_TMPSIZE_KEYGEN(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_tmpsize_makepub(unsigned logn)
{
    return FALCON_TMPSIZE_MAKEPUB(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_tmpsize_sigdyn(unsigned logn)
{
    return FALCON_TMPSIZE_SIGNDYN(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_tmpsize_sigtreetmp(unsigned logn)
{
    return FALCON_TMPSIZE_SIGNTREE(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_tmpsize_expandpriv(unsigned logn)
{
    return FALCON_TMPSIZE_EXPANDPRIV(logn);
}

__declspec(dllexport) size_t falcon_dll_falcon_expandedkey_size(unsigned logn)
{
    return FALCON_EXPANDEDKEY_SIZE(logn);
}

// Entry point for DLL
BOOL APIENTRY DllMain(HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}

__declspec(dllexport) char *generateKeyPair(unsigned logn)
{
    size_t privkey_len = FALCON_PRIVKEY_SIZE(logn);
    size_t pubkey_len = FALCON_PUBKEY_SIZE(logn);
    size_t tmp_len_keygen = FALCON_TMPSIZE_KEYGEN(logn);

    // Allocate memory for keys and temporary buffers
    void *privkey = malloc(privkey_len);
    void *pubkey = malloc(pubkey_len);
    void *tmp_keygen = malloc(tmp_len_keygen);

    if (privkey == NULL || pubkey == NULL || tmp_keygen == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        return NULL;
    }

    // Initialize shake256 context
    shake256_context rng;
    shake256_init_prng_from_system(&rng);

    // Key generation
    int keygen_result = falcon_keygen_make(&rng, logn, privkey, privkey_len, pubkey, pubkey_len, tmp_keygen, tmp_len_keygen);

    if (keygen_result != 0)
    {
        fprintf(stderr, "Key generation failed with error code %d\n", keygen_result);
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        return NULL;
    }

    // Convert keys to hexadecimal strings
    char *private_key_str = (char *)malloc(privkey_len * 2 + 1);
    char *public_key_str = (char *)malloc(pubkey_len * 2 + 1);

    if (private_key_str == NULL || public_key_str == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        return NULL;
    }

    for (size_t i = 0; i < privkey_len; i++)
    {
        sprintf(private_key_str + i * 2, "%02X", ((uint8_t *)privkey)[i]);
    }
    private_key_str[privkey_len * 2] = '\0';

    for (size_t i = 0; i < pubkey_len; i++)
    {
        sprintf(public_key_str + i * 2, "%02X", ((uint8_t *)pubkey)[i]);
    }
    public_key_str[pubkey_len * 2] = '\0';

    // Clean up
    free(privkey);
    free(pubkey);
    free(tmp_keygen);

    // Return keys as strings
    char *result_str = (char *)malloc(strlen(private_key_str) + strlen(public_key_str) + 2);
    if (result_str == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        free(private_key_str);
        free(public_key_str);
        return NULL;
    }

    sprintf(result_str, "%s"
                        ", "
                        "%s",
            private_key_str, public_key_str);

    // Clean up
    free(private_key_str);
    free(public_key_str);

    return result_str;
}

// Entry point to generate private key as a string
__declspec(dllexport) char *generatePrivateKey(unsigned logn)
{
    size_t privkey_len = FALCON_PRIVKEY_SIZE(logn);
    size_t tmp_len_keygen = FALCON_TMPSIZE_KEYGEN(logn);

    // Allocate memory for private key and temporary buffer
    void *privkey = malloc(privkey_len);
    void *tmp_keygen = malloc(tmp_len_keygen);

    if (privkey == NULL || tmp_keygen == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        return NULL;
    }

    // Initialize shake256 context
    shake256_context rng;
    shake256_init_prng_from_system(&rng);

    // Key generation
    int keygen_result = falcon_keygen_make(&rng, logn, privkey, privkey_len, NULL, 0, tmp_keygen, tmp_len_keygen);

    if (keygen_result != 0)
    {
        fprintf(stderr, "Private key generation failed with error code %d\n", keygen_result);
        free(privkey);
        free(tmp_keygen);
        return NULL;
    }

    // Convert private key to hexadecimal string
    char *private_key_str = (char *)malloc(privkey_len * 2 + 1);

    if (private_key_str == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        free(privkey);
        free(tmp_keygen);
        return NULL;
    }

    for (size_t i = 0; i < privkey_len; i++)
    {
        sprintf(private_key_str + i * 2, "%02X", ((uint8_t *)privkey)[i]);
    }
    private_key_str[privkey_len * 2] = '\0';

    // Clean up
    free(privkey);
    free(tmp_keygen);

    return private_key_str;
}

// Entry point to generate public key from private key string
__declspec(dllexport) char *generatePublicKey(const char *private_key_str, unsigned logn)
{
    if (private_key_str == NULL)
    {
        fprintf(stderr, "Invalid input: private key string is NULL\n");
        return NULL;
    }

    size_t privkey_len = strlen(private_key_str) / 2;
    size_t pubkey_len = FALCON_PUBKEY_SIZE(logn);
    size_t tmp_len_makepub = FALCON_TMPSIZE_MAKEPUB(logn);

    // Allocate memory for private key, public key, and temporary buffer
    void *privkey = malloc(privkey_len);
    void *pubkey = malloc(pubkey_len);
    void *tmp_makepub = malloc(tmp_len_makepub);

    if (privkey == NULL || pubkey == NULL || tmp_makepub == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        return NULL;
    }

    // Convert private key string to byte array
    for (size_t i = 0; i < privkey_len; i++)
    {
        sscanf(private_key_str + i * 2, "%2hhX", (uint8_t *)privkey + i);
    }

    // Make public key
    int makepub_result = falcon_make_public(pubkey, pubkey_len, privkey, privkey_len, tmp_makepub, tmp_len_makepub);

    if (makepub_result != 0)
    {
        fprintf(stderr, "Public key generation failed with error code %d\n", makepub_result);
        free(privkey);
        free(pubkey);
        free(tmp_makepub);
        return NULL;
    }

    // Convert public key to hexadecimal string
    char *public_key_str = (char *)malloc(pubkey_len * 2 + 1);

    if (public_key_str == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        free(privkey);
        free(pubkey);
        free(tmp_makepub);
        return NULL;
    }

    for (size_t i = 0; i < pubkey_len; i++)
    {
        sprintf(public_key_str + i * 2, "%02X", ((uint8_t *)pubkey)[i]);
    }
    public_key_str[pubkey_len * 2] = '\0';

    // Clean up
    free(privkey);
    free(pubkey);
    free(tmp_makepub);

    return public_key_str;
}

// Entry point to generate signature from message string
__declspec(dllexport) char *generateSignature(const char *message, const char *private_key_str, unsigned logn)
{
    if (message == NULL || private_key_str == NULL)
    {
        fprintf(stderr, "Invalid input: message or private key string is NULL\n");
        return NULL;
    }

    size_t message_len = strlen(message);
    size_t privkey_len = strlen(private_key_str) / 2;
    size_t sig_len = FALCON_SIG_COMPRESSED_MAXSIZE(logn);
    size_t tmp_len_sign = FALCON_TMPSIZE_SIGNDYN(logn);

    // Allocate memory for private key, signature, and temporary buffer
    void *privkey = malloc(privkey_len);
    void *signature = malloc(sig_len);
    void *tmp_sign = malloc(tmp_len_sign);

    if (privkey == NULL || signature == NULL || tmp_sign == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        return NULL;
    }

    // Convert private key string to byte array
    for (size_t i = 0; i < privkey_len; i++)
    {
        sscanf(private_key_str + i * 2, "%2hhX", (uint8_t *)privkey + i);
    }

    // Initialize shake256 context
    shake256_context rng;
    shake256_init_prng_from_system(&rng);

    // Sign the message
    int sign_result = falcon_sign_dyn(&rng, signature, &sig_len, FALCON_SIG_COMPRESSED, privkey, privkey_len, message, message_len, tmp_sign, tmp_len_sign);

    if (sign_result != 0)
    {
        fprintf(stderr, "Signature generation failed with error code %d\n", sign_result);
        free(privkey);
        free(signature);
        free(tmp_sign);
        return NULL;
    }

    // Convert signature to hexadecimal string
    char *signature_str = (char *)malloc(sig_len * 2 + 1);

    if (signature_str == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        free(privkey);
        free(signature);
        free(tmp_sign);
        return NULL;
    }

    for (size_t i = 0; i < sig_len; i++)
    {
        sprintf(signature_str + i * 2, "%02X", ((uint8_t *)signature)[i]);
    }
    signature_str[sig_len * 2] = '\0';

    // Clean up
    free(privkey);
    free(signature);
    free(tmp_sign);

    return signature_str;
}

// Entry point to verify signature against message using public key
__declspec(dllexport) char *verifySignature(const char *message, const char *signature_str, const char *public_key_str, unsigned logn)
{
    if (message == NULL || signature_str == NULL || public_key_str == NULL)
    {
        fprintf(stderr, "Invalid input: message, signature string, or public key string is NULL\n");
        return NULL;
    }

    size_t message_len = strlen(message);
    size_t sig_len = strlen(signature_str) / 2;
    size_t pubkey_len = strlen(public_key_str) / 2;
    size_t tmp_len_verify = FALCON_TMPSIZE_VERIFY(logn);

    // Allocate memory for signature, public key, and temporary buffer
    void *signature = malloc(sig_len);
    void *pubkey = malloc(pubkey_len);
    void *tmp_verify = malloc(tmp_len_verify);

    if (signature == NULL || pubkey == NULL || tmp_verify == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        return NULL;
    }

    // Convert signature string to byte array
    for (size_t i = 0; i < sig_len; i++)
    {
        sscanf(signature_str + i * 2, "%2hhX", (uint8_t *)signature + i);
    }

    // Convert public key string to byte array
    for (size_t i = 0; i < pubkey_len; i++)
    {
        sscanf(public_key_str + i * 2, "%2hhX", (uint8_t *)pubkey + i);
    }

    // Initialize shake256 context for verification
    shake256_context hash_data;
    int init_result = falcon_verify_start(&hash_data, signature, sig_len);

    if (init_result != 0)
    {
        fprintf(stderr, "Verification initialization failed with error code %d\n", init_result);
        free(signature);
        free(pubkey);
        free(tmp_verify);
        return NULL;
    }

    // Inject the message into the verification context
    shake256_inject(&hash_data, message, message_len);

    // Finalize the verification
    int verify_result = falcon_verify_finish(signature, sig_len, FALCON_SIG_COMPRESSED, pubkey, pubkey_len, &hash_data, tmp_verify, tmp_len_verify);

    // Convert verification result to string
    char *verification_result_str = (char *)malloc(2);

    if (verification_result_str == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        free(signature);
        free(pubkey);
        free(tmp_verify);
        return NULL;
    }

    sprintf(verification_result_str, "%d", verify_result);

    // Clean up
    free(signature);
    free(pubkey);
    free(tmp_verify);

    return verification_result_str;
}

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "falcon.h"

// Class to manage Falcon keys
typedef struct FalconKeys
{
    char *privkey_str;
    char *pubkey_str;
} FalconKeys;

// Function to print hex data
void print_hex(const void *data, size_t len)
{
    const uint8_t *bytes = (const uint8_t *)data;
    for (size_t i = 0; i < len; i++)
    {
        printf("%02X", bytes[i]);
    }
    printf("\n");
}

// Function to generate public and private keys
int generate_keys(unsigned logn, void *privkey, size_t privkey_len, void *pubkey, size_t pubkey_len, void *tmp_keygen, size_t tmp_len_keygen)
{
    // Initialize shake256 context
    shake256_context rng;
    shake256_init_prng_from_system(&rng);

    // Key generation
    int keygen_result = falcon_keygen_make(&rng, logn, privkey, privkey_len, pubkey, pubkey_len, tmp_keygen, tmp_len_keygen);
    if (keygen_result != 0)
    {
        fprintf(stderr, "Key generation failed with error code %d\n", keygen_result);
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

// Function to get public and private keys as strings with identifiers
void get_keys_as_strings(unsigned logn, char **privkey_str, char **pubkey_str)
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
        exit(EXIT_FAILURE);
    }

    // Generate public and private keys
    if (generate_keys(logn, privkey, privkey_len, pubkey, pubkey_len, tmp_keygen, tmp_len_keygen) != EXIT_SUCCESS)
    {
        // Handle error
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        exit(EXIT_FAILURE);
    }

    // Convert keys to hex strings with identifiers
    *privkey_str = malloc((privkey_len * 2 + 1) + strlen("Private Key: ") + 1);
    *pubkey_str = malloc((pubkey_len * 2 + 1) + strlen("Public Key: ") + 1);

    if (*privkey_str == NULL || *pubkey_str == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }

    // Convert binary keys to hex strings with identifiers
    sprintf(*privkey_str, "Private Key: ");
    for (size_t i = 0; i < privkey_len; i++)
        sprintf(*privkey_str + strlen(*privkey_str), "%02X", ((uint8_t *)privkey)[i]);

    sprintf(*pubkey_str, "Public Key: ");
    for (size_t i = 0; i < pubkey_len; i++)
        sprintf(*pubkey_str + strlen(*pubkey_str), "%02X", ((uint8_t *)pubkey)[i]);

    // Clean up
    free(privkey);
    free(pubkey);
    free(tmp_keygen);
}

// Initialize FalconKeys
FalconKeys *FalconKeys_Init(unsigned logn)
{
    FalconKeys *keys = malloc(sizeof(FalconKeys));
    if (keys == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }

    // Get public and private keys as strings with identifiers
    get_keys_as_strings(logn, &keys->privkey_str, &keys->pubkey_str);

    return keys;
}

// Method to get private key
const char *FalconKeys_GetPrivateKey(FalconKeys *keys)
{
    return keys->privkey_str;
}

// Method to get public key
const char *FalconKeys_GetPublicKey(FalconKeys *keys)
{
    return keys->pubkey_str;
}

// Clean up FalconKeys
void FalconKeys_Destroy(FalconKeys *keys)
{
    free(keys->privkey_str);
    free(keys->pubkey_str);
    free(keys);
}

int main()
{
    // Example parameters
    unsigned logn = 8;

    // Initialize FalconKeys
    FalconKeys *keys = FalconKeys_Init(logn);

    // Print keys
    printf("%s\n", FalconKeys_GetPrivateKey(keys));
    printf("%s\n", FalconKeys_GetPublicKey(keys));

    // Clean up
    FalconKeys_Destroy(keys);

    return EXIT_SUCCESS;
}

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "falcon.h"

void print_hex(const void *data, size_t len)
{
    const uint8_t *bytes = (const uint8_t *)data;
    for (size_t i = 0; i < len; i++)
    {
        printf("%02X", bytes[i]);
    }
    printf("\n");
}

int process_file(FILE *file, void *message, size_t chunk_size, size_t *message_len)
{
    size_t total_read = 0;
    size_t read;
    size_t offset = 0;

    while ((read = fread((uint8_t *)message + offset, 1, chunk_size, file)) > 0)
    {
        offset += read;
        total_read += read;
        if (read < chunk_size)
        {
            break; // End of file
        }
    }

    *message_len = total_read;
    return 0;
}

int main()
{
    // Example parameters
    unsigned logn = 8;
    size_t privkey_len = FALCON_PRIVKEY_SIZE(logn);
    size_t pubkey_len = FALCON_PUBKEY_SIZE(logn);
    size_t tmp_len_keygen = FALCON_TMPSIZE_KEYGEN(logn);
    size_t tmp_len_sign = FALCON_TMPSIZE_SIGNDYN(logn);

    // Allocate memory for keys and temporary buffers
    void *privkey = malloc(privkey_len);
    void *pubkey = malloc(pubkey_len);
    void *tmp_keygen = malloc(tmp_len_keygen);
    void *tmp_sign = malloc(tmp_len_sign);

    if (privkey == NULL || pubkey == NULL || tmp_keygen == NULL || tmp_sign == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        return EXIT_FAILURE;
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
        free(tmp_sign);
        return EXIT_FAILURE;
    }

    // Print public and private keys
    printf("Private Key:\n");
    print_hex(privkey, privkey_len);
    printf("\n");

    printf("Public Key:\n");
    print_hex(pubkey, pubkey_len);
    printf("\n");

    // Read the message from the user
    char filename[256];
    printf("Enter the path to the file:\n");
    if (fgets(filename, sizeof(filename), stdin) == NULL)
    {
        fprintf(stderr, "Error reading file path\n");
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        return EXIT_FAILURE;
    }

    // Remove newline character if present
    size_t len = strlen(filename);
    if (len > 0 && filename[len - 1] == '\n')
    {
        filename[len - 1] = '\0';
    }

    FILE *file = fopen(filename, "rb");
    if (!file)
    {
        fprintf(stderr, "Error opening file: %s\n", filename);
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        return EXIT_FAILURE;
    }

    // Example: Sign the message
    // Allocate memory for the signature
    size_t chunk_size = 1024 * 1024; // 1 MB chunk size
    void *message = malloc(chunk_size);
    size_t message_len;

    if (message == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        fclose(file);
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        return EXIT_FAILURE;
    }

    // Process the file in chunks
    while (process_file(file, message, chunk_size, &message_len) == 0)
    {
        // Process each chunk as needed

        // Break if the end of the file is reached
        if (message_len < chunk_size)
        {
            break;
        }
    }

    // Example: Sign the entire file
    // Reset file pointer to the beginning
    fseek(file, 0, SEEK_SET);

    // Read the entire file into a single buffer
    void *full_message = malloc(message_len);
    if (full_message == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        fclose(file);
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(message);
        return EXIT_FAILURE;
    }

    fread(full_message, 1, message_len, file);

    // Allocate memory for the signature for the entire file
    size_t full_sig_len = FALCON_SIG_COMPRESSED_MAXSIZE(logn);
    void *full_signature = malloc(full_sig_len);

    if (full_signature == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        fclose(file);
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(message);
        free(full_message);
        return EXIT_FAILURE;
    }

    // Sign the entire file
    int full_sign_result = falcon_sign_dyn(&rng, full_signature, &full_sig_len, FALCON_SIG_COMPRESSED, privkey, privkey_len, full_message, message_len, tmp_sign, tmp_len_sign);
    if (full_sign_result != 0)
    {
        fprintf(stderr, "Signature generation failed with error code %d\n", full_sign_result);
        fclose(file);
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(message);
        free(full_message);
        free(full_signature);
        return EXIT_FAILURE;
    }

    // Print the signature for the entire file
    printf("Signature for the entire file:\n");
    print_hex(full_signature, full_sig_len);
    printf("\n");

    // Example: Verify the signature for the entire file
    int full_verify_result = falcon_verify(full_signature, full_sig_len, FALCON_SIG_COMPRESSED, pubkey, pubkey_len, full_message, message_len, tmp_sign, tmp_len_sign);
    if (full_verify_result != 0)
    {
        fprintf(stderr, "Signature verification failed with error code %d\n", full_verify_result);
    }
    else
    {
        printf("Signature for the entire file is valid!\n");
    }

    // Clean up
    fclose(file);
    free(privkey);
    free(pubkey);
    free(tmp_keygen);
    free(tmp_sign);
    free(message);
    free(full_message);
    free(full_signature);

    return EXIT_SUCCESS;
}

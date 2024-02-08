#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "falcon.h"

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

// Function to process a file in chunks
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

    // Print public and private keys
    printf("Private Key:\n");
    print_hex(privkey, privkey_len);
    printf("\n");

    printf("Public Key:\n");
    print_hex(pubkey, pubkey_len);
    printf("\n");

    return EXIT_SUCCESS;
}

// Function to sign a message using the private key
int sign_message(void *privkey, size_t privkey_len, void *message, size_t message_len, void *signature, size_t *sig_len, void *tmp_sign, size_t tmp_len_sign)
{
    // Initialize shake256 context
    shake256_context rng;
    shake256_init_prng_from_system(&rng);

    // Sign the message
    int sign_result = falcon_sign_dyn(&rng, signature, sig_len, FALCON_SIG_COMPRESSED, privkey, privkey_len, message, message_len, tmp_sign, tmp_len_sign);
    if (sign_result != 0)
    {
        fprintf(stderr, "Signature generation failed with error code %d\n", sign_result);
        return EXIT_FAILURE;
    }

    // Print the signature
    printf("Signature:\n");
    print_hex(signature, *sig_len);
    printf("\n");

    return EXIT_SUCCESS;
}

// Function to verify a message using the public key
int verify_message(void *pubkey, size_t pubkey_len, void *message, size_t message_len, void *signature, size_t sig_len, void *tmp_verify, size_t tmp_len_verify)
{
    // Verify the signature
    int verify_result = falcon_verify(signature, sig_len, FALCON_SIG_COMPRESSED, pubkey, pubkey_len, message, message_len, tmp_verify, tmp_len_verify);
    if (verify_result != 0)
    {
        fprintf(stderr, "Signature verification failed with error code %d\n", verify_result);
        return EXIT_FAILURE;
    }

    printf("Signature is valid!\n");

    return EXIT_SUCCESS;
}

int main()
{
    // Example parameters
    unsigned logn = 8;
    size_t privkey_len = FALCON_PRIVKEY_SIZE(logn);
    size_t pubkey_len = FALCON_PUBKEY_SIZE(logn);
    size_t tmp_len_keygen = FALCON_TMPSIZE_KEYGEN(logn);
    size_t tmp_len_sign = FALCON_TMPSIZE_SIGNDYN(logn);
    size_t tmp_len_verify = FALCON_TMPSIZE_VERIFY(logn);

    // Allocate memory for keys and temporary buffers
    void *privkey = malloc(privkey_len);
    void *pubkey = malloc(pubkey_len);
    void *tmp_keygen = malloc(tmp_len_keygen);
    void *tmp_sign = malloc(tmp_len_sign);
    void *tmp_verify = malloc(tmp_len_verify);

    if (privkey == NULL || pubkey == NULL || tmp_keygen == NULL || tmp_sign == NULL || tmp_verify == NULL)
    {
        fprintf(stderr, "Memory allocation failed\n");
        return EXIT_FAILURE;
    }

    // Generate public and private keys
    if (generate_keys(logn, privkey, privkey_len, pubkey, pubkey_len, tmp_keygen, tmp_len_keygen) != EXIT_SUCCESS)
    {
        // Handle error
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(tmp_verify);
        return EXIT_FAILURE;
    }

    // Choose between file and string input
    printf("Choose input type:\n");
    printf("1. File\n");
    printf("2. String\n");

    int choice;
    if (scanf("%d", &choice) != 1)
    {
        fprintf(stderr, "Invalid choice\n");
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(tmp_verify);
        return EXIT_FAILURE;
    }

    // Clear the input buffer
    while (getchar() != '\n')
        ;

    if (choice == 1)
    {
        // Read the message from a file
        char filename[256];
        printf("Enter the path to the file:\n");
        if (fgets(filename, sizeof(filename), stdin) == NULL)
        {
            fprintf(stderr, "Error reading file path\n");
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
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
            free(tmp_verify);
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
            free(tmp_verify);
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

        // Sign the message
        size_t sig_len = FALCON_SIG_COMPRESSED_MAXSIZE(logn);
        void *signature = malloc(sig_len);

        if (signature == NULL)
        {
            fprintf(stderr, "Memory allocation failed\n");
            fclose(file);
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
            free(message);
            return EXIT_FAILURE;
        }

        if (sign_message(privkey, privkey_len, message, message_len, signature, &sig_len, tmp_sign, tmp_len_sign) != EXIT_SUCCESS)
        {
            // Handle error
            fclose(file);
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
            free(message);
            free(signature);
            return EXIT_FAILURE;
        }

        // Verify the signature
        if (verify_message(pubkey, pubkey_len, message, message_len, signature, sig_len, tmp_verify, tmp_len_verify) != EXIT_SUCCESS)
        {
            // Handle error
            fclose(file);
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
            free(message);
            free(signature);
            return EXIT_FAILURE;
        }

        // Clean up
        fclose(file);
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(tmp_verify);
        free(message);
        free(signature);
    }
    else if (choice == 2)
    {
        // Read the message from a string
        printf("Enter the message:\n");

        char message[1024];
        if (fgets(message, sizeof(message), stdin) == NULL)
        {
            fprintf(stderr, "Error reading message\n");
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
            return EXIT_FAILURE;
        }

        // Remove newline character if present
        size_t len = strlen(message);
        if (len > 0 && message[len - 1] == '\n')
        {
            message[len - 1] = '\0';
        }

        // Example: Sign the message
        size_t sig_len = FALCON_SIG_COMPRESSED_MAXSIZE(logn);
        void *signature = malloc(sig_len);

        if (signature == NULL)
        {
            fprintf(stderr, "Memory allocation failed\n");
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
            return EXIT_FAILURE;
        }

        if (sign_message(privkey, privkey_len, message, strlen(message), signature, &sig_len, tmp_sign, tmp_len_sign) != EXIT_SUCCESS)
        {
            // Handle error
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
            free(signature);
            return EXIT_FAILURE;
        }

        // Verify the signature
        if (verify_message(pubkey, pubkey_len, message, strlen(message), signature, sig_len, tmp_verify, tmp_len_verify) != EXIT_SUCCESS)
        {
            // Handle error
            free(privkey);
            free(pubkey);
            free(tmp_keygen);
            free(tmp_sign);
            free(tmp_verify);
            free(signature);
            return EXIT_FAILURE;
        }

        // Clean up
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(tmp_verify);
        free(signature);
    }
    else
    {
        fprintf(stderr, "Invalid choice\n");
        free(privkey);
        free(pubkey);
        free(tmp_keygen);
        free(tmp_sign);
        free(tmp_verify);
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

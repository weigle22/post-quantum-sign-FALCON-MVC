#ifndef FALCON_H__
#define FALCON_H__

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C"
{
#endif

#define FALCON_ERR_RANDOM -1

#define FALCON_ERR_SIZE -2

#define FALCON_ERR_FORMAT -3

#define FALCON_ERR_BADSIG -4

#define FALCON_ERR_BADARG -5

#define FALCON_ERR_INTERNAL -6

#define FALCON_SIG_COMPRESSED 1

#define FALCON_SIG_PADDED 2

#define FALCON_SIG_CT 3

#define FALCON_PRIVKEY_SIZE(logn)                                    \
    (((logn) <= 3                                                    \
          ? (3u << (logn))                                           \
          : ((10u - ((logn) >> 1)) << ((logn)-2)) + (1 << (logn))) + \
     1)

/*
 * Public key size (in bytes). The size is exact.
 */
#define FALCON_PUBKEY_SIZE(logn)  \
    (((logn) <= 1                 \
          ? 4u                    \
          : (7u << ((logn)-2))) + \
     1)

/*
 * Maximum signature size (in bytes) when using the COMPRESSED format.
 * In practice, the signature will be shorter.
 */
#define FALCON_SIG_COMPRESSED_MAXSIZE(logn) \
    (((((11u << (logn)) + (101u >> (10 - (logn)))) + 7) >> 3) + 41)

/*
 * Signature size (in bytes) when using the PADDED format. The size
 * is exact.
 */
#define FALCON_SIG_PADDED_SIZE(logn) \
    (44u + 3 * (256u >> (10 - (logn))) + 2 * (128u >> (10 - (logn))) + 3 * (64u >> (10 - (logn))) + 2 * (16u >> (10 - (logn))) - 2 * (2u >> (10 - (logn))) - 8 * (1u >> (10 - (logn))))

/*
 * Signature size (in bytes) when using the CT format. The size is exact.
 */
#define FALCON_SIG_CT_SIZE(logn) \
    ((3u << ((logn)-1)) - ((logn) == 3) + 41)

/*
 * Temporary buffer size for key pair generation.
 */
#define FALCON_TMPSIZE_KEYGEN(logn) \
    (((logn) <= 3 ? 272u : (28u << (logn))) + (3u << (logn)) + 7)

/*
 * Temporary buffer size for computing the pubic key from the private key.
 */
#define FALCON_TMPSIZE_MAKEPUB(logn) \
    ((6u << (logn)) + 1)

/*
 * Temporary buffer size for generating a signature ("dynamic" variant).
 */
#define FALCON_TMPSIZE_SIGNDYN(logn) \
    ((78u << (logn)) + 7)

/*
 * Temporary buffer size for generating a signature ("tree" variant, with
 * an expanded key).
 */
#define FALCON_TMPSIZE_SIGNTREE(logn) \
    ((50u << (logn)) + 7)

/*
 * Temporary buffer size for expanding a private key.
 */
#define FALCON_TMPSIZE_EXPANDPRIV(logn) \
    ((52u << (logn)) + 7)

/*
 * Size of an expanded private key.
 */
#define FALCON_EXPANDEDKEY_SIZE(logn) \
    (((8u * (logn) + 40) << (logn)) + 8)

/*
 * Temporary buffer size for verifying a signature.
 */
#define FALCON_TMPSIZE_VERIFY(logn) \
    ((8u << (logn)) + 1)

    typedef struct
    {
        uint64_t opaque_contents[26];
    } shake256_context;

    void shake256_init(shake256_context *sc);

    void shake256_inject(shake256_context *sc, const void *data, size_t len);

    void shake256_flip(shake256_context *sc);

    void shake256_extract(shake256_context *sc, void *out, size_t len);

    void shake256_init_prng_from_seed(shake256_context *sc,
                                      const void *seed, size_t seed_len);

    int shake256_init_prng_from_system(shake256_context *sc);

    int falcon_keygen_make(
        shake256_context *rng,
        unsigned logn,
        void *privkey, size_t privkey_len,
        void *pubkey, size_t pubkey_len,
        void *tmp, size_t tmp_len);

    int falcon_make_public(
        void *pubkey, size_t pubkey_len,
        const void *privkey, size_t privkey_len,
        void *tmp, size_t tmp_len);

    int falcon_get_logn(void *obj, size_t len);

    int falcon_sign_dyn(shake256_context *rng,
                        void *sig, size_t *sig_len, int sig_type,
                        const void *privkey, size_t privkey_len,
                        const void *data, size_t data_len,
                        void *tmp, size_t tmp_len);

    int falcon_expand_privkey(void *expanded_key, size_t expanded_key_len,
                              const void *privkey, size_t privkey_len,
                              void *tmp, size_t tmp_len);

    int falcon_sign_tree(shake256_context *rng,
                         void *sig, size_t *sig_len, int sig_type,
                         const void *expanded_key,
                         const void *data, size_t data_len,
                         void *tmp, size_t tmp_len);

    int falcon_sign_start(shake256_context *rng,
                          void *nonce,
                          shake256_context *hash_data);

    int falcon_sign_dyn_finish(shake256_context *rng,
                               void *sig, size_t *sig_len, int sig_type,
                               const void *privkey, size_t privkey_len,
                               shake256_context *hash_data, const void *nonce,
                               void *tmp, size_t tmp_len);

    int falcon_sign_tree_finish(shake256_context *rng,
                                void *sig, size_t *sig_len, int sig_type,
                                const void *expanded_key,
                                shake256_context *hash_data, const void *nonce,
                                void *tmp, size_t tmp_len);

    int falcon_verify(const void *sig, size_t sig_len, int sig_type,
                      const void *pubkey, size_t pubkey_len,
                      const void *data, size_t data_len,
                      void *tmp, size_t tmp_len);

    int falcon_verify_start(shake256_context *hash_data,
                            const void *sig, size_t sig_len);

    int falcon_verify_finish(const void *sig, size_t sig_len, int sig_type,
                             const void *pubkey, size_t pubkey_len,
                             shake256_context *hash_data,
                             void *tmp, size_t tmp_len);

    /* ==================================================================== */

#ifdef __cplusplus
}
#endif

#endif
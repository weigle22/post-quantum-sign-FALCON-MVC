namespace MinimalAPIFx
{
    public class FalconModels
    {
        public class KeyPair
        {
            public uint logn { get; set; }
            public string? private_key_str { get; set; }
            public string? public_key_str { get; set; }
        }

        public class PrivateKey 
        { 
            public string? private_key_str { get; set; }
        }

        public class PublicKey
        {
            public string? public_key_str { get; set; }
        }

        public class Signature
        {
            public uint logn { get; set; }
            public string? message { get; set; }
            //public string? private_key_str { get; set; }
            public string? signature_str { get; set; }
        }

        public class Verification
        {
            public uint logn { get; set; }
            public string? message { get; set; }
            public string? signature_str { get; set; }
            public string? public_key_str { get; set; }
            public string? result { get; set; }
        }

    }
}

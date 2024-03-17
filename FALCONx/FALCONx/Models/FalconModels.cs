using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FALCONx.Models
{
    public class FalconModels
    {
        public class PrivateKey
        {
            public string private_key_str { get; set; }
        }

        public class PublicKey
        {
            public string public_key_str { get; set; }
        }

        public class Signature
        {
            public string signature_str { get; set; }
        }
    }
}
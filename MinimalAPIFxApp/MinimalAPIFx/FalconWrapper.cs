using System.Runtime.InteropServices;

namespace MinimalAPIFx
{
    public static class FalconWrapper
    {
        private const string DllPath = "falcon_full.dll";

        // string message
        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern uint falcon_dll_falcon_privkey_size(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern uint falcon_dll_falcon_pubkey_size(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern uint falcon_dll_falcon_tmpsize_keygen(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern uint falcon_dll_private_key_size(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern uint falcon_dll_public_key_size(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern uint falcon_dll_tmpsize_keygen(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string generateKeyPair(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string generatePrivateKey(uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string generatePublicKey(string private_key_str, uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string generateSignature(string message, string private_key_str, uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string verifySignature(string message, string signature_str, string public_key_str, uint logn);

        // file message: from PATH
        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string generateSignatureFromFile(string file_path, string private_key_str, uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string verifySignatureOfFile(string file_path, string signature_str, string public_key_str, uint logn);

        // file message: from STREAM
        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string generateSignatureFromMemoryStream(string file_data, string private_key_str, uint logn);

        [DllImport(DllPath, CallingConvention = CallingConvention.Cdecl)]
        public static extern string verifySignatureFromMemoryStream(string file_data, string signature_str, string public_key_str, uint logn);
    }
}

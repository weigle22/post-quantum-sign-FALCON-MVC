import ctypes
import os

# Get the full path of the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Load the DLL
dll_path = os.path.join(current_directory, "falcon_full_64.dll")
falcon_dll = ctypes.CDLL(dll_path)

# Define the argument and return types for the generateKeyPair function
falcon_dll.generateKeyPair.argtypes = [ctypes.c_uint]
falcon_dll.generateKeyPair.restype = ctypes.c_char_p

def generate_key_pair(logn):
    # Call the DLL function
    private_and_public_key = falcon_dll.generateKeyPair(logn)
    if private_and_public_key is None:
        print("Error: Key generation failed.")
        return None, None

    # Split the returned string into private and public keys
    private_key_str, public_key_str = private_and_public_key.split(b', ')

    return private_key_str.decode(), public_key_str.decode()

# Example usage
logn = 10  # Example logn value
private_key, public_key = generate_key_pair(logn)
print("Private Key:", private_key)
print("Public Key:", public_key)

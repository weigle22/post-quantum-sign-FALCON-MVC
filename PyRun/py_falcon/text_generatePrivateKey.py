import ctypes
import os

# Get the full path of the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Load the DLL
dll_path = os.path.join(current_directory, "falcon_full_64.dll")
your_dll = ctypes.CDLL(dll_path)

# Define the argument and return types for the generatePrivateKey function
your_dll.generatePrivateKey.argtypes = [ctypes.c_uint]
your_dll.generatePrivateKey.restype = ctypes.c_char_p

def generate_private_key(logn):
    # Call the DLL function
    private_key_str = your_dll.generatePrivateKey(logn)
    if private_key_str is None:
        print("Error: Private key generation failed.")
        return None

    return private_key_str.decode()

# Example usage
logn = 10  # Example logn value
private_key = generate_private_key(logn)
print("Private Key:", private_key)

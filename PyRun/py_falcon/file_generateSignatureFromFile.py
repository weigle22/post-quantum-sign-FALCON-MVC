import ctypes
import os

# Get the full path of the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Load the DLL
dll_path = os.path.join(current_directory, "falcon_full_64.dll")
your_dll = ctypes.CDLL(dll_path)

# Define the argument and return types for the generateSignatureFromFile function
your_dll.generateSignatureFromFile.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_uint]
your_dll.generateSignatureFromFile.restype = ctypes.c_char_p

def generate_signature_from_file(file_path, private_key_str, logn):
    # Call the DLL function
    signature_str = your_dll.generateSignatureFromFile(file_path.encode(), private_key_str.encode(), logn)
    if signature_str is None:
        print("Error: Signature generation from file failed.")
        return None

    return signature_str.decode()

# Ask the user for the file path
file_path = input("Enter the file path: ")

# Check if the file exists
if not os.path.isfile(file_path):
    print("Error: File not found.")
    exit()

# Ask the user for the private key
private_key_str = input("Enter the private key hex string: ")

# Example logn value
logn = 10

# Generate signature from the file
signature = generate_signature_from_file(file_path, private_key_str, logn)
if signature:
    print("Signature:", signature)

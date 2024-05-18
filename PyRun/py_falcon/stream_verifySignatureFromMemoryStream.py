import ctypes
import os

# Get the full path of the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Load the DLL
dll_path = os.path.join(current_directory, "falcon_full_64.dll")
your_dll = ctypes.CDLL(dll_path)

# Define the argument and return types for the verifySignatureFromMemoryStream function
your_dll.verifySignatureFromMemoryStream.argtypes = [
    ctypes.c_char_p, ctypes.c_char_p, ctypes.c_char_p, ctypes.c_uint]
your_dll.verifySignatureFromMemoryStream.restype = ctypes.c_char_p


def verify_signature_from_memory_stream(file_data, signature_str, public_key_str, logn):
    # Call the DLL function
    verification_result_str = your_dll.verifySignatureFromMemoryStream(
        file_data, signature_str.encode(), public_key_str.encode(), logn)
    if verification_result_str is None:
        print("Error: Signature verification from memory stream failed.")
        return None

    return verification_result_str.decode()


# Ask the user for the file path
file_path = input("Enter the file path: ")

# Check if the file exists
if not os.path.isfile(file_path):
    print("Error: File not found.")
    exit()

# Read the file data
with open(file_path, "rb") as file:
    file_data = file.read()

# Ask the user for the signature
signature_str = input("Enter the signature to verify: ")

# Ask the user for the public key
public_key_str = input("Enter the public key hex string: ")

# Example logn value
logn = 10

# Verify signature of the file data
verification_result = verify_signature_from_memory_stream(
    file_data, signature_str, public_key_str, logn)
if verification_result:
    print("Verification Result:", verification_result)

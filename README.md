# Falcon Post-Quantum Signature Implementation

This repository implements the Falcon post-quantum signature scheme using **ASP.NET MVC (AngularJS)** and **ASP.NET Core Minimal API**.

Falcon stands for **FAst Fourier Lattice-based COmpact signatures over NTRU**. More details can be found on the official Falcon website: [https://falcon-sign.info/](https://falcon-sign.info/).

This project integrates Falcon's **post-quantum cryptography** into a web environment, utilizing:  
✅ **Falcon post-quantum signature scheme written in C**  
✅ **ASP.NET Core Minimal API**  
✅ **ASP.NET MVC with AngularJS**  

---

## Setup Guide

### Step 1: Create the Falcon DLL from the Reference Implementation

To use Falcon in this project, you need to generate a DLL from the official Falcon reference implementation.

#### 1. Install GnuWin32 Make for Windows  
   - Download and install **GnuWin32 Make**:  
     👉 [https://gnuwin32.sourceforge.net/packages/make.htm](https://gnuwin32.sourceforge.net/packages/make.htm)
   - If you're looking for alternatives, consider:  
     - **Cygwin**  
     - **MinGW (Minimalist GNU for Windows)**  
     - **Windows Subsystem for Linux (WSL)** (to access a native Linux `make` command in Windows)  

#### 2. Download and Open the Falcon Reference Implementation  
   - Download the Falcon reference implementation:  
     📥 [Falcon-impl-20211101.zip](https://falcon-sign.info/Falcon-impl-20211101.zip)  
   - Extract and open the `Falcon-impl-20211101` folder using **VS Code** or any preferred editor.

#### 3. Build the DLL  
   - Open a terminal in the `Falcon-impl-20211101` directory.
   - Run the following command:  
     ```
     make all
     ```
   - This will generate:  
     - **Object files (`.o`)**
     - **Executable files (`.exe`)** for running Falcon functions in a C environment  
     - A **DLL file (`falcon_full.dll`)** used in the MVC project  
   - To view the DLL’s source code, check the `falcon_dll.c` file.

#### 4. Copy the DLL  
   - Copy the `falcon_full.dll` file to your desktop or any location where you plan to use it.

#### 5. Clean Up (Optional)  
   - Run the following command to remove auto-generated files:  
     ```
     make clean
     ```

### Building 32-bit or 64-bit DLL

You can build either a **32-bit** or **64-bit** version of the DLL by modifying the **Makefile**.

- Open the `Makefile` and **enable** the required compiler settings based on your target build.
- **Disable** the other set of compilers.

```makefile
# ENABLE THIS TO BUILD IN 64 BIT
LD = clang
CC = clang
DLL_CC = x86_64-w64-mingw32-gcc

# ENABLE THIS TO BUILD IN 32 BIT
# LD = i686-w64-mingw32-gcc
# CC = i686-w64-mingw32-gcc
# DLL_CC = i686-w64-mingw32-gcc
```

You can also use your preferred C compiler by modifying the `CC` flags.

---

### Step 2: Set Up the Falcon API

#### 1. Reference the DLL in the API  
   - If you modified `falcon_full.dll`, place the updated DLL inside the `FalconDLL` folder in the API directory.

#### 2. Run the API Locally  
   - Start the API and test it via **Swagger UI**.
   - Default API security: _No authorization required_. You may add authentication for production.
   - Database integration is possible by modifying the `DataAccess` app (sample `UserData` database access is included).
   - Check `Program.cs` and `FalconWrapper.cs` to understand how the DLL is used.

#### 3. Publish the API  
   - Once tested, publish the API and integrate it into your projects.

---

### Step 3: Set Up the MVC Project  

💡 **Note:** This ASP.NET MVC solution **only** demonstrates API functionality using controller calls. You can use the API directly in your front-end projects.

#### 1. Restore the Database  
   - Locate the **SQL Server backup file**:  
     📂 `FALCONx/db_schema/FLCNX_DB.bak`  
   - Restore it in **your local SQL Server**.

#### 2. Run the ASP.NET MVC Project  
   - Open the Visual Studio solution in the `FALCONx` folder.
   - Run the project.

#### 3. Login Credentials  
   Use the following credentials to log in:  
   ```
   Email:    admin@admin
   Password: admin
   ```
   Alternatively, you can **sign up for a new account**.

#### 4. Follow the User Guide  
   - 📖 [User Guide.pdf](https://github.com/weigle22/post-quantum-sign-FALCON-MVC/blob/main/FALCONx/User%20Guide.pdf) for detailed usage instructions.

---

### Python Implementation

In addition to the C implementation, there is a **Python version** available for reference.  
📂 **Location:** `PyRun/py_falcon/`

---

Happy coding! 🚀

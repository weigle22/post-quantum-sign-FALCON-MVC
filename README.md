# Falcon Post-Quantum Signature Implementation

This repository provides an implementation of the **Falcon post-quantum signature scheme** using **ASP.NET MVC (AngularJS)** and **ASP.NET Core Minimal API**.

Falcon (**FAst Fourier Lattice-based COmpact signatures over NTRU**) is a post-quantum cryptographic signature scheme designed for secure digital signatures. More details can be found on the official Falcon website: [https://falcon-sign.info/](https://falcon-sign.info/).

---

## Disclaimer

🚨 **This repository is for demonstration purposes only.** It is not intended for production use or deployment in security-critical applications. Use at your own risk.

---

## Features

This project integrates Falcon's **post-quantum cryptography** into a web environment, utilizing:

- ✅ **Falcon post-quantum signature scheme written in C**
- ✅ **ASP.NET Core Minimal API**
- ✅ **ASP.NET MVC with AngularJS**

---

## Setup Guide

### Step 1: Generate the Falcon DLL from the Reference Implementation

To use Falcon in this project, you need to build a DLL from the official Falcon reference implementation.

#### 1. Install GnuWin32 Make for Windows

- Download and install **GnuWin32 Make**:  
  👉 [https://gnuwin32.sourceforge.net/packages/make.htm](https://gnuwin32.sourceforge.net/packages/make.htm)
- Alternative options:
  - **Cygwin**
  - **MinGW (Minimalist GNU for Windows)**
  - **Windows Subsystem for Linux (WSL)** (for a native Linux `make` command on Windows)

#### 2. Build the DLL

📌 **Note:** The `Falcon-impl-20211101` in this repository has been modified to support DLL generation and testing. If you're curious about the original Falcon reference implementation, you can find it here:

📥 [Falcon-impl-20211101.zip](https://falcon-sign.info/Falcon-impl-20211101.zip)

**Steps to build the DLL:**

1. Open a terminal in the `Falcon-impl-20211101` directory.
2. Run the following command:
   ```sh
   make all
   ```
3. The following files will be generated:
   - **Object files (`.o`)**
   - **Executable files (`.exe`)** (for running Falcon functions in a C environment)
   - **DLL file (`falcon_full.dll`)** (used in the MVC project)
4. The DLL source code is available in `falcon_dll.c`.

#### 3. Copy the DLL

Copy the `falcon_full.dll` file to your preferred location for use in the project.

#### 4. Clean Up (Optional)

To remove auto-generated files, run:

```sh
make clean
```

---

### Step 2: Configure the Falcon API

#### 1. Reference the DLL in the API

- If you modify `falcon_full.dll`, place the updated DLL inside the `FalconDLL` folder within the API directory.

#### 2. Run the API Locally

- Start the API and test it using **Swagger UI**.
- The API **does not require authentication** by default, but you may add security configurations as needed.
- Database integration is available through the `DataAccess` component (sample `UserData` database access is included).
- Refer to `Program.cs` and `FalconWrapper.cs` to understand how the DLL is utilized.

#### 3. Publish the API

Once tested, you can publish the API and integrate it into your applications.

---

### Step 3: Set Up the MVC Project

💡 **Note:** The ASP.NET MVC solution demonstrates API functionality using controller calls. You may also use the API directly in other front-end projects.

#### 1. Restore the Database

- Locate the **SQL Server backup file**:
  📂 `FALCONx/db_schema/FLCNX_DB.bak`
- Restore it in your local SQL Server instance.

#### 2. Run the ASP.NET MVC Project

- Open the Visual Studio solution in the `FALCONx` folder.
- Start the project.

#### 3. Login Credentials

Use the following credentials to log in:

```sh
Email:    admin@admin
Password: admin
```

Alternatively, you can **sign up for a new account**.

#### 4. Follow the User Guide

📖 [User Guide.pdf](https://github.com/weigle22/post-quantum-sign-FALCON-MVC/blob/main/FALCONx/User%20Guide.pdf) for detailed instructions.

---

### Optional: Python Implementation

A **Python version** of the Falcon implementation is available for reference.  
📂 **Location:** `PyRun/py_falcon/`

---

## Building a 32-bit or 64-bit DLL

You can compile either a **32-bit** or **64-bit** version of the DLL by modifying the **Makefile**.

- Open `Makefile` and enable the appropriate compiler settings for your target build.
- Disable the unused compiler settings.

```makefile
# ENABLE THIS FOR 64-BIT BUILD
LD = clang
CC = clang
DLL_CC = x86_64-w64-mingw32-gcc

# ENABLE THIS FOR 32-BIT BUILD
# LD = i686-w64-mingw32-gcc
# CC = i686-w64-mingw32-gcc
# DLL_CC = i686-w64-mingw32-gcc
```

You can also use a different C compiler by modifying the `CC` flags accordingly.

---

## Conclusion

This project demonstrates how to integrate **Falcon post-quantum cryptography** into a web-based application using **ASP.NET Core Minimal API** and **ASP.NET MVC with AngularJS**. It provides a comprehensive setup guide to build, configure, and deploy the application.

🚀 **Happy coding!**


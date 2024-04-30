.POSIX:

# =====================================================================
#
# Configurable options:
#   CC       C compiler; GCC or Clang are fine; MSVC (2015+) works too.
#   CFLAGS   Compilation flags:
#             * Optimization level -O2 or higher is recommended
#            See config.h for some possible configuration macros.
#   LD       Linker; normally the same command as the compiler.
#   LDFLAGS  Linker options, not counting the extra libs.
#   LIBS     Extra libraries for linking:
#             * If using the native FPU, test_falcon and application
#               code that calls this library may need: -lm
#               (normally not needed on x86, both 32-bit and 64-bit)

CFLAGS = -Wall -Wextra -Wshadow -Wundef -O3 #-pg -fno-pie
LDFLAGS = #-pg -no-pie
LIBS = #-lm

# ENABLE THIS TO BUILD IN 64 BIT
LD = clang
CC = clang
DLL_CC = x86_64-w64-mingw32-gcc

# ENABLE THIS TO BUILD IN 32 BIT
# LD = i686-w64-mingw32-gcc
# CC = i686-w64-mingw32-gcc
# DLL_CC = i686-w64-mingw32-gcc

DLL_LDFLAGS = -shared

# =====================================================================

OBJ = codec.o common.o falcon.o fft.o fpr.o keygen.o rng.o shake.o sign.o vrfy.o

all: test_falcon speed main_program sign_files sign_a_message falcon_full.dll

clean:
	del /Q $(OBJ) test_falcon test_falcon.o speed speed.o main_program main_program.o sign_files sign_files.o generate_sk_pk generate_sk_pk.o sign_a_message sign_a_message.o falcon_full.dll falcon_full.o

test_falcon: test_falcon.o $(OBJ)
	$(LD) $(LDFLAGS) -o test_falcon test_falcon.o $(OBJ) $(LIBS)

speed: speed.o $(OBJ)
	$(LD) $(LDFLAGS) -o speed speed.o $(OBJ) $(LIBS)

main_program: main_program.o $(OBJ)
	$(LD) $(LDFLAGS) -o main_program main_program.o $(OBJ) $(LIBS)

main_program.o: main_program.c falcon.h config.h fpr.h
	$(CC) $(CFLAGS) -c -o main_program.o main_program.c

sign_a_message: sign_a_message.o $(OBJ)
	$(LD) $(LDFLAGS) -o sign_a_message sign_a_message.o $(OBJ) $(LIBS)

sign_a_message.o: sign_a_message.c falcon.h config.h fpr.h
	$(CC) $(CFLAGS) -c -o sign_a_message.o sign_a_message.c

sign_files: sign_files.o $(OBJ)
	$(LD) $(LDFLAGS) -o sign_files sign_files.o $(OBJ) $(LIBS)

sign_files.o: sign_files.c falcon.h config.h fpr.h
	$(CC) $(CFLAGS) -c -o sign_files.o sign_files.c

codec.o: codec.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o codec.o codec.c

common.o: common.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o common.o common.c

falcon.o: falcon.c falcon.h config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o falcon.o falcon.c

fft.o: fft.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o fft.o fft.c

fpr.o: fpr.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o fpr.o fpr.c

keygen.o: keygen.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o keygen.o keygen.c

rng.o: rng.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o rng.o rng.c

shake.o: shake.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o shake.o shake.c

sign.o: sign.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o sign.o sign.c

speed.o: speed.c falcon.h
	$(CC) $(CFLAGS) -c -o speed.o speed.c

test_falcon.o: test_falcon.c falcon.h config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o test_falcon.o test_falcon.c

vrfy.o: vrfy.c config.h inner.h fpr.h
	$(CC) $(CFLAGS) -c -o vrfy.o vrfy.c

falcon_full.dll: falcon_dll.c $(OBJ)
	$(DLL_CC) $(DLL_LDFLAGS) -o falcon_full.dll falcon_dll.c $(OBJ)

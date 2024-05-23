app.controller('VerifyFileController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

    // Ensure that Dropzone is properly initialized before accessing it
    Dropzone.autoDiscover = false;

    // Initialize Dropzone
    _s.myDropzonePublicKey = new Dropzone("#myDropzonePublicKey", {
        // Dropzone configuration options
        addRemoveLinks: true,
        // Dropzone configuration options
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        dictCancelUpload: '<i class="fe fe-x"></i>',
        maxFiles: 1, // Restrict to one file upload
        acceptedFiles: '.key',
        init: function () {
            this.on("addedfile", function (file) {
                if (file.name.endsWith('.key')) {
                    this.emit("thumbnail", file, "/Content/img/key-plain-64-public.png");
                }
                if (this.files.length > 1) {
                    this.removeFile(file); // Remove the extra file
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    _s.userKey.publicKey = event.target.result;
                    _s.$apply(); // Apply changes to AngularJS scope
                    _s.PublicKeyInfo(_s.userKey)
                };

                _s.$apply(function () {
                    _s.userKey.publicKeyFile.push(file); // Add file to uploadedFiles array
                });

                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _s.userKey.publicKey = null; // Clear the privateKey
                _s.userKey.verificationResult = null;
                _s.userInfo = {};
                _s.userKeyInfo = {};
                var index = _s.userKey.publicKeyFile.indexOf(file);
                if (index !== -1) {
                    _s.userKey.publicKeyFile.splice(index, 1); // Remove file from uploadedFiles array
                }
                _s.$apply();
            });
            this.on("maxfilesexceeded", function (file) {
                Swal.fire({
                    icon: 'info',
                    title: 'One key file only',
                    text: 'Click delete button to change the selected key',
                });
            });
        }
    });

    _s.myDropzoneUploadFiles = new Dropzone("#myDropzoneUploadFiles", {
        addRemoveLinks: true,
        //maxFilesize: 500, // 500 MB
        maxFilesize: 200, // 200 MB
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        dictCancelUpload: '<i class="fe fe-x"></i>',
        init: function () {
            this.on("addedfile", function (file) {
                // Check if file size exceeds 500MB
                //if (file.size > 500 * 1024 * 1024) { // Convert MB to Bytes
                if (file.size > 200 * 1024 * 1024) { // Convert MB to Bytes
                    // Show swal indicating file size exceeds limit
                    Swal.fire({
                        icon: 'error',
                        title: 'File Too Large',
                        text: 'The file size should not exceed 200MB.'
                    });
                    // Remove the file from Dropzone
                    this.removeFile(file);
                }
            });
            this.on("removedfile", function (file) {

            });
        }
    });


    _s.PublicKeyInfo = function (userKey) {
        _h.post('../Certificate/PublicKeyInfo', { _tUserKey: userKey }).then(function (c) {
            if (c.data.message == 'Success') {
                _s.userInfo = c.data.userInfo;
                _s.userKeyInfo = c.data.userKeyInfo;
                _s.userKeyInfo.dtRevoked = (_s.userKeyInfo.dtRevoked == null) ? null : new Date(parseInt((_s.userKeyInfo.dtRevoked).substr(6)));
                //_s.userKeyInfo.dtRevoked = new Date(c.data.userKeyInfo.dtRevoked);
            } else if (c.data.message == 'Public key not found') {
                Swal.fire({
                    icon: 'error',
                    title: 'Not found',
                    text: 'Public key not known',
                });
                _s.userKey.publicKey = null;
            } else if (c.data.message == 'User info not found') {
                Swal.fire({
                    icon: 'error',
                    title: 'User Not found',
                    text: 'User not known',
                });
                _s.userKey.publicKey = null;
            } 

        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });
    }


    _s.onLoad = function () {
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.showPrivateKey = false;
            _s.userKey.privateKeyFile = [];
            _s.userKey.publicKeyFile = [];
            _s.userKey.dropZoneFiles = [];
            _s.userKey.filesToSign = [];
            _s.userKey.hiddenPrivateKey = '';
            _s.userKey.showPrivateKey = false;
            _s.userKey.publicKey = null;
            _s.searchTerm = '';
            _s.userInfo = {};
            _s.userKeyInfo = {};
        }).catch(function () {
            // Error handling for user keys retrieval
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong while fetching user keys!',
            });
        }).finally(function () {
            // After fetching user keys, fetch users for select2
            _h.post("../Certificate/Users").then(function (c) {
                _s.users = c.data.users || []; // Ensure _s.users is not null
                // Initialize select2 after data is fetched

            }).catch(function () {
                // Error handling for fetching users
                Swal.fire({
                    icon: 'error',
                    title: 'Warning',
                    text: 'Something went wrong while fetching users!',
                });
            });
        });
    }

    _s.toggleShow = function (userKey, type) {
        if (type == 'privateKey') {
            if (userKey.showPrivateKey) {
                _s.userKey.privateKey = _s.userKey.hiddenPrivateKey;
            } else {
                _s.userKey.hiddenPrivateKey = _s.userKey.privateKey;
                _s.userKey.privateKey = '*'.repeat(_s.userKey.privateKey.length);
            }
        }
    };

    _s.AddToList = function (userKey) {

        // raw mode
        if (userKey.uploadMode == 'raw') {
            // Transfer files from dropZoneFiles to filesToSign
            // Get all files added to the Dropzone instance
            var files = _s.myDropzoneUploadFiles.files;
            var newFiles = [];

            // Update status only for new files, keep existing files untouched
            files.forEach(function (file) {
                var existingFile = userKey.filesToSign.find(function (existingFile) {
                    return existingFile.name === file.name;
                });
                if (!existingFile) {
                    file.status = 'UNVERIFIED';
                    file.signatureFile = null;
                    newFiles.push(file);
                }
            });

            userKey.filesToSign = userKey.filesToSign.concat(newFiles);
            _s.myDropzoneUploadFiles.removeAllFiles();
            $('#uploadFilesModal').modal('toggle');

            // Extract unique file extensions
            var uniqueExtensions = {};
            userKey.filesToSign.forEach(function (file) {
                var extension = file.name.split('.').pop();
                uniqueExtensions[extension] = true;
            });

            _s.userKey.uniqueExtensionsArray = Object.keys(uniqueExtensions);
            _s.optionValues = [];
            var fileCount = userKey.filesToSign.length;
            var optionCount = Math.ceil(fileCount / 10);
            for (var i = 1; i <= optionCount; i++) {
                _s.optionValues.push(i * 10);
            }
            _s.optionValues.push("View All"); // Add "View All" option
            if (userKey.selectedOption == null) {
                userKey.selectedOption = 10;
            } else {
                userKey.selectedOption = userKey.selectedOption;
            }
            _s.userKey.pages = Math.ceil(fileCount / userKey.selectedOption);
            //console.log(userKey.filesToSign);
        }

        // zip mode
        // zip mode
        else if (userKey.uploadMode == 'zip') {
            var zipfiles = _s.myDropzoneUploadFiles.files;
            var zipsWithoutSig = []; // Array to store zip filenames without .sig files

            zipfiles.forEach(function (zipFile) {
                var zip = new JSZip();

                zip.loadAsync(zipFile) // Load the zip file asynchronously
                    .then(function (zipContents) {
                        var hasSigFile = false;

                        // Check if the zip file contains a .sig file
                        zipContents.forEach(function (relativePath, zipEntry) {
                            if (!zipEntry.dir && zipEntry.name.endsWith('.sig')) {
                                hasSigFile = true;
                            }
                        });

                        if (!hasSigFile) {
                            console.log("Zip file does not contain a .sig file. Skipping extraction.");
                            zipsWithoutSig.push(zipFile.name); // Add filename to list
                            return Promise.resolve([]); // Skip extraction and return empty array
                        }

                        var extractedFilesPromises = [];

                        // Extract each file from the zip
                        zipContents.forEach(function (relativePath, zipEntry) {
                            if (!zipEntry.dir) { // Check if it's not a directory
                                var promise = zipEntry.async("blob").then(function (content) {
                                    // Create a File object from the extracted content
                                    return new File([content], zipEntry.name, { type: zipEntry.dir ? 'directory' : '' });
                                });

                                extractedFilesPromises.push(promise);
                            }
                        });

                        // Once all files are extracted, wait for all promises to resolve
                        return Promise.all(extractedFilesPromises);
                    })
                    .then(function (extractedFiles) {
                        // Check if any files were extracted
                        if (extractedFiles.length === 0) {
                            // No files were extracted, so no need to continue processing
                            return;
                        }

                        // Assign files to individual variables based on their extensions
                        var keyFile, sigFile, otherFile;

                        extractedFiles.forEach(function (file) {
                            if (file.name.endsWith('.key')) {
                                keyFile = file;
                            } else if (file.name.endsWith('.sig')) {
                                sigFile = file;
                            } else {
                                otherFile = file;
                            }
                        });

                        if (otherFile) {
                            var existingFile = userKey.filesToSign.find(function (existingFile) {
                                return existingFile.name === otherFile.name;
                            });
                            if (!existingFile) {
                                otherFile.status = 'UNVERIFIED';
                                otherFile.signatureFile = sigFile;
                                userKey.filesToSign = userKey.filesToSign.concat(otherFile);
                                _s.$apply(function () {
                                    _s.myDropzoneUploadFiles.removeAllFiles();
                                    $('#uploadFilesModal').modal('toggle');

                                    // Extract unique file extensions
                                    var uniqueExtensions = {};
                                    userKey.filesToSign.forEach(function (file) {
                                        var extension = file.name.split('.').pop();
                                        uniqueExtensions[extension] = true;
                                    });

                                    _s.userKey.uniqueExtensionsArray = Object.keys(uniqueExtensions);
                                    _s.optionValues = [];
                                    var fileCount = userKey.filesToSign.length;
                                    var optionCount = Math.ceil(fileCount / 10);
                                    for (var i = 1; i <= optionCount; i++) {
                                        _s.optionValues.push(i * 10);
                                    }
                                    _s.optionValues.push("View All"); // Add "View All" option
                                    if (userKey.selectedOption == null) {
                                        userKey.selectedOption = 10;
                                    } else {
                                        userKey.selectedOption = userKey.selectedOption;
                                    }
                                    _s.userKey.pages = Math.ceil(fileCount / userKey.selectedOption);
                                    //console.log(userKey.filesToSign);
                                });
                            }
                        }
                    })
                    .then(function () {
                        // Check if this is the last zip file processed
                        if (zipfiles.indexOf(zipFile) === zipfiles.length - 1) {
                            // Display SweetAlert2 alert with list of zip filenames without .sig files
                            if (zipsWithoutSig.length > 0) {
                                var filenamesList = zipsWithoutSig.join("\n");
                                Swal.fire({
                                    title: 'Warning!',
                                    text: 'The following zip files do not contain a .sig file:\n' + filenamesList,
                                    icon: 'warning',
                                    confirmButtonText: 'OK'
                                });
                            }
                        }
                    })
                    .catch(function (error) {
                        console.error("Error extracting zip file:", error);
                    });
            });
        }
    };

    _s.AddToList22 = function (userKey) {

        // raw mode
        if (userKey.uploadMode == 'raw') {
            // Transfer files from dropZoneFiles to filesToSign
            // Get all files added to the Dropzone instance
            var files = _s.myDropzoneUploadFiles.files;
            var newFiles = [];

            // Update status only for new files, keep existing files untouched
            files.forEach(function (file) {
                var existingFile = userKey.filesToSign.find(function (existingFile) {
                    return existingFile.name === file.name;
                });
                if (!existingFile) {
                    file.status = 'UNVERIFIED';
                    file.signatureFile = null;
                    newFiles.push(file);
                }
            });

            userKey.filesToSign = userKey.filesToSign.concat(newFiles);
            _s.myDropzoneUploadFiles.removeAllFiles();
            $('#uploadFilesModal').modal('toggle');

            // Extract unique file extensions
            var uniqueExtensions = {};
            userKey.filesToSign.forEach(function (file) {
                var extension = file.name.split('.').pop();
                uniqueExtensions[extension] = true;
            });

            _s.userKey.uniqueExtensionsArray = Object.keys(uniqueExtensions);
            _s.optionValues = [];
            var fileCount = userKey.filesToSign.length;
            var optionCount = Math.ceil(fileCount / 10);
            for (var i = 1; i <= optionCount; i++) {
                _s.optionValues.push(i * 10);
            }
            _s.optionValues.push("View All"); // Add "View All" option
            if (userKey.selectedOption == null) {
                userKey.selectedOption = 10;
            } else {
                userKey.selectedOption = userKey.selectedOption;
            }
            _s.userKey.pages = Math.ceil(fileCount / userKey.selectedOption);
            //console.log(userKey.filesToSign);
        }

        // zip mode
        else if (userKey.uploadMode == 'zip') {
            var zipfiles = _s.myDropzoneUploadFiles.files;

            zipfiles.forEach(function (zipFile) {
                var zip = new JSZip();

                zip.loadAsync(zipFile) // Load the zip file asynchronously
                    .then(function (zipContents) {
                        var extractedFilesPromises = [];

                        // Extract each file from the zip
                        zipContents.forEach(function (relativePath, zipEntry) {
                            if (!zipEntry.dir) { // Check if it's not a directory
                                var promise = zipEntry.async("blob").then(function (content) {
                                    // Create a File object from the extracted content
                                    return new File([content], zipEntry.name, { type: zipEntry.dir ? 'directory' : '' });
                                });

                                extractedFilesPromises.push(promise);
                            }
                        });

                        // Once all files are extracted, wait for all promises to resolve
                        return Promise.all(extractedFilesPromises);
                    })
                    .then(function (extractedFiles) {
                        // Assign files to individual variables based on their extensions
                        var keyFile, sigFile, otherFile;

                        extractedFiles.forEach(function (file) {
                            if (file.name.endsWith('.key')) {
                                keyFile = file;
                            } else if (file.name.endsWith('.sig')) {
                                sigFile = file;
                            } else {
                                otherFile = file;
                            }
                        });

                        if (otherFile) {
                            var existingFile = userKey.filesToSign.find(function (existingFile) {
                                return existingFile.name === otherFile.name;
                            });
                            if (!existingFile) {
                                otherFile.status = 'UNVERIFIED';
                                otherFile.signatureFile = sigFile;
                                userKey.filesToSign = userKey.filesToSign.concat(otherFile);
                                _s.$apply(function () {
                                    _s.myDropzoneUploadFiles.removeAllFiles();
                                    $('#uploadFilesModal').modal('toggle');

                                    // Extract unique file extensions
                                    var uniqueExtensions = {};
                                    userKey.filesToSign.forEach(function (file) {
                                        var extension = file.name.split('.').pop();
                                        uniqueExtensions[extension] = true;
                                    });

                                    _s.userKey.uniqueExtensionsArray = Object.keys(uniqueExtensions);
                                    _s.optionValues = [];
                                    var fileCount = userKey.filesToSign.length;
                                    var optionCount = Math.ceil(fileCount / 10);
                                    for (var i = 1; i <= optionCount; i++) {
                                        _s.optionValues.push(i * 10);
                                    }
                                    _s.optionValues.push("View All"); // Add "View All" option
                                    if (userKey.selectedOption == null) {
                                        userKey.selectedOption = 10;
                                    } else {
                                        userKey.selectedOption = userKey.selectedOption;
                                    }
                                    _s.userKey.pages = Math.ceil(fileCount / userKey.selectedOption);
                                    //console.log(userKey.filesToSign);
                                });
                            }
                        }
                    })
                    .catch(function (error) {
                        console.error("Error extracting zip file:", error);
                    });
            });
        }



    };

    _s.removeFile = function (index) {
        _s.userKey.filesToSign.splice(index, 1);
    };

    _s.removeAllFiles = function (userKey) {
        userKey.filesToSign = [];
    };

    _s.VerifyAllFiles = async function (userKey) {
        // Define a recursive function to sign files sequentially
        async function signFilesSequentially(index) {
            // Base case: if all files are signed, return
            if (index === userKey.filesToSign.length) {
                return;
            }

            // Get the current file
            const file = userKey.filesToSign[index];

            // Check if the file is already signed
            if (file.status !== 'SIGNED') {
                try {
                    // Call VerifyFile and wait for it to complete
                    await _s.VerifyFile(file, userKey);
                } catch (error) {
                    console.error('Error signing file:', error);
                    // Handle the error
                    Swal.fire({
                        icon: 'error',
                        title: 'Warning',
                        text: 'Something went wrong while signing files!',
                    });
                }
            }

            // Process the next file recursively
            await signFilesSequentially(index + 1);
        }

        // Start signing files sequentially, starting from index 0
        await signFilesSequentially(0);
    };

    _s.VerifyFile = function (file, userKey) {
        return new Promise((resolve, reject) => {
            file.status = 'VERIFYING';
            var formData = new FormData();
            formData.append('userFile', file);
            formData.append('sigFile', file.signatureFile);

            if (userKey.uploadPublicKey) {
                formData.append('publicKeyFile', userKey.publicKeyFile[0]);
            }
            else {
                var blob = new Blob([userKey.publicKey], { type: 'text/plain' });
                blob.name = 'public.key';
                formData.append('publicKeyFile', blob);
            }

            _h.post("../Verify/VerifyFileMessage", formData, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function (response) {

                switch (response.data.result) {
                    case '0':
                        file.status = 'AUTHENTIC';
                        resolve(file.status);
                        break;
                    case '-4':
                        file.status = 'BAD SIGNATURE';
                        resolve(file.status);
                        break;
                    case '-3':
                        file.status = 'INVALID REQ.';
                        resolve(file.status);
                        break;
                    default:
                }
            }).catch(function (error) {
                console.error('Error calling API:', error);
                reject(error);
            });
        });
    };

    $('#user-select2').on('change', function () {
        // Get the selected value
        var selectedValue = $(this).val();
        if (selectedValue != '') {
            var userID = selectedValue.split(':')[1];
            // Trigger the ng-change event with AngularJS's $apply function
            _s.$apply(function () {
                // Call the function defined in ng-change
                _s.SignerKey(userID);
            });
        }
    });

    _s.toggleUploadPublicKey = function (userKey) {
        _s.userInfo = {};
        _s.userKeyInfo = {};
        if (userKey.uploadPublicKey) {
            userKey.publicKey = null;
            userKey.selectedUser = null;
            $("#user-select2").val(null).trigger("change");
        } else {
            $("#user-select2").val(null).trigger("change");
            _s.myDropzonePublicKey.removeAllFiles();
        }
    };

    _s.SignerKey = function (userID) {
        console.log(userID);
        _h.post("../Certificate/SignerKey", { userID: userID }).then(function (c) {

            if (c.data.message == 'Success') {
                _s.userKey.publicKey = c.data.signerKey.publicKey;
            }
            else {
                Swal.fire({
                    icon: 'info',
                    title: 'No active public keys',
                    text: c.data.message,
                });
            }
        }).catch(function () {
            // Error handling for fetching users
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong while fetching users!',
            });
        });
    }

    _s.openFilePicker = function (index, event, file) {
        var fileInput = document.getElementById('fileInput_' + index);
        if (fileInput) {
            fileInput.click(); // Trigger click event on the file input element
            fileInput.addEventListener('change', function (event) {
                // File has been selected
                var selectedFile = event.target.files[0];
                // Do whatever you need with the selected file, for example, assign it to ng-model
                _s.userKey.filesToSign[index].signatureFile = selectedFile;
                // You might need to manually trigger the digest cycle if necessary
                _s.$apply();
                //console.log(_s.userKey.filesToSign);
            });
        }
    };



}]);

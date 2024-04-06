app.controller('SignFileController', ['$scope', '$rootScope', '$http', '$filter', 'fileService', function (_s, _rs, _h, _f, _fs) {

    // Ensure that Dropzone is properly initialized before accessing it
    Dropzone.autoDiscover = false;

    _s.myDropzoneUploadFiles = new Dropzone("#myDropzoneUploadFiles", {
        addRemoveLinks: true,
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        init: function () {
            this.on("addedfile", function (file) {
                
            });
            this.on("removedfile", function (file) {
                
            });
        }
    });


    _s.onLoad = function () {

        var sessionUserName = _fs.getSessionUserName();
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.showPrivateKey = false;
            //_s.userKey.privateKeyFile = [];
            _s.userKey.dropZoneFiles = [];
            _s.userKey.filesToSign = [];
            _s.userKey.hiddenPrivateKey = '';
            _s.userKey.showPrivateKey = false;
            _s.searchTerm = '';
            _s.userKey.includePublicKey = true;
            _s.userKey.sessionUserName = sessionUserName;

            _s.userPrivateKeyObj = _fs.getFileText();
            if (_s.userPrivateKeyObj != null) {
                if (_s.userPrivateKeyObj.userPrivateKeyBlob != null) {
                    _s.userKey.privateKeyFile = _s.userPrivateKeyObj.userPrivateKeyBlob;
                    _s.userKey.privateKey = _s.userPrivateKeyObj.userPrivateKey;
                    _s.userKey.hiddenPrivateKey = _s.userKey.privateKey;
                    _s.userKey.privateKey = '*'.repeat(_s.userKey.privateKey.length);
                }
            }
        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
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
        // Transfer files from dropZoneFiles to filesToSign
        // Get all files added to the Dropzone instance
        var files = _s.myDropzoneUploadFiles.files;
        userKey.filesToSign = userKey.filesToSign.concat(files);
        _s.myDropzoneUploadFiles.removeAllFiles();
        $('#uploadFilesModal').modal('toggle');

        // Extract unique file extensions
        var uniqueExtensions = {};
        userKey.filesToSign.forEach(function (file) {
            var extension = file.upload.filename.split('.').pop();
            uniqueExtensions[extension] = true;
            file.status = 'UNSIGNED';
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
    };
    _s.removeFile = function (index) {
        _s.userKey.filesToSign.splice(index, 1);
    };

    _s.removeAllFiles = function (userKey) {
        userKey.filesToSign = [];
    };

    _s.SignAllFiles = async function (userKey) {
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
                    // Call SignFile and wait for it to complete
                    await _s.SignFile(file, userKey);
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

    _s.SignFile = function (file, userKey) {
        return new Promise((resolve, reject) => {
            file.status = 'SIGNING';
            var formData = new FormData();
            formData.append('userFile', file);
            formData.append('privateKeyFile', userKey.privateKeyFile);

            _h.post("../Signature/SignFileMessage", formData, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity,
                responseType: 'arraybuffer'
            }).then(function (response) {
                var blob = new Blob([response.data], { type: 'application/zip' });
                var fileName = getFileNameFromResponse(response);

                if (userKey.includePublicKey) {
                    addPublicKeyToZip(file, userKey, blob, fileName)
                        .then(updatedBlob => {
                            file.signedFile = updatedBlob;
                            file.signedFileName = fileName;
                            file.status = 'SIGNED'; // Updated here
                            resolve(file.status);
                            _s.$apply();
                        })
                        .catch(error => {
                            console.error('Error processing ZIP with public key:', error);
                            reject(error);
                        });
                } else {
                    file.signedFile = blob;
                    file.signedFileName = fileName;
                    file.status = 'SIGNED'; // Updated here
                    resolve(file.status);
                }
            }).catch(function (error) {
                console.error('Error calling API:', error);
                file.status = 'ERROR'; // Update status in case of error
                reject(error);
            });
        });
    };

    function getFileNameFromResponse(response) {
        var contentDisposition = response.headers('Content-Disposition');
        if (contentDisposition) {
            var fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = fileNameRegex.exec(contentDisposition);
            if (matches && matches[1]) {
                return matches[1].replace(/['"]/g, '');
            }
        }
        return "";
    }

    function addPublicKeyToZip(file, userKey, blob, fileName) {
        var zip = new JSZip();
        zip.file(_s.userKey.sessionUserName + '.key', userKey.publicKey);
        return zip.loadAsync(blob).then(() => zip.generateAsync({ type: "blob" }));
    }



    _s.SignFile33 = function (file, userKey) {

        return new Promise((resolve, reject) => {
            file.status = 'SIGNING';
            var formData = new FormData();
            formData.append('userFile', file);
            formData.append('privateKeyFile', userKey.privateKeyFile);

            _h.post("../Signature/SignFileMessage", formData, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity,
                responseType: 'arraybuffer'
            }).then(function (response) {
                var blob = new Blob([response.data], { type: 'application/zip' });
                var fileName = "";

                var contentDisposition = response.headers('Content-Disposition');
                if (contentDisposition) {
                    var fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = fileNameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        fileName = matches[1].replace(/['"]/g, '');
                    }
                }

                if (userKey.includePublicKey) {
                    // Create a new JSZip instance
                    var zip = new JSZip();
                    // Add public.key file of the signer
                    zip.file(_s.userKey.sessionUserName + '.key', userKey.publicKey);
                    // Add the original zip blob to the new zip instance
                    zip.loadAsync(blob).then(function () {
                        // Generate the updated zip blob
                        return zip.generateAsync({ type: "blob" });
                    }).then(function (updatedBlob) {
                        // Assign the updated zip blob to file.signedFile
                        file.signedFile = updatedBlob;
                        file.signedFileName = fileName;
                        file.status = 'SIGNED';
                        _s.$apply();
                        resolve(file.status);
                    });
                }
                else {
                    // Assign the original zip blob to file.signedFile
                    file.signedFile = blob;
                    file.signedFileName = fileName;
                    file.status = 'SIGNED';
                    resolve(file.status);
                }
            }).catch(function (error) {
                console.error('Error calling API:', error);
                reject(error);
            });
        });
    };

    _s.SignFile22 = function (file, userKey) {

        return new Promise((resolve, reject) => {
            file.status = 'SIGNING';
            var formData = new FormData();
            formData.append('userFile', file);
            formData.append('privateKeyFile', userKey.privateKeyFile);

            _h.post("../Signature/SignFileMessage", formData, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity,
                responseType: 'arraybuffer'
            }).then(function (response) {
                var blob = new Blob([response.data], { type: 'application/zip' });
                var fileName = "";

                var contentDisposition = response.headers('Content-Disposition');
                if (contentDisposition) {
                    var fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = fileNameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        fileName = matches[1].replace(/['"]/g, '');
                    }
                }

                if (userKey.includePublicKey) {
                    var zip = new JSZip();
                    zip.file(_s.userKey.sessionUserName + '.key', userKey.publicKey);
                    zip.file(fileName, blob);

                    zip.generateAsync({ type: "blob" }).then(function (content) {
                        file.signedFile = content;
                    });

                }
                else {
                    file.signedFile = blob;
                }

                //file.signedFile = blob;
                file.signedFileName = fileName;
                file.status = 'SIGNED';
                resolve(file.status);
            }).catch(function (error) {
                console.error('Error calling API:', error);
                reject(error);
            });
        });
    };

    _s.DownloadSignedFile = function (file) {
        saveAs(file.signedFile, file.signedFileName || 'downloaded_file.zip');
    };

    _s.changePage = function (pageNumber) {
        
    };

}]);

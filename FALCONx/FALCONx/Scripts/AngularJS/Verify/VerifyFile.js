app.controller('VerifyFileController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

    // Ensure that Dropzone is properly initialized before accessing it
    Dropzone.autoDiscover = false;

    // Initialize Dropzone
    _s.myDropzone = new Dropzone("#myDropzone", {
        // Dropzone configuration options
        addRemoveLinks: true,
        // Dropzone configuration options
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        maxFiles: 1, // Restrict to one file upload
        acceptedFiles: '.key',
        init: function () {
            this.on("addedfile", function (file) {
                if (this.files.length > 1) {
                    this.removeFile(file); // Remove the extra file
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    _s.userKey.privateKey = event.target.result;
                    _s.userKey.hiddenPrivateKey = _s.userKey.privateKey;
                    _s.userKey.privateKey = '*'.repeat(_s.userKey.privateKey.length);
                    _s.$apply(); // Apply changes to AngularJS scope
                };

                _s.$apply(function () {
                    _s.userKey.privateKeyFile.push(file); // Add file to uploadedFiles array
                });

                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _s.userKey.privateKey = null; // Clear the privateKey
                _s.userKey.textMessage = null; // Clear the textMessage
                _s.userKey.textSignature = null; // Clear the textSignature

                _s.$apply(); // Apply changes to AngularJS scope
                _s.$apply(function () {
                    var index = _s.userKey.privateKeyFile.indexOf(file);
                    if (index !== -1) {
                        _s.userKey.privateKeyFile.splice(index, 1); // Remove file from uploadedFiles array
                    }
                });
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
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        init: function () {
            this.on("addedfile", function (file) {

            });
            this.on("removedfile", function (file) {

            });
        }
    });


    _s.onLoad = function () {
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.showPrivateKey = false;
            _s.userKey.privateKeyFile = [];
            _s.userKey.dropZoneFiles = [];
            _s.userKey.filesToSign = [];
            _s.userKey.hiddenPrivateKey = '';
            _s.userKey.showPrivateKey = false;
            _s.searchTerm = '';
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
            formData.append('privateKeyFile', userKey.privateKeyFile[0]);

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

                file.signedFile = blob;
                file.signedFileName = fileName;
                file.status = 'SIGNED';
                console.log(file);
                resolve(file.status);
            }).catch(function (error) {
                console.error('Error calling API:', error);
                reject(error);
            });
        });
    };


    _s.SignFile22 = function (file, userKey) {
        file.status = 'SIGNING';
        var formData = new FormData();
        formData.append('userFile', file);
        formData.append('privateKeyFile', userKey.privateKeyFile[0]);

        _h.post("../Signature/SignFileMessage", formData, {
            withCredentials: true,
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity,
            responseType: 'arraybuffer' // Specify the response type as arraybuffer to handle binary data
        }).then(function (response) {
            var blob = new Blob([response.data], { type: 'application/zip' });
            var fileName = ""; // Initialize fileName variable

            // Extract the file name from the Content-Disposition header, if available
            var contentDisposition = response.headers('Content-Disposition');
            if (contentDisposition) {
                var fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = fileNameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    fileName = matches[1].replace(/['"]/g, '');
                }
            }

            file.signedFile = blob;
            file.signedFileName = fileName;
            file.status = 'SIGNED'
            console.log(file)

            return file.status;

        }, function (error) {
            // Error callback
            console.error('Error calling API:', error);
            // Handle the error
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });
    };

    _s.DownloadSignedFile = function (file) {
        saveAs(file.signedFile, file.signedFileName || 'downloaded_file.zip');
    };

    _s.changePage = function (pageNumber) {

    };

}]);

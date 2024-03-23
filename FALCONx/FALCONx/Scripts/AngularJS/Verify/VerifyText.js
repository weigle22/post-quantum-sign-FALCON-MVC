app.controller('VerifyTextController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

    // Ensure that Dropzone is properly initialized before accessing it
    Dropzone.autoDiscover = false;

    _s.myDropzoneTextFile = new Dropzone("#myDropzoneTextFile", {
        // Dropzone configuration options
        addRemoveLinks: true,
        // Dropzone configuration options
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        maxFiles: 1, // Restrict to one file upload
        acceptedFiles: '.txt',
        init: function () {
            this.on("addedfile", function (file) {
                if (this.files.length > 1) {
                    this.removeFile(file); // Remove the extra file
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    _s.userKey.textMessage = event.target.result;
                    _s.$apply(); // Apply changes to AngularJS scope
                };

                _s.$apply(function () {
                    _s.userKey.textMessageFile.push(file); // Add file to uploadedFiles array
                });

                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _s.userKey.publicKey = null; // Clear the privateKey
                _s.userKey.textMessage = null; // Clear the textMessage
                _s.userKey.textSignature = null; // Clear the textSignature
                _s.userKey.verificationResult = null;
                _s.$apply(); // Apply changes to AngularJS scope
                _s.$apply(function () {
                    var index = 0; // zero for 1 file
                    _s.userKey.textMessageFile.splice(index, 1); // Remove file from uploadedFiles array
                    _s.userKey.textSignatureFile.splice(index, 1);
                    _s.userKey.publicKeyFile.splice(index, 1);
                });
                _s.myDropzoneTextSignature.removeAllFiles();
                _s.myDropzonePublicKey.removeAllFiles();
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

    _s.myDropzoneTextSignature = new Dropzone("#myDropzoneTextSignature", {
        // Dropzone configuration options
        addRemoveLinks: true,
        // Dropzone configuration options
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        maxFiles: 1, // Restrict to one file upload
        acceptedFiles: '.sig',
        init: function () {
            this.on("addedfile", function (file) {
                if (this.files.length > 1) {
                    this.removeFile(file); // Remove the extra file
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    _s.userKey.textSignature = event.target.result;
                    _s.userKey.hiddenTextSignature = _s.userKey.textSignature;
                    _s.userKey.textSignature = '*'.repeat(_s.userKey.textSignature.length);
                    _s.$apply(); // Apply changes to AngularJS scope
                };

                _s.$apply(function () {
                    _s.userKey.textSignatureFile.push(file); // Add file to uploadedFiles array
                });

                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _s.userKey.textSignature = null; // Clear the textSignature
                _s.userKey.verificationResult = null;
                _s.$apply(); // Apply changes to AngularJS scope
                _s.$apply(function () {
                    var index = 0;
                    _s.userKey.textSignatureFile.splice(index, 1); // Remove file from uploadedFiles array
                });
                _s.myDropzonePublicKey.removeAllFiles();
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

    // Initialize Dropzone
    _s.myDropzonePublicKey = new Dropzone("#myDropzonePublicKey", {
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
                    _s.userKey.publicKey = event.target.result;
                    _s.$apply(); // Apply changes to AngularJS scope
                };

                _s.$apply(function () {
                    _s.userKey.publicKeyFile.push(file); // Add file to uploadedFiles array
                });

                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _s.userKey.publicKey = null; // Clear the privateKey
                _s.userKey.verificationResult = null;
                _s.$apply(); // Apply changes to AngularJS scope
                _s.$apply(function () {
                    var index = _s.userKey.publicKeyFile.indexOf(file);
                    if (index !== -1) {
                        _s.userKey.publicKeyFile.splice(index, 1); // Remove file from uploadedFiles array
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
    
    _s.onLoad = function () {
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.showPrivateKey = false;
            _s.userKey.dropzoneText = 'Drop key file here or click to upload';
            _s.userKey.textMessageFile = [];
            _s.userKey.textSignatureFile = [];
            _s.userKey.publicKeyFile = [];
            _s.userKey.hiddenPrivateKey = '';
            _s.userKey.hiddenTextSignature = '';
            _s.userKey.showPrivateKey = false;
            _s.userKey.textMessage = null;
            _s.userKey.textSignature = null;
            _s.userKey.publicKey = null;
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
        } else if (type == 'textSignature') {
            if (userKey.showTextSignature) {
                _s.userKey.textSignature = _s.userKey.hiddenTextSignature;
            } else {
                _s.userKey.hiddenTextSignature = _s.userKey.textSignature;
                _s.userKey.textSignature = '*'.repeat(_s.userKey.textSignature.length);
            }
        }
    };

    _s.ChangeTextMessage = function (userKey) {
        userKey.textSignature = null;
    };

    _s.copyToClipboard = function (userKey) {
        navigator.clipboard.writeText(userKey.textSignature)
            .then(console.log('copied!'));

        Swal.fire({
            position: "center",
            icon: "success",
            title: "Copied to clipboard",
            showConfirmButton: false,
            timer: 1000
        });
    };

    _s.DownloadSignedMessage = function (userKey) {
        var zip = new JSZip();

        // Add text message to the zip file
        zip.file("message.txt", userKey.textMessage);

        // Add signature to the zip file
        zip.file("message.sig", userKey.hiddenTextSignature);

        // Generate the zip file asynchronously
        zip.generateAsync({ type: "blob" }).then(function (content) {
            // Create a download link
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(content);

            // Set the download attributes
            a.href = url;
            a.download = "signed_message.zip";

            // Append the link to the body and trigger the download
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    };

    _s.VerifyText = function (userKey) {
        var formData = new FormData();
        formData.append('textMessageFile', userKey.textMessageFile[0]);
        formData.append('textSignatureFile', userKey.textSignatureFile[0]);
        formData.append('publicKeyFile', userKey.publicKeyFile[0]);

        _h.post("../Verify/VerifyText", formData, {
            withCredentials: true,
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
        }).then(function (c) {
            if (c.data.message == 'Success') {
                _s.userKey.verificationResult = c.data.result.result;
                switch (_s.userKey.verificationResult) {
                    case '0':
                        _s.userKey.cardBg = 'bg-success';
                        _s.userKey.circleBg = 'bg-success-light';
                        _s.userKey.buttonBg = 'bg-success-light';
                        _s.userKey.resultText = '100% Authentic';
                        _s.userKey.resultIcon = 'fe-check';
                        _s.userKey.resultExplaination = 'Based on the FALCON results, your file is 100% authentic. RESULT: ' + _s.userKey.verificationResult;
                        break;
                    case '-4':
                        _s.userKey.cardBg = 'bg-danger';
                        _s.userKey.circleBg = 'bg-danger-light';
                        _s.userKey.buttonBg = 'bg-danger-light';
                        _s.userKey.resultText = 'Bad Signature';
                        _s.userKey.resultIcon = 'fe-x';
                        _s.userKey.resultExplaination = 'Based on the result, your signature does not match the provided message and public key. RESULT: ' + _s.userKey.verificationResult;
                        break;
                    case '-3':
                        _s.userKey.cardBg = 'bg-warning';
                        _s.userKey.circleBg = 'bg-warning-light';
                        _s.userKey.buttonBg = 'bg-warning-light';
                        _s.userKey.resultText = 'Invalid Requirements';
                        _s.userKey.resultIcon = 'fe-alert-triangle';
                        _s.userKey.resultExplaination = 'Decoding of an external object: public key, private key, signature failed. This happens when one of the requirements is invalid. RESULT: ' + _s.userKey.verificationResult;
                        break;
                    default:
                }
                console.log(_s.userKey);
            } else if (c.data.message == 'Failed') {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid',
                    text: 'Request Invalid!',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error in saving the record!',
                });
            }

        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });
    }

    
}]);
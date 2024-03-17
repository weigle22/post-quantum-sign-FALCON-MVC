app.controller('SignTextController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

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
                    _s.$apply(); // Apply changes to AngularJS scope
                };

                _s.$apply(function () {
                    _s.userKey.privateKeyFile.push(file); // Add file to uploadedFiles array
                });

                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _s.userKey.privateKey = ''; // Clear the privateKey
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

    _s.onLoad = function () {
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.pasteEnabled = false;
            _s.userKey.dropzoneText = 'Drop key file here or click to upload';
            _s.userKey.privateKeyFile = [];
        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });
        //console.log(Dropzone.version);
        //console.log(myDropzone);
    }

    _s.toggleDropzone = function (userKey) {
        if (_s.userKey.pasteEnabled) {
            _s.myDropzone.disable(); // Disable Dropzone if checkbox is checked
            _s.userKey.privateKey = null;
            _s.userKey.dropzoneText = 'Paste private key in the text area'

            if (_s.myDropzone.files.length > 0) {
                // Programmatically trigger the removal of the file
                //_s.myDropzone.removeAllFiles();
            }

        } else {
            _s.myDropzone.enable(); // Enable Dropzone if checkbox is unchecked
            _s.userKey.privateKey = null;
            _s.userKey.dropzoneText = 'Drop key file here or click to upload';
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
        zip.file("signature.sig", userKey.textSignature);

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

    _s.SignMessage = function (userKey) {
        var formData = new FormData();
        formData.append('textMessage', userKey.textMessage);
        formData.append('privateKeyFile', userKey.privateKeyFile[0]);

        _h.post("../Signature/SignTextMessage", formData, {
            withCredentials: true,
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
        }).then(function (c) {
            if (c.data.message == 'Success') {
                _s.userKey.textSignature = c.data.result.signature_str;
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
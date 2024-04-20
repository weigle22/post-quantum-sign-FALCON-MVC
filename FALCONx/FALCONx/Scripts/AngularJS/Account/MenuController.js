app.controller('MenuController', ['$scope', '$rootScope', '$http', 'fileService', '$location', function (_s, _rs, _h, _fs, _l) {

    _s.onLoad = function () {
        _s.privateKey = null;
        _s.privateKeyVerificationResult = _fs.getprivateKeyVerificationResult();
        console.log(_s.privateKeyVerificationResult);
        _h.post('../Session/GetSession').then(function (c) {
            _s.session = c.data.session;
            _s.sessionKeys = c.data.sessionKeys;

        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });

        _s.userPrivateKeyObj = _fs.getFileText();
        if (_s.userPrivateKeyObj != null) {
            if (_s.userPrivateKeyObj.userPrivateKeyBlob != null) {
                _s.myDropzone.addFile(_s.userPrivateKeyObj.userPrivateKeyBlob);
            }
        }

    }

    _rs.$on('executeOnLoad', function () {
        _s.onLoad();
    });

    // Ensure that Dropzone is properly initialized before accessing it
    Dropzone.autoDiscover = false;

    // Initialize Dropzone
    _s.myDropzone = new Dropzone("#myDropzonePrivateKeyUpload", {
        // Dropzone configuration options
        addRemoveLinks: true,
        // Dropzone configuration options
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        dictCancelUpload: '<i class="fe fe-x"></i>',
        //dictCancelUploadConfirmation: "asdasdd?",
        maxFiles: 1, // Restrict to one file upload
        acceptedFiles: '.key',
        init: function () {

            this.on("addedfile", function (file) {
                if (file.name.endsWith('.key')) {
                    this.emit("thumbnail", file, "/Content/img/key-plain-64-private.png");
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    var fileContent = event.target.result;

                    var skGoodKeyLength = fileContent.length === 4610;

                    if (skGoodKeyLength) {
                        if (_s.privateKeyVerificationResult == null) {
                            _fs.setFileText(fileContent)
                                .then(function (result) {
                                    if (result === 'verified') {
                                        console.log('File is verified.');
                                        // Do something if the file is verified
                                        _fs.setprivateKeyVerificationResult(result);
                                        _s.privateKeyVerificationResult = _fs.getprivateKeyVerificationResult();
                                    }
                                    else if (result === 'badsig' || result === 'invalid key') {
                                        console.log('File verification failed.');
                                        // Do something if the file verification failed
                                        _fs.setprivateKeyVerificationResult(result);
                                        _s.privateKeyVerificationResult = _fs.getprivateKeyVerificationResult();
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Opps .. !',
                                            text: 'The private key uploaded does not belong to you',
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                _s.myDropzone.removeFile(file);
                                            }
                                        });
                                    }
                                    else {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'Something went wrong',
                                            text: result,
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                _s.myDropzone.removeFile(file);
                                            }
                                        });
                                    }
                                })
                                .catch(function (error) {
                                    //console.error('An error occurred:', error);
                                    // Handle error if the promise is rejected
                                    Swal.fire({
                                        icon: 'info',
                                        title: 'Information',
                                        text: error,
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            _s.myDropzone.removeFile(file);
                                        }
                                    });;
                                    //_s.myDropzone.removeFile(file);
                                });
                            _fs.setSessionUserName(_s.session.username);
                        }
                    }
                    else {
                        Swal.fire({
                            icon: 'info',
                            title: 'Invalid length',
                            text: 'Invalid private key length'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                _s.myDropzone.removeFile(file);
                            }
                        });
                    }

                    
                };
                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _h.post('../Session/ClearVerificationResult').then(function (c) {
                    console.log(c);
                    _fs.removeFile();
                    _s.onLoad();
                    window.location.href = "../Signa/Home";
                }, function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Warning',
                        text: 'Something went wrong!',
                    });
                });
            });
            this.on("maxfilesexceeded", function (file) {
                Swal.fire({
                    icon: 'info',
                    title: 'One key file only',
                    text: 'Click delete button to change the selected key',
                });
            });
            //// Handle dictCancelUpload event with SweetAlert
            //this.on("canceled", function (file) {
            //    Swal.fire({
            //        icon: 'info',
            //        title: 'Upload Cancelled',
            //        text: 'Your upload has been cancelled.',
            //    });
            //});
        }
    });

}]);

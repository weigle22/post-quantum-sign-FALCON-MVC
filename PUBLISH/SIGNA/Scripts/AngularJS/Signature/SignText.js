app.controller('SignTextController', ['$scope', '$rootScope', '$http', '$filter', 'fileService', function (_s, _rs, _h, _f, _fs) {

    _s.onLoad = function () {

        var sessionUserName = _fs.getSessionUserName();
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            //_s.userKey.privateKey = sessionPrivateKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.hiddenPrivateKey = '';
            _s.userKey.hiddenTextSignature = '';
            _s.userKey.showPrivateKey = false;
            _s.userKey.includePublicKey = true;
            _s.userKey.sessionUserName = sessionUserName;
            _s.userKey.showPrivateKey = false;
            _s.userKey.dropzoneText = 'Drop key file here or click to upload';

            _s.userPrivateKeyObj = _fs.getFileText();
            if (_s.userPrivateKeyObj != null) {
                if (_s.userPrivateKeyObj.userPrivateKeyBlob != null) {
                    _s.userKey.privateKeyFile = _s.userPrivateKeyObj.userPrivateKeyBlob;
                    _s.userKey.privateKey = _s.userPrivateKeyObj.userPrivateKey;
                    _s.userKey.hiddenPrivateKey = _s.userKey.privateKey;
                    _s.userKey.privateKey = '*'.repeat(_s.userKey.privateKey.length);
                }
            }
            //_s.userKey.privateKeyFile = [];
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
    _s.toggleIncludePublicKey = function (userKey) {
        //console.log(userKey);
        //console.log(userKey.includePublicKey);
    };

    _s.ChangeTextMessage = function (userKey) {
        userKey.textSignature = null;
    };

    _s.DownloadSignedMessage = function (userKey) {
        var zip = new JSZip();

        if (userKey.includePublicKey) {
            zip.file(_s.userKey.sessionUserName + '.key', userKey.publicKey);
        }

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

    _s.SignMessage = function (userKey) {
        var formData = new FormData();
        formData.append('textMessage', userKey.textMessage);
        formData.append('privateKeyFile', userKey.privateKeyFile);

        _h.post("../Signature/SignTextMessage", formData, {
            withCredentials: true,
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
        }).then(function (c) {
            if (c.data.message == 'Success') {
                _s.userKey.textSignature = c.data.result.signature_str;
                _s.userKey.showTextSignature = false;
                _s.userKey.hiddenTextSignature = _s.userKey.textSignature;
                _s.userKey.textSignature = '*'.repeat(_s.userKey.textSignature.length);
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
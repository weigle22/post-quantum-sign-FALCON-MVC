app.controller('PrivateKeyController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

    _s.onLoad = function () {
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            //else {
            //    _s.userKey = {};
            //}
        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });
    }

    _s.generatePrivateKey = function () {
        _h.post("../Key/GeneratePrivateKey").then(function (c) {

            console.log(_s.userKey);
            if (c.data.message == 'Success') {
                _s.userKey.privateKey = c.data.result.private_key_str;
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

    _s.downloadPrivateKey = function (userKey) {
        var privateKeyStr = userKey.privateKey;

        // Create a Blob from the private key string
        var blob = new Blob([privateKeyStr], { type: 'text/plain' });

        // Create a temporary anchor element to initiate the download
        var a = document.createElement('a');
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'private.key';

        // Append the anchor to the body and click it to trigger download
        document.body.appendChild(a);
        a.click();

        // Remove the anchor from the body
        document.body.removeChild(a);

        // Clean up the URL object
        window.URL.revokeObjectURL(url);
    }

    _s.copyToClipboard = function (userKey) {
        navigator.clipboard.writeText(userKey.privateKey)
            .then(console.log('copied!'));

        Swal.fire({
            position: "center",
            icon: "success",
            title: "Copied to clipboard",
            showConfirmButton: false,
            timer: 1000
        });
    };

    _s.acceptPrivateKey = function (userKey) {

        Swal.fire({
            title: "Are you sure?",
            text: "The system does not store a copy of your private key. You won't be able to regenerate or create another. Please make sure to download it after acceptance.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, accept it!"
        }).then((result) => {
            if (result.isConfirmed) {

                _h.post("../Key/AcceptPrivateKey", { _tUserKey: userKey }).then(function (c) {
                    
                    if (c.data.message == 'Success') {
                        _s.userKey = c.data.userKey;
                        _s.downloadPrivateKey(_s.userKey);
                    } else if (c.data.message == 'Invalid') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Invalid',
                            text: 'Request Invalid!',
                        });
                    } else if (c.data.message == 'Has Private Key') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Has Private Key',
                            text: 'You already have a private key!',
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
        });
    }

}]);
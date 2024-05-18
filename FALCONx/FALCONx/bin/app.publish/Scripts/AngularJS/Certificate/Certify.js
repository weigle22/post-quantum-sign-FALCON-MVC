app.controller('CertifyController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

    _s.onLoad = function () {
        _s.session = {};
        _h.post('../Session/GetSession').then(function (c) {

            _s.session = c.data.session;
            _s.sessionKeys = c.data.sessionKeys;
            if (_s.sessionKeys == null) {
                _s.sessionKeys = {};
            }
            _s.sessionKeys.privateKeyFile = [];
            _s.profile_pictureUrl = '/Certificate/GetImage?userID=' + _s.session.userID + '&type=0';
            _s.valid_id1Url = '/Certificate/GetImage?userID=' + _s.session.userID + '&type=1';
            _s.valid_id2Url = '/Certificate/GetImage?userID=' + _s.session.userID + '&type=2';
        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });
    }

    _s.UpdateUser = function (session) {
        var user = {};
        user.userID = session.userID;
        user.given_name = session.given_name;
        user.family_name = session.family_name;
        user.middle_name = session.family_name;
        user.company = session.company;
        user.position = session.position;
        user.mobile_number = session.mobile_number;
        user.address = session.address;
        _h.post('../Certificate/UpdateUser', { _tUser: user }).then(function (c) {
            if (c.data.message == 'Success') {
                _s.session = c.data.session;
                Swal.fire({
                    icon: 'success',
                    title: 'Updated',
                    text: 'Information Updated!',
                });
            } else if (c.data.message == 'Invalid') {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid',
                    text: 'Request Invalid!',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error saving information!',
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

    _s.Certify = function (session, sessionKeys) {

        Swal.fire({
            title: "Confirm?",
            text: "By clicking confirm, you acknowledge and agree that all information provided above is true and correct to the best of our knowledge and cannot be undone. Any reliance you place on such information is at your own risk. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the information, products, services, or related graphics contained herein. In no event will we be liable for any loss or damage, including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirm"
        }).then((result) => {
            if (result.isConfirmed) {
                _h.post('../Certificate/CertifyUser', { _tUser: session, _tUserKey: sessionKeys }).then(function (c) {
                    if (c.data.message == 'Success') {
                        _s.session = c.data.session;
                        _s.sessionKeys = c.data.sessionKeys;
                        _rs.$emit('executeOnLoad');
                        Swal.fire({
                            icon: 'success',
                            title: 'Certified',
                            text: 'Congrats! You have successfully certified your account',
                        });
                    } else if (c.data.message == 'User not found') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Not found',
                            text: 'User not found!',
                        });
                    }
                    else if (c.data.message == 'User keys not found') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Keys not found',
                            text: 'User keys not found!',
                        });
                    }
                    else if (c.data.message == 'Failed') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: 'Failed to certify information',
                        });
                    }
                    else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error saving information!',
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

    _s.uploadFile = function (session, fileType, file) {
        var formData = new FormData();
        formData.append('userID', session.userID);
        formData.append('fileType', fileType);
        formData.append('imageFile', file[0]);

        _h.post("../Certificate/UploadFile", formData, {
            withCredentials: true,
            headers: { 'Content-Type': undefined }
        }).then(function (c) {
            console.log(c);
            if (c.data.message == 'Success') {
                _s.profile_pictureUrl = '';
                _s.valid_id1Url = '';
                _s.valid_id2Url = '';
                if (fileType == 'profile_picture') {
                    _s.profile_pictureUrl = '/Certificate/GetImage?userID='+session.userID+'&type=0';
                } else if (fileType == 'valid_id1') {
                    _s.valid_id1Url = '/Certificate/GetImage?userID='+session.userID+'&type=1';
                } else if (fileType == 'valid_id2') {
                    _s.valid_id2Url = '/Certificate/GetImage?userID='+session.userID+'&type=2';
                }

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

app.directive('filesInput', function () {
    return {
        require: "ngModel",
        link: function postLink(scope, elem, attrs, ngModel) {
            elem.on("change", function (e) {
                var files = elem[0].files;
                ngModel.$setViewValue(files);
            })
        }
    }
});

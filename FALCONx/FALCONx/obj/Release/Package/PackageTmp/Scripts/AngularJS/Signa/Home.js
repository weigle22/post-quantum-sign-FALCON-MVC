app.controller('HomeController', ['$scope', '$rootScope', '$http', '$filter', 'fileService', function (_s, _rs, _h, _f, _fs) {

    _s.onLoad = function () {
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.showPrivateKey = false;
            _s.userKey.privateKeyFile = [];
        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });

    }
}]);

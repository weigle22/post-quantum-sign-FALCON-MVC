app.controller('PrivateKeyController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

    _s.onLoad = function () {
        _s.key = {};
    }

    _s.generatePrivateKey = function () {
        _h.post("../Key/GeneratePrivateKey", { _trefSSSTable: sss }).then(function (c) {

            if (c.data.msg == 'Success') {
                _s.vrefSSSTables = c.data.vrefSSSTables;
                _s.pagIbigTable = c.data.pagIbigTable;
                _s.philHealthTable = c.data.philHealthTable;
                Swal.fire({
                    icon: 'success',
                    title: 'Saved',
                    text: 'Record Saved!',
                });
            } else if (c.data.msg == 'Invalid') {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid',
                    text: 'Request Invalid!',
                });
            } else if (c.data.msg == 'Not Found') {
                Swal.fire({
                    icon: 'error',
                    title: 'Not Found',
                    text: 'Record Not Found!',
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
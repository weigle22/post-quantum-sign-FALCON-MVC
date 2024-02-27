var app = angular.module("SIGNAapp", []);
app.controller('SignUpController', ['$scope', '$http', function (_s, _h) {

    _s.onLoad = function () {
        _s.user = {};
    }

    _s.SignUpUser = function (user) {
        _h.post('../Account/SignUpUser', { _tUser: user }).then(function (response) {
            if (response.data.message == 'success') {
                window.location.href = "../Home/About?code=" + response.data.response;
            } else if (response.data.message == 'exists') {
                Swal.fire({
                    icon: 'error',
                    title: 'Exists',
                    text: 'Email account already exists!',
                })
            } else if (response.data.message == 'invalid') {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid',
                    text: 'Request invalid!',
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occured while processing your request',
                })
            }
            
        });
    }
    
    _s.Login = function () {
        window.location.href = "../Account/Login"
    }

    _s.RequestForAccount = function () {
        window.location.href = "../Account/RequestForAccount"
    }

    _s.backtoHome = function () {
        window.location.href = "../Home/Index"
    }


}]);


app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
            if (event.which === 27) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEsc);
                });
                event.preventDefault();
            }
        });
    };
});
var app = angular.module("SIGNAapp", []);
app.controller('SignInController', ['$scope', '$http', function (_s, _h) {

    _s.onLoad = function () {
        _s.user = {};
    }

    _s.SignInUser = function (user) {
        _h.post('../Account/SignInUser', { _tUser: user }).then(function (response) {
            if (response.data.message == 'success') {
                window.location.href = "../Signa/Home";
            } else if (response.data.message == 'unauthorized') {
                Swal.fire({
                    icon: 'error',
                    title: 'Unauthorized',
                    text: 'User unauthorized',
                })
            } else if (response.data.message == 'invalid') {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid',
                    text: 'Request invalid!',
                })
            } else if (response.data.message == 'invalid credentials') {
                Swal.fire({
                    icon: 'error',
                    title: 'Unauthorized',
                    text: 'Invalid credentials',
                })
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occured while processing your request',
                })
            }

        });
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
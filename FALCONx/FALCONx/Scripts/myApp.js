var app = angular.module('SIGNAapp', ['ngRoute']);

app.filter('bytesToMB', function () {
    return function (bytes) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        var mb = bytes / (1024 * 1024);
        return mb.toFixed(2) + ' MB';
    }
});

app.filter('fileExtension', function () {
    return function (filename) {
        return filename.split('.').pop();
    };
});

app.filter('fileFilter', function () {
    return function (files, searchTerm, extensionType) {
        if (!searchTerm && !extensionType) return files;

        return files.filter(function (file) {
            var nameMatch = !searchTerm || file.name.toLowerCase().includes(searchTerm.toLowerCase());
            var extensionMatch = !extensionType || file.name.toLowerCase().endsWith(extensionType.toLowerCase());
            return nameMatch && extensionMatch;
        });
    };
});


app.factory('fileService', ['$http', '$q', function ($http, $q) {
    return {
        getFileText: function () {
            var userPrivateKey = sessionStorage.getItem('userPrivateKey');
            if (userPrivateKey) {
                var blob = new Blob([userPrivateKey], { type: 'text/plain' });
                blob.name = 'private.key';
                return {
                    userPrivateKey: userPrivateKey,
                    userPrivateKeyBlob: blob
                };
            }
            return null;
        },
        setFileText: function (userPrivateKey) {
            var deferred = $q.defer();
            var _tUserKey = { privateKey: userPrivateKey };

            $http.post('../Certificate/VerifyPrivateKey', { _tUserKey: _tUserKey })
                .then(function (response) {
                    if (response.data.message === 'Success') {
                        var verificationResult = response.data.verificationResult;
                        switch (verificationResult.result) {
                            case '0':
                                sessionStorage.setItem('userPrivateKey', userPrivateKey);
                                deferred.resolve('verified');
                                break;
                            case '-4':
                                deferred.resolve('badsig');
                                break;
                            case '-3':
                                deferred.resolve('invalid key');
                                break;
                            default:
                                deferred.resolve(null);
                        }
                    }
                    else {
                        //deferred.reject('Request Invalid!');
                        deferred.reject(response.data.message);
                    }
                })
                .catch(function (error) {
                    deferred.reject('Something went wrong!');
                });

            return deferred.promise;
        },
        removeFile: function () {
            sessionStorage.removeItem('userPrivateKey');
            sessionStorage.removeItem('privateKeyVeficationResult');
            sessionStorage.removeItem('sessionUserName');
            return 'removed';
        },

        setprivateKeyVerificationResult: function (privateKeyVeficationResult) {
            sessionStorage.setItem('privateKeyVeficationResult', privateKeyVeficationResult);
        },
        getprivateKeyVerificationResult: function () {
            var privateKeyVeficationResult = sessionStorage.getItem('privateKeyVeficationResult');
            return privateKeyVeficationResult;
        },
        setSessionUserName: function (sessionUserName) {
            sessionStorage.setItem('sessionUserName', sessionUserName);
        },
        getSessionUserName: function () {
            var sessionUserName = sessionStorage.getItem('sessionUserName');
            return sessionUserName;
        }
    };
}]);


//app.config(function ($routeProvider, $locationProvider) {
//    $locationProvider.hashPrefix('');
//    $routeProvider
//        .when('/Home', {
//            templateUrl: '/Signa/Home', // Path to your home view
//            controller: 'HomeController' // Optional controller for the home view
//        })
//        .when('/Key/PrivateKey', {
//            templateUrl: '/Key/PrivateKey', // Path to your about view
//            controller: 'PrivateKeyController' // Optional controller for the about view
//        })
//        .otherwise({
//            redirectTo: '/' // Default route
//        });
//});


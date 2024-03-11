app.controller('MenuController', ['$scope', '$rootScope', '$http', function (_s, _rs, _h) {

    _s.onLoad = function () {

        _s.session = {

            userID: null,
            username: null,
            role: null,
            family_name: null,
            picture: null,
            signature: null

        };

        _h.post('../Session/GetSession').then(function (c) {

            _s.session.userID = c.data.userID;
            _s.session.username = c.data.username;
            _s.session.role = c.data.role;
            _s.session.family_name = c.data.family_name;
            _s.session.picture = c.data.picture;
            _s.session.signature = c.data.signature;
            

        }, function () {
            swal("Something went wrong!", "", "warning");
        });
    }

}]);
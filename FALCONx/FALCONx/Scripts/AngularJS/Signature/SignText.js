app.controller('SignTextController', ['$scope', '$rootScope', '$http', '$filter', function (_s, _rs, _h, _f) {

    // Ensure that Dropzone is properly initialized before accessing it
    Dropzone.autoDiscover = false;

    // Initialize Dropzone
    _s.myDropzone = new Dropzone("#myDropzone", {
        // Dropzone configuration options
        addRemoveLinks: true,
        // Dropzone configuration options
        dictRemoveFile: '<i class="fe fe-trash"></i>',
        maxFiles: 1, // Restrict to one file upload
        acceptedFiles: '.key',
        init: function () {
            this.on("addedfile", function (file) {
                if (this.files.length > 1) {
                    this.removeFile(file); // Remove the extra file
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    _s.userKey.privateKey = event.target.result;
                    _s.$apply(); // Apply changes to AngularJS scope
                };
                reader.readAsText(file);
            });
            this.on("removedfile", function (file) {
                _s.userKey.privateKey = ''; // Clear the privateKey
                _s.$apply(); // Apply changes to AngularJS scope
            });
            this.on("maxfilesexceeded", function (file) {
                Swal.fire({
                    icon: 'info',
                    title: 'One key file only',
                    text: 'Click delete button to change the selected key',
                });
            });
        }
    });

    _s.onLoad = function () {
        _h.post("../Key/GetUserKeys").then(function (c) {
            _s.userKey = c.data.userKey;
            if (_s.userKey == null) {
                _s.userKey = {};
            }
            _s.userKey.pasteEnabled = false;
            _s.userKey.dropzoneText = 'Drop key file here or click to upload';
        }, function () {
            Swal.fire({
                icon: 'error',
                title: 'Warning',
                text: 'Something went wrong!',
            });
        });
        //console.log(Dropzone.version);
        //console.log(myDropzone);
    }

    _s.toggleDropzone = function (userKey) {
        if (_s.userKey.pasteEnabled) {
            _s.myDropzone.disable(); // Disable Dropzone if checkbox is checked
            _s.userKey.privateKey = null;
            _s.userKey.dropzoneText = 'Paste private key in the text area'

            //if (_s.myDropzone.files.length > 0) {
            //    // Programmatically trigger the removal of the file
            //    _s.myDropzone.emit("removedfile", _s.myDropzone.files[0]);
            //}

        } else {
            _s.myDropzone.enable(); // Enable Dropzone if checkbox is unchecked
            _s.userKey.privateKey = null;
            _s.userKey.dropzoneText = 'Drop key file here or click to upload';
        }
    };
    

}]);
var app = angular.module('SIGNAapp', []);

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
            var nameMatch = !searchTerm || file.upload.filename.toLowerCase().includes(searchTerm.toLowerCase());
            var extensionMatch = !extensionType || file.upload.filename.toLowerCase().endsWith(extensionType.toLowerCase());
            return nameMatch && extensionMatch;
        });
    };
});
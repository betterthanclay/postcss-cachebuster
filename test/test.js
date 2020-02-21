var postcss = require('postcss');
var expect  = require('chai').expect;
var path = require('path');
var plugin = require('../');
var fs = require('fs');


var assert = function (input, output, opts, done) {
    postcss([ plugin(opts) ]).process(input).then(function (result) {
        expect(result.css).to.eql(output);
        expect(result.warnings()).to.be.empty;
        done();
    }).catch(function (error) {
        done(error);
    });
};

describe('postcss-cachebuster', function () {
  
    var horseMtime = fs.statSync('./test/files/horse.jpg').mtime.getTime().toString(16);
    var fontMtime = fs.statSync('./test/files/opensansbold.ttf').mtime.getTime().toString(16);
    var htcMtime = fs.statSync('./test/files/backgroundsize.htc').mtime.getTime().toString(16);
    var cssMtime = fs.statSync('./test/css/styles.css').mtime.getTime().toString(16);

    it('Process image, with relative path', function (done) {
        assert('a { background-image : url("files/horse.jpg"); }', 
               'a { background-image : url("files/horse.jpg?v'+horseMtime+'"); }', 
               { cssPath : '/test/'}, done);
    });

    it('Process image, with absolute path', function (done) {
        assert('a { background-image : url("/files/horse.jpg"); }', 
               'a { background-image : url("/files/horse.jpg?v'+horseMtime+'"); }', 
               { imagesPath : '/test/'}, done);
    });

    it('Process image, with spaces in name', function (done) {
        assert('a { background-image : url("/files/horse with spaces.jpg"); }', 
               'a { background-image : url("/files/horse%20with%20spaces.jpg?v'+horseMtime+'"); }', 
               { imagesPath : '/test/'}, done);
    });

    it('Skip base64 images', function (done) {
        assert('a { background-image : url("data:image/png;base64,iVBORw0"); }', 
               'a { background-image : url("data:image/png;base64,iVBORw0"); }', 
               { imagesPath : '/test/'}, done);
    });

    it('Skip unresolved images', function (done) {
        assert('a { background-image : url("there/is/no/image.jpg"); }', 
               'a { background-image : url("there/is/no/image.jpg"); }', 
               { imagesPath : '/test/'}, done);
    });

    it('Process font file', function (done) {
        assert('a { src : url("files/opensansbold.ttf"); }', 
               'a { src : url("files/opensansbold.ttf?v'+fontMtime+'"); }', 
               { cssPath : '/test/'}, done);
    });

    it('Process .htc file', function (done) {
        assert('a { behavior : url("files/backgroundsize.htc"); }', 
               'a { behavior : url("files/backgroundsize.htc?v'+htcMtime+'"); }', 
               { cssPath : '/test/'}, done);
    });

    it('Add cachebuster to import css file', function (done) {
        assert('@import url("/css/styles.css");', 
               '@import url("/css/styles.css?v'+cssMtime+'");', 
               { imagesPath : '/test/'}, done);
    });

    it('Add cachebuster to all imports in the css file', function (done) {
        assert('@import url("/css/styles.css");@import url("/css/styles.css");', 
               '@import url("/css/styles.css?v'+cssMtime+'");@import url("/css/styles.css?v'+cssMtime+'");', 
               { imagesPath : '/test/'}, done);
    });

    it('Change url with function', function (done) {
        assert('a { background-image : url("files/horse.jpg"); }',
               'a { background-image : url("files/horse.abc123.jpg"); }',
               { type : function (assetPath, origPath) {
                   expect(assetPath).to.equal(path.join(__dirname, 'files/horse.jpg'));
                   expect(origPath).to.equal('files/horse.jpg');
                   return 'files/horse.abc123.jpg';
               }, cssPath : '/test/'}, done);
    });
    
    it('Change url with default checksum', function (done) {
        assert('a { background-image : url("files/horse.jpg"); }',
               'a { background-image : url("files/horse.jpg?vac17ceac5567ecf01eab7c474b3b8426"); }',
               { type : 'checksum', cssPath : '/test/'}, done);
    });
    
    it('Change url with checksum using specified hash algorithm', function (done) {
        assert('a { background-image : url("files/horse.jpg"); }',
               'a { background-image : url("files/horse.jpg?v8a88fc3de434b972f5bebdcd33474cc2259310c1"); }',
               { type : 'checksum', hashAlgorithm : 'sha1', cssPath : '/test/'}, done);
    });

});

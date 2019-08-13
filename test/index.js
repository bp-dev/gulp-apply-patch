var assert = require('assert');
var path = require("path");
var stream = require("stream");
var applyPatch = require("../index.js");
var Vinyl = require('vinyl');

var patch = `--- folder/test.txt	2016-08-15 12:16:39.000000000 +0300
+++ folder/test.txt	2016-08-15 12:16:11.000000000 +0300
@@ -1,3 +1,3 @@
 The quick fox
-jumps over the
+runs over the
 lazy dog.`;

var chainedPatch = `--- folder/test.txt	2016-08-15 12:16:39.000000000 +0300
+++ folder/test.txt	2016-08-15 12:16:11.000000000 +0300
@@ -1,3 +1,3 @@
 The quick fox
-runs over the
+flies over the
 lazy dog.`;

var input = `The quick fox
jumps over the
lazy dog.`;
var output = `The quick fox
runs over the
lazy dog.`;
var chainedOutput = `The quick fox
flies over the
lazy dog.`;

describe('gulp-apply-patch', function() {
  describe("when linefeeds are Windows", function(){
    it("should apply patch", function(done){
      var crlfInput = "The quick fox\r\njumps over the\r\nlazy dog.";
      var crlfOutput = "The quick fox\nruns over the\nlazy dog.";
      var crlfPatch = "--- folder/test.txt	2016-08-15 12:16:39.000000000 +0300\r\n"+
                      "+++ folder/test.txt	2016-08-15 12:16:11.000000000 +0300\r\n"+
                      "@@ -1,3 +1,3 @@\r\n"+
                      " The quick fox\r\n"+
                      "-jumps over the\r\n"+
                      "+runs over the\r\n"+
                      " lazy dog.\r\n";
      var patcher = applyPatch([Buffer.from(crlfPatch)],{ replaceCRLF: true });
      patcher.write(new Vinyl({
        base: "",
        path: "folder/test.txt",
        contents: Buffer.from(crlfInput)
      }));
      patcher.once('data', function(file) {
        assert.equal(crlfOutput, file.contents.toString('utf8'));
        done();
      });
    });
  });

  describe('when names match', function() {
    it('should apply patch', function(done) {
      var patcher = applyPatch([Buffer.from(patch)]);
      patcher.write(new Vinyl({
        base: "",
        path: "folder/test.txt",
        contents: Buffer.from(input)
      }));
      patcher.once('data', function(file) {
        assert.equal(output, file.contents.toString('utf8'));
        done();
      });
    });
    it('should apply many patches', function(done) {
      var patcher = applyPatch([Buffer.from(patch), Buffer.from(chainedPatch)]);
      patcher.write(new Vinyl({
        base: "",
        path: "folder/test.txt",
        contents: Buffer.from(input)
      }));
      patcher.once('data', function(file) {
        assert.equal(chainedOutput, file.contents.toString('utf8'));
        done();
      });
    });
  });

  describe('when names dont match', function() {
    var fakeFile = new Vinyl({
      base: "",
      path: "folder/not_test.txt",
      contents: Buffer.from(input)
    });
    var patcher = applyPatch([Buffer.from(patch)]);
    patcher.write(fakeFile);

    it('should not apply patch', function(done) {
      patcher.once('data', function(file) {
        assert.equal(input, file.contents.toString('utf8'));
        done();
      });
    });
  });
});

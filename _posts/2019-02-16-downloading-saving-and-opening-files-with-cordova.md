---
title: Downloading, saving and opening files with Cordova
image: "/uploads/cordova-file-download-and-open.jpeg"
date: 2019-02-15T23:00:00.000+00:00
author: Sem Postma
description: Downloading/Saving/Opening files with Cordova in javascript and polyfill
  the achor's download attribute for android webview.
portal_title: ''
portal_description: ''
portal_image: ''
portal_link: ''
lang: ''

---
In the browser, downloading files is actually quite easy.  You can just do:

```javascript
<a download="filename.txt" href="data:text/plain;charset=utf-8,hello world!">Download</a>
```

But this doesn't work in webview. I've expanded on the answer given in this [stackoverflow question](https://stackoverflow.com/questions/43575581/cordova-download-a-file-in-download-folder) to work in both the browser and in a webview. It also let's the user open the files in a webview and polyfills the anchor's download attribute.

Because of how cordova works we need the [cordova-plugin-file](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/), the[ cordova-plugin-file-opener2](https://github.com/pwlin/cordova-plugin-file-opener2) and [file-saver](https://github.com/eligrey/FileSaver.js). The cordova-plugin-file plugin gives us access to the users's file system, and the cordova-plugin-file-opener2 plugin helps us with opening files using an external application (e.g word, excel, etc.). We are using the file-saver when we are running inside of the browser.

```javascript
function download(filename, data, mimeType) {
  var blob = new Blob([data], {
    type: mimeType
  });
  if (window.cordova && cordova.platformId !== "browser") {
    document.addEventListener("deviceready", function () {
      // save file using codova-plugin-file
    });
  } else {
    saveAs(blob, filename);
  }
};
```

Let's save the file using codova-plugin-file.

```javascript
function download(filename, data, mimeType) {
  var blob = new Blob([data], {
    type: mimeType
  });
  if (window.cordova && cordova.platformId !== "browser") {
  	document.addEventListener("deviceready", function() {
      var storageLocation = "";

      switch (device.platform) {
        case "Android":
          storageLocation = cordova.file.externalDataDirectory;
          break;

        case "iOS":
          storageLocation = cordova.file.documentsDirectory;
          break;
      }

      var folderPath = storageLocation;

      window.resolveLocalFileSystemURL(
        folderPath,
        function(dir) {
          dir.getFile(
            filename,
            {
              create: true
            },
            function(file) {
              // The file...
            },
            function(err) {
              alert("Unable to download");
              console.error(err);
            }
          );
        },
        function(err) {
          alert("Unable to download");
          console.error(err);
        }
      );
    });
    } else {
      saveAs(blob, filename);
    }
}
```

To finish the function we write the data to the file and then we open it using the file opener plugin. So the full example is:

```javascript
function download(filename, data, mimeType) {
  var blob = new Blob([data], {
    type: mimeType
  });
  if (window.cordova && cordova.platformId !== "browser") {
    document.addEventListener("deviceready", function () {
      var storageLocation = "";

      switch (device.platform) {
        case "Android":
          storageLocation = cordova.file.externalDataDirectory;
          break;

        case "iOS":
          storageLocation = cordova.file.documentsDirectory;
          break;
      }

      var folderPath = storageLocation;

      window.resolveLocalFileSystemURL(
        folderPath,
        function (dir) {
          dir.getFile(
            filename,
            {
              create: true
            },
            function (file) {
              file.createWriter(
                function (fileWriter) {
                  fileWriter.write(blob);

                  fileWriter.onwriteend = function () {
                    var url = file.toURL();
                    cordova.plugins.fileOpener2.open(url, mimeType, {
                      error: function error(err) {
                        console.error(err);
                        alert("Unable to download");
                      },
                      success: function success() {
                        console.log("success with opening the file");
                      }
                    });
                  };

                  fileWriter.onerror = function (err) {
                    alert("Unable to download");
                    console.error(err);
                  };
                },
                function (err) {
                  // failed
                  alert("Unable to download");
                  console.error(err);
                }
              );
            },
            function (err) {
              alert("Unable to download");
              console.error(err);
            }
          );
        },
        function (err) {
          alert("Unable to download");
          console.error(err);
        }
      );
    });
  } else {
    saveAs(blob, filename);
  }
}
```

## Full example

Now we can call the download function with any kind of data, text and blobs, and it will work in the browser and inside a webview. But we still haven't fixed the download attribute issue. To fix this we can add a click handler to the document. This function works for any kind of url, including data urls.

{% gist be25fabfe94b1982e971aaf26a54c999 %}

{% include javascript_affiliate.html %}
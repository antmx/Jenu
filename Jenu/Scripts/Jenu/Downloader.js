
/// <reference path="~/Scripts/Utilities/Namespace.js" />

// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

// Define Jenu.Core.Downloader type
Jenu.Core.Downloader = function (url, onProgress, onLoad, onError, onTimeout) {
	//var self = this;
	this._url = url;
	this._onProgress = onProgress;
	this._onLoad = onLoad;
	this._onError = onError;
	this._onTimeout = onTimeout;
};

Jenu.Core.Downloader.prototype = {
	Download: function () {
		
		var self = this;
		var xhr = this.CreateCorsRequest("GET", this._url); //  "http://summerland.local/"

		//xhr.onreadystatechange = function () {
		//	if (xhr.readyState == 4) {
		//		if (xhr.status == 200 || xhr.status == 0) {
		//			//debugger;

		//			var responseURL = xhr.responseURL;
		//			var contentType = xhr.getResponseHeader("Content-Type");
		//			var contentLength = xhr.getResponseHeader("Content-Length");
		//			//var lastModified = xhr.getResponseHeader("Last-Modified");
		//			var server = xhr.getResponseHeader("Server");
		//			var cacheControl = xhr.getResponseHeader("Cache-Control");
		//			var date = xhr.getResponseHeader("Date");


		//			var allHeaders = xhr.getAllResponseHeaders();
		//			console.log(allHeaders);
		//			debugger;
		//			//resource = xhr.responseXML;
		//		}
		//	}
		//};

		// While loading and sending data
		xhr.onprogress = function (evt) {
			if (evt.lengthComputable) {
				// evt.loaded == the bytes browser received
				// evt.total == the total bytes set by the header
				//console.log("onprogress: " + percentComplete);
				var percentComplete = (evt.loaded / evt.total) * 100;
				self._onProgress(percentComplete);
			}
		};

		// When the request has successfully completed
		xhr.onload = function () {
			//console.log("onload: " + self._url);
			self._onLoad(xhr);
		};

		// When the request has failed
		xhr.onerror = function () {
			//console.log("onerror: " + self._url);
			self._onError(xhr);
		};

		// When the author specified timeout has passed before the request could complete
		xhr.ontimeout = function () {
			//console.log("timeout: " + self._url);
			self._onTimeout(xhr);
		};

		// Other Xhr events but aren't supported in IE
		//xhr.onloadstart = function () { }; // When the request starts
		//xhr.onabort = function () { }; // When the request has been aborted. For instance, by invoking the abort() method
		//xhr.onloadend = function () { }; // When the request has completed (either in success or failure)

		xhr.send();
	},

	/// <summary>Creates and returns a CORS-enabled XMLHttpRequest object.</summary>
	CreateCorsRequest: function (method, url) {
		var xhr = new XMLHttpRequest();

		// Check if the XMLHttpRequest object has a "withCredentials" property (XMLHTTPRequest2 only: Chrome/Firefox/Opera/Safari)
		if ("withCredentials" in xhr) {

			// Include cookies as part of the request - need to also set remote website's "Access-Control-Allow-Origin" header to the requesting domain e.g. "jenu.local"
			//xhr.withCredentials = true;

			xhr.open(method, url, true);

		} else if (typeof XDomainRequest != "undefined") {

			// Otherwise, check if XDomainRequest, which only exists in IE, and is IE's way of making CORS requests.
			xhr = new XDomainRequest();
			xhr.open(method, url);

		} else {

			// Otherwise, CORS is not supported by the browser.
			xhr = null;
		}

		//xhr.setRequestHeader("Content-Length", "0");

		return xhr;
	},

	IsProtocolSupported: function () {
		
		var regex = /^(http|https):/;
		return regex.test(this._url);
	}
};

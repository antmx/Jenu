
/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="~/Scripts/Core/Url.js" />

// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

// Define Jenu.Core.Resource type
Jenu.Core.Resource = function (url, caseSensitive) {
	var self = this;

	this.Url = url;
	this.LogStatus = "pending"; // "in progress" | "complete" | "not found" | "timeout"
	this.CaseSensitive = caseSensitive;

	// Define properties that come from the XHR and its response headers.
	this.ContentType = "";
	this.ContentLength = "";
	this.Server = "";
	this.CacheControl = "";
	this.Date = "";
	this.ContentEncoding = "";
	this.ContentLanguage = "";
	this.Status = "";
	this.LastModified = "";

	/* Properties that come from the resource's HTML */
	this.Title = url.title || ""; // May also get overwritten after HTML is downloaded and parsed
	this.Description = "";

	/* Stats */
	this.PercentComplete = 0;
	this.Level = 0;
	this.OutLinks = 0;
	this.InLinks = 0;
	this.Error = "";
	this.DateStart = null;
	this.DateEnd = null;
};

Jenu.Core.Resource.prototype = {

	/// <summary>Calculates the duration in millisenconds between the start and end of the download process.</summary>
	Duration: function () {
		if (this.DateStart && this.DateEnd) {
			// Convert both dates to milliseconds
			var date1_ms = this.DateStart.getTime();
			var date2_ms = this.DateEnd.getTime();

			// Calculate the difference in milliseconds
			var difference_ms = date2_ms - date1_ms;

			return difference_ms + "ms";
		}

		return null;
	},

	/// <summary>Sets properties that come from the XHR and its response headers.</summary>
	LoadXhr: function (xhr) {

		this.LoadContentType(xhr.getResponseHeader("Content-Type"));
		this.ContentLength = xhr.getResponseHeader("Content-Length");
		this.Server = xhr.getResponseHeader("Server");
		this.CacheControl = xhr.getResponseHeader("Cache-Control");
		this.Date = xhr.getResponseHeader("Date");
		if (("" + this.ContentEncoding) == "") {
			this.ContentEncoding = xhr.getResponseHeader("Content-Encoding");
		}
		this.ContentLanguage = xhr.getResponseHeader("Content-Language");
		//this.Status = xhr.getResponseHeader("Status");
		this.Status = xhr.status;
		this.LastModified = xhr.getResponseHeader("Last-Modified");
	},

	LoadContentType: function (contentType) {
		if (contentType != null) {
			var arr = contentType.split(";");
			this.ContentType = arr[0];
			if (arr.length > 1)
				this.ContentEncoding = arr[1];
		}
	},

	/// <summary>Loads a collection of URLs into the Resource's OutLinks property.</summary>
	LoadOutUrls: function (urls) {

		for (var i = 0; i < urls.length; i++) {

		}
	},

	LogStatusCssSafe: function () {
		return this.LogStatus
			.replace(/[^a-zA-Z0-9\s]/, "")
			.replace(/\s/g, "-")
			.toLowerCase();
	}
};

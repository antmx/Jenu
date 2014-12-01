
/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="Downloader.js" />
/// <reference path="Resource.js" />
/// <reference path="ResourceLog.js" />
/// <reference path="ContentParser.js" />
/// <reference path="PageInfoParser.js" />
/// <reference path="Url.js" />

// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

// Define Jenu.Core.Scanner type
Jenu.Core.Scanner = function (startUrl, resourceLog, updateCallback, contentParser, pageInfoParser) {
	this.StartUrl = new Jenu.Core.Url(startUrl);
	this.ResourceLog = resourceLog;
	this.UpdateCallback = updateCallback;
	this.ContentParser = contentParser;
	this.PageInfoParser = pageInfoParser;
	this.MaxProcesses = 10;
	this.CurrentProcesses = 0;
};

Jenu.Core.Scanner.prototype = {

	Start: function () {
		
		this.ResourceLog.RecordEntry(this.StartUrl);
		this.ProcessUrl(this.StartUrl);
	},

	ProcessUrl: function (url) {
		
		var self = this;
		var resource = this.ResourceLog.FindEntry(url);

		try {
			if (resource.LogStatus == "pending") {
				var downloader = new Jenu.Core.Downloader(
					resource.Url.href,

					// onProgress
					function (percentComplete) {
						resource.LogStatus = "in progress";
						resource.PercentComplete = percentComplete;
						self.UpdateCallback();
					},

					// onLoad
					function (xhr) {
						
						if (IsValidStatus(xhr.status)) {
							resource.LogStatus = "complete";
							resource.PercentComplete = 100;
							resource.LoadXhr(xhr);

							// Parse page info
							var pageInfo = self.PageInfoParser.Parse(xhr.responseText, resource.ContentType);
							resource.Title = pageInfo.title;
							resource.Description = pageInfo.description;

							// Parse URLs but only when internal url
							if (IsInternalUrl(resource)) {
								var urls = self.ContentParser.Parse(xhr.responseText, resource.ContentType, resource.Url);
								resource.OutLinks = urls.length;
								self.ResourceLog.RecordEntries(urls);
							}
						}
						else {
							
							resource.LogStatus = xhr.statusText || "error";
							resource.LoadXhr(xhr);
						}

						self.UpdateCallback();
						ReduceProcesses();
						ProcessNext();
					},

					// onError
					function (xhr) {
						//debugger;
						resource.LogStatus = xhr.statusText || "unknown error";
						resource.LoadXhr(xhr);
						self.UpdateCallback();
						ReduceProcesses();
						ProcessNext();
					},

					// onTimeout
					function (xhr) {
						resource.LogStatus = "timeout";
						resource.LoadXhr(xhr);
						self.UpdateCallback();
						ReduceProcesses();
						ProcessNext();
					});

				if (downloader.IsProtocolSupported()) {
					downloader.Download();
				}
				else {
					resource.LogStatus = resource.Url.protocol + " not supported";
					self.UpdateCallback();
					ProcessNext();
				}
			}
		} catch (e) {
			
			resource.Status = xhr.status;
			resource.LogStatus = xhr.statusText || "error";
		}

		function ReduceProcesses() {
			if (self.CurrentProcesses > 0)
				self.CurrentProcesses -= 1;
		}

		function ProcessNext() {

			if (self.CurrentProcesses < self.MaxProcesses) {

				var nextUrl = self.ResourceLog.FetchNextPendingUrl();

				if (nextUrl != null) {
					self.ProcessUrl(nextUrl);
					self.CurrentProcesses += 1;
				}
			}
		}

		function IsValidStatus(status) {

			var statusCategory = String(status).substr(0, 1);

			if (["2", "3"].indexOf(statusCategory) > -1) // http response codes in the 200 or 300 ranges
				return true;

			return false;
		}

		function IsInternalUrl(resource) {
			return resource.Url.hostname == self.StartUrl.hostname;
		}
	}

};

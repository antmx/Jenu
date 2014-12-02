
/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="Resource.js" />
/// <reference path="Url.js" />

// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

// Define Jenu.Core.ResourceLog type
Jenu.Core.ResourceLog = function (caseSensitive) {
	
	var self = this;

	// Array of Resource objects
	this.Entries = [];

	this.CaseSensitive = caseSensitive;
};

Jenu.Core.ResourceLog.prototype = {

	RecordEntries: function (urls) {
		if (urls != null && urls instanceof Array) {
			for (var idx = 0; idx < urls.length; idx++) {
				var url = urls[idx];
				this.RecordEntry(url);
			}
		}
	},


	/// <summary>Records an entry in the log.</summary>
	RecordEntry: function (url) {
		//url = this.CleanUrl(url);
		
		if (url == null || !(url instanceof Jenu.Core.Url))
			throw new Error(url + " must be a Jenu.Core.Url");

		var matchingEntry = this.FindEntry(url);

		if (matchingEntry != null) {
			// Update existing entry's InLink count
			matchingEntry.InLinks += 1;
			return matchingEntry;
		}
		else {
			// Add new entry
			var newEntry = new Jenu.Core.Resource(url, this.CaseSensitive);
			newEntry.InLinks = this.EntryCount() == 0 ? 0 : 1;
			this.Entries[this.Entries.length] = newEntry;
			return newEntry;
		}
	},

	/// <summary>Searches for the next available unprocessed url and returns it.</summary>
	FetchNextPendingUrl: function () {

		for (var idx = 0; idx < this.Entries.length; idx++) {
			var idxEntry = this.Entries[idx];

			if (idxEntry.LogStatus == "pending")
				return idxEntry.Url;
		}

		return null;
	},

	CleanUrl: function (url) {
		// todo - attempt to clean up url
		//url = String(url);
		while (url.lastIndexOf("#") == url.length - 1) {
			debugger;
			url = url.substr(0, url.length - 1);
		}

		return url;
	},

	/// <summary>Finds an entry in the log.</summary>
	FindEntry: function (url) {
		
		for (var idx = 0; idx < this.Entries.length; idx++) {
			var idxEntry = this.Entries[idx];

			if (url.Equals(idxEntry.Url, this.CaseSensitive))
				return idxEntry;
		}

		return null;
	},

	EntryCount: function () {
		return this.Entries.length;
	}

};

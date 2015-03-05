
/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="../views/index.js" />
/// <reference path="~/Scripts/LinkspectorJS/Scanner.js" />

/// LinkspectorJS Website Index Controller

// Set up LinkspectorJS.Website.Controllers namespace
Namespace.Create("LinkspectorJS.Website.Controllers");

// Define LinkspectorJS.Website.Controllers.Index type
LinkspectorJS.Website.Controllers.Index = function (view) {
    var self = this;
    this._view = view;

	this._view.StartButton().onclick = function () {
		self.DisplayStartMessage();
		var scanner = new LinkspectorJS.Core.Scanner();
		scanner.Start();
	};
};

LinkspectorJS.Website.Controllers.Index.prototype = {
    DisplayStartMessage: function() {
        var view = this._view;
        view.Output().innerHTML += "Scanning " + view.Url() + "...<br />";
    }
};

// Auto-invoked function to bind the view to the controller
(function () {
	//debugger;
	var view = new LinkspectorJS.Website.Views.Index();

	new LinkspectorJS.Website.Controllers.Index(view);
})();

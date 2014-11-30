
/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="../views/index.js" />
/// <reference path="~/Scripts/Jenu/Scanner.js" />

/// Jenu Website Index Controller

// Set up Jenu.Website.Controllers namespace
Namespace.Create("Jenu.Website.Controllers");

// Define Jenu.Website.Controllers.Index type
Jenu.Website.Controllers.Index = function (view) {
    var self = this;
    this._view = view;

	this._view.StartButton().onclick = function () {
		self.DisplayStartMessage();
		var scanner = new Jenu.Core.Scanner();
		scanner.Start();
	};
};

Jenu.Website.Controllers.Index.prototype = {
    DisplayStartMessage: function() {
        var view = this._view;
        view.Output().innerHTML += "Scanning " + view.Url() + "...<br />";
    }
};

// Auto-invoked function to bind the view to the controller
(function () {
	//debugger;
	var view = new Jenu.Website.Views.Index();

	new Jenu.Website.Controllers.Index(view);
})();

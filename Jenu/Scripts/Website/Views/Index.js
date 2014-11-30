
/// <reference path="~/Scripts/Utilities/Namespace.js" />

/// Jenu Website Index View

// Set up Jenu.Website.Views namespace
Namespace.Create("Jenu.Website.Views");

// Define Jenu.Website.Views.Index type
Jenu.Website.Views.Index = function () {
	this.Url = function () {
		return document.getElementById("txtUrl").value;
	};

	this.StartButton = function () {
		return document.getElementById("butStartScan");
	};

	this.Output = function () {
		return document.getElementById("output");
	};
};

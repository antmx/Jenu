
/// <reference path="~/Scripts/Utilities/Namespace.js" />

/// LinkspectorJS Website Index View

// Set up LinkspectorJS.Website.Views namespace
Namespace.Create("LinkspectorJS.Website.Views");

// Define LinkspectorJS.Website.Views.Index type
LinkspectorJS.Website.Views.Index = function () {
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

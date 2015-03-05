
/// <reference path="~/Scripts/LinkspectorJS/ResourceLog.js" />
/// <reference path="~/Scripts/LinkspectorJS/Scanner.js" />
/// <reference path="~/Scripts/LinkspectorJS/ContentParser.js" />
/// <reference path="~/Scripts/LinkspectorJS/PageInfoParser.js" />

/// <summary>ResourceLog Controller</summary>

angular.module('linkspectorApp.controllers', []).
    controller('resourceLogController', function ($scope) {

    	$scope.ResourceLog = new LinkspectorJS.Core.ResourceLog(false);

    	$scope.StartScanning = function (startUrl, caseSensitive) {
    		$scope.ResourceLog.CaseSensitive = caseSensitive;
    		$scope.ResourceLog.Entries = [];

    		var contentParser = new LinkspectorJS.Core.ContentParser();
    		var pageInfoParser = new LinkspectorJS.Core.PageInfoParser();

    		var scanner = new LinkspectorJS.Core.Scanner(
				startUrl,
				$scope.ResourceLog,
				function () { $scope.$apply(); },
				contentParser,
				pageInfoParser);

    		scanner.Start();
    	};

    	//$scope.EntryCount = function () {
    	//	return $scope.ResourceLog.EntryCount();
    	//}
    });

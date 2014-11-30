
/// <reference path="~/Scripts/Jenu/ResourceLog.js" />
/// <reference path="~/Scripts/Jenu/Scanner.js" />
/// <reference path="~/Scripts/Jenu/ContentParser.js" />
/// <reference path="~/Scripts/Jenu/PageInfoParser.js" />

/// <summary>ResourceLog Controller</summary>

angular.module('jenuApp.controllers', []).
    controller('resourceLogController', function ($scope) {

    	$scope.ResourceLog = new Jenu.Core.ResourceLog(false);

    	$scope.StartScanning = function (startUrl, caseSensitive) {
    		$scope.ResourceLog.CaseSensitive = caseSensitive;
    		$scope.ResourceLog.Entries = [];

    		var contentParser = new Jenu.Core.ContentParser();
    		var pageInfoParser = new Jenu.Core.PageInfoParser();

    		var scanner = new Jenu.Core.Scanner(
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

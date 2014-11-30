
/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="~/Scripts/Jenu/Resource.js" />

// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

// Define Jenu.Core.UrlResolver type
Jenu.Core.UrlResolver = function () {
	
};

Jenu.Core.UrlResolver.prototype = {

	Resolve: function (sourceUrl, url) {
		var self = this;

		// Check for scheme-releative, e.g. //www.test.com
		if (this.IsSchemeRelative(url)) {
			// Prefix url with source URL's scheme, e.g. http://www.test.com/
			var scheme = this.ParseScheme(sourceUrl);
			return scheme + url;
		}

		// Check for fully qualified
		if (this.IsFullyQualified(url)) {
			// Just return the URL
			return url;
		}

		// todo - Handle relative URL, e.g. page1, /page1, ./page1, ../page1 etc
	},

	IsSchemeRelative:function(url){

		var pattern = "^[/]{2}?.+";
		var regEx = new RegExp(pattern);

		return regEx.test(url);
	},

	ParseScheme: function (url) {
		var pattern = '[a-z]+:';
		var regEx = new RegExp(pattern);
		var result = regEx.exec(url);

		var scheme = result != null ? result[0] : null;

		return scheme;
	},

	IsFullyQualified: function (url) {

		//var regEx = /^[a-z]+[:]{1}[\/\/]?/ig;
		//var regEx = /^([a-z]{1}|:{1}|(\/\/)?){1}.*$/ig;

		var scheme = '[a-z]+:';
		var authorityPrefix = '\/{2}((?!/))';
		var schemeAndAuthorityPrefix = scheme + schemeAndAuthorityPrefix;
		//var none = "((?![\/:]).)?"
		var none="(![\/:])"

		var regEx = new RegExp("^(" + scheme + "|" + authorityPrefix + "|" + schemeAndAuthorityPrefix + "){1}?.+$");

		return regEx.test(url);
	}
};

var ur = new Jenu.Core.UrlResolver();
//console.log(ur.IsFullyQualified("mailto:me@foo.com"));
//console.log(ur.IsFullyQualified("http://www.test.com/"));
//console.log(ur.IsFullyQualified("https://www.test.com/"));
//console.log(ur.IsFullyQualified("//www.test.com/"));
//console.log(ur.IsFullyQualified("//www.test.com/hello"));
//console.log(ur.IsFullyQualified("/monkey"));

//console.log(ur.IsSchemeRelative("/monkey"));
//console.log(ur.IsSchemeRelative("//monkey"));
//console.log(ur.IsSchemeRelative("///monkey"));
//console.log(ur.IsSchemeRelative("//www.test.com"));

//console.log(ur.ParseScheme("http://www.test.com"));
//console.log(ur.ParseScheme("https://www.test.com"));
//console.log(ur.ParseScheme("www.test.com"));

var sourceUrl="http://www.test.com/page";
console.log(ur.Resolve(sourceUrl, "http://www.test.com"));
console.log(ur.Resolve(sourceUrl, "//www.test.com"));
console.log(ur.Resolve(sourceUrl, "page2"));

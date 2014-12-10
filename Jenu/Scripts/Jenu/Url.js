
/// <reference path="~/Scripts/Utilities/Namespace.js" />

// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

/* Taken from https://gist.github.com/Yaffle/1088850 */

/*jslint regexp: true, maxerr: 50, indent: 2 */

// Define Jenu.Core.Url type
Jenu.Core.Url = function (url, baseURL) {
	this.origin = null;
	this.href = null;
	this.protocol = null;
	this.username = null;
	this.password = null;
	this.host = null;
	this.hostname = null;
	this.port = null;
	this.pathname = null;
	this.search = null;
	this.hash = null;
	this.title = null;

	this.Parse(url, baseURL);
};

Jenu.Core.Url.prototype = {
	Parse: function (url, baseURL) {
		var m = String(url)
			.replace(/^\s+|\s+$/g, "")
			.match(/^([^:\/?#]+:)?(?:\/\/(?:([^:@\/?#]*)(?::([^:@\/?#]*))?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);

		if (!m) {
			throw new RangeError();
		}

		var protocol = m[1] || "";
		var username = m[2] || "";
		var password = m[3] || "";
		var host = m[4] || "";
		var hostname = m[5] || "";
		var port = m[6] || "";
		var pathname = m[7] || "";
		var search = m[8] || "";
		var hash = m[9] || "";

		if (baseURL !== undefined) {
			var base = new Jenu.Core.Url(baseURL);
			var flag = protocol === "" && host === "" && username === "";

			if (flag && pathname === "" && search === "") {
				search = base.search;
			}

			if (flag && pathname.charAt(0) !== "/") {
				pathname = (pathname !== "" ? (((base.host !== "" || base.username !== "") && base.pathname === "" ? "/" : "") + base.pathname.slice(0, base.pathname.lastIndexOf("/") + 1) + pathname) : base.pathname);
			}

			// dot segments removal
			var output = [];

			pathname.replace(/^(\.\.?(\/|$))+/, "")
			  .replace(/\/(\.(\/|$))+/g, "/")
			  .replace(/\/\.\.$/, "/../")
			  .replace(/\/?[^\/]*/g, function (p) {
			  	if (p === "/..") {
			  		output.pop();
			  	} else {
			  		output.push(p);
			  	}
			  });

			pathname = output.join("").replace(/^\//, pathname.charAt(0) === "/" ? "/" : "");

			if (flag) {
				port = base.port;
				hostname = base.hostname;
				host = base.host;
				password = base.password;
				username = base.username;
			}

			if (protocol === "") {
				protocol = base.protocol;
			}
		}

		this.origin = protocol + (protocol !== "" || host !== "" ? "//" : "") + host;
		this.href = protocol
			+ (protocol !== "" || host !== "" ? "//" : "")
			+ (username !== "" ? username
				+ (password !== "" ? ":"
				+ password : "") + "@" : "")
			+ host
			+ pathname
			+ search
			+ hash;

		this.protocol = protocol;
		this.username = username;
		this.password = password;
		this.host = host;
		this.hostname = hostname;
		this.port = port;
		this.pathname = pathname;
		this.search = search;
		this.hash = hash;
	},

	Equals: function (otherUrl, caseSensitive) {
		if (otherUrl == null)
			return false;

		if (caseSensitive) {
			return this.href == otherUrl.href;
		} else {
			return this.href.toLowerCase() == otherUrl.href.toLowerCase();
		}
	}
};

//console.log(new Jenu.Core.Url("bar.htm", "http://www.foo.com").href);
//console.log(new Jenu.Core.Url("bar.htm", "http://www.foo.com/").href);
//console.log(new Jenu.Core.Url("/bar.htm", "http://www.foo.com").href);
//console.log(new Jenu.Core.Url("/bar.htm", "http://www.foo.com/").href);
//console.log(new Jenu.Core.Url("/bar.htm", "http://www.foo.com/qux").href);
//console.log(new Jenu.Core.Url("bar.htm", "http://www.foo.com/qux/").href);
//console.log(new Jenu.Core.Url("//www.bar.com/baz.htm", "https://www.foo.com").href);

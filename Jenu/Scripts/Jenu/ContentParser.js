/*
	Implement parser to extract URLs from HTML tag attributes of type '%URI;' in the following table: http://www.w3.org/TR/REC-html40/index/attributes.html

 	See accepted answer and additions here: http://stackoverflow.com/questions/2725156/complete-list-of-html-tag-attributes-which-have-a-url-value

	Name			Related Elements	Type		Default		Depr. DTD	Comment
	action		FORM					%URI;		#REQUIRED					server-side form handler
	background	BODY					%URI;		#IMPLIED		D		L		texture tile for document background
	cite			BLOCKQUOTE, Q		%URI;		#IMPLIED						URI for source document or msg
	cite			DEL, INS				%URI;		#IMPLIED						info on reason for change
	classid		OBJECT				%URI;		#IMPLIED						identifies an implementation
	codebase		OBJECT				%URI;		#IMPLIED						base URI for classid, data, archive
	codebase		APPLET				%URI;		#IMPLIED		D		L		optional base URI for applet
	data			OBJECT				%URI;		#IMPLIED						reference to object's data
	href			A, AREA, LINK		%URI;		#IMPLIED						URI for linked resource
	href			BASE					%URI;		#IMPLIED						URI that acts as base URI
	longdesc		IMG					%URI;		#IMPLIED						link to long description (complements alt)
	longdesc		FRAME, IFRAME		%URI;		#IMPLIED		F				link to long description (complements title)
	profile		HEAD					%URI;		#IMPLIED						named dictionary of meta info
	src			SCRIPT				%URI;		#IMPLIED						URI for an external script
	src			INPUT					%URI;		#IMPLIED						for fields with images
	src			FRAME, IFRAME		%URI;		#IMPLIED		F				source of frame content
	src			IMG					%URI;		#REQUIRED					URI of image to embed
	usemap		IMG, INPUT, OBJECT	%URI;	#IMPLIED						use client-side image map
*/

/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="~/Scripts/Jenu/Resource.js" />
/// <reference path="~/Scripts/Jenu/Url.js" />

// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

// Define Jenu.Core.ContentParser type
Jenu.Core.ContentParser = function () {
	this._content = null;
	this._contentType = null;
	this._contentUrl = null;

	this._fragment = null;
	this._dom = null;
};

Jenu.Core.ContentParser.prototype = {

	Parse: function (content, contentType, contentUrl) {
		var self = this;
		var urls = [];
		this._content = content;
		this._contentType = contentType;
		this._contentUrl = contentUrl;
		this._fragment = null;
		this._dom = null;

		if (this._content != null && this._content.length > 0) {

			switch (contentType) {
				case "text/html":
					urls = this.ParseHtml();
					break;

				case "text/css":
					// todo - parse @import references
					urls = this.ParseCss(this._content);
					break;

					// "application/javascript" doesn't support file references

					// todo - add other content types here...
			}
		}

		return urls;
	},

	ParseHtml: function () {

		this.BuildDom();

		var urls = [];

		urls = urls.concat(this.ParseTagUrls("a,area,link", "href"));
		urls = urls.concat(this.ParseTagUrls("script,input,frame,iframe,img", ["src", "longdesc"]));
		// Add other tags and attributes here...

		this.DestroyDom();

		return urls;
	},

	ParseCss: function (content) {

		// todo - implement CSS parsing logic
		// Handle - @import url("fineprint.css") - done
		//				@import 'custom.css'; - done
		//				background*:*url("foo.png")

		var urls = [];
		urls = urls.concat(this.ParseCssImports(content));
		//urls = urls.concat(this.ParseCssStyleUrls(content));

		//debugger;
		return urls;
	},

	ParseCssImports: function (content) {

		var urls = [];
		var rxImport = /@import\s*(url)?\s*\(?([^;]+?)\)?;/ig;
		var match = null;

		do {
			match = rxImport.exec(content);

			if (match) {
				var url = String(match[2]).replace(/['"]/g, ""); // trim edge quotes
				var objUrl = new Jenu.Core.Url(url, this._contentUrl.href);
				urls.push(objUrl);
			}
		} while (match);

		return urls;
	},

	ParseCssStyleUrls: function (content) {

		var urls = [];
		// /@import\s*(url)?\s*\(?([^;]+?)\)?;/ig;
		var rxImport = /.*/ig; 
		var match = null;

		do {
			match = rxImport.exec(content);

			if (match) {
				var url = String(match[2]).replace(/['"]/g, ""); // trim edge quotes
				var objUrl = new Jenu.Core.Url(url, this._contentUrl.href);
				urls.push(objUrl);
			}
		} while (match);

		return urls;
	},

	DestroyDom: function () {

		while (this._dom.firstChild) {
			this._dom.removeChild(this._dom.firstChild);
		}

		this._dom.parentNode.removeChild(this._dom);
		this._dom = null;
		this._fragment = null;
	},

	BuildDom: function () {
		//this._dom = document.createElement("div");
		//this._dom.document = this._content;

		var fragment = document.createDocumentFragment();
		var element = document.createElement('html');
		fragment.appendChild(element);

		element.innerHTML = this._content;
		this._fragment = fragment;
		this._dom = element;
	},

	ParseTagUrls: function (tagNames, urlAttribs) {

		if (!(urlAttribs instanceof Array))
			urlAttribs = [urlAttribs];

		var tags = this._dom.querySelectorAll(tagNames);
		var list = [];

		for (var i = 0; i < tags.length; i++) {

			for (var j = 0; j < urlAttribs.length; j++) {

				var urlAttrib = urlAttribs[j];
				//alert("todo - consider using one of the following techniques to extract URL");
				//var url = tags[i][urlAttrib]; // Access url attribute property using [propName] syntax rather than .propName
				var attrib = tags[i].attributes[urlAttrib]; // Access url attribute by name

				if (attrib != null) {

					var url = attrib.value;

					// Remove the url attribute to prevent it being downloaded by DOM
					tags[i].removeAttribute(urlAttrib);

					// 
					if (url != null && url.length > 0) {
						//console.log(url);
						var objUrl = new Jenu.Core.Url(url, this._contentUrl.href);
						list.push(objUrl);
					}
				}
			}

		}

		return list;
	}
};

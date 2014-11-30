
// Set up Jenu.Core namespace
Namespace.Create("Jenu.Core");

// Define Jenu.Core.PageInfoParser type
Jenu.Core.PageInfoParser = function () {
	this._content = null;
};

Jenu.Core.PageInfoParser.prototype = {

	Parse: function (html, contentType) {
		var pageInfo = {
			title: "",
			description: ""
		};

		if (html == null || html == "" || !this.CanParse(contentType))
			return pageInfo;

		pageInfo.title = this.ParseTagText(html, "title");
		pageInfo.description = this.ParseMetaContent(html, "description")[0] || "";

		return pageInfo;
	},

	/// Parse the text between a tag's opening and closing tags, e.g. <title>get this</title> returns 'get this'
	ParseTagText: function (html, tagName) {
		var regEx = new RegExp("<" + tagName + "[^>]*>([^<]+)</" + tagName + ">", "gi");
		var matches = regEx.exec(html);

		if (matches != null && matches.length > 0)
			return matches[1];

		return "";
	},

	/// Parses content attrib of: <meta name="description" content="Holiday apartment for rent in Los Cristianos, Tenerife" />
	ParseMetaContent: function (html, metaName) {
		
		// Grab all <meta name=metaName> tags
		var rxMetaTag = new RegExp("<meta\\s.*name=[\"|']{1}" + metaName + "[\"|']{1}[^>]*/?>", "gi");
		var contents = [];
		var match;

		while (match = rxMetaTag.exec(html)) {

			// Grab the text inside the meta tag's content attribute
			var strMeta = match[0];
			var rxContent = new RegExp("\\s.*content=[\"|']{1}(.*?)[\"|']{1}");
			var contentResult = rxContent.exec(strMeta);

			if (contentResult != null && contentResult.length > 0) {
				var strContent = contentResult[1];
				contents.push(strContent);
			}
		}

		return contents;
	},

	CanParse: function (contentType) {
		return contentType == "text/html";
	},

	GetMatches: function (string, regex, index) {
		index || (index = 1); // default to the first capturing group
		var matches = [];
		var match;

		while (match = regex.exec(string)) {
			matches.push(match[index]);
		}

		return matches;
	}
};

/*debugger;
var parser = new Jenu.Core.PageInfoParser();
var pageInfo = parser.Parse("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n"
+ "<html lang=\"en\" ng-app=\"jenuApp\">\n"
+ "<head>"
+ "<meta charset=\"utf-8\">\n"
+ "<meta charset2=\"utf-8\" />\n"
//+ "<meta name=\"description\" content=\"Description lorem ipsum dolor emet sep\" />\n"
+ "<meta content=\"Description lorem ipsum dolor emet sep\" name=\"description\" />\n"
//+ "<title>Jenu - a link scanner<\/title>\n"

//+ "<title>\n"
//+"Jenu - a link scanner<\/title>\n"

//+ "<title>Jenu - a link scanner\n"
//+ "<\/title>\n"

//+ "<title>\n"
//+ "Jenu - a link scanner\n"
//+ "<\/title>\n"

+ "<title>\n"
+ "Jenu - a link \n"
+ "scanner\n"
+ "<\/title>\n"
+ "</head>");

//console.log(pageInfo.title);
*/

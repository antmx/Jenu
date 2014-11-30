/// <reference path="~/Scripts/Utilities/Namespace.js" />
/// <reference path="Resource.js" />
/// <reference path="ResourceLog.js" />
/// <reference path="ContentParser.js" />
/// <reference path="Scanner.js" />

//var up = new Jenu.Core.ContentParser(
//	//"<!DOCTYPE html>" +
//	//"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">" +
//	"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">" +
//	"<html>\n" +
//"<body>" +
//	" <a href=\"/a1\">\n" +
//		"hello" +
//	"</a>" +
//	"<script>alert('monkey')</script>" +
//"	<a href=\"/a2\">hello</a>\n" +
//    "<link href=\"l1\">" +
//    "<link href=\"l2\" />" +
//    "<link href='l3' />" +
//    "<img src='i1' />" +
//	 "<img src='i2' longdesc=\"i3\" />" +
//"</body>" +
//	"</html>)");

//var urls = up.Parse();

debugger;

var resourceLog = new Jenu.Core.ResourceLog(false);
var contentParser = new Jenu.Core.ContentParser();
var scanner = new Jenu.Core.Scanner(
	"http://summerland.local/jenu.html",
	resourceLog,
	function () { },
	contentParser);

scanner.Start();

debugger;

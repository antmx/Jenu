Jenu
====

A website link checker in JavaScript.

Jenu checks Web sites for broken links. Link verification is performed on HTML anchor links, images, frames, plug-ins, backgrounds, local image maps, style sheets, scripts and java applets. It displays a continously updated list of URLs with information about each, such as success, content type, size, download duration, number of in links and out links.

Jenu works by recursively following web page links, parsing links in the content and following them, building up a log of links in the website.

NOTE: because Jenu is written in JavaScript, due to browser security constraints, Cross-origin resource sharing (CORS) must be implemented on the website you wish to scan. This is achieved by response headers. In IIS7, this can be done by editing the web.config file's customHeaders section:

``` XML
<?xml version="1.0"?>
<configuration>
	<system.webServer>
		<httpProtocol>
			<customHeaders>
				<add name="Access-Control-Allow-Origin" value="*" />
				<add name="Access-Control-Allow-Headers" value="Content-Type" />
				<add name="Access-Control-Expose-Headers" value="Content-Length,Server,Date,Last-Modified,Content-Encoding,Content-Language,Content-Type,Status" />
			</customHeaders>
		</httpProtocol>
	</system.webServer>
</configuration>
```

Setup:
Enable CORS on the website you want to scan (see above).
Download the source and place in a sub-folder of an exisiting local or remote website, e.g. /jenu
Browse to http://your.site/jenu/Index.html
Enter the full root URL of the website you want to scan into the "Enter a URL to scan" field, e.g. "http://www.somesite.com/"
Click "Start scanning".
Jenu will download that root page, scan it for links and download each link, can it for links 

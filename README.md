Jenu
====

###A website link checker in JavaScript###

Inspired by the legendary [**Xenu's Link Sleuth**](http://home.snafu.de/tilman/xenulink.html), a Windows application written in C++ and MFC.

Jenu checks websites for broken links. Link verification is performed on HTML anchor links, images, frames, plug-ins, backgrounds, local image maps, style sheets and scripts. It displays a continously updated list of URLs with information about each, such as success/failure, content type, size, download duration, number of in links and out links.

Jenu works by recursively following web page links and other types of URL reference, parsing links in the returned content and following those links, building up a log of links in the website.

**NOTE** because Jenu is written in JavaScript and due to browser security constraints, *Cross-origin resource sharing (CORS)* must be implemented on the website you wish to scan. This is achieved by returning a couple of response headers with each response from the website being scanned. In IIS7, this can be done by editing the web.config file's *customHeaders* section:

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

####Demo####
A working demo can be seen [here](http://www.netricity.co.uk/code-samples/javascript/jenu/).


####Setup####
 - Enable *CORS* on the website you want to scan (see above).
 - Download the source and place in a sub-folder of an exisiting local or remote website, e.g. */jenu*
 - Browse to the Jenu page in the folder you just set up, e.g. *http://your.site/jenu/Index.html*
 - In the *Enter a URL to scan* field, enter the full root URL of the website you want to scan into , e.g. *http://www.somesite.com/*
 - Click *Start scanning*.
 - Jenu will download that root page, scan it for links and download each link, then scan each response for links until all links on the website have been followed.
 - Jenu will check links to resources outside of the website being scanned too, but will not go any further, otherwise it might scan the entire Internet!

# Hide Printed URLs
When you print pages from within Canvas, any hyperlinks have their URL added after the link text. This is great for some people, but they get in the way for others who just want to read the document.

These scripts will remove the URL from after the link when printing a document.
## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the desired script [Hide all URLs](https://github.com/jamesjonesmath/canvancement/raw/master/hide-urls/hide-all-urls.user.js) or [Hide some URLs](https://github.com/jamesjonesmath/canvancement/raw/master/hide-urls/hide-some-urls.user.js)

## Hide all URLs
This script will inject CSS onto the page to hide the URL for all links.

* Name: [Hide all URLs](hide-all-urls.user.js)
* Type: [user script](../USERSCRIPTS.md)
* Browsers: Firefox, Chrome

## Hide some URLs
This script will print the URL for all links except for those that are inside a class of "hide_url".

* Name: [Hide specific URLs](hide-some-urls.user.js)
* Type: [user script](../USERSCRIPTS.md)
* Browsers: Firefox, Chrome

You can hide specific links:
```html
<p>This link will print the URL, 
  <a href="https://people.richland.edu/james">James Jones - with URL</a>, 
but this link will not print the URL, 
  <a class="hide_url" href="https://people.richland.edu/james">James Jones - no URL</a></p>
```
You can hide an entire block of links: 
```html
<div class="hide_url>
<p><a href="https://github.com/jamesjonesmath/canvancement/tree/master/hide-urls">Hide URLs Page</a></p>
</div>
```

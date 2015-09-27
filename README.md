# Canvancement
A **Canvancement** is an enhancement to the [Canvas Learning Management System](http://www.canvaslms.com/) ... a Canvas Enhancement.

## Purpose
This repository holds code that can be used to enhance the user's experience with the Canvas Learning Management System by Instructure. Canvancements are usually short scripts that add functionality that is not native to Canvas or that cannot be easily accessed by normal users. 

I found that I was creating many scripts for the [Canvas Community](https://community.canvaslms.com) and that many of them served more than one group, but at the time, the Community required that you post your document blog into one group. I also found that several of my *more useful* scripts weren't getting notice because they were buried in discussion or feature requests.

Several of my postings in the Canvas Community demonstrated my progression in learning. When I started, I really didn't know the best way to get things done, I was just trying to get something useful out there to people. As I learned more, I discovered better ways to do things. I could have written new blog posts, put people had linked to the old ones. There wasn't an easy way for other people to comment on the code and provide suggestions or to make sure that they had the latest version of the code.

Creating this site on GitHub helps with many of those problems.

## Types of Enhancements
### User Scripts
User scripts are JavaScript code that run inside the browser after the page has loaded.

These are limited to a single web page and you can gain access to any information on the page. You can also make API calls to fetch additional information.

This combination allows you to gain access to some data that isn't available through the API, but it is not suitable for tasks like automatically muting an assignment when it is created.

To install a [user script](USERSCRIPTS.md), you first need a user script Manager loaded and enabled. Then navigate to the page that contains the script and then click on the Raw button.

### Google Sheets
Google Sheets has a programming language that is simliar to JavaScript. These scripts will be useful when information can be organized in a tabular method.

Information loaded into Google Sheets must be obtained through calls to the API. This means that it will not work if the information is not exposed through the API. For example, you cannot create a Canvas rubric using a Google Sheet.

The source code to the Google Sheets may be provided here, but it will often be easier to open a shared Google Sheet and then go to File > Make a Copy to create your own instance.

## Site Navigation
This site is laid out based on the primary functionality of the enhancement and not according to the type of enhancement.

Click on one of the folders to find enhancements related to that area. Sometimes, scripts may fit into more than one category, so don't be too narrow in your search. Explore the site, you may find something you hadn't thought of.

## History of the term Canvancement
**Canvancement** is a portmanteau of Canvas and Enhancement. 

While intended to be a Canvas Enhancement, it could just as well be a Canvas Advancement. Technically, it could also be a Canvas Announcement, Canvas Commencement, Canvas Denouncement, or Canvas Pronouncement, but those don't fit with its intended purpose.

James Jones coined the term *Canvancement* on September 26, 2015. At the time, there was only one hit for it on Google, which was a term in a forum post in which it was impossible to tell what it meant. Strangely, the title of the page was "Which is better? Let's talk some sense into James." At first, I thought Google was trying to tell me what I was doing was stupid and it even asked if I meant "Canvas Cement" instead. But then I read the page from 2010 and decided since it was the only one on the publicly available Internet that I could lay claim to the term.

## Disclaimer
My goal is to provide working solutions that are *reasonably easy* for people to use.

This is difficult because I tend to be a perfectionist and that often means things never get done. I finally decided that for many people, *good enough* is sufficient, and that I should release the code without stressing out over how convoluted it was. I'm a self-taught programmer, so my code may not be elegant, pretty, or up to standards. If you're a professional programmer, you may look at it and shake your head in disbelief.

Others may look at my code and ask "That's so simple, why doesn't Canvas do that?" In their defense, Canvas needs to make sure that their code works across browsers and devices and with assistive technology --- I don't. Those are important things and accessibility is a passion of mine, but there are many people who are just fine running something in Firefox with a mouse and can benefit from the enhancements. 

Canvas also has to consider the bigger picture and how certain additions would fit in with their product design. Usability and consistent design are good things. Some of the things I've written code for are things that I personally don't use and sometimes even think they're a bad idea. But that's part of why I like user scripts -- people can decide to break the default behavior for themselves without ~~ruining it for~~ affecting other people.

Some people want the functionality of these enhancements to be built into Canvas. The enhancements here aren't meant to be a statement one way or the other about that. However, feature requests can take a while to get processed and it seems that many are getting the "Not in the next six months" line from Canvas. These enhancements are designed as interim solutions until their functionality gets built into Canvas, with the full realization that day may never come. They are intended to show people what can be done and maybe spark them to create and share something of their own.

I am not a Canvas employee and this site is not affiliated with Canvas in any way other than the code I'm writing is to enhance their product. Don't gripe at me because Canvas won't do something, put it into the Community. If you experience a problem on a page that you've voluntarily chosen to alter (i.e., you've added a Canvancement to it), then try disabling the enhancement before you contact Canvas Support with a problem.

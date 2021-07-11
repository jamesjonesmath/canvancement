# New Analytics Anonymizer (Firefox only)

Anonymizes the user information with Canvas New Analytics so that you can make videos without releasing student information.

![new_analytics_revised](https://user-images.githubusercontent.com/14840711/125204442-00db7280-e243-11eb-9989-7ea7b7c4f5a5.png)

Note that this works **only with Firefox**.

This is an unpacked extension for **Firefox only**. 
It uses the webRequest API to intercept calls to Canvas Analytics and modify the response data before Canvas processes it. 
Chrome and other browsers do not support modifying the response without hacks like making sure there is a developer tools window open while the script is running.

## Installation
You do not want this script to run on a permanent basis. It is loaded as a temporary extension that will exist until you close Firefox or you remove it.

### Step 1: Download Files (any browser)
If Firefox is not your normal browser, then I recommend not using it for this step.
1. Create a folder on your hard drive
2. Download the **manifest.json** and **analytics.js** files from this repository and save them in that folder.
  1. For each file, left-click on the name of the file
  2. Right-click on the Raw button
  3. Choose Save Link As. If your browser suggests a file type of "Text Document (\*.js)" then see the note below.

Firefox tried to save the analytics.js file as a Text Document and it added a .txt extension to name it analytics.js.txt. You need to rename it to just analytics.js for it to work. Chrome did not have that issue, so I recommend Chrome over Firefox for this step.

Optionally edit the analytics.js file and make any configuration changes desired.

### Step 2: Install Add On (Firefox only)
This needs to be done inside Firefox.

1. In the Firefox location bar, type **about\:debugging** and press enter
2. On the left side, click on **This Firefox**
3. Under Temporary Extensions, click on **Load Temporary Add-on**
4. Navigate to the folder where you saved the files, select any file in the folder, and click **Open**.

These four items in Step 2 will need repeated any time you open Firefox and want to use this script. This is not something that you want permanently installed or you will not be able to actually use New Analytics.

## Instructions
After installing the temporary extension, view the New Analytics from any Canvas Course. That's it.

Every time user information is loaded from the network, this script replaces it with anonymized data before sending the information on to Canvas' JavaScript that displays the report.
The Canvas New Analytics JavaScript running in the browser never sees the original names or email addresses. The Canvas ID and SIS ID are not changed, but they are not displayed.

The alias information is tied to the Canvas user ID, so an alias like "Wild Feather" will refer to the same user on all screens until you reload the extension.
This means that you can prepare your presentation ahead of time and pick out some students to look at and the information will not change as long as you do not reload the extension.
If you must associate a real student with a fake student, then I suggest opening New Analytics in a different browser and finding something unique like the number of page views and then matching that information in the anonymized version in Firefox.

The aliases remain in place until the extension is reloaded. You can navigate around in Canvas, reload the New Analytics page, visit New Analytics for other courses,
even close Canvas completely (while leaving Firefox open) and when you come back to New Analytics, it will remember the aliases.

## Configuration
There are three settings that you can configure in the analytics.js file. If you edit them after loading the extension, you will need to reload the extension.

* **emailFormat** determines what you want the username portion of the email address will look like. The username portion is derived from the anonymous name. The examples below show how "Wild Feather" would appear.
  * **flast** is the first initial followed by the last name (wfeather). This is the default unless you change the configuration.
  * **lastf** is the last name followed by the first initial (featherw)
  * **first_last** is the first name, underscore, and then last name (wild_feather)
  * **last_first** is the last name, underscore, and then first name (feather_wild)
* **defaultDomain** determines the domain name to use for the email address.
  * **empty string** `''` or `null` will keep the existing domain of the user.
  * **non-empty string** such as `'example.com'` will force the domain to that string. The default is `example.com`.
  * **comma-separated string** such as `'gmail.com,yahoo.com,hotmail.com,outlook.com,icloud.com'` will randomly assign one of those domains to the email.
* **removeAvatar** determines whether to remove the avatars.
  * **true** will remove the avatars and just use the initials of the alias. This is the default setting.
  * **false** will keep the existing avatar of the user.

There is one additional item that you can change, but it is is inside a function inside of a variable. 
The **anonymousUserList** function contains a comma-separated list of 123 potentially-humorous names that mostly consist of an adjective followed by a noun.
You can go through and alter this as you see fit. The list was automatically obtained from a now-defunct website and I did not scrutinize them for offensive names.

If you happen to have view more students than you have aliases (123 in the default configuration), the script will the first names 
and last names into two separate lists, shuffle each of those, and recombine them into new names.
For example, if "Puny Ego" and "Normal Rockstar" are original alises, a reshuffle might give you "Puny Rockstar" and "Normal Ego".
If you exhaust the new list of names, then it will repeat that process, making sure that no name is duplicated.
Theoretically, if there are n names, then there are n<sup>2</sup> combinations. For the default 123 names, 
you can view up to 15129 students without running into duplication problems.
In reality, you will not achieve the maximum because of the way the process is done.
If you view so many students that it cannot generate new names, the script will start reusing names.

## About
This project originally began because my wife had two New Analytics demonstrations coming up and thought she was going to have to make a video of New Analytics, edit the
video to blur out any student information, and then just play the video during the presentations. She really wanted to be able to present live, rather than just showing
a video.

Some people will have a separate course full of fake users to make these videos, but they do not represent real usage. My wife really wanted to use a real course for her presentations.

Previously, we had attempted running New Analytics from the beta instance of Canvas and changing all of the student names in Beta to make them anonymous.
New Analytics is only updated once a day and we missed the update. It turns out that it wouldn't have mattered anyway because 
New Analytics is an LTI and pulls information from the production instance of Canvas, even when running in the beta instance.
That means that to this with Canvas, we would have had to change the student names and emails in our production site, which is blocker.

I decided to take a look at it and see what could be done. My initial thought was to modify the data as it came into Canvas, but I didn't know how to do this, so
I tried some things I had done in the past -- manipulating the DOM with a userScript. I fetched a list of all of the users from the graphql API and then aliased them.
I set up a bunch of mutation observers to watch when the document changed and then checked to see if there was a name or email address there. 
Some of the changes were triggering 60,000 plus mutations and I would change a node's textContent
just to have that node removed and then readded in a spot I wasn't looking for it.
When I thought I had it working, I had my wife try it and she found lots of places it didn't work, especially when returning to a page after looking at an individual student.
This route had other problems like not remember aliases between page reloads.

This was quickly leading no where. After a short family vacation and a rest from looking at it, 
I decided to revisit the notion of intercepting the data as it came in and manipulating it there. 
If I could do that, then the brower would never see "James Jones" but only "Wild Feather" and so I wouldn't have to track down all of the places it could be written.

I tried a userScript to intercept the `window.fetch` function, but it wasn't being called. 
I had intercepted some `window.XMLHttpRequest` in a different project, but that didn't work here, either. Canvas was using ReactJS to make the calls
and I didn't have access to that code.

At one point, I thought about using Chrome's ability to override JavaScript with local customizations. I could patch the source code, but then I would be stuck using
my version in case updates were made. Most of the time I would not want this script to run at all and the instructions for creating, enabling, and disabling local customizations is a very advanced.
In other words, it's not something that I could share with people.

I settled on the [webRequest API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest). I had never used this before,
so I thought I could just wait for the `onCompleted` event to fire, grab the response, modify it, and pass it on. That didn't work, it just gave me information about the request.

It turned out that I needed [webRequest.filterResponseData() function](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData), but
Firefox is the only browser that supports it. Chrome can be hacked to use it, but you have to open the developer tools and leave it open for it to work. I asked my wife if she could use Firefox for purposes of the demonstration, she said yes, and so I set to work.

It actually came together fairly quickly at that point.

The script intercepts network calls to the New Analytics graphql API. When the response comes back, it looks at the data structure
to determine what needs changed. It changes the name, sortableName, shortName, email properties to an anonymous value. 
It may set the avatarURL property to null to remove the avatars. Then it encodes this information and sends it on to Canvas.

The script is slower than the native New Analytics. This is not really because of the processing that I'm doing, 
but because of we have to use a blocking request if we wish to modify the response. That isn't blocking in the normal sense of an adBlocker (although
it can be used for that), it's blocking in the sense that the code is blocked and cannot continue until it finishes. Instead of being able to fetch the analytics data
and then do other processing while you wait for it to arrive, the code must now wait before it can move on. Generally, that's a bad thing.

In the end, we ended up with something that has some benefits that wouldn't have been there with a userScript. The code is temporary in the browser and it remembers
the aliases so you have increased navigation. There are some downsides as well like having to run it in Firefox and manually install it each time.

I have some inkling that I should have used manifest version 3 instead of 2. Chrome came out with it a couple of years ago and Firefox is in the process of implementing it,
but since I'm using Firefox right now, I stuck with version 2. There's a good chance I should be using a web worker instead, but that's more learning curve that I don't have
time for right now.

The goal was to get this out there in case people wanted to use it.

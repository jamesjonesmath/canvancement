# User Scripts
A **user script** is a piece of JavaScript code that runs inside your browser. It is injected into a page after the page has loaded by an add-on or plugin.

As the name suggests, it is script that the **user** decides to run. User scripts are specific to a user account on a machine using a particular browser. That is, you'll need to install the script on any browser and machine where you want to use it.

This does not require modifying the global JavaScript file inside Canvas. This empowers the user, whether a student, teacher, instructional designer, or admin, to add functionality that they want without having to worry about other users.

## How it Works
Canvas already includes jQuery and some of jQuery UI on every page. So if you want to use these in your scripts, you don't have to include anything else and often a few lines of JavaScript code will suffice.

The user scripts run on the page that has already been authenticated, which means that it has the permissions of the user. This helps provide security and keep users from gaining access to things they shouldn't have access to. It can make API calls without needing an authorization token, but it does so as the user running the script.

Sometimes the information is contained on the page and you just want to change how it works.

Some of you will say, *But I'm not a programmer*. That's the beautiful thing of user scripts and this site. You can let other people write the scripts for you and all you have to do is install them and enjoy. And if the code doesn't do exactly what you need it to do, you can often figure out enough to change it. That's better than starting from scratch, which may not be an option.

## User Script Manager
That sounds way more complicated than it is. Luckily, there are browser extensions that will automate the process for you.

At one time, I recommended Greasemonkey for Firefox. Changes made in Firefox 57 in late 2017 broke the integration with Greasemonkey and made it so that scripts that tried to access jQuery or jQuery UI do not work anymore. I am now recommending Tampermonkey for all major browsers.

Tampermonkey is known to work well with Chrome, Safari, and Firefox. My scripts may work in Edge, but I don't test them there.

Visit the [Tampermonkey](http://tampermonkey.net/) website and install the extension.

After installation, you should see a black square with two circles in the bottom half on the toolbar.

To edit a script, click on the Tampermonkey icon and then click on Dashboard. Then click on the name of the script.

## User Script Configuration
### Default Script Settings
The top of every user script contains the configuration for that script. Probably the only one you might need to change is the line that starts ``\\ @include``. This line tells the user script manager where to run the script. Some of the scripts may use the ``\\ @match`` line instead of include.

An include of ``https://*.instructure.com/courses/*/users/*`` tells the manager to run the script on any Instructure-hosted Canvas site that isn't use a custom domain and then on any page that starts with courses/ and contains /users/. In case you haven't figured it out, * is a wildcard.

You can also specify a regular expression based URL. For example, ``/^https://.*\.instructure\.com/?.*/users/[0-9]+$/`` says to run on Canvas instances using the default domain and then look for any page that ends in /users/ and a number. It will not run on pages that contain /users/ and a number followed by additional information.

You may have more than one include line in the configuration.
### Custom Settings
The programmer of a script may add some configuration variables, usually at the top, so that you can customize the behavior of the script without having to change code.

To change the options, you will need to edit the script (see the details above for your particular Manager).

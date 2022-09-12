# Chat
These items fix issues with Canvas chat.

## Canvas Chat CSS Tweaks
When a user posts a reply, they see their message with a color of #eeeeee on white #ffffff, which has a contrast ratio of 1.16.
When they hover over their response, it changes to #eeeeee on approximately #f2f2f2, which has a contrast ratio of 1.03.
In other words, it is a major accessibilty failure. Hopefully Canvas will fix it, but in the meantime, this script is designed to set the color to a dark red #990000.

The code is longer than it needs to be, but I left it flexible so that additional tweaks could be added later if needed.

Unfortunately, this code will not run in the custom global JavaScript. It operates on an iframe that has cross-origin restrictions in place that make it inaccessible from the main Canvas page.

* Name: [chat-css-tweaks](/chat/chat-css-tweaks.user.js)
* Type: [user script](../USERSCRIPTS.md)
* Browsers: Firefox, Chrome, Safari

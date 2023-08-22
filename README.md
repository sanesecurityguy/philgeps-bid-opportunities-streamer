![](Sample%20screenshots/Sample_1.png)
![](Sample%20screenshots/Sample_2.png)

This is a script to be hosted on Google Apps Script and run every hour to alert a Slack channel of new PhilGEPS bidding opportunities that might be relevant to the user.

To deploy this script, the process should be simple following these steps (note that I used .js files in this repo for better syntax highlighting but Google Apps Script uses .gs files):
1. Copy the Code.gs, Parameters.gs, and Triggers.gs files into a Google Apps Script project
2. Edit the Parameters.gs file according to your needs
3. Run the buildTriggers() function in Triggers.gs
4. Decide if you want to send weekly reminders to the Slack channel. If not, you're done. If so, copy the Reminder.gs file and edit it as needed, and then run the buildReminderTrigger() function.

By default, the reminder sends a message to the Slack channel every Wednesday around 9am, telling them:
*  What the script's budget range is
*  What keywords the script is searching for
*  What PhilGEPS categories the script is searching in, linking to their URL's
*  That those can be changed
*  To meet and talk about government bids

There is also a totally optional "Parser Testers.gs" file that a user/developer can use to test the parsing functions in the Code.gs file. I've included this in case the PhilGEPS website changes or there are unforeseen circumstances that I didn't account for.

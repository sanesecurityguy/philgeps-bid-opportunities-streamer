//// These are the script's parameters. If you don't intend on changing how the script works; and just want to change the Slack channel, the PhilGEPS categories, the keywords, and/or the budget range; then this is the place to do it.



// The Slack channel's Incoming WebHook where opportunities are to be sent
var slackChannel = 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/xxxxxxxxxxxxxxxxxxxxxxxx';

// Here we decide what kind/s of URL's to send to the Slack channel
// The PhilGEPS website has 2 kinds of URL's, which I call "public" and "private":
    // Private URL's can be accessed only by a logged-in user of the PhilGEPS website. These are the URL's that a PhilGEPS supplier MUST USE in order to submit a bid.
    // Public URL's can be accessed by anybody. But, if a logged-in user accesses this kind of URL, they are "sort of logged out", but not really logged out, which can then lead to unpredictable consequences, especially since PhilGEPS users are allowed only 1 active session at a time.
var linkSetting = "Both"; // "Public" for only public URL's, "Private" for only private URL's, "Both" for both, and "None" or "Neither" for neither (case-insensitive)

// The minimum and maximum budgets to filter opportunities by (as numbers with no decimals)
var budgetMin =  1000000
var budgetMax = 10000000

// All keywords relevant to us
// We'll put these keywords into a regular expression. So "websites?" will mean the RegEx engine will search for both "website" and "websites".
// The RegEx will also match whole words only. For example, if we're looking for "host", the RegEx won't match "ghost".
// Finally, the RegEx will be case-insensitive
var keywords = ['web', 'websites?', 'internet', 'cloud', 'hosts?', 'hosting', 'platforms?', 'domains?', 'protocols?', 'systems?', 'support', 'technical', 'technology', 'technologies',
                'development', 'develops?', 'programs?', 'programming', 'software', 'mobile', 'applications?', 'apps?', 'android', 'ios', 'apple', 'iphone'];

// All PhilGEPS categories of open opportunities relevant to us
// The keys should preferably be identical to the category's name as shown on the PhilGEPS website, as these keys are used in the parseOpportunity function of the Code.gs file. If the keys are not identical, the script should still run just fine and its output should still be readable, but the category names will be redundantly included in the description of every opportunity sent to the Slack channel.
// The properties have to be public URL's
var categories = {'Information Technology'                : 'https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&BusCatID=10&type=category&ClickFrom=OpenOpp',
                  'Internet Services'                     : 'https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&BusCatID=86&type=category&ClickFrom=OpenOpp',
                  'IT Broadcasting and Telecommunications': 'https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&BusCatID=167&type=category&ClickFrom=OpenOpp',
                  'Systems Integration'                   : 'https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpportunitiesSearchUI.aspx?menuIndex=3&BusCatID=108&type=category&ClickFrom=OpenOpp'};

//// This is the main file that dictates how the script works. The script's parameters are in the Parameters.gs file. Please leave this Code.gs file alone unless you intend on changing the script's functionality.



// Parse the data in the table on the first page (and only the first page) of a category's URL, getting rid of all the HTML and turning it into an array of strings that we can work with
// We use only the first page of a category's URL because the PhilGEPS data is on .aspx web pages that use unique view states
// Due to these unique view states, I have yet to find a way for this script to access succeeding pages, and have implemented a workaround by making this script run every hour instead of every day
function parseCategory (categoryURL) {
  var data = UrlFetchApp.fetch (categoryURL).getContentText();
  var tableStart = data.indexOf ('\t</tr><tr class="GridItem">');
  var tableEnd = data.indexOf ('</table></TD>', tableStart);
  var tableData = data.slice (tableStart, tableEnd-10);
  tableData = tableData.replace (/\t<\/tr><tr class="Grid(Alt)?Item">\r\n\t\t<td align="center" valign="middle" style="width:5%;">\d{1,2}<\/td><td class="GridItemTD" align="center" valign="middle" style="width:5%;">/g, '');
  tableData = tableData.replace (/<\/td><td class="GridItemTD" align="center" valign="middle" style="width:10%;">/g, '\n');
  tableData = tableData.replace (/<\/td><td class="GridItemTD">\r\n\t\t\t\t\t\t\t\t\t\t<a id="dgSearchResult_ctl\d{1,2}_hyLinkTitle" href="SplashBidNoticeAbstractUI.aspx\?menuIndex=3&amp;/g, '\n');
  tableData = tableData.replace (/<\/a>\r\n\t\t\t\t\t\t\t\t\t\t<span id="dgSearchResult_ctl\d{2}_lblOrgAndBusCat">/g, '');
  tableData = tableData.replace (/<\/span>\r\n\t\t\t\t\t\t\t\t\t<\/td>\r\n/g, '\n\n');
  tableData = tableData.split ('\n\n');
  tableData.pop ();
  return tableData;
}

// Get the budget from an opportunity's URL
function getBudget (opportunityURL) {
  var data = UrlFetchApp.fetch (opportunityURL).getContentText();
  var index1 = data.search (/<span id="lblDisplayBudget" class="DisplayText5">\d+?,?\d+?,?\d+\.?\d{0,2}?<\/span>/);
  var budget = data.substr (index1, 100);
  var index2 = budget.search (/\d+?,?\d+?,?\d+\.?\d{0,2}?/);
  var index3 = budget.indexOf ('</span>');
  budget = "Budget: Php " + budget.slice (index2, index3 - 3);
  return budget;
}

// Parse an opportunity into a formatted string message
function parseOpportunity (opportunity, categoryName) {
  opportunity = opportunity.replace (categoryName + ", ", '');
  var refIDindex = opportunity.search (/refID=\d+-?\d?/); // Most refID's are just 7-digit numbers like "1234567", but I have had a few experiences where the refID was something like "1234567-1".
  var IDs = opportunity.substr (refIDindex, 77);
  opportunity = opportunity.replace (/refID=\d+-?\d?&amp;DirectFrom=OpenOpp&amp;Type=category&amp;BusCatID=\d{1,3}">/, '');
  var refID = IDs.substr (6, 11);
  refID = refID.match (/\d+-?\d?/).toString();
  var BusCatIDindex = IDs.search (/BusCatID=\d+/);
  var BusCatID = IDs.substr (BusCatIDindex + 9, 3);
  BusCatID = BusCatID.match (/\d{1,3}/).toString();
  var opportunityURL = "https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashBidNoticeAbstractUI.aspx?menuIndex=3&refID={1}&DirectFrom=OpenOpp&Type=category&BusCatID={2}".replace ("{1}", refID).replace ("{2}", BusCatID);
  opportunity += '\n' + getBudget (opportunityURL);
  switch ( linkSetting.toLowerCase() ) {
    case "public":
    case "private":
    case "both":
      opportunity += '\n' + opportunityURL;
      break;
    case "none":
    case "neither":
      break;
    default:
      throw "You did not provide a valid string for the linkSetting variable in the Parameters.gs file.";
  }
  return opportunity;
}

// Today's and yesterday's dates formatted as strings like 07/01/2020
var todayFormatted = Utilities.formatDate (new Date(), "GMT+8", "dd/MM/yyyy");
var yesterday = new Date();
yesterday.setDate (yesterday.getDate() - 1);
var yesterdayFormatted = Utilities.formatDate (yesterday, "GMT+8", "dd/MM/yyyy");

// A boolean used to tell the script whether or not it is the last scan of a day (always yesterday)
// We want to make one final scan for yesterday to get any opportunities that were posted at, for example, 11:59pm
var lastScan = false;

// Filter a tableData array's opportunities by today's date (or yesterday's date, in the case of lastScan being true)
// We'll use this as an array.reduce() argument in the lister() function
function dateFilter (todaysData, opportunity) {
  if (lastScan) {
    var dateToFilterBy = yesterdayFormatted;
  } else {
    var dateToFilterBy = todayFormatted;
  }
  var date = opportunity.slice (0, 10);
  if (date === dateToFilterBy) { // Note that Google Apps Script has no string.startsWith() method
    todaysData.push ("Deadline: " + opportunity.slice (11));
  }
  return todaysData;
}

////////// These "filter" functions will be used as array.filter() arguments in the lister() function //////////

// Here we make the actual regular expression to be used in searching for the keywords specified in Parameters.gs
var regexKeywords = [];
function regexFormatter (keyword) {regexKeywords.push ("(^|\\s)" + keyword + "(\\s|$)")} // Match whole words only
keywords.forEach (regexFormatter);
var regex = new RegExp (regexKeywords.join ("|"), "i");

// Find out if an opportunity has keywords relevant to us
function wordFilter (opportunity) {return regex.test (opportunity.slice (29))}

// Find out if an opportunity is within the budget range set forth in the Parameters.gs file
function budgetFilter (opportunity) {
  var budget = opportunity.split ('\n') [2].replace (/\D/g, '');
  return budget >= budgetMin && budget <= budgetMax;
}

// Get the opportunities that have been sent today (or yesterday, in the case of lastScan being true) to the Slack channel from this script's ScriptProperties
// We use ScriptProperties because all variables are reset after every server call, but ScriptProperties persist
// ScriptProperties are key:value pairs that can only be strings
var sentToday = PropertiesService.getScriptProperties().getProperty ('Opportunities Sent Today');

// Find out if an opportunity has already been sent to the Slack channel today
function sentFilter (opportunity) {return sentToday.indexOf (opportunity) === -1} // We use .indexOf() instead of .includes() because Google Apps Script doesn't support .includes() for both strings and arrays

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Make a private version of a URL
function makePrivate (URL) {
  return URL.replace ("GEPSNONPILOT", "GEPS")
            .replace ("menuIndex=3&", '')
            .replace ("SplashOpportunitiesSearchUI", "OpportunitiesSearchUI")
            .replace ("SplashBidNoticeAbstractUI", "BidNoticeAbstractUI");
}

// Extract the data from a category's URL and list the opportunities we want to send to the Slack channel
function lister (categoryName, categoryURL) {
  var tableData = parseCategory (categoryURL);
  for (var index = 0; index < tableData.length; index++) {
    var opportunity = tableData [index];
    tableData [index] = parseOpportunity (opportunity, categoryName);
  }
  var filteredData = tableData.reduce (dateFilter, []).filter (wordFilter).filter (budgetFilter).filter (sentFilter);
  if (filteredData.length > 0) {
    switch ( linkSetting.toLowerCase() ) {
      case "public":
        filteredData.unshift (categoryName + "\n" + categoryURL);
        break;
      case "private":
        filteredData.unshift (categoryName + "\n" + makePrivate (categoryURL));
        break;
      case "both":
        filteredData.unshift (categoryName + "\n" + "Private Link: " + makePrivate (categoryURL) + "\n" + "Public Link: " + categoryURL);
        break;
      case "none":
      case "neither":
        filteredData.unshift (categoryName);
        break;
      default:
        throw "You did not provide a valid string for the linkSetting variable in the Parameters.gs file.";
    }
  }
  return filteredData;
}

// Make an array for each category of opportunities with lister(), and then put those arrays into an outer array
function arrayer () {
  var arrayOfCategories = [];
  for (var categoryName in categories) {
    var categoryURL = categories [categoryName];
    var categoryArray = lister (categoryName, categoryURL);
    if (categoryArray.length > 0) {
      arrayOfCategories.push (categoryArray);
    }
  }
  return arrayOfCategories;
}

// Create JSON message payloads for each category, and send each message to the Slack Incoming Webhook
// Also update the "Opportunities Sent Today" ScriptProperty so that succeeding calls to this function today do not send the same opportunities multiple times
function opportunitiesMessager () {
  var arrayOfCategories = arrayer();
  
  // If no new opportunities are found, leave this function
  if (arrayOfCategories.length === 0) {
    return;
  }
  
  // Otherwise, we send the new opportunities off to the Slack channel
  var newOpportunities = [];
  for (var index = 0; index < arrayOfCategories.length; index++) {
    var categoryArray = arrayOfCategories [index];
    var category = categoryArray [0];
    var categoryOpportunities = [];
    for (var index2 = 1; index2 < categoryArray.length; index2++) {
      var opportunityString = categoryArray [index2];
      var opportunityArray = opportunityString.split ('\n');
      var deadline = opportunityArray [0];
      var details = opportunityArray [2] + '\n' + // The budget
                    opportunityArray [1] + '\n'; // The opportunity's description
      switch ( linkSetting.toLowerCase() ) {
        case "public":
          details += opportunityArray [3];
          break;
        case "private":
          details += makePrivate (opportunityArray [3]);
          break;
        case "both":
          details += "Private Link: " + makePrivate (opportunityArray [3]) + '\n' +
                     "Public Link: " + opportunityArray [3];
          break;
        case "none":
        case "neither":
          break;
        default:
          throw "You did not provide a valid string for the linkSetting variable in the Parameters.gs file.";
      }
      var opportunityPayload = {"title": deadline, "text": details};
      categoryOpportunities.push (opportunityPayload);
      newOpportunities.push (opportunityString);
    }
    var categoryPayload = {"text": category, "attachments": categoryOpportunities};
    UrlFetchApp.fetch (slackChannel, {'method': 'post',
                                      'contentType': 'application/json',
                                      'payload': JSON.stringify (categoryPayload)
                                     } ) ;
  }
  
  // And store them in the "Opportunities Sent Today" ScriptProperty
  newOpportunities = newOpportunities.join ('\n\n');
  sentToday += '\n\n' + newOpportunities;
  sentToday = sentToday.trim();
  PropertiesService.getScriptProperties().setProperty ('Opportunities Sent Today', sentToday);
}

// Reset the ScriptProperty "Opportunities Sent Today" into an empty string at the start of each day
function dailyReset () {
  PropertiesService.getScriptProperties().setProperty('Opportunities Sent Today', '');
}

// Make one final scan for the previous day so no opportunities posted after the last run of opportunitiesMessager() are missed
// And then run dailyReset() to start today fresh
function yesterdaysLastScan () {
  lastScan = true;
  opportunitiesMessager();
  dailyReset();
}

//// Let the Slack channel know what PhilGEPS keywords/categories the script is searching for/in, as well as what the current budget range is, reminding them that those can be changed
//// Also remind them to meet and talk about PhilGEPS bids every week



// Decide whether to send public or private or both URL's in the reminder
var linkSetting2 = "Public";

// A function making use of a RegEx to convert numbers (without decimals) into a pleasing-to-the-eyes string
function numberFormatter (number) {
  return number.toString().replace (/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Make a string of the script's budget range using the budgetMin and budgetMax in Parameters.gs
function budgetRangeMessager () {
  var formattedBudgetMin = "Php " + numberFormatter (budgetMin);
  var formattedBudgetMax = "Php " + numberFormatter (budgetMax);
  var budgetRangeMessage = "This is the budget range I am searching in: " + formattedBudgetMin + " - " + formattedBudgetMax;
  return budgetRangeMessage;
}

// Turn the list of keywords that the script is searching for into a string
function keywordsMessager () {
  var keywordsList = '';
  for (var index = 0; index < keywords.length; index++) {
    keywordsList += keywords [index] + ", ";
  }
  var keywordsMessage = "These are the keywords I am searching for:" + "\n" + keywordsList.slice (0, -2) + "\n" + 'Remember that a "?" signifies that I am searching for both the singular and plural versions of that word.';
  return keywordsMessage;
}

// Turn the list of categories and URL's the script is searching in into a string
function categoriesMessager () {
  var categoriesList = '';
  for (var categoryName in categories) {
    var categoryURL = categories [categoryName];
    switch ( linkSetting2.toLowerCase() ) {
      case "public":
        categoriesList += categoryName + " at " + categoryURL + '\n';
        break;
      case "private":
        categoriesList += categoryName + " at " + makePrivate (categoryURL) + '\n';
        break;
      case "both":
        categoriesList += categoryName + '\n' + "Private Link: " + makePrivate (categoryURL) + '\n' + "Public Link: " + categoryURL + '\n';
        break;
      case "none":
      case "neither":
        categoriesList += categoryName + '\n';
        break;
      default:
        throw "You did not provide a valid string for the linkSetting2 variable at the top of this file.";
    }
  }
  var categoriesMessage = "These are the PhilGEPS categories I am searching in:" + "\n" + categoriesList.slice (0, -1);
  return categoriesMessage;
}

// Finally send the message to the Slack channel what the script's parameters are, as well as reminding them to meet
function reminder () {
  var budgetRangeMessage = budgetRangeMessager();
  var keywordsMessage = keywordsMessager();
  var categoriesMessage = categoriesMessager();
  var reminderMessage = "It's Wednesday! Time to meet and talk about bids!" + "\n" + "\n" +
                          budgetRangeMessage + "\n" + "\n" +
                          keywordsMessage + "\n" + "\n" +
                          categoriesMessage + "\n" + "\n" +
                          'Remember that you can easily change my budget range, keywords, and categories by changing my *Parameters.gs* file.';
  var reminderPayload = {"text": reminderMessage};
  UrlFetchApp.fetch ('https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/xxxxxxxxxxxxxxxxxxxxxxxx', {'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify (reminderPayload) });
}

// "Turn the reminder on"
function buildReminderTrigger () {
  
  // Run every Wednesday, at 9am, plus/minus 15 minutes
  ScriptApp.newTrigger ("reminder")
    .timeBased()
    .onWeekDay (ScriptApp.WeekDay.WEDNESDAY)
    .atHour (9)
    .inTimezone ("Asia/Manila")
    .create();
}

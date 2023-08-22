//// These functions control which of the script's functions run when
//// Note that Google Apps Script time-based triggers are precise to within 15 minutes, meaning the function will run anytime from 15 minutes before to 15 minutes after intended



// Build all the triggers necessary to "turn the script on" and make it work as intended
function buildTriggers () {
  
  // Run every hour at the 45th minute, plus/minus 15 minutes
  ScriptApp.newTrigger ("opportunitiesMessager")
    .timeBased()
    .nearMinute (45)
    .everyHours (1)
    .inTimezone ("Asia/Manila")
    .create();
  
  // Run every day, at 12:15am, plus/minus 15 minutes
  ScriptApp.newTrigger ("yesterdaysLastScan")
    .timeBased()
    .atHour (0)
    .nearMinute (15)
    .everyDays (1)
    .inTimezone ("Asia/Manila")
    .create();
}

// Delete all of the script's triggers (including the Reminder.gs file's reminder trigger)
function deleteTriggers () {
  var triggers = ScriptApp.getProjectTriggers();
  for (var index = 0; index < triggers.length; index++) {
    ScriptApp.deleteTrigger (triggers [index]);
  }
}

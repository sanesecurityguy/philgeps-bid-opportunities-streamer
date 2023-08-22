//// These are just testers for the script's parse functions



var categoryNames = Object.keys (categories);

function testParseCategory0 () {
  var categoryName = categoryNames [0];
  var categoryURL = categories [categoryName];
  var test = parseCategory (categoryURL);
  for (var index = 0; index < test.length; index++ ) {
    var opportunity = test [index];
    opportunity = parseOpportunity (opportunity, categoryName);
    test [index] = opportunity;
  }
  Logger.log (test);
}

function testParseCategory1 () {
  var categoryName = categoryNames [1];
  var categoryURL = categories [categoryName];
  var test = parseCategory (categoryURL);
  for (var index = 0; index < test.length; index++ ) {
    var opportunity = test [index];
    opportunity = parseOpportunity (opportunity, categoryName);
    test [index] = opportunity;
  }
  Logger.log (test);
}

function testParseCategory2 () {
  var categoryName = categoryNames [2];
  var categoryURL = categories [categoryName];
  var test = parseCategory (categoryURL);
  for (var index = 0; index < test.length; index++ ) {
    var opportunity = test [index];
    opportunity = parseOpportunity (opportunity, categoryName);
    test [index] = opportunity;
  }
  Logger.log (test);
}

function testParseCategory3 () {
  var categoryName = categoryNames [3];
  var categoryURL = categories [categoryName];
  var test = parseCategory (categoryURL);
  for (var index = 0; index < test.length; index++ ) {
    var opportunity = test [index];
    opportunity = parseOpportunity (opportunity, categoryName);
    test [index] = opportunity;
  }
  Logger.log (test);
}

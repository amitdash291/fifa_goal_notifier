var lastHomeTeamGoal = -1;
var lastAwayTeamGoal = -1;

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
    // Send a message to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "clicked_browser_action" });
    });
});

window.setInterval(function () {
    var fixtureLink = 'https://api.football-data.org/v1/fixtures/165095';

    $.ajax({
        url: 'https://api.football-data.org/v1/fixtures',
        headers: {'X-Auth-Token' : 'a7c01923ed664f708837571c3c5fe8d4'}
    })
        .done(function (data) {
            var calculatedLink;
            var firstMatchInPlay = $.grep(data.fixtures, function (fixture, i) {
                return fixture.status === 'IN_PLAY';
            })[0];

            if (firstMatchInPlay) {
                calculatedLink = firstMatchInPlay._links.self.href;
                console.log("Calculated fixture is: " + calculatedLink);
                fixtureLink = calculatedLink;
            }
            
        })
        .fail(function (err) {
            console.log(err);
        });

    $.ajax({
        url: fixtureLink,
        headers: {'X-Auth-Token' : 'a7c01923ed664f708837571c3c5fe8d4'}
    })
        .done(
            function (data) {
                var curHomeTeamGoal = data.fixture.result.goalsHomeTeam;
                var curAwayTeamGoal = data.fixture.result.goalsAwayTeam;
                var scoreDescription = " ";

                if ((curHomeTeamGoal != lastHomeTeamGoal) || (curAwayTeamGoal != lastAwayTeamGoal)) {
                    scoreDescription = "Score of the match\n"
                        + data.fixture.homeTeamName
                        + ": " + curHomeTeamGoal
                        + ", " + data.fixture.awayTeamName
                        + ": " + curAwayTeamGoal;
                        lastHomeTeamGoal = curHomeTeamGoal;
                        lastAwayTeamGoal = curAwayTeamGoal;
                    throwGoalNotification(scoreDescription);
                }
            }
        )
}, 10000);

function throwGoalNotification(scoreDescription) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id,
            {
                "message": "goal_notification",
                "score_description": scoreDescription
            }
        );
    });
}
var lastHomeTeamGoal = -1;
var lastAwayTeamGoal = -1;
var apiKey = '';

window.onLoad = function() {
    chrome.storage.local.get('apiKey', function (data) { apiKey = data.apiKey; })
}

window.setInterval(function () {
    var fixtureLink = 'https://api.football-data.org/v1/fixtures/165095';

    $.ajax({
        url: 'https://api.football-data.org/v1/fixtures',
        headers: {'X-Auth-Token' : apiKey}
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
        headers: {'X-Auth-Token' : apiKey}
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
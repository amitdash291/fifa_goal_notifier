chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "clicked_browser_action") {
            // alert('Hello from Fifa Score Checker extension')
            // var firstHref = $("a[href^='http']").eq(0).attr("href");
            // console.log("The first external url in this page is: " + firstHref);
            console.log('Hello from Fifa Score Checker extension')
            $.ajax({
                url: 'https://api.football-data.org/v1/fixtures/165095',
                headers: {'X-Auth-Token' : 'a7c01923ed664f708837571c3c5fe8d4'}
            })
                .done(
                    function (data) {
                        console.log("Result of the match\n"
                            + data.fixture.homeTeamName
                            + ": " + data.fixture.result.goalsHomeTeam
                            + ", " + data.fixture.awayTeamName
                            + ": " + data.fixture.result.goalsAwayTeam)
                    }
                )
                .fail(function () { console.log("Failed to fetch match details") });
        } else if (request.message === "goal_notification") {
            alert("Goal!!! Go check your streaming tab.\n" + request.score_description);
        }
    }
);
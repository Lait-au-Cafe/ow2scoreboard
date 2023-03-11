'use strict'

{
    console.log(window.navigator.userAgent);

    setInterval(() => {
        $('.badge').each((index, elem) => {
            $(elem).toggleClass('flipped');
        });
    }, 10000);

    function update_score() {
        (async () => {
            const response = await fetch("http://localhost:3000/api/get_score", {
              method: 'POST'
            })
            .then((response) => response.json())
            .then((score_data) => {
                const roles = ['tank', 'dps', 'support']
                roles.forEach((role, index) => {
                    const row = $(`tr.${role}`)
                    const badge = $(`.${role} .badge img`)
                    const division = $(`.${role} .badge span`)
                    const win = $(`.${role} .win`)
                    const loss = $(`.${role} .loss`)
                    const draw = $(`.${role} .draw`)
                    
                    if(!score_data[index].is_visible) { row.addClass('hidden') }
                    else { row.removeClass('hidden') }
                    
                    badge.attr('src', `../assets/rank_badge/${score_data[index].rank.current_tier}/${score_data[index].rank.current_division}.png`)
                    
                    let tier;
                    if(score_data[index].rank.current_tier == 'grandmaster') { tier = 'GM' }
                    else { tier = score_data[index].rank.current_tier.slice(0, 1).toUpperCase() }
                    division.html(`${tier}&thinsp;${score_data[index].rank.current_division}`)

                    win.text(score_data[index].score.wins)
                    loss.text(score_data[index].score.losses)
                    draw.text(score_data[index].score.draws)
                })
            })
            .catch(e => {
              console.error(`Error occured while updating score data. : ${e}`)
            })
        })()
    }

    setInterval(update_score, 1000)
}
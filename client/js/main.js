'use strict'

{
    console.log(window.navigator.userAgent);

    setInterval(() => {
        $('.badge').each((index, elem) => {
            $(elem).toggleClass('flipped');
        });
    }, 10000);

    setInterval(() => {
        $('.score').each((index, elem) => {
            $(elem).toggleClass('flipped');
        });
    }, 20000);

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
                    const latest_wins = $(`.${role} .latest .win`)
                    const latest_losses = $(`.${role} .latest .loss`)
                    const latest_draws = $(`.${role} .latest .draw`)
                    const total_wins = $(`.${role} .total .win`)
                    const total_losses = $(`.${role} .total .loss`)
                    const total_draws = $(`.${role} .total .draw`)
                    
                    if(!score_data[index].is_visible) { row.addClass('hidden') }
                    else { row.removeClass('hidden') }
                    
                    badge.attr('src', `../assets/rank_badge/${score_data[index].rank.current_tier}/${score_data[index].rank.current_division}.png`)
                    
                    let tier;
                    if(score_data[index].rank.current_tier == 'grandmaster') { tier = 'GM' }
                    else { tier = score_data[index].rank.current_tier.slice(0, 1).toUpperCase() }
                    division.html(`${tier}&thinsp;${score_data[index].rank.current_division}`)

                    latest_wins.text(score_data[index].score.win_loss_draws[0][0])
                    latest_losses.text(score_data[index].score.win_loss_draws[0][1])
                    latest_draws.text(score_data[index].score.win_loss_draws[0][2])
                    
                    let total_wins_val = 0;
                    let total_losses_val = 0;
                    let total_draws_val = 0;
                    for(let i=0; i<score_data[index].score.win_loss_draws.length; i++) {
                        total_wins_val += score_data[index].score.win_loss_draws[i][0]
                        total_losses_val += score_data[index].score.win_loss_draws[i][1]
                        total_draws_val += score_data[index].score.win_loss_draws[i][2]
                    }

                    total_wins.text(total_wins_val)
                    total_losses.text(total_losses_val)
                    total_draws.text(total_draws_val)
                })
            })
            .catch(e => {
              console.error(`Error occured while updating score data. : ${e}`)
            })
        })()
    }

    setInterval(update_score, 1000)
}
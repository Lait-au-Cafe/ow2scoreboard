'use strict'

{
    console.log(window.navigator.userAgent);

    let badgeAndTextInterval = 10000
    function cycleBadgeAndText() {
        $('.badge').each((index, elem) => {
            $(elem).toggleClass('flipped')
        })

        badgeAndTextTimeoutId = setTimeout(cycleBadgeAndText, badgeAndTextInterval)
    }
    let badgeAndTextTimeoutId = setTimeout(cycleBadgeAndText, badgeAndTextInterval)

    let totalAndLatestInterval = 20000
    function cycleTotalAndLatest() {
        $('.score').each((index, elem) => {
            $(elem).toggleClass('flipped')
        })

        totalAndLatestTimeoutId = setTimeout(cycleTotalAndLatest, totalAndLatestInterval)
    }
    let totalAndLatestTimeoutId = setTimeout(cycleTotalAndLatest, totalAndLatestInterval)

    function update_score() {
        (async () => {
            const response = await fetch("http://localhost:3000/api/get_score", {
              method: 'POST'
            })
            .then((response) => response.json())
            .then((score_data) => {
                if(score_data !== undefined) {
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
                        
                        let tier
                        if(score_data[index].rank.current_tier == 'grandmaster') { tier = 'GM' }
                        else { tier = score_data[index].rank.current_tier.slice(0, 1).toUpperCase() }
                        division.html(`${tier}&thinsp;${score_data[index].rank.current_division}`)
    
                        latest_wins.text(score_data[index].score.win_loss_draws[0][0])
                        latest_losses.text(score_data[index].score.win_loss_draws[0][1])
                        latest_draws.text(score_data[index].score.win_loss_draws[0][2])
                        
                        let total_wins_val = 0
                        let total_losses_val = 0
                        let total_draws_val = 0
                        for(let i=0; i<score_data[index].score.win_loss_draws.length; i++) {
                            total_wins_val += score_data[index].score.win_loss_draws[i][0]
                            total_losses_val += score_data[index].score.win_loss_draws[i][1]
                            total_draws_val += score_data[index].score.win_loss_draws[i][2]
                        }
    
                        total_wins.text(total_wins_val)
                        total_losses.text(total_losses_val)
                        total_draws.text(total_draws_val)
                    })
                }
            })
            .catch(e => {
              console.error(`Error occured while updating score data. \n=> ${e}`)
            })
        })()
    }
    setInterval(update_score, 1000)

    function reflectPreference() { 
        (async () => {
            const response = await fetch("http://localhost:3000/api/get_preference", {
              method: 'POST'
            })
            .then((response) => response.json())
            .then((preference) => {
                if(preference !== undefined) {
                    // Alignment
                    if(!window.matchMedia('(max-height: 100px)').matches) {
                        const alignment = preference['display']['alignment']['vertical']
                        const alignment_value = //
                            (alignment == 'bottom') ? 'end' : 
                            (alignment == 'middle') ? 'center' : 'start'
                        $('.scoreboard tbody').css('justify-content', alignment_value)
                    }
                    else {
                        const alignment = preference['display']['alignment']['horizontal']
                        const alignment_value = //
                            (alignment == 'right') ? 'end' : 
                            (alignment == 'left') ? 'start' : 'center'
                        $('.scoreboard tbody').css('justify-content', alignment_value)
                    }
    
                    // Inetrval time
                    const interval_time = preference['display']['interval_time']
                    if(1000 * interval_time['rank_badge_text'] != badgeAndTextInterval) {
                        badgeAndTextInterval = 1000 * interval_time['rank_badge_text']
                        clearTimeout(badgeAndTextTimeoutId)
                        
                        if(badgeAndTextInterval == 0) {
                            $('.badge').each((index, elem) => {
                                $(elem).removeClass('flipped')
                            })
                        }
                        else {
                            badgeAndTextTimeoutId = setTimeout(cycleBadgeAndText, badgeAndTextInterval)
                        }
                    }
                    if(1000 * interval_time['score_total_latest'] != totalAndLatestInterval) {
                        totalAndLatestInterval = 1000 * interval_time['score_total_latest']
                        clearTimeout(totalAndLatestTimeoutId)
    
                        if(totalAndLatestInterval == 0) {
                            $('.score').each((index, elem) => {
                                $(elem).addClass('flipped')
                            })
                        }
                        else {
                            totalAndLatestTimeoutId = setTimeout(cycleTotalAndLatest, totalAndLatestInterval)
                        }
                    }

                    // Background opacity
                    $('.scoreboard tr').each((index, elem) => {
                        const color_str = $(elem).css('background-color')
                        const rgb = color_str.match(/^rgba?\((\d+), (\d+), (\d+)(, [01](\.\d+)?)?\)$/)
                        const alpha = preference['display']['background_opacity']
                        const rgba_str = `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
                        $(elem).css('background-color', rgba_str)
                    });
                }
            })
            .catch(e => {
              console.error(`Error occured while updating preference. \n=> ${e}`)
            })
        })()
    }
    setInterval(reflectPreference, 1000)
}
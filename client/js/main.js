'use strict'

;(async () => {
    console.log(window.navigator.userAgent);

    //========================================
    // Flipping
    //========================================
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

    //========================================
    // Search active port
    //========================================
    const PORT_CANDIDATES = [58080, 58081, 58082, 58083, 58084]
    const APP_IDENTIFIER = "ow2scoreboard"
    const RETRY_INTERVAL_MS = 2000
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    async function scanPortsOnce() {
        for(const port of PORT_CANDIDATES) {
            try {
                // set timeout
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort, 300)

                const response = await fetch(`http://localhost:${port}/ping`, {
                    signal: controller.signal
                })
                clearTimeout(timeoutId)

                if(response.ok) {
                    const data = await response.json()
                    if(data.app === APP_IDENTIFIER) {
                        return port
                    }
                }
            }
            catch(e) {
                // connection failed or timeout
                continue
            }
        }

        return null
    }

    async function waitForServer() {
        console.log("サーバーの起動を待機中...")

        while(true) {
            const activePort = await scanPortsOnce()
            if(!!activePort) {
                console.log(`サーバー検出: port ${activePort}`)
                return activePort
            }

            await sleep(RETRY_INTERVAL_MS)
        }
    }

    const activePort = await waitForServer()

    //========================================
    // data update (sync with controller)
    //========================================    
    function updateScore() {
        (async () => {
            try {
                const response = await fetch(`http://localhost:${activePort}/api/get_score`, {
                    method: 'POST'
                });
                const text = await response.text()

                if(text && text != "undefined") {
                    const scoresData = JSON.parse(text)
                    const roles = ['tank', 'dps', 'support']
                    roles.forEach((role, index) => {
                        const row = $(`tr.${role}`)
                        const badge = $(`.${role} .badge img`)
                        const division = $(`.${role} .badge span`)
                        const latestWinsField = $(`.${role} .latest .win`)
                        const latestLossesField = $(`.${role} .latest .loss`)
                        const latestDrawsField = $(`.${role} .latest .draw`)
                        const totalWinsField = $(`.${role} .total .win`)
                        const totalLossesField = $(`.${role} .total .loss`)
                        const totalDrawsField = $(`.${role} .total .draw`)
                        
                        if(!scoresData[index].isVisible) { row.addClass('hidden') }
                        else { row.removeClass('hidden') }
                        
                        badge.attr('src', `../assets/rank_badge/${scoresData[index].rank.currentTier}/${scoresData[index].rank.currentDivision}.svg`)
                        
                        let tier
                        if(scoresData[index].rank.currentTier == 'grandmaster') { tier = 'GM' }
                        else { tier = scoresData[index].rank.currentTier.slice(0, 1).toUpperCase() }
                        division.html(`${tier}&thinsp;${scoresData[index].rank.currentDivision}`)
    
                        latestWinsField.text(scoresData[index].score.winLossDraws[0][0])
                        latestLossesField.text(scoresData[index].score.winLossDraws[0][1])
                        latestDrawsField.text(scoresData[index].score.winLossDraws[0][2])
                        
                        let totalWins = 0
                        let totalLosses = 0
                        let totalDraws = 0
                        for(let i=0; i<scoresData[index].score.winLossDraws.length; i++) {
                            totalWins += scoresData[index].score.winLossDraws[i][0]
                            totalLosses += scoresData[index].score.winLossDraws[i][1]
                            totalDraws += scoresData[index].score.winLossDraws[i][2]
                        }
    
                        totalWinsField.text(totalWins)
                        totalLossesField.text(totalLosses)
                        totalDrawsField.text(totalDraws)
                    })

                }
            }
            catch(e) {
              console.error(`Error occured while updating score data. \n=> ${e}`)
            }
        })()
    }
    setInterval(updateScore, 1000)

    function reflectPreference() { 
        (async () => {
            try {
                const response = await fetch(`http://localhost:${activePort}/api/get_preference`, {
                method: 'POST'
                });
                const text = await response.text()

                if(text && text != "undefined") {
                    const preference = JSON.parse(text)

                    // Alignment
                    if(!window.matchMedia('(max-height: 100px)').matches) {
                        const alignment = preference.display.alignment.vertical
                        const alignmentKeyword = //
                            (alignment == 'bottom') ? 'end' : 
                            (alignment == 'middle') ? 'center' : 'start'
                        $('.scoreboard tbody').css('justify-content', alignmentKeyword)
                    }
                    else {
                        const alignment = preference.display.alignment.horizontal
                        const alignmentKeyword = //
                            (alignment == 'right') ? 'end' : 
                            (alignment == 'left') ? 'start' : 'center'
                        $('.scoreboard tbody').css('justify-content', alignmentKeyword)
                    }
    
                    // Inetrval time
                    const intervalTime = preference.display.intervalTime
                    if(1000 * intervalTime.rankBadgeAndText != badgeAndTextInterval) {
                        badgeAndTextInterval = 1000 * intervalTime.rankBadgeAndText
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
                    if(1000 * intervalTime.scoreTotalAndLatest != totalAndLatestInterval) {
                        totalAndLatestInterval = 1000 * intervalTime.scoreTotalAndLatest
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
                        const colorStr = $(elem).css('background-color')
                        const rgb = colorStr.match(/^rgba?\((\d+), (\d+), (\d+)(, [01](\.\d+)?)?\)$/)
                        const alpha = preference.display.backgroundOpacity
                        const rgbaStr = `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
                        $(elem).css('background-color', rgbaStr)
                    });
                }
            }
            catch(e) {
              console.error(`Error occured while updating preference. \n=> ${e}`)
            }
        })()
    }
    setInterval(reflectPreference, 1000)
})()
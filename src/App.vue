<template>
  <div id="overlay">
    <div class="close"><span class="material-icons-outlined">close</span></div>
    <div class="log"></div>
  </div>

  <div class="container">
    <ul class="role-menu">
      <li>
        <input type="checkbox" id="tank-visibility" class="select-visible-role" v-model="roles[0].isVisible">
        <a href="#" id="menu-tank" @click="switchTab('tank')">Tank</a>
      </li>
      <li>
        <input type="checkbox" id="dps-visibility" class="select-visible-role" v-model="roles[1].isVisible">
        <a href="#" id="menu-dps" @click="switchTab('dps')">DPS</a>
      </li>
      <li>
        <input type="checkbox" id="support-visibility" class="select-visible-role" v-model="roles[2].isVisible">
        <a href="#" id="menu-support" @click="switchTab('support')">Support</a>
      </li>
    </ul>
    <button class="setting-button"><span class="material-icons">settings</span></button>
    <section v-for="role in roles" class="control-panel" :id="role.name" :key="role.name" :class="{ active: role.name === selectedRole }">
      <section class="rank">
        <div>
          <section class="rank-preview">
            <template v-for="tier in tiers" :key="tier">
              <img v-for="division in divisions" :key="division" :class="{ active: tier === role.rank.currentTier && division === role.rank.currentDivision }" :src="imagePathBuilder(tier, division)">
            </template>
          </section>
          <section class="rank-quick-actions">
            <button class="rank-previous" :disabled="role.rank.currentTier === lowestTier && role.rank.currentDivision === lowestDivision" @click="descendRank(role)"><span class="material-icons-outlined">arrow_back_ios</span></button>
            <button class="rank-next" :disabled="role.currentTier === highestTier && role.rank.currentDivision === highestDivision" @click="ascendRank(role)"><span class="material-icons-outlined">arrow_forward_ios</span></button>
          </section>
        </div>
        <section class="rank-control">
          <fieldset class="skill-tier">
            <legend>Skill Tier</legend>
            <div v-for="tier in tiers" :key="tier">
              <input type="radio" :id="`${role.name}-tier-${tier}`" :value="tier" :name="`${role.name}-skill-tier`" v-model="role.rank.currentTier"><!--
              --><label :for="`${role.name}-tier-${tier}`">{{tier.charAt(0).toUpperCase()+tier.slice(1)}}</label>
            </div>
          </fieldset>

          <fieldset class="tier-division">
            <legend>Tier Division</legend>
            <div v-for="division in divisions" :key="division">
              <input type="radio" :id="`${role.name}-division-${division}`" :value="division" :name="`${role.name}-tier-division`" v-model="role.rank.currentDivision"><!--
              --><label :for="`${role.name}-division-${division}`">{{division}}</label>
            </div>
          </fieldset>
        </section>
      </section>

      <section class="score">
        <section class="score-quick-actions">
          <button class="score-quick-win-btn" @click="addWin(role)" :disabled="scoreButtonsCooldown">Win</button>
          <button class="score-quick-lose-btn" @click="addLoss(role)" :disabled="scoreButtonsCooldown">Lose</button>
          <button class="score-quick-draw-btn" @click="addDraw(role)" :disabled="scoreButtonsCooldown">Draw</button>
        </section>
        <section class="score-quick-actions">
          <button class="score-quick-qualify-btn" @click="addScore(role)" :disabled="role.score.winLossDraws.length <= 1 && (role.score.winLossDraws[0][0] + role.score.winLossDraws[0][1] + role.score.winLossDraws[0][2] <= 0)">{{ `${(role.score.winLossDraws[0][0] + role.score.winLossDraws[0][1] + role.score.winLossDraws[0][2] > 0) ? "" : "Undo "}Qualify` }}</button>
        </section>
        <section class="score-quick-actions-footer">
          <span class="score-update-log">Last Updated: {{dateFormatter(role.score.lastUpdated)}}</span>
        </section>
        <section class="score-control">
          <section v-for="winLossDraw in role.score.winLossDraws" :key="winLossDraw">
            <span>
              <label for="score-win">Win</label><!--
              --><input type="number" class="score-win" name="score-win" min="0" @input="updateDate(role)" v-model="winLossDraw[0]">
            </span>
            -
            <span>
              <label for="score-loss">Loss</label><!--
              --><input type="number" class="score-loss" name="score-loss" min="0" @input="updateDate(role)" v-model="winLossDraw[1]">
            </span>
            -
            <span>
              <label for="score-draw">Draw</label><!--
              --><input type="number" class="score-draw" name="score-draw" min="0" @input="updateDate(role)" v-model="winLossDraw[2]">
            </span>
          </section>
        </section>
        <section class="score-footer">
          <button class="score-clear-all-btn" @click="clearScore(role)">{{`Clear ${role.name}'s score`}}</button>
        </section>
      </section>
    </section>

    <section class="setting-overlay hidden">
      <button class="close-button"><span class="material-icons-outlined">close</span></button>
      <div>
        <section>
          <h1>表示設定 (Display)</h1>
          <fieldset class="alignment">
            <legend>コンテンツの揃え (Alignment)</legend>
            <fieldset>
              <legend>縦並べ表示 (Vertical layout)</legend>
              <input type="radio" name="vertical-align" id="top" value="top" v-model="preference.display.alignment.vertical">
              <label for="top"><span class="material-icons-outlined">align_vertical_top</span></label>
              <input type="radio" name="vertical-align" id="middle" value="middle" v-model="preference.display.alignment.vertical">
              <label for="middle"><span class="material-icons-outlined">align_vertical_center</span></label>
              <input type="radio" name="vertical-align" id="bottom" value="bottom" v-model="preference.display.alignment.vertical">
              <label for="bottom"><span class="material-icons-outlined">align_vertical_bottom</span></label>
            </fieldset>
            <fieldset>
              <legend>横並べ表示 (Horizontal layout)</legend>
              <input type="radio" name="horizontal-align" id="left" value="left" v-model="preference.display.alignment.horizontal">
              <label for="left"><span class="material-icons-outlined">align_horizontal_left</span></label>
              <input type="radio" name="horizontal-align" id="center" value="center" v-model="preference.display.alignment.horizontal">
              <label for="center"><span class="material-icons-outlined">align_horizontal_center</span></label>
              <input type="radio" name="horizontal-align" id="right" value="right" v-model="preference.display.alignment.horizontal">
              <label for="right"><span class="material-icons-outlined">align_horizontal_right</span></label>
            </fieldset>
          </fieldset>
          <fieldset class="interval-time">
            <legend>切り替えの時間間隔 (Interval time)</legend>
            <label>Rank badge & text: </label><!--
            --><input type="number" v-model="preference.display.intervalTime.rankBadgeAndText">秒(sec)<br>
            <label>Score TOTAL & LATEST: </label><!--
            --><input type="number" v-model="preference.display.intervalTime.scoreTotalAndLatest">秒(sec)
          </fieldset>
          <fieldset class="background-opacity">
            <legend>背景の不透明度 (Background opacity)</legend>
            <input type="range" min="0" max="1" step="0.1" list="bg-opacity-markers" v-model="preference.display.backgroundOpacity"><input type="number" min="0" max="1" step="0.01" v-model="preference.display.backgroundOpacity">
            <datalist id="bg-opacity-markers">
              <option value="0.0"></option>
              <option value="0.1"></option>
              <option value="0.2"></option>
              <option value="0.3"></option>
              <option value="0.4"></option>
              <option value="0.5"></option>
              <option value="0.6"></option>
              <option value="0.7"></option>
              <option value="0.8"></option>
              <option value="0.9"></option>
              <option value="1.0"></option>
            </datalist>
          </fieldset>
        </section>
      </div>
    </section>
  </div>
</template>

<script>

// eslint-disable-next-line
function updateScores(score) {
  (async () => {
    // eslint-disable-next-line
    const response = await fetch("http://localhost:3000/api/set_score", {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify(score)
    }).catch(e => {
      const line = document.createElement('p')
      line.innerText = `Error occured while updating score data. ${e}`
      document.querySelector('#overlay .log').appendChild(line)
      document.querySelector('#overlay').classList.add('show')
      console.error(`Error occured while updating score data. : ${e}`)
    })
  })();
}

// eslint-disable-next-line
function updatePreference(preference) {
  (async () => {
    // eslint-disable-next-line
    const response = await fetch("http://localhost:3000/api/set_preference", {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify(preference)
    }).catch(e => {
      const line = document.createElement('p')
      line.innerText = `Error occured while updating preference. ${e}`
      document.querySelector('#overlay .log').appendChild(line)
      document.querySelector('#overlay').classList.add('show')
      console.error(`Error occured while updating preference. : ${e}`)
    })
  })();
}

function initializeScores() {
  const scoresData = []
  for(const role of ['tank', 'dps', 'support']) {
    scoresData.push({
      name: role, 
      isVisible: true,
      rank: {
        currentTier: 'bronze', 
        currentDivision: 5
      }, 
      score: {
        winLossDraws: [[0, 0, 0]], 
        lastUpdated: undefined
      }
    })
  }
  return scoresData
}

export default {
  name: 'App',
  components: {}, 
  data: function() {
    return {
      scoreButtonsCooldown: false,
      selectedRole: "tank", 
      roles: initializeScores(), 
      tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'], 
      divisions: [5, 4, 3, 2, 1], 
      preference: {
        display: {
          alignment: {
            vertical: 'top', 
            horizontal: 'center', 
          }, 
          intervalTime: {
            rankBadgeAndText: 10, 
            scoreTotalAndLatest: 20, 
          }, 
          backgroundOpacity: 1.0, 
        }, 
      },
    }
  }, 
  computed: {
    lowestTier: function() { return this.tiers[0] }, 
    highestTier: function() { return this.tiers.slice(-1)[0] }, 
    lowestDivision: function() { return this.divisions[0] }, 
    highestDivision: function() { return this.divisions.slice(-1)[0] }
  }, 
  methods: {
    imagePathBuilder: function(tier, division) {
      return require(`../assets/rank_badge/${tier}/${division}.png`)
    },
    switchTab: function(role) {
      this.selectedRole = role
    }, 
    ascendRank: function(role) {
      let tierIndex = this.tiers.indexOf(role.rank.currentTier)
      let divisionIndex = this.divisions.indexOf(role.rank.currentDivision)

      if(tierIndex < 0 || divisionIndex < 0) { return }

      if(divisionIndex < this.divisions.length - 1) {
        role.rank.currentDivision = this.divisions[divisionIndex + 1]
      }
      else {
        if(tierIndex >= this.tiers.length - 1) { return }

        role.rank.currentTier = this.tiers[tierIndex + 1]
        role.rank.currentDivision = this.divisions[0]
      }
    }, 
    descendRank: function(role) {
      let tierIndex = this.tiers.indexOf(role.rank.currentTier)
      let divisionIndex = this.divisions.indexOf(role.rank.currentDivision)

      if(tierIndex < 0 || divisionIndex < 0) { return }

      if(divisionIndex > 0) {
        role.rank.currentDivision = this.divisions[divisionIndex - 1]
      }
      else {
        if(tierIndex == 0) { return }

        role.rank.current_tier = this.tiers[tierIndex - 1]
        role.rank.currentDivision = this.divisions[this.divisions.length - 1]
      }
    }, 
    addWin: function(role) {
      this.scoreButtonsCooldown = true
      role.score.winLossDraws[0][0] += 1
      this.updateDate(role)
      setTimeout(() => { this.scoreButtonsCooldown = false }, 500)
    }, 
    addLoss: function(role) {
      this.scoreButtonsCooldown = true
      role.score.winLossDraws[0][1] += 1
      this.updateDate(role)
      setTimeout(() => { this.scoreButtonsCooldown = false }, 500)
    }, 
    addDraw: function(role) {
      this.scoreButtonsCooldown = true
      role.score.winLossDraws[0][2] += 1
      this.updateDate(role)
      setTimeout(() => { this.scoreButtonsCooldown = false }, 500)
    }, 
    addScore: function(role) {
      const is_qualify = role.score.winLossDraws[0][0]+role.score.winLossDraws[0][1]+role.score.winLossDraws[0][2] > 0;
      role.score.winLossDraws = role.score.winLossDraws.filter(score => score[0]+score[1]+score[2]>0)
      if(is_qualify) {
        role.score.winLossDraws.unshift([0, 0, 0])
      }
    }, 
    clearScore: function(role) {
      if(!confirm(`Are you sure you want to clear the score of ${role.name}?`)) { return }
      role.score.winLossDraws = [[0, 0, 0]]
    }, 
    updateDate(role) {
      role.score.lastUpdated = new Date()
    }, 
    dateFormatter: function(date) {
      if(date === undefined) { return "" }

      const year = date.getFullYear()
      const month = ("00" + (date.getMonth() + 1)).slice(-2)
      const day = ("00" + date.getDate()).slice(-2)
      const hours = ("00" + date.getHours()).slice(-2)
      const minutes = ("00" + date.getMinutes()).slice(-2)
      const seconds = ("00" + date.getSeconds()).slice(-2)
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
    }
  }, 
  watch: {
    roles: {
      // eslint-disable-next-line
      handler: function(new_value, old_value) {
        updateScores(new_value)
      }, 
      deep: true, 
    }, 
    preference: {
      // eslint-disable-next-line
      handler: function(new_value, old_value) {
        updatePreference(new_value)
      }, 
      deep: true, 
    }, 
  }, 
  mounted: function() {
    // Set EventListenrs
    const overlayCloseBtn = document.querySelector('#overlay .close')
    overlayCloseBtn.addEventListener('click', () => {
      document.querySelector('#overlay').classList.remove('show')
    });

    const settingBtn = document.querySelector('.setting-button')
    settingBtn.addEventListener('click', () => {
      document.querySelector('.setting-overlay').classList.toggle('hidden')
      settingBtn.classList.toggle('activated')
    });
    
    const settingCloseBtn = document.querySelector('.setting-overlay .close-button')
    settingCloseBtn.addEventListener('click', () => {
      document.querySelector('.setting-overlay').classList.add('hidden')
      settingBtn.classList.remove('activated')
    });

    (async () => {
      // Retrieve scores. 
      const retrievedScores = await window.electronAPI.retrieveScores()
      if(retrievedScores !== undefined) { this.roles = retrievedScores }

      // Retrieve preferences. 
      const retrievedPreference = await window.electronAPI.retrievePreference()
      if(retrievedPreference !== undefined) { this.preference = retrievedPreference }
    })();
  }
}

</script>

<style src="./styles.css" scoped></style>
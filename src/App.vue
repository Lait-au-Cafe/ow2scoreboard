<template>
  <div id="overlay">
    <div class="close"><span class="material-icons-outlined">close</span></div>
    <div class="log"></div>
  </div>

  <div class="container">
    <ul class="role-menu">
      <li>
        <input type="checkbox" id="tank-visibility" class="select-visible-role" v-model="roles[0].is_visible">
        <a href="#" id="menu-tank" @click="switch_tab('tank')">Tank</a>
      </li>
      <li>
        <input type="checkbox" id="dps-visibility" class="select-visible-role" v-model="roles[1].is_visible">
        <a href="#" id="menu-dps" @click="switch_tab('dps')">DPS</a>
      </li>
      <li>
        <input type="checkbox" id="support-visibility" class="select-visible-role" v-model="roles[2].is_visible">
        <a href="#" id="menu-support" @click="switch_tab('support')">Support</a>
      </li>
    </ul>
    <button class="setting-button"><span class="material-icons">settings</span></button>
    <section v-for="role in roles" class="control-panel" :id="role.name" :key="role.name" :class="{ active: role.name === selected_role }">
      <section class="rank">
        <div>
          <section class="rank-preview">
            <template v-for="tier in tiers" :key="tier">
              <img v-for="division in divisions" :key="division" :class="{ active: tier === role.rank.current_tier && division === role.rank.current_division }" :src="image_path_builder(tier, division)">
            </template>
          </section>
          <section class="rank-quick-actions">
            <button class="rank-previous" :disabled="role.rank.current_tier === lowest_tier && role.rank.current_division === lowest_division" @click="descend_rank(role)"><span class="material-icons-outlined">arrow_back_ios</span></button>
            <button class="rank-next" :disabled="role.current_tier === highest_tier && role.rank.current_division === highest_division" @click="ascend_rank(role)"><span class="material-icons-outlined">arrow_forward_ios</span></button>
          </section>
        </div>
        <section class="rank-control">
          <fieldset class="skill-tier">
            <legend>Skill Tier</legend>
            <div v-for="tier in tiers" :key="tier">
              <input type="radio" :id="`${role.name}-tier-${tier}`" :value="tier" :name="`${role.name}-skill-tier`" v-model="role.rank.current_tier"><!--
              --><label :for="`${role.name}-tier-${tier}`">{{tier.charAt(0).toUpperCase()+tier.slice(1)}}</label>
            </div>
          </fieldset>

          <fieldset class="tier-division">
            <legend>Tier Division</legend>
            <div v-for="division in divisions" :key="division">
              <input type="radio" :id="`${role.name}-division-${division}`" :value="division" :name="`${role.name}-tier-division`" v-model="role.rank.current_division"><!--
              --><label :for="`${role.name}-division-${division}`">{{division}}</label>
            </div>
          </fieldset>
        </section>
      </section>

      <section class="score">
        <section class="score-quick-actions">
          <button class="score-quick-win-btn" @click="add_win(role)" :disabled="score_buttons_cooldown">Win</button>
          <button class="score-quick-lose-btn" @click="add_loss(role)" :disabled="score_buttons_cooldown">Lose</button>
          <button class="score-quick-draw-btn" @click="add_draw(role)" :disabled="score_buttons_cooldown">Draw</button>
        </section>
        <section class="score-quick-actions">
          <button class="score-quick-qualify-btn" @click="add_score(role)" :disabled="role.score.win_loss_draws.length <= 1 && (role.score.win_loss_draws[0][0] + role.score.win_loss_draws[0][1] + role.score.win_loss_draws[0][2] <= 0)">{{ `${(role.score.win_loss_draws[0][0] + role.score.win_loss_draws[0][1] + role.score.win_loss_draws[0][2] > 0) ? "" : "Undo "}Qualify` }}</button>
        </section>
        <section class="score-quick-actions-footer">
          <span class="score-update-log">Last Updated: {{date_formatter(role.score.last_updated)}}</span>
        </section>
        <section class="score-control">
          <section v-for="win_loss_draw in role.score.win_loss_draws" :key="win_loss_draw">
            <span>
              <label for="score-win">Win</label><!--
              --><input type="number" class="score-win" name="score-win" min="0" @input="update_date(role)" v-model="win_loss_draw[0]">
            </span>
            -
            <span>
              <label for="score-loss">Loss</label><!--
              --><input type="number" class="score-loss" name="score-loss" min="0" @input="update_date(role)" v-model="win_loss_draw[1]">
            </span>
            -
            <span>
              <label for="score-draw">Draw</label><!--
              --><input type="number" class="score-draw" name="score-draw" min="0" @input="update_date(role)" v-model="win_loss_draw[2]">
            </span>
          </section>
        </section>
        <section class="score-footer">
          <button class="score-clear-all-btn" @click="clear_score(role)">{{`Clear ${role.name}'s score`}}</button>
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
            --><input type="number" v-model="preference.display.interval_time.rank_badge_text">秒(sec)<br>
            <label>Score TOTAL & LATEST: </label><!--
            --><input type="number" v-model="preference.display.interval_time.score_total_latest">秒(sec)
          </fieldset>
          <fieldset class="background-opacity">
            <legend>背景の不透明度 (Background opacity)</legend>
            <input type="range" min="0" max="1" step="0.1" list="bg-opacity-markers" v-model="preference.display.background_opacity"><input type="number" min="0" max="1" step="0.01" v-model="preference.display.background_opacity">
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
function update_score(score) {
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
function update_preference(preference) {
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

function initialize_score() {
  const score_data = []
  for(const role of ['tank', 'dps', 'support']) {
    score_data.push({
      name: role, 
      is_visible: true,
      rank: {
        current_tier: 'bronze', 
        current_division: 5
      }, 
      score: {
        win_loss_draws: [[0, 0, 0]], 
        last_updated: undefined
      }
    })
  }
  return score_data
}

export default {
  name: 'App',
  components: {}, 
  data: function() {
    return {
      score_buttons_cooldown: false,
      selected_role: "tank", 
      roles: initialize_score(), 
      tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'], 
      divisions: [5, 4, 3, 2, 1], 
      preference: {
        display: {
          alignment: {
            vertical: 'top', 
            horizontal: 'center', 
          }, 
          interval_time: {
            rank_badge_text: 10, 
            score_total_latest: 20, 
          }, 
          background_opacity: 1.0, 
        }, 
      },
    }
  }, 
  computed: {
    lowest_tier: function() { return this.tiers[0] }, 
    highest_tier: function() { return this.tiers.slice(-1)[0] }, 
    lowest_division: function() { return this.divisions[0] }, 
    highest_division: function() { return this.divisions.slice(-1)[0] }
  }, 
  methods: {
    image_path_builder: function(tier, division) {
      return require(`../assets/rank_badge/${tier}/${division}.png`)
    },
    switch_tab: function(role) {
      this.selected_role = role
    }, 
    ascend_rank: function(role) {
      let tier_index = this.tiers.indexOf(role.rank.current_tier)
      let division_index = this.divisions.indexOf(role.rank.current_division)

      if(tier_index < 0 || division_index < 0) { return }

      if(division_index < this.divisions.length - 1) {
        role.rank.current_division = this.divisions[division_index + 1]
      }
      else {
        if(tier_index >= this.tiers.length - 1) { return }

        role.rank.current_tier = this.tiers[tier_index + 1]
        role.rank.current_division = this.divisions[0]
      }
    }, 
    descend_rank: function(role) {
      let tier_index = this.tiers.indexOf(role.rank.current_tier)
      let division_index = this.divisions.indexOf(role.rank.current_division)

      if(tier_index < 0 || division_index < 0) { return }

      if(division_index > 0) {
        role.rank.current_division = this.divisions[division_index - 1]
      }
      else {
        if(tier_index == 0) { return }

        role.rank.current_tier = this.tiers[tier_index - 1]
        role.rank.current_division = this.divisions[this.divisions.length - 1]
      }
    }, 
    add_win: function(role) {
      this.score_buttons_cooldown = true
      role.score.win_loss_draws[0][0] += 1
      this.update_date(role)
      setTimeout(() => { this.score_buttons_cooldown = false }, 500)
    }, 
    add_loss: function(role) {
      this.score_buttons_cooldown = true
      role.score.win_loss_draws[0][1] += 1
      this.update_date(role)
      setTimeout(() => { this.score_buttons_cooldown = false }, 500)
    }, 
    add_draw: function(role) {
      this.score_buttons_cooldown = true
      role.score.win_loss_draws[0][2] += 1
      this.update_date(role)
      setTimeout(() => { this.score_buttons_cooldown = false }, 500)
    }, 
    add_score: function(role) {
      const is_qualify = role.score.win_loss_draws[0][0]+role.score.win_loss_draws[0][1]+role.score.win_loss_draws[0][2] > 0;
      role.score.win_loss_draws = role.score.win_loss_draws.filter(score => score[0]+score[1]+score[2]>0)
      if(is_qualify) {
        role.score.win_loss_draws.unshift([0, 0, 0])
      }
    }, 
    clear_score: function(role) {
      if(!confirm(`Are you sure you want to clear the score of ${role.name}?`)) { return }
      role.score.win_loss_draws = [[0, 0, 0]]
    }, 
    update_date(role) {
      role.score.last_updated = new Date()
    }, 
    date_formatter: function(date) {
      if(!date) { return "" }

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
        update_score(new_value)
      }, 
      deep: true, 
    }, 
    preference: {
      // eslint-disable-next-line
      handler: function(new_value, old_value) {
        update_preference(new_value)
      }, 
      deep: true, 
    }, 
  }, 
  mounted: function() {
    // Set EventListenrs
    const overlay_close_btn = document.querySelector('#overlay .close')
    overlay_close_btn.addEventListener('click', () => {
      document.querySelector('#overlay').classList.remove('show')
    });

    const setting_btn = document.querySelector('.setting-button')
    setting_btn.addEventListener('click', () => {
      document.querySelector('.setting-overlay').classList.toggle('hidden')
      setting_btn.classList.toggle('activated')
    });
    
    const setting_close_btn = document.querySelector('.setting-overlay .close-button')
    setting_close_btn.addEventListener('click', () => {
      document.querySelector('.setting-overlay').classList.add('hidden')
      setting_btn.classList.remove('activated')
    });

    (async () => {
      // Retrieve scores. 
      const retrieved_score = await window['electronAPI'].retrieve_score()
      if(retrieved_score !== undefined) { this.roles = retrieved_score }

      // Retrieve preferences. 
      const retrieved_preference = await window['electronAPI'].retrieve_preference()
      if(retrieved_preference !== undefined) { this.preference = retrieved_preference }
    })();
  }
}

</script>

<style src="./styles.css" scoped></style>
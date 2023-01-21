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
        <section class="score-quick-actions-footer">
          <span class="score-update-log">Last Updated: {{date_formatter(role.score.last_updated)}}</span>
        </section>
        <section class="score-control">
          <span>
            <label for="score-win">Win</label><!--
            --><input type="number" class="score-win" name="score-win" min="0" @input="update_date(role)" v-model="role.score.wins">
          </span>
          -
          <span>
            <label for="score-loss">Loss</label><!--
            --><input type="number" class="score-loss" name="score-loss" min="0" @input="update_date(role)" v-model="role.score.losses">
          </span>
          -
          <span>
            <label for="score-draw">Draw</label><!--
            --><input type="number" class="score-draw" name="score-draw" min="0" @input="update_date(role)" v-model="role.score.draws">
          </span>
        </section>
        <section class="score-footer">
          <button class="score-clear-all-btn" @click="clear_score(role)">{{`Clear ${role.name}'s score`}}</button>
        </section>
      </section>
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
        wins: 0, 
        losses: 0, 
        draws: 0, 
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
      divisions: [5, 4, 3, 2, 1]
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
      role.score.wins += 1
      this.update_date(role)
      setTimeout(() => { this.score_buttons_cooldown = false }, 500)
    }, 
    add_loss: function(role) {
      this.score_buttons_cooldown = true
      role.score.losses += 1
      this.update_date(role)
      setTimeout(() => { this.score_buttons_cooldown = false }, 500)
    }, 
    add_draw: function(role) {
      this.score_buttons_cooldown = true
      role.score.draws += 1
      this.update_date(role)
      setTimeout(() => { this.score_buttons_cooldown = false }, 500)
    }, 
    clear_score: function(role) {
      if(!confirm(`Are you sure you want to clear the score of ${role.name}?`)) { return }
      role.score.wins = 0
      role.score.losses = 0
      role.score.draws = 0
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
      deep: true
    }
  }, 
  mounted: function() {
    // Set EventListenrs
    const overlay_close_btn = document.querySelector('#overlay .close');
    overlay_close_btn.addEventListener('click', () => {
      document.querySelector('#overlay').classList.remove('show');
    });

    // Retrieve scores. 
    (async () => {
      const retrieved_score = await window.electronAPI.retrieve_score()
      if(retrieved_score) {
        for(let i = 0; i < retrieved_score.length; i++) {
          const date = retrieved_score[i].score.last_updated
          if(date) { retrieved_score[i].score.last_updated = new Date(date) }
        }
        this.roles = retrieved_score
      }
    })();
  }
}

</script>

<style src="./styles.css" scoped></style>
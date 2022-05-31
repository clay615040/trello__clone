<template>
  <div class="vueCircleProgress">
    <vue-circle
    :progress="1"
    :size="90"
    :reverse="false"
    line-cap="round"
    :fill="fill"
    empty-fill="white"
    :animation-start-value="0.0"
    :start-angle="Math.PI * 1.5"
    insert-mode="append"
    :thickness="9"
    :show-percent="true"
  >
  </vue-circle>
  <p>loading<span v-for="i of this.commaValue%4" :key="i">.</span></p>
  </div>
</template>

<script>
import VueCircle from "vue2-circle-progress"

export default {
  name: "VueCircle",

  props: {
    msg: String
  },

  components: {
    'vue-circle': VueCircle
  },

  mounted() {
    this.commaTime = window.setInterval(() => {
      this.commaValue = this.commaValue + 1
    }, 1000)
  },

  data() {
    return {
      fill: { color: '#004472' },
      commaValue: 2,
      commaTime: function() { return '' },
    }
  },

  destroyed() {
    window.clearInterval(this.commaTime)
  },
}
</script>

<style lang="scss">
  .vueCircleProgress .percent-text {
    color: #004472;
  }

  .vueCircleProgress p {
    margin-top: 4px;
    color: #004472;
    text-align: center;
    font-weight: 700;
    font-size: 20px;
  }
</style>

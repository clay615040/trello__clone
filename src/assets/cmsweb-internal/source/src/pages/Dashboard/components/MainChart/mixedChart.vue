<template>
  <apexchart type="line" :height="400" :options="chartOptions" :series="chartData"></apexchart>
</template>

<script>
import Widget from '@/components/Widget/Widget'

export default {
  name: 'mixedChart',

  components: { Widget },

  props: {
    title: { default: '' },
    height: { default: 400 },
    chartData: { default: [] },
    chartOptions: { default: {} },
    fetchingData: { type: Boolean, default: false },
  },
}
</script>
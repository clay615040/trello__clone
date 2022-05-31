<template>
  <Widget :title="title" close collapse customHeader>
    <apexchart type="pie" height="400" :series="data" :options="options"/>
  </Widget>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import { Chart } from 'highcharts-vue';

export default {
  name: 'PieChart',
  components: { Widget, highcharts: Chart },
  data() {
    return {
      options: {
        legend: {
          labels: {
            colors: ["#495057"]
          }
        },
        series: [],
        labels: this.labels,
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 400
            },
            legend: {
              position: 'bottom'
            }
          }
        }],
        stroke: {
          show: false,
          width: 0
        },
        colors: [ '#005792', '#0D7ADD', '#1A9FE3', '#368195', '#3E98AF', 
                  '#4BACC6', '#21AE8C', '#FD5F00', '#FDA700', '#FFC90E', 
                  '#FFF606' ],
        tooltip: {
          y: [
            {
              formatter: function (y) {
                return y
              }
            }
          ],
        },
      }
    }
  },
  props: {
    title: {default: ''},
    data: {default: []},
    labels: {default: []},
    fetchingData: {type: Boolean, default: false},
  },
}
</script>

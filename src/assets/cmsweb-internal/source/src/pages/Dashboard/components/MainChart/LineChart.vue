<template>
  <Widget bodyClass="mt" class="mb-4" customHeader>
    <div :id="chartId"></div>
  </Widget>
</template>

<script>

import Highcharts from 'highcharts'
import moment from 'moment'

export default {
  name: 'LineChart',

  data() {
    return {
      chartOptions: {
        credits: {
          enabled: false
        },
        chart: {
          id: 'lineChart',
          height: this.chartHeight
        },
        title: false,
        exporting: {
          enabled: false
        },
        legend: {
          verticalAlign: 'top'
        },
        xAxis: {
          type: this.xType,
          labels: {
            show: true,
            formatter(value, timestamp, opts) {
              return value.tickPositionInfo.unitName === 'month' ? moment(new Date(value.value)).format('MMM') : moment(new Date(value.value)).format('DD. MMM')
            }
          }
        },
        yAxis: {
          title: {
            text: this.yTitle,
            rotation: 0,
          },
        },
        annotations: {
          visible: false
        },
        plotOptions: {
          series: {
            marker: {
              enabled: true,
              symbol: 'circle'
            },  
            tooltip: {
              pointFormatter() {
                return `<span class='fw-semi-bold' style="color: ${this.color}">
                      ${this.series.name} ${this.y.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}
                      </span>`
              }
            }
          }
        }
      },
      chartData: [],
    }
  },
  props: {
    title: {default: ''},
    chartId: {default: 'main-chart'},
    data: {default: []},
    chartHeight: {default: 350},
    xType: {default: 'datetime'},
    yTitle: {default: undefined},
  },

  created() {
    this.setChartData()
  },

  watch: {
    '$i18n.locale'() {
      this.setChartData()
      this.init()
    },
  },

  mounted() {
    Highcharts.chart(this.chartId, this.chartOptions)
  },

  methods: {
    setChartData() {
      this.chartData = this.chartOptions
      this.chartData.series = this.data
    },
    init() {
      var chart = Highcharts.chart(this.chartId, this.chartOptions)
      chart.render()
    }
  },  
};
</script>

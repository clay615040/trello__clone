<template>
  <Widget id="main-chart" bodyClass="mt" class="mb-xlg" 
    :title="title" :fetchingData="fetchingData" customHeader>
    <highcharts :options="chartData"></highcharts>
  </Widget>
</template>

<script>
import Widget from '@/components/Widget/Widget'
import { Chart } from 'highcharts-vue'
import i18n from '../../../../locales'

export default {
  name: 'MainChart',
  components: { Widget, highcharts: Chart },
  data() {
    return {
      chartOptions: {
        credits: {
          enabled: false
        },
        chart: {
          height: 350
        },
        title: false,
        exporting: {
          enabled: false
        },
        legend: {
          verticalAlign: 'top'
        },
        yAxis: {
          title: false
        },
        xAxis: {
          type: 'datetime',
          labels: {
            overflow: 'justify'
          }
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
                      ${this.series.name} : ${this.y.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}
                      </span>`
              }
            }
          },
        }
      },
    }
  },
  props: {
    title: {default: ''},
    data: {default: []},
    fetchingData: {type: Boolean, default: false},
  },
  computed: {
    chartData() {
      let bet = this.data.map(item => {
        return [Date.parse(item.date), parseFloat(item.total_bet)]
      })
      let win = this.data.map(item => {
        return [Date.parse(item.date), parseFloat(item.total_win)]
      })
      return {
        ...this.chartOptions,
        series: [
          {
            'type': 'spline',
            'name': i18n.t('總投注'),
            'data': bet,
            'color': this.appConfig.colors.info,
          },
          {
            'type': 'spline',
            'name': i18n.t('總贏分'),
            'data': win,
            'color': this.appConfig.colors.danger
          }
        ]
      }
    }
  },
};
</script>

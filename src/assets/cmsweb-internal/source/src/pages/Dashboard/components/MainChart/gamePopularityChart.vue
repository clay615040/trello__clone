<template>
  <Widget :title="title" close collapse customHeader>
    <apexchart type="line" ref="chart" height="400" :series="chartData" :options="options"/>
  </Widget>
</template>

<script>
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import { numberFormat, numberToSiNumber } from '@/helper'

export default {
  name: 'gamePopularityChart',

  components: { Widget },
  
  data() {
    return {
      options: {
        dataLabels: {
          enabled: false
        },
        colors: ['#21AE8C', '#005792', '#1A86D0'],
        stroke: {
          width: [2, 1, 1]
        },
        chart: {
          id: 'mixedChart',
          zoom: { 
            enabled: false
          },
          toolbar: {
            show: false,
            tools: {
              download: false,
            },
          }
        },
        xaxis: {
          labels: {
            style: {
              colors: '#8EA1AB'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
        },
        yaxis: [
          {
            seriesName: 'time_avg',
            opposite: false,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#21AE8C'
            },
            labels: {
              style: {
                color: '#21AE8C',
              },
              formatter(val) {
                return numberToSiNumber(val)
              }
            },
            title: {
              text: i18n.t('分鐘'),
              style: {
                color: '#21AE8C',
              }
            },
            decimalsInFloat: 0,
          },
          {
            seriesName: 'players_dup',
            opposite: true,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#005792'
            },
            labels: {
              style: {color: '#005792'},
              formatter: function (val) {
                return numberToSiNumber(val)
              }
            },
            decimalsInFloat: 0,
          },
          {
            seriesName: 'players_not_dup',
            opposite: true,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#1A86D0'
            },
            labels: {
              style: {color: '#1A86D0'},
              formatter: function (val) {
                if (val >= 10 ** 3 && val < 10 ** 6) {
                  val = (val / 1000).toFixed(0) + 'K'
                } else if (val >= 10 ** 6 && val < 10 ** 9) {
                  val = (val / 1000000).toFixed(0) + 'M'
                } else if (val >= 10 ** 9 && val < 10 ** 12) {
                  val = (val / 1000000000).toFixed(0) + 'G'
                } else if (val >= 10 ** 12) {
                  val = (val / 1000000000000).toFixed(0) + 'T'
                }
                return val
              }
            },
            title: {
              text: i18n.t('人數'),
              style: {
                color: '#1A86D0',
              }
            },
            decimalsInFloat: 0,
          }
        ],
        tooltip: {
          fixed: {
            enabled: true,
            position: 'topLeft',
            offsetY: 30,
            offsetX: 60
          },
          y: [
            {
              formatter(y) {
                return numberFormat(y, 2)
              }
            },
            {
              formatter(y) {
                return numberFormat(y, 0)
              }
            },
            {
              formatter(y) {
                return numberFormat(y, 0)
              }
            }
          ]
        },
        legend: {
          horizontalAlign: 'center',
          position: 'top',
          offsetX: -20,
          labels: {
            colors: ['#495057']
          },
        }
      },
    }
  },

  props: {
    title: {default: ''},
    chartData: {default: []},
    fetchingData: {type: Boolean, default: false},
  },

  watch: {
    '$i18n.locale'() {
      this.init()
    },
  },

  methods: {
    init() {
      ApexCharts.exec('mixedChart', 'updateOptions', {
        yaxis: [
          {
            seriesName: 'time_avg',
            opposite: false,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#21AE8C'
            },
            labels: {
              style: {
                color: '#21AE8C',
              }
            },
            title: {
              text: i18n.t('分鐘'),
              style: {
                color: '#21AE8C',
              }
            },
            decimalsInFloat: 2,
          },
          {
            seriesName: 'players_dup',
            opposite: true,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#005792'
            },
            labels: {
              style: {color: '#005792'},
            },
            decimalsInFloat: 0,
          },
          {
            seriesName: 'players_not_dup',
            opposite: true,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#1A86D0'
            },
            labels: {
              style: {color: '#1A86D0'},
            },
            title: {
              text: i18n.t('人數'),
              style: {
                color: '#1A86D0',
              }
            },
            decimalsInFloat: 0,
          }
        ],
      })
    }
  },
}
</script>

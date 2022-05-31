<template>
  <Widget :title="title" close collapse customHeader class="columnTitle">
    <apexchart type="bar" height="500" :series="chartData" :options="options"/>
  </Widget>
</template>

<script>
import Widget from '@/components/Widget/Widget'
import { Chart } from 'highcharts-vue'
import config from '@/config'
import moment from 'moment'
import { numberFormat } from '@/helper'

const {textColor} = config.app.colors
const {axisColor} = config.app.chartColors

export default {
  name: 'ColumnChart',

  components: { Widget, highcharts: Chart },

  data() {
    return {
      options: {
        colors: [ 
          '#005792', '#0D7ADD', '#1A9FE3', '#368195', '#3E98AF', 
          '#4BACC6', '#21AE8C', '#FD5F00', '#FDA700', '#FFC90E', 
          '#FFF606', '#BF9000', '#7F6000', '#ADB9CA', '#C3D6E9',
          '#003060', '#003D79', '#004B97', '#005AB5', 
          '#0066CC', '#0072E3', '#0080FF', '#2894FF', '#46A3FF', 
          '#66B3FF', '#84C1FF', '#97CBFF', '#ACD6FF', '#C4E1FF', 
          '#D2E9FF', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', 
          '#000000', '#808080', '#008000', '#800000', '#000080', 
          '#808000', '#800080', '#c0c0c0', '#ffffff', '#008080',
        ],
        chart: {
          type: 'bar',
          stacked: this.stacked,
          toolbar: {
            show: false,
            tools: {
              download: false,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
            },
          }
        },
        plotOptions: {
          bar: {
            dataLabels: {
              position: 'center', // top, center, bottom
            },
          }
        },
        grid: {
          padding: {
            left: 30, // or whatever value that works
            right: 30 // or whatever value that works
          }
        },
        xaxis: {
          type: 'category',
          position: 'bottom',
          tickPlacement: 'between',
          axisBorder: {
            show: true,
          },
          axisTicks: {
            show: false,
            borderType: 'solid',
            color: '#78909C',
          },
          crosshairs: {
            show: false,
          },
          labels: {
            show: true,
            // format: 'MMM',
            style: {
              colors: axisColor,
            },
            datetimeFormatter: {
                year: 'yyyy',
                month: 'MMM',
                day: 'dd.MMM',
                hour: 'dd.MMM',
            },
            formatter: function(value, timestamp, opts) {
              let temp = value.split('-')
              return temp.length>2 ? moment(value).format('DD.MMM') : moment(value).format('MMM')
            }
          },
        },
        yaxis: {
          axisBorder: {
            show: true,
          },
          tooltip: {
            enabled: false,
          },
          crosshairs: {
            show: false,
          },
          labels: {
            formatter: function (val) {
              if(typeof val !== "undefined") {
                return numberFormat(val, 0)
              }
              return val
            }
          },
        },
        title: {
          align: 'left',
          style: {
            color: textColor
          },

        },
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'center', 
          showDuplicates: false,
          itemMargin: {
            horizontal: 5,
            vertical: 0
          },
        },
        tooltip: {
          y: [
            {
              formatter(y) {
                return numberFormat(y, 0)
              }
            }
          ],
        },
        dataLabels: {
          enabled: true,
          formatter(val) {
            return numberFormat(val, 0)
          }
        },
      },
    };
  },

  props: {
    title: {default: ''},
    chartData: {default: []},
    stacked: {default: false},
    fetchingData: {type: Boolean, default: false},
  },
}
</script>

<style lang="scss">
  .columnTitle {
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.2;
  }
</style>



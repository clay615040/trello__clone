<template>
  <Widget id="main-chart" bodyClass="mt" class="mb-xlg" 
    :title="title" :fetchingData="fetchingData" customHeader>
    <highcharts :options="chartData"></highcharts>
  </Widget>
</template>

<script>
import Widget from '@/components/Widget/Widget'
import { Chart } from 'highcharts-vue'
import i18n from '@/locales'
import { removeComma } from '@/helper'

export default {
  name: 'ReportChart',
  components: { Widget, highcharts: Chart },
  data() {
    return {
      chartOptions: {
        credits: {
          enabled: false
        },
        chart: {
          height: 500
        },
        title: false,
        exporting: {
          enabled: false
        },
        legend: {
          verticalAlign: 'top'
        },
        yAxis: {
          title: false,
        },
        xAxis: {
          type: 'category',
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
    };
  },
  props: {
    title: {default: ''},
    data: {default: []},
    add: {default: true},
    fetchingData: {type: Boolean, default: false},
  },
  computed: {
    chartData() {
      let _colorIndex = 0
      let _colorList = ['#005792', '#FF69B4', '#FDA700', '#002B49', '#FF0000', '#00FFFF', '#00FF7F', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', '#000000', '#808080', '#008000', '#800000', '#000080', '#808000', '#800080', '#c0c0c0', '#ffff', '#008080']
      let _group = []
      let _series = []
      let tempChartLabels = [
          '', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
              'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 
              'Nov', 'Dec'
      ]

      if(this.add) {
        this.data.forEach(_item => {
          _item.detail.forEach(_node => {
            let temp = false
            for (let i = 0; i <= _group.length; i++) {
              if(_group[i]?.merchant_id === _node?.merchant_id && _group[i]?.game_code === _node?.game_code) {
                return
              }
              else temp = true
            }
            
            if(temp) {
              _group.push({
                'merchant_id': _node.merchant_id,
                'game_code': _node.game_code
              })
            }
          })
        })
      } else {
        this.data.forEach(_item => {
          let temp = false
          for (let i = 0; i <= _group.length; i++) {
            if(_group[i]?.merchant_id === _item?.merchant_id && _group[i]?.game_code === _item?.game_code) {
              return
            }
            else temp = true
          }
          
          if(temp) {
            _group.push({
              'merchant_id': _item.merchant_id,
              'game_code': _item.game_code
            })
          }
        })
      }

      if(this.add) {
        _group.forEach(_info => {
          let _totalBet = {
            'type': 'spline',
            'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總投注'),
            'data': null,
            'color': _colorList[_colorIndex]
          }

          let _dataBet = []
          _series.push(_totalBet)

          let _winLose = {
            'type': 'spline',
            'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總輸贏'),
            'data': null,
            'color': _colorList[_colorIndex + 1]
          }

          let _dataWin = []
          _series.push(_winLose)

          this.data.forEach(_item => {
            _item.detail.forEach(_node => {
              let temp = parseInt(_item.date?.split('-')[parseInt(_item.date?.split('-').length) - 1])

              if(_node.date != 'Total' &&
                _node.merchant_id == _info.merchant_id && 
                _node.game_code == _info.game_code) {

                _dataBet.push(
                  [tempChartLabels[temp], parseInt(removeComma(_node.total_bet))],
                )
                _dataWin.push(
                  [tempChartLabels[temp], parseInt(removeComma(_node.win_lose))],
                )
              }
            })
          })
          
          _totalBet['data'] = _dataBet
          _winLose['data'] = _dataWin

          _colorIndex += 2
        })
      } else {
        _group.forEach(_info => {
          let _totalBet = {
            'type': 'spline',
            'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總投注'),
            'data': null,
            'color': _colorList[_colorIndex]
          }

          let _dataBet = []
          _series.push(_totalBet)

          let _winLose = {
            'type': 'spline',
            'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總輸贏'),
            'data': null,
            'color': _colorList[_colorIndex + 1]
          }

          let _dataWin = []
          _series.push(_winLose)

          this.data.forEach(_item => {
            let temp = parseInt(_item.date?.split('-')[parseInt(_item.date?.split('-').length) - 1])

            if(_item.date != 'Total' &&
              _item.merchant_id == _info.merchant_id && 
              _item.game_code == _info.game_code) {
              
              _dataBet.push(
                [tempChartLabels[temp], parseInt(removeComma(_item.total_bet))],
              )
              _dataWin.push(
                [tempChartLabels[temp], parseInt(removeComma(_item.win_lose))],
              )
            }
          })        
          
          _totalBet['data'] = _dataBet
          _winLose['data'] = _dataWin

          _colorIndex += 2
        })
      
      }

      return {
        ...this.chartOptions,
        series: _series
      }
    }
  }, 
}
</script>

import axios from "axios";
import md5 from "js-md5";

export default {
  namespaced: true,
  state: {
  
    request: {
      
    },
    response: {
      record: {},
      currency: [],
      games: []
    },
    receiving: {
      record: false,
      games: false,
    }
  },
  mutations: {
    RECEIVING_DATA(state, req) {
      state.receiving.record = true;
    },
    RECEIVED_DATA(state, res) {
      
      let _data = res.result;

      if(!_data) return;

      let _record = {};
      let _currency = [];

      _data.map(_item => {  
        let _exist = false;
        for(let _info of _currency) {
          if(_info.name == _item.currency) {
            _exist = true;
            break;
          }
        }
        if(!_exist) {
          _currency.push({
            'name': _item.currency
          });
        }
      })
      
      _currency.forEach(_list => {
        let _value = _list.name;
        _record[_value] = [];

        _data.forEach(_item => {
          if(_item.currency == _value) {
            let temp = {
              'date': _item.date,
              'total_bet': parseFloat(_item.total_bet),
              'total_win': parseFloat(_item.total_win),
              'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            }

            _record[_value].push(temp)
          }
        })
      })
      
      state.response.record = _record;
      state.response.currency = _currency;
      state.receiving.record = false;
    },

    RESET_STATE(state) {
      state.response.record = {};
      state.response.currency = [];
      state.response.games = [];
    }
  },
  actions: {

    request_record({commit}, req) {
        
      return new Promise((resolve, reject) => {

        commit('RECEIVING_DATA', req);

        let _data = {
          'merchant_id': req.merchantId,
          'vendor_code': sessionStorage.getItem('vendor_code'),
          'game_id': req.gameId,
          'start_date': req.startDate,
          'end_date': req.endDate,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        
        let _hash = md5(JSON.stringify(_data) + '698856a');
        
        axios.post('/api/getAnalytics', { 'data':_data, 'hash':_hash }).then(_res => {
          
          if(_res.data.code != 1000) {
            resolve(_res.data.code);
            return;
          }
          
          commit('RECEIVED_DATA', _res.data);
          resolve();
        })
      })
    },
    
    reset_state({commit}) {
      commit('RESET_STATE');
    }

  },
};

import axios from "axios";
import md5 from "js-md5";

export default {
  namespaced: true,
  state: {
    request: {     
    },
    
    response: {
      list: [],
      gameMenu: [],
      info: [],
      type: [],
    },

    process: {
      list: false,
      gameMenu: false,
      info: false,
      type: false,
    }
  
  },
  getters: {
    list_filter: state => {
      return state.response.list.filter(item => !!item.code)
    }
  },
  mutations: {
    RECEIVING_LIST(state) {
      state.process.list = true
      state.process.gameMenu = true
      state.response.list = []      
      state.response.gameMenu = []      
    },
    RECEIVED_LIST(state, res) {
      let tmp = [{
        'code': '',
        'name': 'All'
      }];

      for(const data of res){
        tmp.push({
          'code': data.code,
          'name': data.name
        });
      }
      
      state.response.list = tmp
      state.process.list = false
      state.response.gameMenu = res
      state.process.gameMenu = false
    },

    RECEIVING_INFO(state) {
      state.process.info = true;
      state.response.info = [];     
    },
    RECEIVED_INFO(state, res) {
        
      for(const data of res){
        if(data.active) {
          state.response.info.push({
            'id': data.game_id,
            'code': data.game_code,
            'name': data.game_name
          });
        }
      }

      state.process.info = false;
    },

    RECEIVING_TYPE(state) {
      state.process.type = true;
      state.response.type = [];      
    },
    RECEIVED_TYPE(state, res) {
        
      state.response.type.push({
        'id': 0,
        'name': ''
      });

      for(const data of res){
          let tmp = {
              'id': data.id,
              'name': data.name
          };
          state.response.type.push(tmp);
      }

      state.process.type = false;
    },   
  
    RESET_STATE(state) {
      state.response.list = [];
      state.response.gameMenu = [];
      state.response.info = [];
      state.response.type = [];
      state.process.gameMenu = false;
      state.process.menu = false;
      state.process.info = false;
      state.process.type = false;
    }
  },
  actions: {
    request_list({commit}, req) {

      return new Promise((resolve, reject) => {
          
        commit('RECEIVING_LIST');
          
        let _data = {
          'merchant_id': req.merchantId,
          'vendor_id': sessionStorage.getItem('vendor_id'),
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let _realhash = md5(JSON.stringify(_data) + '698856a');

        axios.post('/api/availableGames', {'data': _data, 'hash': _realhash}).then(res => {
            
          if(res.data.code != 1000) {
              resolve(res.data.code);
              return;
          }
          
          commit('RECEIVED_LIST', res.data.result);
          resolve();
        })            
      })
    },

    request_info({commit}, req) {

      return new Promise((resolve, reject) => {
          
        commit('RECEIVING_INFO');
          
        let _data = { 
          'vendor_id': parseInt(sessionStorage.getItem('vendor_id')),
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let _realhash = md5(JSON.stringify(_data) + '698856a');

        axios.post('/api/getGameList', {'data': _data, 'hash': _realhash}).then(res => {
            
          if(res.data.code != 1000) {
              resolve(res.data.code);
              return;
          }
          
          commit('RECEIVED_INFO', res.data.result);
          resolve();
        })            
      })
    },

    request_type({commit}, req) {

      return new Promise((resolve, reject) => {
          
        commit('RECEIVING_TYPE');
          
        let _data = {}
        let _realhash = md5(JSON.stringify(_data) + '698856a');

        axios.post('/api/getGameType', {'data': _data, 'hash': _realhash}).then(res => {
            
          if(res.data.code != 1000) {
              resolve(res.data.code);
              return;
          }
          
          commit('RECEIVED_TYPE', res.data.result);
          resolve();
        })            
      })
    },
    
    reset_state({commit}) {
      commit('RESET_STATE');
    }
  },
};

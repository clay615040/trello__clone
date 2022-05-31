import axios from "axios";
import md5 from "js-md5";
 
export default {
  namespaced: true,
  state: {
 
    request: {},
    
    response: {     
      list: [],
      operatorMenu: [],
    },
 
    receiving: {
      list: false,
      operatorMenu: false,
    }
   
  },
  getters: {
    list_filter: state => {
      return state.response.list.filter(item => !!item.code)
    }
  },
  mutations: {
    RECEIVING_LIST(state) {
      state.receiving.list = true
      state.receiving.operatorMenu = true
      state.response.list = []
      state.response.operatorMenu = []

    },
    RECEIVED_LIST(state, res) {
      
      let tmp = [{
        'id': 0,
        'code': '',
        'name': 'All'
      }];

      for(const data of res){
        tmp.push({
            'id': data.id,
            'code': data.code,
            'name': data.name
        });
      }
      
      state.response.list = tmp
      state.receiving.list = false
      state.response.operatorMenu = res
      state.receiving.operatorMenu = false
    },
   
  },
  actions: {
    request_list({commit}, req) {
 
      return new Promise((resolve, reject) => {
          
        commit('RECEIVING_LIST');
        
        let _data = {
          'vendor_id': sessionStorage.getItem('vendor_id'),
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let realhash = md5(JSON.stringify(_data) + '698856a');
 
        axios.post('/api/operatorList', {'data': _data, 'hash': realhash}).then(res => {
        
          if(res.data.code != 1000) {
              resolve(res.data.code);
              return;
          }
          
          commit('RECEIVED_LIST', res.data.result);
          resolve();
        })            
      })
    },    
    
  },
};
import axios from 'axios';
import md5 from 'js-md5';

export default {
  namespaced: true,
  state: {       

    request: {
        revenue: {
            merchant_id: '',
            vendor_code: '',            
            game_id: '',
            start_date: '',        
            end_date: '',
        }
    },

    response: {
        popular: [],    
    },
    
    receiving: {
        report: false,
    }
    
  },
  mutations: {    
    RECEIVING_REPORT(state, req) {
        state.receiving.report = true;
        state.response.revenue = [];
        
        let _vendor_id = parseInt(sessionStorage.getItem('vendor_id'));  
        
        state.request.revenue.vendor_id = _vendor_id;                
        state.request.revenue.merchant_id = req.merchantId; 
        state.request.revenue.game_id = req.gameId;
        state.request.revenue.year = req.date;     
    },
    RECEIVED_REPORT(state, res) {
        state.response.popular = res.result.popular;
        state.receiving.report = false;
    },

    RESET_STATE(state) {

        state.response.popular = [];
        state.receiving.report = false;
    }
    
  },
  actions: {

    request_report({commit}, req) {
        
        return new Promise(async(resolve, reject) => {                
            
            commit('RECEIVING_REPORT', req);

            let _hash;
            let _userId = parseInt(sessionStorage.getItem('user_id'));
            let _vendor_id = parseInt(sessionStorage.getItem('vendor_id'));

            let _data = {      
                'vendor_id': _vendor_id,                            
                'merchant_id': req.merchantId,         
                'game_code': req.gameId,
                'year': req.date,
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            }
            _hash = md5(JSON.stringify(_data) + '698856a');
            
            let _res = await axios.post('/api/monthlyGamePopular', { 'data':_data, 'hash':_hash });
            
            let _resSort;
            if(_res.data.code == 1000) {
                _resSort =  JSON.stringify(_res.data);
                _resSort = JSON.parse(_resSort);
                delete _resSort.result;
            }
            else {
                _resSort = _res;
            }
            
            //Execute Log
            let _dataLog = { 
                'account_id': _userId,
                'menu_id': 60000,
                'subMenu_id': 60100,
                'action': 'select',
                'route': '/api/monthlyGamePopular',
                'request': JSON.stringify(_data),
                'response': JSON.stringify(_resSort),
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            }
            _hash = md5(JSON.stringify(_dataLog) + '698856a');
    
            await axios.post('/api/addVendorLog', { 'data':_dataLog, 'hash':_hash });

            if(_res.data.code != 1000) {
                resolve(_res.data.code);
                return;
            }

            commit('RECEIVED_REPORT', _res.data);                
            resolve();
                    
        })
    },

    reset_state({commit}) {
        commit('RESET_STATE');
    }

  },
};

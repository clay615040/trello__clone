import axios from 'axios';
import md5 from 'js-md5';

export default {
  namespaced: true,
  state: {
    
    is_reload: true,

    request: {
        record: {
            page_no: '',
            page_size: '',
            merchant_id: '',
            vendor_id: '',
            transaction_id: '',
            round_id: '',            
            user_id: '',            
            game_id: '',
            date_period: [],
        }
    },

    response: {
        page_record: 0,
        count_record: 0,
        record: []
    },
    
    receiving: {
        record: false
    }
    
  },
  mutations: {    

    RECEIVING_RECORD(state, req) {

        state.is_reload = req.isReload;        
        state.request.record.page_no = req.pageNo;

        state.receiving.record = true;
        state.response.record = [];

        if(state.is_reload) {
            state.request.record.page_size = req.pageSize;
            state.request.record.merchant_id = req.merchantId;
            state.request.record.vendor_id = req.vendorId;
            state.request.record.transaction_id = req.transactionId;
            state.request.record.round_id = req.roundId;          
            state.request.record.user_id = req.userId;            
            state.request.record.game_id = req.gameId;
            state.request.record.date_period[0] = req.startDate;
            state.request.record.date_period[1] = req.endDate;
        }
    },
    RECEIVED_RECORD(state, res) {

        if(state.is_reload) {
            state.response.page_record = res.total_page;
            state.response.count_record = res.total_count;
        }

        for(let item of res.result) {
            item.vendor_name = sessionStorage.getItem('vendor_name');
            state.response.record.push(item);
        }
        
        state.receiving.record = false;
    },

    RESET_STATE(state) {
        state.response.page_record = 0;
        state.response.count_record = 0;
        state.response.record = [];
        state.receiving.record = false;
    }
    
  },
  actions: {

    request_record({commit}, req) {
        
        return new Promise(async(resolve, reject) => {                
            
            commit('RECEIVING_RECORD', req);

            let _hash;
            
            let _userId = parseInt(sessionStorage.getItem('user_id'));

            let _data = {
                'is_reload': req.isReload,
                'page_no': req.pageNo,
                'page_size': req.pageSize,
                'merchant_id': req.merchantId,
                'vendor_id': req.vendorId,
                'transaction_id': req.transactionId,
                'round_id': req.roundId,                          
                'user_id': req.userId,
                'game_id': req.gameId,
                'start_date': req.startDate,
                'end_date': req.endDate,
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            }
            _hash = md5(JSON.stringify(_data) + '698856a');
        
            let _res = await axios.post('/api/apiRecord', { 'data':_data, 'hash':_hash });

            let _resSort;
            if(_res.data.code == 1000) {
                _resSort =  JSON.stringify(_res.data);
                _resSort = JSON.parse(_resSort);
                delete _resSort.result;
            }
            else {
                _resSort = _res;
            }

            let _dataLog = { 
                'account_id': _userId,
                'menu_id': 40000,
                'subMenu_id': 40300,
                'action': 'select',
                'route': '/api/apiRecord',
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

            commit('RECEIVED_RECORD', _res.data);                
            resolve();
        })
    },

    reset_state({commit}) {
        commit('RESET_STATE');
    }
  },
};

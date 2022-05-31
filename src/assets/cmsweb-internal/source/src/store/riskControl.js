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
            vendor_code: '',
            game_id: '',
            date_period: [],
        }
    },

    response: {
        page_record: 0,
        count_record: 0,
        record: [],
        summary: [],
    },
    
    receiving: {
        record: false,
    }
  },
  mutations: {    
    RECEIVING_RECORD(state, req) {
        state.is_reload = req.isReload        
        state.request.record.page_no = req.pageNo
        state.receiving.record = true
        state.response.record = []
        state.response.summary = []

        if(state.is_reload) {
            state.request.record.page_size = req.pageSize;
            state.request.record.merchant_id = req.merchantId;
            state.request.record.vendor_code = req.vendorCode;
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
            item.vendor_name = sessionStorage.getItem('vendor_name')
            state.response.record.push(item)
        }

        state.response.resRecord = res.result
        state.response.summary = res.summary
        state.receiving.record = false
    },

    RESET_STATE(state) {
        state.response.page_record = 0;
        state.response.count_record = 0;
        state.response.summary = [];
        state.response.record = [];
        state.receiving.record = false;
    }
  },
  actions: {
    request_record({commit}, req) {
        return new Promise(async(resolve, reject) => {                
            commit('RECEIVING_RECORD', req);

            let _hash;
            let _userId = parseInt(sessionStorage.getItem('vendor_id'));

            let _data = {
                'is_reload': req.isReload,
                'merchant_id': req.merchantId,
                'vendor_id': _userId,     
                'page_no': req.pageNo,
                'page_size': req.pageSize,                      
                'game_code': req.gameId,
                'start_date': req.startDate,
                'end_date': req.endDate,
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            }
            _hash = md5(JSON.stringify(_data) + '698856a');
        
            let _res = await axios.post('/api/riskControl', { 'data':_data, 'hash':_hash })

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
                'menu_id': 60000,
                'subMenu_id': 60500,
                'action': 'select',
                'route': '/api/riskControl',
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

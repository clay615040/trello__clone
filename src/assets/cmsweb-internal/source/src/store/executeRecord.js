import axios from 'axios';
import md5 from 'js-md5';

export default {
  namespaced: true,
  state: {
    
    is_reload: true,

    request: {
        page_no: '',
        page_size: '',
        account: '',
        menu_id: '',
        subMenu_id: '',
        date_period: [],
    },

    response: {
        page_record: 0,
        count_record: 0,
        record: [],
    },
    
    receiving: {
        record: false,
    }
    
  },
  mutations: {    

    RECEIVING_RECORD(state, req) {

        state.is_reload = req.isReload;        
        state.request.page_no = req.pageNo;

        state.receiving.record = true;
        state.response.record = [];

        if(state.is_reload) {
            state.request.page_size = req.pageSize;
            state.request.account = req.account;
            state.request.menu_id = req.menuId;
            state.request.subMenu_id = req.subMenuId;
            state.request.date_period[0] = req.startTime;
            state.request.date_period[1] = req.endTime;
        }
    },
    RECEIVED_RECORD(state, res) {

        if(state.is_reload) {
            state.response.page_record = res.total_page;
            state.response.count_record = res.total_count;
        }

        state.response.record = res.result;
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
            let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
            let _userId = parseInt(sessionStorage.getItem('user_id'));

            let _data = {
                'page_no': req.pageNo,
                'page_size': req.pageSize,
                'vendor_id': _vendorId,
                'account': req.account,
                'menu_id': req.menuId,
                'subMenu_id': req.subMenuId,
                'start_time': req.startTime,
                'end_time': req.endTime,
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            }
            _hash = md5(JSON.stringify(_data) +  '698856a');
            
            let _res = await axios.post('/api/getVendorLog', { 'data':_data, 'hash':_hash });
            
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
                'subMenu_id': 40500,
                'action': 'select',
                'route': '/api/getVendorLog',
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

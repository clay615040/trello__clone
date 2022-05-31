import axios from "axios";
import md5 from "js-md5";

export default {
  namespaced: true,
  state: {

    request: {
      select: {},
      modify: {},
      delete: {},
    },

    response: {
      count: 0,
      userId: 0,
      list: [],
    },

    process: {
      select: false,
      modify: false,
      delete: false,
    }
  },
  mutations: {
    
    RECEIVING_ACCOUNT(state, req) {

      state.process.select = true;
      state.request.select = req;
      state.response.count = 0;
      state.response.list = [];
    },
    RECEIVED_ACCOUNT(state, res) {

      state.process.select = false;
      let _data = res.result;
      
      if(!_data) return;
      
      state.response.count = _data.length;
      state.response.list = _data;
    },
    
    MODIFING_ACCOUNT(state, req) {
      state.process.modify = true;
      state.request.modify = req;
    },
    MODIFIED_ACCOUNT(state, res) {
      
      let _data = res.result;
      
      if(!_data) return;

      state.response.count = _data.length;
      state.response.list = _data;
      state.response.userId = res.user_id;
      state.process.modify = false;
    },
    
    DELETING_ACCOUNT(state, req) {
      state.process.delete = true;
      state.request.delete = req;
    },
    DELETED_ACCOUNT(state, res) {

      state.process.delete = false;
      let _data = res.result;
      
      if(!_data) return;

      state.response.count = _data.length;
      state.response.list = _data;
    },

    RESET_STATE(state) {
      state.response.count = 0;
      state.response.userId = 0;
      state.response.list = [];
      state.process.select = false;
      state.process.modify = false;
      state.process.delete = false;
    }
 
  },
  actions: {
    request_select({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('RECEIVING_ACCOUNT', req);
       
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
    
        let _res = await axios.post('/api/getSubAccount', { 'data': _data, 'hash': _hash });
            
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
          'menu_id': 20000,
          'subMenu_id': 20200,
          'action': 'select',
          'route': '/api/getSubAccount',
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

        commit('RECEIVED_ACCOUNT', _res.data);
        resolve();
      })
    },

    request_create({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('MODIFING_ACCOUNT', req);
        
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'account': req.account,
          'password': req.password,
          'username': req.userName,
          'role_id': req.roleId,
          'active': req.active,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
        
        let _res = await axios.post('/api/addSubAccount', { 'data':_data, 'hash':_hash });
        
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
          'menu_id': 20000,
          'subMenu_id': 20200,
          'action': 'insert',
          'route': '/api/addSubAccount',
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
        
        commit('MODIFIED_ACCOUNT', _res.data);
        resolve();
      })
    },

    request_update({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('MODIFING_ACCOUNT', req);
        
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'user_id': req.userId,
          'password': req.password,
          'username': req.userName,
          'role_id': req.roleId,
          'active': req.active,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');      
        
        let _res = await axios.post('/api/updateSubAccount', { 'data':_data, 'hash':_hash })
        
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
          'menu_id': 20000,
          'subMenu_id': 20200,
          'action': 'update',
          'route': '/api/updateSubAccount',
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

        commit('MODIFIED_ACCOUNT', _res.data);
        resolve();
      })
    },

    request_delete({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('DELETING_ACCOUNT', req);

        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'user_id': req.userId,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
    
        let _res = await axios.post('/api/removeSubAccount', { 'data':_data, 'hash':_hash });
        
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
          'menu_id': 20000,
          'subMenu_id': 20200,
          'action': 'delete',
          'route': '/api/removeSubAccount',
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

        commit('DELETED_ACCOUNT', _res.data);
        resolve();
      })
    },
   
    reset_state({commit}) {
      commit('RESET_STATE');
    }
  },
};

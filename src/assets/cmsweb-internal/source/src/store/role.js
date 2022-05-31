import axios from "axios"
import md5 from "js-md5"

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
        roleId: 0,
        list: [],        
    },

    process: {
        select: false,
        modify: false,
        delete: false,
    }
   
  },
  mutations: {
    RECEIVING_ROLE(state, req) {
        state.process.select = true;
        state.request.select = req;
        state.response.count = 0;
        state.response.list = [];
    },
    RECEIVED_ROLE(state, res) {
        
        state.process.select = false;
        let _data = res.result;
      
        if(!_data) return;

        state.response.count = _data.length;
        state.response.list = _data;
    },
    
    MODIFING_ROLE(state, req) {
        state.process.modify = true;
        state.request.modify = req;
        state.response.roleId = 0;
    },
    MODIFIED_ROLE(state, res) {
        state.process.modify = false;
        let _data = res.result;
      
        if(!_data) return;

        state.response.count = _data.length;
        state.response.list = _data; 
        state.response.roleId = res.role_id;
    },
    
    DELETING_ROLE(state, req) {
        state.process.delete = true;
        state.request.delete = req;
    },
    DELETED_ROLE(state, res) {
        state.process.delete = false;
        let _data = res.result;
      
        if(!_data) return;

        state.response.count = _data.length;
        state.response.list = _data;    
    },

    RESET_STATE(state) {
      state.response.count = 0;
      state.response.roleId = 0;
      state.response.list = [];
      state.process.select = false;
      state.process.modify = false;
      state.process.delete = false;
    }

  },
  actions: {
    request_select({commit}, req) {

        return new Promise(async(resolve, reject) => {

          commit('RECEIVING_ROLE', req);

          let _hash;
          let _vendorId = sessionStorage.getItem('vendor_id');
          let _userId = sessionStorage.getItem('user_id');
              
          let _data = {
            'vendor_id': _vendorId,
            'role_id': req.roleId,
            'time_zone': parseInt(sessionStorage.getItem('time_zone')),
          }
          _hash = md5(JSON.stringify(_data) + '698856a');

          let _res = await axios.post('/api/getRoleList', {'data': _data, 'hash': _hash});

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
            'subMenu_id': 20300,
            'action': 'select',
            'route': '/api/getRoleList',
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

          commit('RECEIVED_ROLE', _res.data);
          resolve();
        })
    },
    
    request_create({commit}, req) {

        return new Promise(async(resolve, reject) => {

          commit('MODIFING_ROLE', req);
              
          let _hash;
          let _vendorId = sessionStorage.getItem('vendor_id');
          let _userId = sessionStorage.getItem('user_id');

          let _data = {
            'vendor_id': _vendorId,
            'role_name': req.roleName,
            'active': req.active,
            'time_zone': parseInt(sessionStorage.getItem('time_zone')),
          }
          _hash = md5(JSON.stringify(_data) + '698856a');
          
          let _res = await axios.post('/api/addRoleInfo', {'data': _data, 'hash': _hash});

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
            'subMenu_id': 20300,
            'action': 'insert',
            'route': '/api/addRoleInfo',
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
          
          commit('MODIFIED_ROLE', _res.data);
          resolve();            
        })
    },
    
    request_update({commit}, req) {

      return new Promise(async(resolve, reject) => {

        commit('MODIFING_ROLE', req);
            
        let _hash;
        let _vendorId = sessionStorage.getItem('vendor_id');
        let _userId = sessionStorage.getItem('user_id');
        
        let _data = {
          'vendor_id': _vendorId,
          'role_id': req.roleId,
          'role_name': req.roleName,
          'active': req.active,
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
        
        let _res = await axios.post('/api/updateRoleInfo', {'data': _data, 'hash': _hash});

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
          'subMenu_id': 20300,
          'action': 'update',
          'route': '/api/updateRoleInfo',
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
        
        commit('MODIFIED_ROLE', _res.data);
        resolve();          
      })
    },

    request_delete({commit}, req) {

      return new Promise(async(resolve, reject) => {

        commit('DELETING_ROLE', req);
        
        let _hash;
        let _vendorId = sessionStorage.getItem('vendor_id');
        let _userId = sessionStorage.getItem('user_id');

        let _data = {
          'vendor_id': _vendorId,
          'role_id': req.roleId,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');

        let _res = await axios.post('/api/removeRoleInfo', {'data': _data, 'hash': _hash});
       
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
          'subMenu_id': 20300,
          'action': 'delete',
          'route': '/api/removeRoleInfo',
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

        commit('DELETED_ROLE', _res.data);
        resolve();        
      })
    },

    reset_state({commit}) {
      commit('RESET_STATE');
    }
  },
};

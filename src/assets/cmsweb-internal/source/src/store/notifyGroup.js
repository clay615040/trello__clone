import axios from "axios";
import md5 from "js-md5";

export default {
  namespaced: true,
  state: {

    request: {
      select: {},
      modify: {},
    },
    
    response: {
      count: 0,
      list: [],
      info: [],
      pipeline: [],
    },

    process: {          
      select: false,
      modify: false
    }
   
  },
  mutations: {    

    RECEIVING_LIST(state, req) {

      state.process.select = true;
      state.request.select = req;
      state.response.list = [];
    },
    RECEIVED_LIST(state, res) {
      
      let _data = res.result;
      
      if(!_data) return;

      let _dataSort = _data.filter(_item => _item.active == 1)
     
      state.response.list = _dataSort;
      state.process.select = false;
    },

    RECEIVING_PIPELINE(state, req) {
      
      state.response.pipeline = [];
    },
    RECEIVED_PIPELINE(state, res) {
      
      let _data = res.result;
      
      if(!_data) return;

      _data.unshift({
        'id': 0,
        'code': '',
        'name': '',
      })

      state.response.pipeline = _data;
    },

    RECEIVING_DATA(state, req) {

      state.process.select = true;
      state.request.select = req;
    },
    RECEIVED_DATA(state, res) {
      
      let _data = res.result;
      
      if(!_data) return;

      _data.forEach(_item => {
        _item.active = _item.active == 1? 'enable': 'disable'
      })
      
      state.response.count = _data.length;
      state.response.info = _data;
      state.process.select = false;
    },
      
    MODIFING_DATA(state, req) {

      state.process.modify = true;
      state.request.modify = req;
    },
    MODIFIED_DATA(state, res) {

      let _data = res.result;
      
      if(!_data) return;

      _data.forEach(_item => {
        _item.active = _item.active == 1? 'enable': 'disable'
      })

      state.response.count = _data.length;
      state.response.info = _data;
      state.process.modify = false;
    },
   
    RESET_STATE(state) {
      state.response.count = 0;
      state.response.list = [];
      state.response.info = [];
      state.response.pipeline = [];
      state.process.select = false;
      state.process.modify = false;
    }
  },
  actions: {
    
    request_list({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('RECEIVING_LIST', req);
        
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
    
        let _res = await axios.post('/api/getNotifyGroup', { 'data': _data, 'hash': _hash });
       
        if(_res.data.code != 1000) {
          resolve(_res.data.code);
          return;
        }

        commit('RECEIVED_LIST', _res.data);
        resolve();
      })
    },

    request_pipeline({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('RECEIVING_PIPELINE', req);
        
        let _hash;

        let _data = {
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
    
        let _res = await axios.post('/api/getPipelineList', { 'data': _data, 'hash': _hash });
      
        if(_res.data.code != 1000) {
          resolve(_res.data.code);
          return;
        }

        commit('RECEIVED_PIPELINE', _res.data);
        resolve();
      })
    },

    request_select({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('RECEIVING_DATA', req);
        
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
    
        let _res = await axios.post('/api/getNotifyGroup', { 'data': _data, 'hash': _hash });
            
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
          'menu_id': 30000,
          'subMenu_id': 30300,
          'action': 'select',
          'route': '/api/getNotifyGroup',
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

        commit('RECEIVED_DATA', _res.data);
        resolve();
      })
    },
  
    request_create({commit}, req) {
    
      return new Promise(async(resolve, reject) => {

        commit('MODIFING_DATA', req);
        
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'pipeline_id': req.pipelineId,
          'group_code': req.groupCode,
          'group_name': req.groupName,
          'group_key': req.groupKey,
          'active': req.active == 'enable'? 1: 0,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
        
        let _res = await axios.post('/api/addNotifyGroup', { 'data':_data, 'hash':_hash });
        
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
          'menu_id': 30000,
          'subMenu_id': 30300,
          'action': 'insert',
          'route': '/api/addNotifyGroup',
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
        
        commit('MODIFIED_DATA', _res.data);
        resolve();
      })
    },

    request_update({commit}, req) {
    
      return new Promise(async(resolve, reject) => {

        commit('MODIFING_DATA', req);
        
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = { 
          'vendor_id': _vendorId,
          'group_id': req.groupId,          
          'pipeline_id': req.pipelineId,
          'group_code': req.groupCode,
          'group_name': req.groupName,
          'group_key': req.groupKey,
          'active': req.active == 'enable'? 1: 0,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        _hash = md5(JSON.stringify(_data) + '698856a');      
        
        let _res = await axios.post('/api/updateNotifyGroup', { 'data':_data, 'hash':_hash })
        
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
          'menu_id': 30000,
          'subMenu_id': 30300,
          'action': 'update',
          'route': '/api/updateNotifyGroup',
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

        commit('MODIFIED_DATA', _res.data);
        resolve();
      })
    },

    reset_state({commit}) {
      commit('RESET_STATE');
    }
  },
};

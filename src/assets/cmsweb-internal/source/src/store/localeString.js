import axios from "axios";
import md5 from "js-md5";

export default {
  namespaced: true,
  state: {

    request: {
      select: {},
      modify: {},
      delete: {}
    },
    
    response: {
      list: [],
      lang: []
    },

    process: {          
      select: false,
      modify: false,
      delete: false
    }
   
  },
  mutations: {    

    RECEIVING_LANG(state, req) {

      state.process.select = true;
    },
    RECEIVED_LANG(state, res) {
      
      let _data = res.result;
      
      if(!_data) return;
     
      state.response.lang = _data;
      state.process.select = false;
    },

    RECEIVING_DATA(state, req) {

      state.process.select = true;
      state.request.select = req;
    },
    RECEIVED_DATA(state, res) {
      
      let _data = res.result;
      
      if(!_data) return;

      state.response.list = _data;
      state.process.select = false;
    },
      
    MODIFING_DATA(state, req) {

      state.process.modify = true;
      state.request.modify = req;
    },
    MODIFIED_DATA(state, res) {

      let _data = res.result;
      
      if(!_data) return;

      state.response.list = _data;
      state.process.modify = false;
    },

    DELETING_DATA(state, req) {

      state.process.delete = true;
      state.request.delete = req;
    },
    DELETED_DATA(state, res) {

      let _data = res.result;
      
      if(!_data) return;

      state.response.list = _data;
      state.process.delete = false;
    },
   
  },
  actions: {

    request_language({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('RECEIVING_LANG', req);
        
        let _data = {
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let _hash = md5(JSON.stringify(_data) + '698856a');
    
        let _res = await axios.post('/api/getLanguage', { 'data': _data, 'hash': _hash });
        
        if(_res.data.code != 1000) {
          resolve(_res.data.code);
          return;
        }

        commit('RECEIVED_LANG', _res.data);
        resolve();
      })
    },
    
    request_select({commit}, req) {
      
      return new Promise(async(resolve, reject) => {

        commit('RECEIVING_DATA', req);
        
        let _data = { 
          'source_db': req.sourceDB,
          'source_table': req.sourceTable,
          'entity_id': req.entityId,
          'resource_name': req.resourceName,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let _hash = md5(JSON.stringify(_data) + '698856a');
    
        let _res = await axios.post('/api/getLocaleString', { 'data': _data, 'hash': _hash });
        
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
        
        let _data = { 
          'language_id': req.languageId,
          'source_db': req.sourceDB,
          'source_table': req.sourceTable,
          'entity_id': req.entityId,
          'resource_name': req.resourceName,
          'resource_value': req.resourceValue,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let _hash = md5(JSON.stringify(_data) + '698856a');
        
        let _res = await axios.post('/api/addLocaleString', { 'data':_data, 'hash':_hash });
        
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
        
        let _data = {
          'source_id': req.sourceId,
          'language_id': req.languageId,
          'source_db': req.sourceDB,
          'source_table': req.sourceTable,
          'entity_id': req.entityId,
          'resource_name': req.resourceName,
          'resource_value': req.resourceValue,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let _hash = md5(JSON.stringify(_data) + '698856a');      
        
        let _res = await axios.post('/api/updateLocaleString', { 'data':_data, 'hash':_hash })
        
        if(_res.data.code != 1000) {
          resolve(_res.data.code);
          return;
        }

        commit('MODIFIED_DATA', _res.data);
        resolve();
      })
    },

    request_delete({commit}, req) {
    
      return new Promise(async(resolve, reject) => {

        commit('DELETING_DATA', req);
        
        let _data = {
          'source_db': req.sourceDB,
          'source_table': req.sourceTable,
          'entity_id': req.entityId,
          'resource_name': req.resourceName,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),
        }
        let _hash = md5(JSON.stringify(_data) + '698856a');      

        let _res = await axios.post('/api/removeLocaleString', { 'data':_data, 'hash':_hash })
        
        if(_res.data.code != 1000) {
          resolve(_res.data.code);
          return;
        }

        commit('DELETED_DATA', _res.data);
        resolve();
      })
    },

  },
};

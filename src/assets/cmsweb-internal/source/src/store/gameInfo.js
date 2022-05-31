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
      gameId: 0,
    },

    process: {          
      select: false,
      modify: false
    }
   
  },
  mutations: {    

    RECEIVING_DATA(state, req) {

      state.process.select = true;
      state.request.select = req;
    },
      
    MODIFING_DATA(state, req) {

      state.process.modify = true;
      state.request.modify = req;
    },
    MODIFIED_DATA(state, res) {

      let _data = res.result;
      
      if(!_data) return;

      let _language = sessionStorage.getItem('language');

      _data.forEach(_item => {
        _item.active = _item.active == 1? 'enable': 'disable'
        _item.rtp = _item.rtp + '%';

        if(_language == 'en-us') _item.game_name_lang = _item.game_name;
      })

      state.response.count = _data.length;
      state.response.info = _data;
      state.response.gameId = res.game_id;
      state.process.modify = false;
    },
  },
  actions: {
    request_create({commit}, req) {
      return new Promise(async(resolve, reject) => {
        commit('MODIFING_DATA', req);
        
        let _hash;
        let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
        let _userId = parseInt(sessionStorage.getItem('user_id'));

        let _data = {
          'language': sessionStorage.getItem('language'),
          'vendor_id': _vendorId,
          'game_code': req.gameCode,
          'game_name': req.gameName,
          'game_type_id': req.gameTypeId,
          'rtp': req.rtp,
          'is_h5': req.isH5,
          'active': req.active == 'enable'? 1: 0,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),        
        }
        _hash = md5(JSON.stringify(_data) + '698856a');
        
        let _res = await axios.post('/api/addGameInfo', { 'data':_data, 'hash':_hash });
        
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
          'subMenu_id': 30100,
          'action': 'insert',
          'route': '/api/addGameInfo',
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
          'language': sessionStorage.getItem('language'),
          'vendor_id': _vendorId,
          'game_id': req.gameId,
          'game_code': req.gameCode,
          'game_name': req.gameName,
          'game_type_id': req.gameTypeId,
          'rtp': req.rtp,
          'is_h5': req.isH5,
          'active': req.active == 'enable'? 1: 0,
          'time_zone': parseInt(sessionStorage.getItem('time_zone')),    
        }
        _hash = md5(JSON.stringify(_data) + '698856a');      
        
        let _res = await axios.post('/api/updateGameInfo', { 'data':_data, 'hash':_hash })
        
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
          'subMenu_id': 30100,
          'action': 'update',
          'route': '/api/updateGameInfo',
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
  },
};

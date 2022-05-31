import axios from "axios";
import md5 from "js-md5";

export default {
  namespaced: true,
  state: {

    request: {
    },
    
    response: {
        list: [],
    },

    process: {
        select: false,
        modify: false,        
    }
   
  },
  mutations: {
    RECEIVING_PERMISSION(state) {
        state.process.select = true;
        state.response.list = [];
    },
    RECEIVED_PERMISSION(state, res) {
       
        state.process.select = false;
        let _data = res.result;
      
        if(!_data) {            
            state.response.list = [];
            return;
        }

        let _dataSort = [];

        for(const _key in _data) {
            let _item1 = _data[_key];            

            if(_item1.child) {
                _item1.child.forEach(_item2 => {                    
                    let _tmp2 = {
                        'id': _item2.id,
                        'menu': _item2.name,
                        'label': '',
                        'parent': _item1.id
                    }

                    if(_item2.child) {
                        _item2.child.forEach(_item3 => {
                            let _tmp3 = {
                                'id': _item3.id,
                                'menu': _item3.name,
                                'label': '',
                                'parent': _item2.id
                            };

                            _dataSort.push(_tmp3);
                        })
                    }
                    else _dataSort.push(_tmp2);
                })
            }
        }

        state.response.list = _dataSort;
    },
   
    MODIFING_PERMISSION(state, req) {
        state.process.modify = true;

    },
    MODIFIED_PERMISSION(state, res) {
        state.process.modify = false;
    },

  },
  actions: {
    request_select({commit}, req) {

        return new Promise((resolve, reject) => {

            commit('RECEIVING_PERMISSION');
           
            let _data = {
                'user_id': req.userId,
                'role_id': req.roleId,
                'is_main': req.isMain,
                'language': sessionStorage.getItem('language'),
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            };
            let realhash = md5(JSON.stringify(_data) + '698856a');

            axios.post('/api/getPermission', {'data': _data, 'hash': realhash}).then(res => {

                if(res.data.code != 1000) {
                    resolve(res.data.code);
                    return;
                }

                commit('RECEIVED_PERMISSION', res.data);
                resolve();
            })            
        })
    },
    
    request_update({commit}, req) {
        return new Promise((resolve, reject) => {

            commit('MODIFING_PERMISSION');

            if(req.menuId.length == 0) resolve();

            let menu = [];
            req.menuId.forEach(_item => {
                if(!menu.includes(_item.parent)) menu.push(_item.parent);
                menu.push(_item.id.toString());
            })

            if(menu.length > 0) menu.push('');

            let _data = {
                'user_id': req.userId,
                'role_id': req.roleId,
                'menu_id': menu.toString(),
                'is_main': req.isMain,
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            };
            let realhash = md5(JSON.stringify(_data) + '698856a');
            
            axios.post('/api/setPermission', {'data': _data, 'hash': realhash}).then(res => {                   

                if(res.data.code != 1000) {
                    resolve(res.data.code);
                    return;
                }

                commit('MODIFIED_PERMISSION', res.data);                    
                resolve();
            })
            
        })
    }
  },
};

import axios from "axios";
import md5 from "js-md5";

export default {
  namespaced: true,
  state: {

    request: {},
    
    response: {
        list: [],
    },

    process: {
        select: false
    }
   
  },
  mutations: {
    RECEIVING_MENU(state) {
        state.process.select = true;
        state.response.list = [];
    },
    RECEIVED_MENU(state, res) {
        
        state.process.select = false;
        let _data = res.result;
      
        if(!_data) {            
            state.response.list = [];
            return;
        }

        let _dataSort = [];

        for(const _key in _data) {
            let _item1 = _data[_key];
            let _child1 = [];
            let _tmp1 = {
                'id': _item1.id,
                'menu': _item1.name,
                'label': '',
            }

            if(_item1.child) {
                _item1.child.forEach(_item2 => {
                    let _child2 = [];
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

                            _child2.push(_tmp3);
                        })

                        _tmp2.children = _child2;
                    }

                    _child1.push(_tmp2);
                })
                
                _tmp1.children = _child1;
            }

            _dataSort.push(_tmp1);
        }

        state.response.list = _dataSort;
    },
  },
  actions: {
    request_select({commit}, req) {

        return new Promise((resolve, reject) => {

            commit('RECEIVING_MENU');
            
            let _data = {
                'vendor_id': sessionStorage.getItem('vendor_id'),
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            }
            let _hash = md5(JSON.stringify(_data) + '698856a');

            axios.post('/api/menuList', {'data': _data, 'hash': _hash}).then(_res => {
                
                if(_res.data.code != 1000) {
                    resolve(_res.data.code);
                    return;
                }
                
                commit('RECEIVED_MENU', _res.data);
                resolve();
            })
        })
    },
   
    
  },
};

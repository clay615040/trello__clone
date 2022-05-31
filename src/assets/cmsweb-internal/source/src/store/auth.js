
import axios from 'axios'
import md5 from 'js-md5'
import router from '../router'

export default {
    namespaced: true,
    state: {
        isFetching: false,
        errorMessage: ''
    },
    mutations: {
        LOGIN_FAILURE(state, payload) {
            state.isFetching = false
            state.errorMessage = payload
        },
        LOGIN_SUCCESS(state) {
            state.isFetching = false
            state.errorMessage = ''
        },
        LOGIN_REQUEST(state) {
            state.isFetching = true
        },
    },
    actions: {
        loginUser ({dispatch}, req) {
            dispatch('requestLogin');

            var _data = {
                'account': req.account, 
                'password': md5(req.password + '698856a'),
                'time_zone': parseInt(sessionStorage.getItem('time_zone')),
            };
            var _hash = md5(JSON.stringify(_data) + '698856a');
            
            
            axios.post("/api/authenticate", {'data': _data, 'hash': _hash}).then(res=> {
                
                if(res.data.code != 1000) {
                    let _status = (res.data.code == 1012)? 'login_failed': 'unknown_error';
                    dispatch('loginError', _status);
                }
                else {
                    dispatch('receiveToken', res.data.result);
                }                  
            })
            .catch(err => {
                console.log('login err: ', err);
                dispatch('loginError', 'unknown_error');
            });
        },
        receiveToken({dispatch}, res) {
            sessionStorage.setItem('vendor', res.vendor);
            sessionStorage.setItem('vendor_id', res.vendor_id);
            sessionStorage.setItem('vendor_code', res.vendor_code);
            sessionStorage.setItem('vendor_name', res.vendor_name);
            sessionStorage.setItem('user_id', res.user_id);
            sessionStorage.setItem('user_name', res.user_name);
            sessionStorage.setItem('role_id', res.role_id);
            delete res.permit['01']
            delete res.permit['001']
            sessionStorage.setItem('permit', JSON.stringify(res.permit));
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('time_zone', res.time_zone);
            sessionStorage.setItem('exec_time', new Date().getTime());

            axios.defaults.headers.common['Authorization'] = "Bearer " + res.token;
            axios.defaults.headers['Route'] = 'audere';
            dispatch('receiveLogin'); 
        },
        logoutUser() {
            sessionStorage.clear();
            document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            axios.defaults.headers.common['Authorization'] = '';
            axios.defaults.headers['Route'] = '';
            
            if(router.currentRoute.path != '/login') router.push('/login');
        },
        loginError({commit}, payload) {
            commit('LOGIN_FAILURE', payload);
        },
        receiveLogin({commit}) {
            commit('LOGIN_SUCCESS');
            router.push('/');
        },
        requestLogin({commit}) {
            commit('LOGIN_REQUEST');
        },
        request_logout({commit}) {
            commit('LOGOUT_REQUEST');
        }
    },
};

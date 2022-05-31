import axios from "axios";
import md5 from "js-md5";

export default {
    namespaced: true,
    state: {

        timezone: [],

        request: {
            select: {},
            update: {},
        },

        response: {
            select: {},
            update: {},
        },
        
        process: {
            select: false,
            update: false
        }
    },
    mutations: {
        RECEIVING_INFO(state, req) {

            state.process.select = true;
            state.request.select = req;
        },
        RECEIVED_INFO(state, res) {

            state.response.select = res.result[0];
            state.process.select = false;
        },

        UPDATING_INFO(state, req) {

            state.process.update = true;
            state.request.update = req;
        },
        UPDATED_INFO(state, res) {
            
            state.response.update = res;
            state.process.update = false;
        },

        RECEIVING_TIMEZONE(state) {

            state.timezone = [];
        },
        RECEIVED_TIMEZONE(state, res) {

            state.timezone = res;
        },
    
        RESET_STATE(state) {
            state.response.select = {}
        }
    },
    actions: {
        request_select({commit}, req) {
            
            return new Promise(async(resolve, reject) => {
                commit('RECEIVING_INFO', req);

                let _hash;
                let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
                let _userId = parseInt(sessionStorage.getItem('user_id'));

                let _data = {
                    'vendor_id': _vendorId,
                    'time_zone': parseInt(sessionStorage.getItem('time_zone')),
                }
                _hash = md5(JSON.stringify(_data) +  '698856a');
                
                let _res = await axios.post('/api/getVendorInfo', { 'data':_data, 'hash':_hash });

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
                    'subMenu_id': 20100,
                    'action': 'select',
                    'route': '/api/getVendorInfo',
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

                commit('RECEIVED_INFO', _res.data);                
                resolve();
            })
        },

        request_update({commit}, req) {

            return new Promise(async(resolve, reject) => {
                commit('UPDATING_INFO', req);

                let _hash;
                let _vendorId = parseInt(sessionStorage.getItem('vendor_id'));
                let _userId = parseInt(sessionStorage.getItem('user_id'));

                let _data = {
                    'vendor_id': _vendorId,
                    'vendor_name': req.vendorName,
                    'password': req.password,
                    'time_zone': req.timeZone,
                }
                _hash = md5(JSON.stringify(_data) +  '698856a');
                
                let _res = await axios.post('/api/setVendorInfo', { 'data':_data, 'hash':_hash });

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
                    'subMenu_id': 20100,
                    'action': 'update',
                    'route': '/api/updateOperatorInfo',
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
               
                sessionStorage.setItem('time_zone', req.timeZone);

                commit('UPDATED_INFO', _res.data);                
                resolve();
            })
        },
       
        request_timezone({commit}, req) {
            
            commit('RECEIVING_TIMEZONE', req);
            
            let _data = [
                { 'code': '-12', 'desc': '(GMT-12:00) International Date Line West' },
                { 'code': '-11', 'desc': '(GMT-11:00) Midway Island, Samoa' },
                { 'code': '-10', 'desc': '(GMT-10:00) Hawaii' },
                { 'code': '-9', 'desc': '(GMT-09:00) Alaska' },
                { 'code': '-8', 'desc': '(GMT-08:00) Pacific Time (US & Canada)' },
                { 'code': '-8', 'desc': '(GMT-08:00) Tijuana, Baja California' },
                { 'code': '-7', 'desc': '(GMT-07:00) Arizona' },
                { 'code': '-7', 'desc': '(GMT-07:00) Chihuahua, La Paz, Mazatlan' },
                { 'code': '-7', 'desc': '(GMT-07:00) Mountain Time (US & Canada)' },
                { 'code': '-6', 'desc': '(GMT-06:00) Central America' },
                { 'code': '-6', 'desc': '(GMT-06:00) Central Time (US & Canada)' },
                { 'code': '-6', 'desc': '(GMT-06:00) Guadalajara, Mexico City, Monterrey' },
                { 'code': '-6', 'desc': '(GMT-06:00) Saskatchewan' },
                { 'code': '-5', 'desc': '(GMT-05:00) Bogota, Lima, Quito, Rio Branco' },
                { 'code': '-5', 'desc': '(GMT-05:00) Eastern Time (US & Canada)' },
                { 'code': '-5', 'desc': '(GMT-05:00) Indiana (East)' },
                { 'code': '-4', 'desc': '(GMT-04:00) Atlantic Time (Canada)' },
                { 'code': '-4', 'desc': '(GMT-04:00) Caracas, La Paz' },
                { 'code': '-4', 'desc': '(GMT-04:00) Manaus' },
                { 'code': '-4', 'desc': '(GMT-04:00) Santiago' },
                { 'code': '-3.5', 'desc': '(GMT-03:30) Newfoundland' },
                { 'code': '-3', 'desc': '(GMT-03:00) Brasilia' },
                { 'code': '-3', 'desc': '(GMT-03:00) Buenos Aires, Georgetown' },
                { 'code': '-3', 'desc': '(GMT-03:00) Greenland' },
                { 'code': '-3', 'desc': '(GMT-03:00) Montevideo' },
                { 'code': '-2', 'desc': '(GMT-02:00) Mid-Atlantic' },
                { 'code': '-1', 'desc': '(GMT-01:00) Cape Verde Is.' },
                { 'code': '-1', 'desc': '(GMT-01:00) Azores' },
                { 'code': '+0', 'desc': '(GMT+00:00) Casablanca, Monrovia, Reykjavik' },
                { 'code': '+0', 'desc': '(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London' },
                { 'code': '+1', 'desc': '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna' },
                { 'code': '+1', 'desc': '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague' },
                { 'code': '+1', 'desc': '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris' },
                { 'code': '+1', 'desc': '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb' },
                { 'code': '+1', 'desc': '(GMT+01:00) West Central Africa' },
                { 'code': '+2', 'desc': '(GMT+02:00) Amman' },
                { 'code': '+2', 'desc': '(GMT+02:00) Athens, Bucharest, Istanbul' },
                { 'code': '+2', 'desc': '(GMT+02:00) Beirut' },
                { 'code': '+2', 'desc': '(GMT+02:00) Cairo' },
                { 'code': '+2', 'desc': '(GMT+02:00) Harare, Pretoria' },
                { 'code': '+2', 'desc': '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius' },
                { 'code': '+2', 'desc': '(GMT+02:00) Jerusalem' },
                { 'code': '+2', 'desc': '(GMT+02:00) Minsk' },
                { 'code': '+2', 'desc': '(GMT+02:00) Windhoek' },
                { 'code': '+3', 'desc': '(GMT+03:00) Kuwait, Riyadh, Baghdad' },
                { 'code': '+3', 'desc': '(GMT+03:00) Moscow, St. Petersburg, Volgograd' },
                { 'code': '+3', 'desc': '(GMT+03:00) Nairobi' },
                { 'code': '+3', 'desc': '(GMT+03:00) Tbilisi' },
                { 'code': '+3.5', 'desc': '(GMT+03:30) Tehran' },
                { 'code': '+4', 'desc': '(GMT+04:00) Abu Dhabi, Muscat' },
                { 'code': '+4', 'desc': '(GMT+04:00) Baku' },
                { 'code': '+4', 'desc': '(GMT+04:00) Yerevan' },
                { 'code': '+4.5', 'desc': '(GMT+04:30) Kabul' },
                { 'code': '+5', 'desc': '(GMT+05:00) Yekaterinburg' },
                { 'code': '+5', 'desc': '(GMT+05:00) Islamabad, Karachi, Tashkent' },
                { 'code': '+5.5', 'desc': '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
                { 'code': '+5.5', 'desc': '(GMT+05:30) Sri Jayawardenapura' },
                { 'code': '+5.75', 'desc': '(GMT+05:45) Kathmandu' },
                { 'code': '+6', 'desc': '(GMT+06:00) Almaty, Novosibirsk' },
                { 'code': '+6', 'desc': '(GMT+06:00) Astana, Dhaka' },
                { 'code': '+6.5', 'desc': '(GMT+06:30) Yangon (Rangoon)' },
                { 'code': '+7', 'desc': '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
                { 'code': '+7', 'desc': '(GMT+07:00) Krasnoyarsk' },
                { 'code': '+8', 'desc': '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
                { 'code': '+8', 'desc': '(GMT+08:00) Kuala Lumpur, Singapore' },
                { 'code': '+8', 'desc': '(GMT+08:00) Irkutsk, Ulaan Bataar' },
                { 'code': '+8', 'desc': '(GMT+08:00) Perth' },
                { 'code': '+8', 'desc': '(GMT+08:00) Taipei' },
                { 'code': '+9', 'desc': '(GMT+09:00) Osaka, Sapporo, Tokyo' },
                { 'code': '+9', 'desc': '(GMT+09:00) Seoul' },
                { 'code': '+9', 'desc': '(GMT+09:00) Yakutsk' },
                { 'code': '+9.5', 'desc': '(GMT+09:30) Adelaide' },
                { 'code': '+9.5', 'desc': '(GMT+09:30) Darwin' },
                { 'code': '+10', 'desc': '(GMT+10:00) Brisbane' },
                { 'code': '+10', 'desc': '(GMT+10:00) Canberra, Melbourne, Sydney' },
                { 'code': '+10', 'desc': '(GMT+10:00) Hobart' },
                { 'code': '+10', 'desc': '(GMT+10:00) Guam, Port Moresby' },
                { 'code': '+10', 'desc': '(GMT+10:00) Vladivostok' },
                { 'code': '+11', 'desc': '(GMT+11:00) Magadan, Solomon Is., New Caledonia' },
                { 'code': '+12', 'desc': '(GMT+12:00) Auckland, Wellington' },
                { 'code': '+12', 'desc': '(GMT+12:00) Fiji, Kamchatka, Marshall Is.' },
                { 'code': '+13', 'desc': "(GMT+13:00) Nuku'alofa" },
            ];

            commit('RECEIVED_TIMEZONE', _data);
        },
    },
};

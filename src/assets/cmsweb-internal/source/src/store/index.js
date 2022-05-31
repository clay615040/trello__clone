import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';
import auth from './auth';
import localeString from './localeString';
import analytics from './analytics';
import basicInfo from './basicInfo';
import subAccount from './subAccount';
import gameInfo from './gameInfo';
import gameMapping from './gameMapping';
import notifyInfo from './notifyInfo';
import notifyGroup from './notifyGroup';
import notifyRule from './notifyRule';
import whiteList from './whiteList';
import apiRecord from './apiRecord';
import loginRecord from './loginRecord';
import executeRecord from './executeRecord';
import gamePopularityMonthly from './gamePopularityMonthly';
import gamePopularityDaily from './gamePopularityDaily';
import riskControl from './riskControl';
import operator from './operator';
import game from './game';
import role from './role';
import menu from './menu';
import permission from './permission';


Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        layout,
        auth,
        localeString,
        analytics,
        basicInfo,
        subAccount,
        gameInfo,
        gameMapping,
        notifyInfo,
        notifyGroup,
        notifyRule,
        whiteList,
        apiRecord,
        loginRecord,
        executeRecord,
        gamePopularityMonthly,
        gamePopularityDaily,
        riskControl,
        operator,
        game,
        role,
        menu,
        permission
    },
});

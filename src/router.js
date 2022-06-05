import Vue from 'vue';
import Router from 'vue-router';
import CreateLetter from './components/CreateLetter';
import Map from './components/Map';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', component: CreateLetter },
    { path: '/map', component: Map }
  ]
});

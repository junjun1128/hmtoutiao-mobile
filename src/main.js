import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store.js'

// 完整导入vant  将来上线优化按需导入
import Vant from 'vant'
import 'vant/lib/index.less'

import 'amfe-flexible'
import '@/styles/index.less'
Vue.use(Vant)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

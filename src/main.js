import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store.js'

// 完整导入vant  将来上线优化按需导入
// 图片懒加载方法一:vant内置插件
import Vant, { Lazyload } from 'vant'
import 'vant/lib/index.less'

import 'amfe-flexible'
import '@/styles/index.less'

import plugin from '@/utils/plugin'
// import VueLazyload from 'vue-lazyload'  图片懒加载方法二:第三方插件
Vue.use(Vant)
// 使用自己的插件
Vue.use(plugin)
Vue.use(Lazyload)
// Vue.use(VueLazyload)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

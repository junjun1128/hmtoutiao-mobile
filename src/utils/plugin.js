// 提供一个插件  基于vue的插件   包含功能:
// 1.工具函数    2.过滤器   3.自定义指令

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)

// 事件延迟函数
/**
 * 阻碍程序运行,阻碍一秒即可
 *怎么阻碍程序运行 同步写法会阻碍程序运行即await写法可以阻碍程序运行
   而await后面代码返回的必须是promise
 */
const $sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1000)
  })
}

// 过滤器
const relTime = (strDate) => {
  // return dayjs().from(strDate)
  return dayjs().locale('zh-cn').from(strDate)
}

export default {
  install (Vue) {
    // 基于vue的代码   但是逻辑写这里冗余,去外面写
    Vue.prototype.$sleep = $sleep
    Vue.filter('relTime', relTime)
    // 语法:  是全局过滤器语法
    // Vue.filter('过滤器名称',function(被处理的数据){})  var vm = new Vue()
  }
}

/* eslint-disable no-async-promise-executor */
// 频道接口调用的的方法
import request from '@/utils/request.js'
import store from '@/store'
// 本地存储  约定key
const CHANNEL_KEY = 'hm-toutiao-m-80-channels'
// 本地存储  约定value   ===> [{id:'123',name:'css'},...]

// 获取我的频道信息  没登录获取默认频道
// 登录 发请求获取我的频道数据
// 没登录 且未存储到本地   业务:获取默认频道数据,且进行本地存储
// 没登录且已存储    业务:获取本地存储数据,不是promise,在主页调用该获取频道数据的函数时是用await修饰的,
// await修饰的是promise对象的返回函数,所以这里做如下约定:
// 约定:不管任何情况,该函数返回值都是promise对象,作用是获取我的频道,任何一种获取方式格式必须和后台返回的数据一致
export const getMyChannels = () => {
  // return request('/app/v1_0/user/channels', 'get')
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const { user } = store.state
    if (user.token) {
      // 登录了
      const data = await request('/app/v1_0/user/channels', 'get')
      // console.log(data)
      resolve(data) // 把data返回出去
    } else {
      // 未登录
      const channelsStr = window.localStorage.getItem(CHANNEL_KEY)
      if (channelsStr) {
        // 已存储
        const channelsJson = JSON.parse(channelsStr)
        resolve({ channels: channelsJson }) // 后台返回的格式是:{data下的channels}
      } else {
        // 未存储
        const data = await request('/app/v1_0/user/channels', 'get')
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(data.channels))
        resolve(data)
      }
    }
  })
}

// 获取全部频道
export const getAllChannels = () => {
  return request('/app/v1_0/channels', 'get')
}

/**
 * 删除频道api  (支持已登录与未登录两种状态)
 * @param {Integer} channelId - 频道id
 */
export const delChannel = (channelId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
      // 已登录
        await request(`/app/v1_0/user/channels/${channelId}`, 'DELETE')
        resolve()
      } else {
      // 未登录   删除本地的频道(本地频道是数组)
      // 获取本地频道数据  是数组
        const localChannels = JSON.parse(window.localStorage.getItem(CHANNEL_KEY))
        // console.log(localChannels)  json要转成数组
        // 根据id获取索引
        const index = localChannels.findIndex(item => item.id === channelId)
        localChannels.splice(index, 1)
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 添加频道API
 * @param {Array} orderChannels - 排序好的频道数据
 */
export const addChannels = (orderChannels) => {
  // 实现添加频道  登录(调接口)和未登录(更新本地数据)
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
      // 登录
        await request('/app/v1_0/user/channels', 'put', {
          channels: orderChannels
        })
        resolve()
      } else {
      // 未登录  获取  插入添加的频道  存
        const jsonStr = window.localStorage.getItem(CHANNEL_KEY)
        const localChannels = JSON.parse(jsonStr)
        const { id, name } = orderChannels[orderChannels.length - 1] // 插入添加的频道,是我的频道数据的最后一项数据
        localChannels.push({ id, name })
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

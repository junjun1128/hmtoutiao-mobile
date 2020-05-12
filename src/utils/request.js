// 基于配置好的axios  提供一个调用接口函数
// 先装包
import axios from 'axios'
import JSONBIG from 'json-bigint' // 转换后的数据是对象
import store from '@/store'
import router from '@/router'

// 创建一个新的axios实例  进行配置
const instance = axios.create({
  // 1. 基准路径
  baseURL: 'http://ttapi.research.itcast.cn/',
  // 2. 自定义转换响应内容   解决数字最大安全值
  transformResponse: [(data) => {
    try { // data是原始数据   有些接口没有响应内容,data===null的时候,这样转换会报错,所以:try catch
      return JSONBIG.parse(data)
    } catch (e) {
      return data
    }
  }]
})

// 3.请求拦截器 (请求头携带token)
instance.interceptors.request.use(config => {
  // // 修改配置,给请求头加token
  if (store.state.user.token) { // token存在才配置请求头
    config.headers.Authorization = `Bearer ${store.state.user.token}`
  }
  return config
}, err => {
  return Promise.reject(err)
})

// 4.响应拦截器  失败:处理后端token失效,刷新token  成功时:剔除无效数据
instance.interceptors.response.use(res => {
  // res = {data:{data:'数据',message:'信息'}}   剔除无效信息 调接口拿数据就不用{data:{data}}解构了
  try { // data为空时res.data.data报错,所以try  catch
    return res.data.data
  } catch (e) {
    return res.data
  }
  // return res
}, async err => {
  // 处理后端token失效
  // 1.只有401状态,才需要去刷新token
  if (err.response && err.response.status === 401) { // 严谨判断
    // 2.401出现原因: 1.失效了 2.没有登录
    const user = store.state.user
    const login = { path: '/login', query: { redirect: router.currentRoute.path } } // 变量可以复用,其他地方登录也可以用这个变量,提供跳转登录页面的配置对象,方便使用参数
    if (!user.token || !user.refresh_token) {
      // 去登录
      router.push(login)
      // 没有登录的时候,是不能关注的,点击"+关注"会拦截到登录页(就是在这拦截的),已经拦截到登录页了,但还是提示关注成功
      // 老师解释如下:
      // return false // 这样拦截到登录的时候,代码已经执行完了,即点关注拦截到登录还是会提示关注成功
      // 下面这句代码是axios约定如果出现错误,应该返回的内容,即应该返回一个promise的错误调用,才能处理错误
      // 但是return false的话,在拦截到登录的时候,返回的是false,返回false只能阻碍程序运行,也会把false返回出去,
      // axios并不会处理错误,也不会抛出错误,所以就无法阻碍程序运行,所以应该return Promise.reject(err)   这个版本听不懂

      // 群里大佬的解释加上自己的理解,解释为:
      // 1.拦截是在axios的拦截器里拦截的,axios本来就是一个promise,这个promise执行是会执行这个拦截器里面的代码.
      // 如果用return false的话,是结束不了这个promise,代码继续执行,因为要结束promise只能把状态改变为resolve或者reject,
      // 不然就得等代码执行完
      // 2.点击关注按钮,会发送"+关注"的请求,但是被响应拦截器发现没有登录,所以拦截到了登录页,如果用return false,
      // 这个promise结束不了,所以代码会往下执行,接着执行"+关注"的请求,如果用return Promise.reject(err),拦截器拦截到登录
      // 页的时候,这个promise就结束了,跳到登录页,代码就不会往下执行了,就不会继续"+关注"的请求了
      return Promise.reject(err)
    }
    try {
      // 3.(axios实例)发刷新token的请求  instance在头部携带的是token,已经配置完毕,如果用instance
    // 头部携带的永远是token,用不了refresh_token,接口要求的请求头参数是refresh_token所以用axios
      const { data: { data } } = await axios({
        url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
        method: 'put',
        hearders: {
          Authorization: `Bearer ${user.refresh_token}`
        }
      })
      // 发送刷新token请求成功
      // 4.更新vuex和本地token
      store.commmit('setUser', {
        token: data.token,
        refresh_token: user.refearsh_token
      })
      // 5.把刚刚的错误请求发出去  用instance,因为所有设置配置好了,路径也配好了,用axios,基准路径没有
      // instance({请求配置})  err.config对象  是错误请求的配置
      return instance(err.config)
    } catch (e) {
      // 刷新token失败
      // 删除vuex和本地token
      store.commit('delUser')
      router.push(login)
      // 这里也要加这句代码  出现错误,跳去登录了,也要阻碍程序运行
      return Promise.reject(err)
    }
  }
  // 这句代码是axios约定如果出现错误,应该返回的内容,即应该返回一个promise的错误调用,才能处理错误
  return Promise.reject(err)
})

/**
 * url:地址
 * method:请求方式
 * data:提交参数
 */
// 导出一个函数  作用是调用接口
export default (url, method, data) => {
  // 配置好的axios调用接口  需要地址  请求方式  提交参数
  // 1.调接口时,返回一个promise对象,将来异步拿数据方便  这里的instance实例就是axios,所以返回的就是promis
  // 2.以前调接口是instance.get()  =====>  instance( {配置对象} )  配置对象里可以提供url, method, data这些参数
  // 3.axios请求,如果是get请求,参数格式是params,post请求,参数是data格式,取决于method
  //  即该instance方法中,第三个参数请求参数格式是  params:data  或者data:data  key是变化的
  // 怎么在一个对象中动态添加一个属性?  []
  return instance({
    url,
    method,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}

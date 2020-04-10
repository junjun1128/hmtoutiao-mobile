// 管理本地token认证信息
const AUTH_KEY = 'hm-toutiao-m-user'
// 获取用户信息 按需导出一个常量或函数
export const getUser = () => {
  // 这样如果拿到是null,取值null.token会报错,但是{}.token是undefined,不影响程序运行,所以如果是null,默认给一个空对象
  return JSON.parse(window.localStorage.getItem(AUTH_KEY) || '{}') // 后端返回的是json转成js格式对象
}

// 设置用户信息  user是对象格式,所以转成json格式
export const setUser = (user) => {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user)) // js转成json
}

// 删除用户信息
export const delUser = () => {
  window.localStorage.removeItem(AUTH_KEY)
}

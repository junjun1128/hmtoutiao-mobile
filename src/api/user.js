// 用户  相关api调用

import request from '@/utils/request.js'

/**
 * 登录验证
 * @param {string} mobile - 手机号
 * @param {string} code - 验证码
 */
export const login = ({ mobile, code }) => {
  // 调用request函数  得到一个promise对象
  return request(
    '/app/v1_0/authorizations',
    'post',
    {
      // 调用request函数,第三个参数是发请求需要的参数  登录时
      // 需要的参数是mobile和code  登录时才会传这两个参数,即调用login方法时把这两个数据传过来
      mobile,
      code
    }
  )
}

/**
 * 关注用户
 * @param {Integer} userId
 */
export const followings = (userId) => {
  return request('/app/v1_0/user/followings', 'post', {
    target: userId
  })
}

/**
 * 取消关注
 * @param {Integer} userId
 */
export const unfollowings = (userId) => {
  return request('/app/v1_0/user/followings/' + userId, 'delete')
}

// 获取个人中心首页用户信息
export const getUserInfo = () => {
  return request('/app/v1_0/user', 'get')
}

/**
 * 上传头像
 * @param {Object} formDate - 文件对象
 */
export const updatePhoto = (formData) => {
  return request('/app/v1_0/user/photo', 'PATCH', formData)
}

/**
 * 修改用户信息  :这个接口有个小问题,性别改不了
 * @param {Object} user - 用户信息
 */
export const updateUserInfo = ({ name, gender, birthday }) => {
  return request('/app/v1_0/user/profile', 'PATCH', { name, gender, birthday })
}

/**
 * 获取(编辑资料页)用户个人资料
 */
export const getUserProfile = () => {
  return request('/app/v1_0/user/profile', 'get')
}

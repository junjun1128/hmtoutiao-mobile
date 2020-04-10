// 用户  相关api调用

import request from '@/utils/request.js'

/**
 *
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

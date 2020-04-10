<template>
    <div>
      <van-nav-bar left-arrow @click-left="$router.back()" title="登录"></van-nav-bar>
      <van-cell-group>
        <van-field label="手机号" @blur="checkMobile" v-model.trim="loginForm.mobile" :error-message="errMsg.mobile" placeholder="请输入手机号" />
        <van-field label="验证码" @blur="checkCode" v-model.trim="loginForm.code" :error-message="errMsg.code" placeholder="请输入验证码" >
          <van-button class="p5" slot="button" size="mini" type="primary"> 发送验证码</van-button>
        </van-field>
      </van-cell-group>
      <div class="btn_box">
        <van-button type="info" @click="login" block round>登录</van-button>
      </div>
    </div>
</template>

<script>
import { login } from '@/api/user.js'
import { mapMutations } from 'vuex'
// error-message 底部错误提示文案   为空时不展示
export default {
  name: 'user-login',
  data () {
    return {
      // 错误信息对象  有两个错误信息
      errMsg: {
        mobile: '', // 有值代表校验失败,没有值代表校验成功
        code: ''
      },
      // 表单数据
      loginForm: {
        mobile: '13911111111',
        code: '246810'
      }
    }
  },
  methods: {
    // 检验手机号
    checkMobile () {
      // 1.非空校验   2.格式检验
      if (!this.loginForm.mobile) {
        this.errMsg.mobile = '请输入手机号'
        return false
      }
      if (!/^1[3-9]\d{9}$/.test(this.loginForm.mobile)) {
        this.errMsg.mobile = '手机号格式错误'
        return false
      }
      this.errMsg.mobile = ''
    },
    // 检验验证码
    checkCode () {
      // 1.非空校验   2.格式检验
      if (!this.loginForm.code) {
        this.errMsg.code = '请输入验证码'
        return false
      }
      if (!/^\d{6}$/.test(this.loginForm.code)) {
        this.errMsg.code = '验证码格式错误'
        return false
      }
      this.errMsg.code = ''
    },
    ...mapMutations(['setUser']),
    // 整个表单校验
    async login () {
      this.checkMobile()
      this.checkCode()
      // 判断校验结果
      if (this.errMsg.mobile || this.errMsg.code) {
        return false
      }
      try {
        // 成功  登录
        const data = await login(this.loginForm)
        // console.log(data)
        // 登录成功  提示  存储token  根据地址栏是否有回跳地址进行跳转  没有跳转到/user
        this.$toast({ type: 'success', message: '登录成功' })
        // 保存token
        this.setUser(data)
        // 回跳
        const url = this.$route.query.redirect || '/user'
        this.$router.push(url)
      } catch (e) {
        this.$toast({ type: 'fail', message: '登录失败' })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.p5 {
  padding: 0 5px
}
.btn_box  {
  padding: 10px;
  .van-button {
    height: 32px;
    line-height: 30px
  }
}
</style>

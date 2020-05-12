<template>
  <div class="container">
    <div class="user-profile">
      <div class="info">
        <van-image round :src="user.photo" />
        <h3 class="name">
          {{user.name}}
          <br />
          <van-tag size="mini">申请认证</van-tag>
        </h3>
      </div>
      <van-row>
        <van-col span="6">
          <p>{{user.art_count}}</p>
          <p>动态</p>
        </van-col>
        <van-col span="6">
          <p>{{user.follow_count}}</p>
          <p>关注</p>
        </van-col>
        <van-col span="6">
          <p>{{user.fans_count}}</p>
          <p>粉丝</p>
        </van-col>
        <van-col span="6">
          <p>{{user.like_count}}</p>
          <p>被赞</p>
        </van-col>
      </van-row>
    </div>
    <van-row class="user-links">
      <van-col span="8">
        <van-icon name="newspaper-o" color="#7af" />我的作品
      </van-col>
      <van-col span="8">
        <van-icon name="star-o" color="#f00" />我的收藏
      </van-col>
      <van-col span="8">
        <van-icon name="tosend" color="#fa0" />阅读历史
      </van-col>
    </van-row>

    <van-cell-group class="user-group">
      <van-cell icon="edit" title="编辑资料" to="/user/profile" is-link />
      <!-- :to="'/user/chat?photo='+user.photo"是点击跳转到小智同学页面时,将自己的头像传过去,因为聊天功能要显示自己的头像 -->
      <van-cell :to="'/user/chat?photo='+user.photo" icon="chat-o" title="小智同学" is-link />
      <van-cell icon="setting-o" title="系统设置" is-link />
      <van-cell @click="logout()" icon="warning-o" title="退出登录" is-link />
    </van-cell-group>
  </div>
</template>

<script>
import { getUserInfo } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  data () {
    return {
      user: { }
    }
  },
  created () {
    this.getUserInfo()
  },
  methods: {
    ...mapMutations(['delUser']),
    // 退出登录
    logout () {
      // 确认框提示  点击确认,退出:删除token,使用mutations的函数
      this.$dialog
        .confirm({
          title: '温馨提示',
          message: '确认退出登录吗'
        })
        .then(() => {
          // 确认  退出登录
          this.delUser()
          // 跳转 登录页面
          // push 是跳转  追加历史浏览记录跳转
          // replace 是跳转  替换当前的历史浏览记录
          // go back forward
          this.$router.replace('/login')
        })
        .catch(() => {
        // 取消
        // 不做任何事情
        })
    },
    // 获取用户信息
    async getUserInfo () {
      const data = await getUserInfo()
      // console.log(data)
      this.user = data
    }
  }
}
</script>

<style lang="less" scoped>
.user {
  &-profile {
    width: 100%;
    height: 150px;
    display: block;
    background: #3296fa;
    color: #fff;
    .info {
      display: flex;
      padding: 20px;
      align-items: center;
      .van-image {
        width: 64px;
        height: 64px;
      }
      .name {
        font-size: 16px;
        font-weight: normal;
        margin-left: 10px;
      }
      .van-tag {
        background: #fff;
        color: #3296fa;
      }
    }
    p {
      margin: 0;
      text-align: center;
    }
  }
  &-group {
    margin-bottom: 15px;
  }
  &-links {
    padding: 15px 0;
    font-size: 12px;
    text-align: center;
    background-color: #fff;
    .van-icon {
      display: block;
      font-size: 24px;
      padding-bottom: 5px;
    }
  }
}
</style>

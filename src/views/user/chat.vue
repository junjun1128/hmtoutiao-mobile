<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <div class="chat-list" ref="list">
      <div class="chat-item" :class="{left:item.name==='xz',right:item.name==='zj'}" v-for="(item,i) in list" :key="i">
        <!-- 小智的头像,但是不能用src啊,组件上的图片,webpack不能打包,所以import -->
        <van-image v-if="item.name==='xz'" fit="cover" round :src="xzAvatar" />
        <div class="chat-pao">{{item.msg}}</div>
        <van-image v-if="item.name==='zj'" fit="cover" round :src="zjAvatar" />
      </div>
    </div>
    <div class="reply-container van-hairline--top">
      <van-field v-model="value" placeholder="说点什么...">
        <van-loading v-if="sending" slot="button" type="spinner" size="16px"></van-loading>
        <span v-else @click="send()" slot="button" style="font-size:12px;color:#999">提交</span>
      </van-field>
    </div>
  </div>
</template>

<script>
import xzAvatar from '../../assets/images/xz.jpg'
import io from 'socket.io-client'
import { mapState } from 'vuex'
export default {
  name: 'user-chat',
  data () {
    return {
      sending: false,
      // 输入的聊天内容
      value: '',
      // 消息列表  预期的消息列表是:
      // [{name:'小智',msg:''},{name:'自己',msg:''}]
      list: [],
      xzAvatar,
      // 用户自己的头像
      zjAvatar: this.$route.query.photo
    }
  },
  computed: {
    ...mapState(['user'])
  },
  created () {
    // 建立链接
    // 挂载到vue实例下,如果不这样,下面methods中send方法发送消息时,不能用这里的socket
    this.socket = io('http://ttapi.research.itcast.cn', {
      token: this.user.token
    })
    this.socket.on('connect', () => {
      // 默认让小智发一条消息,是模拟的欢迎消息
      this.list.push({ name: 'xz', msg: '您想知道点什么呢?' })
    })
    // 收消息
    this.socket.on('message', (data) => {
      this.list.push({ name: 'xz', msg: data.msg })
      this.scrollBottom()
    })
  },
  methods: {
    send () {
      if (!this.value) return false
      // 发消息
      this.socket.emit('message', { msg: this.value, timestamp: Date.now() }) // 这里的message事件,是前后端约定
      // 好的事件名,后面的参数是个对象,也是接口要求的参数,msg是发送的内容,timestamp是时间戳
      this.list.push({ name: 'zj', msg: this.value })
      this.value = ''
      this.scrollBottom()
    },
    // 滚动到底部
    scrollBottom () {
      this.$nextTick(() => { // 不用nextTick有个现象:
      // 发完消息会滚动不到最底部,因为拿不到DOM
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight
      })
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background: #fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item {
      padding: 10px;
      .van-image {
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao {
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before {
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top: 0.5px solid #c2d9ea;
          border-right: 0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right {
  text-align: right;
  .chat-pao {
    margin-left: 0;
    margin-right: 15px;
    &::before {
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left {
  text-align: left;
  .chat-pao {
    margin-left: 15px;
    margin-right: 0;
    &::before {
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>

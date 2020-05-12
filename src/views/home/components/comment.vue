<template>
  <div class="comment">
    <!-- 评论列表 -->
    <!-- 为什么绑定load事件
      组件初始化的时候.默认触发上拉加载,组件激活的时候,需要手动触发上拉加载
       :immediate-check="false"是阻止默认加载,阻止van-list组件的默认第一次加载,由自己控制加载数据
     -->
    <van-list @load="getComments()" :immediate-check="false" v-model="loading" :finished="finished" finished-text="没有更多了">
      <div class="item van-hairline--bottom van-hairline--top" v-for="item in comments" :key="item.com_id.toString()">
        <van-image
          round
          width="1rem"
          height="1rem"
          fit="fill"
          :src="item.aut_photo"
        />
        <div class="info">
          <p>
            <span class="name">{{item.aut_name}}</span>
            <span style="float:right">
              <span class="van-icon van-icon-good-job-o zan"></span>
              <span class="count">{{item.like_count}}</span>
            </span>
          </p>
          <p>{{item.content}}</p>
          <p>
            <span class="time">{{item.pubdate | relTime}}</span>&nbsp;
            <van-tag plain @click="openReply(item.com_id)">{{item.reply_count}}回复</van-tag>
          </p>
        </div>
      </div>
    </van-list>
    <!-- 底部输入框 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model="value" placeholder="写评论...">
        <van-loading v-if="submiting" slot="button" type="spinner" size="16px"></van-loading>
        <span @click="submit()" class="submit" v-else slot="button">提交</span>
      </van-field>
    </div>
    <!-- 回复 -->
    <van-action-sheet @closed="reply.commentId=null" v-model="showReply" class="reply_dailog" title="回复评论">
      <!-- @closed="reply.commentId=null"为什么关闭的时候把评论id置为空,因为打算用评论id
        进行判断写的是评论还是回复,打开对话框,有评论id,就是写回复,没有评论id就是写的评论
       -->
      <van-list :immediate-check="false" v-model="reply.loading" :finished="reply.finished" finished-text="没有更多了">
        <div class="item van-hairline--bottom van-hairline--top" v-for="item in reply.list" :key="item.com_id.toString()">
          <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
          <div class="info">
            <p><span class="name">{{item.aut_name}}</span></p>
            <p>{{item.content}}</p>
            <p><span class="time">{{item.pubdate | relTime}}</span></p>
          </div>
        </div>
      </van-list>
    </van-action-sheet>
  </div>
</template>

<script>
// 渲染评论列表
// 1.什么时候后获取数据---->组件 激活 时
// 2.van-list组件的load事件,组件初始化时触发
// 3.我们不会使用van-list组件的默认第一次加载,由自己控制
// 4.关闭van-list组件的默认第一次加载事件
// 5.封装api   需要先获取文章id,地址栏获取更方便  this.$route.params.id
import { getComments, commentOrReply } from '@/api/article'
export default {
  name: 'article-commment',
  data () {
    return {
      // 评论列表相关数据
      // 上拉加载中
      loading: false,
      finished: false,
      // 评论列表
      comments: [],
      // 输入框内容
      value: '',
      // 正在提交中
      submiting: false,
      // 偏移量id
      offset: null,
      // ----------------回复相关的数据----------------------
      // 显示回复列表弹框
      showReply: false,
      reply: {
        // 记录当前点击的回复按钮对应的评论的id
        commentId: null,
        loading: false,
        finished: false,
        offset: null,
        // 回复列表
        list: []
      }
    }
  },
  activated () {
    // 每次激活组件,都应获取最新评论,所以要重新获取
    // 开启加载效果
    this.loading = true
    // 重置数据
    this.comments = []
    // 重置完全加载
    this.finished = false
    // 修改offset
    this.offset = null
    // 获取数据
    this.getComments()
  },
  methods: {
    // 提交 评论 或 回复
    async submit () {
      if (this.reply.commentId) {
        // 提交回复逻辑
        if (!this.value) return false
        // 开启提交中
        this.submiting = true
        await this.$sleep
        const data = await commentOrReply(this.reply.commentId, this.value, this.$route.params.id)
        // console.log(data)
        // 成功,提示,回复列表顶部追加回复的信息
        this.reply.list.unshift(data.new_obj)
        // 当前评论的回复数量加一
        // 获取评论
        const comment = this.comments.find(item => item.com_id === this.reply.commentId)
        // 评论的回复数量加一
        comment.reply_count++
        this.value = ''
        // 结束提交中
        this.submiting = false
        this.$toast.success('回复成功')
      } else {
        // 提交评论
        if (!this.value) return false
        const data = await commentOrReply(this.$route.params.id, this.value)
        this.comments.unshift(data.new_obj)
        this.value = ''
        this.submiting = false
      }
    },
    // 打开回复列表
    openReply (id) {
      this.showReply = true
      this.reply.commentId = id
      this.reply.list = []
      this.reply.finished = false
      this.reply.loading = true
      this.reply.offset = null
      this.getReplys()
    },
    // 获取回复数据
    async getReplys () {
      const data = await getComments(this.reply.commentId.toString(), 'c', this.reply.offset)
      console.log(data)
      this.reply.list.push(...data.results)
      this.reply.loading = false
      // 判断是否还有数据
      if (data.end_id < data.last_id) {
        // 还有数据
        this.reply.offset = data.last_id
      } else {
        this.reply.finished = true
      }
    },
    // 获取评论
    async getComments () {
      const data = await getComments(this.$route.params.id, 'a', this.offset)
      // console.log(data)
      this.comments.push(...data.results)
      // 处理加载中效果
      this.loading = false
      if (data.end_id < data.last_id) { // 还有数据
        this.offset = data.last_id
      } else {
        this.finished = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      .name {
        color: #069;
      }
      .zan {
        vertical-align: middle;
        padding-right: 2px;
      }
      .count {
        vertical-align: middle;
        font-size: 10px;
        color: #666;
      }
      .time {
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
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
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}
.reply_dailog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content{
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}
</style>

<template>
    <van-popup :value="value" @input="$emit('input',$event)" @closed="isReport=false">
      <van-cell-group v-if="!isReport">
        <van-cell @click="disLikes()">不感兴趣</van-cell>
        <van-cell is-link @click="isReport=true">反馈垃圾内容</van-cell>
        <van-cell>拉黑作者</van-cell>
      </van-cell-group>
      <van-cell-group v-else>
        <van-cell icon="arrow-left" @click="isReport=false">返回</van-cell>
        <van-cell @click="report(item.value)" v-for="item in reportType" :key="item.value">{{item.label}}</van-cell>
      </van-cell-group>
    </van-popup>
</template>

<script>
import { disLikes, report } from '@/api/article'
import { reportType } from '@/api/constants'
export default {
  props: {
    // 仅读
    value: {
      type: Boolean,
      default: false
    },
    // 接收父组件传递的点击的操作按钮的文章id
    // 超出安全数值  类型是对象  没有超出 类型是数字,
    // 所以规定统一是字符串类型   当然也可以使用多种数据类型
    // articleId: {
    //   type: String
    // }   或者另一种写法
    articleId: {
      type: [Object, Number],
      default: null
    }
  },
  data () {
    return {
      // 是否是举报
      isReport: false,
      reportType
    }
  },
  methods: {
    // 举报文章
    async report (type) {
      try {
        await report(this.articleId, type)
        this.$toast({ type: 'success', message: '举报成功' })
        // console.log(res)
        this.isReport = false
        this.$emit('input', false)
        // 通知父组件删除举报的文章
        this.$emit('on-report')
      } catch (e) {
        console.log(e)
        if (e.response.status === 409) {
          this.$toast('文章已举报')
        } else {
          this.$toast({ type: 'fail', message: '举报失败' })
        }
      }
    },
    // 不感兴趣
    async disLikes () {
      try {
        // 获取当前点击文章id   是在父组件里点击的文章,所以要在父组件记录id,再传给子组件
        // 发不感兴趣请求
        // 成功 提示操作成功
        // 关闭当前对话框
        // 通知文章列表(在父组件) 组件  删除当前点击的文章  用自定义事件
        // console.log(this.articleId)  获取id
        await disLikes(this.articleId)
        this.$toast({ type: 'success', message: '操作成功' })
        this.$emit('input', false)
        this.$emit('on-dislikes')
      } catch (e) {
        this.$toast({ type: 'fail', message: '操作失败' })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.van-popup {
  width: 80%;
  border-radius: 4px;
}
</style>

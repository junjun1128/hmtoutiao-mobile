<template>
    <div class="container">
      <van-nav-bar title="搜索中心" left-arrow @click-left="$router.back()" />
      <van-search
        v-model.trim='q'
        placeholder="请输入搜索关键词"
        shape="round"
        @search="onSearch"
      ></van-search>
      <!-- 联想搜索 -->
      <van-cell-group class="suggest-box" v-if="q">
        <van-cell @click="onSearch(sug.replace(`<span>${q}</span>`,q))" v-for="sug in suggestList" :key="sug" icon="search">
          <p v-html="sug"></p>
        </van-cell>
      </van-cell-group>
      <!-- 历史记录 -->
      <div class="history-box" v-else-if="historyList.length">
        <div class="head">
          <span>历史记录</span>
          <van-icon @click="clearHistory()" name="delete"></van-icon>
        </div>
        <van-cell-group>
          <van-cell v-for="item in historyList" :key="item">
            <a @click="toSearch(item)" class="word_btn">{{item}}</a>
            <van-icon @click="delHistory(item)" class="close_btn" slot="right-icon" name="cross" />
          </van-cell>
        </van-cell-group>
      </div>
    </div>
</template>

<script>
import { suggest } from '@/api/article'
// 使用本地存储记录历史搜索
// 约定key='hm-toutiao-m-80-history'
// 约定:value  数据格式['曾经搜索过的关键字',...]
const KEY = 'hm-toutiao-m-80-history'
export default {
  name: 'search-index',
  data () {
    return {
      // 搜索关键字
      q: '',
      // 历史搜索记录
      historyList: [],
      // 定时器标识
      timer: null,
      // 联想词条
      suggestList: []
    }
  },
  created () {
    this.historyList = JSON.parse(window.localStorage.getItem(KEY) || '[]')
  },
  // 进行联想搜索  获取建议词条
  // 1.当输入的内容发生变化时,根据输入的内容获取建议词条
  // 2.可以使用组件的input事件来监听,再去获取
  // 3.也可以使用watch监听q数据的变化
  // 4.什么时候发请求:规定一个时间,假设是200毫秒,在内容改变后的200毫秒后,才会发请求
  // 如果在200毫秒内又发生数据的改变,停止发送请求,200毫秒后才发送
  // (像不像王者的回城,你回城需要3秒,回城期间,有人打你,停止回城
  // 再回城要重新计时3秒,即3秒发一次请求,3秒内你又输入东西了,停止发请求,3秒后再发)  o-------o--------o
  // 这就是 函数防抖:
  // 规定时间内,只允许执行一次,如果需要再次执行,需要清除上一次执行,重新开始
  // 运用场景:搜索提示(异步),在开销较大操作需要频繁执行的时候(例如:页面尺寸改变,滚动条滚动,表单验证)

  // 5.函数节流:
  // 在规定时间内,再次执行同一件事情,必须等上一次执行完毕,才能再次执行
  // 运用场景:轮播图  例如有4张图,如果连击右边切换按钮多次,并不会从图1直接跳到图4,而是从1跳到2的动画完成以后后才允许再点击按钮
  watch: {
    q () {
      window.clearTimeout(this.timer)
      this.timer = window.setTimeout(async () => {
        // console.log('发请求了...')
        if (!this.q) {
          // 清空搜索联想词条
          this.suggestList = []
          return false
        }
        const data = await suggest(this.q)
        this.suggestList = data.options.map(item => item.toLowerCase().replace(this.q, `<span>${this.q}</span>`))
      }, 200)
    }
  },
  methods: {
    // 点击历史记录的搜索关键字跳转到搜索结果页
    toSearch (text) {
      this.$router.push({ path: '/search/result', query: { q: text } })
    },
    // 清空历史记录
    clearHistory () {
      this.historyList = []
      // window.localStorage.removeItem(KEY)  或者:
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList)) // 即设置为空数组
    },
    // 删除历史记录
    delHistory (text) {
      const index = this.historyList.findIndex(item => item === text)
      this.historyList.splice(index, 1)
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    },
    // 搜索   // 虚拟键盘enter触发
    onSearch (text) { // 看vant文档,回调函数参数text就是输入的内容
      // 搜索的时候触发
      // 保存输入的内容  text
      if (!text) return false
      // this.historyList.push(text)  要去重
      // window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
      // 搜索相同内容时,不能存,先去重  数组去重没有方法   用es6的set()去重,set是构造函数
      // const set = new Set(需要去重的数组)set是一个集合,不能拥有重复数据
      const set = new Set(this.historyList) // 得到一个set集合
      set.add(text) // 不会重复追加text
      // 将set转化成数组,赋值给historyList
      this.historyList = Array.from(set)
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
      // 跳转到搜索结果页面
      this.$router.push({ path: '/search/result', query: { q: text } })
    }
  }
}
</script>

<style lang="less" scoped>
// 历史记录
.history-box {
  padding: 0 20px;
  .head{
    line-height: 36px;
    color: #999;
    .van-icon{
      font-size: 16px;
      float: right;
      margin-top: 10px;;
    }
  }
  .van-cell{
    padding: 10px 0;
  }
  .word_btn{
    color:#3296fa;
  }
  .close_btn{
    margin-top:5px;
    color: #999;
  }
}
// 联想搜索
.suggest-box{
  /deep/ .van-cell{
    padding: 10px 20px;
    color: #999;
    p{
      span{
        color: red;
      }
    }
  }
}
</style>

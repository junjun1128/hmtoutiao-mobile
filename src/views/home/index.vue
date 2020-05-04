<template>
  <div class="container">
    <van-tabs @change="changeChannel" v-model="activeIndex"  :lazy-render="false" swipeable>
      <!-- lazy-render="false"关闭tabs组件懒加载 -->
      <van-tab v-for="item in channels" :title="item.name" :key="item.id">
        <!-- 需要滚动条  实现阅读记忆功能 -->
        <div ref="scroll-wrapper" @scroll="remember($event)" class="scroll-wrapper">
          <van-pull-refresh
            :success-text="refreshSuccessText"
            v-model="activeChannel.downLoading"
            @refresh="onRefresh"
          >
            <van-list v-model="activeChannel.upLoading" :finished="activeChannel.finished" finished-text="没有更多了" @load="onLoad">
              <van-cell v-for="article in activeChannel.articles" :key="article.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{article.title}}</h3>
                  <div class="img_box" v-if="article.cover.type==3">
                    <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[0]" />
                    <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[1]" />
                    <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[2]" />
                  </div>
                  <div class="img_box" v-if="article.cover.type===1">
                      <van-image lazy-load class="w100" fit="cover" :src="article.cover.images[0]"/>
                  </div>
                  <div class="info_box">
                    <span>{{article.aut_name}}</span>
                    <span>{{article.comm_count}}评论</span>
                    <span>{{article.pubdate | relTime}}</span>
                    <span v-if="user.token" class="close" @click="openMoreAction(article.art_id)">
                      <van-icon name="cross"></van-icon>
                    </span>
                  </div>
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 显示频道编辑组件 -->
    <span @click="showChannelEdit=true" class="bar_btn" slot="nav-right">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- 更多操作组件  -->
    <!-- @on-dislikes是自定义事件 -->
    <more-action
     @on-dislikes="removeArticle()"
     @on-report="removeArticle()"
      :articleId="articleId"
      v-if="user.token"
      v-model="showMoreAction"
    ></more-action>

    <!-- 频道编辑组件 -->
    <channel-edit
      :channels="channels"
      v-model="showChannelEdit"
      :activeIndex.sync="activeIndex"
    ></channel-edit>
  </div>
</template>

<script>
import { getMyChannels } from '@/api/channel.js'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import MoreAction from './components/more-action'
import ChannelEdit from './components/channel-edit'
export default {
  name: 'home-index',
  components: { MoreAction, ChannelEdit },
  data () {
    return {
      // 当前激活频道索引
      activeIndex: 0,
      // 刷新成功提示的文案
      refreshSuccessText: null,
      // // 频道列表
      channels: [],
      // 控制更多操作小按钮的显示隐藏
      showMoreAction: false,
      // 点击的更多操作小按钮的 当前文章id
      articleId: null,
      // 编辑频道的显示与隐藏
      showChannelEdit: false
    }
  },
  computed: {
    // 当前激活的频道
    activeChannel () {
      return this.channels[this.activeIndex]
    },
    ...mapState(['user'])
  },
  watch: {
    user () {
      // user发生变化触发该函数  不能用箭头函数  变化时重新更新当前频道数据
      this.activeIndex = 0
      this.getMyChannels()
      this.onLoad()
      // console.log(this.activeChannel)
    }
  },
  created () {
    this.getMyChannels()
    // console.log(this.activeChannel)
  },
  methods: {
    // 删除不感兴趣的文章
    removeArticle () {
      // console.log('ok')
      // 从当前文章列表(数组)移除一个文章  array.splice(index,1)
      const index = this.activeChannel.articles.findIndex(item => item.art_id === this.articleId)
      // console.log(index)
      this.activeChannel.articles.splice(index, 1)
    },
    // 打开more-action中的van-popup 组件   更多操作弹出层
    openMoreAction (artId) {
      this.showMoreAction = true
      this.articleId = artId // 记录当前点击的文章id
    },
    remember (e) {
      // 在当前频道下记录  目前滚动位置 e.target是当前滚动容器
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    activated () {
      // 先获取当前激活的频道的滚动容器  获取之前记录的阅读位置
      // 设置滚动容器的scrollTop为阅读位置即可
      // 给容器加了ref=scroll-wrapper,但是遍历后有多个容器拥有该属性
      const domArr = this.$refs['scroll-wrapper']
      if (domArr) {
        const scrollTop = this.activeChannel.scrollTop
        const scrollWrapper = domArr[this.activeIndex]
        scrollWrapper.scrollTop = scrollTop
      }
    },
    // 监听频道改变事件
    changeChannel () {
      // 没有数据时,主动加载当前频道数据
      if (!this.activeChannel.articles.length) {
        this.activeChannel.upLoading = true
        this.onLoad()
      } else {
        // 有数据时 获取当前激活的滚动容器设置记录的阅读位置即可
        this.$nextTick(() => {
          const domArr = this.$refs['scroll-wrapper']
          const scrollWrapper = domArr[this.activeIndex]
          const scrollTop = this.activeChannel.scrollTop
          scrollWrapper.scrollTop = scrollTop
        })
      }
    },
    // 上拉加载
    async onLoad () {
      // 这个函数会在组件初始化默认加载一次数据,如果数据不够一屏,就再加载一次
      // 触发上拉加载触发当前函数   获取数据  累加  进行列表渲染
      // window.setTimeout(() => {
      //   const data = []
      //   // 1--10   11-20   21--30  31--40
      //   for (
      //     let i = this.articles.length + 1;
      //     i <= this.articles.length + 10;
      //     i++
      //   ) {
      //     data.push(i)
      //   }
      //   // 获取文章列表ok  需要把数据累加到aricles
      //   this.articles.push(...data)
      //   this.upLoading = false
      //   // 所有数据是否加载完毕  加载完毕提示没有更多
      //   if (this.articles.length >= 50) {
      //     this.finished = true
      //   }
      // }, 1000)
      // 获取数据  需要当前频道的id 及当前频道时间戳
      // 获取当前频道  根据tab激活的选项卡获取
      // this.$sleep()函数是promise函数,是异步,即不能阻碍程序运行,所以用await修饰
      // await this.$sleep() // 模拟网络延迟  开发不要弄
      const data = await getArticles(this.activeChannel.id, this.activeChannel.timestamp)
      this.activeChannel.articles.push(...data.results)
      // console.log(data)
      this.activeChannel.upLoading = false
      if (!data.pre_timestamp) {
        this.activeChannel.finished = true
      } else {
        // 记录后端返回的时间戳  下次请求用
        this.activeChannel.timestamp = data.pre_timestamp
      }
    },
    // 下拉刷新
    async onRefresh () {
      // 下拉后松手后触发
      // 获取数据(可能获取到  也可能获取不到,提示即可,不需要替换列表)  获取到数据 替换  进行列表渲染
      // window.setTimeout(() => {
      //   // 获取数据成功
      //   // const data = [1, 2, 3, 4, 5, 6]
      //   const data = []
      //   this.downLoading = false
      //   if (data.length) {
      //     this.articles = data
      //     this.upLoading = false
      //     this.refreshSuccessText = '更新成功'
      //     // 防止数据不够一屏
      //     this.onLoad()
      //   } else {
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 1000)
      // await this.$sleep()
      this.activeChannel.timestamp = Date.now()
      const data = await getArticles(this.activeChannel.id, this.activeChannel.timestamp)
      this.activeChannel.downLoading = false
      if (data.results.length) {
        this.refreshSuccessText = '刷新成功'
        this.activeChannel.articles = data.results
        this.activeChannel.finished = false
        this.onLoad()
      } else {
        this.refreshSuccessText = '暂无更新'
        this.activeChannel.timestamp = data.pre_timestamp // 加载下一页数据用
      }
    },
    // 获取频道列表数据
    async getMyChannels () {
      // 先清空当前频道数据,因为tabs组件会对数据有缓存,清空后再赋值,严谨操作
      // this.channels = [] //  但不知道为啥这样当前频道是undefined,老师的就不是

      const data = await getMyChannels()
      // data.channels  数据格式是[{id,name},...]
      // 但是不满足页面渲染数据的要求,需要转化成另一种格式
      // 需要使用map函数   是数组提供的函数  遍历当前数组  生成新数组
      // 遍历的时候,回调函数的返回值就是新数组中的每一项
      // this.channels = data.channels
      this.channels = data.channels.map(item => ({
        id: item.id,
        name: item.name,
        // 上拉加载
        upLoading: false,
        // 是否下拉刷新
        downLoading: false,
        // 是否加载了所有数据
        finished: false,
        // 文章列表
        articles: [],
        // 获取数据的时间戳
        timestamp: Date.now(),
        // 阅读位置  为什么声明在这里,因为有几个频道就有几个阅读位置,所以声明在频道数据里
        scrollTop: 0
      }))
    }
  }
}
</script>

<style lang="less" scoped>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
.article_item{
  h3{
    font-weight: normal;
    line-height: 2;
  }
  .img_box{
    display: flex;
    justify-content: space-between;
    .w33{
      width: 33%;
      height: 90px;
    }
    .w100{
      width: 100%;
      height: 180px;
    }
  }
  .info_box{
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span{
      padding-right: 10px;
      &.close{
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>

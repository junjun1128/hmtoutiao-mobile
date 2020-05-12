<template>
    <div class='container' ref="container" @scroll="remember($event)">
      <!-- 文章详情部分 -->
      <van-nav-bar fixed title="文章详情" left-arrow @click-left="$router.back()" />
        <div class="detail">
          <h3 class="title">{{article.title}}</h3>
          <div class="author">
            <van-image round width="1rem" height="1rem" fit="fill" :src="article.aut_photo" />
            <div class="text">
              <p class="name">{{article.aut_name}}</p>
              <p class="time">{{article.pubdate | relTime}}</p>
            </div>
            <van-button @click="follow()" round size="small" type="info">{{article.is_followed?'已关注':'+ 关注'}}</van-button>
          </div>
          <div class="content" v-html="article.content"></div>
          <div class="zan">
            <van-button @click="attitude(1)" round size="small" :class="{active:article.attitude===1}" plain icon="like-o">点赞</van-button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <van-button @click="attitude(0)" round size="small" :class="{active:article.attitude===0}" plain icon="delete">不喜欢</van-button>
          </div>
          <!-- 评论与回复 -->
        <comment></comment>
        </div>
    </div>
</template>

<script>
// 渲染详情
// 1.需要数据,但是组件做了缓存,created执行一次,需要在activated执行
// 2.需要文章id,地址栏获取,但是每次this.$route.params.id麻烦,所以计算属性获取id
// 3.在article模块,封装接口

// 阅读记忆实现:
// 1.记录阅读位置,需要声明记录数据,在滚动的时候记录
// 2.当再次来到详情组件,且是上一次阅读的文章,滚动到之前的位置
// 3.当再次来到详情组件,但是是新的文章,需要重置滚动的位置,重新加载数据

// 1.关注  当前用户关注作者  所以要登录
// 2.封装api接口  两个 一个添加关注,一个取消关注   是用户相关的业务,所以写user.js里
// 3.点击按钮,实现两个业务

// 4.有个现象:没有登录的时候,是不能关注的,点击+关注会拦截到登录页,但是提示关注成功
// 即调用接口时出错了,但是并没有阻碍程序运行
import { getArticleDetail, likings, unlikings, disLikes, undisLikes } from '@/api/article'
import { followings, unfollowings } from '@/api/user'
import Comment from './components/comment'
export default {
  components: { Comment },
  name: 'article-index',
  data () {
    return {
      // 文章详情数据
      article: {},
      // 阅读记忆位置
      scrollTop: 0
    }
  },
  computed: {
    // 文章id
    articleId () {
      return this.$route.params.id
    }
  },
  activated () {
    // this.getArticleDetail()
    // console.log(this.$route.params.id)
    // 该钩子激活代表激活了缓存组件
    // 通过新的id(地址栏获取,String)  和旧的id(article文章详情获取,Object/Number)比较,来判断是新的文章详情还是上次阅读的文章详情
    if (this.article.art_id && this.articleId === this.article.art_id.toString()) {
      // 为什么判断this.article.art_id存在?   组件初始化时,进入一个详情,旧的id是没有的,
      // 所以报错,没有旧id也应该去else加载数据,有id才证明之前阅读过
      // 进入这个判断代表两次阅读的是同一篇文章详情
      this.refs.container.scrollTop = this.scrollTop
    } else {
      // 两次阅读的不是同一篇文章详情
      this.article = {} // 清空之前文章数据
      this.scrollTop = 0 // 清空之前滚动位置
      this.getArticleDetail()
    }
  },
  methods: {
    // 4.有个现象:没有登录的时候,是不能关注的,点击+关注会拦截到登录页,但是提示关注成功
    // 即调用接口时出错了,但是并没有阻碍程序运行(拦截到登录后没有阻碍下面的程序运行),拦截器在哪写的,request.js啊,所以去request.js
    // 解决:return Promise.reject(err)
    // 5. 关注是一个用户关注另一个用户,不要使用测试账号,很多文章是自己写的,不能关注自己
    // 添加关注或取消关注
    async follow () {
      // 1.判断执行哪个逻辑
      if (this.article.is_followed) { // 按钮是已关注状态,需要取消关注
        // 取消关注
        await unfollowings(this.article.aut_id)
        // console.log(data)
        this.$toast.success('取消关注成功')
        // 改变按钮状态
        this.article.is_followed = false
      } else {
        // 加关注
        await followings(this.article.aut_id)
        this.$toast.success('添加关注成功')
        // 改变按钮状态
        this.article.is_followed = true
      }
    },
    // 获取详情
    async getArticleDetail () {
      const data = await getArticleDetail(this.articleId)
      // console.log(data)
      this.article = data
    },
    // 阅读记忆
    remember (e) {
      this.scrollTop = e.target.scrollTop
    },
    // 点赞  不喜欢  对文章的态度有三种,-1代表无态度  0代表不喜欢  1代表点赞   取消点赞或取消不喜欢变为无态度
    // 在首页做对文章不感兴趣的时候写过写过一个接口了,对文章不喜欢和不感兴趣用的同一个接口,所以写取消不喜欢就行了
    // 点赞与取消点赞,不喜欢与取消不喜欢
    // 1.准备接口   2.绑定事件,实现逻辑,用一个函数写,两种情况,四种逻辑
    async attitude (type) {
      if (type === 1) {
        // 对点赞按钮的操作
        if (this.article.attitude === 1) { // 代表已经是点赞状态,需要取消点赞
        //  取消点赞
          await unlikings(this.articleId)
          this.article.attitude = -1
        } else {
          // 点赞
          await likings(this.articleId)
          this.article.attitude = 1
        }
      } else {
        // 对不喜欢按钮的操作
        if (this.article.attitude === 0) {
          // 取消不喜欢
          await undisLikes(this.articleId)
          this.article.attitude = -1
        } else {
          // 添加不喜欢
          await disLikes(this.articleId)
          this.article.attitude = 0
        }
      }
      this.$toast.success('操作成功')
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.detail {
  padding: 46px 10px 44px;
  // height: 1000%;  测试滚动
  .title {
    font-size: 18px;
    line-height: 2;
  }
  .zan{
    text-align: center;
    padding: 10px 0;
    .active{
      border-color:red;
      color: red;
    }
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.5;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .content {
    padding: 20px 0;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img{
      max-width:100%;
      background: #f9f9f9;
    }
    // code 是个语义化标签,作用:显示代码格式,但是如果代码很长,不会自动换行
    // 找到代码容器,自动换行
    /deep/ code {
      white-space: pre-wrap;
    }
  }
}
</style>

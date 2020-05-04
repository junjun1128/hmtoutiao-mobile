<template>
    <van-action-sheet @closed="editing=false" :value="value" @input="$emit('input',$event)" title="频道编辑">
      <div class="channel">
        <!-- 我的频道 -->
        <div class="tit">
          我的频道:
          <span class="tip">点击可进入频道</span>
          <van-button v-if="!editing" @click="editing=true" size="mini" type="info" plain>编辑</van-button>
          <van-button v-else @click="editing=false" size="mini" type="danger" plain>完成</van-button>
        </div>
        <van-grid class="van-hairline--left">
          <van-grid-item v-for="(item,i) in channels" :key="item.id">
            <span @click="enterChannel(i)" :class="{red:i===activeIndex}" class="f12">{{item.name}}</span>
            <van-icon @click="delChannel(i,item.id)" v-if="i!==0"  v-show="editing" class="btn" name="cross"></van-icon>
          </van-grid-item>
        </van-grid>
      </div>
      <div class="channel">
        <div class="tit">可选频道：</div>
        <van-grid class="van-hairline--left">
          <van-grid-item v-for="item in optionalChannels" :key="item.id">
            <span class="f12">{{item.name}}</span>
            <van-icon @click="addChannel(item)" class="btn" name="plus"></van-icon>
          </van-grid-item>
        </van-grid>
      </div>
    </van-action-sheet>
</template>

<script>
import { getAllChannels, delChannel, addChannels } from '@/api/channel'
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 父组件传过来的 我的频道 列表 只读
    channels: {
      type: Array,
      // default: []  //这样写语法规范报错,提示应该是一个function
      default: () => []
    },
    // 父组件传过来的当前激活频道下标
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // 正在编辑我的频道
      editing: false,
      // 全部频道
      allChannels: []
    }
  },
  computed: {
    // 可选频道=全部频道-我的频道,所以计算属性
    optionalChannels () {
      return this.allChannels.filter(item =>
        this.channels.findIndex(myItem => myItem.id === item.id) === -1
      )
    }
  },
  created () {
    this.getAllChannels()
  },
  methods: {
    // 添加频道
    async addChannel ({ id, name }) {
      // 调用封装好的Api(支持两种方式)
      // 后端数据格式:
      // 后端对应频道是有排序的,{频道1,序号;3}  {频道2:序号:9}
      // 后端返回频道数据的时候，并没有返回序号，如果想往最后追加数据，需要知道最大序号
      // 采用：是重构式修改，在传递频道数据的同时，在前端排好序提交数据给后端
      // 后端需要的数据不包括推荐频道，它是默认频道，永远排第一
      // 后端需要的数据是：[{id:'频道id',seq:1},...]

      // 前端(本地存储)数据格式：
      // {id:'频道id',name:'频道名字'}
      // 需求:把两个数据合并在一起,在Api中才能实现两个逻辑
      // 最终的数据是:[{id:'频道id',name:'频道名字',seq:1},...最后一个是本地需要的对象]
      const newChannels = this.channels.map((item, i) => ({
        id: item.id,
        name: item.name,
        seq: i
      }))
      newChannels.splice(0, 1) // 推荐频道不参与排序,永远是第一个
      newChannels.push({ id, name, seq: newChannels.length + 1 })
      // console.log(newChannels)
      try {
        // 调用接口实现添加操作
        await addChannels(newChannels)
        // 添加成功 提示  更新组件界面,往channels加入要添加的频道,还有父组件的频道数据
        this.$toast({ type: 'success', message: '添加成功' })
        this.channels.push({
          id,
          name,
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
        })
      } catch (e) {
        this.$toast({ type: 'fail', message: '添加失败' })
      }
    },
    // 删除频道
    async delChannel (index, channelId) {
      try {
        // 调用删除接口删除频道
        // 成功 提示  移除频道(当前组件和父组件的频道)
        await delChannel(channelId)
        this.$toast({ type: 'success', message: '删除成功' })
        // 当前组件channels数据是我的频道,移除一项
        // 父组件传递过来的数据是简单数据类型,不能修改,此时的修改是赋值,赋值会改变引用(指向)
        // 当父组件传递的数据是复杂数据类型,可以修改,修改条件是:保证引用不被修改的情况下,可以修改
        // 当前组件  父组件  都有我的频道数据  他们在内存的指向是一样的
        // this.channels.splice(index, 1)   这样删除不行,有两种情况
        // 1.当激活频道是最后一个频道,删除它的时候,报错(activeIndex找不到激活谁了),所以将当前激活频道往前移一个
        // 2.删除当前激活频道前面的频道,当前激活频道要往前移一位  综合1,2,删除当前激活频道后面的频道是没影响的
        if (index <= this.activeIndex) {
        // this.activeIndex是父组件传过来的简单数据类型,不能修改,所以父组件改
          this.$emit('update:activeIndex', this.activeIndex - 1)
        }
        this.channels.splice(index, 1)
      } catch (e) {
        this.$toast({ type: 'fail', message: '删除失败' })
      }
    },
    // 获取全部频道
    async getAllChannels () {
      const data = await getAllChannels()
      // console.log(data)
      this.allChannels = data.channels
    },
    // 进入频道  进入频道的索引是index  设置给父组件的activeindex就能跳转到想进入的频道
    // 但是父组件传过来的activeIndex是只读的,不能修改,所以把数据交给父组件再修改
    // 给自己绑定一个自定义事件,触发该事件时传递index给父组件
    enterChannel (index) {
      this.$emit('update:activeIndex', index)
      // 关闭编辑频道弹出层
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="less" scoped>
.van-action-sheet {
  max-height: 100%;
  height: 100%;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
}
.channel {
  padding: 10px;
  .tit{
    line-height: 3;
    .tip {
      font-size: 10px;
      color: #999;
    }
  }
  .van-button {
    float: right;
    margin-top: 7px;
  }
  .btn{
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ddd;
    font-size: 12px;
    color: #fff;
  }
  .f12{
      font-size:12px;
      color: #555;
  }
  .red{
    color: red;
  }
}
</style>

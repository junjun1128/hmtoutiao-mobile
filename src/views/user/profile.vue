<template>
    <div class="container">
    <van-nav-bar left-arrow @click-left="$router.back()"  @click-right="save()" title="编辑资料" right-text="保存" >
    </van-nav-bar>
    <van-cell-group>
      <van-cell @click="showPhoto=true" is-link title="头像"  center>
        <van-image
          slot="default"
          width="1.5rem"
          height="1.5rem"
          fit="cover"
          round
          :src="photo"
        />
      </van-cell>
      <van-cell @click="showName=true" is-link title="名称" :value="user.name" />
      <van-cell @click="showGender=true" is-link title="性别" :value="user.gender===0?'男':'女'" />
      <van-cell @click="showBirthday=true" is-link title="生日" :value="user.birthday" />
    </van-cell-group>
    <!-- 选择头像弹出层 -->
    <van-popup v-model="showPhoto" position="bottom">
      <van-cell @click="openChangeFile()" is-link title="从本地相册选择" />
      <van-cell is-link title="拍照" />
    </van-popup>
    <!-- 修改用户名的输入框 -->
    <van-popup v-model="showName" position="bottom">
      <van-field v-model="user.name" required placeholder="请输入用户名" />
    </van-popup>
    <!-- 修改用户性别 -->
    <van-popup v-model="showGender" position="bottom">
      <van-cell @click="changeGender(0)" is-link title="男" />
      <van-cell @click="changeGender(1)" is-link title="女" />
    </van-popup>
    <!-- 日期选择 -->
    <van-popup v-model="showBirthday" position="bottom">
      <van-datetime-picker
        v-model="nowDate"
        type="date"
        :min-date="minDate"
        @cancle="this.showBirthday=false"
        @confirm="confirmDate"
       />
    </van-popup>
    <!-- 文件选择控件 -->
    <input ref="file" @change="upload()" type="file" style="display:none">
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { updatePhoto, getUserProfile, updateUserInfo } from '@/api/user'
export default {
  name: 'user-profile',
  data () {
    return {
      showPhoto: false,
      showName: false,
      showGender: false,
      showBirthday: false,
      // 当前时间
      nowDate: new Date(),
      minDate: new Date('1980-01-01'),
      photo: '',
      // 用户信息
      user: {
        name: '',
        // 性别 0-男   1-女
        gender: 0,
        birthday: '2019-08-08'
      }
    }
  },
  created () {
    this.getUserProfile()
  },
  methods: {
    // 点击保存
    async save () {
      // 获取修改的信息数据,提交数据  成功,提示
      await updateUserInfo(this.user)
      this.$toast.success('保存成功')
    },
    // 获取编辑资料页的用户信息
    async getUserProfile () {
      const data = await getUserProfile()
      // console.log(data)
      this.user = data
      this.photo = data.photo
    },
    // 点击从本地相册选择,打开资源管理器
    openChangeFile () {
      this.$refs.file.click() // 触发file元素的点击,会弹出资源管理器
    },
    // 在资源管理器选择要更新的头像
    async upload () {
      // 获取图片对象
      const file = this.$refs.file.files[0]
      // console.log(file)
      // 组成一个formData
      const formData = new FormData()
      formData.append('photo', file)
      const data = await updatePhoto(formData)
      // console.log(data)
      // 更新头像
      this.photo = data.photo
      this.showPhoto = false
      this.$toast.success('更新成功')
    },
    // 修改性别
    changeGender (type) {
      this.user.gender = type
      this.showGender = false
    },
    // 确认时间
    confirmDate (value) {
      // value是当前选择的时间,格式是日期对象,界面需要的数据birthday是字符串,所以要将value转换格式后赋值给birt
      this.user.birthday = dayjs(value).format('YYYY-MM-DD')
      // dayjs(value)是转换成时间,format是转换时间格式
      this.showBirthday = false
    }
  }
}
</script>

<style lang="less" scoped>
</style>

import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

// 路由懒加载方式导入组件
const Layout = () => import('@/views/Layout.vue')
const Home = () => import('@/views/home')
const Question = () => import('@/views/question')
const Video = () => import('@/views/video')
const User = () => import('@/views/user')
const UserProfile = () => import('@/views/user/profile')
const UserChat = () => import('@/views/user/chat')
const Login = () => import('@/views/user/login')
const Search = () => import('@/views/search')
const SearchResult = () => import('@/views/search/result')
const Article = () => import('@/views/home/article')

Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/', // 子路由有name,父路由不能设置
      component: Layout,
      children: [
        { path: '/', name: 'home', component: Home },
        { path: '/question', name: 'question', component: Question },
        { path: '/video', name: 'video', component: Video },
        { path: '/user', name: 'user', component: User }
      ]
    },
    { path: '/user/profile', name: 'profile', component: UserProfile },
    { path: '/user/chat', name: 'chat', component: UserChat },
    { path: '/login', name: 'login', component: Login },
    { path: '/search', name: 'search', component: Search },
    { path: '/search/result', name: 'search-result', component: SearchResult },
    { path: '/article', name: 'article', component: Article }
  ]
})

// 导航守卫  拦截需要登录才能访问的页面 的访问
// 哪些页面需要拦截  /user   /user/profile   /user/chat   未登录才会拦截
router.beforeEach((to, from, next) => {
  const login = { path: '/login', query: { redirect: to.path } }
  if (to.path.startsWith('/user') && !store.state.user.token) return next(login)
  next()
})

export default router

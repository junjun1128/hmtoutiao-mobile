module.exports = {
  plugins: {
    autoprefixer: {},
    // postcss-pxtorem作用仅用于px转化成rem配置
    // rootValue是37.5,意思是如果有一个100px宽度,会转化成100除以37.5rem
    // 同时依赖js插件flexible  它的作用是设置html的font-size的大小
    // 正好flexible 插件设置rem基准值的规则: 屏幕宽度的十分之一
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*']
    }
  }
}

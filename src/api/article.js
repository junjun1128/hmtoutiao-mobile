// 提供调用文章相关的接口函数
import request from '@/utils/request'

/**
 * 获取文章列表函数
 * @param {Integer} channelId - 频道id
 * @param {String} timestamp - 时间戳,相当于分页页码
 */
export const getArticles = (channelId, timestamp) => {
  return request('app/v1_1/articles', 'get', {
    channel_id: channelId,
    timestamp,
    with_top: 1
  })
}

/**
 * 对文章不感兴趣   又称不喜欢,在文章详情页的不喜欢也是这个接口
 * @param {Object Number} articleId - 文章id
 */
export const disLikes = (articleId) => {
  return request('/app/v1_0/article/dislikes', 'post', {
    target: articleId
  })
}

/**
 * 对文章取消不喜欢
 * @param {Object Number} articleId - 文章id
 */
export const undisLikes = (articleId) => {
  return request('/app/v1_0/article/dislikes/' + articleId, 'delete')
}

/**
 *  点赞文章
 * @param {Object Number} articleId - 文章id
 */
export const likings = (articleId) => {
  return request('/app/v1_0/article/likings', 'post', {
    target: articleId
  })
}

/**
 *  对文章取消点赞
 * @param {Object Number} articleId - 文章i d
 */
export const unlikings = (articleId) => {
  return request('/app/v1_0/article/likings/' + articleId, 'delete')
}

/**
 * 举报文章
 * @param {Number,Object} articleId - 文章id
 * @param {Integer} type - 举报类型
 */
export const report = (articleId, type) => {
  return request('/app/v1_0/article/reports', 'post', {
    target: articleId,
    type
  })
}

/**
 *
 * @param {String}} text - 获取搜索关键字
 */
// 获取联想搜索词条
export const suggest = (text) => {
  return request('/app/v1_0/suggestion', 'get', {
    q: text
  })
}

/**
 * 获取搜索结果
 * @param {Integer} param.page - 页码
 * @param {Integer} param.perPage - 每页几条
 * @param {String; } param.q - 搜索关键字
 */
export const searchArticles = ({ page, perPage = 20, q }) => {
  return request('/app/v1_0/search', 'get', {
    page,
    per_page: perPage,
    q
  })
}

/**
 * 获取文章详情
 * @param {Object,Number} articleId - 文章id
 */
export const getArticleDetail = (articleId) => {
  return request('/app/v1_0/articles/' + articleId, 'get')
}

/**
 * 获取评论列表或回复列表
 * @param {} source - 文章id  或者  评论id
 * @param {String} type - a代表获取评论列表  c代表回复的列表
 * @param {Integer} offset - id偏移量  即每一页数据最后数据的id
 */
export const getComments = (source, type, offset) => {
  return request('/app/v1_0/comments', 'get', { source, type, offset })
}

/**
 * 添加评论  或   对评论回复
 * @param {*} target - 文章ID  或者评论ID
 * @param {*} content - 内容
 * @param {*} articleId - 文章ID,回复的时候需要
 */
export const commentOrReply = (target, content, articleId) => {
  return request('/app/v1_0/comments', 'post', {
    target,
    content,
    art_id: articleId
  })
}

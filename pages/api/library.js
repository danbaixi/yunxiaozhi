const R = require('../../utils/request')

// 获取搜索列表
export function search(data) {
  return R({
    url: 'library/search',
    data,
    needLogin: false
  })
}

// 批量获取封面
export function getBookImgList(data) {
  return R({
    url: 'library/getBookImgList',
    data,
    needLogin: false
  })
}

// 获取配置项
export function getDict(data) {
  return R({
    url: 'library/getDict',
    data,
    needLogin: false
  })
}

// 获取书籍详情
export function getDetail(data) {
  return R({
    url: 'library/getDetail',
    data,
    needLogin: false
  })
}

// 获取首页数据
export function getIndexData(data) {
  return R({
    url: 'library/getIndexData',
    data,
    needLogin: false
  })
}

// 获取热榜
export function getHotBooks(data) {
  return R({
    url: 'library/getHotBooks',
    data,
    needLogin: false
  })
}

// 获取新书
export function getNewBooks(data) {
  return R({
    url: 'library/getNewBooks',
    data,
    needLogin: false
  })
}

// 获取验证码图片
export function getVerifyImg(data) {
  return R({
    url: 'library/getLoginCode',
    data,
    needLogin: false
  })
}

// 登录
export function login(data) {
  return R({
    url: 'library/login',
    data,
    method: 'POST',
    needLogin: false
  })
}

// 获取借阅/收藏记录
export function getMineList(data) {
  return R({
    url: 'library/getMineList',
    data,
    needLogin: false
  })
}

export function checkLogin(data) {
  return R({
    url: 'library/checkLogin',
    data,
    needLogin: false
  })
}

export function reNew(data) {
  return R({
    url: 'library/reNew',
    data,
    needLogin: false
  })
}

// 收藏
export function collect(data) {
  return R({
    url: 'library/addCollect',
    data,
    needLogin: false
  })
}

// 取消收藏
export function cancelCollect(data) {
  return R({
    url: 'library/cancelCollect',
    data,
    needLogin: false
  })
}

// 获取个人数据
export function getUserCount(data) {
  return R({
    url: 'library/getUserCount',
    data,
    needLogin: false
  })
}
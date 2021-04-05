/**
 * 公共函数
 */

const { updateCourse, getCourseList } = require('../pages/api/course')
const { getGlobalConfig } = require('../pages/api/user')
const dayjs = require('dayjs')

// 检查网络异常问题
function checkNetWorkStatus(){
  return new Promise((resolve) => {
    wx.getNetworkType({
      success (res) {
        if(res.networkType == 'unknown' || res.networkType == 'none'){
          resolve('网络未连接，请检查你的网络')
        }
        if(res.networkType == '2g' || res.networkType == '3g'){
          resolve('网络似乎不太顺畅')
        }
        resolve(true)
      }
    })
  })
}

//是否为Tab页路径
function isTabPath(path){
  if(!path) return false
  const tabs = ['pages/index/index','pages/course/course','pages/tool/tool','pages/my/my']
  if(tabs.indexOf(path) > -1){
    return true
  }
  return false
}

// 登录后跳转
function loginRedirect(path){
  if(!path){
    wx.switchTab({
      url: '/pages/index/index'
    })
    return
  }
  if(isTabPath(path)){
    wx.switchTab({
      url: '/' + path,
    })
  }else{
    wx.redirectTo({
      url: '/' + path,
    })
  }
}

//更新并获取课表
async function updateAndGetCourseList(){
  try{
    await updateCourse()
    let res = await getCourseList()
    if(res.status == 0){
      wx.removeStorageSync('course_term')
      wx.removeStorageSync('tmp_class')
      wx.setStorageSync('course', res.data.course)
      wx.setStorageSync('train', res.data.train_course)
      wx.setStorageSync('course_update_time', dayjs().unix())
      return true
    }else if(res.status == 1005){
      //重新获取一遍
      updateAndGetCourseList()
    }
  }catch(error){
    console.log(error)
    setTimeout(() => {
      wx.showToast({
        icon: 'none',
        title: '获取课表失败，请手动更新课表',
        duration: 3000
      })
    },2000)
  }
}

// 打开推文
function openArticle(article){
  wx.navigateTo({
    url: '/pages/article/article?src=' + encodeURIComponent(article)
  })
}

// 退出保存的数据
function exitSaveData(){
  //保留配置信息
  let bg_imgs = wx.getStorageSync('bg_imgs')
  let bg_img = wx.getStorageSync('bg_img')
  wx.clearStorageSync()
  wx.setStorageSync('bg_imgs', bg_imgs)
  wx.setStorageSync('bg_img', bg_img)
  updateGlobalConfig()
}

// 更新配置
function updateGlobalConfig(){
  const time = dayjs().unix()
  getGlobalConfig().then((data) => {
    wx.setStorageSync('config_update_time', time)
    wx.setStorageSync('configs', data.data)
    acceptTerms()
  })
}

// 获取配置，支持使用“.”
// key为空，返回全部
function getConfig(key){
  let configs = wx.getStorageSync('configs')
  if(key){
    let keyArr = key.split('.')
    let result = ""
    if(configs.hasOwnProperty(keyArr[0])){
      result = configs[keyArr[0]]
    }
    if(keyArr.length == 1){
      return result
    }
    for(let i=1;i<keyArr.length;i++){
      if(result.hasOwnProperty(keyArr[i])){
        result = result[keyArr[i]]
      }else{
        return false
      }
    }
    return result
  }
  return configs
}

// 获取登录状态
function getUserId(){
  let user_id = wx.getStorageSync('user_id')
  return user_id == '' ? false : user_id
}

//弹出条款内容
function acceptTerms(){
  let userId = getUserId()
  if(!userId || userId === 'test'){
    return
  }
  let accept_terms = getConfig('accept_terms')
  if(accept_terms == 0){
    wx.navigateTo({
      url: '/pages/terms/terms',
    })
  }
}
module.exports = {
  checkNetWorkStatus,
  loginRedirect,
  updateAndGetCourseList,
  openArticle,
  exitSaveData,
  updateGlobalConfig,
  getConfig,
  getUserId,
}
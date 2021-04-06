/**
 * 公共函数
 */
const { updateCourse, getCourseList } = require('../pages/api/course')
const dayjs = require('dayjs')

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

// 弹出条款内容
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

// 自定义导航返回功能
function backPage(from = ''){
  if (from == 'index') {
    wx.navigateBack({
      delta: 1
    });
  } else {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  }
}

// 判断是否可以更新数据
const UPDATE_TIME = 60 //时间间隔60s
const TIME_KEY = {
  score: 'score_update_time', //成绩
  course: 'course_update_time' //课表
}
function canUpdate(type){
  const key = TIME_KEY[type]
  if(!key){
    return true
  }
  let cacheTime = wx.getStorageSync(key)
  if(!cacheTime){
    return true
  }
  //兼容以ms单位的时间戳
  if((cacheTime.toString()).length == 13){
    cacheTime = parseInt(cacheTime / 1000)
  }
  const now = dayjs().unix()
  const level = cacheTime + UPDATE_TIME - now
  if(level > 0){
    return `请在${level}秒后更新`
  }
  return true
}

function setUpdateTime(type,time){
  wx.setStorageSync(TIME_KEY[type],time)
}

module.exports = {
  loginRedirect,
  updateAndGetCourseList,
  openArticle,
  getConfig,
  getUserId,
  backPage,
  canUpdate,
  setUpdateTime
}
/**
 * 公共函数
 */
const { updateCourse, getCourseList } = require('../pages/api/course')
const { getUserData } = require('../pages/api/user')
const dayjs = require('../utils/dayjs.min')

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
  path = decodeURIComponent(path)
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
      // 不记录时间
      // wx.setStorageSync('course_update_time', dayjs().unix())
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
const UPDATE_TIME = 3600 //时间间隔1h
const TIME_KEY = {
  score: 'score_update_time', //成绩
  course: 'course_update_time', //课表
  attendance: 'attendance_update_time' //考勤
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
    const levelMin = Math.floor(level / 60)
    const levelSecond = level - levelMin * 60
    return `请在${levelMin > 0 ? levelMin + '分钟' : ''}${levelSecond}秒后更新`
  }
  return true
}

// 设置更新时间
function setUpdateTime(type,time){
  time = time || dayjs().unix()
  wx.setStorageSync(TIME_KEY[type],time)
}

// 判断课程是否在当前周
function checkCourseInWeek(week,course){
  let { course_weekly:weekly, course_danshuang:danshuang} = course
  let weeklys = weekly.split(",")
  let weeklyDetail = []
  for(let w of weeklys){
    let s = w.split('-')
    if(s.length > 1){
      weeklyDetail.push(s)
    }else{
      weeklyDetail.push(w)
    }
  }
  if(danshuang == 1 && week % 2 == 0){
    return false
  }
  if(danshuang == 2 && week % 2 == 1){
    return false
  }
  for(let d of weeklyDetail){
    if(Array.isArray(d) && week >= d[0] && week <= d[1]){
      return true
    }
    if(week == d){
      return true
    }
  }
  return false
}

// 获取通知
function getNotice(page){
  const notices = getConfig('notices')
  if(!notices || notices.length <= 0){
    return false
  }
  for(let n of notices){
    if(page == n.page){
      return n
    }
  }
  return false
}

// 通知点击事件
function noticeClickEvent(notice){
  if(notice.url == ''){
    return
  }
  switch(notice.type){
    //文章
    case 1:
      openArticle(notice.url)
      break
    //页面
    case 2:
      wx.navigateTo({
        url: notice.url,
      })
      break
    //小程序
    case 3:
      wx.navigateToMiniProgram({
        appId:this.data.notice.appid,
        path: this.data.notice.url
      })
      break
    //其他
    default:
      console.log('暂不支持跳转')
      break
  }
}

// 获取年级
async function getSchoolDay(){
  let info = wx.getStorageSync('user_info')
  if(!info){
    return false
  }
  if(info['stu_schoolday']){
    return info['stu_schoolday']
  }
  let res = await getUserData()
  info = Object.assign(info,res.data)
  wx.setStorageSync('user_info', info)
  return info['stu_schoolday']
}

// 根据学期编号获取年级
function getGradeFromTerm(schoolDay,term){
  //这里还需要根据学制来考虑是四年还是五年，暂时考虑四年
  let nums = ['一','二','三','四','五']
  let s = (term.toString()).split('-')[0]
  if(s == term){
    s = parseInt(s/10)
  }
  let num = s - schoolDay
  if(num < 0 || num > nums.length - 1){
    return '未知'
  }
  return `大${nums[num]}`
}

// 获取年级列表
async function getGradeList(terms){
  let list = {}
  let schoolDay = await getSchoolDay()
  if(Array.isArray(terms)){
    for(let y of terms){
      list[y] = getGradeFromTerm(schoolDay,y)
    }
  }else{
    for(let y in terms){
      list[y] = getGradeFromTerm(schoolDay,y)
    }
  }
  return list
}

module.exports = {
  loginRedirect,
  updateAndGetCourseList,
  openArticle,
  getConfig,
  getUserId,
  backPage,
  canUpdate,
  setUpdateTime,
  acceptTerms,
  checkCourseInWeek,
  getNotice,
  noticeClickEvent,
  getSchoolDay,
  getGradeFromTerm,
  getGradeList,
}
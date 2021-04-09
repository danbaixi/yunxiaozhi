
const R = require('../../utils/request')

// 获取课表列表
function getCourseList(data){
  return R({
    url: 'course/getList',
    data
  })
}

// 更新课表
function updateCourse(){
  return R({
    url: 'course/updateV1'
  })
}

// 获取理论课程列表
function getTheoryCourseList(){
  return R({
    url: 'course/getTheoryCourse'
  })
}

// 更新理论课程列表
function updateTheoryCourse(){
  return R({
    url: 'course/updateTheoryCourse'
  })
}

// 获取选修课列表
function getPublicCourseList(){
  return R({
    url: 'course/getPublicCourse'
  })
}

// 获取实训课
function getTrainCourseList(){
  return R({
    url:'course/getTrainCourse'
  })
}

// 更新实训课
function updateTrainCourse(){
  return R({
    url:'course/updateTrainCourse'
  })
}

// 添加课程
function addCourse(data){
  return R({
    url:'course/addCourse',
    data,
    method: 'POST',
  })
}

// 删除课程
function delCourse(data){
  return R({
    url: 'course/deleteCourseById',
    data
  })
}

// 获取自定义课程
function getCourseById(data){
  return R({
    url:'course/getCourseById',
    data
  })
}

// 获取同堂同学数量
function getStudentCount(data){
  return R({
    url: "course/getSameCourseStudent",
    data
  })
}

// 获取同堂同学列表
function getStudentList(data){
  return R({
    url: "course/getSameCourseStudent",
    data
  })
}


// 根据班级获取课程学期列表
function getTermByClassname(data){
  return R({
    url:'data/getTermsByClassname',
    data
  })
}

// 根据班级获取课表
function getCourseByClassname(data){
  return R({
    url: 'data/getCourseByClassname',
    data
  })
}

// 获取已收藏班级
function getCollectClass(){
  return R({
    url: 'course/getCollectClasses'
  })
}

// 收藏班级
function addcollectClass(data){
  return R({
    url:'course/collectClass',
    data,
  })
}

// 删除收藏班级
function delCollectClass(data){
  return R({
    url:'course/deleteCollect',
    data
  })
}

// 根据学号获取课表
function getCourseListByStuId(data){
  return R({
    url:'data/getCourseByStuId',
    data,
    needLogin:false
  })
}

// 获取课表背景列表
function getBgList(){
  return R({
    url: 'course/getBgList'
  })
}

// 获取校区设置
function getAreaInfo(){
  return R({
    url: 'user/getareainfo',
  })
}

module.exports = {
  getCourseList,
  updateCourse,
  getTheoryCourseList,
  updateTheoryCourse,
  getPublicCourseList,
  getTrainCourseList,
  updateTrainCourse,
  addCourse,
  delCourse,
  getCourseById,
  getStudentCount,
  getStudentList,
  getTermByClassname,
  getCourseByClassname,
  getCollectClass,
  addcollectClass,
  delCollectClass,
  getCourseListByStuId,
  getBgList,
  getAreaInfo
}
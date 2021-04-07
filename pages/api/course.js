
const R = require('../../utils/request')

// 获取课表列表
function getCourseList(){
  return R({
    url: 'course/getList'
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
  getStudentList
}
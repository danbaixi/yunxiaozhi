
const R = require('../../utils/request')

// 获取课表列表
function getCourseList(redirect){
  return R({
    url: 'course/getList',
    redirect
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

module.exports = {
  getCourseList,
  updateCourse,
  getTheoryCourseList,
  updateTheoryCourse,
  getPublicCourseList,
  getTrainCourseList,
  updateTrainCourse
}
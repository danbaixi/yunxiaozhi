
const R = require('../../utils/request')
const dayjs = require('dayjs')

//获取课表列表
function getCourseList(redirect){
  return R({
    url: 'course/getList',
    redirect
  })
}

function updateCourse(){
  return R({
    url: 'course/updateV1'
  })
}

module.exports = {
  getCourseList,
  updateCourse,
}
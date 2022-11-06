/**
 * 考勤
 * 空教室
 * 校历
 * 考试
 * 免登录数据
 */

const R = require("../../utils/request");

// 获取考勤记录
function getAttendanceList(){
  return R({
    url: 'attendance/getList'
  })
}

// 更新考勤记录
function updateAttendanceList(){
  return R({
    url: 'attendance/update'
  })
}

// 获取教学楼
function getFloors(data){
  return R({
    url: '/Emptyroom/getFloors',
    needLogin: false,
    data
  })
}

// 获取空教室
function getEmptyRoom(data){
  return R({
    url:'Emptyroom/getEmptyRoom',
    needLogin: false,
    data
  })
}

// 获取校历
function getCalendarList(){
  return R({
    url: 'calendar/getCalendarList',
    needLogin: false
  })
}

// 获取等级考试列表
function getExamList(){
  return R({
    url: 'exam/getmylist'
  })
}

// 获取班级列表
function getExamClassList(data){
  return R({
    url:'exam/getClassList',
    data
  })
}

// 获取期末考试列表
function getCourseExamList(data){
  return R({
    url: 'exam/getlist',
    data
  })
}

// 编辑考试记录
function editExam(data){
  return R({
    url: 'exam/editlist',
    data
  })
}

// 删除考试记录
function delExam(data){
  return R({
    url: 'exam/dellist',
    data
  })
}

// 获取班级列表
function getClassList(data){
  return R({
    url:'Classes/getCourseClassList',
    needLogin:false,
    data
  })
}

// 获取课表分享者信息
function getCourseShareInfo(data){
  return R({
    url:'data/getNameByStuId',
    data,
    needLogin:false
  })
}

// 获取离校倒计时数据
function getUserTimeInfo(){
  return R({
    url: 'time/getInfo'
  })
}

// 获取校园新闻
function getSchoolNews(data){
  return R({
    url: 'news/getNews',
    data,
    needLogin:false
  })
}

// 获取文章列表
function getArticleList(data){
  return R({
    url: 'article/getArticleList',
    data,
    needLogin: false,
  })
}

// 获取内容碎片
function getContentByKey(data){
  return R({
    url: 'data/getContent',
    needLogin: false,
    data
  })
}

// 接受使用条款
function acceptTerms(){
  return R({
    url: 'user/acceptTerms'
  })
}

// 获取评教记录
function getAssessList(){
  return R({
    url: "access/getItem",
    method: "POST"
  })
}

// 一键评教
function assess(data){
  return R({
    url: 'access/accessing',
    data,
    method:"POST",
  })
}

// 获取同乡会列表
function getSameCityList(data){
  return R({
    url: 'city/getList',
    needLogin: false,
    data,
  })
}

// 获取羊城通卡号列表
function getYctList(){
  return R({
    url: 'yct/getlist'
  })
}

// 添加羊城通卡号
function addYct(data){
  return R({
    url: 'yct/addlist',
    data,
    method:'POST'
  })
}

// 删除羊城通卡号
function delYct(data){
  return R({
    url: 'yct/delList',
    data
  })
}

// 获取当天打卡记录
function getClockInData(){
  return R({
    url:'clockin/getData'
  })
}

// 早起打卡
function clockIn(){
  return R({
    url:'clockin/clockIn'
  })
}

// 获取打卡排名
function getClockInRank(data){
  return R({
    url:'clockin/getRank',
    data
  })
}

// 获取月份打卡记录
function getClockInListByMonth(data){
  return R({
    url: 'clockin/getListForMonth',
    data
  })
}

// 获取打卡海报
function getClockInPoster(){
  return R({
    url:'clockin/getPoster'
  })
}

// 获取社团列表
function getClubList(data){
  return R({
    url:'club/getList',
    needLogin: false,
    data
  })
}

// 获取社团分类
function getClubCategory(){
  return R({
    url:'/club/getCategory',
    needLogin:false,
  })
}

// 点赞社团
function starClub(data){
  return R({
    url: 'club/star',
    method: 'POST',
    data
  })
}

// 获取社团详情
function getClubItem(data){
  return R({
    url:'club/getItem',
    needLogin:false,
    data
  })
}

// 获取失物招领列表
function getLostList(){
  return R({
    url:'lost/getList',
    needLogin: false
  })
}

// 获取电话本
function getPhoneList(){
  return R({
    url: 'phone/getList',
    needLogin: false
  })
}

// 获取全部选修课列表
function getPublicCourseList(){
  return R({
    url:'Publiccourse/getlist'
  })
}

// 查询水电费
function getQuantityDetail(){
  return R({
    url: 'dormitory/getQuantityDetail'
  })
}

// 通过宿舍号查询水电费
function getQuantityFromDormitory(data) {
  return R({
    url: 'dormitory/getDetailFromDormitory',
    needLogin: false,
    data
  })
}

// 初始化运动排名页面
function initSport(){
  return R({
    url:'sport/init'
  })
}

// 更新运动数据
function updateSport(data){
  return R({
    url: 'sport/updateData',
    method: 'POST',
    data
  })
}

// 获取运动排名
function getSportRank(data){
  return R({
    url: 'sport/getRank',
    data
  })
}

// 获取运动详情
function getSportDetail(data){
  return R({
    url: 'sport/getDetailForMonth',
    data
  })
}

// 初始化毕业报告
function initSummary(){
  return R({
    url: 'user/initSummary'
  })
}

// 获取毕业报告
function getSummary(data){
  return R({
    url: 'share/getSummary',
    needLogin: false,
    data
  })
}

// 获取毕业报告分享海报
function getSummaryPoster(data){
  return R({
    url:'share/getSummaryPoster',
    needLogin: false,
    data
  })
}

// 添加祝福语
function addSummaryBlessing(data){
  return R({
    url:'share/submitBlessing',
    needLogin: false,
    method:'POST',
    data
  })
}

// 切换毕业报告分享开关
function switchSummaryShareStatus(data){
  return R({
    url:'user/switchSummaryShare',
    method:'POST',
    data
  })
}

// 是否隐藏毒鸡汤
function getIsHideSoul(){
  return R({
    url: 'user/isHideSoul'
  })
}

// 获取优惠列表
function getDiscountList(data){
  return R({
    url: 'discount/getList',
    data,
    needLogin: false
  })
}

// 获取优惠分类列表
function getDiscountTypes(){
  return R({
    url: 'discount/getTypes',
    needLogin: false
  })
}

function getSameCityDetail(data) {
  return R({
    url: 'city/getDetail',
    data,
    needLogin: false
  })
}

//初始化空教室查询
function initEmptyRoom() {
  return R({
    url: 'emptyroom/init',
    needLogin: false
  })
}

// 查询空教室v2
function getEmptyRoomV2(data) {
  return R({
    url: 'emptyroom/getEmptyRoomV2',
    data,
    needLogin: false
  })
}

module.exports = {
  getAttendanceList,
  updateAttendanceList,
  getFloors,
  getEmptyRoom,
  getCalendarList,
  getExamList,
  getCourseExamList,
  getExamClassList,
  editExam,
  delExam,
  getClassList,
  getCourseShareInfo,
  getUserTimeInfo,
  getSchoolNews,
  getArticleList,
  getContentByKey,
  acceptTerms,
  getAssessList,
  assess,
  getSameCityList,
  getYctList,
  addYct,
  delYct,
  getClockInData,
  clockIn,
  getClockInRank,
  getClockInListByMonth,
  getClockInPoster,
  getClubList,
  getClubCategory,
  starClub,
  getClubItem,
  getLostList,
  getPhoneList,
  getPublicCourseList,
  getQuantityDetail,
  initSport,
  updateSport,
  getSportRank,
  getSportDetail,
  initSummary,
  getSummary,
  getSummaryPoster,
  addSummaryBlessing,
  switchSummaryShareStatus,
  getIsHideSoul,
  getDiscountList,
  getDiscountTypes,
  getQuantityFromDormitory,
  getSameCityDetail,
  initEmptyRoom,
  getEmptyRoomV2
}
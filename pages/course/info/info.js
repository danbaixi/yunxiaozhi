const app = getApp()
const TIMES = require('../../../utils/course-time.js')
const courseFn = require('../../../utils/course')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sameCount:0,
    showStudent:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(decodeURIComponent(options.data))
    //判断是否是本班课程
    var tmp_class = wx.getStorageSync('tmp_class')
    var course_stu = wx.getStorageSync('course_stu')
    if (tmp_class == "" && !course_stu && data.type == 1) {
      this.setData({
        showStudent: true
      })
      //不获取同堂同学数量，减少数据库查询
      // this.getStudent(data)
    }
    var area = wx.getStorageSync('user_area') || 1 //默认为西校区
    var time, week
    var jie = parseInt(data.jie)
    var jieshu = parseInt(data.jieshu)
    
    let tmpName = data.address.split("楼")
    let floor = '' //教学楼
    let floorNum = 0 //第几层
    let timesData = util.deepCopyArray(TIMES) //数组深拷贝
    if(tmpName.length == 2){
      floor = tmpName[0]
      floorNum = tmpName[1].substr(0, 1)

      //西校区
      if(area == 1){
        if(jie == 3 && jieshu == 2 || jie == 1 && jieshu == 4){
          if((floor == '思齐' || floor == '至善' || floor == '信达') && (floorNum >= 2 && floorNum <= 4)){
            //3-4节连上
            timesData[0][2][0] = "10:10"
            timesData[0][2][1] = ""
            timesData[0][3][0] = ""
            timesData[0][3][1] = "11:40"
          }else if (floor == '博雅' || floor == '德艺' || floor == '躬行') {
            //3-4节分开上
            timesData[0][2][0] = "10:20"
            timesData[0][2][1] = "11:05"
            timesData[0][3][0] = "11:10"
            timesData[0][3][1] = "11:55"
          }
        }
      //北校区
      }else if(area == 2){
        if((jie == 3 && jieshu == 2 || jie == 1 && jieshu == 4) && floorNum > 4){
          //楼层>4的情况，三四节分开上
          timesData[1][2][0] = "10:20"
          timesData[1][2][1] = "11:05"
          timesData[1][3][0] = "11:10"
          timesData[1][3][1] = "11:55"
        }
      }
    }
    let courseTimes = [];
    if(area > 0){
      courseTimes = timesData[area - 1].slice(jie - 1,jie - 1 + jieshu)
    }
    //格式化时间
    if(courseTimes.length > 0){
      let times = []
      for(let i=0,len=courseTimes.length;i<len;i++){
        let t = courseTimes[i]
        if(t[1] == ''){
          times.push(`${t[0]}~${courseTimes[i+1][1]}`)
          i++
        }else{
          times.push(`${t[0]}~${t[1]}`)
        }
      }
      time = times.join(',')
    }else{
      time = '未知'
    }

    switch (parseInt(data.week)) {
      case 1: week = '周一'; break;
      case 2: week = '周二'; break;
      case 3: week = '周三'; break;
      case 4: week = '周四'; break;
      case 5: week = '周五'; break;
    }

    var section = week + ' ' + jie + '-' + (jie + jieshu - 1) + '节';

    data.section = section
    data.time = time

    this.setData({
      area:area,
      course:data
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  rest:function(){
    wx.navigateTo({
      url: '../../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100000581&idx=1&sn=6ef90448df9ac2d4930fa3b15aa8399e&chksm=6a35b9415d423057df293f498fe3027b2ede3fe46000e69fc1a713a90eb7f894aabe416d7fa2#rd'),
    })
  },

  setTime:function(){
    wx.navigateTo({
      url: '../setTime/setTime',
    })
  },

  getStudent:function(data){
    var that = this
    var section = data.jie + '-' + (parseInt(data.jie) + parseInt(data.jieshu) - 1)
    let courseTerm = courseFn.getNowCourseTerm()
    app.httpRequest({
      url: "course/getSameCourseStudent",
      data:{
        term:courseTerm.term,
        name:(data.fullName || data.name),
        weekly:data.zhoushu,
        section:section,
        teacher:data.teacher,
        address: data.fullAddress,
        week:data.week,
        category:data.category
      },
      success:function(res){
        if(res.data.status == 0){
          that.setData({
            sameCount:res.data.data
          })
        }
      }
    })
  },

  goStudents:function(){
    wx.navigateTo({
      url: 'students/students?data=' + encodeURIComponent(JSON.stringify(this.data.course)),
    })
  },

  edit:function(){
    if(this.data.course.id == 0){
      app.msg('获取课程信息失败，请先更新课表')
      return
    }
    wx.navigateTo({
      url: '/pages/course/add/add?id=' + this.data.course.id + '&from=info',
    })
  }
})
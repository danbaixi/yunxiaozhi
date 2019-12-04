const app = getApp()
const TIMES = [
  [
    ["08:20", "09:05"], ["09:10", "09:55"], ["10:20", "11:05"], ["11:15", "12:00"], ["13:50", "14:35"], ["14:35", "15:20"], ["15:40", "16:25"], ["16:25", "17:10"], ["17:50", "18:35"], ["18:35", "19:20"], ["19:20", "20:05"], ["20:05", "20:50"]
  ],
  [
    ["08:30", "09:15"], ["09:20", "10:05"], ["10:20", "11:05"], ["11:10", "11:55"], ["13:45", "14:30"], ["14:35", "15:20"], ["15:35", "16:20"], ["16:25", "17:10"], ["17:45", "18:30"], ["18:35", "19:20"], ["19:25", "20:10"], ["20:15", "21:00"]
  ]
]
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
    if (tmp_class == "") {
      this.setData({
        showStudent: true
      })
      this.getStudent(data)
    }
    var area = wx.getStorageSync('user_area')
    var time, week
    var jie = parseInt(data.jie)
    var jieshu = parseInt(data.jieshu)

    if(area == 1){
      //正常情况
      if (jieshu == 2) {
        if(jie < 5) {
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie - 1][1] + ',' + TIMES[0][jie][0] + '~' + TIMES[0][jie][1]
        }else{
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie][1]
        }
        
      } else if (jieshu == 4) {
        if(jie < 5){
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie - 1][1] + ',' + TIMES[0][jie][0] + '~' + TIMES[0][jie][1] + '、' + TIMES[0][jie + 1][0] + '~' + TIMES[0][jie + 1][1] + ',' + TIMES[0][jie + 2][0] + '~' + TIMES[0][jie + 2][1]
        }else{
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie][1] + '、' + TIMES[0][jie + 1][0] + '~' + TIMES[0][jie + 2][1]
        }
        
      } else if (jieshu == 1) {
        time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie - 1][1]
      } else {
        time = "获取失败"
      }

    }else if(area == 2 && jie > 0){
      time = jieshu == 2 ? (TIMES[1][jie - 1][0] + '~' + TIMES[1][jie - 1][1] + ',' + TIMES[1][jie][0] + '~' + TIMES[1][jie][1]) : (TIMES[1][jie - 1][0] + "~" + TIMES[1][jie + jieshu - 2][1])
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
    app.httpRequest({
      url: "course/getSameCourseStudent",
      data:{
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

  goStudents(){
    wx.navigateTo({
      url: 'students/students?data=' + encodeURIComponent(JSON.stringify(this.data.course)),
    })
  }
})
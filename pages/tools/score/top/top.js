var app = getApp();
var md5 = require('../../../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    color: ["#ff9900","#2d8cf0", "#19be6b"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var course = options.course;
    var score = options.score;
    var credit = options.credit;
    var gpa = options.gpa;
    that.setData({
      course: options.course,
      score: options.score,
      credit: options.credit,
      gpa: options.gpa
    });
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url: 'score/getCourseScoreData',
      data: {
        stu_id : user_id,
        course : course,
        sign: sign,
      },
      success: function(res) {
        if(res.data.status == 1001){
          //排名颜色
          var top = res.data.data.top;
          var num = 0;
          var first = top[0].rank;
          for(var i=0;i<top.length;i++){
            if(top[i].rank != first){
              first = top[i].rank;
              num++;
            }
            top[i].color = num;
          }
          that.setData({
            avg: res.data.data.avg,
            max: res.data.data.max,
            fail_rate: res.data.data.fail_rate,
            my_top: res.data.data.my_top,
            top: top,
          })
        }else{
          app.msg('获取失败')
          wx.navigateBack({});
        }

      },
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '期末成绩还是这里查得最快！',
      path: 'pages/tools/score/score',
      imageUrl: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/score.jpg'
    };
  },
})
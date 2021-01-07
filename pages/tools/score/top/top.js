var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    color: ["#ff9900","#2d8cf0", "#19be6b"],
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let from = options.from;
    if(from != 'score'){
      wx.navigateTo({
        url: '/pages/tools/score/score',
      })
      return
    }
    let score = JSON.parse(decodeURIComponent(options.data));
    //计算平均绩点
    if(!score.gpa && Number(score.score) > 0){
      score.gpa = score.score >= 60 ? ((score.score - 50) / 10).toFixed(2) : 0
    }
    that.setData({
      score:score
    });
    app.isLogin('/' + that.route).then(function (res) {
      that.getData()
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

  getData:function(){
    let that = this
    app.httpRequest({
      url: 'score/getCourseScoreData',
      data: {
        course: that.data.score.name
      },
      success: function (res) {
        if (res.data.status == 0) {
          //排名颜色
          var top = res.data.data.top;
          var num = 0;
          var first = top[0].rank;
          for (var i = 0; i < top.length; i++) {
            if (top[i].rank != first) {
              first = top[i].rank;
              num++;
            }
            top[i].color = num;
          }
          that.setData({
            className: res.data.data.className,
            avg: res.data.data.avg,
            max: res.data.data.max,
            fail_rate: res.data.data.fail_rate,
            my_top: res.data.data.my_top,
            top: top,
            loading: false
          })
        } else {
          app.msg(res.data.message)
          setTimeout(() => {
            wx.navigateBack({});
          }, 1000)
        }

      },
    })
  }
})
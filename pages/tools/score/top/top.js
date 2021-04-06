const app = getApp()
const { getCourseScoreData } = require('../../../api/score')

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
    this.setData({
      score:score
    });
    this.getData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getData:function(){
    let that = this
    getCourseScoreData({
      course: that.data.score.name,
      num: that.data.score.num
    }).then((res) => {
      if (res.status == 0) {
        //排名颜色
        var top = res.data.top;
        var num = 0;
        var first = top[0].rank;
        for (var i = 0; i < top.length; i++) {
          if (top[i].rank != first) {
            first = top[i].rank;
            num++;
          }
          top[i].color = num;
        }
        let data = res.data
        data.top  = top
        data.loading = false
        that.setData(data)
        return
      }
      app.msg(res.data.message)
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    })
  }
})
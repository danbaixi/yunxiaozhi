const app = getApp();
const dayjs = require('../../../../utils/dayjs.min')
const { editExam, delExam } = require('../../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    action:"添加",
    exam_date: '2019-8-25',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.action == 'edit'){
      this.setData({
        id:options.id,
        name:options.name,
        date:options.date,
        address:options.address,
        num:options.num,
        position:options.position,
        action:"修改"
      })
    }else{
      this.setData({
        date: dayjs().format('YYYY-MM-DD')
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  formSubmit: function (e) {
    var that = this;
    var value = e.detail.value;
    var name = value.name;
    var date = value.date;
    var address = value.address;
    var num = value.num;
    var position = value.position;
    if(name==""||date==""){
      app.msg("请输入必填信息")
      return
    }
    wx.showLoading({
      title: "保存中",
      mask: true
    })
    let data = {
      name: name,
      date: date,
      address: address,
      num: num,
      position: position
    }
    if(that.data.id){
      data.id = that.data.id
    }
    editExam(data).then((res) => {
      wx.hideLoading()
      if (res.status == 0) {
        app.msg(`${that.data.action}成功`,"success")
        wx.setStorageSync('my_exams','')
        setTimeout(function () {
          //返回后刷新
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          prevPage.setData({
            isFresh: true
          })
          wx.navigateBack({})
        }, 1000)
      }
    })
  },

  //删除
  del:function(){
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除此记录吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: "加载中",
            mask: true
          })
          delExam({
            id: that.data.id,
          }).then((res) => {
            wx.hideLoading()
            if(res.status == 0){
              app.msg("删除成功","success")
              wx.setStorageSync('my_exams', '')
              setTimeout(function () {
                //返回后刷新
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];
                prevPage.setData({
                  isFresh: true
                })
                wx.navigateBack()
              }, 1000)
            }
          })
        }
      }
    })
  }
})
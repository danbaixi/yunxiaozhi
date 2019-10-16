var md5 = require('../../../../utils/md5.js');
var util = require('../../../../utils/util.js');
var app = getApp();
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
        date: util.formatTime2(new Date())
      })
    }
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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
    }else{
      wx.showLoading({title:"加载中"})
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      if(that.data.action =="修改"){
        app.httpRequest({
          url: 'exam/editlist',
          data: {
            sign: sign,
            id:that.data.id,
            stu_id: user_id,
            name: name,
            date: date,
            address: address,
            num: num,
            position: position
          },
          success: function (res) {
            wx.hideLoading()
            if (res.data.status == 1001) {
              app.msg("修改成功","success")
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
            } else {
              app.msg("修改失败")
            }
          },
        })
        return
      }
      app.httpRequest({
        url: 'exam/addlist',
        data: {
          sign: sign,
          stu_id: user_id,
          name: name,
          date: date,
          address: address,
          num: num,
          position: position
        },
        success: function (res) {
          wx.hideLoading()
          if (res.data.status == 1001) {
            app.msg("添加成功", "success")
            wx.setStorageSync('my_exams', '')
            setTimeout(function () {
              //返回后刷新
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2];
              prevPage.setData({
                isFresh: true
              })
              wx.navigateBack({})
            }, 1000)
          } else {
            app.msg("添加失败")
          }
        },
      })
    }
  },
  //删除
  del:function(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除此记录吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({title:"加载中"})
          var user_id = wx.getStorageSync('user_id');
          var str = app.globalData.key + user_id;
          var sign = md5.hexMD5(str);
          app.httpRequest({
            url: 'exam/dellist',
            data: {
              sign: sign,
              stu_id: user_id,
              id:that.data.id,
            },
            success:function(res){
              wx.hideLoading()
              if(res.data.status == 1001){
                app.msg("删除成功","success")
                wx.setStorageSync('my_exams', '')
                setTimeout(function () {
                  //返回后刷新
                  var pages = getCurrentPages();
                  var prevPage = pages[pages.length - 2];
                  prevPage.setData({
                    isFresh: true
                  })
                  wx.navigateBack({})
                }, 1000)
              }else{
                app.msg("删除失败")
              }
            }
          })
        }
      }
    })
  }
})
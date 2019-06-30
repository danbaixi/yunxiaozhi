const { $Toast } = require('../../../../dist/base/index');
var md5 = require('../../../../utils/md5.js');
var util = require('../../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    action:"添加"
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
      $Toast({type:"warning",content:"请输入必填信息"})
    }else{
      $Toast({ content: '加载中', type: 'loading', duration: 0 });
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      if(that.data.action =="修改"){
        wx.request({
          url: app.globalData.domain + 'exam/editlist',
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
            $Toast.hide();
            if (res.data.status == 1001) {
              $Toast({ content: '修改成功', type: 'success' })
              setTimeout(function () {
                //返回后刷新
                var pages = getCurrentPages();
                var currPage = pages[pages.length - 1];
                var prevPage = pages[pages.length - 2];
                prevPage.setData({
                  isFresh: true
                })
                wx.navigateBack({})
              }, 1000)
            } else {
              $Toast({ content: '修改失败', type: 'error' })
            }
          },
        })
      }else{
        wx.request({
          url: app.globalData.domain + 'exam/addlist',
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
            $Toast.hide();
            if (res.data.status == 1001) {
              $Toast({ content: '添加成功', type: 'success' })
              setTimeout(function () {
                //返回后刷新
                var pages = getCurrentPages();
                var currPage = pages[pages.length - 1];
                var prevPage = pages[pages.length - 2];
                prevPage.setData({
                  isFresh: true
                })
                wx.navigateBack({})
              }, 1000)
            } else {
              $Toast({ content: '添加失败', type: 'error' })
            }
          },
        })
      }
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
          $Toast({ content: '加载中', type: 'loading', duration: 0 });
          var user_id = wx.getStorageSync('user_id');
          var str = app.globalData.key + user_id;
          var sign = md5.hexMD5(str);
          wx.request({
            url: app.globalData.domain + 'exam/dellist',
            data: {
              sign: sign,
              stu_id: user_id,
              id:that.data.id,
            },
            success:function(res){
              $Toast.hide();
              if(res.data.status == 1001){
                $Toast({ content: '删除成功', type: 'success' })
                setTimeout(function () {
                  //返回后刷新
                  var pages = getCurrentPages();
                  var currPage = pages[pages.length - 1];
                  var prevPage = pages[pages.length - 2];
                  prevPage.setData({
                    isFresh: true
                  })
                  wx.navigateBack({})
                }, 1000)
              }else{
                $Toast({ content: '删除失败', type: 'error' })
              }
            }
          })
        }
      }
    })
  }
})
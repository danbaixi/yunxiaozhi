var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
var uploadFn = require('../../../utils/upload.js');
const { $Toast } = require('../../../dist/base/index');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    img_pre:'http://yunxiaozhi-1251388077.file.myqcloud.com/user_imgs/',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var img = options.img;
    var name = options.name;
    var xueji = JSON.parse(options.xueji);
    that.setData({
      user_img: img,
      user_name: name,
      xueji: xueji
    });
  },
  //更新头像
  updateImg:function(){
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const src = res.tempFilePaths[0]
        wx.redirectTo({
          url: `../../cropper/cropper?src=${src}`
        })
      }
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {

  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function (e) {
    this.setData({
      showModal: false
    })
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function (e) {
    this.hideModal();
  },
  //修改昵称窗口打开
  openUpdateName:function(){
    var that = this;
    that.setData({
      showModal: true,
    });
  },
  /**输入验证码时，改变模态框高度 */
  inputFocus: function () {
    this.setData({
      input_focus: 1
    })
  },
  /** 不输入验证码时，恢复 */
  inputBlur: function () {
    this.setData({
      input_focus: 0
    })
  },
  /** 获取昵称 */
  yzmInput: function (e) {
    this.setData({
      nickName: e.detail.value,
    })
  },
  //修改昵称
  UpdateName:function(e){
    var that = this;
    var nickName = that.data.nickName;
    if(nickName == that.data.user_name){
      wx.showToast({ title: '修改成功', icon: 'success' }); 
    }else{
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      wx.request({
        url: app.globalData.domain + 'user/alternickname',
        data: {
          sign:sign,
          stu_id: user_id,
          nickname: nickName,
        },
        success: function (res) {
          if(res.data.status == 1001){
            that.hideModal();
            $Toast({ content: '修改成功', type: 'success' })
            setTimeout(function () {
              //返回后刷新
              var pages = getCurrentPages();
              var currPage = pages[pages.length - 1];  //当前页面
              var prevPage = pages[pages.length - 2]; //上上一个页面
              //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
              prevPage.setData({
                isFresh: true
              });
              wx.navigateBack({})
            }, 1000) 
          }else if(res.data.status == 1003){
            $Toast({content:'用户不存在',type:'error'})
          }else{
            $Toast({ content: '修改失败', type: 'error' })
          }
        }
      })
    }
  }
})
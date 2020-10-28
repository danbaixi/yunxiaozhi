var app = getApp();
var md5 = require('../../../utils/md5.js');
let videoAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.isLogin('/' + that.route).then(function (res) {
      that.getList()
    })
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-3c3771d2ae21a30f'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {})
      videoAd.onClose((res) => {
        that.assess()
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },

  getList:function(){
    var that = this;
    app.httpRequest({
      url: "access/getItem",
      method: "POST",
      success: function (res) {
        that.setData({
          loading:false,
          assess: res.data.data.assess,
          term: res.data.data.term,
          list: res.data.data.list,
          finish: res.data.data.finish,
          totalCount: res.data.data.totalCount
        })
        if(res.data.status != 0){
          app.msg(res.data.message)
        }
      }
    })
  },
  start:function(){
    let _this = this
    if (_this.data.finish) {
      app.msg("你已经完成评教啦！")
      return
    }
    wx.showModal({
      title:'温馨提示',
      content: '您是否愿意花费15秒钟观看一段视频广告？完成后即可一键评教。',
      success:function(res){
        if(res.confirm){
          app.msg("谢谢您的理解与支持")
          if (videoAd) {
            videoAd.show().catch(() => {
              // 失败重试
              videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败')
                })
            })
          }
        }else{
          app.msg("谢谢你的支持")
          setTimeout(() => {
            _this.assess()
          }, 1000);
        }
      }
    })

  },
  assess: function () {
    var that = this;
    app.isBind()
    if(that.data.finish){
      app.msg("你已经完成评教啦！")
      return
    }
    wx.showLoading({
      title: '努力评教中...',
      mask: true
    })
    app.httpRequest({
      url: 'access/accessing',
      data: {
        aid:that.data.assess.id,
      },
      method:"POST",
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 0) {
          app.msg("评教成功！", "success")
          setTimeout(function () {
            that.getList();
          }, 1000);
        } else {
          app.msg(res.data.message)
        }
      }
    })
   
  },
  /** 刷新验证码 */
  freshYzm: function () {
    var num = Math.ceil(Math.random() * 1000000);
    this.setData({
      yzmUrl: app.globalData.domain + 'login/getValidateImg?cookie=' + this.data.cookie + '&rand=' + num,
    })
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
  /**
* 弹窗
*/
  updateScore: function (e) {
    var that = this;
    if (that.checkStatus) {
      app.msg("你已完成评教")
      return
    }
    var system_type = wx.getStorageSync('system_type');
    if (system_type != 2) {
      app.msg("请退出登录后使用旧教务系统账号登录")
      setTimeout(function () {
        app.needLogin(that.route)
      }, 2000)
      return;
    }
    that.setData({
      showModal: true
    });
    var type = e.target.dataset.type
    that.setData({
      type:type
    })
    /**获取验证码 */
    app.httpRequest({
      url: 'login/getLoginInitData',
      needLogin:false,
      success: function (res) {
        that.setData({
          cookie: res.data.data['cookie'],
          __VIEWSTATE: res.data.data['__VIEWSTATE'],
        })
        that.freshYzm();
      }
    });
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
  /** 获取验证码 */
  yzmInput: function (e) {
    this.setData({
      yzm: e.detail.value,
    })
  },

  //旧版获取列表
  assessV0:function(){
    var that = this
    if (that.checkStatus){
      app.msg("你已完成评教")
      return
    }
    var type = that.data.type
    if(type == 1){
      app.msg("正在查询")
    }else{
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    var yzm = that.data.yzm;
    var cookie = that.data.cookie;
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    if (yzm == "") {
      app.msg("请输入验证码")
    } else {
      app.httpRequest({
        url: 'access/accessing',
        method: 'POST',
        data: {
          stu_id: user_id,
          password: user_password,
          code: yzm,
          cookie: cookie,
          __VIEWSTATE: that.data.__VIEWSTATE,
          sign: sign,
          type: type
        },
        success: function (res) {
          wx.hideLoading()
          that.hideModal();
          wx.hideNavigationBarLoading();
          if (res.data.status == 0) {
            that.setData({
              assesses: res.data.data
            })
            wx.setStorageSync('assess', that.data.assesses)
          } else {
            app.msg(res.data.message)
          }
        }
      })
    }
  },

  checkStatus:function(){
    var assess = this.data.assesses
    if (assess.length <= 0){
      return false
    }
    for (let i = 0; i < assess.length;i++){
      if(assess[i].status != '已评'){
        return false
      }
    }
    return true
  },
})
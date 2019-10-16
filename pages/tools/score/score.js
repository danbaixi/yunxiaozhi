var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //页面配置 
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0, 
    isNull:false,
    maxUpdateTime:2,
    refreshAnimation:"",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var winHeight = wx.getSystemInfoSync().windowHeight;
    that.setData({
      from: options.from,
      winHeight: winHeight
    })
    //检查是否登录
    if (!wx.getStorageSync('user_id')){
      wx.reLaunch({
        url: '../../bind/bind',
      })
    }else{
      this.getScore(false);
      this.getNotice()
    }
    var time = (new Date).getTime()
    var score_ad = wx.getStorageSync('score_ad_display');
    if(score_ad == '' || (score_ad!=''&& Math.floor((time-score_ad)/1000)>app.globalData.adTime*24*60)){
      var interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-fa394b5b086dc048'
      })
      interstitialAd.show()
      wx.setStorageSync('score_ad_display', time)
    }

  },

  /**
   * 下拉刷新，更新成绩
   */
  onPullDownRefresh:function(){
    var that = this;
    wx.stopPullDownRefresh();
    if (wx.getStorageSync('system_type') != 2){
      wx.clearStorageSync('user_id');
      wx.redirectTo({
        url: '/pages/bind/bind',
      })
      wx.showToast({
        title: '请使用旧的教务系统账号登录',
        icon: 'none'
      })
      return
    }
    that.update()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('您有一份期末成绩单待查收','score.png',this.route)
  },
  /** 
 * 滑动切换tab 
 */
  bindChange: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    var scores = wx.getStorageSync('scores');
    var that = this;
    that.setData({ 
      currentTab: e.detail.current
    });
  },
  /**
   * 进入成绩详情
   */
  itemData:function(e){
    var that = this;
    var course = e.currentTarget.dataset.course;
    var score = e.currentTarget.dataset.score;
    var credit = e.currentTarget.dataset.credit;
    var gpa = e.currentTarget.dataset.gpa;
    wx.navigateTo({
      url: 'top/top?course='+course+'&score='+score+'&credit='+credit+'&gpa='+gpa,
    })
  },
  analysis:function(){
    wx.navigateTo({
      url:'ana/ana'
    })
  },
  refresh:function(){
    this.onPullDownRefresh();
  },
  //获取成绩
  getScore:function(update){
    var that = this;
    wx.showLoading({title:"加载中"})
    var scores = wx.getStorageSync('scores');
    if(scores!=''&& scores.score.length>0 && !update){
      that.setData({
        avg: scores.avg,
        score: scores.score,
        term: scores.term
      })
      wx.hideLoading()
    }else{
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      app.httpRequest({
        url: 'score/getscorelist',
        data: {
          sign: sign,
          stu_id: user_id
        },
        success: function (res) {
          wx.hideLoading()
          if (res.data.status == 1001) {
            wx.setStorageSync('scores', res.data.data);
            that.setData({
              avg: res.data.data.avg,
              score: res.data.data.score,
              term: res.data.data.term
            })
          } else if (res.data.status == 1002) {
            app.msg('获取失败')
          } else if (res.data.status == 1003) {
            that.setData({
              isNull: true
            })
          }
        },
      });
    }
  },

  //获取公告
  getNotice: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'notice/getnotice',
      data: {
        page: 'score'
      },
      success: function (res) {
        if (res.data.status == 1001) {
          that.setData({
            hasNotice: res.data.data.display == 1 ? true : false,
            notice: res.data.data.content
          })
        } else {
          that.setData({
            hasNotice: false
          })
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
  updateScore: function () {
    var that = this;
    var system_type = wx.getStorageSync('system_type');
    if (system_type != 2) {
      app.msg("请使用旧教务系统账号登录后更新成绩")
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/bind/bind',
        })
      }, 2000)
      return;
    }
    // that.setData({
    //   showModal: true
    // });
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
  //更新成绩
  update:function(){
    var that = this;
    that.setData({ list_is_display: false })
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      app.msg("请先登录")
      return;
    }
    var time = (new Date()).getTime();
    if (wx.getStorageInfoSync('score_update_time') != "") {
      var update_time = wx.getStorageSync('score_update_time');
      var cha = time - update_time;
      var season = 60 - Math.floor(cha / 1000);
    } else {
      var season = 0;
    }
    if (season > 0) {
      app.msg('请在'+season + '秒后更新')
      return
    }
    wx.showLoading({ title: "更新中" })
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    var yzm = that.data.yzm;
    var cookie = that.data.cookie;
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    // if (yzm == "") {
    //   app.msg("请输入验证码")
    //   return
    // }
    app.httpRequest({
      url: 'score/updateScoreV0',
      data: {
        stu_id: user_id,
        password: user_password,
        // code: yzm,
        // cookie: cookie,
        // __VIEWSTATE: that.data.__VIEWSTATE,
        sign: sign
      },
      success: function (res) {
        wx.hideLoading()
        that.hideModal();
        wx.hideNavigationBarLoading()
        if (res.data.status == 1001) {
          app.msg('更新了' + res.data.data + '条记录')
          if (res.data.data > 0) {
            that.setData({
              isNull: false
            })
            wx.setStorageSync('scores', '')
            that.getScore(true);
          }
          wx.setStorageSync('score_update_time', time);
        } else {
          if (res.data.status == 1002) {
            that.freshYzm()
          } else if (res.data.status == 1006) {
            that.setData({
              showModal: false
            })
          }
          app.msg(res.data.message)
        }
      }
    })
  },
  backPage:function(){
    if(this.data.from == 'index'){
      wx.navigateBack({
        delta: 1
      });
    }else{
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  }
})
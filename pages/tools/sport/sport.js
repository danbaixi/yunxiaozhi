const app = getApp()
import WxCountUp from '../../../utils/wxCountUp.js'
const util = require('../../../utils/util')
const { getSportRank, initSport, updateSport, } = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayStep:0,
    updateTime: '',
    updateInterval: 60, // 更新间隔
    headImgUrl:app.globalData.headImgUrl,
    top1:'https://mmbiz.qpic.cn/mmbiz_png/YWKTC18p77IXCxFpXwo31LIxHxGjFXeyAsXtoFPPelRDxwk4ogViaewhrQa9mnw6Zpjac1icVGgHHGFQTpX2ksBg/0?wx_fmt=png',
    top2:'https://mmbiz.qpic.cn/mmbiz_png/YWKTC18p77IXCxFpXwo31LIxHxGjFXeyViaqXsmGoy0SicrSgsjeoMaJwEYbbXY6xPJWdrLEZicUDSGRvKh5fESJA/0?wx_fmt=png',
    top3:'https://mmbiz.qpic.cn/mmbiz_png/YWKTC18p77IXCxFpXwo31LIxHxGjFXeyjTNgIibh8PhiawWWV12P6kFAgYYhibtuKl7pjP6Nia5s8EbCr2YOic2QXqw/0?wx_fmt=png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isLogin(this.route).then(() => {
      this.init()
      this.getRank()
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title:"谁是白云最高步数的人？"
    }
  },

  init:function(){
    let _this = this
    _this.setData({
      stuId: app.getUserId()
    })
    initSport().then((res) => {
      if(res.status == 0){
        _this.setData(res.data)
        if(res.data.updateTime){
          _this.getData(true)
          return
        }
        _this.numberRun(res.data.todayStep)
      }
    })
  },

  getData:function(refresh){
    if(!app.getUserId()){
      app.msg("登录后才能参与运动排名")
      return
    }
    let _this = this
    let sport_update_time = wx.getStorageSync('sport_update_time')
    let now_time = parseInt(new Date().getTime() / 1000)
    let times = now_time - sport_update_time
    if(sport_update_time &&  times < _this.data.updateInterval){
      if(refresh !== true){
        app.msg(`请在${_this.data.updateInterval - times}秒后刷新`)
      }
      return
    }
    wx.login({
      success: (res) => {
        let code = res.code
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.werun']) {
              wx.authorize({
                scope: 'scope.werun',
                success () {
                  _this.getWeRunData(code)
                }
              })
            }else{
              _this.getWeRunData(code)
            }
          }
        })
      },
      fail: () => {
        app.msg('初始化失败，请重试')
      }
    })
    
  },

  getWeRunData:function(code){
    let _this = this
    app.msg("同步数据中","loading")
    wx.getWeRunData({
      success (result) {
        updateSport({
          code: code,
          iv: result.iv,
          encryptedData: result.encryptedData
        }).then((res) => {
          if(res.status == 0){
            //刷新
            _this.setData(res.data)
            _this.numberRun(res.data.todayStep)
            let list = _this.data.list
            let len = list.length
            if(len == 0 || res.data.todayStep > list[len-1].step){
              _this.getRank(true)
            }
            let now_time = parseInt(new Date().getTime() / 1000)
            wx.setStorageSync('sport_update_time', now_time)
          }
        })
      }
    })
  },

  //数字滚动
  numberRun:function(number){
    this.countUp = new WxCountUp('todayStep', number, {separator:''}, this)
    this.countUp.start()
  },

  viewDetail:function(){
    wx.navigateTo({
      url: '/pages/tools/sport/detail/detail',
    })
  },

  viewClockin:function(){
    wx.navigateTo({
      url: '/pages/tools/clockin/clockin',
    })
  },

  viewSetting:function(){
    wx.navigateTo({
      url: '/pages/my/set/set',
    })
  },

  getRank:function(refresh){
    let _this = this
    getSportRank({
      update: refresh === true ? true : false
    }).then((res) => {
      if(res.status == 0){
        let list = res.data.list
        list.map((item) => {
          item.name = util.isDefaultNickname(item.user_name) ? item.nickname : item.user_name
          return item
        })
        _this.setData({
          list: list
        })
      }
    })
  }
})
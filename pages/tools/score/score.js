const { getScoreList, updateScore } = require('../../api/score') 
const { getNotice } = require('../../api/common')
const { canUpdate, setUpdateTime, backPage } = require('../../../utils/common')
const dayjs = require('dayjs')
const app = getApp()
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
    StatusBar: app.globalData.statusBar,
    CustomBar: app.globalData.customBar,
    Custom: app.globalData.custom,
    termNumber:[2,1],
    year_index:0,
    type:1, // 0为有效成绩，1为原始成绩
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var winHeight = wx.getSystemInfoSync().windowHeight;
    let update_time = wx.getStorageSync('score_update_time')
    that.setData({
      from: options.from,
      winHeight: winHeight,
      update_time: update_time ? dayjs.unix(update_time).format('YYYY-MM-DD HH:mm:ss') :'无记录'
    })
    app.isLogin(that.route).then(function (res) {
      that.getScore(false)
    })
  },

  /**
   * 下拉刷新，更新成绩
   */
  onPullDownRefresh:function(){
    app.msg('请点击黄色按钮更新成绩')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('您有一份期末成绩单待查收','score.png',this.route)
  }, 
  
  // 进入成绩详情
  itemData:function(e){
    let type = this.data.type
    let score = type == 1 ? this.data.original_score : this.data.score
    let index = e.currentTarget.dataset.index;
    let data = score[index]

    if (type == 1 && !this.hasEffectScore(data.name)) {
      app.msg("该科目暂没有有效成绩，不支持查看排名")
      return
    }
    wx.navigateTo({
      url: 'top/top?from=score&data=' + encodeURIComponent(JSON.stringify(data))  
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

  // 获取成绩
  getScore:function(update){
    var that = this;
    //读缓存
    var scores = wx.getStorageSync('scores');
    if (scores != '' && JSON.stringify(scores) != "{}" && scores.score.length>0 && !update){
      that.setData({
        loading: false,
        gpa: scores.gpa,
        score: scores.score,
        term: scores.term,
        year: scores.year,
        original_score: scores.originalScore
      })
      return
    }
    // 读数据库
    getScoreList(that.route).then((res) => {
      that.setData({
        loading:false
      })
      if(res.status == 0){
        wx.setStorageSync('scores', res.data.data);
          that.setData({
            isNull: false,
            gpa: res.data.gpa,
            score: res.data.score,
            term: res.data.term,
            year: res.data.year,
            original_score: res.data.originalScore
          })
      }else if(res.status == 1001){
        that.setData({
          isNull:true
        })
      }else{
        app.msg(res.message)
      }
    })
  },

  // 获取公告
  getNotice: function () {
    var that = this
    getNotice({
      page: 'score'
    }).then((res) => {
      if (res.status == 1001) {
        that.setData({
          hasNotice: res.data.display == 1 ? true : false,
          notice: res.data.content
        })
      }else {
        that.setData({
          hasNotice: false
        })
      }
    })
  },

  //更新成绩
  update:function(){
    if(app.getUserId() === 'test'){
      app.msg('测试号无法更新数据')
      return
    }
    var that = this;
    that.setData({ list_is_display: false })
    const canUpdateResult = canUpdate('score')
    if(canUpdateResult !== true){
      app.msg(canUpdateResult)
      return
    }
    wx.showLoading({
      title: "更新中..",
      mask: true
    })
    const time = dayjs().unix()
    updateScore({time})
      .then((res) => {
        if (res.status == 0) {
          app.msg(res.message,'success') 
          wx.setStorageSync('scores', '')
          that.getScore(true)
          setUpdateTime('score',time)
          that.setData({
            update_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
          })
        } else {
          if (res.status == 1002) {
            that.freshYzm()
          } else if (res.status == 1006) {
            that.setData({
              showModal: false
            })
          }
        }
      })
  },
  backPageBtn:function(){
    backPage(this.data.from)
  },

  selectYear:function(e){
    let index = e.detail.value
    this.setData({
      year_index: index
    })
  },

  goRank:function(e){
    let term  = e.currentTarget.dataset.term
    if (!this.data.gpa.hasOwnProperty(term)){
      app.msg("当前学期还未出有效成绩，不支持查看排名")
      return
    }
    wx.navigateTo({
      url: 'rank/rank?source=score&term=' + term,
    })
  },

  //切换成绩模式
  changeType:function(e){
    let val = e.currentTarget.dataset.val
    if(!val){
      val = this.data.type == 0 ? 1 : 0
    }
    this.setData({
      type: val
    })
  },

  //是否存在有效成绩
  hasEffectScore:function(name){
    if(this.data.score.length <= 0){
      return false
    }
    let isExist = false
    this.data.score.forEach(function(s){
      if(s.name == name){
        isExist = true
        return
      }
    })
    return isExist
  },

  viewAllScore:function(){
    wx.navigateTo({
      url: '/pages/tools/credit/credit',
    })
  }
})
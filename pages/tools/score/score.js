const {
  getScoreList,
  updateScore,
  getScoreDemand,
  subscribeScore
} = require('../../api/score')
const {
  getNotice
} = require('../../api/common')
const {
  canUpdate,
  setUpdateTime,
  backPage,
  getGradeList
} = require('../../../utils/common')
const dayjs = require('../../../utils/dayjs.min')
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
    isNull: false,
    maxUpdateTime: 2,
    refreshAnimation: "",
    StatusBar: app.globalData.statusBar,
    CustomBar: app.globalData.customBar,
    Custom: app.globalData.custom,
    termNumber: [2, 1],
    year_index: 0,
    type: 1, // 0为有效成绩，1为原始成绩
    loading: true,
    showUpdate: false, // 显示更新弹窗
    updateScoreStatus: false, // 正在更新课表状态
    updateList: [], // 更新记录
    updateMaxCount: 3, // 最多更新次数
    updateStatus: app.globalData.updateStatus
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
      update_time: update_time ? dayjs.unix(update_time).format('YYYY-MM-DD HH:mm:ss') : '无记录'
    })
    app.isLogin(that.route).then(function (res) {
      that.getScore(false)
      that.getScoreDemand()
    })
    // ad
    var time = (new Date).getTime()
    var score_ad = wx.getStorageSync('score_v2_ad_display');
    if (!score_ad || (Math.floor((time - score_ad) / 1000) > 24 * 60)) {
      if (wx.createInterstitialAd) {
        var interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-0012824b1281826a'
        })
        setTimeout(() => {
          interstitialAd.show()
        }, 1500)
        wx.setStorageSync('score_v2_ad_display', time)
      } else {
        app.msg("您当前微信版本较低，建议升级到最新版本")
      }
    }
  },

  /**
   * 下拉刷新，更新成绩
   */
  onPullDownRefresh: function () {
    app.msg('请点击黄色按钮更新成绩')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('您有一份期末成绩单待查收', 'score.png', this.route)
  },

  // 获取需求结果
  getScoreDemand() {
    const that = this
    getScoreDemand().then((res) => {
      that.setData({
        demandId: res.data.id
      })
      if (res.message) {
        wx.showToast({
          title: res.message,
          duration: 4000,
          icon: 'none'
        })
        return
      }
    })
  },

  // 进入成绩详情
  itemData: function (e) {
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

  analysis: function () {
    wx.navigateTo({
      url: 'ana/ana'
    })
  },

  refresh: function () {
    this.onPullDownRefresh();
  },

  // 获取成绩
  getScore: function (update) {
    var that = this;
    //读缓存
    // var scores = wx.getStorageSync('scores');
    // if (scores != '' && JSON.stringify(scores) != "{}" && scores.score.length>0 && !update){
    //   that.setData({
    //     loading: false,
    //     gpa: scores.gpa,
    //     score: scores.score,
    //     term: scores.term,
    //     year: scores.year,
    //     original_score: scores.originalScore
    //   })
    //   that.getGradeList()
    //   return
    // }
    // 读数据库
    getScoreList(that.route).then((res) => {
      that.setData({
        loading: false
      })
      if (res.status == 0) {
        wx.setStorageSync('scores', res.data.data);
        that.setData({
          isNull: false,
          gpa: res.data.gpa,
          score: res.data.score,
          term: res.data.term,
          year: res.data.year,
          original_score: res.data.originalScore
        })
        that.getGradeList()
      } else if (res.status == 1001) {
        that.setData({
          isNull: true
        })
      } else {
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
      } else {
        that.setData({
          hasNotice: false
        })
      }
    })
  },

  //更新成绩
  update: function () {
    const that = this
    const time = dayjs().unix()
    let updateList = that.data.updateList
    if (updateList.length >= that.data.updateMaxCount) {
      updateList = []
    }
    updateList.push(0)
    that.setData({
      updatingCourse: false,
      updateList,
      updateScoreStatus: true
    })
    updateScore({
      time
    }).then((res) => {
      if (res.status == 0) {
        app.msg(res.message, 'success')
        wx.setStorageSync('scores', '')
        that.getScore(true)
        setUpdateTime('score', time)
        updateList[updateList.length - 1] = 1
        that.setData({
          updateList,
          updateCourseStatus: false,
          update_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
        setTimeout(() => {
          that.hideUpdate()
          that.setData({
            showConfirm: true
          })
        }, 1000);
        return
      }
      return Promise.reject('更新失败')
    }).catch(err => {
      console.log(err)
      //再获取一遍
      updateList[updateList.length - 1] = -1
      that.setData({
        updateList
      })
      if (updateList.length >= that.data.updateMaxCount) {
        // 更新次数上限还是失败
        app.msg('更新失败，请重试！')
        that.setData({
          updateScoreStatus: false
        })
        return
      }
      app.msg('更新失败，3秒后再次更新')
      setTimeout(() => {
        that.update()
      }, 3000);
    })
  },

  updateV2() {
    const that = this
    const time = dayjs().unix()
    const canUpdateResult = canUpdate('score')
    if (canUpdateResult !== true) {
      app.msg(canUpdateResult)
      return
    }
    wx.showLoading({
      title: '更新中...',
    })
    updateScore({
      time
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 0) {
        app.msg(res.message, 'success')
        wx.setStorageSync('scores', '')
        that.getScore(true)
        setUpdateTime('score', time)
        return
      }
      // 教务系统限制
      if (res.status == 404) {
        wx.showModal({
          title: '温馨提示',
          content: '抱歉，更新失败！目前教务系统限制了云小智服务器访问，请稍后再来更新。请您谅解！',
          showCancel: false
        })
        return
      }
    })
  },

  subscribe() {
    const that = this
    if (!that.data.demandId) {
      app.msg('目前无需订阅，请直接更新成绩')
      return
    }
    const temaplteId = 'lhKCIfBKo9GZc2Vd1zQSxpirSKHBe3czDG0OliOcXgg'
    wx.requestSubscribeMessage({
      tmplIds: [temaplteId],
      success(result) {
        if (result[temaplteId] === 'accept') {
          subscribeScore({
            id: that.data.demandId
          }).then((res) => {
            app.msg(res.message)
          })
          return
        }
        app.msg('你未订阅成绩通知，将无法收到成绩更新信息')
      },
      fail() {
        app.msg('订阅失败，请重试！')
      }
    })
  },

  backPageBtn: function () {
    backPage(this.data.from)
  },

  selectYear: function (e) {
    let index = e.detail.value
    this.setData({
      year_index: index
    })
  },

  goRank: function (e) {
    let term = e.currentTarget.dataset.term
    if (!this.data.gpa.hasOwnProperty(term)) {
      app.msg("当前学期还未出有效成绩，不支持查看排名")
      return
    }
    wx.navigateTo({
      url: '/subPages/term-rank/index?source=score&term=' + term,
    })
  },

  //切换成绩模式
  changeType: function (e) {
    let val = e.currentTarget.dataset.val
    if (!val) {
      val = this.data.type == 0 ? 1 : 0
    }
    this.setData({
      type: val
    })
  },

  //是否存在有效成绩
  hasEffectScore: function (name) {
    if (this.data.score.length <= 0) {
      return false
    }
    let isExist = false
    this.data.score.forEach(function (s) {
      if (s.name == name) {
        isExist = true
        return
      }
    })
    return isExist
  },

  viewAllScore: function () {
    wx.navigateTo({
      url: '/pages/tools/credit/credit',
    })
  },

  // 获取年级列表
  getGradeList: function () {
    // 学期倒序
    let termNum = Object.keys(this.data.term)
    termNum.sort((x, y) => {
      x = x.split('-')
      y = y.split('-')
      return y[y.length - 1] - x[x.length - 1]
    })
    getGradeList(this.data.year).then((list) => {
      // 学期倒序
      let termNums = Object.keys(this.data.term)
      termNums.sort((x, y) => {
        x = x.split('-').join('')
        y = y.split('-').join('')
        return y - x
      })
      for (let t in termNums) {
        termNums[t] = {
          year: termNums[t].slice(0, 9),
          term: termNums[t]
        }
      }
      let tabCur = Object.keys(list)[0]
      this.setData({
        grades: list,
        tabCur,
        termNums
      })
    })

  },

  // 选择年级
  selectGrade: function (e) {
    this.setData({
      tabCur: e.currentTarget.dataset.index
    })
  },

  // 显示更新成绩弹窗
  showUpdate() {
    if (app.getUserId() === 'test') {
      app.msg('测试号无法更新数据')
      return
    }
    const canUpdateResult = canUpdate('score')
    if (canUpdateResult !== true) {
      app.msg(canUpdateResult)
      return
    }
    this.setData({
      showUpdate: true
    })
  },
  hideUpdate() {
    this.setData({
      showUpdate: false,
      updateList: []
    })
  }
})
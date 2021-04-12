const app = getApp()
const { getScoreFailRank } = require('../../../api/score')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rank: [],
    score: [],
    fail: [],
    onlyMe: false,
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const img = 'https://mmbiz.qpic.cn/mmbiz_png/YWKTC18p77J5UftPiaFHMPk0qsa3fE6GmBjibAqtvWzTcWDFagRlYsPwctA1sfggUicpic5mLQ6vXJpVXzAqibLoyKQ/0?wx_fmt=png';
    return {
      title: '白云挂科率最高的竟然是...',
      imageUrl: img,
      path: this.route
    }
  },

  //获取数据
  getData: function(){
    const self = this
    self.setData({
      loading: true
    })
    getScoreFailRank().then((res) => {
      self.setData({
        loading: false
      })
      if(res.status == 0){
        //处理数据
        let {fail,rank,score} = res.data
        let rankNum = 1
        for(let item of rank){
          item['has'] = 0
          item['failed'] = 0
          item['rank'] = rankNum++
          if(score.indexOf(item['name']) != -1){
            item['has'] = 1
            if(fail.indexOf(item['name']) != -1){
              item['failed'] = 1
            }
          }
        }
        self.setData({
          rank,
          fail,
          score
        })
        return
      }
      app.msg(res.data.message)
    })
  },

  setOnlyMe: function(){
    this.setData({
      onlyMe: !this.data.onlyMe
    })
  }
})
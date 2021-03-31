const app = getApp()
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

  },

  //获取数据
  getData: function(){
    const self = this
    self.setData({
      loading: true
    })
    app.promiseRequest({
      url: 'score/getScoreFailRank'
    }).then((res) => {
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
    }).catch((msg) => {
      app.msg(msg)
    })
  },

  setOnlyMe: function(){
    this.setData({
      onlyMe: !this.data.onlyMe
    })
  }
})
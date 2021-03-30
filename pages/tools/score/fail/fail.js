const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rank: [],
    score: [],
    fail: [],
    search: ''
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
    app.promiseRequest({
      url: 'score/getScoreFailRank'
    }).then((res) => {
      if(res.status == 0){
        //处理数据
        let {fail,rank,score} = res.data
        for(let item of rank){
          item['display'] = 1
          item['has'] = 0
          item['fail'] = 0
          if(self.data.search != '' && item.indexOf(self.data.search) == -1){
            item['display'] = 0
          }
          if(score.indexOf(item) != -1){
            item['has'] = 1
            if(fail.indexOf(item) != -1){
              console.log(item)
              item['fail'] = 1
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
  }
})
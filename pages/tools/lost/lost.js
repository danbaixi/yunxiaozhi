const app = getApp()
const { getLostList } = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading:false,
    list:[],
    detailIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.share('点击查看失物招领列表')
  },
  getList:function(){
    let _this = this
    _this.setData({
      loading: true
    })
    getLostList().then((res) => {
      if(res.status == 0){
        _this.setData(res.data)
      }
    })
  },

  search: function (e) {
    let val = e.detail.value.toLowerCase()
    let list = this.data.list
    let total = 0, count = 0
    for (let i = 0; i < list.length; i++) {
      let a = val
      let b = list[i].name.toLowerCase();
      let c = list[i].feature.toLowerCase()
      let d = list[i].address.toLowerCase()
      if (b.search(a) != -1 || c.search(a) != -1 || d.search(a) != -1) {
        list[i].isShow = true
        total += Number(list[i].credit)
        count++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      list: list,
      total: total.toFixed(1),
      isNull: count == 0
    })
  },

  viewItem:function(e){
    let index = e.currentTarget.dataset.index
    this.setData({
      detailIndex:index,
      showDetail: true
    })
  },

  hideModal:function(){
    this.setData({
      showDetail: false
    })
  },
  
  goQuanzi(){
    wx.navigateToMiniProgram({
      appId: "wxb036cafe2994d7d0",
      path: "/portal/topic-profile/topic-profile?group_id=13104375827371700&invite_ticket=BgAARwqnU-49GW8g92KH3E7WFA&topic_id=1&fromScene=bizArticle",
    })
  }
})
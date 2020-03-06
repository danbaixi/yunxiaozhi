const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    customBar: app.globalData.customBar,
    xuanxiu:false,
    isNull: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isBind().then((result) => {
      if (result) {
        this.getData()
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  
  //获取数据
  getData:function(){
    let _this = this
    app.httpRequest({
      url:'score/getAllCredit',
      success:function(res){
        _this.setData({
          loading: false
        })
        if(res.data.status == 0){
          _this.setData(res.data.data)
        }
      }
    })
  },

  search:function(e){
    let val = e.detail.value.toLowerCase()
    let list = this.data.credit
    let total = 0,count = 0
    for (let i = 0; i < list.length; i++) {
      let a = val
      let b = list[i].name.toLowerCase();
      if (b.search(a) != -1) {
        list[i].isShow = true
        total += Number(list[i].credit)
        count ++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      credit: list,
      total: total.toFixed(1),
      xuanxiu: false,
      isNull: count == 0
    })
  },

  itemData: function (e) {
    var index = e.currentTarget.dataset.index;
    var data = this.data.credit[index]
    wx.navigateTo({
      url: '/pages/tools/score/top/top?from=score&data=' + encodeURIComponent(JSON.stringify(data))
    })
  },

  onlyXuanxiu:function(){
    let xuanxiu = this.data.xuanxiu ? false : true
    let list = this.data.credit
    let total = 0,count = 0
    if(xuanxiu){
      for (let i = 0; i < list.length; i++) {
        if (list[i].type == '公共课/公选课' || list[i].type == '公共课/任选课'){
          list[i].isShow = true
          total += Number(list[i].credit)
          count++
        }else{
          list[i].isShow = false
        }
      }
    }else{
      for (let i = 0; i < list.length; i++) {
        list[i].isShow = true
        total += Number(list[i].credit)
      }
    }
    this.setData({
      xuanxiu: xuanxiu,
      credit: list,
      isNull: count == 0,
      total: total
    })
  }
})
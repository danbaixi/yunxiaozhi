const { getAllCredit } = require('../../api/score')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    customBar: app.globalData.customBar,
    xuanxiu:false,
    isNull: false,
    search:''
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

  //获取数据
  getData:function(){
    let _this = this
    getAllCredit().then((res) => {
      _this.setData({
        loading: false
      })
      if(res.status == 0){
        res.data.isNull = res.data.credit.length == 0 ? true : false
        _this.setData(res.data)
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
      search:val,
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
        count++
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
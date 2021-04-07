const { getEmptyRoom } = require('../../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNull: false,
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var area = Number(options.area) + 1
    if(area == 2){
      area = 3
    }
    var floor = options.floor
    var weekly = options.weekly
    var week = Number(options.week) + 1
    var section = options.section
    var title = options.title

    getEmptyRoom({
      area:area,
      floor:floor,
      weekly:weekly,
      week:week,
      section:section,
    }).then((res) => {
      if(res.status == 0){
        that.setData({
          loading:false,
          rooms: res.data,
          isNull: res.data.length == 0,
          title: title
        })
      }
    })
  }
})
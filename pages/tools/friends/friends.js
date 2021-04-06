const { getFriendList } = require('../../api/user')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading:true,
    fileUrl:app.globalData.headImgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      from:options.from
    })
    this.getList()
  },
  getList:function(){
    let _this = this
    getFriendList()
      .then((res) => {
        if(res.status == 0){
          _this.setData({
            friends: res.data.students,
            total:res.data.total,
            loading: false
          })
        }
      })
  },
  search: function (e) {
    let val = e.detail.value
    let list = this.data.friends
    let count = 0
    for (let i = 0; i < list.length; i++) {
      let a = val
      if (list[i].stu_name.search(a) != -1) {
        list[i].isShow = true
        count++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      friends: list,
      isNull: count == 0
    })
  }
})
const app = getApp()
const { getLostList } = require('../../api/other')
import { openArticle } from '../../../utils/common'
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
  
  release(){
    openArticle('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=2247488770&idx=1&sn=f7d7747e97ab377bd5f915c506d7a7e7&chksm=ea35af06dd42261028b0b3554e22111d7f8c312e0d7ed34f1679a2b15c2cb287f62287503cb6#rd')
  }
})
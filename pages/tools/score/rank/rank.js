const app = getApp()
const { setUserConfig } = require('../../../api/user')
const { getTermRank } = require('../../../api/score')
const { openArticle } = require('../../../../utils/common')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    showQuestion: false,
    grade: 6,
    names: ['最强王者', '璀璨钻石', '华贵铂金', '荣耀黄金', '英勇黄铜'],
    rankColor:['red','yellow','olive'],
    articleUrl: "http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100001310&idx=1&sn=a50e8db5869db0bff232b2ba85cc28e5&chksm=6a35bc1a5d42350ca1230585d9eb81deb2231568b887392ebc2af69e26cad0019d08aad7af7a#rd"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let term = options.term
    let source = options.source
    if(!term || source != 'score'){
      wx.navigateTo({
        url: '/pages/tools/score/score',
      })
      return
    }
    let stu_id = wx.getStorageSync('user_id')
    this.setData({
      stu_id:stu_id,
      term:term,
      termName: this.getTermName(term)
    })
    this.getRank(term)

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('你是青铜，还是王者？')
  },

  //获取排名
  getRank:function(term){
    let _this = this
    getTermRank({term}).then((res) => {
      _this.setData({
        loading:false
      })
      if(res.status == 0){
        _this.setData(res.data)
      }
    })
  },

  getTermName:function(term){
    let arr = term.split('-')
    if(arr.length < 3){
      return '未知'
    }
    return arr[0] + '-' + arr[1] + '学年 第' + arr[2] + '学期'
  },

  showQuestion:function(){
    this.setData({
      showQuestion:true
    })
  },

  hideQuestion: function () {
    this.setData({
      showQuestion: false
    })
  },

  openRank:function(){
    let _this = this
    wx.showModal({
      title: '温馨提示',
      content: '此操作会将您隐藏姓名的设置去除，确认要设置吗？',
      success:function(res){
        if(res.confirm){
          setUserConfig({
            field: 'is_display_name',
            value: 0
          }).then(() => {
            let user = _this.data.user
            user.is_display_name = 0
            _this.setData({
              user:user
            })
            app.msg("设置成功")
          }).catch((message) => {
            app.msg(message)
          })
        }
      }
    })
  },

  viewAll:function(){
    wx.navigateTo({
      url: '/pages/tools/rank/rank',
    })
  },

  help: function () {
    openArticle(this.data.articleUrl)
  }
})
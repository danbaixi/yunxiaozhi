const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tools:[
      {
        color: 'theme',
        badge: 0,
        name: '录取查询',
        icon: 'matriculate',
        needLogin: false,
        url: '/pages/tools/matriculate/matriculate?from=index',
      },
      {
        color: 'theme',
        badge: 0,
        name: '校园导览',
        icon: 'guide',
        needLogin: false,
        url: '/pages/tools/guide/index?from=index',
      },
      {
        color: 'red',
        badge: '',
        name: '找社团',
        icon: 'club',
        needLogin: false,
        url: '/pages/tools/club/club',
      },  
      {
        color: 'red',
        badge: '',
        name: '找群聊',
        icon: 'qunliao',
        needLogin: false,
        url: '/pages/article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002002&idx=1&sn=79069994b1793c33e8ce49431c1d0bd6&chksm=6a35b2d65d423bc097f66072ce82aa4aecc9a1b12da127418eb273f43ce16b4b68f8cde2afc4#rd' + "&title=云小智邀请你加入群聊"),
      }, 
      {
        color: 'red',
        badge: '',
        name: '找同乡',
        icon: 'tongxiang',
        needLogin: false,
        url: '/pages/tools/city/city'
      },
      {
        color: 'cyan',
        badge: 0,
        name: '查课表',
        icon: 'course_list',
        needLogin: false,
        url: '/pages/course/list/list?from=index',
      },
      {
        color: 'cyan',
        badge: 0,
        name: '查校历',
        icon: 'calendar',
        needLogin: false,
        url: '/pages/tools/calendar/calendar?from=index',
      },
      {
        icon: 'countdown',
        color: 'olive',
        badge: 0,
        name: '作息表',
        icon: 'rest',
        needLogin: false,
        url: '/pages/article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100000581&idx=1&sn=6ef90448df9ac2d4930fa3b15aa8399e&chksm=6a35b9415d423057df293f498fe3027b2ede3fe46000e69fc1a713a90eb7f894aabe416d7fa2#rd'),
      },
    ],
    articles:[
      {
        title:"新生登录云小智指南",
        desc:"20级小萌新必看",
        src:"http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002566&idx=1&sn=9ebe399aa19d127d23b4012c10a6778c&chksm=6a35b1025d4238142979bc5868df2ec7b599f3fe7e53ea47335a38527cf4a353b1f33a49ef77#rd",
        img:"https://mmbiz.qlogo.cn/mmbiz_jpg/YWKTC18p77Iic2zWx07DuzGvJK5gWEtQ3YlxMrodnIGmfeAfrb91QHUBHcDLCL05LgauL9mnyib1oJkA7sPTQLzw/0?wx_fmt=jpeg"
      }
    ],
    p:1,
    length:10,
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getArticles()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '白云新生必看的校园攻略！'
    }
  },
  openTool: function (e) {
    var url = e.currentTarget.dataset.url;
    var user_id = wx.getStorageSync('user_id');
    var appid = e.currentTarget.dataset.appid
    var path = e.currentTarget.dataset.path
    var needLogin = e.currentTarget.dataset.needlogin
    if (user_id == '' && needLogin) {
      app.msg("请先登录")
      return
    }
    if (needLogin && !app.getUserId()) {
      app.msg("请先绑定教务系统账号")
      return;
    }
    if(appid){
      wx.navigateToMiniProgram({
        appId:appid,
        path: path
      })
      return
    }
    wx.navigateTo({
      url: url,
    })
  },
  getArticles:function(){
    let that = this
    app.httpRequest({
      url:'article/getListForLabel',
      needLogin: false,
      data:{
        label: 18,
        p:that.data.p
      },
      success:function(res){
        let articles = that.data.articles
        articles = articles.concat(res.data.data)
        let finish = false
        if(res.data.data.length < that.data.length){
          finish = true
        }
        that.setData({
          articles:articles,
          finish: finish
        })
      }
    })
  },
  //打开推文
  viewArticle:function(e){
    wx.navigateTo({
      url: '/pages/article' + '/article?src=' + encodeURIComponent(e.currentTarget.dataset.src),
    })
  },
})
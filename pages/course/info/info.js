Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var temp = options.jieshu.split(" ");
    var time,jieshu;
    switch(temp[1]){
      case "1-2节":time = "8:20-9:50";jieshu="1-2";break;
      case "3-4节": time = "10:20-11:50"; jieshu = "3-4"; break;
      case "5-6节": time = "13:50-15:20"; jieshu = "5-6"; break;
      case "7-8节": time = "15:40-17:10"; jieshu = "7-8";break;
      case "9-10节": time = "17:50-19:20"; jieshu = "9-10"; break;
      case "11-12节": time = "19:20-20:50"; jieshu = "11-12"; break;
      case "1-4节": time = "8:20-9:50(休息)10:20-11:50"; jieshu = "1-4"; break;
      case "5-8节": time = "14:00-15:30(休息)15:40-17:10"; jieshu = "5-8"; break;
      case "9-12节": time = "17:50-19:20(休息时间看老师)19:20-20:50"; jieshu = "9-12"; break;
    }
    var isPE = false;
    var patt = /体育/;
    if(options.name.match(patt)){
      isPE:true;
    }
    this.setData({
      name:options.name,
      zhoushu:options.zhoushu,
      jieshu:options.jieshu,
      teacher:options.teacher,
      xuefen:options.xuefen,
      category: options.category,
      method: options.method,
      address:options.address,
      time:time,
      jie:jieshu,
      isPE:isPE
    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  rest:function(){
    wx.navigateTo({
      url: '../../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100000581&idx=1&sn=6ef90448df9ac2d4930fa3b15aa8399e&chksm=6a35b9415d423057df293f498fe3027b2ede3fe46000e69fc1a713a90eb7f894aabe416d7fa2#rd'),
    })
  }
})
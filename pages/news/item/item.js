var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'http://www.baiyunu.edu.cn/',
    space:"　　",
    table:"\n\n\n",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var num = options.num;
    that.setData({
      num:options.num,
      title:options.title,
      date:options.date,
      type:options.type
    })
    that.getNewsItem(num);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var url;
    if(this.data.img.length>0){
      url = this.data.url + this.data.img[0];
    }else{
      url = '';
    }
    return {
      title:this.data.title,
      path:'pages/news/item/item?num='+this.data.num+'&title='+this.data.title+'&date='+this.data.date+'&type='+this.data.type,
      imageUrl: url
    }
  },
  /**
   * 获取新闻内容
   */
  getNewsItem:function(num){
    var that = this;
    wx.showLoading({title:"加载中"})
    wx.request({
      url: app.globalData.domain + 'news/getitem',
      data:{
        num:num,
        type:that.data.type
      },
      success:function(res){
        if(res.data.status == 1001){
          wx.hideLoading()
          that.setData({
            section: res.data.data.section,
            img: res.data.data.img,
            desc: res.data.data.desc,
          })
        }else{
          app.msg("加载失败")
          setTimeout(function(){
            wx.navigateBack({
              
            })
          },1000)
        }
      }
    })
  }
})
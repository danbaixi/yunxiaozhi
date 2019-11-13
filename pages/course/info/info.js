const TIMES = [
  [
    ["08:20", "09:05"], ["09:10", "09:55"], ["10:20", "11:05"], ["11:15", "12:00"], ["13:50", "14:35"], ["14:35", "15:20"], ["15:40", "16:25"], ["16:25", "17:10"], ["17:50", "18:35"], ["18:35", "19:20"], ["19:20", "20:05"], ["20:05", "20:50"]
  ],
  [
    ["08:30", "09:15"], ["09:20", "10:05"], ["10:20", "11:05"], ["11:10", "11:55"], ["13:45", "14:30"], ["14:35", "15:20"], ["15:35", "16:20"], ["16:25", "17:10"], ["17:45", "18:30"], ["18:35", "19:20"], ["19:25", "20:10"], ["20:15", "21:00"]
  ]
]
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
    console.table(options)
    var area = wx.getStorageSync('user_area')
    var temp = options.jieshu.split(" ");
    var time,jieshu;
    options.jie = parseInt(options.jie)
    options.jieshu = parseInt(options.jieshu)

    if(area == 1){
      //正常情况
      if (options.jieshu == 2) {
        if(options.jie < 5) {
          time = TIMES[0][options.jie - 1][0] + '~' + TIMES[0][options.jie - 1][1] + ',' + TIMES[0][options.jie][0] + '~' + TIMES[0][options.jie][1]
        }else{
          time = TIMES[0][options.jie - 1][0] + '~' + TIMES[0][options.jie][1]
        }
        
      } else if (options.jieshu == 4) {
        if(options.jie < 5){
          time = TIMES[0][options.jie - 1][0] + '~' + TIMES[0][options.jie - 1][1] + ',' + TIMES[0][options.jie][0] + '~' + TIMES[0][options.jie][1] + '、' + TIMES[0][options.jie + 1][0] + '~' + TIMES[0][options.jie + 1][1] + ',' + TIMES[0][options.jie + 2][0] + '~' + TIMES[0][options.jie + 2][1]
        }else{
          time = TIMES[0][options.jie - 1][0] + '~' + TIMES[0][options.jie][1] + '、' + TIMES[0][options.jie + 1][0] + '~' + TIMES[0][options.jie + 2][1]
        }
        
      } else if (options.jieshu == 1) {
        time = TIMES[0][options.jie - 1][0] + '~' + TIMES[0][options.jie - 1][1]
      } else {
        time = "获取失败"
      }

    }else if(area == 2){
      time = options.jieshu == 2 ? (TIMES[1][options.jie - 1][0] + '~' + TIMES[1][options.jie - 1][1] + ',' + TIMES[1][options.jie][0] + '~' + TIMES[1][options.jie][1]) : (TIMES[1][options.jie - 1][0] + "~" + TIMES[1][options.jie + options.jieshu - 2][1])
    }
    
    jieshu = options.jie + '-' + (options.jie + options.jieshu - 1) + '节';
    var week;
    switch (parseInt(options.week)) {
      case 1: week = '周一'; break;
      case 2: week = '周二'; break;
      case 3: week = '周三'; break;
      case 4: week = '周四'; break;
      case 5: week = '周五'; break;
    }
    var jieshu = week + ' ' + jieshu;

    this.setData({
      area:area,
      name:options.name,
      zhoushu:options.zhoushu,
      jieshu:jieshu,
      teacher:options.teacher,
      xuefen:options.xuefen,
      category: options.category,
      method: options.method,
      address:options.address,
      time:time
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
  },

  setTime:function(){
    wx.navigateTo({
      url: '../setTime/setTime',
    })
  }
})
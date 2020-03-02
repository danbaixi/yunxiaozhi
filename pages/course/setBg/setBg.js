const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgNum:9,
    fileUrl : app.globalData.fileUrl,
    bg_type:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //不能通过分享链接进入
    let from = options.from
    if(from != 'index'){
      wx.switchTab({
        url: '/pages/course/course',
      })
      return
    }
    let bg_img = wx.getStorageSync('bg_img')
    let bg_type = wx.getStorageSync('bg_type')
    if(bg_img != '' && bg_type == ''){
      bg_type = 'diy'
    }
    this.setData({
      bg_type: bg_type,
      bg_img: bg_img
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

  //下载背景
  download:function(num){
    let _this = this
    let promise = new Promise((resolve,reject) => {
      wx.downloadFile({
        url: _this.data.fileUrl + '/course_bg/' + num + '.jpg',
        success: function (res) {
          if (res.statusCode === 200) {
            const fs = wx.getFileSystemManager()
            fs.saveFile({
              tempFilePath: res.tempFilePath,
              success(res) {
                return resolve(res.savedFilePath)
              },
              fail(res){
                return reject('保存失败')
              }
            })
          } else {
            return reject('下载失败')
          }
        }
      })
    })
    return promise
  },

  //设置背景
  setBg:function(type,value){
    if(type == null){
      value = ''
    }
    wx.setStorageSync('bg_type', type)
    wx.setStorageSync('bg_img', value)
    this.setData({
      bg_type:type,
      bg_img:value
    })
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })
    setTimeout(()=>{
      wx.navigateBack({})
    },1000)
  },

  //选择背景
  select:function(e){
    let _this = this
    let num = e.currentTarget.dataset.num
    let bg_imgs = wx.getStorageSync('bg_imgs')
    if(!bg_imgs || !bg_imgs[num]){
      //下载图片
      _this.download(num).then((url) => {
        if(bg_imgs == ''){
          bg_imgs = []
        }
        bg_imgs[num] = url
        wx.setStorageSync('bg_imgs', bg_imgs)
        _this.setBg(num,url)
      }).catch((error) => {
        app.msg(error.message)
      })
    }else{
      //已存在的缓存
      //先判断图片是否被删除了
      const fs = wx.getFileSystemManager()
      fs.access({
        path:bg_imgs[num],
        complete:function(res){
          if (res.errMsg != 'access:ok'){
            //图片被删了，重新下载
            _this.download(num).then((url) => {
              bg_imgs[num] = url
              wx.setStorageSync('bg_imgs', bg_imgs)
              _this.setBg(num, url)
            }).catch((error) => {
              app.msg('设置失败：' + error.message)
            })
            return
          }
          _this.setBg(num, bg_imgs[num])
        }
      })
    }
  },

  //diy背景
  diy:function(){
    let _this = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success: function (e) {
        var tempFilePaths = e.tempFilePaths
        _this.setBg('diy',tempFilePaths[0])
      },
    })
  },

  //清空背景
  clear:function(){
    if(this.data.bg_type == null){
      return
    }
    this.setBg(null,'')
  }
})
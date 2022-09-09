const app = getApp()
const { getBgList } = require('../../api/course')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgNum:9,
    fileUrl : app.globalData.fileUrl,
    bg_type:null,
    uploadFile: '',
    courseFileUrl: 'https://yunxiaozhi-1251388077.cos.ap-guangzhou.myqcloud.com/course_bg/',
    bgList: [],
    loading: true
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
    this.getBgData()
    const { width, height } = options
    let bg_img = wx.getStorageSync('bg_img')
    let bg_type = wx.getStorageSync('bg_type')
    if(bg_img != '' && bg_type == ''){
      bg_type = 'diy'
    }
    let auditing = app.getConfig('auditing')
    this.setData({
      width,
      height,
      bg_type: bg_type,
      bg_img: bg_img,
      auditing: auditing
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (option) {
    let _this = this
    if (_this.data.uploadFile != ''){
      //设置背景
      wx.showLoading({
        title: '正在设置...',
      })
      let src = _this.data.courseFileUrl + _this.data.uploadFile
      wx.setStorageSync('upload_course_bg', _this.data.uploadFile)
      //缓存背景
      setTimeout(()=>{
        _this.download(src).then((url) => {
          _this.setBg('diy',url)
        }).catch((error) => {
          app.msg(error)
        })
      },1000)
    }
  },

  //下载背景
  download:function(url){
    let _this = this
    let promise = new Promise((resolve,reject) => {
      wx.downloadFile({
        url: url,
        success: function (res) {
          console.log(res)
          if (res.statusCode === 200) {
            const fs = wx.getFileSystemManager()
            _this.checkMaxSize().then((result) => {
              if(result){
                fs.saveFile({
                  tempFilePath: res.tempFilePath,
                  success(res) {
                    return resolve(res.savedFilePath)
                  },
                  fail(res) {
                    return reject('保存失败，请联系客服解决')
                  }
                })
              }
            })
            
          } else {
            return reject('下载失败')
          }
        },
        fail: function(res){
          console.log(res)
          return reject('下载失败')
        }
      })
    })
    return promise
  },

  //判断缓存文件是否>10M，预留4m空间
  checkMaxSize:function(){
    let maxSize = (10-2) * 1024 * 1024 / 2
    let promise = new Promise((resolve) => {
      wx.getSavedFileList({
        success(res) {
          let files = res.fileList
          let total = 0
          for (let i = 0; i < files.length; i++) {
            total = total + files[i].size
          }
          if (total > maxSize) {
            for (let i = 0; i < files.length; i++) {
              wx.removeSavedFile({
                filePath: files[i].filePath
              })
            }
          }
          return resolve(true)
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
      // 返回刷新课表背景
      wx.setStorageSync('refresh_course_bg', true)
      wx.navigateBack()
    },1000)
  },

  //选择背景
  select:function(e){
    let _this = this
    let num = e.currentTarget.dataset.num
    let index = num - 1
    let url = _this.data.bgList[index].src
    let bg_imgs = wx.getStorageSync('bg_imgs')
    if(!bg_imgs || !bg_imgs[num]){
      //下载图片
      _this.download(url).then((url) => {
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
            _this.download(url).then((url) => {
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
    const _this = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success: function (e) {
        var tempFilePaths = e.tempFilePaths
        let src = tempFilePaths[0]
        wx.showLoading({
          title: '正在加载...',
          mask: true
        })
        wx.navigateTo({
          url: `../../cropper/cropper?type=course&src=${src}&width=${_this.data.width}&height=${_this.data.height}`,
          success:function(){
            wx.hideLoading()
          }
        })
      },
    })
  },

  //清空背景
  clear:function(){
    if(this.data.bg_type == null){
      return
    }
    const _this = this
    wx.showModal({
      title: '确定要清空背景吗？',
      success: function(res){
        if(res.confirm){
          _this.setBg(null,'')
        }
      }
    })
  },

  // 获取课表背景列表
  getBgData:function(){
    const _this = this
    getBgList().then((res) => {
      if(res.status == 0){
        _this.setData({
          bgList: res.data,
          loading: false
        })
      }else{
        app.msg("获取背景失败，请重试")
      }
    })
  }
})
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
var delPicture = require('../../../utils/delPicture.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headImg_pre: 'http://yunxiaozhi-1251388077.file.myqcloud.com/user_imgs/',
    pic_pre: 'http://yunxiaozhi-1251388077.file.myqcloud.com/yunquan/',
    isFocus:false,
    page:1,
    num:5,
    firstComment:[],
    secondComment:[],
    inputValue:'',
    stopGetComment:false,
    commentToWho:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var mid;
    if (options.method == 'direct'){
      var data = JSON.parse(options.data);
      var id = options.id;
      that.setData({
        message: data,
        id:id,
      });
      mid = that.data.message.mid;
      //提起评论
      that.inputFocus('first', false, null, '0', '0');
    } else if (options.method == 'indirect'){
      wx.showLoading({
        title: '正在加载',
      })
      mid = options.mid;
      that.getMessage(mid);
      wx.hideLoading();
    }

    //获取评论
    that.getComments(mid,that.data.page,that.data.num);
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
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    var that = this;
    that.setData({
      page: 1,
      firstComment:new Array(),
    })
    that.getMessage(that.data.message.mid);
    that.getComments(that.data.message.mid, that.data.page, that.data.num);
    // wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      // that.setData({
      //   isHideLoadMore:true,
      // })
    }, 1500);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (!that.data.stopGetComment){
      that.setData({
        page: that.data.page + 1,
      });
      var pre_firstComment_length = that.data.firstComment.length;
      that.getComments(that.data.message.mid, that.data.page, that.data.num);
      if (that.data.firstComment.length == pre_firstComment_length) {
        that.setData({
          stopGetComment: true,
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '给你分享一条云圈动态',
      path: '/pages/community/item/item?method=indirect'+'&mid='+this.data.message.mid,
    }
  },
  //点赞
  setLike: function (id, isLike) {
    var that = this;
    if (isLike == 0) {
      var param1 = {};
      var param2 = {};
      var string1 = "message.isLike";
      var string2 = "message.like_num";
      if (isLike == 0) {
        param1[string1] = 1;
        param2[string2] = that.data.message.like_num + 1;
        that.setData(param1);
        that.setData(param2);
      }  
      var mid = that.data.message.mid;
      var user_id = wx.getStorageSync('user_id');
      var page = 'pages/community/community';
      var content = that.data.message['content'];
      if (content == "") {
        content = "[图片]";
      }
      var data_info = content + "," + wx.getStorageSync('nickName');
      var date = util.formatTime2(new Date());
      var str = user_id + '&^!*@' + date;
      var AppId = md5.hexMD5(str);
      wx.request({
        url: 'https://www.tianyae.com/yxz/yunquan/setLike.php',
        data: {
          AppId: AppId,
          mid: mid,
          user_id: user_id,
          isLike: isLike,
          page: page,
          content: content,
          data_info: data_info
        },
        success: function (res) {
          switch (res.data.code) {
            case 1001: wx.showToast({ title: '非法操作', icon: 'loading' }); break;
            case 1002: wx.showToast({ title: '参数有误', icon: 'loading' }); break;
            case 1003: wx.showToast({ title: '服务器异常', icon: 'loading' }); break;
            case 1004:
              wx.hideLoading();
              break;
          }
        },
        fail: function (res) {
          console.log('error:' + res);
        }
      })
    } else {
      wx.showToast({
        title: '你点过赞啦',
        icon: 'loading'
      })
    }
  },
  //收集formId
  collectFormid: function (e) {
    var that = this;
    var formId = e.detail.formId;
    var time = util.formatTime3(new Date());
    var user_id = wx.getStorageSync('user_id');
    wx.request({
      url: 'https://www.tianyae.com/yxz/wx_api/collectFormid.php',
      data: {
        user_id: user_id,
        formId: formId,
        time: time
      },
    })
    var method = e.detail.target.dataset.method;
    switch (method) {
      case 'newMessage': that.newMessage(); break;
      case 'setLike':
        var id = e.detail.value.id;
        var isLike = e.detail.value.isLike;
        that.setLike(id, isLike);
        break;
      case 'previewPicture':
        var message_index = e.detail.target.dataset.idnum.split("_")[0];
        var picture_index = e.detail.target.dataset.idnum.split("_")[1];
        that.previewPicture(message_index, picture_index);
        break;
      case 'more':
        that.actionSheetTap();
        break;
      case 'newComment':
        var content = e.detail.value.content;
        that.newComment(content);
        break;
      case 'inputComment':
        that.inputFocus('first',true ,null,'0', '0');
        break;
    }
  },
  //图片按比例缩放
  imageLoad: function (e) {
    var picture_length = e.target.dataset.index.split("_")[1];
    var m_index = e.target.dataset.index.split("_")[0];
    var winWidth = wx.getSystemInfoSync().windowWidth;
    var winHeight = wx.getSystemInfoSync().windowHeight;
    var r_width, r_height;
    if (picture_length == 1) {
      var maxWidth = winWidth * 0.8;
      var maxHeight = winHeight * 0.8;
      var width = e.detail.width;
      var height = e.detail.height;
      r_width = maxWidth;
      r_height = height * (maxWidth / width);
      this.setData({
        imageRatio:{
          width: r_width,
          height: r_height,
        }
      })
    }
  },
  //预览图片
  previewPicture: function (message_index, picture_index) {
    var picture_url = this.data.message.pictures;
    var picture_urls = new Array();
    //添加链接前缀
    for (var i = 0; i < picture_url.length; i++) {
      picture_urls[i] = this.data.pic_pre + picture_url[i];
    }
    var current = picture_urls[picture_index];
    wx.previewImage({
      current: current,
      urls: picture_urls,
      fail: function (res) {
        wx.showToast({
          title: '网络异常',
          icon: 'loading'
        })
      }
    })
  },
  //点击更多
  actionSheetTap: function () {
    var that = this;
    //列表
    var list = ['复制', '举报'];
    //判断是否是本人发表的message
    var user_id = that.data.message.user_id;
    if (wx.getStorageSync('user_id') == '15230203124') {
      list = ['复制', '举报', '删除','拉黑']
    } else if (user_id == wx.getStorageSync('user_id')) {
      list = ['复制', '举报', '删除']
    }
    wx.showActionSheet({
      itemList: list,
      success: function (res) {
        if (res.tapIndex == 0) {
          that.copyContent();
        } else if (res.tapIndex == 1) {
          wx.showModal({
            title: '提示',
            content: '确定举报此记录？',
            success: function (res) {
              if (res.confirm) {
                that.report();
              }
            }
          })
        } else if (res.tapIndex == 2) {
          that.deleteMessage();
        } else if (res.tapIndex == 3) {
          wx.showModal({
            title: '警告',
            content: '是否要拉黑此人？',
            success: function (res) {
              if (res.confirm) {
                that.addBlacklist();
              }
            }
          })
        }
      },
    })
  },
  //复制内容
  copyContent: function () {
    this.setData({
      menu: 1,
      actionSheetHidden: !this.data.actionSheetHidden
    });
    var content = this.data.message.content;
    wx.setClipboardData({
      data: content,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
              icon: 'success',
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '没文本内容',
              icon: 'loading',
            })
          }
        })
      }
    })
  },
  //删除记录
  deleteMessage: function () {
    var that = this;
    wx.showModal({
      title: '警告',
      content: '确定要删除这条记录吗？',
      success: function (res) {
        if (res.confirm) {
          var mid = that.data.message.mid;
          //删除照片
          if (that.data.message.pictures_length > 0) {
            //图片删除成功的图片文件名
            var dir_name = 'yunquan';
            for (var i = 0; i < that.data.message.pictures.length; i++) {
              var fileName = that.data.message.pictures[i];
              delPicture(fileName, dir_name);
            }
          }
          var user_id = wx.getStorageSync('user_id');
          var date = util.formatTime2(new Date());
          var str = user_id + '&^!*@' + date;
          var AppId = md5.hexMD5(str);
          wx.request({
            url: 'https://www.tianyae.com/yxz/yunquan/delMessage.php',
            data: {
              AppId: AppId,
              user_id: user_id,
              mid: mid,
            },
            success: function (res) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
              });
              //返回后刷新
              var pages = getCurrentPages();
              var currPage = pages[pages.length - 1];  //当前页面
              var prevPage = pages[pages.length - 2]; //上一个页面
              //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
              prevPage.setData({
                isFresh: true
              })
              wx.navigateBack();
            },
            fail: function (res) {
              wx.showToast({
                title: '网络异常',
                icon: 'loading'
              })
            }
          });
        }
      }
    })
  },
  //发表评论
  newComment:function(content){
    var that = this;
    if(content == ""){
      wx.showToast({
        title: '你啥都没说~',
        icon:'loading'
      })
    }else{
      var m = new Date().getSeconds().toString();
      if (m != wx.getStorageSync('m')) {
        wx.setStorageSync('m', m);
        var mid = that.data.message.mid;
        var user_id = wx.getStorageSync('user_id');
        var page = 'pages/community/item/item?method=indirect&mid=' + mid;
        var title = that.data.message.content;
        var data_info = title + "," + content + "," + wx.getStorageSync('user_nickName');
        var to = that.data.toUser;
        var at = that.data.atComment;
        var date = util.formatTime2(new Date());
        var str = user_id + '&^!*@' + date;
        var AppId = md5.hexMD5(str);
        wx.request({
          url: 'https://www.tianyae.com/yxz/yunquan/newComment.php',
          data: {
            AppId: AppId,
            mid: mid,
            user_id: user_id,
            page: page,
            at: at,
            to: to,
            content: content,
            data_info: data_info
          },
          success: function (res) {
            switch (res.data.code) {
              case 1001: wx.showToast({ title: '非法操作', icon: 'loading' }); break;
              case 1002: wx.showToast({ title: '参数有误', icon: 'loading' }); break;
              case 1003: wx.showToast({ title: '服务器异常', icon: 'loading' }); break;
              case 1004:
                wx.showToast({ title: '评论成功', icon: 'success' });
                that.setData({
                  inputValue: '',
                  commentToWho: '',
                })
                that.onPullDownRefresh();
                var param1 = {};
                var string1 = "message.comment_num";
                param1[string1] = that.data.message.comment_num + 1;
                that.setData(param1);
                break;
              case 1005:
                wx.showToast({ title: '评论成功', icon: 'success' });
                that.setData({
                  inputValue: '',
                  commentToWho: '',
                })
                that.onPullDownRefresh();
                var param1 = {};
                var string1 = "message.comment_num";
                param1[string1] = that.data.message.comment_num + 1;
                that.setData(param1);
                break;
              case 1006:
                wx.showToast({
                  title: '你被禁言了',
                  icon: 'loading'
                })
                break;
            }
          }
        })
      } else {
        wx.showToast({
          title: '请勿重复提交',
          icon: 'loading'
        });
      }
    }


  },
  //获取评论列表
  getComments:function(mid,page,num){
    var that = this;
    var mid = mid;
    var user_id = wx.getStorageSync('user_id');
    var date = util.formatTime2(new Date());
    var str = user_id + '&^!*@' + date;
    var AppId = md5.hexMD5(str);
    wx.request({
      url: 'https://www.tianyae.com/yxz/yunquan/getComments.php',
      data:{
        AppId:AppId,
        user_id:user_id,
        mid:mid,
        page:page,
        num:num
      },
      success:function(res){
        if(res.data.code == 1002){
          var first = res.data.data.first;
          var user_info = res.data.data.user_info;
          //格式化firstComment
          for(var i=0;i<first.length;i++){
            //添加个人信息
            var tName, tImg = 'defalut.png', tTime, tDepartment;
            for(var j=0;j<user_info.length;j++){
              if(first[i].user_id == user_info[j].user_id){
                tName = user_info[j].user_name;
                tDepartment = user_info[j].stu_department;
                if (user_info[j].user_img!=null){
                  tImg = user_info[j].user_img;
                }
                break;
              }
            }
            //格式化时间
            tTime = that.formatTime(first[i].time);
            //格式化second
            var second = first[i].secondComments;
            var tempSeconds = new Array();
            if (second.length>0){
              for (var k = 0; k < second.length; k++) {
                var user = null, toUser = null, sTime, tempSecond;
                for (var l = 0; l < user_info.length; l++) {
                  if (second[k].user_id == user_info[l].user_id) {
                    user = user_info[l].user_name;
                  }
                  if (second[k].to == user_info[l].user_id) {
                    toUser = user_info[l].user_name;
                  }
                  if(user!=null&&toUser!=null){
                    break;
                  }
                }
                sTime = that.formatTime(second[k].time);
                tempSecond = [{
                  cid:second[k].cid,
                  user:user,
                  toUser:toUser,
                  user_id:second[k].user_id,
                  toUser_id: second[k].to,
                  content: second[k].content,
                }];
                tempSeconds.push(tempSecond);
              }
            }
            var temp = [{
              cid: first[i].cid,
              user_name:tName,
              user_id: first[i].user_id,
              user_img: tImg,
              department: tDepartment,
              content: first[i].content,
              time:tTime,
              secondComments:tempSeconds,
            }];
            that.setData({ firstComment: that.data.firstComment.concat(temp) });
          }
        } else if (res.data.code == 1001 || res.data.code == 1003){
          wx.showToast({
            title: '获取评论失败',
            icon: 'loading'
          })
        }
      }
    })
  },
  //格式化时间
  formatTime: function (time) {
    var today = this.getDateStr(0);
    var yearstoday = this.getDateStr(-1);
    var temp = time.split(' ');
    var time = temp[1].split(':')[0] + ':' + temp[1].split(':')[1];
    if (temp[0] == today) {
      return time;
    } else if (temp[0] == yearstoday) {
      return '昨天 ' + time;
    } else {
      return temp[0].split('-')[1] + '-' + temp[0].split('-')[2] + ' ' + time;
    }
  },
  //获取前后n天的日期
  getDateStr: function (n) {
    var dd = new Date();
    dd.setDate(dd.getDate() + n);
    return util.formatTime2(dd);
  },
  //准备评论时，显示回复谁的
  inputFocus: function (method,focus,name, at, to){
    var that = this;
    var commentToWho;
    if(method == 'first'){
      commentToWho = that.data.message.nickname;
    }else if(method == 'second'){
      commentToWho = name;
    }
    that.setData({
      isFocus:focus,
      commentMethod:method,
      commentToWho: commentToWho,
      atComment:at,
      toUser:to
    });
  },
  //从数据库获取信息
  getMessage:function(mid){
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var date = util.formatTime2(new Date());
    var str = user_id + '&^!*@' + date;
    var AppId = md5.hexMD5(str);
    wx.request({
      url: 'https://www.tianyae.com/yxz/yunquan/getMessage.php',
      data: {
        user_id: user_id,
        AppId: AppId,
        mid: mid
      },
      success: function (res) {
        if (res.data.code == 1002) {
          var data = res.data.data[0];
          //格式化时间
          data.time = that.formatTime(data.time);
          //如果头像为空，设为默认头像
          var user_img = "defalut.png";
          if (data.user_info.img != null) {
            user_img = data.user_info.img;
          }
          var message = [{
            content: data.content,
            time: data.time,
            comment_num: data.comment_num,
            like_num: data.like_num,
            mid: mid,
            isLike: data.isLike,
            nickname: data.user_info.nickname,
            sex: data.user_info.sex,
            department: data.user_info.department,
            img: user_img,
            user_id: data.user_info.user_id,
            pictures: data.pictures,
            pictures_length: data.pictures.length,
          }];
          that.setData({ message: message[0] });
          wx.hideLoading();
        } else if (res.data.code == 1003) {
          wx.showToast({
            title: '服务器异常',
            icon: 'loading'
          });
        } else if (res.data.code == 1004) {
          wx.showToast({
            title: '该记录不存在',
            icon: 'loading'
          });
        } else {
          wx.showToast({
            title: '非法操作',
            icon: 'loading'
          });
        }
      }
    })
  },
  //举报内容
  report: function () {
    var that = this;
    var mid = that.data.message.mid;
    var user_id = wx.getStorageSync('user_id');
    var time = util.formatTime3(new Date());
    var page = 'pages/community/item/item?method=indirect&mid=' + mid;
    var content = that.data.message.content;
    if (content == "") {
      content = "[图片]";
    }
    var data_info = content + "," + user_id + "(举报人)";
    wx.request({
      url: 'https://www.tianyae.com/yxz/yunquan/newReport.php',
      data: {
        mid: mid,
        user_id: user_id,
        time: time,
        page: page,
        data_info: data_info
      },
      success: function (res) {
        if (res.data.code == 1003) {
          wx.showToast({
            title: '举报成功',
            icon: 'success',
          });
        } else {
          wx.showToast({
            title: '服务器异常',
            icon: 'loading',
          });
        }
      },
      fail: function (res) {
        console.log('error:' + res);
      }
    })
  },
  //拉黑用户
  addBlacklist: function () {
    var that = this;
    var black_id = that.data.message.user_id;
    var user_id = wx.getStorageSync('user_id');
    var date = util.formatTime2(new Date());
    var str = user_id + '&^!*@' + date;
    var AppId = md5.hexMD5(str);
    wx.request({
      url: 'https://www.tianyae.com/yxz/yunquan/addBlackList.php',
      data: {
        AppId: AppId,
        user_id: user_id,
        black_id: black_id,
      },
      success: function (res) {
        if (res.data.code == 1002) {
          wx.showToast({
            title: '拉黑成功',
            icon: 'success'
          })
        } else if (res.data.code == 1001) {
          wx.showToast({
            title: '非法操作',
            icon: 'loading'
          })
        } else {
          wx.showToast({
            title: '服务器异常',
            icon: 'loading'
          })
        }
      }
    })
  },
  //二次评论
  secondComment:function(e){
    var that = this;
    var set = e.currentTarget.dataset.set.split(',');
    var nickname = set[0];
    var cid = set[1];
    var user_id = set[2];
    var delCid = cid;
    var method = 'first';
    if(set.length==4){
      delCid = set[3];
      method = 'second';
    }
    if(user_id == wx.getStorageSync('user_id')){
      wx.showModal({
        title: '警告',
        content: '确定要删除这条记录吗？',
        success: function (res) {
          if (res.confirm) {
            //删除照片
            if (that.data.message.pictures_length > 0) {
              //图片删除成功的图片文件名
              var dir_name = 'yunquan';
              for (var i = 0; i < that.data.message.pictures.length; i++) {
                var fileName = that.data.message.pictures[i];
                delPicture(fileName, dir_name);
              }
            }
            var date = util.formatTime2(new Date());
            var str = user_id + '&^!*@' + date;
            var AppId = md5.hexMD5(str);
            wx.request({
              url: 'https://www.tianyae.com/yxz/yunquan/delComment.php',
              data: {
                AppId: AppId,
                user_id: user_id,
                cid: delCid,
                method:method,
              },
              success: function (res) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                });
                that.onPullDownRefresh();
              },
              fail: function (res) {
                wx.showToast({
                  title: '网络异常',
                  icon: 'loading'
                })
              }
            });
          }
        }
      })
    }else{
      that.inputFocus('second', true, nickname, cid, user_id);
    }
  }
})
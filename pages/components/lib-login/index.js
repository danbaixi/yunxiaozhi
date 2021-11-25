const app = getApp()
import {
  getVerifyImg,
  login
} from '../../api/library'
import { openArticle } from '../../../utils/common'
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    stu_id: '',
    password: '',
    code: '',
    markPwd: true
  },

  lifetimes: {
    attached() {
      this.getVerifyImg()
      // 学号
      const stu_id = wx.getStorageSync('user_id')
      // 密码
      const password = wx.getStorageSync('lib_pwd')
      // 获取推文链接
      const article = app.getConfig('articles.library')
      this.setData({
        article,
        stu_id,
        password
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hide() {
      this.triggerEvent('hide')
    },
    getVerifyImg() {
      const that = this
      getVerifyImg().then(res => {
        that.setData({
          ...res.data
        })
      })
    },
    switchMark(e) {
      this.setData({
        markPwd: e.detail.value
      })
    },
    login() {
      const that = this
      const {
        stu_id,
        password,
        code,
        codeKey,
        cookie
      } = this.data
      if (stu_id == '' || password == '' || code == '') {
        wx.showToast({
          title: '请填写完整的信息',
          icon: 'none'
        })
        return
      }
      login({
        stu_id,
        password,
        code,
        codeKey,
        cookie
      }).then(res => {
        if (res.status == -1) {
          wx.showToast({
            title: res.message || '登录失败，请重试',
            icon: 'none'
          })
          that.getVerifyImg()
          that.setData({
            code: ''
          })
          return
        }
        // 记住密码
        wx.setStorageSync('lib_pwd', that.data.markPwd ? password : '')
        // 记住登录的session
        wx.setStorageSync('lib_cookie', cookie)
        wx.setStorageSync('lib_id', stu_id)
        wx.showToast({
          title: '登录成功',
          icon: 'none'
        })
        that.triggerEvent('success')
      }).catch(err => {
        wx.showToast({
          title: err.message || '登录失败，请重试',
          icon: 'none'
        })
        that.triggerEvent('fail')
      })
    },
    viewHelp() {
      openArticle(this.data.article)
    }
  }
})
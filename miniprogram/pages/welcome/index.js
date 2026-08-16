const { call } = require('../../utils/api')
Page({
  data: { familyName: '我们的家', inviteCode: '', loading: false },
  async onShow(){try{const data=await call('bootstrap');if(data.family)wx.switchTab({url:'/pages/today/index'})}catch(_){}},
  onName(e) { this.setData({ familyName: e.detail.value }) },
  onCode(e) { this.setData({ inviteCode: e.detail.value.toUpperCase() }) },
  async createFamily() {
    if (!this.data.familyName.trim()) return wx.showToast({ title: '请输入家庭名称', icon: 'none' })
    this.setData({ loading: true })
    try { await call('createFamily', { name: this.data.familyName.trim() }); wx.switchTab({ url: '/pages/today/index' }) } catch (_) {} finally { this.setData({ loading: false }) }
  },
  async joinFamily() {
    if (this.data.inviteCode.length !== 6) return wx.showToast({ title: '请输入 6 位邀请码', icon: 'none' })
    this.setData({ loading: true })
    try { await call('joinFamily', { inviteCode: this.data.inviteCode }); wx.switchTab({ url: '/pages/today/index' }) } catch (_) {} finally { this.setData({ loading: false }) }
  }
})

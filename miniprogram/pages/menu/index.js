const { call } = require('../../utils/api')
Page({
  data: { dishes: [], loading: true },
  onShow() { this.load() },
  async load() {
    try {
      const data = await call('bootstrap')
      if (!data.family) return wx.redirectTo({ url: '/pages/welcome/index' })
      getApp().globalData.family = data.family
      this.setData({ dishes: data.dishes.map(d => ({ ...d, ingredientSummary: (d.ingredients || []).map(i => i.name).join('、') })), loading: false })
    } catch (_) { this.setData({ loading: false }) }
    wx.stopPullDownRefresh()
  },
  onPullDownRefresh() { this.load() },
  addDish() { wx.navigateTo({ url: '/pages/dish-edit/index' }) },
  editDish(e) { wx.navigateTo({ url: `/pages/dish-edit/index?id=${e.currentTarget.dataset.id}` }) }
})

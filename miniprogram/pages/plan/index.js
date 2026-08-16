const { call } = require('../../utils/api')
const { today, friendly } = require('../../utils/date')
Page({
  data: { date: today(), friendlyDate: friendly(today()), dishes: [], selectedIds: [], selectedMap: {}, saving: false },
  onLoad(options){if(options.date)this.setData({date:options.date,friendlyDate:friendly(options.date)})},
  onShow() { this.load() },
  async load() {
    try {
      const data = await call('getPlan', { date: this.data.date })
      if (!data.family) return wx.redirectTo({ url: '/pages/welcome/index' })
      const selectedIds = data.myDishIds || []
      this.setData({ dishes: data.dishes.map(d => ({ ...d, ingredientSummary: (d.ingredients || []).map(i => i.name).join('、') })), selectedIds, selectedMap: selectedIds.reduce((m,id)=>(m[id]=true,m),{}) })
    } catch (_) {}
    wx.stopPullDownRefresh()
  },
  onPullDownRefresh() { this.load() },
  changeDate(e) { const date=e.detail.value; this.setData({ date, friendlyDate:friendly(date) }); this.load() },
  toggle(e) { const id=e.currentTarget.dataset.id; const selectedIds=this.data.selectedMap[id]?this.data.selectedIds.filter(x=>x!==id):[...this.data.selectedIds,id]; this.setData({ selectedIds, selectedMap:selectedIds.reduce((m,x)=>(m[x]=true,m),{}) }) },
  async save() { this.setData({saving:true}); try { await call('saveSelection',{date:this.data.date,dishIds:this.data.selectedIds}); wx.showToast({title:'今日菜单已同步'});setTimeout(()=>wx.navigateBack(),500) } catch(_){} finally { this.setData({saving:false}) } }
})

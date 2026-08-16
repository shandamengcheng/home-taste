const { call } = require('../../utils/api')
const { today, friendly } = require('../../utils/date')
Page({
  data:{date:today(),friendlyDate:friendly(today()),dishNames:'',items:[],checkedCount:0,progress:0},
  onShow(){this.load()}, onPullDownRefresh(){this.load()},
  async load(){try{const data=await call('getShopping',{date:this.data.date});if(!data.family)return wx.redirectTo({url:'/pages/welcome/index'});this.setData({dishNames:data.dishNames.join('、'),items:data.items});this.stats()}catch(_){}wx.stopPullDownRefresh()},
  changeDate(e){const date=e.detail.value;this.setData({date,friendlyDate:friendly(date)});this.load()},
  stats(){const checkedCount=this.data.items.filter(i=>i.checked).length;this.setData({checkedCount,progress:this.data.items.length?Math.round(checkedCount/this.data.items.length*100):0})},
  toggle(e){const index=e.currentTarget.dataset.index;this.setData({[`items[${index}].checked`]:!this.data.items[index].checked});this.stats();this.persist()},
  clearChecked(){this.setData({items:this.data.items.map(i=>({...i,checked:false}))});this.stats();this.persist()},
  async persist(){await call('saveShopping',{date:this.data.date,checkedNames:this.data.items.filter(i=>i.checked).map(i=>i.name),hiddenNames:[]})}
})

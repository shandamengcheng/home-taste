const { call } = require('../../utils/api')
Page({
  data:{activeTab:'recommended',tabs:[['recommended','推荐'],['family','我家'],['frequent','常点']],categories:['全部'],category:'全部',recommended:[],familyDishes:[],frequent:[],displayDishes:[],loading:true},
  onShow(){this.load()}, onPullDownRefresh(){this.load()},
  async load(){try{const decorate=d=>({...d,ingredientSummary:(d.ingredients||[]).map(i=>i.name).join('、')});const data=await call('getCatalog');data.recommended=data.recommended.map(decorate);data.familyDishes=data.familyDishes.map(decorate);const all=[...data.familyDishes,...data.recommended];const frequent=all.filter(d=>d.selectedCount30d>0).sort((a,b)=>b.selectedCount30d-a.selectedCount30d);this.setData({...data,frequent,categories:['全部',...data.categories],loading:false});this.filter()}catch(_){this.setData({loading:false})}wx.stopPullDownRefresh()},
  switchTab(e){this.setData({activeTab:e.currentTarget.dataset.tab,category:'全部'});this.filter()},
  pickCategory(e){this.setData({category:e.currentTarget.dataset.value});this.filter()},
  filter(){const list=this.data.activeTab==='recommended'?this.data.recommended:this.data.activeTab==='family'?this.data.familyDishes:this.data.frequent;this.setData({displayDishes:this.data.category==='全部'?list:list.filter(d=>d.category===this.data.category)})},
  addDish(){wx.navigateTo({url:'/pages/dish-edit/index'})},
  viewDish(e){const {id,source}=e.currentTarget.dataset;if(source==='system')wx.navigateTo({url:`/pages/dish-detail/index?id=${id}`});else this.editDish(e)},
  editDish(e){const {id,source}=e.currentTarget.dataset;if(source==='system')return;wx.navigateTo({url:`/pages/dish-edit/index?id=${id}`})},
  async favorite(e){e.stopPropagation&&e.stopPropagation();try{await call('favoriteDish',{id:e.currentTarget.dataset.id});wx.showToast({title:'已收藏到我家'});this.load()}catch(_){} }
})

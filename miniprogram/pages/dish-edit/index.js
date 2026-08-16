const { call } = require('../../utils/api')
const colors = ['#f4d6b0', '#cfe7d1', '#f4c8c1', '#d9d5ef', '#cbe2ed', '#f2e5a9']
const templates = [
  { name:'番茄炒蛋',emoji:'🍳',category:'快手菜',ingredients:[{name:'番茄',amount:'2个'},{name:'鸡蛋',amount:'3个'},{name:'小葱',amount:'1根'}],tags:['快手','下饭'] },
  { name:'可乐鸡翅',emoji:'🍗',category:'荤菜',ingredients:[{name:'鸡翅中',amount:'10个'},{name:'可乐',amount:'1听'},{name:'生姜',amount:'3片'}],tags:['下饭','经典'] },
  { name:'清炒时蔬',emoji:'🥗',category:'素菜',ingredients:[{name:'青菜',amount:'1把'},{name:'蒜',amount:'3瓣'}],tags:['清淡','快手'] },
  { name:'红烧肉',emoji:'🥩',category:'荤菜',ingredients:[{name:'五花肉',amount:'500g'},{name:'生姜',amount:'4片'},{name:'冰糖',amount:'适量'}],tags:['下饭','经典'] },
  { name:'清蒸鱼',emoji:'🐟',category:'荤菜',ingredients:[{name:'鲜鱼',amount:'1条'},{name:'生姜',amount:'4片'},{name:'小葱',amount:'2根'}],tags:['清淡','宴客'] },
  { name:'玉米排骨汤',emoji:'🍲',category:'汤羹',ingredients:[{name:'排骨',amount:'500g'},{name:'玉米',amount:'1根'},{name:'胡萝卜',amount:'1根'}],tags:['营养','清淡'] },
  { name:'蛋炒饭',emoji:'🍛',category:'主食',ingredients:[{name:'米饭',amount:'2碗'},{name:'鸡蛋',amount:'2个'},{name:'小葱',amount:'1根'}],tags:['快手','主食'] },
  { name:'肉末蒸蛋',emoji:'🥘',category:'儿童菜',ingredients:[{name:'鸡蛋',amount:'3个'},{name:'肉末',amount:'100g'}],tags:['儿童','营养'] }
]
const quickIngredients = [
  {name:'鸡蛋',amount:'3个'},{name:'番茄',amount:'2个'},{name:'猪肉',amount:'300g'},{name:'鸡肉',amount:'300g'},
  {name:'排骨',amount:'500g'},{name:'鲜鱼',amount:'1条'},{name:'青菜',amount:'1把'},{name:'土豆',amount:'2个'},
  {name:'胡萝卜',amount:'1根'},{name:'生姜',amount:'3片'},{name:'蒜',amount:'3瓣'},{name:'小葱',amount:'2根'}
]

Page({
  data:{id:'',name:'',emoji:'🍲',color:colors[0],emojis:['🍲','🥘','🍜','🍛','🥗','🍗','🐟','🥩','🥟','🍳'],categories:['荤菜','素菜','汤羹','主食','快手菜','儿童菜'],category:'快手菜',ingredients:[{name:'',amount:''}],commonTags:['快手','下饭','清淡','营养','儿童','经典','宴客','主食'],selectedTags:[],selectedTagMap:{},customTagsText:'',templates,quickIngredients,note:'',saving:false},
  async onLoad(options){
    if(!options.id)return
    const dish=await call('getDish',{id:options.id})
    const tags=dish.tags||[]
    const selectedTags=tags.filter(tag=>this.data.commonTags.includes(tag))
    this.setData({id:dish._id,name:dish.name,emoji:dish.emoji,color:dish.color,category:dish.category||'快手菜',ingredients:dish.ingredients.length?dish.ingredients:[{name:'',amount:''}],selectedTags,selectedTagMap:selectedTags.reduce((map,tag)=>(map[tag]=true,map),{}),customTagsText:tags.filter(tag=>!this.data.commonTags.includes(tag)).join(', '),note:dish.note||''})
  },
  setName(e){this.setData({name:e.detail.value})},
  setCustomTags(e){this.setData({customTagsText:e.detail.value})},
  setNote(e){this.setData({note:e.detail.value})},
  setCategory(e){this.setData({category:e.currentTarget.dataset.value})},
  pickEmoji(e){const i=this.data.emojis.indexOf(e.currentTarget.dataset.value);this.setData({emoji:e.currentTarget.dataset.value,color:colors[i%colors.length]})},
  applyTemplate(e){
    const template=this.data.templates[e.currentTarget.dataset.index]
    const emojiIndex=this.data.emojis.indexOf(template.emoji)
    const selectedTags=template.tags.filter(tag=>this.data.commonTags.includes(tag))
    this.setData({name:template.name,emoji:template.emoji,color:colors[(emojiIndex<0?0:emojiIndex)%colors.length],category:template.category,ingredients:template.ingredients.map(item=>({...item})),selectedTags,selectedTagMap:selectedTags.reduce((map,tag)=>(map[tag]=true,map),{}),customTagsText:''})
    wx.showToast({title:'已自动填写，可继续修改',icon:'none'})
  },
  addQuickIngredient(e){
    const item=this.data.quickIngredients[e.currentTarget.dataset.index]
    if(this.data.ingredients.some(ingredient=>ingredient.name===item.name))return wx.showToast({title:'已经添加过了',icon:'none'})
    const ingredients=this.data.ingredients.map(ingredient=>({...ingredient}))
    const emptyIndex=ingredients.findIndex(ingredient=>!ingredient.name.trim())
    if(emptyIndex>=0)ingredients[emptyIndex]={...item};else ingredients.push({...item})
    this.setData({ingredients})
  },
  toggleTag(e){const tag=e.currentTarget.dataset.value;const selectedTags=this.data.selectedTagMap[tag]?this.data.selectedTags.filter(item=>item!==tag):[...this.data.selectedTags,tag];this.setData({selectedTags,selectedTagMap:selectedTags.reduce((map,item)=>(map[item]=true,map),{})})},
  addIngredient(){this.setData({ingredients:[...this.data.ingredients,{name:'',amount:''}]})},
  removeIngredient(e){const ingredients=this.data.ingredients.filter((_,i)=>i!==e.currentTarget.dataset.index);this.setData({ingredients:ingredients.length?ingredients:[{name:'',amount:''}]})},
  changeIngredient(e){const {index,field}=e.currentTarget.dataset;this.setData({[`ingredients[${index}].${field}`]:e.detail.value})},
  async save(){
    if(!this.data.name.trim())return wx.showToast({title:'请输入菜名',icon:'none'})
    const ingredients=this.data.ingredients.filter(i=>i.name.trim()).map(i=>({name:i.name.trim(),amount:i.amount.trim()}))
    if(!ingredients.length)return wx.showToast({title:'至少添加一种食材',icon:'none'})
    const customTags=this.data.customTagsText.split(/[,，]/).map(s=>s.trim()).filter(Boolean)
    this.setData({saving:true})
    try{await call('saveDish',{dish:{_id:this.data.id||undefined,name:this.data.name.trim(),emoji:this.data.emoji,color:this.data.color,category:this.data.category,ingredients,tags:[...new Set([...this.data.selectedTags,...customTags])],note:this.data.note.trim()}});wx.showToast({title:'已保存'});setTimeout(()=>wx.navigateBack(),500)}finally{this.setData({saving:false})}
  },
  remove(){wx.showModal({title:'删除这道菜？',content:'历史菜单仍会保留菜名快照。',success:async r=>{if(r.confirm){await call('deleteDish',{id:this.data.id});wx.navigateBack()}}})}
})

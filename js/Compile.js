function Compile(options) {
    this.el = this.isElementNode(options.el)?el:document.querySelector(options.el);
    this.$data = options.data
    this.vm = this;
    if(this.el){
        /* 如果元素存在，才开始编译*/
        // step : 1 先把真实的dom 移入到内存中 fragemnt
       var fragemnt = this.node2fragment(this.el) 
        // step : 2 提取想要的元素节点 v-model 和文本节点{{}}
       this.compile(fragemnt)    
        // step : 3把编译好的fragment 塞回到页面
       this.el.appendChild(fragemnt) 
    }
    
}
 /** 辅助方法 */
Compile.prototype.isElementNode = function(node){
    return node.nodeType === 1
}

Compile.prototype.isDirective = function(name){
    return name.includes('v-')
}
 /**核心方法*/

Compile.prototype.node2fragment = function(el){
    var fragment = document.createDocumentFragment();
    var firstChild;
    while(firstChild = el.firstChild){
        fragment.appendChild(firstChild) 
    }
    return fragment // 内存中的节点
 }
 /**
 *  编译元素 v-model
 */
Compile.prototype.compileElement = function(node){
  var _this = this  
  var attrs = node.attributes;
  Array.from(attrs).forEach(function(attr){
     // 包含v- 
     var attrName = attr.name
     if(_this.isDirective(attrName)){
        // 与节点匹配
        var expr = attr.value
        var type = attrName.slice(2)
         // node this.vm.$data // v-model v-text, v-html
         // todo .......
         if(type.includes('bind')){
            CompileUtil['bind'](node,_this.vm,expr)    
         }else{
            CompileUtil[type](node,_this.vm,expr)
         }
     }
  })
}
/**
 * 编译文本 v-text
 */
Compile.prototype.compileText = function(node){
   // 带{{}}
   var expr = node.textContent
   var reg = /\{\{([^}]+)\}\}/g
   if(reg.test(expr)){
       // node this.vm.$data 
       // todo ....... 
       CompileUtil['text'](node,this.vm,expr)
   }
}

Compile.prototype.compile = function(frament){
    var _this = this
    // 递归
    var childNodes = frament.childNodes
    Array.from(childNodes).forEach(function(node){
        if(_this.isElementNode(node)){
             // element 节点 
             // 编译元素
             _this.compileElement(node)
             _this.compile(node)  
        }else{
            // text 节点
            // 编译文本
            _this.compileText(node)
        }
    })
}

CompileUtil = {
    // 获取实例对应的数据
    getVal (vm,expr) {
       expr = expr.split('.')
       return expr.reduce(function(prev,next){
          return prev[next]  
       },vm.$data)
    },
    /**
     * 文本处理
     */
    text (node,vm,expr) {
        var value = expr.replace(/\{\{([^}]+)\}\}/g,function(){
            return arguments[1]
        })
       var updateFn = this.updater['textUpdater'] 
       updateFn && updateFn(node,this.getVal(vm,value))
    },
    bind (node,vm,expr) {
        node.removeAttribute('v-bind:'+expr)
        node.setAttribute(expr,this.getVal(vm,expr))
    },
    if (node,vm,expr){

    },
    model(node,vm,expr) {
       var updateFn = this.updater['modelUpdater'] 
       updateFn && updateFn(node,this.getVal(vm,expr))     
    },
    updater: {
        // 文本更新
        textUpdater(node,value){
           node.textContent = value       
        },
        // model 更新
        modelUpdater(node,value){
           node.value = value     
        }
    }
}
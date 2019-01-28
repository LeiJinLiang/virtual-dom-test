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
        var type = attrName.includes(':')?attrName.split(':')[0].slice(2):attrName.slice(2)
         // node this.vm.$data // v-model v-text, v-html
         // todo .......
        
        CompileUtil[type](node,_this.vm,expr,_this)
        if(type != 'for'){
            _this.compile(node)
        }
     }
  })
  if(attrs.length == 0){
        _this.compile(node)
  }
}
/**
 * 编译文本 v-text
 */
Compile.prototype.compileText = function(node,options){
   // 带{{}}
   var expr = node.textContent
   var reg = /\{\{([^}]+)\}\}/g
   if(reg.test(expr)){
       // node this.vm.$data 
       // todo ....... 
       CompileUtil['text'](node,this.vm,expr,options)
   }
}

/**
 * fragment  内存中的元素
 * options : {
 *   isFor : true,
 *   key : items     
 * }
 */
Compile.prototype.compile = function(frament,options){
    var _this = this
    // 递归
    var childNodes = frament.childNodes
    Array.from(childNodes).forEach(function(node){
        if(_this.isElementNode(node)){
             // element 节点 
             // 编译元素
             _this.compileElement(node)
        }else{
            // text 节点
            // 编译文本
            _this.compileText(node,options)
        }
    })
}

CompileUtil = {
    // 获取实例对应的数据
    getVal (vm,expr,text,options) {
        var hasExpress = false
        expr = expr.trim() 
        if(expr.includes('$')){
           hasExpress = true
           var item = Object.assign({},options.data)
           expr = expr.split('$')[1]
           return text + eval(expr)      
        }else{
           expr = expr.split('.') 
        }  
        if(!hasExpress){
            if(options && options.isFor){
                var result = options.data[expr[1]]
                return text + result     
            }else{
                return expr.reduce(function(prev,next){
                    return prev[next]  
                },vm.$data)
            }     
        } 
    },
    /**
     * 文本处理
     */
    text (node,vm,expr,options) {
        var value = expr.replace(/\{\{([^}]+)\}\}/g,function(){
            return arguments[1]
        })
        var pureText = expr.split('{{').length>0?expr.split('{{')[0]:''
        var updateFn = this.updater['textUpdater'] 
        updateFn && updateFn(node,this.getVal(vm,value,pureText,options))
    },
    bind (node,vm,expr) {
        node.removeAttribute('v-bind:'+expr)
        node.setAttribute(expr,this.getVal(vm,expr))
    },
    if (node,vm,expr){
        node.removeAttribute('v-if',+expr)
        if(expr != 'show'){
            node.remove() 
        }
    },
    for(node,vm,expr,_this){
        var self = _this
        expr = expr.split('of') && expr.split('of')[1] && expr.split('of')[1].trim()
        var parentNode = node.parentNode;
		var startNode = document.createTextNode('');
		var endNode = document.createTextNode('');
		var range = document.createRange();
		parentNode.replaceChild(endNode, node); // 去掉原始模板
        parentNode.insertBefore(startNode, endNode);
        range.setStart(startNode, 0);
        range.setEnd(endNode, 0);
        range.deleteContents();   
        vm.$data[expr].forEach(function(item,idx){
            var cloneNode = node.cloneNode(true);
            cloneNode.removeAttribute('v-for')
            cloneNode.setAttribute('key',idx)
            parentNode.insertBefore(cloneNode, endNode);
            var opt = {
                isFor : true,
                data : item
            }
            self.compile(cloneNode,opt)
        })
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
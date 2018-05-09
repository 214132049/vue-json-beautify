### 基于vue指令，显示格式化后的JSON字符串。

# options
  指令修饰符：

    iscollapsible:  是否显示折叠收起图标, 缩写:c, 默认为 true

    quotekeys:  json属性是否有引号, 缩写:q, 默认为 true

  指令参数：

    例：
      1  缩进2个空格(默认)
      2  缩进4个空格
      3  缩进6个空格
# usage
 ```
  /* 引入样式 */
  @import '~vue-json/lib/index.css'


  /* html */
  <div v-demo:2.q.c="code"></div>


  /* js */
  import VueJson from 'vue-json'

  Vue.directive('demo', function(el, binding) {
    VueJson(el, binding)
  })
 ```

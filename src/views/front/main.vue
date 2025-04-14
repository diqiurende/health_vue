<template>

  <div class="container">
    <header>
      <div class="logo-container">
        <img src="../../assets/front/index/logo.png" class="logo" />
        <div>
          <h3>神州大健康</h3>
          <p>www.chinahealty.com</p>
        </div>
      </div>

      <div class="search-container">
        <div>
          <el-input v-model="header.keyword" placeholder="请输入套餐名或者编号"
                    size="large" maxlength="50" class="keyword-input"
                    clearable>
<!--            //右侧插槽 显示搜索按钮-->
            <template #append>
              <el-button>搜索</el-button>
            </template>
          </el-input>
        </div>

<!--        //tag-->
        <div>
          <el-tag v-for="item in header.tags" :key="item.label"
                  :type="item.type" class="tag" effect="light" round>
            {{ item.label }}
          </el-tag>
        </div>

      </div>

      <!--        //登录注册-->
      <div class="operate-container">

        <el-button type="primary" size="large">
            注册/登录
        </el-button>
      </div>
    </header>

  </div>



  <!-- 避免路由引用页面的时候浏览器不刷新内容，所以给URL添加随机数参数 -->
  <router-view :key="router.currentRoute.value.query.random" />

  <footer>
    <div class="aboutus-container">
      <ul class="list">
        <li class="item">
          <img src="../../assets/front/index/d1.svg" />
          <div>
            <h3>官方直营</h3>
            <p>600余家体检中心线上预约、专注健康体检17年</p>
          </div>
        </li>
        <li class="item">
          <img src="../../assets/front/index/d2.svg" />
          <div>
            <h3>团队优势</h3>
            <p>标准化、智能化的医疗质量管理体系，打造全生命周期健康管理服务</p>
          </div>
        </li>
        <li class="item">
          <img src="../../assets/front/index/d3.svg" />
          <div>
            <h3>专业保证</h3>
            <p>拥有行业专家、医技护人员等近35000人组成的专业医疗服务团队</p>
          </div>
        </li>
        <li class="item">
          <img src="../../assets/front/index/d4.svg" />
          <div>
            <h3>售后服务</h3>
            <p>未消费订单及时退、过期退、体检保障和隐私保障</p>
          </div>
        </li>
      </ul>
    </div>
<!--    底部联系我们-->
    <div class="other-container">
      <ul class="list">
        <li class="left">
          <img src="../../assets/front/index/service.png" />
          <p class="tel">400-6578-5023</p>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">关于我们</a></li>
            <li><a href="">企业简介</a></li>
            <li><a href="">发展历程</a></li>
            <li><a href="">产业生态圈</a></li>
            <li><a href="">企业文化</a></li>
          </ul>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">每年资讯</a></li>
            <li><a href="">企业新闻</a></li>
            <li><a href="">媒体报道</a></li>
            <li><a href="">党建工作</a></li>
          </ul>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">客户服务</a></li>
            <li><a href="">帮助中心</a></li>
            <li><a href="">预约通道</a></li>
            <li><a href="">售后资讯</a></li>
            <li><a href="">隐私政策</a></li>
          </ul>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">业务合作</a></li>
            <li><a href="">友情链接</a></li>
            <li><a href="">联系我们</a></li>
          </ul>
        </li>
        <li class="right">
          <div class="ercode">
            <p>微信公众号</p>
            <img src="../../assets/front/index/ercode-1.png" />
          </div>
          <div class="ercode">
            <p>下载体检APP</p>
            <img src="../../assets/front/index/ercode-2.png" />
          </div>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import router from '../../router/index';
import { reactive, ref, getCurrentInstance, onMounted } from 'vue';
const { proxy } = getCurrentInstance();
const header = reactive({
  keyword: '',
  tags: [
    {
      label: '入职体检',
      type: 'info'
    },
    {
      label: '父母体检',
      type: 'info'
    },
    {
      label: '女士体检',
      type: 'info'
    }
  ]
});
</script>

<style lang="less" scoped>
@import url('main.less');
</style>
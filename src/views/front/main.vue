<template>

  <div class="container">
    <header>
      <div class="logo-container" @click="toindex">
        <img src="../../assets/front/index/lo.png" class="logo" />
        <div>
          <h3>华夏健康卫士</h3>
          <p>www.huaxiahealth.com</p>
        </div>
      </div>

      <div class="search-container">
        <div>
          <el-input v-model="header.keyword" placeholder="请输入套餐名或者编号"
                    size="large" maxlength="50" class="keyword-input"
                    clearable>
<!--            //右侧插槽 显示搜索按钮-->
            <template #append>
              <el-button @click="searchGoods">搜索</el-button>
            </template>
          </el-input>
        </div>

<!--        //tag-->
        <div>
          <el-tag v-for="item in header.tags" :key="item.label"
                  :type="item.type" class="tag" effect="light" round
                  @click="tagHandle(item.label)">
            {{ item.label }}
          </el-tag>
        </div>

      </div>

      <!--        //登录注册-->
      <div class="operate-container">
        <el-button type="primary" size="large"
                   v-if="dialog.status == 'logout'" @click="showDialog">
          登录/注册
        </el-button>
        <div class="btn" v-if="dialog.status == 'login'"
             @click="router.push({name:'FrontMine'})">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </div>
        <div class="btn" v-if="dialog.status == 'login'"
             @click="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出系统</span>
        </div>
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
            <h3>官方品质保障</h3>
            <p>直营体检中心，专注健康体检服务</p>
          </div>
        </li>
        <li class="item">
          <img src="../../assets/front/index/d2.svg" />
          <div>
            <h3>专业医疗团队</h3>
            <p>标准化管理体系，提供全方位健康管理</p>
          </div>
        </li>
        <li class="item">
          <img src="../../assets/front/index/d3.svg" />
          <div>
            <h3>资深专家团队</h3>
            <p>专家、医护人员，提供专业医疗服务</p>
          </div>
        </li>
        <li class="item">
          <img src="../../assets/front/index/d4.svg" />
          <div>
            <h3>安心售后服务</h3>
            <p>退款保障，体检安全和隐私双重保障</p>
          </div>
        </li>
      </ul>
    </div>
    <!-- 底部联系我们 -->
    <div class="other-container">
      <ul class="list">
        <li class="left" >
          <span class="logo_title">华夏健康卫士</span>
          <p class="tel">400-2812-5297</p>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">关于我们</a></li>
            <li><a href="">公司简介</a></li>
            <li><a href="">发展历程</a></li>
            <li><a href="">产业生态</a></li>
            <li><a href="">企业文化</a></li>
          </ul>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">新闻资讯</a></li>
            <li><a href="">公司新闻</a></li>
            <li><a href="">媒体报道</a></li>
            <li><a href="">党建工作</a></li>
          </ul>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">客户服务</a></li>
            <li><a href="">帮助中心</a></li>
            <li><a href="">体检预约</a></li>
            <li><a href="">售后服务</a></li>
            <li><a href="">隐私政策</a></li>
          </ul>
        </li>
        <li>
          <ul class="link-list">
            <li><a href="">商务合作</a></li>
            <li><a href="">友情链接</a></li>
            <li><a href="">联系方式</a></li>
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



  <el-dialog v-model="dialog.visible" title="手机快速登陆" width="400" class="dialog">
    <el-row>
      <el-col :span="24">
        <el-input v-model="dialog.tel" placeholder="输入手机号，快捷登陆"
                  size="large" maxlength="11" clearable>
          <template #prepend>
            <el-icon><Iphone /></el-icon>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="16">
        <el-input v-model="dialog.code" placeholder="输入短信验证码"
                  size="large" maxlength="6" clearable>
          <template #prepend>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-col>
      <el-col :span="8">
        <el-button size="large" class="receive-btn" type="primary" plain
                   @click="sendSmsCode" :disabled="dialog.disabled">
          {{ dialog.btnContent }}
        </el-button>
      </el-col>
    </el-row>
    <el-button type="primary" class="login-btn" size="large" @click="login">
      登陆系统
    </el-button>
  </el-dialog>
</template>

<script lang="ts" setup>
import router from '../../router/index';
import { reactive, ref, getCurrentInstance, onMounted } from 'vue';
import { isMobile, isBlank, isSmsCode } from '../../utils/validate';
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

const dialog = reactive({
  visible: false,
  tel: null,
  code: null,
  disabled: false,
  btnContent: '获取短信验证码',
  num: 0,
  status: 'logout'
});

const dataRule = reactive({
  tel: [{ required: true, pattern: '^1[1-9]\d{9}$', message: '手机号码错误' }]
});

function showDialog() {
  dialog.visible = true;
}

//发送短信回调函数
function sendSmsCode() {
  //先判断tel是否输入
  if (isBlank(dialog.tel)) {
    proxy.$message({
      message: '请填写手机号码',
      type: 'error',
      duration: 1200
    });
  } else if (!isMobile(dialog.tel)) {//验证手机号格式
    proxy.$message({
      message: '手机号码错误',
      type: 'error',
      duration: 1200
    });
  }else{
    let json={
      tel:dialog.tel
    };
    console.log(json);
    proxy.$http('/front/customer/sendSmsCode', 'POST', json, true, function (resp) {
      if (resp.result) {
        proxy.$message({
          message: '短信验证码已发送',
          type: 'success',
          duration: 1200
        });
        dialog.num = 0;
        dialog.disabled = true;
        //禁用两分钟
        let timer = setInterval(function () {
          dialog.num++;
          dialog.btnContent = `重新获取(${120 - dialog.num})`;
          if (dialog.num == 120) {
            clearInterval(timer);
            dialog.disabled = false;
            dialog.btnContent = '获取短信验证码';
          }
        }, 1000);
      }
    });
  }

}


//弹窗登录login
function login(){
  if (isBlank(dialog.tel)) {
    proxy.$message({
      message: '请填写手机号码',
      type: 'error',
      duration: 1200
    });
  } else if (!isMobile(dialog.tel)) {
    proxy.$message({
      message: '手机号码错误',
      type: 'error',
      duration: 1200
    });
  } else if (isBlank(dialog.code)) {
    proxy.$message({
      message: '请填写短信验证码',
      type: 'error',
      duration: 1200
    });
  } else if (!isSmsCode(dialog.code)) {
    proxy.$message({
      message: '短信验证码错误',
      type: 'error',
      duration: 1200
    });
  }

  //发送请求
  let json = {
    tel: dialog.tel,
    code: dialog.code
  };
  proxy.$http('/front/customer/login', 'POST', json, true, function (resp) {
    let result = resp.result;

    if (result) {
      proxy.$message({
        message: resp.msg,
        type: 'success',
        duration: 1200
      });
      dialog.tel = null;
      dialog.code = null;
      dialog.visible = false;
      dialog.status = 'login';
      //提取保存令牌
      let token = resp.token;
      localStorage.setItem('token', token);
    } else {
      proxy.$message({
        message: resp.msg,
        type: 'error',
        duration: 1200
      });
    }
  });
}

function logout() {
  proxy.$http('/front/customer/logout', 'GET', null, true, function (resp) {
    // 销毁令牌
    localStorage.removeItem('token');
    dialog.status = 'logout';
    router.push({ name: 'FrontIndex' });
    proxy.$message({
      message: '已经退出系统',
      type: 'success',
      duration: 1200
    });
  });
}

let token = localStorage.getItem('token');
if (token != null) {
  //检查重新登陆
  proxy.$http('/front/customer/checkLogin', 'GET', null, true, function (resp) {
    if (resp.result) {
      dialog.status = 'login';
    } else {
      dialog.status = 'logout';
    }
  });
}

function toindex(){
  console.log("跳转")
  router.push('/front/index');
}

let keyword = router.currentRoute.value.query.keyword;
header.keyword = keyword;

function searchGoods() {
  console.log(header.keyword)
  router.push(
      {
        name: 'FrontGoodsList',
        query: { keyword: header.keyword, random: new Date().getTime() }
      }
  );
}

function tagHandle(label : string) {
  header.keyword = label;
}

</script>

<style lang="less" scoped>
@import url('main.less');
</style>
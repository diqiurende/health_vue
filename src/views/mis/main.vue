<template>

  <div class="site-wrapper"
       :class="{ 'site-sidebar--fold': sidebar.sidebarFold }"
       v-loading.fullscreen.lock="loading" element-loading-text="拼命加载中">
    <nav class="site-navbar"
         :class="{ 'site-navbar--fold': sidebar.sidebarFold }">
      <div class="site-navbar__header" @click="router.push({name:'FrontIndex'})">
        <h1 class="site-navbar__brand">
          <a class="site-navbar__brand-lg">华夏健康卫士</a>
          <a class="site-navbar__brand-mini">体检</a>
        </h1>
      </div>
      <div class="navbar-container"
           :class="{'navbar-container--fold': sidebar.sidebarFold}">
        <div class="switch" @click="handleSwitch">
          <SvgIcon name="zhedie" class="icon-svg" />
        </div>
        <div class="right-container">
          <el-dropdown>
                    <span class="el-dropdown-link">
                        <span class="avatar-container">
                            <el-avatar shape="circle" :size="25"
                                       :src="user.photo"
                                       :icon="UserFilled"></el-avatar>
                        </span>
                        {{ user.name }}
                    </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                    @click="updatePassword()">修改密码</el-dropdown-item>
                <el-dropdown-item
                    @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>


    <aside class="site-sidebar site-sidebar--dark">
      <div class="site-sidebar__inner">
        <el-menu :default-active="siteContent.menuActiveName || 'Home'"
                 :collapse="sidebar.sidebarFold" :collapseTransition="false"
                 class="site-sidebar__menu" background-color="#263238"
                 active-text-color="#fff" text-color="#8a979e">
          <el-menu-item index="Home"
                        @click="$router.push({ name: 'MisHome' })">
            <el-icon>
              <SvgIcon name="home" class="icon-svg" />
            </el-icon>
            <span slot="title">首页</span>
          </el-menu-item>
          <el-sub-menu index="组织管理"
                       :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
            <template #title>
              <el-icon>
                <SvgIcon name="users_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">组织管理</span>
            </template>
            <el-menu-item index="MisDept"
                          @click="$router.push({ name: 'MisDept' })">
              <el-icon>
                <SvgIcon name="company_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">部门管理</span>
            </el-menu-item>
            <el-menu-item index="MisRole"

                          @click="$router.push({ name: 'MisRole' })">
              <el-icon>
                <SvgIcon name="role_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">角色管理</span>
            </el-menu-item>
            <el-menu-item index="MisUser"

                          @click="$router.push({ name: 'MisUser' })">
              <el-icon>
                <SvgIcon name="user_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">用户管理</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="业务管理"
                       :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
            <template #title>
              <el-icon>
                <SvgIcon name="trust_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">业务管理</span>
            </template>
            <el-menu-item index="MisGoods"

                          @click="$router.push({ name: 'MisGoods' })">
              <el-icon>
                <SvgIcon name="goods_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">体检套餐</span>
            </el-menu-item>
            <el-menu-item index="MisRule"
                          v-if="proxy.isAuth(['ROOT', 'RULE:SELECT'])"
                          @click="$router.push({ name: 'MisRule' })">
              <el-icon>
                <SvgIcon name="rule_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">促销规则</span>
            </el-menu-item>
<!--            <el-menu-item index="MisCustomer"-->
<!--                          v-if="proxy.isAuth(['ROOT', 'CUSTOMER:SELECT'])"-->
<!--                          @click="$router.push({ name: 'MisCustomer' })">-->
<!--              <el-icon>-->
<!--                <SvgIcon name="customer_fill"-->
<!--                         class="icon-svg" />-->
<!--              </el-icon>-->
<!--              <span slot="title">客户档案</span>-->
<!--            </el-menu-item>-->
            <el-menu-item index="MisOrder"
                          v-if="proxy.isAuth(['ROOT', 'ORDER:SELECT'])"
                          @click="$router.push({ name: 'MisOrder' })">
              <el-icon>
                <SvgIcon name="order_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">订单管理</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="体检管理"
                       :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
            <template #title>
              <el-icon>
                <SvgIcon name="night_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">体检管理</span>
            </template>
            <el-menu-item index="MisAppointment"
                          v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])"
                          @click="$router.push({ name: 'MisAppointment' })">
              <el-icon>
                <SvgIcon name="appointment_fill"
                         class="icon-svg" />
              </el-icon>
              <span slot="title">体检预约</span>
            </el-menu-item>
            <el-menu-item index="MisCustomerCheckin"
                          v-if="proxy.isAuth(['ROOT', 'CUSTOMER_CHICKIN:SELECT'])"
                          @click="$router.push({ name: 'MisCustomerCheckin' })">
              <el-icon>
                <SvgIcon name="checkin_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">体检签到</span>
            </el-menu-item>
            <el-menu-item index="MisDoctorCheckup"
                          v-if="proxy.isAuth(['ROOT', 'CHECKUP:SELECT'])"
                          @click="$router.push({ name: 'MisDoctorCheckup' })">
              <el-icon>
                <SvgIcon name="doctor_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">医生检查</span>
            </el-menu-item>
            <el-menu-item index="MisCheckupReport"
                          v-if="proxy.isAuth(['ROOT', 'CHECKUP_REPORT:SELECT'])"
                          @click="$router.push({ name: 'MisCheckupReport' })">
              <el-icon>
                <SvgIcon name="file_fill" class="icon-svg" />
              </el-icon>
              <span slot="title">体检报告</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </aside>

    <div class="site-content__wrapper">
      <main class="site-content"
            :class="{ 'site-content--tabs': $route.meta.isTab }">
        <el-tabs v-if="$route.meta.isTab"
                 v-model="siteContent.mainTabsActiveName" :closable="true"
                 @tab-click="selectedTabHandle"
                 @tab-remove="removeTabHandle">

          <el-tab-pane v-for="item in siteContent.mainTabs"
                       :label="item.title" :name="item.name">
            <el-card :body-style="siteContent.siteContentViewHeight" style="max-width: 84%; ">
              <router-view :key="router.currentRoute.value.query.random" />
            </el-card>
          </el-tab-pane>
        </el-tabs>
        <el-card v-else :body-style="siteContent.siteContentViewHeight">
          <router-view :key="router.currentRoute.value.query.random" />
        </el-card>
      </main>
    </div>



  </div>
  <el-dialog
      title="提示"
      v-model="dialog.visible"
      width="20%">
  <el-form ref="dialogForm" :model="dialog.dataForm" :rules="dialog.dataRule" label-width="80px">
    <el-form-item label="原密码" prop="password">
      <el-input v-model="dialog.dataForm.password" type="password" maxlength="20" size="medium" clearable>
      </el-input>
    </el-form-item>

    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="dialog.dataForm.newPassword" type="password" maxlength="20" size="medium" clearable>
      </el-input>
    </el-form-item>

    <el-form-item label="确认密码" prop="ConfirmPassword">
      <el-input v-model="dialog.dataForm.ConfirmPassword" type="password" maxlength="20" size="medium" clearable>
      </el-input>
    </el-form-item>



  </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="medium" @click="dialog.visible=false">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit">确认 </el-button>
      </span>
    </template>

  </el-dialog>

</template>

<script lang="ts" setup>
import SvgIcon from '../../components/SvgIcon.vue';
import { UserFilled } from '@element-plus/icons-vue';
import { isURL } from '../../utils/validate';
import { ref, reactive, provide, getCurrentInstance, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Component, Vue, Watch } from 'vue-property-decorator';

//用于获取路由参数
const route = useRoute();
//用于切换路由引用的页面
const router = useRouter();
const { proxy } = getCurrentInstance();

//左边栏常量
const sidebar = reactive({
  //是否折叠左边栏
  sidebarFold: false,
  sidebarLayoutSkin: 'dark'
});

//内容区相关常量
const siteContent = reactive({
  documentClientHeight: 0,
  siteContentViewHeight: {},
  height: null,
  mainTabs: [],
  mainTabsActiveName: '',
  menuActiveName: ''
});

//用户信息常量
const user = reactive({
  name: '',
  photo: '',
  //是否显示修改登陆密码的弹窗
  updatePasswordVisible: false
});


const validateConfirmPassword = (rule, value, callback) => {
  if (value != dialog.dataForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const dialog=reactive({
  visible: false,
  dataForm: {
    password: '',
    newPassword: '',
    ConfirmPassword: '',
  },
  dataRule: {
    password: [{ required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误' }],
    newPassword: [{ required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误' }],
    ConfirmPassword: [
      { required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误' },
      { validator: validateConfirmPassword, trigger: 'blur' }//blur失去焦点时触发验证
    ]
  }
});

function updatePassword() {
  dialog.visible = true;
  //清空上一次的验证结果
  proxy.$nextTick(function(){//确保在下一次 DOM 更新后再执行回调函数，避免因为同步更新导致的数据不一致。
    proxy.$refs['dialogForm'].resetFields();//重置名为 dialogForm 的表单组件
  })
}

function dataFormSubmit(){
  proxy.$refs.dialogForm.validate(valid => {
    console.log(valid);
    if (valid) {
      //构建josn
      let json={
        password: dialog.dataForm.password,
        newPassword: dialog.dataForm.newPassword,
      };
       proxy.$http('/mis/user/updatePassword', 'POST', json,true,function (resp){
         console.log(resp);
         if(resp.rows==1){//返回行数为1则修改成功
           proxy.$message({
             message:"密码修改成功",
             type:"success",
             duration: 2000,
             onClose: () => {
               dialog.visible = false;
             }
           })
         }
         else {
           proxy.$message({
             message:"密码修改失败",
             type:"error",
             duration: 2000
           })
         }
       })

    }


  })
}




function routeHandle(route) {
  //每次切换页面，重新计算页面高度和内容区高度
  resetDocumentClientHeight();
  loadSiteContentViewHeight();

  //判断是否要创建Tab控件
  if (route.meta.isTab) {
    /* 创建Tab控件之前，先判断mainTabs[]数组中是否存在该Vue页面的Tab控件。
     * 比如要访问角色管理页面，程序先要判断是否存在角色管理页面的Tab控件。
     * 如果不存在就创建Tab控件；如果存在就不创建新的Tab控件，直接切换到现有的Tab控件
     */
    let tab = siteContent.mainTabs.filter(item => item.name === route.name)[0];
    if (tab == null) {
      tab = {
        title: route.meta.title,
        name: route.name
      };
      siteContent.mainTabs.push(tab);
    }
    //选中某个Tab控件
    siteContent.mainTabsActiveName = tab.name;
    //选中某个菜单项
    siteContent.menuActiveName = tab.name;
  }
  else {
    siteContent.mainTabs = []
    //取消选中某个Tab控件
    siteContent.mainTabsActiveName = "";
    //选中某个菜单项
    siteContent.menuActiveName = "Home";
  }
}

/*
 * 载入框架页面就立即执行routeHandle()函数，把当前路由加载页面对应的Tab控件选中
 * 例如直接访问http://localhost:7600/mis/role页面，需要让框架页面创建Tab控件，并且选中该Tab
 */
routeHandle(route)

/*
 * 框架页面的路由标签每次切换引用的页面，就调用routeHandle()，
 * 判断一下是创建新的Tab控件，还是切换到现有的Tab控件
 */
watch(
    () => router,
    () => {
      routeHandle(route);
    },
    { immediate: true, deep: true }
);

//计算网页可见区域的高度
function resetDocumentClientHeight() {
  //获取网页可见区域的高度
  siteContent.documentClientHeight = document.documentElement.clientHeight;
}

//计算内容区卡片控件高度
function loadSiteContentViewHeight() {
  //卡片控件高度 = 网页可见区域高度 - 导航区高度 - 卡片控件上下外填充 - 上下边框
  let height = siteContent.documentClientHeight - 50 - 30 - 2;
  if (route.meta.isTab) {
    //如果引用的Vue页面需要Tab控件，卡片控件高度还要减去40
    height -= 40;
  }
  //保存卡片控件高度
  siteContent.height = height
  //声明CSS样式
  siteContent.siteContentViewHeight = { minHeight: height + 'px' };
}

//浏览器尺寸发生变化的回调函数
window.onresize = () => {
  //更新保存的网页可见区域高度
  siteContent.documentClientHeight = document.documentElement.clientHeight;
  //重新计算内容区的高度
  loadSiteContentViewHeight();
};


//切换tab函数
 function selectedTabHandle(tab){
   router.push(
       {
         name:tab.paneName
       }

   )

 }

function removeTabHandle(tabName) {
  //让mainTabs数组剔除要关闭的Tab
  siteContent.mainTabs = siteContent.mainTabs.filter(item => item.name !== tabName);
  //如果还存在剩余的Tab，就切换到最后的Tab上面
  if (siteContent.mainTabs.length >= 1) {
    //获取mainTabs数组最后一个元素
    let tab = siteContent.mainTabs[siteContent.mainTabs.length - 1];
    //选中这个Tab控件
    siteContent.mainTabsActiveName = tab.name;
    //内容区切换引用的页面
    router.push({ name: tab.name });
  } else {
    siteContent.mainTabsActiveName = '';
    router.push({ name: 'MisHome' });
  }
}
function handleSwitch() {
  sidebar.sidebarFold = !sidebar.sidebarFold;
}

function  logout(){
   proxy.$http("/mis/user/logout","GET",null,true,function (resp){
     //清空浏览器缓存的token以及权限列表
     localStorage.removeItem('token');
     localStorage.removeItem('permissions');
     router.push({ name: 'MisLogin' });
   })
}



</script>

<style lang="scss">
//@import '../../assets/scss/index.scss';
@use '../../assets/scss/index.scss';
.avatar-container {
  vertical-align: -8px;
  margin-right: 5px;
}
</style>
<script lang="ts" setup>
import { reactive, ref, Ref, getCurrentInstance} from 'vue';
import router from '../../router/index';
import SvgIcon from '../../components/SvgIcon.vue';
const { proxy } = getCurrentInstance();

let radio = ref(null);




const data = reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 12,
  totalCount: 0,
  isLast: false
});

//滚动到页面的顶部
window.scrollTo(0, 0);

//销量图标
const priceOrder = reactive({
  icon: 'sort-default',
  type: 'default'
});

const dataForm = reactive({
  keyword: null,
  type: null,
  sex: null,
  priceType: null,
  orderType: null
});


let keyword = router.currentRoute.value.query.keyword;
if (keyword == '' || keyword == null) {
  dataForm.keyword = null;
} else {
  dataForm.keyword = keyword;
}

const condition = reactive({
  type: [
    { name: '不限', active: true },
    { name: '父母体检', active: false },
    { name: '入职体检', active: false },
    { name: '职场白领', active: false },
    { name: '个人高端', active: false },
    { name: '中青年体检', active: false }
  ],
  sex: [
    { name: '不限', active: true },
    { name: '男性', active: false },
    { name: '女性', active: false }
  ],
  priceType: [
    { name: '不限', active: true },
    { name: '0~100', value: 1, active: false },
    { name: '100~500', value: 2, active: false },
    { name: '500~1000', value: 3, active: false },
    { name: '1000以上', value: 4, active: false }
  ]
});


function loadDataList() {
  // 判断是否已经加载到最后一页（避免重复加载）
  if (data.isLast) {
    return;
  }

  // 构造请求参数 JSON，用于分页查询商品列表
  let json = {
    keyword: dataForm.keyword,       // 商品名称关键字
    type: dataForm.type,             // 商品类型（如：父母体检、白领体检等）
    sex: dataForm.sex,               // 性别过滤（如：男、女）
    priceType: dataForm.priceType,   // 价格筛选（价格区间）
    orderType: dataForm.orderType,   // 排序方式
    page: data.pageIndex,            // 当前页码
    length: data.pageSize            // 每页记录数
  };

  // 发送 POST 请求，查询分页商品数据
  proxy.$http('/front/goods/searchListByPage', 'POST', json, true, function (resp) {
    let page = resp.page;

    // 获取当前页的商品数据列表
    let list = page.list;

    // 判断是否查询结果为空
    if (list == null || list.length == 0) {
      // 若无更多数据，标记为最后一页
      data.isLast = true;
      // 回退页码，避免误加页数
      data.pageIndex--;
    } else {
      // 遍历商品列表，拼接每个商品的完整图片 URL
      for (let one of list) {
        one.image = `${proxy.$minioUrl}/${one.image}`; // 加上 MinIO 文件地址前缀
      }

      // 将当前页的数据追加到已有商品列表中，实现无限滚动或“加载更多”的效果
      data.dataList = data.dataList.concat(list);

      // 更新总记录数（可用于显示分页信息）
      data.totalCount = page.totalCount;
    }
  });
}
loadDataList()

function load() {
  //如果已经是尾页了，就不再翻页
  if (data.isLast) {
    return
  }
  //页数加1
  data.pageIndex++;
  //加载下一页数据
  loadDataList();
}

function selectPrice() {
  // 重置价格筛选的单选按钮（清空）
  radio = ref(null);

  // 判断当前价格排序状态，默认是未排序（default），下一步设置为升序
  if (priceOrder.type == 'default') {
    priceOrder.icon = 'sort-asc';   // 设置图标为升序箭头
    priceOrder.type = 'asc';        // 设置排序类型为升序
    dataForm.orderType = 3;         // 设置请求参数中排序方式为“按价格升序”

    // 当前是升序状态，再点击则切换为降序
  } else if (priceOrder.type == 'asc') {
    priceOrder.icon = 'sort-desc';  // 设置图标为降序箭头
    priceOrder.type = 'desc';       // 设置排序类型为降序
    dataForm.orderType = 4;         // 设置请求参数中排序方式为“按价格降序”

    // 当前是降序状态，再点击则切换回升序
  } else if (priceOrder.type == 'desc') {
    priceOrder.icon = 'sort-asc';   // 切换图标回升序箭头
    priceOrder.type = 'asc';        // 设置排序类型为升序
    dataForm.orderType = 3;         // 设置请求参数为价格升序
  }

  // 清空商品数据列表，重新加载第一页
  data.dataList = [];
  data.isLast = false;     // 重置“是否最后一页”的标志
  data.pageIndex = 1;      // 从第一页重新加载
  data.totalCount = 0;     // 清空总数量

  // 调用加载函数重新发起接口请求，加载最新排序的数据
  loadDataList();
}

//选择排序类别函数
function selectRadio(){
  priceOrder.icon = 'sort-default';
  priceOrder.type = 'default';
  if (value == '最新') {
    dataForm.orderType = 1;
  } else if (value == '销量') {
    dataForm.orderType = 2;
  }
  data.dataList = []
  data.isLast = false
  data.pageIndex = 1
  data.totalCount = 0

  //重新加载
  loadDataList();

}


//点击条件选择函数
function selectHandle(key, name) {
  condition[key].forEach(function (one) {
    if (one.name == name) {
      one.active = true;
      if (key != 'priceType') {
        //dateForm里的分类或者性别属性赋值为name
        dataForm[key] = (one.name == '不限' ? null : one.name);
      } else {
        //价格区间赋值为value
        dataForm[key] = (one.name == '不限' ? null : one.value);
      }
    } else {
      one.active = false;
    }
  });
  data.dataList = []
  data.pageIndex = 1
  data.totalCount = 0
  data.isLast = false
  loadDataList();
}


</script>

<template>
  <div class="page-wrapper">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ name: 'FrontIndex' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>体检套餐列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="search-rows">
      <el-row gutter="0" class="row">
        <el-col :span="2"><span class="label">【 性别 】</span></el-col>
        <el-col :span="2" v-for="one in condition.sex">
            <span :class="one.active ? 'item active' : 'item'"
                  @click="selectHandle('sex', one.name)">
                {{ one.name }}
            </span>
        </el-col>
      </el-row>
      <el-row gutter="0" class="row">
        <el-col :span="2"><span class="label">【 分类 】</span></el-col>
        <el-col :span="2" v-for="one in condition.type">
            <span :class="one.active ? 'item active' : 'item'"
                  @click="selectHandle('type', one.name)">
                {{ one.name }}
            </span>
        </el-col>
      </el-row>
      <el-row gutter="0" class="row">
        <el-col :span="2"><span class="label">【 价格 】</span></el-col>
        <el-col :span="2" v-for="one in condition.priceType">
            <span :class="one.active ? 'item active' : 'item'"
                  @click="selectHandle('priceType', one.name)">
                {{ one.name }}
            </span>
        </el-col>
      </el-row>
    </div>
    <div class="search-filter">
      <el-radio-group v-model="radio" @change="selectRadio">
        <el-radio label="最新" size="large">最新</el-radio>
        <el-radio label="销量" size="large">销量</el-radio>
      </el-radio-group>
      <div class="sort-operate" @click="selectPrice">
        <span>价格</span>
        <SvgIcon :name="priceOrder.icon" class="sort-icon" />
      </div>
    </div>
    <div class="goods-container">
      <el-empty description="无体检套餐" image-size="200"
                v-if="data.dataList.length==0"/>
      <ul class="goods-list" v-infinite-scroll="load">
        <li class="item" v-for="(one, index) in data.dataList"
            :style="(index + 1) % 4 == 0 ? 'margin-right:0' : ''">
          <div class="card">
            <img :src="one.image" />
            <h4>{{ one.title }}</h4>
            <el-tooltip class="box-item" effect="dark" placement="top">
              <template #content>
                <div style="width: 260px;">{{ one.description }}
                </div>
              </template>
              <p class="desc">
                <span>折</span>
                {{ one.description }}
              </p>
            </el-tooltip>
            <p class="price">
              <span class="current">￥{{ one.currentPrice }}</span>
              <span class="old">￥{{ one.initialPrice }}</span>
              <span class="sale">已售{{ one.salesVolume }}</span>
            </p>
            <input type="button" class="buy-btn" value="立即购买"
                   @click="buyHandle(one.id)" />
          </div>
        </li>
      </ul>
    </div>
  </div>

</template>

<style lang="less" scoped>
@import url('goods_list.less');
</style>
<template>
<!--  <div>-->
<!--    index-->
<!--    <h3>{{ msg }}</h3>-->
<!--    <p><el-button type="primary" @click="changeMsg">Primary</el-button></p>-->
<!--    &lt;!&ndash;使用自定义标签引用icon-assurance_fill.svg文件&ndash;&gt;-->
<!--    <p><SvgIcon name="assurance_fill" class="icon-svg" /></p>-->
<!--  </div>-->
</template>

<script lang="ts" setup>
import { ref, Ref } from 'vue';
//引用自定义标签文件（此处为新增）
import SvgIcon from '../../components/SvgIcon.vue';

let msg: Ref<string> = ref('HelloWorld');

const changeMsg = () => {
  msg.value = '你好世界';
};
</script>

<style></style>
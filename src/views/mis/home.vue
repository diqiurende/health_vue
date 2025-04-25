<template>
  <div class="home-container">
    <div class="intro-section">
      <h1 class="headline">华夏健康卫士</h1>
      <p class="tagline">数字驱动的体检新时代</p>
      <ul class="features">
        <li>
          <div class="icon-circle">A</div>
          <div class="text-block">
            <h3>智能化服务</h3>
            <p>依托大数据与AI，打造个性化健康体检流程。</p>
          </div>
        </li>
        <li>
          <div class="icon-circle">B</div>
          <div class="text-block">
            <h3>专业医生团队</h3>
            <p>全国顶级医学专家组成，为每位用户保驾护航。</p>
          </div>
        </li>
        <li>
          <div class="icon-circle">C</div>
          <div class="text-block">
            <h3>便捷预约体验</h3>
            <p>一键下单预约，线上查看体检报告，方便快捷。</p>
          </div>
        </li>
      </ul>
    </div>
    <div class="image-section">
      <img src="../../assets/home/banner.png" class="banner" />
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 80px;
  background: linear-gradient(to right, #f5f9ff, #e7efff);
  font-family: "Segoe UI", sans-serif;
}

.intro-section {
  flex: 1;
  padding-right: 40px;
}

.headline {
  font-size: 36px;
  color: #1e2a38;
  margin-bottom: 10px;
}

.tagline {
  font-size: 20px;
  color: #4f5c70;
  margin-bottom: 30px;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.icon-circle {
  width: 36px;
  height: 36px;
  background-color: #4f89ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
}

.text-block h3 {
  font-size: 18px;
  color: #1e2a38;
  margin: 0 0 6px;
}

.text-block p {
  margin: 0;
  color: #6a7685;
}

.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.image-section img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
</style>
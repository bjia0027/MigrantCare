<template>
  <div class="health-info">
    <div class="container mt-4">
      <!-- Header Section -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="page-header text-center">
            <h1 class="display-4 text-primary mb-3">
              <i class="fas fa-heartbeat me-3"></i>
              健康信息中心
            </h1>
            <p class="lead text-muted">为移民朋友提供全面的健康信息和医疗指导</p>
          </div>
        </div>
      </div>

      <!-- Quick Access Cards -->
      <div class="row mb-5">
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="info-card h-100">
            <div class="card-icon">
              <i class="fas fa-syringe text-success"></i>
            </div>
            <h5>疫苗接种</h5>
            <p>了解必要的疫苗接种要求和时间安排</p>
            <a href="#vaccines" class="btn btn-outline-success btn-sm">查看详情</a>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="info-card h-100">
            <div class="card-icon">
              <i class="fas fa-user-md text-primary"></i>
            </div>
            <h5>体检指南</h5>
            <p>移民体检要求和注意事项详细说明</p>
            <a href="#medical-exam" class="btn btn-outline-primary btn-sm">查看详情</a>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="info-card h-100">
            <div class="card-icon">
              <i class="fas fa-pills text-warning"></i>
            </div>
            <h5>常用药品</h5>
            <p>在澳洲常见病症的用药指导和购买建议</p>
            <a href="#medications" class="btn btn-outline-warning btn-sm">查看详情</a>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="info-card h-100">
            <div class="card-icon">
              <i class="fas fa-phone-alt text-danger"></i>
            </div>
            <h5>紧急求助</h5>
            <p>紧急情况下的求助电话和处理流程</p>
            <a href="#emergency" class="btn btn-outline-danger btn-sm">查看详情</a>
          </div>
        </div>
      </div>

      <!-- Detailed Information Sections -->
      <div class="row">
        <div class="col-12">
          <!-- Vaccines Section -->
          <section id="vaccines" class="info-section mb-5">
            <h2 class="section-title">
              <i class="fas fa-syringe me-2"></i>
              疫苗接种信息
            </h2>
            <div class="content-card">
              <div class="row">
                <div class="col-md-6">
                  <h4>必需疫苗</h4>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                      <strong>COVID-19疫苗</strong> - 根据最新政策要求
                    </li>
                    <li class="list-group-item"><strong>流感疫苗</strong> - 每年接种一次</li>
                    <li class="list-group-item"><strong>MMR疫苗</strong> - 麻疹、腮腺炎、风疹</li>
                    <li class="list-group-item"><strong>DPT疫苗</strong> - 白喉、百日咳、破伤风</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h4>接种时间表</h4>
                  <div class="alert alert-info">
                    <h6>重要提醒</h6>
                    <p>建议在到达澳洲前完成基础疫苗接种，某些疫苗需要间隔时间接种。</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Medical Exam Section -->
          <section id="medical-exam" class="info-section mb-5">
            <h2 class="section-title">
              <i class="fas fa-user-md me-2"></i>
              移民体检指南
            </h2>
            <div class="content-card">
              <div class="row">
                <div class="col-md-8">
                  <h4>体检项目</h4>
                  <div class="exam-items">
                    <div class="exam-item">
                      <h6><i class="fas fa-check text-success me-2"></i>身体检查</h6>
                      <p>包括身高、体重、血压、心率等基本指标</p>
                    </div>
                    <div class="exam-item">
                      <h6><i class="fas fa-check text-success me-2"></i>胸部X光</h6>
                      <p>检查肺部健康状况，排除传染性疾病</p>
                    </div>
                    <div class="exam-item">
                      <h6><i class="fas fa-check text-success me-2"></i>血液检查</h6>
                      <p>HIV、梅毒、乙肝等传染病检查</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="alert alert-warning">
                    <h6>注意事项</h6>
                    <ul class="mb-0">
                      <li>体检前保持良好状态</li>
                      <li>携带所有必要文件</li>
                      <li>体检结果有效期为一年</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Emergency Section -->
          <section id="emergency" class="info-section mb-5">
            <h2 class="section-title">
              <i class="fas fa-phone-alt me-2"></i>
              紧急联系方式
            </h2>
            <div class="content-card">
              <div class="row">
                <div class="col-md-6">
                  <div class="emergency-card">
                    <h4 class="text-danger">紧急电话</h4>
                    <div class="emergency-number">
                      <i class="fas fa-phone text-danger me-2"></i>
                      <span class="number">000</span>
                      <span class="description">警察、消防、救护车</span>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="emergency-card">
                    <h4 class="text-primary">医疗热线</h4>
                    <div class="emergency-number">
                      <i class="fas fa-phone text-primary me-2"></i>
                      <span class="number">13 HEALTH</span>
                      <span class="description">24小时健康咨询</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// You can add reactive data here if needed for dynamic content
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid #e9ecef;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.section-title {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

.content-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.exam-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.emergency-card {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 1rem;
  height: 100%;
}

.emergency-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.description {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .info-card {
    margin-bottom: 1rem;
  }

  .content-card {
    padding: 1rem;
  }
}
</style>

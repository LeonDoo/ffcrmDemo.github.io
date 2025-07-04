// 飞书应用配置文件
// 请根据你的飞书应用信息修改以下配置

const FEISHU_CONFIG = {
    // 飞书应用 App ID (必填)
    // 在飞书开放平台 -> 应用详情 -> 凭证与基础信息 中获取
    APP_ID: 'cli_a8ed266753be901c',
    
    // 飞书应用 App Secret (仅开发环境，生产环境应在后端处理)
    // 在飞书开放平台 -> 应用详情 -> 凭证与基础信息 中获取
    APP_SECRET: 'UsUeDrTo6eG80WRxYgFSbfvEGQ4LfLFc',
    
    // 是否启用调试模式
    DEBUG: true,
    
    // 飞书开放平台API基础URL
    API_BASE_URL: 'https://open.feishu.cn/open-apis',
    
    // 超时设置 (毫秒)
    TIMEOUT: 10000,
    
    // 重试次数
    RETRY_COUNT: 3,
    
    // 模拟用户数据 (开发环境使用)
    MOCK_USER_DATA: {
        name: '张三',
        email: 'zhangsan@company.com',
        user_id: 'mock_user_001',
        department: '技术部',
        job_title: '前端工程师',
        avatar_url: 'https://via.placeholder.com/120x120/667eea/white?text=张三'
    }
};

// 环境检测
const isProduction = () => {
    return window.location.protocol === 'https:' && 
           !window.location.hostname.includes('localhost') && 
           !window.location.hostname.includes('127.0.0.1');
};

// 配置验证
const validateConfig = () => {
    if (!FEISHU_CONFIG.APP_ID) {
        console.warn('⚠️ 警告: 未配置 APP_ID，请在 config.js 中设置');
        return false;
    }
    
    if (isProduction() && !FEISHU_CONFIG.APP_SECRET) {
        console.warn('⚠️ 警告: 生产环境建议在后端处理 APP_SECRET');
    }
    
    return true;
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 环境
    module.exports = {
        FEISHU_CONFIG,
        isProduction,
        validateConfig
    };
} else {
    // 浏览器环境
    window.FEISHU_CONFIG = FEISHU_CONFIG;
    window.isProduction = isProduction;
    window.validateConfig = validateConfig;
} 
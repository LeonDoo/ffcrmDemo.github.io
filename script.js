// 飞书应用免登陆实现
class FeishuSSO {
    constructor() {
        // 从配置文件加载设置
        this.config = window.FEISHU_CONFIG || {};
        this.appId = this.config.APP_ID || '';
        this.appSecret = this.config.APP_SECRET || '';
        this.debug = this.config.DEBUG !== false;
        this.timeout = this.config.TIMEOUT || 10000;
        this.retryCount = this.config.RETRY_COUNT || 3;
        this.apiBaseUrl = this.config.API_BASE_URL || 'https://open.feishu.cn/open-apis';
        
        // 验证配置
        if (window.validateConfig) {
            window.validateConfig();
        }
        
        this.init();
    }

    // 初始化
    async init() {
        this.log('开始初始化飞书免登陆...');
        
        try {
            // 检查是否在飞书环境中
            if (!this.isFeishuEnvironment()) {
                throw new Error('当前不在飞书应用环境中');
            }

            // 等待飞书JS SDK加载完成
            await this.waitForFeishuSDK();
            
            // 获取用户信息
            await this.getUserInfo();
            
        } catch (error) {
            this.handleError(error);
        }
    }

    // 检查是否在飞书环境中
    isFeishuEnvironment() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('lark') || 
               userAgent.includes('feishu') || 
               window.h5sdk || 
               window.tt;
    }

    // 等待飞书JS SDK加载完成
    waitForFeishuSDK() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkSDK = () => {
                attempts++;
                
                if (window.h5sdk) {
                    this.log('飞书JS SDK加载完成');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('飞书JS SDK加载超时'));
                } else {
                    setTimeout(checkSDK, 100);
                }
            };
            
            checkSDK();
        });
    }

    // 获取用户信息的主流程
    async getUserInfo() {
        this.log('开始获取用户信息...');
        
        try {
            // 方法1: 尝试通过免登陆获取用户信息
            await this.getUserInfoBySSO();
        } catch (error) {
            this.log('免登陆方式失败，尝试其他方式...', error);
            
            try {
                // 方法2: 尝试通过JSBridge获取用户信息
                await this.getUserInfoByJSBridge();
            } catch (error2) {
                this.log('JSBridge方式失败，尝试模拟数据...', error2);
                
                // 方法3: 使用模拟数据（开发环境）
                this.showMockUserInfo();
            }
        }
    }

    // 方法1: 通过免登陆获取用户信息
    async getUserInfoBySSO() {
        this.log('尝试免登陆方式获取用户信息...');
        
        return new Promise((resolve, reject) => {
            // 配置免登陆参数
            const config = {
                appId: this.appId || 'your_app_id', // 需要替换为实际的App ID
                onSuccess: async (res) => {
                    this.log('免登陆成功，获取到登录码:', res);
                    
                    try {
                        // 使用登录码获取用户信息
                        const userInfo = await this.fetchUserInfoWithCode(res.code);
                        this.displayUserInfo(userInfo);
                        resolve(userInfo);
                    } catch (error) {
                        this.log('获取用户信息失败:', error);
                        reject(error);
                    }
                },
                onFail: (error) => {
                    this.log('免登陆失败:', error);
                    reject(error);
                }
            };

            // 调用飞书免登陆接口
            if (window.h5sdk && window.h5sdk.biz && window.h5sdk.biz.util) {
                window.h5sdk.biz.util.getAuthCode(config);
            } else {
                reject(new Error('飞书JS SDK未正确加载'));
            }
        });
    }

    // 方法2: 通过JSBridge获取用户信息
    async getUserInfoByJSBridge() {
        this.log('尝试JSBridge方式获取用户信息...');
        
        return new Promise((resolve, reject) => {
            if (window.tt && window.tt.getUserInfo) {
                window.tt.getUserInfo({
                    success: (userInfo) => {
                        this.log('JSBridge获取用户信息成功:', userInfo);
                        this.displayUserInfo(userInfo);
                        resolve(userInfo);
                    },
                    fail: (error) => {
                        this.log('JSBridge获取用户信息失败:', error);
                        reject(error);
                    }
                });
            } else {
                reject(new Error('JSBridge不可用'));
            }
        });
    }

    // 使用登录码获取用户信息
    async fetchUserInfoWithCode(code) {
        this.log('使用登录码获取用户信息...', code);
        
        // 注意：在生产环境中，这个步骤应该在后端完成
        // 这里提供一个示例实现
        
        try {
            // 步骤1: 使用code换取access_token
            const tokenResponse = await this.getAccessToken(code);
            
            // 步骤2: 使用access_token获取用户信息
            const userInfo = await this.fetchUserProfile(tokenResponse.access_token);
            
            return userInfo;
        } catch (error) {
            this.log('获取用户信息过程中出错:', error);
            throw error;
        }
    }

    // 获取访问令牌（示例实现）
    async getAccessToken(code) {
        // 注意：在生产环境中，app_secret不应该暴露在前端
        // 这个接口应该在后端调用
        const url = `${this.apiBaseUrl}/authen/v1/access_token`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                app_id: this.appId,
                app_secret: this.appSecret
            })
        });

        if (!response.ok) {
            throw new Error(`获取访问令牌失败: ${response.status}`);
        }

        return await response.json();
    }

    // 获取用户信息（示例实现）
    async fetchUserProfile(accessToken) {
        const url = `${this.apiBaseUrl}/authen/v1/user_info`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`获取用户信息失败: ${response.status}`);
        }

        return await response.json();
    }

    // 显示用户信息
    displayUserInfo(userInfo) {
        this.log('显示用户信息:', userInfo);
        
        // 隐藏加载界面
        document.getElementById('loading').style.display = 'none';
        
        // 显示用户信息
        const userInfoSection = document.getElementById('userInfo');
        userInfoSection.style.display = 'block';
        
        // 填充用户信息
        this.fillUserInfo(userInfo);
    }

    // 填充用户信息到页面
    fillUserInfo(userInfo) {
        // 根据不同的数据格式进行适配
        const userData = this.normalizeUserData(userInfo);
        
        document.getElementById('userName').textContent = userData.name || '未知用户';
        document.getElementById('userEmail').textContent = userData.email || '邮箱未提供';
        document.getElementById('userId').textContent = userData.user_id || '未知';
        document.getElementById('userDepartment').textContent = userData.department || '未知部门';
        document.getElementById('userPosition').textContent = userData.job_title || '未知职位';
        
        // 设置头像
        if (userData.avatar_url) {
            document.getElementById('userAvatar').src = userData.avatar_url;
        }
    }

    // 标准化用户数据格式
    normalizeUserData(userInfo) {
        // 适配不同的数据格式
        if (userInfo.data) {
            userInfo = userInfo.data;
        }
        
        return {
            name: userInfo.name || userInfo.nick_name || userInfo.nickname || userInfo.display_name,
            email: userInfo.email || userInfo.work_email,
            user_id: userInfo.user_id || userInfo.open_id || userInfo.union_id,
            department: userInfo.department || userInfo.department_name,
            job_title: userInfo.job_title || userInfo.position,
            avatar_url: userInfo.avatar_url || userInfo.avatar || userInfo.headImgUrl
        };
    }

    // 显示模拟用户信息（开发环境）
    showMockUserInfo() {
        this.log('显示模拟用户信息（开发环境）');
        
        // 使用配置文件中的模拟数据
        const mockUserInfo = this.config.MOCK_USER_DATA || {
            name: '张三',
            email: 'zhangsan@company.com',
            user_id: 'mock_user_001',
            department: '技术部',
            job_title: '前端工程师',
            avatar_url: 'https://via.placeholder.com/120x120/667eea/white?text=张三'
        };
        
        this.displayUserInfo(mockUserInfo);
    }

    // 处理错误
    handleError(error) {
        this.log('发生错误:', error);
        
        // 隐藏加载界面
        document.getElementById('loading').style.display = 'none';
        
        // 显示错误信息
        const errorSection = document.getElementById('errorInfo');
        errorSection.style.display = 'block';
        
        document.getElementById('errorMessage').textContent = error.message || '未知错误';
    }

    // 重试功能
    retry() {
        this.log('用户点击重试');
        
        // 隐藏错误信息
        document.getElementById('errorInfo').style.display = 'none';
        
        // 显示加载界面
        document.getElementById('loading').style.display = 'block';
        
        // 重新初始化
        setTimeout(() => {
            this.init();
        }, 1000);
    }

    // 调试日志
    log(message, data = null) {
        if (this.debug) {
            console.log(`[飞书SSO] ${message}`, data);
            
            // 显示调试信息
            const debugContent = document.getElementById('debugContent');
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
            
            debugContent.textContent += logEntry + '\n\n';
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，初始化飞书免登陆');
    
    // 创建飞书SSO实例
    const feishuSSO = new FeishuSSO();
    
    // 绑定重试按钮事件
    document.getElementById('retryBtn').addEventListener('click', () => {
        feishuSSO.retry();
    });
    
    // 添加一些调试按钮（开发环境）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addDebugButtons(feishuSSO);
    }
});

// 添加调试按钮（开发环境）
function addDebugButtons(feishuSSO) {
    const debugSection = document.getElementById('debugInfo');
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.innerHTML = `
        <button onclick="window.feishuSSO.showMockUserInfo()" style="margin: 5px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            显示模拟数据
        </button>
        <button onclick="window.feishuSSO.handleError(new Error('测试错误'))" style="margin: 5px; padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
            测试错误显示
        </button>
    `;
    
    debugSection.appendChild(buttonContainer);
    
    // 暴露到全局作用域以便调试
    window.feishuSSO = feishuSSO;
} 
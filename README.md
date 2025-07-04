# 飞书应用免登陆示例项目

这是一个HTML+CSS+JS项目，实现了飞书应用的免登陆功能，可以在飞书控制台应用中获取用户信息并展示。

## 项目结构

```
htmldemo/
├── index.html          # 主页面
├── demo.html           # 演示页面（包含功能展示）
├── style.css           # 样式文件
├── script.js           # JavaScript逻辑
├── config.js           # 配置文件
└── README.md           # 说明文档
```

## 功能特性

- ✅ 飞书应用免登陆
- ✅ 自动获取用户信息
- ✅ 美观的用户界面
- ✅ 响应式设计
- ✅ 错误处理和重试机制
- ✅ 调试信息显示
- ✅ 多种获取用户信息的降级方案

## 使用方法

### 1. 配置飞书应用

1. 登录[飞书开放平台](https://open.feishu.cn/)
2. 创建一个网页应用
3. 获取应用的 `App ID` 和 `App Secret`
4. 在应用设置中配置重定向URL和安全域名

### 2. 配置项目

在 `config.js` 文件中，修改以下配置：

```javascript
const FEISHU_CONFIG = {
    // 飞书应用 App ID (必填)
    APP_ID: 'your_app_id_here',
    
    // 飞书应用 App Secret (仅开发环境)
    APP_SECRET: 'your_app_secret_here',
    
    // 其他可选配置...
};
```

⚠️ **安全提醒**: 在生产环境中，`app_secret` 不应该暴露在前端代码中。应该在后端服务器中处理 token 交换。

### 3. 部署项目

1. 将项目文件上传到你的服务器
2. 确保服务器支持HTTPS（飞书要求）
3. 在飞书开放平台配置安全域名

### 4. 在飞书中使用

1. 在飞书控制台中创建应用
2. 配置应用的首页URL为你的项目地址
3. 发布应用供用户使用

## 开发环境测试

### 快速预览

1. **演示页面**: 打开 `demo.html` 查看完整功能展示
2. **主页面**: 打开 `index.html` 查看实际应用页面

### 功能测试

在本地开发时，项目会自动显示模拟数据，你可以：

1. 直接在浏览器中打开相应页面
2. 查看调试信息了解运行状态
3. 使用调试按钮测试不同场景
4. 在演示页面中体验所有功能

## API说明

### 免登陆流程

1. **获取登录码**: 使用飞书JS SDK获取临时登录码
2. **换取令牌**: 使用登录码换取访问令牌
3. **获取用户信息**: 使用访问令牌调用用户信息接口

### 支持的用户信息字段

- 用户姓名 (name)
- 邮箱地址 (email)
- 用户ID (user_id)
- 部门信息 (department)
- 职位信息 (job_title)
- 头像URL (avatar_url)

## 错误处理

项目包含了完善的错误处理机制：

- **环境检测**: 检查是否在飞书应用环境中
- **SDK检测**: 检查飞书JS SDK是否正确加载
- **降级方案**: 提供多种获取用户信息的方式
- **用户友好**: 显示清晰的错误信息和重试选项

## 技术栈

- **前端**: HTML5 + CSS3 + ES6+
- **SDK**: 飞书开放平台 JS SDK
- **样式**: 现代CSS + 响应式设计
- **兼容性**: 支持现代浏览器和飞书客户端

## 注意事项

### 安全相关

1. **HTTPS要求**: 飞书应用必须使用HTTPS协议
2. **域名配置**: 需要在飞书开放平台配置安全域名
3. **密钥保护**: 生产环境中不要在前端暴露App Secret

### 开发相关

1. **调试模式**: 本地开发时自动启用调试模式
2. **模拟数据**: 非飞书环境下显示模拟用户信息
3. **错误日志**: 详细的调试信息便于排查问题

## 生产环境部署

### 后端API实现

为了安全性，建议在后端实现以下接口：

```javascript
// 后端API示例 (Node.js/Express)
app.post('/api/auth/token', async (req, res) => {
    const { code } = req.body;
    
    try {
        // 使用code换取access_token
        const tokenResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                app_id: process.env.FEISHU_APP_ID,
                app_secret: process.env.FEISHU_APP_SECRET
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        // 获取用户信息
        const userResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        
        const userData = await userResponse.json();
        res.json(userData);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### 前端修改

在生产环境中，修改前端代码调用后端API：

```javascript
// 修改 fetchUserInfoWithCode 方法
async fetchUserInfoWithCode(code) {
    const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    
    return await response.json();
}
```

## 常见问题

### Q: 为什么显示"当前不在飞书应用环境中"？
A: 请确保在飞书客户端中打开应用，或者检查User-Agent是否包含飞书标识。

### Q: 免登陆失败怎么办？
A: 请检查App ID配置是否正确，域名是否已在飞书开放平台配置。

### Q: 如何获取更多用户信息？
A: 可以调用飞书开放平台的其他用户信息API，需要相应的权限申请。

## 参考文档

- [飞书开放平台](https://open.feishu.cn/)
- [飞书JS SDK文档](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/h5_js_sdk/h5_js_sdk_overview)
- [免登陆流程](https://open.feishu.cn/document/ukTMukTMukTM/ukzN4UjL5cDO14SO3gTN)

## 许可证

MIT License 
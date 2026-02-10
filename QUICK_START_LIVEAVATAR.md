# 🚀 Quick Start - LiveAvatar Embed

已成功集成 LiveAvatar 嵌入式聊天机器人！以下是快速开始指南。

## ✅ 已完成的工作

1. ✅ 更新了 session 页面使用 LiveAvatar embed
2. ✅ 添加了加载状态和说明
3. ✅ 配置了环境变量
4. ✅ 移除了复杂的 Streaming API 代码
5. ✅ 构建成功，无错误

## 🎯 立即开始使用

### 1. 获取您自己的 Embed ID（可选）

当前使用的是示例 Embed ID。要使用您自己的 avatar：

1. 访问 [LiveAvatar Dashboard](https://app.liveavatar.com/embed)
2. 创建或选择一个 avatar
3. 复制 Embed ID（格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）
4. 更新 `.env.local`:
   ```env
   NEXT_PUBLIC_LIVEAVATAR_EMBED_ID=your-embed-id-here
   ```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 测试功能

1. 打开浏览器访问 `http://localhost:3000`
2. 点击 "Try Demo"
3. 选择场景（例如："Job Interview"）
4. 点击 "Start Practice"
5. 等待 avatar 加载
6. 点击 avatar 窗口中的麦克风按钮开始对话

## 📋 功能说明

### 当前实现
- **LiveAvatar Embed**: 使用 iframe 嵌入式 avatar
- **场景显示**: 顶部显示当前练习场景
- **使用说明**: 底部显示操作指南
- **加载状态**: 显示 avatar 加载进度

### 工作流程
```
用户点击场景 → 进入 session 页面 → LiveAvatar 加载 → 用户通过 avatar 内置麦克风对话 → 结束会话
```

## 🎨 自定义 Avatar

在 [LiveAvatar Dashboard](https://app.liveavatar.com) 中，您可以自定义：

### 1. Avatar 外观
- 选择不同的人物形象
- 调整服装、背景等

### 2. 声音设置
- 选择声音模型
- 调整语速
- 设置语言/口音

### 3. 对话设置（重要！）

为不同场景设置不同的 System Prompt：

**面试场景 Prompt 示例：**
```
You are an experienced HR recruiter conducting a job interview.
Ask relevant questions about the candidate's experience, skills,
and career goals. Be professional but friendly.
```

**约会场景 Prompt 示例：**
```
You are on a first date at a nice restaurant. Be friendly,
curious, and engaging. Ask about interests and hobbies.
```

**社交场景 Prompt 示例：**
```
You are a professional at a networking event. Be interested
in learning about others' work and help build connections.
```

## 💡 使用建议

### 优势
- ✅ **无需 API 权限**：直接使用试用积分
- ✅ **实现简单**：只需一个 iframe
- ✅ **即时可用**：无需复杂配置
- ✅ **专业界面**：LiveAvatar 提供完整 UI

### 限制
- ❌ **无法获取对话记录**：无法编程式访问 transcript
- ❌ **UI 定制受限**：只能调整 iframe 大小和位置
- ❌ **积分限制**：试用账户有 10 个积分

## 🔄 后续升级路径

如果将来需要更多控制（获取 transcript、自定义 UI 等）：

1. 升级到 Team/Enterprise 订阅
2. 使用我们准备好的 Streaming API 代码
3. 后端 API 路由已经准备好（`/api/heygen/session`）
4. 前端 hook 也已准备好（`useHeyGenAvatar`）

## 📊 积分使用

- **试用账户**：10 积分
- **每次对话**：消耗一定积分（取决于时长）
- **查看余额**：在 [LiveAvatar Dashboard](https://app.liveavatar.com) 查看
- **充值**：如需更多积分，可升级订阅

## 🐛 常见问题

### Q: Avatar 无法加载？
**A:** 检查：
- Embed ID 是否正确
- 是否有剩余积分
- 网络连接是否正常

### Q: 麦克风无法使用？
**A:** 确保：
- 浏览器允许麦克风权限
- 使用 Chrome/Edge（推荐）
- 检查系统麦克风设置

### Q: Avatar 不回应？
**A:** 可能是：
- 积分用完了
- Avatar 配置有问题
- 网络连接不稳定

## 📚 相关文档

- [LIVEAVATAR_EMBED_SETUP.md](LIVEAVATAR_EMBED_SETUP.md) - 详细设置指南
- [HEYGEN_INTEGRATION.md](HEYGEN_INTEGRATION.md) - Streaming API 文档（用于将来升级）

## 🎉 下一步

现在您可以：
1. ✅ 测试 demo 功能
2. ✅ 自定义您自己的 avatar
3. ✅ 为不同场景创建不同的 avatar
4. ✅ 展示给用户或投资者

祝您使用愉快！🚀

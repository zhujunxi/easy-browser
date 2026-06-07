优化分析
1. 🔴 上下文窗口管理（最关键）
问题：requestMessage 无限增长，没有任何 token 计数或截断策略。getScreenContent / getScreenStructure 等工具可能返回数万 token 的数据，几轮对话后必然超出模型的 context limit。
opencode 的做法：有上下文压缩机制，超限时做消息摘要/滚动窗口。
建议：
- 引入 token 计数器（用 tiktoken 等估算）
- 工具返回值做 truncate(content, maxTokens) 截断
- 历史消息过多时，对较早的消息做摘要压缩
2. 🔴 System Prompt 缺少动态上下文注入
问题：System prompt 是纯静态文本，LLM 不知道当前浏览器状态、时间、URL 等信息。
opencode 的做法：动态注入环境信息（OS、Shell、工作目录、日期、git 状态等）。
建议：
// 示例：动态构建 system prompt
const systemPrompt = `${BASE_SYSTEM_PROMPT}
Current Environment:
- Date: ${new Date().toISOString()}
- Current Tab: ${tab.title} (${tab.url})
- Available Tabs: ${allTabs.length} tabs open
- Screen Size: ${window.innerWidth}x${window.innerHeight}`
3. 🟡 缺少规划-执行-反思（ReAct）循环
问题：虽然 system prompt 提到 "decompose into atomic steps"，但没有结构化的规划阶段。LLM 直接就开始调用工具，容易走偏。
opencode 的做法：有多层 planning（todowrite 创建任务列表 → 执行 → 验证），用 subagent 做子任务。
建议：
- 先让 LLM 输出一个执行计划（不调用工具），然后逐步执行
- 或用 todowrite 模式：先规划步骤，每完成一步标记状态
- 工具执行后插入一个 "reflect" 阶段，对比预期结果
4. 🟡 工具结果过大且无结构化压缩
问题：getScreenContent 返回整页文本内容，getScreenStructure 返回 HTML 结构。这些结果直接注入 messages，没有摘要或结构化处理。
建议：
- 工具结果做 token 截断（保留前 N 个 token + 尾部摘要）
- 对于页面结构，可以压缩为关键交互元素列表（只保留可点击/可输入的元素）
- 考虑对截图做压缩/缩放
5. 🟡 所有工具全量发送
问题：15 个工具每次请求都发送，浪费 token 且可能让 LLM 选择困难。
opencode 的做法：虽然工具不少，但它们是按需加载的（如 subagent 只接收完成任务所需的工具子集）。
建议：
- 根据任务类型动态选择相关工具（导航类 vs 数据提取类 vs 交互类）
- 第一轮只发送规划工具（不发送执行工具），规划完成后再发送执行工具
6. 🟡 缺少重试和容错机制
问题：工具执行失败只是 catch 后推送 error 消息，没有重试逻辑。常见场景：页面还没加载完就尝试 click。
建议：
- 网络类/页面交互类工具失败后自动重试 1-2 次（带指数退避）
- 提供 "wait for element" 能力，而不是简单 wait
7. 🔵 安全与权限控制
问题：除了 userConfirm 外没有操作限制，LLM 可能执行危险操作（如关闭所有标签、访问恶意站点）。
建议：
- 操作限流（如最多连续执行 20 个 tool call）
- 高危操作强制 userConfirm（关闭标签、修改设置等）
- URL 域名黑白名单
8. 🔵 多任务并行执行
问题：当前是严格串行执行工具。
opencode 的做法：支持 subagent 并行处理（如同时启动多个 explore agent）。
建议：
- 同时打开多个 tab 的任务可以并行执行
- 多个搜索源可以并行查询
9. 🔵 会话持久化与记忆
问题：每次 reset 后一切归零，没有跨会话的记忆或学习。
建议：
- 用户偏好存储（如 "优先用 Google 搜索"）
- 常用操作模板
- 错误模式学习
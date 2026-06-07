# Cloudy Tech Diagrams Skill

[English](README.en.md) | 简体中文

Cloudy Tech Diagrams Skill 是一个给 AI agent 使用的通用技术图绘制 Skill。它把一套稳定的图面规则、HTML + SVG 模板、导出能力和验证清单交给 agent，让 Claude Code、Codex、Claude.ai、Cursor 以及类似 agent runtime 可以根据文字描述、代码库分析或文档资料生成可直接打开的技术图。

使用 claude 风格温暖视觉风格，可快速融入到各种常规文档中。

## 🎯 解决什么问题

- 每次让 agent 画架构图都要重复说明风格、格式、导出方式和检查标准
- 生成的图经常只像草稿：箭头落点不清楚、文字溢出、节点层级混乱、导出不稳定
- Mermaid / Graphviz 很适合快速表达结构，但在视觉控制、文档嵌入和精细排版上不够灵活
- 技术文档、方案评审和技术分享需要一份能打开、能导出到 Draw.io 继续手工调整，也能导出为 PNG/PDF 的图
- 提供了 cloude 官网一致的视觉设计，有统一的视觉风格和质量底线

## 🧩 适合画什么

- 软件架构图
- 系统设计图
- 流程图和运行机制图
- 云架构和部署视图
- 安全边界和身份认证路径
- 网络拓扑图
- 数据流和事件流
- 技术文档或技术分享里的解释图

它不定位为通用海报、品牌视觉、落地页、dashboard、非技术插画或普通幻灯片工具。

## 🚀 快速开始

快速开始分两步：先把 Skill 安装到 agent 能读取的位置，再在提示词里调用它。

### 安装

安装分两层：先选择获取渠道，再选择安装位置。

#### 选择获取渠道

**Release 包**：推荐用于正式使用、团队分发和发布验证。

从 GitHub Releases 下载最新 Release 包：

```text
cloudy-tech-diagrams-skill-vX.Y.Z.zip
```

Release zip 内部会包含一个顶层 Skill 目录：

```text
cloudy-tech-diagrams/
├── SKILL.md
├── LICENSE
├── VERSION
├── assets/
└── references/
```

**源码 clone**：适合本地开发、调试、参与修改，或暂时还没有 Release 包时快速试用。

源码仓库地址：

```text
https://github.com/cloudy-liu/cloudy-tech-diagrams-skill.git
```

本仓库根目录本身就是 Skill Root。只要 agent 能读到 `SKILL.md`、`assets/` 和 `references/`，就可以使用。源码安装不会自动生成 `VERSION` 文件；需要稳定分发给团队或用于发布验证时，优先使用 GitHub Release 生成的 zip 包。

#### 选择安装位置

**Codex / Agents**

全局安装，使用 Release 包：

```bash
unzip cloudy-tech-diagrams-skill-vX.Y.Z.zip -d ~/.agents/skills/
```

全局安装，使用源码 clone：

```bash
mkdir -p ~/.agents/skills
git clone https://github.com/cloudy-liu/cloudy-tech-diagrams-skill.git ~/.agents/skills/cloudy-tech-diagrams
```

全局安装后的路径通常是：

```text
~/.agents/skills/cloudy-tech-diagrams/
```

项目本地安装，使用 Release 包：

```bash
mkdir -p .agents/skills
unzip cloudy-tech-diagrams-skill-vX.Y.Z.zip -d .agents/skills/
```

项目本地安装，使用源码 clone：

```bash
mkdir -p .agents/skills
git clone https://github.com/cloudy-liu/cloudy-tech-diagrams-skill.git .agents/skills/cloudy-tech-diagrams
```

**Claude Code**

全局安装，使用 Release 包：

```bash
unzip cloudy-tech-diagrams-skill-vX.Y.Z.zip -d ~/.claude/skills/
```

全局安装，使用源码 clone：

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/cloudy-liu/cloudy-tech-diagrams-skill.git ~/.claude/skills/cloudy-tech-diagrams
```

全局安装后的路径通常是：

```text
~/.claude/skills/cloudy-tech-diagrams/
```

项目本地安装，使用 Release 包：

```bash
mkdir -p .claude/skills
unzip cloudy-tech-diagrams-skill-vX.Y.Z.zip -d .claude/skills/
```

项目本地安装，使用源码 clone：

```bash
mkdir -p .claude/skills
git clone https://github.com/cloudy-liu/cloudy-tech-diagrams-skill.git .claude/skills/cloudy-tech-diagrams
```

**Claude.ai**

如果你的 Claude.ai 工作区支持自定义 Skill 上传，可以直接上传 Release zip。不同账号和组织的入口可能不同，以当前 Claude.ai 界面为准。

**Cursor / Windsurf / 其他 Agent**

这些大多都支持 `.agents/skills` 这样的标准格式，可直接复用上面 Codex / Agents 的 Skill 配置。

### 使用

给 agent 一段系统描述，并明确要求使用这个 Skill：

```text
使用 cloudy-tech-diagrams 为下面系统生成一张技术架构图：

- React Web 应用和移动端客户端
- API Gateway
- User Service、Order Service、Product Service
- PostgreSQL、Redis、Elasticsearch
- Kafka 事件流
- Kubernetes 部署
```

也可以让 agent 先分析代码库，再生成图：

```text
先分析这个代码库并总结它的架构，然后使用 cloudy-tech-diagrams 生成一张技术架构图。
```

如果你希望图更贴近某份文档或已有架构图，可以把链接、截图或原始描述一起给 agent：

```text
阅读这份文档，识别它的核心项目架构，然后使用 cloudy-tech-diagrams 生成一份可在浏览器打开的 HTML 架构图。图的重点放在项目架构，不要展开到过细的实现细节。
```

生成结果通常是一份 `.html` 文件。直接用浏览器打开即可查看，并可使用页面顶部的 Copy / PNG / PDF / Draw.io 按钮导出。

## 📦 输出结果是什么

每张图默认是一份自包含 HTML 文件：

- 内嵌 CSS。
- 使用内联 SVG 绘制图形。
- 不依赖外部图片。
- 只为 Copy、PNG、PDF 导出使用 CDN JavaScript。
- 内置针对主 SVG 图的 Draw.io 导出。
- 默认保留 Copy / PNG / PDF / Draw.io 导出工具栏。
- 可以直接在现代浏览器中打开。
- 适合放进技术文档、方案评审材料、README、issue 或分享稿中继续使用。

Draw.io 导出坚持 HTML-first：浏览器中打开的 HTML 仍然是主要产物，`.drawio` 文件只覆盖主 SVG 图，不导出完整页面包装、summary cards、footer 或 toolbar。它追求 draw.io 原生对象的可编辑的视觉等价，而不是精确像素克隆，也不是把整张图作为一张图片塞进 draw.io。

## 🖼️ 示例

### Perfetto 项目架构

![Perfetto 项目架构](examples/perfetto-docs-architecture.png)

### Web 应用架构

![Web 应用架构](examples/images/web-app.png)

### 微服务架构

![微服务架构](examples/images/microservices.png)

## ✅ 设计和质量原则

这个 Skill 的目标不是把图画得复杂，而是让图在技术文档里稳定可读。

- 使用暖色纸张背景，而不是深色 dashboard 风格。
- 使用克制的语义色区分 frontend、backend、data、cloud、security、event 等组件类型。
- 使用开放式箭头，避免厚重的三角箭头。
- 使用 HTML + SVG，方便 agent 直接控制布局、文字、线条和导出。
- 生成前后都要检查图面表达：文字不溢出、箭头可见、连接线有明确起点和终点、图例不压在边界框里。
- 通用 checklist 只约束图面表达质量，不约束具体领域模型是否正确。

## 🗂️ 仓库结构

```text
cloudy-tech-diagrams-skill/
├── SKILL.md
├── assets/
│   └── template.html
├── references/
│   ├── style-references.md
│   └── images/
├── examples/
│   ├── web-app.html
│   ├── microservices.html
│   ├── perfetto-docs-architecture.html
│   └── images/
├── README.md
├── README.en.md
└── LICENSE
```

`SKILL.md` 是 agent 读取的核心指令。`assets/template.html` 是生成图表时复制和改写的起点。`references/` 保存风格参考资料。`examples/` 是 GitHub README 和维护用的示例输出，不会进入最小 Release 包。

## 🙏 致谢

* Cloudy Tech Diagrams Skill 的灵感来源于 [Cocoon-AI/architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator) 项目，对它做了扩展、客制化，感谢！

## 📄 许可证

MIT License。详见 [LICENSE](LICENSE)。

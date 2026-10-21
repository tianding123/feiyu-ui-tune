# feiyu-ui-tune

在 DSH 的「设置 → 通用」里加一行**「设置页背景不透明度」滑块** —— 单独调设置页的透明度，不影响对话区。

## 解决什么问题

DSH 的很多主题插件（玻璃拟态、视频皮肤、半透明背景）会把界面调得很透 —— 好看，但**设置页的文字会看不清**。

常见的做法是把整个界面调实，结果**对话区也跟着变实了**，失去了主题的美感。

这个插件给你一个**只作用于设置面板**的旋钮：

- 往右拉 → 设置页更实、字更清楚
- 往左拉 → 更透明、更贴主题
- 点「还原」→ 回到主题默认

**对话区、侧边栏、主框架一概不动。**

## 为什么兼容其他主题插件

因为它改的不是主题变量。

```
❌ 改 --dsw-alias-bg-layer-*     → 会被主题插件的 !important 覆盖
❌ 改 --dsvs-*（视频皮肤的旋钮）  → 全局生效，对话区也变
✅ 改 .wCInkW_panel（设置面板元素本身）的 background alpha
```

**直接作用于面板元素，不参与主题变量竞争** —— 所以任何主题插件都能一起用。

## 安装

```bash
dsh plugin --profile desktop add file:/path/to/feiyu-ui-tune-0.1.1.tgz
```

或者把 tgz 拖进 DSH 的插件管理页。

装完**重启 DSH**，然后去「设置 → 通用」找那一行滑块。

## 设置存在哪

`localStorage` 的 `feiyu-ui-tune:settings-opacity`。不入库、不上传、不碰 DSH 的配置文件。

## 兼容性

- DSH 0.2.0-rc.2 实测可用
- 只依赖 `@deepseek-ai/dsh-client-runtime` 和 `@deepseek-ai/dsh-client-ui-settings`

## 已知细节（给改代码的人）

设置面板的 DOM 结构（DSH 0.2.0-rc.2，CDP 实测）：

```
wCInkW_overlay     0,0      1280×820   全屏容器，透明
├─ wCInkW_mask     0,40     1280×780   rgba(0,0,0,.5)        背景遮罩
└─ wCInkW_panel    240,60   800×700    rgba(41,41,41,.16)  ← 面板本体（改这个）
   ├─ wCInkW_nav       240,60  188×700   左侧导航
   └─ wCInkW_content   428,60  612×700   右侧内容
```

**容易被误认的：** `Dc7zOa_root`（280,40 1000×780）是**聊天区**，不是设置面板。

> 这些 class 名是 DSH 构建产物，版本升级可能变。真变了就按「含该页特征文字的最深元素」重新定位 —— 别靠尺寸和透明度猜。

## License

MIT

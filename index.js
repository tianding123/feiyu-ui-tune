/**
 * feiyu-ui-tune —— 宿主半边（几乎没有逻辑）
 *
 * 为什么存在：DSH 的 bundle 机制要求每个插件有一个可加载的 host 入口。
 * 本插件的全部功能都在浏览器半边（client.js）：
 *   · 在「设置 → 通用」加一行「窗口背景不透明度」滑块
 *   · 拖动时实时改 --dsw-alias-bg-base / bg-layer-1 / bg-layer-2 的 alpha
 *   · 值存在 localStorage，刷新/重启后自动恢复
 *
 * 所以 host 这边只做一件事：声明自己叫什么，apply 里什么都不干 ——
 * 不做 IO、不挂 hook、不注册工具，把出错面降到零。
 */

export const name = 'feiyu-ui-tune'

export function apply() {
  // 故意的空实现：本插件的所有工作在浏览器里完成。
}

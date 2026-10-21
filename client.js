/**
 * feiyu-ui-tune —— 浏览器半边
 *
 * 在「设置 → 通用」里加一行「设置页背景不透明度」滑块，**只影响设置面板**，
 * 不碰对话区、侧边栏、主框架。
 *
 * ## 试错过程（2026-10-19，一共返工三次，记下来免得再走）
 *
 *   ① 改 `--dsw-alias-bg-layer-*`
 *        → 被 dsh-video-skin 的 `!important` 盖掉，完全没效果
 *   ② 改 `--dsvs-*`（视频皮肤的旋钮）
 *        → 有了，但**全局生效**：对话区也跟着变实
 *   ③ 改 `Dc7zOa_root`
 *        → 那个是**聊天区**，改反了（凭"尺寸 1000×780 + 20% 透明"猜的，猜错）
 *   ④ 改 `wCInkW_panel` ✅
 *        → 对了。判据：这个元素里装着「账号与余额 / 通用设置」这些设置页文字。
 *
 * ★ 教训：**别靠"尺寸 + 透明度"猜选择器**，一定先确认目标面板开着、
 *   再找"含该页特征文字的最深元素"，最后排除已知干扰树。
 *
 * ## 设置面板长什么样（CDP 实测，DSH 0.2.0-rc.2）
 *
 *   wCInkW_overlay     0,0      1280×820   全屏容器，透明
 *   ├─ wCInkW_mask     0,40     1280×780   rgba(0,0,0,.5)        背景遮罩
 *   └─ wCInkW_panel    240,60   800×700    rgba(41,41,41,.16)  ← ★ 面板本体
 *      ├─ wCInkW_nav       240,60  188×700   左侧导航
 *      └─ wCInkW_content   428,60  612×700   右侧内容
 *
 *   对照（容易被误认的）：`Dc7zOa_root` 是**聊天区**（280,40 1000×780）。
 *
 *   ⚠️ `wCInkW_panel` 是 CSS Modules 生成的哈希类名 —— DSH 升级时可能变。
 *      变了怎么办：把设置面板打开，然后用 CDP 找"含「账号与余额」的最深元素"
 *      往上走，看哪一层画了背景色；把那个类名换到下面的 SELECTOR 常量里即可。
 */

window.__ModuleLoader__.load({
  id: 'feiyu-ui-tune',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement

    const STORAGE_KEY = 'feiyu-ui-tune:panel-alpha'
    const STYLE_ID = 'feiyu-ui-tune-panel-bg'

    /** ★ 设置面板的根（哈希类名；DSH 升级后变了就改这一行） */
    const SELECTOR = '[class*="wCInkW_panel"]'

    /** 面板底色（跟主题保持一致的深灰） */
    const RGB = '41, 41, 41'

    /**
     * 往 <head> 里写/更新一条只作用于设置面板的规则。
     * alpha === null → 移除规则，回到主题原样。
     */
    function applyAlpha(alpha) {
      let style = document.getElementById(STYLE_ID)
      if (alpha === null || alpha === undefined) {
        if (style) style.remove()
        return
      }
      if (!style) {
        style = document.createElement('style')
        style.id = STYLE_ID
        style.setAttribute('data-plugin-css', 'feiyu-ui-tune')
        document.head.appendChild(style)
      }
      const a = Math.min(1, Math.max(0, alpha))
      // 只打设置面板那一个元素，别的都不碰。
      style.textContent =
        SELECTOR + ' { background-color: rgba(' + RGB + ', ' + a + ') !important; }'
    }

    function loadSaved() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw === null) return null
        const n = Number(raw)
        return Number.isFinite(n) ? n : null
      } catch {
        return null
      }
    }

    function saveValue(v) {
      try {
        localStorage.setItem(STORAGE_KEY, String(v))
      } catch {
        /* ignore */
      }
    }

    // ── 滑块那一行 ──────────────────────────────────────────────
    function Row() {
      const [value, setValue] = React.useState(() => loadSaved())

      React.useEffect(() => {
        const saved = loadSaved()
        if (saved !== null) applyAlpha(saved)
      }, [])

      const onChange = (e) => {
        const v = Number(e.target.value) / 100
        setValue(v)
        applyAlpha(v)
        saveValue(v)
      }

      const reset = () => {
        setValue(null)
        applyAlpha(null)
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
      }

      const pct = value === null ? '' : Math.round(value * 100) + '%'

      return h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '10px 0',
            width: '100%',
          },
        },
        h(
          'div',
          { style: { flex: '1 1 auto', minWidth: 0 } },
          h(
            'div',
            { style: { fontSize: 14, fontWeight: 500, marginBottom: 2 } },
            '设置页背景不透明度',
          ),
          h(
            'div',
            { style: { fontSize: 12, opacity: 0.7, lineHeight: 1.5 } },
            '只管设置页面本身（含各插件的设置页），不影响对话区。往右拉更实；点「还原」用主题默认。',
          ),
        ),
        h(
          'div',
          { style: { flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 } },
          h('input', {
            type: 'range',
            min: 0,
            max: 100,
            step: 1,
            value: value === null ? 20 : Math.round(value * 100),
            onChange,
            style: { width: 140, cursor: 'pointer' },
            'aria-label': '设置页背景不透明度',
          }),
          h(
            'span',
            {
              style: {
                fontSize: 12,
                minWidth: 42,
                textAlign: 'right',
                opacity: 0.75,
                fontVariantNumeric: 'tabular-nums',
              },
            },
            pct || '默认',
          ),
          h(
            'button',
            {
              type: 'button',
              onClick: reset,
              style: {
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid currentColor',
                background: 'transparent',
                color: 'inherit',
                opacity: 0.6,
                cursor: 'pointer',
              },
            },
            '还原',
          ),
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        // 插件一加载就把上次的值套上（不用等打开设置页）
        try {
          const saved = loadSaved()
          if (saved !== null) applyAlpha(saved)
        } catch {
          /* ignore */
        }

        try {
          const slots =
            (typeof ctx.get === 'function' ? ctx.get('slots') : undefined) || ctx.slots
          if (!slots) return
          slots.inject('settings.general.item', () =>
            slots.register(
              {
                name: 'settings.general.item',
                id: 'feiyu-ui-tune',
                order: 200,
                label: '设置页背景不透明度',
              },
              () => h(Row),
            ),
          )
        } catch {
          /* 注册失败只是这行不出现 */
        }
      },
    }
  },
})

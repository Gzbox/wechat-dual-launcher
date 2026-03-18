const zh = {
  app: {
    title: '微信多开助手',
    subtitle: '轻松管理多个微信实例'
  },
  status: {
    running: '运行中',
    stopped: '未运行',
    original: '原版'
  },
  actions: {
    launch: '启动',
    stop: '停止',
    delete: '删除',
    update: '更新',
    create: '创建副本',
    cancel: '取消',
    confirm: '确定'
  },
  create: {
    title: '创建微信副本',
    defaultName: '微信副本',
    defaultSuffix: '2',
    nameLabel: '副本名称',
    namePlaceholder: '例如：微信工作版',
    suffixLabel: 'Bundle 后缀',
    suffixPlaceholder: '例如：2',
    suffixHint: '将生成 Bundle ID: com.tencent.xinWeChat',
    creating: '正在创建…'
  },
  empty: {
    title: '还没有微信副本',
    description: '创建一个副本即可同时登录多个微信账号，互不干扰',
    cta: '创建第一个副本'
  },
  detect: {
    detecting: '正在检测微信…',
    notFound: '未检测到微信',
    notFoundDesc: '请先从 App Store 或官网安装微信',
    found: '已检测到微信',
    version: '版本'
  },
  dashboard: {
    path: '路径',
    helpAndTips: '帮助和提示',
    sysLogsAndTech: '系统日志与技术内幕'
  },
  confirm: {
    deleteTitle: '确认删除',
    deleteMessage: '将删除应用及其所有数据（聊天记录、登录状态等），此操作不可撤销。',
    updateTitle: '确认更新',
    updateMessage: '将删除当前副本并从原版微信重新创建，聊天数据将保留。'
  },
  faq: {
    title: '常见问题',
    items: [
      {
        q: '提示"无法打开，因为无法验证开发者"？',
        a: '打开 系统设置 → 隐私与安全性，往下找到被阻止的提示，点击"仍要打开"。只需允许一次。'
      },
      {
        q: '微信更新后副本还能用吗？',
        a: '可以。原版更新不影响副本。如需更新副本，点击"更新"按钮即可从最新版微信重新创建。'
      },
      {
        q: '两个微信的聊天记录会互相干扰吗？',
        a: '不会。每个副本使用完全独立的数据目录，聊天记录、登录状态完全隔离。'
      },
      {
        q: '能开三个甚至更多微信吗？',
        a: '理论上可以，但微信服务器可能检测异常登录，建议最多开两个。'
      }
    ]
  },
  errors: {
    ERR_IN_PROGRESS: '另一个操作正在进行中，请稍候',
    ERR_NOT_FOUND: '未检测到微信，请先安装微信',
    ERR_EMPTY_NAME: '请输入副本名称',
    ERR_EMPTY_SUFFIX: '请输入 Bundle 后缀',
    ERR_INVALID_SUFFIX: 'Bundle 后缀只能包含英文字母和数字',
    ERR_INVALID_NAME: '名称包含非法字符',
    ERR_ID_USED: '该 Bundle ID 已被使用，请使用其他后缀',
    ERR_INVALID_PATH: '应用路径不合法',
    ERR_APP_EXISTS: '该应用名称已存在，请使用其他名称',
    ERR_COPY_FAILED: '复制失败，可能权限不足。请尝试在"系统设置 → 隐私与安全性"中授予权限。',
    ERR_PLIST_FAILED: '修改应用信息失败:',
    ERR_SIGN_FAILED: '代码签名失败:',
    ERR_APP_INVALID: '可执行文件不存在:',
    ERR_READ_PLIST_FAILED: '无法读取应用信息',
    ERR_CANNOT_DELETE_ORIGINAL: '不能删除原版微信',
    ERR_APP_RUNNING_DELETE: '请先关闭该微信副本，再进行删除',
    ERR_CANNOT_UPDATE_ORIGINAL: '不能更新原版微信',
    ERR_APP_RUNNING_UPDATE: '请先关闭该微信副本，再进行更新',
    ERR_ORIGINAL_NOT_FOUND: '未检测到原版微信，无法更新。请先安装微信',
    ERR_UPDATE_REBUILD_FAILED: '复制失败，旧副本已被删除但无法重建:'
  },
  progress: {
    PROG_COPY: '正在复制微信…',
    PROG_PLIST: '正在修改身份标识…',
    PROG_SIGN: '正在重新签名…',
    PROG_DONE: '操作完成',
    PROG_DELETE_OLD: '正在删除旧版本…',
    PROG_COPY_NEW: '正在复制最新版本微信…',
    PROG_UPDATE_DONE: '更新完成'
  },
  infoModal: {
    title: '系统诊断日志与架构内幕',
    terminal: {
      diagnosticActive: '[INFO] Diagnostic active... Reverse-engineering concurrency models.'
    },
    sections: [
      {
        title: '1. 架构概览与进程隔离',
        content: '本项目基于 <strong>Electron + React + TypeScript</strong> 构建：<br />&bull; <strong>主进程 (Main Process):</strong> 运行于 Node.js 环境，负责高权限的底层操作，如 <code>child_process.execFile</code>、<code>fs</code> 文件读写。<br />&bull; <strong>渲染进程 (Renderer):</strong> 独立沙盒化的 UI 视图环境。<br />&bull; <strong>安全通信 (Context Bridge):</strong> 所有跨进程调用均通过严格隔离的 <code>preload</code> 脚本进行 IPC 通信，从系统架构层面杜绝 XSS 到 RCE 的风险。'
      },
      {
        title: '2. 核心魔法：绕过单实例限制',
        content: 'macOS 底层依赖 <code>CFBundleIdentifier</code> (Bundle ID) 校验应用唯一性。突破机制原理：<br />1. <strong>深拷贝补全 (Deep Clone):</strong> 将 <code>/Applications/WeChat.app</code> 完整拷贝至目标路径。<br />2. <strong>原生 Plist 篡改:</strong> 调用 macOS 原生工具 <code>/usr/libexec/PlistBuddy</code>，以极高的稳定性和安全性无损覆写 <code>Info.plist</code> 中的 <code>CFBundleIdentifier</code> 和 <code>CFBundleName</code>。<br />3. <strong>重新签名 (Ad-Hoc Codesign):</strong> 突破系统安全拦截的最后一步 —— 调用 <code>/usr/bin/codesign -fs - --deep</code> 剥离原版签名并赋予本地伪签名。至此，内核完全将其视为一个独立的新应用。'
      },
      {
        title: '3. 毫秒级无感进程侦测',
        content: '主进程通过高频轮询调用 <code>/bin/ps -eo command</code> 一次性获取全局进程表，在内存中比对各分身的物理可执行路径 (<code>CFBundleExecutable</code>)，精确判断分身是否运行。该设计彻底排除了应用名相似导致的假阳性误判，且 CPU 消耗趋近于零。'
      },
      {
        title: '4. 极致的清理与无痕管理',
        content: '卸载分身不仅是删除 <code>.app</code> 包，程序会深度追踪沙盒运作机制：除物理湮灭应用主体外，还会静默清除 <code>~/Library/Containers/[BundleID]</code> 以及 <code>~/Library/Group Containers/[BundleID]</code> 中关联的所有隔离存储数据区。实现随卡随用，随删无痕。'
      },
      {
        title: '5. Frameless UI 原生执念',
        content: '前端采用自绘的 <code>Frameless Window</code> 架构。通过定制可拖拽安全区 (<code>-webkit-app-region: drag</code>) 重拾系统级窗口拖拽。UI 阴影、毛玻璃与微动画 (<code>Keyframes</code>) 深度利用 GPU 硬件加速，纯 CSS 呈现顺滑的“超原生级”响应。'
      }
    ]
  },
  updater: {
    newVersion: '发现新版本',
    downloading: '下载中...',
    downloaded: '下载完成',
    updateError: '更新出错',
    progress: '进度',
    restartNow: '立刻重启更新',
    close: '关闭',
    checkForUpdates: '检查更新',
    checking: '正在检查…',
    upToDate: '已是最新版本'
  }
}

export type Locale = typeof zh
export default zh

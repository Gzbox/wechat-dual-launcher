import type { Locale } from './zh'

const en: Locale = {
  app: {
    title: 'WeChat Dual Launcher',
    subtitle: 'Run multiple WeChat instances independently'
  },
  status: {
    running: 'Running',
    stopped: 'Stopped',
    original: 'Original'
  },
  actions: {
    launch: 'Launch',
    stop: 'Stop',
    delete: 'Delete',
    update: 'Update',
    create: 'Create Clone',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  create: {
    title: 'Create WeChat Clone',
    defaultName: 'WeChat Clone',
    defaultSuffix: '2',
    nameLabel: 'Clone Name',
    namePlaceholder: 'e.g. WeChat Work',
    suffixLabel: 'Bundle Suffix',
    suffixPlaceholder: 'e.g. 2',
    suffixHint: 'Will generate Bundle ID: com.tencent.xinWeChat',
    creating: 'Creating\u2026'
  },
  empty: {
    title: 'No WeChat clones yet',
    description: 'Create a clone to log in with multiple WeChat accounts simultaneously',
    cta: 'Create first clone'
  },
  detect: {
    detecting: 'Detecting WeChat\u2026',
    notFound: 'WeChat not detected',
    notFoundDesc: 'Please install WeChat from the App Store or official website first',
    found: 'WeChat detected',
    version: 'Version'
  },
  dashboard: {
    path: 'Path',
    helpAndTips: 'Help & Tips',
    sysLogsAndTech: 'System Logs & Tech Insider'
  },
  confirm: {
    deleteTitle: 'Confirm Delete',
    deleteMessage:
      'This will remove the app and all its data (chat history, login state, etc.). This action cannot be undone.',
    updateTitle: 'Confirm Update',
    updateMessage:
      'This will delete the current clone and re-create from the latest original WeChat. Chat data will be preserved.'
  },
  faq: {
    title: 'FAQ',
    items: [
      {
        q: '"Cannot open because the developer cannot be verified"?',
        a: 'Go to System Settings \u2192 Privacy & Security, bypass the blocked notice by clicking "Open Anyway". You only need to do this once.'
      },
      {
        q: 'Will the clone still work after WeChat updates?',
        a: 'Yes. Original updates don\'t affect clones. To update a clone, click the "Update" button to re-create it from the newly updated version.'
      },
      {
        q: 'Will chat histories interfere between instances?',
        a: 'No. Each clone uses a completely independent sandbox directory. User data and login states are entirely isolated.'
      },
      {
        q: 'Can I open three or more instances?',
        a: 'Theoretically yes, but WeChat servers may flag abnormal logins if too many run at once. We recommend a maximum of two.'
      }
    ]
  },
  errors: {
    ERR_IN_PROGRESS: 'Another operation is in progress, please wait',
    ERR_NOT_FOUND: 'WeChat not detected, please install WeChat first',
    ERR_EMPTY_NAME: 'Please enter a clone name',
    ERR_EMPTY_SUFFIX: 'Please enter a Bundle suffix',
    ERR_INVALID_SUFFIX: 'Bundle suffix must be alphanumeric',
    ERR_INVALID_NAME: 'Name contains invalid characters',
    ERR_ID_USED: 'This Bundle ID is already in use, please choose another suffix',
    ERR_INVALID_PATH: 'Invalid application path',
    ERR_APP_EXISTS: 'An application with this name already exists',
    ERR_COPY_FAILED:
      'Copy failed, possibly due to insufficient permissions. Please grant access in System Settings -> Privacy & Security.',
    ERR_PLIST_FAILED: 'Failed to modify application info:',
    ERR_SIGN_FAILED: 'Code signing failed:',
    ERR_APP_INVALID: 'Executable not found:',
    ERR_READ_PLIST_FAILED: 'Unable to read application information',
    ERR_CANNOT_DELETE_ORIGINAL: 'Cannot delete the original WeChat',
    ERR_APP_RUNNING_DELETE: 'Please close this WeChat clone before deleting',
    ERR_CANNOT_UPDATE_ORIGINAL: 'Cannot update the original WeChat',
    ERR_APP_RUNNING_UPDATE: 'Please close this WeChat clone before updating',
    ERR_ORIGINAL_NOT_FOUND: 'Original WeChat not detected. Cannot update.',
    ERR_UPDATE_REBUILD_FAILED:
      'Copy failed. The old clone was successfully deleted but could not be rebuilt:'
  },
  progress: {
    PROG_COPY: 'Copying WeChat\u2026',
    PROG_PLIST: 'Modifying identity identifiers\u2026',
    PROG_SIGN: 'Re-signing application\u2026',
    PROG_DONE: 'Operation complete',
    PROG_DELETE_OLD: 'Deleting old version\u2026',
    PROG_COPY_NEW: 'Copying latest WeChat version\u2026',
    PROG_UPDATE_DONE: 'Update complete'
  },
  infoModal: {
    title: 'System Diagnostics & Architectural Insider',
    terminal: {
      diagnosticActive:
        '[INFO] Diagnostic active... Reverse-engineering concurrency models.'
    },
    sections: [
      {
        title: '1. Architecture & Process Isolation',
        content:
          'Built upon <strong>Electron + React + TypeScript</strong>:<br />&bull; <strong>Main Process:</strong> Runs in a Node.js environment, handling high-privilege basal operations like <code>child_process.execFile</code> and <code>fs</code> I/O.<br />&bull; <strong>Renderer Process:</strong> Independent UI view process, fully isolated from the main process.<br />&bull; <strong>Context Bridge:</strong> All inter-process communication routes forcefully via isolated <code>preload</code> scripts (IPC), eliminating XSS-to-RCE vectors at the architectural root.'
      },
      {
        title: '2. Core Magic: Singleton Bypass',
        content:
          'macOS relies on <code>CFBundleIdentifier</code> to enforce application uniqueness. The bypass technique:<br />1. <strong>Deep Clone:</strong> Bit-for-bit replication of <code>/Applications/WeChat.app</code> to the sandbox path.<br />2. <strong>Native Plist Mutation:</strong> Utilizes the native standard tool <code>/usr/libexec/PlistBuddy</code> to safely and non-destructively hot-patch the <code>Info.plist</code>, modifying the bundle identifier and display name natively.<br />3. <strong>Ad-Hoc Codesign:</strong> The final blow to OS restrictions\u2014calling <code>/usr/bin/codesign -fs - --deep</code> to sever the original signature and stamp a local ad-hoc certificate. Darwin now embraces it as a completely detached genesis entity.'
      },
      {
        title: '3. Millisecond Process Perception',
        content:
          'On each query request, the main orchestrator calls <code>/bin/ps -eo command</code> to slice the global process matrix and compares memory-resident physical executable paths (derived from <code>CFBundleExecutable</code>). This entirely neutralizes naming-collision false positives, achieving absolute accuracy with zero persistent CPU overhead.'
      },
      {
        title: '4. Traceless Erasure Methodology',
        content:
          'Tearing down a clone is deeper than trashing a <code>.app</code>. The protocol recursively scans the macOS sandbox framework, executing physical erasure of the binary while silently nuking all entangled localized storage grids at <code>~/Library/Containers/[BundleID]</code> and <code>~/Library/Group Containers/[BundleID]</code>. Use freely, purge silently.'
      },
      {
        title: '5. Native Hidden Title Bar Ascendency',
        content:
          'Frontend mounts a <code>titleBarStyle: hiddenInset</code> topology, hiding the system title bar while preserving native traffic-light controls. We reclaim window-draggable regions natively using tailored CSS boundaries (<code>-webkit-app-region: drag</code>). The visual stack\u2014macOS-grade shadows, GPU-accelerated glassmorphism, and micro-keyframes\u2014is fully delegated to hardware rendering pipelines, orchestrating an unequivocally \u201csuper-native\u201d tactical response.'
      }
    ]
  },
  updater: {
    newVersion: 'New Version Available',
    updateError: 'Update Error',
    close: 'Close',
    checkForUpdates: 'Check for Updates',
    checking: 'Checking\u2026',
    upToDate: 'You are up to date',
    downloadNow: 'Download Now',
    later: 'Later',
    browserHint:
      'Opens the download page in your browser. Download the new DMG and replace the app.',
    available: 'Available',
    goDownload: 'Download',
    checkFailed: 'Check failed'
  }
}

export default en

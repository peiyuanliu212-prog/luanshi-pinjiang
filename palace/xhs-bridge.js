/* 《乱世拼将》小红书小工具桥接层（xhs-bridge.js）
 * 作用（全部特性检测、失败静默，普通浏览器环境下完全无副作用）：
 * 1. 存档镜像：游戏仍以 localStorage 为主存；本层把 luanshi_* 三个键的写入
 *    同步镜像到小红书 Storage JS API（客户端 >= 9.46），容器清掉 WebView
 *    存储时下次启动可自动恢复，避免战绩/图鉴丢失（虎扑端已有同类教训）。
 * 2. 顶部安全区：容器内用 getWindowInfo 的 statusBarHeight 给 .wrap 加避让，
 *    等价于虎扑端的 fullscreen-safe-top。
 * 规范依据：小红书《小工具容器能力清单》§3.6 / §3.7 / §3.11。
 */
(function () {
  'use strict';
  var WATCH_KEYS = ['gongting_save_v1', 'gongting_records_v1', 'gongting_collection_v1'];
  var STORAGE_MIN_CLIENT = 9460; /* 客户端 9.46.0 */

  function miniTool() {
    var xhs = window.xhs;
    return (xhs && xhs.miniTool) || null;
  }
  function readBuildVersion(launchOptions) {
    var env = launchOptions && launchOptions.miniToolEnv;
    return Number(env && env.buildVersion) || 0;
  }
  function getBuildVersion() {
    var xhs = window.xhs;
    var sync = readBuildVersion(xhs && xhs.launchOptions);
    if (sync) return Promise.resolve(sync);
    var mt = miniTool();
    if (!mt || typeof mt.getLaunchOptions !== 'function') return Promise.resolve(0);
    return mt.getLaunchOptions().then(function (lo) {
      return readBuildVersion(lo);
    }).catch(function () { return 0; });
  }
  function storageReady() {
    var mt = miniTool();
    if (!mt || typeof mt.setStorage !== 'function' || typeof mt.getStorage !== 'function') {
      return Promise.resolve(false);
    }
    return getBuildVersion().then(function (bv) {
      return Math.floor(bv / 1000) >= STORAGE_MIN_CLIENT;
    }).catch(function () { return false; });
  }

  /* ---------- 1. 写入镜像（节流合并，同键 900ms 内只推最后一次） ---------- */
  var origSet = null, origRemove = null;
  try {
    origSet = Storage.prototype.setItem;
    origRemove = Storage.prototype.removeItem;
  } catch (e) { /* 存储不可用则整层停用 */ }
  if (origSet && origRemove) {
    var timers = {}, pending = {};
    var schedulePush = function (key) {
      if (timers[key]) clearTimeout(timers[key]);
      timers[key] = setTimeout(function () {
        timers[key] = null;
        storageReady().then(function (ok) {
          if (!ok) return;
          var mt = miniTool();
          var val = pending[key];
          try {
            if (val === null) {
              if (typeof mt.removeStorage === 'function') mt.removeStorage({ key: key }).catch(function () {});
            } else if (typeof val === 'string') {
              mt.setStorage({ key: key, data: val }).catch(function () {});
            }
          } catch (e) {}
        });
      }, 900);
    };
    Storage.prototype.setItem = function (key, value) {
      var r = origSet.call(this, key, value);
      try {
        if (this === window.localStorage && WATCH_KEYS.indexOf(key) >= 0) {
          pending[key] = String(value);
          schedulePush(key);
        }
      } catch (e) {}
      return r;
    };
    Storage.prototype.removeItem = function (key) {
      var r = origRemove.call(this, key);
      try {
        if (this === window.localStorage && WATCH_KEYS.indexOf(key) >= 0) {
          pending[key] = null;
          schedulePush(key);
        }
      } catch (e) {}
      return r;
    };

    /* ---------- 启动恢复：本地缺失而平台存储有时，写回本地并重载一次 ---------- */
    var tryRestore = function () {
      storageReady().then(function (ok) {
        if (!ok) return;
        var mt = miniTool();
        var restored = false;
        var chain = Promise.resolve();
        WATCH_KEYS.forEach(function (key) {
          chain = chain.then(function () {
            var local = null;
            try { local = window.localStorage.getItem(key); } catch (e) {}
            if (local) return null;
            return mt.getStorage({ key: key }).then(function (res) {
              var data = res && res.data;
              if (typeof data === 'string' && data) {
                try { origSet.call(window.localStorage, key, data); restored = true; } catch (e) {}
              }
            }).catch(function () {});
          });
        });
        return chain.then(function () {
          if (!restored) return;
          try {
            if (window.sessionStorage.getItem('xhs_bridge_restored') === '1') return;
            window.sessionStorage.setItem('xhs_bridge_restored', '1');
          } catch (e) { return; }
          window.location.reload();
        });
      }).catch(function () {});
    };
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(tryRestore, 500);
    } else {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(tryRestore, 500); });
    }
  }

  /* ---------- 2. 顶部安全区避让（getWindowInfo，9.49+；低版本静默跳过） ---------- */
  try {
    var mt2 = miniTool();
    if (mt2 && typeof mt2.getWindowInfo === 'function') {
      getBuildVersion().then(function (bv) {
        if (Math.floor(bv / 1000) < 9490) return null;
        return mt2.getWindowInfo();
      }).then(function (info) {
        if (!info) return;
        var top = 0;
        if (info.safeArea && typeof info.safeArea.top === 'number') top = info.safeArea.top;
        if (!top && typeof info.statusBarHeight === 'number') top = info.statusBarHeight;
        if (top > 0) {
          var apply = function () {
            var wrap = document.querySelector('.wrap');
            if (wrap) wrap.style.paddingTop = (16 + top) + 'px';
          };
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', apply);
          } else { apply(); }
        }
      }).catch(function () {});
    }
  } catch (e) {}
})();

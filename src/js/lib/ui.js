import Core from './core'
import Store from './store'

class UI {
  constructor () {
    this.version = chrome.runtime.getManifest().version
    this.updateDate = '2025/11/08'
    Store.on('updateView', (configData) => {
      this.updateSetting(configData)
      this.updateMenu(configData)
    })
  }

  init () {
    this.context = document.querySelector('iframe[rel="wangpan"]').contentDocument
    this.addSettingUI()
    this.addTextExport()
    Store.trigger('initConfigData')
  }

  addMenu (element, position) {
    const menu = `
      <div id="exportMenu" class="export">
        <a class="export-button">导出下载</a>
        <div id="aria2List" class="export-menu">
          <a class="export-menu-item" id="batchOpen" href="javascript:void(0);">批量打开</a>
          <a class="export-menu-item" id="aria2Text" href="javascript:void(0);">文本导出</a>
          <a class="export-menu-item" id="settingButton" href="javascript:void(0);">设置</a>
        </div>
      </div>`
    if (element) {
      element.insertAdjacentHTML(position, menu)
    } else {
      return
    }
    const exportMenu = this.context.querySelector('#exportMenu')
    exportMenu.addEventListener('mouseenter', () => {
      exportMenu.classList.add('open-o')
    })
    exportMenu.addEventListener('mouseleave', () => {
      exportMenu.classList.remove('open-o')
    })
    const settingButton = this.context.querySelector('#settingButton')
    const settingMenu = document.querySelector('#settingMenu')
    settingButton.addEventListener('click', (event) => {
      settingMenu.classList.add('open-o')
    })
    // fix click select file
    const aria2List = this.context.querySelector('#aria2List')
    aria2List.addEventListener('mousedown', (event) => {
      event.stopPropagation()
    })
  }

  addContextMenuRPCSectionWithCallback (callback) {
    const addContextMenuRPCSection = (node) => {
      const dom = '<div class="cell" id="more-menu-rpc-section"><ul></ul></div>'
      node.insertAdjacentHTML('beforebegin', dom)
      if (this.mostRecentConfigData) {
        this.updateMenu(this.mostRecentConfigData)
      }
      if (callback) {
        callback()
      }
    }

    const contextMenuNode = this.context.querySelector('body > .context-menu .cell')
    if (contextMenuNode) {
      addContextMenuRPCSection(contextMenuNode)
    } else if ('MutationObserver' in window) {
      const body = this.context.querySelector('body')
      const observer = new MutationObserver((mutationsList) => {
        const contextMenuNode = this.context.querySelector('body > .context-menu .cell')
        if (contextMenuNode) {
          observer.disconnect()
          addContextMenuRPCSection(contextMenuNode)
        }
      })
      observer.observe(body, {
        childList: true
      })
    }
  }

  resetMenu () {
    this.context.querySelectorAll('#more-menu-rpc-section li').forEach((item) => {
      item.remove()
    })
    this.context.querySelectorAll('.rpc-button').forEach((rpc) => {
      rpc.remove()
    })
  }

  updateMenu (configData) {
    this.resetMenu()
    const { rpcList } = configData
    let rpcDOMList = ''
    let contextMenuDOMList = ''
    rpcList.forEach((rpc) => {
      const rpcDOM = `<a class="export-menu-item rpc-button" href="javascript:void(0);" data-url=${rpc.url}>${rpc.name}</a>`
      rpcDOMList += rpcDOM
      contextMenuDOMList += `<li><a href="javascript:void(0);" data-url=${rpc.url}>${rpc.name}</a></li>`
    })
    this.context.querySelector('#aria2List').insertAdjacentHTML('afterbegin', rpcDOMList)

    const contextMenuSection = this.context.querySelector('#more-menu-rpc-section ul')
    if (contextMenuSection) {
      contextMenuSection.insertAdjacentHTML('afterbegin', contextMenuDOMList)
    }
  }

  addTextExport () {
    const text = `
      <div id="textMenu" class="modal text-menu">
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-title">文本导出</div>
            <div class="modal-close">×</div>
          </div>
          <div class="modal-body">
            <div class="text-menu-row">
              <a class="text-menu-button" href="javascript:void(0);" id="aria2Txt" download="aria2c.down">存为Aria2文件</a>
              <a class="text-menu-button" href="javascript:void(0);" id="idmTxt" download="idm.ef2">存为IDM文件</a>
              <a class="text-menu-button" href="javascript:void(0);" id="downloadLinkTxt" download="link.txt">保存下载链接</a>
              <a class="text-menu-button" href="javascript:void(0);" id="copyDownloadLinkTxt">拷贝下载链接</a>
            </div>
            <div class="text-menu-row">
              <textarea class="text-menu-textarea" type="textarea" wrap="off" spellcheck="false" id="aria2CmdTxt"></textarea>
            </div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', text)
    const textMenu = document.querySelector('#textMenu')
    const close = textMenu.querySelector('.modal-close')
    const copyDownloadLinkTxt = textMenu.querySelector('#copyDownloadLinkTxt')
    copyDownloadLinkTxt.addEventListener('click', () => {
      Core.copyText(copyDownloadLinkTxt.dataset.link)
    })
    close.addEventListener('click', () => {
      textMenu.classList.remove('open-o')
      this.resetTextExport()
    })
  }

  resetTextExport () {
    const textMenu = document.querySelector('#textMenu')
    textMenu.querySelector('#aria2Txt').href = ''
    textMenu.querySelector('#idmTxt').href = ''
    textMenu.querySelector('#downloadLinkTxt').href = ''
    textMenu.querySelector('#aria2CmdTxt').value = ''
    textMenu.querySelector('#copyDownloadLinkTxt').dataset.link = ''
  }

  addSettingUI () {
    const setting = `
      <div id="settingMenu" class="modal setting-menu">
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-title">导出设置</div>
            <div class="modal-close">×</div>
          </div>
          <div class="modal-body">
            <div class="setting-menu-message">
              <label class="setting-menu-label orange-o" id="message"></label>
            </div>
            <div class="setting-menu-row rpc-s">
              <div class="setting-menu-name">
                <input class="setting-menu-input name-s" spellcheck="false" placeholder="名称">
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input url-s" spellcheck="false" placeholder="示例: http://token:RPC密钥@127.0.0.1:6800/jsonrpc">
                <a class="setting-menu-button" id="addRPC" href="javascript:void(0);">添加RPC地址</a>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">配置同步</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox configSync-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">SHA1校验</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox sha1Check-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">115会员</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox vip-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">小文件优先</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox small-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">递归下载间隔</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input small-o interval-s" type="number" spellcheck="false">
                <label class="setting-menu-label">(单位:毫秒)</label>
                <a class="setting-menu-button version-s" id="testAria2" href="javascript:void(0);">测试连接，成功显示版本号</a>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">下载路径</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input downloadPath-s" placeholder="只能设置为绝对路径" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">User-Agent</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input userAgent-s" spellcheck="false">
                <label class="setting-menu-label"></label>
                <input type="checkbox" class="setting-menu-checkbox browser-userAgent-s">
                <label class="setting-menu-label for-checkbox">使用浏览器 UA</label>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">Referer</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input referer-s" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">Headers</label>
              </div>
              <div class="setting-menu-value">
                <textarea class="setting-menu-input textarea-o headers-s" type="textarea" spellcheck="false"></textarea>
              </div>
            </div><!-- /.setting-menu-row -->
          </div><!-- /.setting-menu-body -->
          <div class="modal-footer">
            <div class="setting-menu-copyright">
              <div class="setting-menu-item">
                <label class="setting-menu-label">&copy; Copyright</label>
                <a class="setting-menu-link" href="https://github.com/acgotaku/115" target="_blank">雪月秋水</a>
                <label class="setting-menu-label">(Modified by hsu30)</label>
              </div>
              <div class="setting-menu-item">
                <label class="setting-menu-label">Version: ${this.version}</label>
                <label class="setting-menu-label">Update date: ${this.updateDate}</label>
              </div>
            </div><!-- /.setting-menu-copyright -->
            <div class="setting-menu-operate">
              <a class="setting-menu-button large-o blue-o" id="apply" href="javascript:void(0);">应用</a>
              <a class="setting-menu-button large-o" id="reset" href="javascript:void(0);">重置</a>
            </div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', setting)

    const settingMenu = document.querySelector('#settingMenu')
    this.elements = {
      settingMenu: settingMenu,
      close: settingMenu.querySelector('.modal-close'),
      message: settingMenu.querySelector('#message'),
      addRPC: settingMenu.querySelector('#addRPC'),
      apply: settingMenu.querySelector('#apply'),
      reset: settingMenu.querySelector('#reset'),
      testAria2: settingMenu.querySelector('#testAria2'),
      configSync: settingMenu.querySelector('.configSync-s'),
      sha1Check: settingMenu.querySelector('.sha1Check-s'),
      vip: settingMenu.querySelector('.vip-s'),
      small: settingMenu.querySelector('.small-s'),
      interval: settingMenu.querySelector('.interval-s'),
      downloadPath: settingMenu.querySelector('.downloadPath-s'),
      userAgent: settingMenu.querySelector('.userAgent-s'),
      browserUserAgent: settingMenu.querySelector('.browser-userAgent-s'),
      referer: settingMenu.querySelector('.referer-s'),
      headers: settingMenu.querySelector('.headers-s')
    }

    this.elements.close.addEventListener('click', () => {
      this.elements.settingMenu.classList.remove('open-o')
      this.resetSetting()
    })

    this.elements.addRPC.addEventListener('click', () => {
      const rpcDOMList = this.elements.settingMenu.querySelectorAll('.rpc-s')
      const RPC = `
        <div class="setting-menu-row rpc-s">
          <div class="setting-menu-name">
            <input class="setting-menu-input name-s" spellcheck="false" placeholder="名称">
          </div>
          <div class="setting-menu-value">
            <input class="setting-menu-input url-s" spellcheck="false" placeholder="示例: http://token:RPC密钥@127.0.0.1:6800/jsonrpc">
          </div>
        </div><!-- /.setting-menu-row -->`
      Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC)
    })

    this.elements.apply.addEventListener('click', () => {
      this.saveSetting()
      this.elements.message.innerText = '设置已保存'
    })

    this.elements.reset.addEventListener('click', () => {
      Store.trigger('clearConfigData')
      this.elements.message.innerText = '设置已重置'
    })

    this.elements.testAria2.addEventListener('click', () => {
      Core.getVersion(Store.getConfigData('rpcList')[0].url, this.elements.testAria2)
    })

    this.elements.browserUserAgent.addEventListener('change', () => {
      this.elements.userAgent.disabled = this.elements.browserUserAgent.checked
    })
  }

  resetSetting () {
    this.elements.message.innerText = ''
    this.elements.testAria2.innerText = '测试连接，成功显示版本号'
  }

  updateSetting (configData) {
    const { rpcList, configSync, sha1Check, vip, small, interval, downloadPath, userAgent, browserUserAgent, referer, headers } = configData
    // reset dom
    this.elements.settingMenu.querySelectorAll('.rpc-s').forEach((rpc, index) => {
      if (index !== 0) {
        rpc.remove()
      }
    })
    rpcList.forEach((rpc, index) => {
      const rpcDOMList = this.elements.settingMenu.querySelectorAll('.rpc-s')
      if (index === 0) {
        rpcDOMList[index].querySelector('.name-s').value = rpc.name
        rpcDOMList[index].querySelector('.url-s').value = rpc.url
      } else {
        const RPC = `
          <div class="setting-menu-row rpc-s">
            <div class="setting-menu-name">
              <input class="setting-menu-input name-s" value="${rpc.name}" spellcheck="false" placeholder="名称">
            </div>
            <div class="setting-menu-value">
              <input class="setting-menu-input url-s" value="${rpc.url}" spellcheck="false" placeholder="示例: http://token:RPC密钥@127.0.0.1:6800/jsonrpc">
            </div>
          </div><!-- /.setting-menu-row -->`
        Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC)
      }
    })
    this.elements.configSync.checked = configSync
    this.elements.sha1Check.checked = sha1Check
    this.elements.vip.checked = vip
    this.elements.small.checked = small
    this.elements.interval.value = interval
    this.elements.downloadPath.value = downloadPath
    this.elements.userAgent.value = userAgent
    this.elements.userAgent.disabled = browserUserAgent
    this.elements.browserUserAgent.checked = browserUserAgent
    this.elements.referer.value = referer
    this.elements.headers.value = headers

    this.mostRecentConfigData = configData
  }

  saveSetting () {
    const rpcDOMList = this.elements.settingMenu.querySelectorAll('.rpc-s')
    const rpcList = Array.from(rpcDOMList).map((rpc) => {
      const name = rpc.querySelector('.name-s').value
      const url = rpc.querySelector('.url-s').value
      if (name && url) {
        return { name, url }
      } else {
        return null
      }
    }).filter(el => el)
    const configSync = this.elements.configSync.checked
    const sha1Check = this.elements.sha1Check.checked
    const vip = this.elements.vip.checked
    const small = this.elements.small.checked
    const interval = this.elements.interval.value
    const downloadPath = this.elements.downloadPath.value
    const userAgent = this.elements.userAgent.value
    const browserUserAgent = this.elements.browserUserAgent.checked
    const referer = this.elements.referer.value
    const headers = this.elements.headers.value

    const configData = {
      rpcList,
      configSync,
      sha1Check,
      vip,
      small,
      interval,
      downloadPath,
      userAgent,
      browserUserAgent,
      referer,
      headers
    }
    Store.trigger('setConfigData', configData)
  }
}

export default new UI()

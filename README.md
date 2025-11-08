# 115Exporter [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ojafklbojgenkohhdgdjeaepnbjffdjf.svg)](https://chrome.google.com/webstore/detail/115exporter/ojafklbojgenkohhdgdjeaepnbjffdjf?hl=en)

## Sign in on Chrome

Use fake115 can Sign in on Chrome: https://github.com/kkHAIKE/fake115

## Usage

- Please click save button when change config.
- Recommended Settings:
    - Set `--rpc-secret=<secret>` if you are using aria2 1.18.4(or higher) with 'JSON-RPC PATH' like http://token:secret@hostname:port/jsonrpc
    - Set `--rpc-user=<username> --rpc-passwd=<passwd>` if you are using aria2 1.15.2(or higher) with 'JSON-RPC PATH' like http://username:passwd@hostname:port/jsonrpc
    - Use `http://localhost:6800/jsonrpc#max-connection-per-server=5&split=10` set download options for specific file.

## Install

* Chrome : Click **Settings** -> **Extensions**, drag `115.crx` file to the page, install it, or check **Developer mode** -> **Load unpacked extension**, navigate to the `release` folder.
* Firefox : Open **about:debugging** in Firefox, click "Load Temporary Add-on" and navigate to the `release` folder, select `manifest.json`, click OK.

## 變更日誌 (Changelog) - 修改版

此版本為基於原始專案的修改版，主要包含以下更新：

- **(優化)** 重構了設定介面(`ui.js`)以快取DOM元素，顯著減少重複查詢，提升回應速度。
- **(優化)** 優化了設定儲存邏輯(`store.js`)，使用單一`chrome.storage.set`操作取代多次操作，提升效能。
- **(重構)** 修改了設定介面(`ui.js`)，使其從清單檔(`manifest.json`)動態讀取擴充功能版本號。
- **(重構)** 移除了背景服務腳本(`background.js`)中不當使用`localStorage`的無效程式碼。
- **(修正)** **[MV3]** 更新了`manifest.json`的`host_permissions`，加入`<all_urls>`以修復在MV3規則下無法連線到使用者自訂Aria2 RPC伺服器的問題。
- **(修正)** 修正了`store.js`中一個導致從`chrome.storage.sync`同步的設定無法正確儲存到本地的錯誤。

## License

![GPLv3](https://www.gnu.org/graphics/gplv3-127x51.png)

115Exporter is licensed under [GNU General Public License](https://www.gnu.org/licenses/gpl.html) Version 3 or later.

115Exporter is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

115Exporter is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with 115Exporter.  If not, see <http://www.gnu.org/licenses/>.
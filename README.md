# Overwatch2 スコアボードオーバーレイ

![操作の様子](./img/ow2scoreboard.gif)

## 機能

* 各ロール（タンク，DPS，サポート）ごとの戦績とレートの表示と管理が可能
* 各ロールの表示切替が可能
* 一度アプリを閉じても再度起動すればスコアを復元可能
* スコアの最終更新日時が表示されるので，更新したかわからなくなった時の判断材料として使えます

## 内容

|コントローラー|オーバーレイ|
|---|---|
|<img src="./img/controller.png" alt="コントローラーの画像" width="800">|<img src="./img/view.png" alt="オーバーレイの画像" width="800">|

## 導入手順

1. こちらの[リリースページ](https://github.com/Lait-au-Cafe/ow2scoreboard/releases)から最新版の **ow2scoreboard_Setup_バージョン番号.zip** をダウンロードして解凍
2. OBSで **web/index.html** をブラウザソースとして1500×650程のサイズでキャプチャ
3. **ow2scoreboard Setup バージョン番号.exe** を実行してコントローラーをインストールおよび起動

> **Note**
> コントローラーのショートカットなどは作成されないため，最初の起動時にピン止めをしたりショートカットを作成しておくと便利です．忘れた場合にはもう一度 **ow2scoreboard Setup バージョン番号.exe** を実行すれば開けます．
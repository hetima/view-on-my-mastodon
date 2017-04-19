# View on my Mastodon

他インスタンスの「リモートフォロー」ボタンを「自分のインスタンスに移動して見る」ボタンに変更する Mastodon 用 Userscript です。

![screenshot.png](screenshot.png)

## How to use

Chrome と Safari は [Tampermonkey](http://tampermonkey.net/) をインストールしてください。Firefox (Greasemonkey) では動作確認していません。

まずログインしているインスタンスの設定画面(/settings/preferences)に移動し、右上に現れる「Use XX as default instance」をチェックしてください。  
すると他インスタンスの「リモートフォロー」ボタンが「View on XX」に変わります。クリックすると自分のインスタンスのダッシュボードに移動してユーザーを表示します。
実行時に XMLHttpRequest の許可を求めてくるので Always allow domain してください。

## License
WTFPL

## Author
hetima
https://pawoo.net/@hetima
https://twitter.com/hetima

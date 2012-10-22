// WebSocketサーバに接続
var ws = new WebSocket('ws://172.16.145.136:8888/');

// エラー処理
ws.onerror = function(e){
  $('#chat-area').empty()
    .addClass('alert alert-error')
    .append('<button type="button" class="close" data-dismiss="alert">×</button>',
      $('<i/>').addClass('icon-warning-sign'),
      'サーバに接続できませんでした。'
    );
}

// ユーザ名をランダムに生成
var userName = 'ゲスト' + Math.floor(Math.random() * 100);
// チャットボックスの前にユーザ名を表示
$('#user-name').append(userName);

// WebSocketサーバ接続イベント
ws.onopen = function() {
  $('#textbox').focus();
  // 入室情報を文字列に変換して送信
  ws.send(JSON.stringify({
    type: 'join',
    user: userName
  }));
};

// メッセージ受信イベントを処理
ws.onmessage = function(event) {
  // 受信したメッセージを復元
  var data = JSON.parse(event.data);
  var item = $('<li/>').append(
    $('<div/>').append(
      $('<i/>').addClass('icon-user'),
      $('<small/>').addClass('meta chat-time').append(data.time))
  );

  // pushされたメッセージを解釈し、要素を生成する
  if (data.type === 'join') {
    item.addClass('alert alert-info')
    .prepend('<button type="button" class="close" data-dismiss="alert">×</button>')
    .children('div').children('i').after(data.user + 'が入室しました');
  } else if (data.type === 'chat') {
    item.addClass('well well-small')
    .append($('<div/>').text(data.text))
    .children('div').children('i').after(data.user);
  } else if (data.type === 'defect') {
    item.addClass('alert')
    .prepend('<button type="button" class="close" data-dismiss="alert">×</button>')
    .children('div').children('i').after(data.user + 'が退室しました');
  } else {
    item.addClass('alert alert-error')
    .children('div').children('i').removeClass('icon-user').addClass('icon-warning-sign')
      .after('不正なメッセージを受信しました');
  }
  $('#chat-history').prepend(item).hide().fadeIn(500);
};


// 発言イベント
textbox.onkeydown = function(event) {
  // エンターキーを押したとき
  if (event.keyCode === 13 && textbox.value.length > 0) {
    ws.send(JSON.stringify({
      type: 'chat',
      user: userName,
      text: textbox.value
    }));
    textbox.value = '';
  }
};

// ブラウザ終了イベント
window.onbeforeunload = function () {
  ws.send(JSON.stringify({
    type: 'defect',
    user: userName,
  }));
};

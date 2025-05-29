/*
------------------------------------------------------------------------
Copyright 2024 Sony Semiconductor Solutions Corp. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
------------------------------------------------------------------------
*/
const translations = {
  language: "Japanese",
  version: "2.0.0",
  app_title: "画角調整ツール",
  camera: "カメラ",

  //TopPage
  top_page: {
    para_1: "下記の施設をご確認ください。",
    para_2: "確認したら、カメラのセットアップに進んでください。",
    facility_name: "施設名：",
    prefecture: "都道府県：",
    municipality: "市区町村：",
    error: "エラー：",
    qr_para_1: "エラー　有効な Web URLを含むQR コードを使用してアプリケーションを開いてください",
    qr_para_2: "認証に失敗しました",
    confirm_facility: "施設を確認する",
    loader_text: "権限の確認",
  },

  //ErrorPage
  error_page: {
    error_msg_1: "問題が発生しました。再度最初からやり直してください。",
    error_btn: "トップに戻る",
  },

  // Error Codes and Messages
  error_code: {
    "ERR_NETWORK": "ネットワーク接続を確認して、もう一度試してください。",
    10000: "再試行して問題が解決しない場合は管理者に問い合わせてください。",
    10002: "レビューはすでに別のユーザによって送信されています",
    10003: "レビューは管理者によってすでに承認されています",
    40001: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40002: "撮影画像の送信に失敗しました",
    40003: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40004: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    40005: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    40006: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    40008: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    40010: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    40011: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    40101: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40102: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40103: "QRコードの有効期限が切れています。有効なQRコードをスキャンしてください",
    40104: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40105: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40106: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40108: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40301: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    40302: "レビューは管理者によってすでに承認されています",
    40401: "不明なエラーです。管理者にお問い合わせください。",
    40402: "画像ファイルが見つかりません",
    40403: "不明なエラーです。管理者にお問い合わせください。",
    40404: "不明なエラーです。管理者にお問い合わせください。",
    40405: "この施設に対応しているカメラはありません",
    40406: "画像タイプが見つかりません",
    40408: "QRコードが無効です。有効なQRコードをスキャンしてください",
    40409: "QRコードが無効です。有効なQRコードをスキャンしてください",
    50001: "撮影画像の取得に失敗しました。申し訳ありませんが、もう一度お試しください",
    50002: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    50003: "撮影画像の送信に失敗しました",
    50004: "撮影画像の送信に失敗しました",
    50006: "撮影画像の取得に失敗しました。申し訳ありませんが、もう一度お試しください",
    50007: "申し訳ありませんが、サンプル画像の取得に失敗しました。",
    50008: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
    50009: "不明なエラーです。もう一度お試しください。",
    50011: "再試行して問題が解決しない場合は管理者に問い合わせてください。",
    50014: "再試行して問題が解決しない場合は管理者に問い合わせてください。",
    50301: "サーバーに接続できません。しばらくしてからもう一度お試しください",
    50401: "申請がタイムアウトしました。申し訳ありませんが、もう一度お試しください",
  },

  //Page not found
  page_not_found: "ページが見つかりません。",

  //HeaderPage
  header: {
    step1_p1: "ステップ1",
    step1_p2: "施設を確認する",
    step2_p1: "ステップ2",
    step2_p2: "カメラの選択",
    step3_p1: "ステップ3",
    step3_p2: "画角の確認",
    step4_p1: "ステップ4",
    step4_p2: "承認 完了",
  },

  // DevicesPage
  devices_page: {
    facility_name: "施設名：",
    all: "全て",
    toDo: "To Do",
    inReview: "申請中",
    completed: "設置完了",
    setup: "選択",
    refresh_devices: "更新",
    no_devices: "カメラが見つかりません",
  },

  //ImageConfirmationPage
  image_confirmation_page: {
    facility_img: "カメラ画像",
    show_grid_lines: "グリッド線を表示",
    close: "閉じる",
    single_capture: "撮影",
    interval_capture: "連続撮影",
    reacquisition_img: "画像の再取得",
    review_comment: "レビューコメント",
    title_chk_angle_view: "画角の確認",
    chk_list_1: "以下のサンプル画角に近しい画角になっていますか？",
    chk_list_2:
      "ポップなどの障害物が映り込んでいませんか？（映り込みは施設管理者にお願いしてずらしてもらうか、カメラの設置位置を調整してください）",
    chk_list_3:
      "天井や障害物などは除外し、可能な限り人が映る範囲を広く確保していますか？",
    chk_list_4: "画角が床面に対して水平になっていますか？",
    facility_sample_img: "サンプル画像",
    report_btn: "この画角を報告する",
  },

  //ReviewStatusPage
  review_status_page: {
    des1: "画角を確認中",
    des2_p1: "本部にて、画角を確認中です",
    des2_p2: "完了するまでしばらくお待ちください。",
    approval_des1_p1: "申請を承認しました",
    approval_des1_p2: "お疲れ様でした！",
    reject_des1_p1: "画角確認を実施しました",
    reject_des1_p2: "画角調整をお願いします",
    failed_des1_p1: "レビュー処理に失敗しました",
    failed_des1_p2: "もう一度お試しするか、管理者にお問い合わせください。",
    reject_retry: "画角を調整する",
    setup_another_cam: "別のカメラをセットアップする",
    go_to_home: "トップに戻る",
  },
};
export default translations;

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
    version: "v1.0.0-RC",
    appTitle: "画角調整ツール (管理者)",
    appTitleShort: "AAT (管理者)",

    // Navigator
    navigator: {
        logOut: "ログアウト",
    },

    // Sidebar
    sidebar: {
        dashboard: "ダッシュボード",
        reviewRequest: "申請",
        consoleConfiguration: "コンソール設定",
        editConfiguration: "コンソール設定の編集",
    },

    // Dashboard Page
    dashboardPage: {
        applicationList: "申請一覧",
        thereAre: "保留中の申請 ",
        pendingApplications: " 件 ",
        thereHaveBeen: " ",
        applicationsInLast: " 件の申請が過去",
        minutes: " 分間にあり",
        showing: " ",
        items: " ",
        outOf: " / ",
        returnToTop: "先頭に戻る",

        // Filter
        customerName: "顧客名",
        noCustomerFound: "顧客なし",
        prefectures: "都道府県",
        select: "--アイテムを選択--",
        selectMultiple: "--アイテムを選択--",
        municipalities: "市区町村",
        searchByFacilityName: "施設名から探す",
        enterText: "入力",
        applicationStatus: "申請状況",
        filterModifiedInfo: "フィルターが変更されました。 「検索」をクリックして最新の結果を表示します。",
        search: "検索",
        clear: "クリア",

        // Table
        slNo: "No",
        facilityName: "施設名",
        facilityType: "施設タイプ",
        deviceName: "デバイス名",
        deviceId: "デバイスID",
        deviceConnectionStatus: "デバイス接続状態",
        deviceApplicationStatus: "申請状況",
        applicationDateTime: "申請日時",
        reviewDateTime: "回答日時",
        angleConfirmation: "画角確認",
        details: "詳細",
        noData: "該当するデータはありませんでした",
    },

    // Review Request Page
    reviewRequestPage: {
        viewHistory: "履歴を見る",
        facilityName: "施設名",
        facilityCameraImage: " 施設カメラ映像",
        cameraDeviceName: "カメラ（デバイス名）",
        deviceId: "デバイスID",
        imageDateTime: "画像取得日時",
        applicationDateTime: "申請日時",
        reviewDateTime: "回答日時",
        facilityPattern: "パターン",
        notSubmitted: "請負業者は画像を提出していません。",
        submittedImage: "申請された画像",
        submittedImageNotFound: "請負業者が提出した画像が見つかりません。",
        referenceImage: "参考画像",
        referenceImageNotFound: "参照画像が見つかりません。",
        approve: "承認",
        reject: "却下",
        adviceForContractors: "施工業者へのアドバイス",
        approveSuccess: "レビューの承認が成功しました。",
        rejectSuccess: "レビュー拒否が成功しました。",
    },

    // Review History Page
    reviewHistoryPage: {
        reviewsHistory: "レビュー履歴",
        slNo: "No",
        deviceApplicationStatus: "申請状況",
        applicationStatus: "申請状況",
        applicationDateTime: "申請日時",
        reviewDateTime: "回答日時",
        reviewImage: "申請画像",
        reviewComment: "レビューコメント",
    },

    // Console Configuration Page
    consoleConfigurationPage: {
        configurationList: "設定",
        slNo: "No",
        customerName: "顧客名",
        lastUpdatedBy: "最終更新者",
        lastUpdatedAt: "最終更新日",
        action: "アクション",
        edit: "編集",
    },

    // Edit Configuration Page
    editConfigurationPage: {
        // Form
        customerName: "顧客名",
        clientId: "クライアント ID",
        clientSecret: "クライアント シークレット",
        baseUrl: "Console エンドポイント",
        baseUrlExample: "https://console.aitrios.sony-semicon.com/api/v1",
        authUrl: "認証URL",
        aitriosDeveloperEdition: "AITRIOS Developer Edition",
        authUrlDeveloperExample: "https://auth.aitrios.sony-semicon.com/oauth2/default/v1/token",
        portalEndpoint: "名称: Portal Endpoint",
        aitriosEnterpriseEdition: "AITRIOS Enterprise Edition",
        authUrlEnterpriseExample: "https://login.microsoftonline.com/<TENANT_ID>",
        changeTenantId: "<TENANT_ID> を変更してください",
        example: "例: ",
        applicationId: "Application ID",
        applicationIdNote: "Application ID は AITRIOS がエンタープライズ版の場合にのみ必要です",
        save: "保存",
        reset: "リセット",
        credentialsUpdated: "コンソールの認証情報が正常に更新されました。",
        // Tips
        tip: "参照: ",
        aitriosPortal: "AITRIOS Portal",
        project: "プロジェクト",
        projectManagement: "プロジェクト管理",
        clientAppManagement: "クライアントアプリ管理",
        clientApp: "クライアントアプリ",
        createNewIfDoesnotExist: "存在しない場合は新規作成",
        visibleOnlyOnceWhenCreated: "作成時に一度だけ表示されます",
    },

    // Login Page
    loginPage: {
        loginId: "ログインID",
        pass: "パスワード",
        login: "ログイン",
    },

    // Prefectures Dropdown
    prefecturesList: [
        "北海道",
        "青森県",
        "岩手県",
        "宮城県",
        "秋田県",
        "山形県",
        "福島県",
        "茨城県",
        "栃木県",
        "群馬県",
        "埼玉県",
        "千葉県",
        "東京都",
        "神奈川県",
        "新潟県",
        "富山県",
        "石川県",
        "福井県",
        "山梨県",
        "長野県",
        "岐阜県",
        "静岡県",
        "愛知県",
        "三重県",
        "滋賀県",
        "京都府",
        "大阪府",
        "兵庫県",
        "奈良県",
        "和歌山県",
        "鳥取県",
        "島根県",
        "岡山県",
        "広島県",
        "山口県",
        "徳島県",
        "香川県",
        "愛媛県",
        "高知県",
        "福岡県",
        "佐賀県",
        "長崎県",
        "熊本県",
        "大分県",
        "宮崎県",
        "鹿児島県",
        "沖縄県"
    ],

    // Application Status
    statusList: {
        initialState: "未申請",
        requesting: "申請中",
        rejected: "却下",
        approved: "承認",
    },

    // Error messages
    errorCodes: {
        ERR_NETWORK: "ネットワーク接続を確認して、もう一度試してください。",
        10000: "予期しない問題が発生しましたもう一度試してください",
        10001: "文字数制限の 255字に達しました",
        40004: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40005: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40006: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40007: "レビューを却下する場合は理由を記載してください",
        40008: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40009: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40010: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40107: "ログインIDまたはパスワードが無効です",
        40301: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40303: "現在のレビューが最新ではないため、レビューの承認に失敗しました",
        40304: "現在のレビューが最新ではないため、レビューの却下に失敗しました",
        40305: "無効なクライアントID、クライアントシークレット、認証URLが入力されました",
        40306: "無効なクライアントID、クライアントシークレット、認証URL、Application IDが入力されました",
        40307: "Console エンドポイント が無効です",
        40308: "コンソールの資格情報の検証に失敗しました",
        40401: "施設が見つかりません",
        40402: "画像ファイルが見つかりません",
        40403: "カメラが見つかりません",
        40404: "レビューが見つかりませんでした",
        40407: "顧客が見つかりません",
        50002: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        50008: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        50009: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        50010: "申請された画像の読み込みに失敗しました",
        50011: "デバイスの接続状態が確認できません。コンソールの資格情報を確認してください",
        50301: "サーバーに接続できません。しばらくしてからもう一度お試しください",
        50401: "申請がタイムアウトしました。申し訳ありませんが、もう一度お試しください",
    }
}

export default translations

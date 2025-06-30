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
    version: "v2.1.0",
    appTitle: "画角調整ツール (管理者)",
    appTitleShort: "AAT (管理者)",

    // Sidebar
    sidebar: {
        dashboard: "ダッシュボード",
        reviewRequest: "申請",
        settings: "設定",
        addCustomer: "顧客を追加",
        editCustomer: "顧客を編集",
        generateQr: "QRコード生成",
        manageDevices: "デバイス管理",

        // Account
        account: {
            title: "アカウント",
            logout: "ログアウト",
        },

        // Admin
        admin: {
            title: "管理者",
            addAdmin: "管理者を追加",
        },
    },

    addAdmin: {
        title: "管理者を追加",
        loginId: "ログインID",
        pass: "パスワード",
        createAdmin: "管理者を作成",
        success: "管理者の作成に成功しました。",
        saveNote: "重要: ログインIDとパスワードは今後表示されないため、必ずコピーしてください！",
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
        select: "--アイテムを選択--",
        prefecture: "都道府県",
        municipality: "市区町村",
        facilityName: "施設名",
        enterText: "入力",
        applicationStatus: "申請状況",
        filterModifiedInfo: "フィルターが変更されました。 「検索」をクリックして最新の結果を表示します。",
        search: "検索",
        clear: "クリア",

        // Table
        slNo: "No",
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
        moreItemsInNextPage: "次のページにさらにアイテムがあります...",

        // View Tab
        list: "リスト",
        tiled: "タイル",
        small: "小",
        medium: "中",
        large: "大",
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
        referenceImage: "参考画像",
        failedToLoadImage: "画像の読み込みに失敗しました",
        showGridLines: "グリッド線を表示",
        preserveAspectRatio: "アスペクト比を維持",
        close: "閉じる",
        approve: "承認",
        reject: "却下",
        adviceForContractors: "施工業者へのアドバイス",
        approveSuccess: "レビューの承認が成功しました。",
        rejectSuccess: "レビュー拒否が成功しました。",

        // Adjust submitted image
        updateReferenceImage: "参考画像を更新する",
        restoreReferenceImage: "参考画像を元に戻す",
        adjustSubmittedImage: "送信した画像を調整し、参考画像として保存する",
        editHere: "ここで編集",
        updateReferenceImageNote: "参考画像を更新すると、申請の承認は無効になります。申請が却下された場合、現在の参考画像は完全に上書きされます。",
        cancel: "キャンセル",
        adjustToMatchSampleImage: "サンプル画像のようにカメラの画角を調節してください。",

        // Delete reviews
        delete: "削除",
        deleteReviews: "レビューを削除",
        deleteReviewsConfirm: "以下に関連付けられたすべてのレビューを削除してもよろしいですか: ",
        deleteReviewsSuccess: "レビューは正常に削除されました",
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

    // Settings Page
    settingsPage: {
        settings: "設定",
        customerList: "顧客一覧",
        slNo: "No",
        customerName: "顧客名",
        lastUpdatedBy: "最終更新者",
        lastUpdatedAt: "最終更新日",
        actions: "アクション",
        addCustomer: "顧客を追加",
        editCustomer: "顧客を編集",
        manageDevices: "デバイス管理",
        generateQr: "QRコード生成",
        edit: "編集",
        exportData: "データをエクスポート",
        importData: "データをインポート",
        noData: "ツール使用のために顧客を追加してください",
    },

    // Export Data
    exportData: {
        title: "データをエクスポート",
        description: "これにより、管理者や顧客に関連付けられたデバイスや施設、それぞれのタイプ、参照画像がエクスポートされます。",
        note: "注：デバイスに関連するレビューはエクスポートされません。",
        buttons: {
            cancel: "キャンセル",
            export: "エクスポート",
        },
        success: "データのエクスポートに成功しました。",
        errors: {
            exportFailed: "データのエクスポートに失敗しました。もう一度お試しください。",
        },
    },

    // Import Data
    importData: {
        title: "データをインポート",
        note: "注：データをインポートすると、レビューを含むすべての既存データが上書きされます。インポートするデータは、エクスポートしたデータと同じフォーマットでなければなりません。",
        labels: {
            importJsonFile: "JSONファイルのインポート",
        },
        buttons: {
            cancel: "キャンセル",
            import: "インポート",
        },
        success: "データのインポートに成功しました。",
        errors: {
            noFileSelected: "ファイルを選択してください。",
            invalidFileType: "無効なファイル形式です。JSON形式のファイルを選択してください。",
            importFailed: "データのインポートに失敗しました。ファイルを検証して、もう一度やり直してください。",
        },
    },

    // Console Credentials Page
    consoleCredentialsPage: {
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
        next: "次へ",
        credentialsUpdated: "コンソールの認証情報が正常に更新されました。",
        customerCreated: "お客様が正常に作成されました。",
        // Tips
        tip: "参照: ",
        aitriosPortal: "AITRIOS Portal",
        project: "プロジェクト",
        projectManagement: "プロジェクト管理",
        clientAppManagement: "クライアントアプリ管理",
        clientApp: "クライアントアプリ",
        createNewIfDoesnotExist: "存在しない場合は新規作成",
        visibleOnlyOnceWhenCreated: "作成時に一度だけ表示されます",
        noChanges: "変更がありません。保存するものはありません。",
    },

    generateQR: {
        title: "QRコード生成",
        customerName: "顧客名",
        facilities: "施設",
        selectCustomer: "顧客を選択してください",
        selectFacilities: "施設を選択",
        selectAll: "すべて選択",
        note: "注意：QRコードの有効期限は、施設の有効開始日時から終了日時までとなります。変更が必要な場合は「デバイス管理」から修正してください。",
        generateAndDownload: "生成とダウンロード",
        errors: {
            fetchFacilities: "施設情報の取得に失敗しました",
            loadFacilities: "施設の読み込みに失敗しました",
            generateQR: "QRコードの生成に失敗しました"
        },
        buttons: {
            cancel: "キャンセル",
            generate: "生成とダウンロード"
        }
    },

    // Manage Devices Page
    manageDevicesPage: {
        refreshDeviceList: "デバイス一覧を更新",
        selectCustomer: "顧客を選択してください",
        editSelectedDevices: "一括編集",
        deregisterSelectedDevices: "デバイス登録解除",
        cancel: "キャンセル",
        saveSelectedDevices: "デバイス登録/更新",
        noDevicesFound: "デバイスが見つかりません",
        deviceList: "デバイス一覧",
        facility: "施設",
        deviceType: "デバイスタイプ",
        group: "グループ",
        status: "ステータス",
        registered: "登録済み",
        notRegistered: "未登録",
        createDeviceType: "デバイスタイプを作成",
        updateDeviceType: "デバイスタイプを更新",
        selectFacility: "施設を選択",
        selectDeviceType: "デバイスタイプを選択",
        deregisterSuccess: "デバイス登録の解除に成功しました",
        saveSuccess: "デバイス登録と更新に成功しました",
        errors: {
            noCustomerFound: "顧客が見つかりません",
            noCustomerSelected: "顧客が選択されていません",
            deviceFetchFailed: "デバイスデータの取得に失敗しました",
            facilityFetchFailed: "施設情報の取得に失敗しました",
            deviceTypeFetchFailed: "デバイスタイプの取得に失敗しました",
            facilityUpdateFailed: "施設の更新に失敗しました",
            deviceTypeUpdateFailed: "デバイスタイプの変更に失敗しました",
            editFailed: "デバイスの一括編集に失敗しました",
            deregisterFailed: "デバイス登録の解除に失敗しました",
            saveFailed: "デバイス登録と更新に失敗しました",
            saveNotAllowed: "登録と更新ができません。施設名とデバイスタイプが空欄のものは選択しないでください",
            deregisterNotAllowed: "登録を解除できません。未登録デバイスを選択しないでください",
        }
    },

    deviceTable: {
        // テーブルヘッダー
        deviceName: "デバイス名",
        deviceId: "デバイスID",
        facilityName: "施設名",
        deviceType: "デバイスタイプ",
        findOrCreate: "検索または作成...",
        status: "ツールへの登録状況",
        statusShort: "登録状況",
        group: "グループ",

        // ステータス表示
        registered: "登録済み",
        notRegistered: "未登録",

        // 更新中の表示
        updating: "更新中...",

        // Autocomplete関連
        createNew: "新規作成",
        editFacility: "施設を編集",
        editDeviceType: "デバイスタイプを編集",
        selectFacility: "施設を選択",
        selectDeviceType: "デバイスタイプを選択",
        noFacilitiesFound: "施設が見つかりません",
        noDeviceTypesFound: "デバイスタイプが見つかりません",

        // モーダル関連
        closeModal: "閉じる",
        cancel: "キャンセル",
        save: "保存",

        // エラーメッセージ
        errorUpdatingFacility: "施設の更新中にエラーが発生しました",
        errorUpdatingDeviceType: "デバイスタイプの更新中にエラーが発生しました",
    },

    selectWithAddAndEdit: {
        add: "追加",
        edit: "編集",
    },

    facility: {
        // モーダル関連
        submitting: "送信中...",
        updateFacility: "施設を更新",
        createFacility: "施設を作成",
        closeModal: "閉じる",
    },

    // facilityForm セクションを追加
    facilityForm: {
        editTitle: "施設を編集",
        addTitle: "施設を追加",
        customerName: "顧客名",
        facilityName: "施設名",
        facilityType: "施設タイプ",
        prefecture: "都道府県",
        municipality: "市区町村",
        effectiveStartDate: "有効開始日時",
        effectiveEndDate: "有効終了日時",
        failedToAddFacilityType: "施設タイプの追加に失敗しました",
        failedToCreateFacility: "施設の作成に失敗しました",
        failedToUpdateFacility: "施設の更新に失敗しました",
        selectFacilityType: "施設タイプを選択",
        updateFacility: "施設を更新",
        createFacility: "施設を作成",
        closeModal: "閉じる",
        findOrCreate: "検索または作成...",
        noChanges: "変更がありません。保存するものはありません。",
    },
    facilityType: {
        addTitle: "施設タイプを追加",
        typeName: "施設タイプ名",
        add: "追加",
        errors: {
            required: "施設タイプ名は必須です。",
            createFailed: "施設タイプの作成に失敗しました。",
        }
    },

    addDeviceType: {
        deviceTypeName: "デバイスタイプ名",
        referenceImage: "参考画像",
        note: "注意：画像は.jpg、.jpeg、または.png形式で、ファイルサイズは1MB以下にしてください。",
        errors: {
            invalidFileType: "無効なファイル形式です。JPGまたはPNG形式のファイルをアップロードしてください。",
            fileTooLarge: "ファイルサイズが1MBを超えています。",
            requiredImage: "参考画像は必須です。",
            requiredName: "デバイスタイプ名は必須です。",
            createFailed: "デバイスタイプの作成に失敗しました。",
            updateFailed: "デバイスタイプの更新に失敗しました。"
        },
        modal: {
            addTitle: "デバイスタイプを追加",
            editTitle: "デバイスタイプを編集",
            addButton: "追加",
            editButton: "保存"
        }
    },

    deviceType: {
        add: {
            title: "デバイスタイプを追加",
            button: "追加"
        },
        edit: {
            title: "デバイスタイプを編集",
            button: "保存"
        }
    },

    editDevices: {
        title: "選択したデバイスを一括編集",
        facilityName: {
            label: "施設名",
            placeholder: "施設を検索または作成",
            noFacilities: "利用可能な施設がありません"
        },
        deviceType: {
            label: "デバイスタイプ",
            placeholder: "デバイスタイプを検索または作成"
        },
        buttons: {
            cancel: "キャンセル",
            apply: "適用"
        },
        errors: {
            invalidProps: "無効なプロパティ: facilities と deviceTypes は配列である必要があります"
        }
    },

    deregisterDevices: {
        title: "デバイスの登録解除",
        message: "{{customerName}}にあるこれらのデバイスの登録を解除してよろしいですか?",
        buttons: {
            deregister: "登録解除",
            cancel: "キャンセル",
        },
        note: "注：登録を解除するとこれまでのレビューの記録は削除されます。",
    },

    // Login Page
    loginPage: {
        loginId: "ログインID",
        pass: "パスワード",
        login: "ログイン",
    },

    // Invalid Page
    invalidPage: {
        pageNotFound: "ページが見つかりません。",
        reviewHistoryNotFound: "デバイスのレビュー履歴が見つかりません。",
        returnToDashboard: "リクエストされたページは存在しません。ダッシュボードに戻ってください。",
    },

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
        10002: "文字数制限の 127字に達しました",
        10003: "スペース、ハイフン、アンダースコア以外の特殊文字は使えません",
        10004: "入力は有効なURL形式である必要があります。",
        10005: "無効な入力です。値を確認してください。",
        10006: "ハイフン、アンダースコア以外の特殊文字は使えません",
        10007: `1. パスワードは8文字以上である必要があります。
                2. パスワードには以下のカテゴリの文字を3つ含める必要があります:
                    - 小文字 (a-z)
                    - 大文字 (A-Z)
                    - 数字 (0-9)
                    - 特殊文字 (_, -, !, $, #, %, @)
                3. パスワードにはスペースを含めることはできません。`,
        40004: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40005: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40006: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40007: "レビューを却下する場合は理由を記載してください",
        40008: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40009: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40010: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40015: "顧客名はすでに使用されています。別の名前を選択してください",
        40016: "ログインIDはすでに使われています。別のログインIDを選択してください",
        40107: "ログインIDまたはパスワードが無効です",
        40301: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        40303: "現在のレビューが最新ではないため、レビューの承認に失敗しました",
        40304: "現在のレビューが最新ではないため、レビューの却下に失敗しました",
        40305: "無効なクライアントID、クライアントシークレット、認証URLが入力されました",
        40306: "無効なクライアントID、クライアントシークレット、認証URL、Application IDが入力されました",
        40307: "Console エンドポイント が無効です",
        40308: "コンソールの資格情報の検証に失敗しました",
        40309: "無効なクライアントIDです",
        40310: "無効なクライアンシークレットです",
        40401: "施設が見つかりません。",
        40402: "画像ファイルが見つかりません。",
        40403: "カメラが見つかりません。",
        40404: "レビューが見つかりませんでした。",
        40407: "顧客が見つかりません。",
        50002: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        50008: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        50009: "処理中にエラーが発生しました。申し訳ありませんが、もう一度お試しください",
        50010: "申請された画像の読み込みに失敗しました",
        50011: "デバイスの接続状態が確認できません。コンソールの資格情報を確認してください",
        50013: "コンソール認証情報の取得中にエラーが発生しました",
        50301: "サーバーに接続できません。しばらくしてからもう一度お試しください",
        50401: "申請がタイムアウトしました。申し訳ありませんが、もう一度お試しください",
    }
}

export default translations

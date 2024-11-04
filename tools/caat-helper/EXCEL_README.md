#### Table of Contents of excel file
- [Table of Contents of excel file](#table-of-contents-of-excel-file)
- [Sheet1: admin](#sheet1-admin)
  - [Description](#description)
- [Sheet2: facility\_type](#sheet2-facility_type)
  - [Description](#description-1)
- [Sheet3: customer](#sheet3-customer)
  - [Description](#description-2)
- [Sheet4: device\_type](#sheet4-device_type)
  - [Description](#description-3)
- [Sheet5: facility](#sheet5-facility)
  - [Description](#description-4)
- [Sheet6: device](#sheet6-device)
  - [Description](#description-5)


#### Sheet1: admin
##### Description
The `admin` sheet contains following columns.

| **Columns**      | login_id  | admin_password  |
|---------------|----------------|-------------|
| **Description** | **Mandatory field**</br> The unique ID (this column should contain unique values) from which admin can use it for login in Admin app. | **Mandatory field**</br> The admin password to login to the admin app. 
|**Character details** | English AlphaNumeric characters without Space and Japanese Characters except `。` are supported.     <br> Allowed Special characters are Hyphen `-`, Underscore `_`. <br> Length: 1-255 characters. | Verify password has: <br> 1. Length: 8-255 characters. <br> 2. Contains letter from any of 3 categories <br>     a. Lowercase (a-z) <br>     b. Uppercase (A-Z) <br>     c. Digits (0-9) <br>     d. Special Characters (`_`, `-`, `!`, `$`, `#`, `%`, `@`) <br> 3. No space allowed. <br>
| **Sample Values** | test-caat-dev  | ajatmd11Arug500TAeCne |

> *  These Admin login_id and admin_password will be the credentials to login to Admin App.
> * Admin are created to manage customers.
> * One admin can manage multiple customers.
> * Multiple admins cannot manage single customer.

#### Sheet2: facility_type
##### Description
The `facility_type` sheet contains following columns.


| **Coloumn** | name       |
|------------|-------------|
|**Description** | **Mandatory field**</br> Contains the facility type name. |
|**Character details**  | English AlphaNumeric characters and Japanese Characters except `。` are supported.<br> Allowed Special characters are Space, Hyphen `-`, Underscore `_`.<br> Length: 1-127 Characters
| **Sample Values** | Parking_Type1    |

> * Facility Type table is to declare the types of facilities that customer may have.
> * E.g., Parking_Type1, Convenience Store, Garage, Supermarket are few different facility types.

#### Sheet3: customer
##### Description
The `customer` sheet contains following columns.

| **Column**       | customer_name  | admin_login_id | auth_url           | base_url          | client_id          | client_secret      | application_id                       |
|------------------|--------------------|--------------------|------------------------|-----------------------|------------------------|------------------------|------------------------------------------|
| **Description**  | **Mandatory field**</br> Customer name | **Mandatory field**</br> Verify admin login id is present in admin data | **Optional field**</br> Add a valid auth URL | **Optional field**</br> Add a valid base URL | **Optional field**</br> Add a valid client ID | **Optional field**</br> Add a valid client secret | **Optional field**</br> Verify application ID is in valid format |
|**Character details** | English AlphaNumeric characters and Japanese Characters except `。` are supported.<br> Allowed Special characters are Space, Hyphen `-`, Underscore `_`.<br> Length: 1-127 Characters |As mentioned in `admin` data |As supported in AITRIOS |As supported in AITRIOS |As supported in AITRIOS |As supported in AITRIOS |As supported in AITRIOS
| **Sample Values**| 顧客A        | test-caat-dev      | Example: </br> AITRIOS Developer Edition: </br> `https://auth.aitrios.sony-semicon.com/oauth2/default/v1/token` (Portal Endpoint) </br> AITRIOS Enterprise Edition: </br> `https://login.microsoftonline.com/TENANT_ID` (Change the TENANT_ID section) | Example: </br> https://console.aitrios.sony-semicon.com/api/v1 | aum12d4cp2jbcfl12112 | df457d4cp2jbcfl12154 | Empty for developer edition and `Application ID` in case of enterprise edition |

> * Customers are managed by SIer/Admin.
> * Each customer can be managed ONLY by a single Admin.
> * Usually, each customer will have one AITRIOS Project, AITRIOS Console subscription.
> * Customer may buy Developer edition or Enterprise edition of AITRIOS.
> * Obtain the console credentials from the AITRIOS portal (Developer edition) or AITRIOS representative (Enterprise edition).
> * Console credentials are required to fetch the angle of view from the camera while contractor is setting the camera at customer premise.
> * After adding the customer using caat-helper, updating the `admin_login_id` to that customer is not supported in caat-helper.
> * Optional fields in customer sheet can also be populated in Admin App (once the Database is populated).

#### Sheet4: device_type
##### Description
The `device_type` sheet contains following columns.

| **Column**      |       name      |        sample_image_path       |
|-----------------|------------------------------|----------------------------|
| **Description** | **Mandatory field**</br> Contains the device type name  | **Mandatory field**</br> Path to the sample image.
|**Character details**  | English AlphaNumeric characters and Japanese Characters except `。` are supported.<br> Allowed Special characters are Space, Hyphen `-`, Underscore `_`.<br> Length: 1-127 Characters | Make sure the images are present in the machine that run `caat-helper`.<br> Sample image extension can be `.jpeg` or `.jpg` or `.png`.<br> Mention the absolute path to the image.
| **Sample Values**|   GarageDevice      |  /path/to/sample-images/garage.jpeg |

> * Device Type table is to declare the types of devices that will be installed at customer' facilities(premise)
> * E.g., Device to be installed at the shop entry/exit, one near the cashier counter, one right in the middle of the shop.
> * Sample images are the images that will be displayed in contractor app as reference image  while contractor adjusts the camera angle.
> * This tool will only accept sample image data size up to 1MB.

#### Sheet5: facility
##### Description
The `facility` sheet contains following columns.

| **Column**        | facility_name | prefecture | municipality | effective_start_jst  | effective_end_jst  | customer_name  | facility_type  |
|-------------------|-------------------|----------------|------------------|-------------------------|-----------------------|--------------------|-------------------|
| **Description**   | **Mandatory field**</br> Add a valid facility name. | **Mandatory field**</br> Add the prefecture where the facility is located | **Mandatory field**</br> Add municipality to link to the facility | **Mandatory field**</br> Add start time and verify effective start time is a valid date and in the future | **Mandatory field**</br> Add end time and verify effective end time is a valid date and greater than effective start time | **Mandatory field**</br> Add customer name to link to the facility and verify the customer name exists in the customer sheet | **Mandatory field**</br> Mention the facility type and verify it is present in the facility_type sheet |
|**Character details**  | English AlphaNumeric characters and Japanese Characters except `。` are supported.<br> Allowed Special characters are Space, Hyphen `-`, Underscore `_`.<br> Length: 1-127 Characters | English AlphaNumeric characters and Japanese Characters except `。` are supported.<br> Allowed Special characters are Space, Hyphen `-`, Underscore `_`.<br> Length: 1-127 Characters | English AlphaNumeric characters and Japanese Characters except `。` are supported.<br> Allowed Special characters are Space, Hyphen `-`, Underscore `_`.<br> Length: 1-127 Characters |Accepted date time format:<br> `YYYY-MM-DDTHH:MM:SS+00:00`|Accepted date time format:<br> `YYYY-MM-DDTHH:MM:SS+00:00` |As mentioned in `customer` data |As mentioned in `facility_type` data
| **Sample Values** | パーキング1         | 神奈川県 | 厚木市           | 2024-06-28T09:00:00+00:00 |2024-12-14T09:00:00+00:0 | 顧客A            | Parking_Type1 |

* Regarding prefecture column, it should contain any value from following table.

| | | | | |
|---|---|---|---|---|
| 北海道 | 埼玉県 | 岐阜県 | 鳥取県 | 佐賀県 |
| 青森県 | 千葉県 | 静岡県 | 島根県 | 長崎県 |
| 岩手県 | 東京都 | 愛知県 | 岡山県 | 熊本県 |
| 宮城県 | 神奈川県 | 三重県 | 広島県 | 大分県 |
| 秋田県 | 新潟県 | 滋賀県 | 山口県 | 宮崎県 |
| 山形県 | 富山県 | 京都府 | 徳島県 | 鹿児島県 |
| 福島県 | 石川県 | 大阪府 | 香川県 | 沖縄県 |
| 茨城県 | 福井県 | 兵庫県 | 愛媛県 | |
| 栃木県 | 山梨県 | 奈良県 | 高知県 | |
| 群馬県 | 長野県 | 和歌山県 | 福岡県 | |

> * Facility belongs to a customer.
> * Each customer can have as many facilities as needed.
> * Facility table consists the details regarding the facility at which the cameras will be installed.
> * Facility will have attributes like, location details - Prefecture, Municipality
> * After adding the facility using caat-helper, updating the `customer_name` or `facility_type` to that facility is not supported in caat-helper.

#### Sheet6: device
##### Description
The `device` sheet contains following columns.


| **Column**       |     device_name     |                  device_id                | customer_name | facility_name |   device_type_name  |
|---------------------|-------------------|-------------------|---------------|---------------|-------------------|
| **Description**  | **Mandatory field**</br> Add a valid device name | **Mandatory field**</br> Add a valid device_id | **Mandatory field**</br> Add customer name to link to the device and verify the customer name is present in the customer sheet | **Mandatory field**</br> Add facility name to link to the facility and verify the facility name is present in the facility sheet | **Mandatory field**</br> Add device type name to link to the device type and verify device type name is present in the device type sheet
|**Character details**  | English AlphaNumeric characters and Japanese Characters except `。` are supported.<br> Allowed Special characters are Space, Hyphen `-`, Underscore `_`.<br> Length: 1-127 Characters |As supported in AITRIOS |As mentioned in `customer` data |As mentioned in `facility` data |As mentioned in `device_type` data
| **Sample Values** |  DEVICE_SZP123S_0001 |  Aid-00010004-0000-2000-0000-000000000000 |   顧客A |   パーキング1   |  GarageDevice   |

> * _device_name_ can be anything of user choice.
> * _device_id_ must match with the ID that is enrolled in AITRIOS Console.
> * It is assumed that the device is enrolled to AITRIOS before using the AAT application (by Contractor/Admin).
> * Device is linked to facility where it will be installed.
> * After adding the device using caat-helper, updating the `customer_name` or `facility_name` or `device_type_name`  to that device is not supported in caat-helper.
> * Following Edge AI Device types are supported:
>   * SZP123S-001
>   * AIH-lVRW2
>   * CSV26

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
import {
  Box,
  Button,
  Chip,
  Sheet,
  Table,
  Tooltip,
  Typography,
} from "@mui/joy";
import { InfoOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDatetime, statusToString } from "../../../utils";
import { TableCell } from "../../../components/TableCell";
import { DeviceConnectionState } from "../../../components/DeviceConnectionState";

// Interface for table row in the ReviewsTable component
interface TableRow {
  id: number;
  aitriosName: string;
  serialNumber: string;
  facility: {
    name: string;
    type: string;
  };
  prefecture: string;
  municipality: string;
  latestReviewId: number;
  result: number;
  imageBlob: string;
  imageDate: string;
  requested: string;
  answered: string;
}

// Interface for mapping device status by device ID
interface DeviceStatusMap {
  [key: string]: string;
}

// Interface for ListView component properties
interface ListViewProps {
  data: TableRow[],
  deviceStatus: DeviceStatusMap | undefined,
  startIndex: number,
}

const TABLE_HEIGHT = "700px"; // Height of the table

export const ListView = ({ data, deviceStatus, startIndex }: ListViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const TABLE_HEADERS = [
    { label: t("dashboardPage.slNo"), width: "40px" },
    { label: t("dashboardPage.facilityName"), width: "90px" },
    { label: t("dashboardPage.facilityType"), width: "80px" },
    { label: t("dashboardPage.prefecture"), width: "90px" },
    { label: t("dashboardPage.municipality"), width: "120px" },
    { label: t("dashboardPage.deviceName"), width: "120px" },
    { label: t("dashboardPage.deviceId"), width: "220px" },
    { label: t("dashboardPage.deviceApplicationStatus"), width: "120px" },
    { label: t("dashboardPage.applicationDateTime"), width: "100px" },
    { label: t("dashboardPage.reviewDateTime"), width: "100px" },
    { label: t("dashboardPage.angleConfirmation"), width: "100px" },
  ];

  return (
    <Sheet
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: "sm",
        overflow: "auto",
        flexGrow: 1,
        height: TABLE_HEIGHT,
      }}
    >
      <Table
        stripe="2n"
        aria-labelledby="tableTitle"
        stickyHeader
        hoverRow
        sx={{
          "--Table-headerUnderlineThickness": "1px",
          "--TableCell-paddingY": "2px",
          "--TableCell-paddingX": "10px",
          "--TableCell-wordBreak": "break-all",
          "--TableRow-stripeBackground": "rgba(0 0 0 / 0.04)",
          "--TableRow-hoverBackground": "rgba(0 0 0 / 0.08)",
        }}
      >
        <thead>
          <tr style={{ justifyContent: "center", alignItems: "center" }}>
            {TABLE_HEADERS.map(({ label, width }, index) => (
              <th
                key={label}
                style={{
                  width,
                  padding: "12px 10px",
                  textAlign: [8, 11].includes(index + 1) ? "center" : "left",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              >
                {index + 1 !== 7
                  ? label
                  : (<Box display="flex" gap={1} alignItems="center">
                    <Typography>{label}</Typography>
                    {deviceStatus &&
                      (<Tooltip
                        title={<Box display="flex" flexDirection="column">
                          <Typography sx={{ fontWeight: 600 }}>
                            {t("dashboardPage.deviceConnectionStatus")}
                          </Typography>
                          <Typography display="flex" alignItems="center" gap="2px">
                            <DeviceConnectionState state="Connected" />
                            Connected
                          </Typography>
                          <Typography display="flex" alignItems="center" gap="2px">
                            <DeviceConnectionState state="Disconnected" />
                            Disconnected
                          </Typography>
                        </Box>}
                        placement="right-end"
                        variant="outlined"
                        sx={{ zIndex: 12000 }}
                        arrow
                      >
                        <InfoOutlined sx={{ fontSize: 14 }} />
                      </Tooltip>)}
                  </Box>)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row, index) => (
            <tr key={index}>
              <TableCell>{startIndex + index}</TableCell>
              <TableCell>{row.facility.name}</TableCell>
              <TableCell>{row.facility.type}</TableCell>
              <TableCell>{row.prefecture}</TableCell>
              <TableCell>{row.municipality}</TableCell>
              <TableCell>{row.aitriosName}</TableCell>
              <TableCell>
                <Typography display="flex" alignItems="center" gap={1}>
                  {deviceStatus && <DeviceConnectionState state={deviceStatus[row.serialNumber]} />}
                  {row.serialNumber}
                </Typography>
              </TableCell>
              <TableCell centerAlign>
                <Chip
                  variant="soft"
                  size="sm"
                  color={row.result === 4 ? "success"
                    : row.result === 3 ? "danger"
                      : row.result === 2 ? "warning"
                        : "primary"}
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                  }}
                >
                  {t(`statusList.${statusToString(row.result)}`)}
                </Chip>
              </TableCell>
              <TableCell>{[2, 3, 4].includes(row.result) ? formatDatetime(row.requested) : "-"}</TableCell>
              <TableCell>{[3, 4].includes(row.result) ? formatDatetime(row.answered) : "-"}</TableCell>
              <TableCell centerAlign>
                {[2, 3, 4].includes(row.result) &&
                  <Button
                    variant="solid"
                    sx={{ width: 80 }}
                    onClick={() => navigate(`/reviews/${row.latestReviewId}`)}
                    data-testid={`listview-details-btn-${index + 1}`}
                  >
                    {t("dashboardPage.details")}
                  </Button>}
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  )
}

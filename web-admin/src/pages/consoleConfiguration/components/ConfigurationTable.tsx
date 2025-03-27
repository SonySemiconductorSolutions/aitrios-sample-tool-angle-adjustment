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
  Button,
  Sheet,
  Table,
  Stack,
  Card,
  Typography,
} from "@mui/joy";
import { Pagination } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDatetime } from "../../../utils";
import { TableCell } from "../../../components/TableCell";
import { useStore } from "../../../store";
import { useTranslation } from "react-i18next";

const TABLE_HEIGHT = "500px";
const PER_PAGE = 10;

// Interface for Customer details to be rendered in the component
interface Customer {
  id: number;
  customerName: string;
  lastUpdatedBy: string;
  lastUpdatedTime: string;
}

export default function ConfigurationTable() {
  const navigate = useNavigate();
  const { customers } = useStore();
  const { t } = useTranslation();

  const TABLE_HEADERS = [
    { label: t("consoleConfigurationPage.slNo"), width: "60px" },
    { label: t("consoleConfigurationPage.customerName"), width: "200px" },
    { label: t("consoleConfigurationPage.lastUpdatedBy"), width: "100px" },
    { label: t("consoleConfigurationPage.lastUpdatedAt"), width: "100px" },
    { label: t("consoleConfigurationPage.action"), width: "75px" },
  ];

  // State variables
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginatedData, setPaginatedData] = useState<Customer[]>([]);

  // Sets pagination for table data
  const setPages = () => {
    const totalItems = customers.length;
    const pages = Math.ceil(totalItems / PER_PAGE);
    setTotalPages(pages);

    const startIndex = (currentPage - 1) * PER_PAGE;
    const endIndex = Math.min(startIndex + PER_PAGE, totalItems);
    const newPaginatedData = customers.slice(startIndex, endIndex);
    setPaginatedData(newPaginatedData);
  };

  // Effect hook to update pagination when customers list or current page changes
  useEffect(
    () => setPages(),
    [customers, currentPage] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      <Typography sx={{ marginTop: 2 }}>
        {t("dashboardPage.showing")
          + Math.min((currentPage - 1) * PER_PAGE + 1, customers.length)
          + "-"
          + (Math.min(currentPage * PER_PAGE, customers.length))
          + t("dashboardPage.items") + t("dashboardPage.outOf")
          + customers.length + t("dashboardPage.items")}
      </Typography>

      {customers.length ? (
        <>
          <Sheet
            variant="outlined"
            sx={{
              width: "100%",
              borderRadius: "sm",
              overflow: "auto",
              flexGrow: 1,
              mt: 2,
              height: TABLE_HEIGHT
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
                <tr>
                  {TABLE_HEADERS.map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        padding: "12px 10px",
                        width,
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData?.map((row, index) => (
                  <tr key={index}>
                    <TableCell>{((currentPage - 1) * PER_PAGE) + index + 1}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.lastUpdatedBy}</TableCell>
                    <TableCell>{row.lastUpdatedTime ? formatDatetime(row.lastUpdatedTime) : "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="solid"
                        sx={{
                          display: "flex",
                          width: "80px",
                          justifyContent: "center",
                        }}
                        onClick={() => navigate(`customers/${row.id}/edit`)}
                        data-testid={`edit-btn-${index + 1}`}
                      >
                        {t("consoleConfigurationPage.edit")}
                      </Button>
                    </TableCell>
                  </tr>)
                )}
              </tbody>
            </Table>
          </Sheet>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            variant="outlined"
            shape="rounded"
            color="primary"
            sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}
          />
        </>
      ) : (
        <Stack
          sx={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            width: "100%",
            height: TABLE_HEIGHT,
          }}
        >
          <Card
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              width: "100%",
              height: "100%",
            }}
            variant="plain"
          >
            <Typography textAlign="center" level="h4">
              {t("dashboardPage.noData")}
            </Typography>
          </Card>
        </Stack>
      )}
    </>
  );
}

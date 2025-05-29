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
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../store";
import { LoginForm } from "./components/LoginForm";
import { BackgroundContainer } from "../../components/BackgroundContainer";
import { getCustomers } from "../../services/customers";

export const LoginPage = () => {
  const { currentAccount, setCustomers } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [customersChecked, setCustomersChecked] = useState(false);
  const [isCheckingCustomers, setIsCheckingCustomers] = useState(false);

  useEffect(() => {
    const fetchAndCheckCustomers = async () => {
      if (!currentAccount || customersChecked || isCheckingCustomers) {
        return;
      }

      setIsCheckingCustomers(true);
      try {
        const customersData = await getCustomers();

        if (customersData?.data) {
          setCustomers(customersData.data.map((value: { id: any; customer_name: any; last_updated_by: any; last_updated_at_utc: any; }) => ({
            id: value.id,
            customerName: value.customer_name,
            lastUpdatedBy: value.last_updated_by,
            lastUpdatedTime: value.last_updated_at_utc,
          })));
        }

        setCustomersChecked(true);

        const params = new URLSearchParams(location.search);
        const redirectParam = params.get("redirect");

        if (!customersData?.data || customersData.data.length === 0) {
          navigate("/settings");
        } else {
          navigate(redirectParam || "/");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomersChecked(true);
        navigate("/");
      } finally {
        setIsCheckingCustomers(false);
      }
    };

    fetchAndCheckCustomers();
  }, [currentAccount, navigate, location.search, customersChecked, isCheckingCustomers, setCustomers]);

  return (
    <BackgroundContainer>
      <LoginForm />
    </BackgroundContainer>
  );
};

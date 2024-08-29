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

// Import packages
import { Suspense } from "react";
import SlideRoutes from "react-slide-routes";
import { BrowserRouter, Route } from "react-router-dom";
// Import helpers
import GlobalListener from "src/GlobalListener";
import { GlobalContextProvider } from "src/contexts/GlobalProvider";
// Import components
import { Loading } from "src/components/blocks/Loading/Loading";
import { NotFound } from "src/components/blocks/NotFound/NotFound";
// Import pages
import { TopPage } from "src/pages/TopPage/TopPage";
import { ErrorPage } from "src/pages/ErrorPage/ErrorPage";
import { DevicesPage } from "src/pages/DevicesPage/DevicesPage";
import { ReviewStatusPage } from "src/pages/ReviewStatusPage/ReviewStatusPage";
import { ImageConfirmationPage } from "src/pages/ImageConfirmationPage/ImageConfirmationPage";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalContextProvider>
        <GlobalListener>
          <SlideRoutes>
            <Route
              path="/"
              element={
                <Suspense fallback={<Loading />}>
                  <TopPage />
                </Suspense>
              }
            />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route
              path="/image-confirmation"
              element={<ImageConfirmationPage />}
            />
            <Route
              path="/review-status"
              element={<ReviewStatusPage />}
            />
            <Route path="*" element={<NotFound />} />
          </SlideRoutes>
        </GlobalListener>
      </GlobalContextProvider>
    </BrowserRouter>
  );
};

export default App;

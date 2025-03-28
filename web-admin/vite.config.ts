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
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [react()],
    server: {
      host: true,
      port: 3001,
    },
    resolve: {
      alias: {
        src: "/src",
      },
    },
    build: {
      outDir: "build",
    },
    // Expose environment variables to the client
    define: {
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
  });
};

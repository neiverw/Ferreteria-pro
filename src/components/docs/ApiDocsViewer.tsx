"use client";

import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import openApiSpec from '@/lib/openapi.json';

export function ApiDocsViewer() {
  return (
    <div className="h-screen w-full overflow-hidden bg-[#0d1117]">
      <ApiReferenceReact
        configuration={{
          spec: {
            content: openApiSpec,
          },
          theme: 'purple',
          darkMode: true,
          hideDownloadButton: false,
          showSidebar: true,
        }}
      />
    </div>
  );
}

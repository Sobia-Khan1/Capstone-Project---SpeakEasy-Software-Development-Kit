import React from 'react';
import Layout from '@theme/Layout';

export default function APIReference() {
  return (
    <Layout title="API Reference">
      <iframe src="/typedoc/index.html" width="100%" height="600px"></iframe>
    </Layout>
  );
}
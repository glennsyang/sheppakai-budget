import React from "react";
import "../styles/index.css";

function MyApp({ Component, pageProps }: any) {
  return (
    <Component {...pageProps} />
  );
}

export default MyApp;

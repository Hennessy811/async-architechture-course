import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";
import "@tremor/react/dist/esm/tremor.css";
import type { AppType } from "next/dist/shared/lib/utils";
import { ToastContainer, toast } from "react-toastify";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer />
    </>
  );
};

export default MyApp;

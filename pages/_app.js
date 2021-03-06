import "antd/dist/antd.css";
import axios from "axios";
import "../styles/globals.css";

axios.defaults.baseURL = `/api`;

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;

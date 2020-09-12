import "antd/dist/antd.css";
import axios from "axios";
import "../styles/globals.css";

axios.defaults.baseURL = "https://cmgi-vi-attendance-1relehpj7.vercel.app/api";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;

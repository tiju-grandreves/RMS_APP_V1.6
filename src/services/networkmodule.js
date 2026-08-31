const isDirectAWSTesting = false;

const AWS_API_BASE_URL = "https://dev-events-api.sea.ac.ae";
const LOCAL_API_BASE_URL =
  process.env.REACT_APP_API_URL?.trim() || "http://localhost:8080";

const API_BASE_URL = isDirectAWSTesting
  ? AWS_API_BASE_URL
  : LOCAL_API_BASE_URL;

export {
  isDirectAWSTesting,
  AWS_API_BASE_URL,
  LOCAL_API_BASE_URL,
  API_BASE_URL,
};

export default API_BASE_URL;

import * as cookie from "cookie";

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const destination = cookies.session_id ? "/dashboard" : "/login";

  return { redirect: { destination, permanent: false } };
}

export default function Home() {
  return null;
}

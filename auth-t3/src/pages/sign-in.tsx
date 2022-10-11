import axios from "axios";
import clsx from "clsx";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { producer } from "../server/kafka";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log("submit");
    setLoading(true);

    try {
      const res = await axios.post("/api/sign-in", {
        email,
        password,
      });

      setError("");
      setLoading(false);

      // save the token

      const redirectUrl = router.query.redirectUrl as string;

      if (redirectUrl) {
        const url = new URL(redirectUrl);
        url.searchParams.append("token", res.data.token);
        console.log(url.toString());

        window.location.href = url.toString();
      } else {
        // router.push("/");
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
    // do POST request to /api/sign-in
    // redirect to query param redirectUrl
  };

  return (
    <main className="center-screen">
      <h1>Sign In</h1>
      <form
        className="mt-4 flex w-full max-w-sm flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          required
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button
          type="submit"
          className={clsx("btn btn-primary", loading && "animate-pulse")}
        >
          {loading ? "Loading..." : "Sign In"}
        </button>

        {error && <p className="text-red-500">{error}</p>}
        <a href={`/sign-up?redirectUrl=${router.query.redirectUrl ?? "/"}`}>
          Don&apos;t have an account?
        </a>
      </form>
    </main>
  );
};

export default SignIn;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = getCookie("token", { req: context.req, res: context.res });
  const redirectUrl = context.query.redirectUrl as string;

  let url = "/";

  if (token) {
    if (redirectUrl) {
      const tempUrl = new URL(redirectUrl);
      tempUrl.searchParams.append("token", token.toString());
      url = tempUrl.toString();
    }

    return {
      redirect: {
        destination: url,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

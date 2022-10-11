import axios from "axios";
import clsx from "clsx";
import { useRouter } from "next/router";
import React, { useState } from "react";

const getRandomEmail = () => {
  return `test${Math.floor(Math.random() * 1000000)}@test.com`;
};

const SignIn = () => {
  const router = useRouter();

  const [username, setUsername] = useState("testme");
  const [email, setEmail] = useState(getRandomEmail());
  const [password, setPassword] = useState("123");
  const [repeatPassword, setrepeatPassword] = useState("123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const res = await axios.post("/api/sign-up", {
        username,
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
        window.location.href = redirectUrl;
      } else {
        // router.push("/");
      }
    } catch (error: any) {
      console.log({ error });
      setError(error.message);
      setLoading(false);
    }

    // do POST request to /api/sign-in
    // redirect to query param redirectUrl
  };

  return (
    <main className="center-screen">
      <h1>Sign Up</h1>
      <form
        className="mt-4 flex w-full max-w-sm flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          required
          type="text"
          placeholder="Username"
          className="input input-bordered w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <input
          required
          type="password"
          placeholder="Repeat Password"
          className="input input-bordered w-full"
          value={repeatPassword}
          onChange={(e) => setrepeatPassword(e.target.value)}
        />
        <br />
        <button
          type="submit"
          className={clsx("btn btn-primary", loading && "animate-pulse")}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

        {error && <p className="text-red-500">{error}</p>}

        <a href="/sign-in">Already have an account?</a>
      </form>
    </main>
  );
};

export default SignIn;

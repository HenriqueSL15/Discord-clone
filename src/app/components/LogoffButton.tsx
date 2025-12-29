"use client";

import { logoff } from "../actions/auth";

export default function LogoffButton() {
  return <button onClick={logoff}>Logoff</button>;
}

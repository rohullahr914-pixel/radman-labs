"use client";
import { useEffect, useState } from "react";
export function SaveToast() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(location.search).has("saved")) {
      const show = setTimeout(() => setVisible(true), 0);
      history.replaceState(null, "", "/admin");
      const timer = setTimeout(() => setVisible(false), 4500);
      return () => {
        clearTimeout(show);
        clearTimeout(timer);
      };
    }
  }, []);
  return visible ? (
    <div className="toast" role="status">
      Application saved. Your catalog is up to date.
    </div>
  ) : null;
}

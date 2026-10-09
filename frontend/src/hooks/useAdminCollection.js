import { useEffect, useState } from "react";
import { adminRequest } from "../services/adminApi";

async function getItems(endpoint, signal) {
  const data = await adminRequest(endpoint, { signal });
  if (!Array.isArray(data)) {
    throw new Error("La liste reçue ne peut pas être affichée.");
  }
  return data;
}

export default function useAdminCollection(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getItems(endpoint, controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setItems(data);
        setError("");
      }
    }).catch((requestError) => {
      if (!controller.signal.aborted) {
        setError(requestError.message);
      }
    }).finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [endpoint]);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      setItems(await getItems(endpoint));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function mutate(path, method, body, message) {
    setPending(true);
    setFeedback(null);
    try {
      await adminRequest(path, { method, body });
      setFeedback({ type: "success", message });
      // Reload the collection after the server confirms the change.
      await reload();
      return true;
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
      return false;
    } finally {
      setPending(false);
    }
  }

  return { items, loading, error, pending, feedback, setFeedback, reload, mutate };
}

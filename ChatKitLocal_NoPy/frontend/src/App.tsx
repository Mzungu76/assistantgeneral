import { useEffect, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

type Config = { app_name: string; workflow_aliases: string[] };

export default function App() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [wf, setWf] = useState<string>("");

  useEffect(() => {
    fetch("http://127.0.0.1:8787/api/config")
      .then(r => r.json())
      .then((c: Config) => { setCfg(c); setWf(c.workflow_aliases?.[0] ?? ""); })
      .catch(() => setCfg({ app_name: "ChatKit", workflow_aliases: [] }));
  }, []);

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        if (!wf) throw new Error("Nessun workflow selezionato");
        const res = await fetch(`http://127.0.0.1:8787/api/chatkit/session?wf=${encodeURIComponent(wf)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Errore sessione");
        return data.client_secret;
      }
    }
  });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 10, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>{cfg?.app_name ?? "ChatKit"}</div>
        <label>Workflow</label>
        <select value={wf} onChange={(e) => setWf(e.target.value)} disabled={!cfg?.workflow_aliases?.length}>
          {(cfg?.workflow_aliases ?? []).map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={() => control.reset()}>Nuova chat</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatKit control={control} />
      </div>
    </div>
  );
}

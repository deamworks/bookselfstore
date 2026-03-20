// navbar-auth.js
// ใส่ใน <head> ของทุกหน้า — แสดงชื่อผู้ใช้แทน Contract เมื่อ login แล้ว
(async function () {
    const SUPABASE_URL  = "https://zngfesvcxszvptburtio.supabase.co";
    const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ2Zlc3ZjeHN6dnB0YnVydGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTI4NTQsImV4cCI6MjA4OTU2ODg1NH0.Be0xbq5svhPm4mfzA0-tkdQ1jaJFlj0Fkvqrq_zvoow";

    if (!window.supabase) {
        await new Promise((res) => {
            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
            s.onload = res;
            document.head.appendChild(s);
        });
    }

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

    if (document.readyState === "loading") {
        await new Promise(r => document.addEventListener("DOMContentLoaded", r));
    }

    function showUser(user) {
        const contractEl = document.getElementById("navContractItem");
        const userEl     = document.getElementById("navUserItem");
        const nameEl     = document.getElementById("navDisplayName");
        if (!contractEl || !userEl || !nameEl) return;
        const name = user.user_metadata?.full_name
                  || user.user_metadata?.name
                  || user.email.split("@")[0];
        nameEl.textContent       = "👤 " + name;
        contractEl.style.display = "none";
        userEl.style.display     = "list-item";
    }

    function resetNav() {
        const contractEl = document.getElementById("navContractItem");
        const userEl     = document.getElementById("navUserItem");
        if (!contractEl || !userEl) return;
        contractEl.style.display = "list-item";
        userEl.style.display     = "none";
    }

    const { data: { session } } = await sb.auth.getSession();
    if (session) showUser(session.user);

    sb.auth.onAuthStateChange((event, session) => {
        if (session) showUser(session.user);
        if (event === "SIGNED_OUT") resetNav();
    });
})();
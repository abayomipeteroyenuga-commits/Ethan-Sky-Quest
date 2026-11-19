import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.1";

(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const config = window.ETHAN_ONLINE_CONFIG || {};
  const accountStatus = $("online-account-status");
  const resultStatus = $("online-result-note");
  const boardBody = $("online-leaderboard");
  const signInButton = $("online-signin");
  const signOutButton = $("online-signout");
  const emailInput = $("online-email");
  const usernameInput = $("online-username");
  const submitUrl = String(config.supabaseUrl || "").replace(/\/$/, "");
  const publishableKey = String(config.publishableKey || "");

  function setMessage(node, message, error = false) {
    if (!node) return;
    node.textContent = message;
    node.dataset.state = error ? "error" : "normal";
  }

  function showEmptyBoard(message) {
    boardBody.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty-state";
    cell.textContent = message;
    row.append(cell);
    boardBody.append(row);
  }

  function formatTime(value) {
    const seconds = Math.max(0, Number(value) || 0);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    return hours
      ? hours + ":" + String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0")
      : minutes + ":" + String(remainder).padStart(2, "0");
  }

  if (!submitUrl || !publishableKey) {
    setMessage(accountStatus, "Online play is not configured in this build. Local play and offline saves still work.");
    showEmptyBoard("Online leaderboards are not configured.");
    return;
  }

  const supabase = createClient(submitUrl, publishableKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  });
  let currentUser = null;
  let currentSeasonKey = null;
  let submitting = false;

  function syncAccount(session) {
    currentUser = session?.user || null;
    const signedIn = Boolean(currentUser);
    signInButton.hidden = signedIn;
    emailInput.disabled = signedIn;
    usernameInput.disabled = signedIn;
    signOutButton.hidden = !signedIn;
    $("online-user").hidden = !signedIn;
    $("online-user").textContent = signedIn
      ? "SIGNED IN · " + (currentUser.email || currentUser.id)
      : "";
    $("online-account-caption").textContent = signedIn
      ? "Your results are linked to this player account."
      : "Your email stays private; only your player name appears on rankings.";
    if (signedIn) {
      emailInput.value = currentUser.email || "";
      const chosenName = currentUser.user_metadata?.username;
      if (chosenName && !usernameInput.value) usernameInput.value = chosenName;
      setMessage(accountStatus, "You are signed in. Completed challenge runs can now enter the Sky League.");
    } else {
      setMessage(accountStatus, "Enter an email and player name to receive a secure sign-in link.");
    }
    refreshLeaderboard().catch((error) => setMessage(accountStatus, error.message || "Could not load rankings.", true));
  }

  async function currentSeason() {
    const { data, error } = await supabase
      .from("quest_seasons")
      .select("season_key,name")
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    currentSeasonKey = data?.season_key || null;
    $("online-season-name").textContent = data?.name || "Sky League";
    return data;
  }

  async function refreshLeaderboard() {
    if (!boardBody) return;
    showEmptyBoard("Loading rankings…");
    const scope = $("online-scope").value;
    const mode = $("online-mode").value;
    let query;
    if (scope === "season") {
      const season = await currentSeason();
      if (!season) {
        showEmptyBoard("The next Sky League season has not opened yet.");
        return;
      }
      query = supabase.from("quest_season_leaderboard").select(
        "season_key,mode,user_id,username,score,time_seconds,worlds_cleared,guardians_defeated,crystals_earned,cycle"
      ).eq("season_key", season.season_key).eq("mode", mode);
    } else {
      $("online-season-name").textContent = "All-time personal bests";
      query = supabase.from("quest_all_time_leaderboard").select(
        "mode,user_id,username,score,time_seconds,worlds_cleared,guardians_defeated,crystals_earned,cycle"
      ).eq("mode", mode);
    }
    const { data, error } = await query
      .order("score", { ascending: false })
      .order("time_seconds", { ascending: true })
      .limit(25);
    if (error) throw error;
    if (!data?.length) {
      showEmptyBoard("No scores have been submitted for this challenge yet. Be the first!");
      return;
    }
    boardBody.replaceChildren();
    data.forEach((entry, index) => {
      const row = document.createElement("tr");
      if (currentUser && entry.user_id === currentUser.id) row.className = "mine";
      const values = [
        String(index + 1),
        entry.username || "Sky Explorer",
        Number(entry.score || 0).toLocaleString(),
        formatTime(entry.time_seconds),
      ];
      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      boardBody.append(row);
    });
    $("online-board-note").textContent =
      "Top " + data.length + " · best score per player · ties broken by fastest time. Your row is highlighted when signed in.";
  }

  async function signIn() {
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage(accountStatus, "Enter a valid email address.", true);
      emailInput.focus();
      return;
    }
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      setMessage(accountStatus, "Player names must be 3–20 letters, numbers or underscores.", true);
      usernameInput.focus();
      return;
    }
    signInButton.disabled = true;
    setMessage(accountStatus, "Sending your secure sign-in link…");
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
          data: { username },
        },
      });
      if (error) throw error;
      setMessage(accountStatus, "Sign-in link sent. Open the email on this device to finish signing in. Check your spam folder too.");
    } catch (error) {
      setMessage(accountStatus, error.message || "Could not send the sign-in link.", true);
    } finally {
      signInButton.disabled = false;
    }
  }

  async function signOut() {
    signOutButton.disabled = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage(accountStatus, "You have signed out.");
    } catch (error) {
      setMessage(accountStatus, error.message || "Could not sign out.", true);
    } finally {
      signOutButton.disabled = false;
    }
  }

  async function submitCompletedRun(detail) {
    if (submitting) return;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setMessage(resultStatus, sessionError.message || "Could not read your player session.", true);
      return;
    }
    const session = sessionData?.session;
    if (!session) {
      setMessage(resultStatus, "Run saved on this device. Sign in to submit it to the global leaderboard.");
      return;
    }
    submitting = true;
    setMessage(resultStatus, "Submitting your completed " + String(detail.mode || "challenge").replace(/_/g, " ") + " run…");
    try {
      const { data, error } = await supabase.functions.invoke("quest-submit-result", { body: detail });
      if (error) {
        const message = data?.error || error.message || "The result could not be submitted.";
        throw new Error(message);
      }
      if (!data?.ok) throw new Error(data?.error || "The result could not be submitted.");
      setMessage(resultStatus, "Result added to the " + (data.season || "Sky League") + ". Your local save is unchanged.");
      await refreshLeaderboard();
    } catch (error) {
      setMessage(resultStatus, error.message || "Could not submit this run. Your local result is safe.", true);
    } finally {
      submitting = false;
    }
  }

  signInButton.addEventListener("click", signIn);
  signOutButton.addEventListener("click", signOut);
  $("online-refresh").addEventListener("click", () => refreshLeaderboard().catch((error) => setMessage(accountStatus, error.message, true)));
  $("online-scope").addEventListener("change", () => refreshLeaderboard().catch((error) => setMessage(accountStatus, error.message, true)));
  $("online-mode").addEventListener("change", () => refreshLeaderboard().catch((error) => setMessage(accountStatus, error.message, true)));
  window.addEventListener("ethan-quest-run-complete", (event) => {
    if (event.detail && typeof event.detail === "object") submitCompletedRun(event.detail);
  });

  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) throw error;
      syncAccount(data.session);
    })
    .catch((error) => setMessage(accountStatus, error.message || "Could not restore the player session.", true));
  supabase.auth.onAuthStateChange((_event, session) => syncAccount(session));
})();

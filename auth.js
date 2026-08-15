// TypeMaster authentication — Supabase
const SUPABASE_URL = "https://engeyzdcoewcxnnolwuo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_iDYgSsHqPd0A4lKYAEQhDQ_tmFQQ0Gs";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const authMessage = (message, type = "info") => {
  const el = document.getElementById("authMessage");
  if (!el) return;
  el.textContent = message;
  el.className = `auth-message ${type}`;
  el.hidden = false;
};

const setLoading = (button, loading, normalText) => {
  if (!button) return;
  button.disabled = loading;
  button.textContent = loading ? "Please wait..." : normalText;
};

async function updateAuthUI() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  document.querySelectorAll("[data-auth-link]").forEach(link => {
    if (session?.user) {
      link.textContent = "My Account";
      link.href = "account.html";
    } else {
      link.textContent = "Login";
      link.href = "login.html";
    }
  });
  const emailEl = document.getElementById("accountEmail");
  if (emailEl && session?.user) emailEl.textContent = session.user.email;
  return session;
}

async function handleLogin() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;
  const button = document.getElementById("loginBtn");
  if (!email || !password) return authMessage("Please enter your email and password.", "error");
  setLoading(button, true, "Login");
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setLoading(button, false, "Login");
  if (error) return authMessage(error.message, "error");
  authMessage("Login successful. Redirecting...", "success");
  setTimeout(() => location.href = "index.html", 500);
}

async function handleSignup() {
  const name = document.getElementById("signupName")?.value.trim();
  const email = document.getElementById("signupEmail")?.value.trim();
  const password = document.getElementById("signupPassword")?.value;
  const confirm = document.getElementById("signupConfirm")?.value;
  const button = document.getElementById("signupBtn");
  if (!name || !email || !password || !confirm) return authMessage("Please fill in all fields.", "error");
  if (password.length < 6) return authMessage("Password must be at least 6 characters.", "error");
  if (password !== confirm) return authMessage("Passwords do not match.", "error");
  setLoading(button, true, "Create Account");
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  });
  setLoading(button, false, "Create Account");
  if (error) return authMessage(error.message, "error");
  if (data.session) {
    authMessage("Account created. Redirecting...", "success");
    setTimeout(() => location.href = "index.html", 500);
  } else {
    authMessage("Account created. Check your email to confirm your account, then log in.", "success");
  }
}

async function handleReset() {
  const email = document.getElementById("resetEmail")?.value.trim();
  const button = document.getElementById("resetBtn");
  if (!email) return authMessage("Enter your email address.", "error");
  setLoading(button, true, "Send Reset Email");
  const redirectTo = `${location.origin}${location.pathname.replace(/[^/]*$/, "login.html")}`;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
  setLoading(button, false, "Send Reset Email");
  if (error) return authMessage(error.message, "error");
  authMessage("Password reset email sent. Check your inbox.", "success");
}

async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) return authMessage(error.message, "error");
  location.href = "index.html";
}

function wireAuthPage() {
  document.getElementById("loginBtn")?.addEventListener("click", handleLogin);
  document.getElementById("signupBtn")?.addEventListener("click", handleSignup);
  document.getElementById("resetBtn")?.addEventListener("click", handleReset);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.querySelectorAll("form[data-auth-form]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const action = form.dataset.authForm;
      if (action === "login") handleLogin();
      if (action === "signup") handleSignup();
      if (action === "reset") handleReset();
    });
  });
}

supabaseClient.auth.onAuthStateChange(() => updateAuthUI());
wireAuthPage();
updateAuthUI();

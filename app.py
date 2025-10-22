# =========================
# Internal HR App (SQLite)
# =========================
# New in this version:
#  1) Admin Dashboard / Analytics Overview (home after login)
# 11) AI Insights: feedback & workload summaries; risk flags
# 12) Document Center: upload/manage policies; required reading; acknowledgements; employee portal "Documents"
# 13) Multi-language (English/Albanian) with per-user preference
#
# Existing features kept:
# - Centered Login (main page). Sidebar appears after login.
# - Roles: admin, employee
# - Users: full_name (unique), password, email, job_role, last_seen_at
# - Employee Portal tabs: My Tasks | My Time | Leave | Feedback | Documents | Profile
# - Admin tabs: Dashboard | Checklist Builder | Tasks | Time & Attendance | Feedback (Analyzer) | Documents | AI Insights
# - Task notifications badge, comments, attachments, role-based checklist assignment, feedback tags
# - Email reminders via SMTP (set in sidebar as admin)
#
# Privacy: No external AI calls — insights use local heuristics.
# Files: task attachments in ./uploads, policies in ./policies

import os
import streamlit as st
import pandas as pd
import sqlite3
from datetime import datetime, date, timedelta
import uuid
import hashlib, secrets
import json
import smtplib, ssl
from email.message import EmailMessage
from collections import Counter, defaultdict
import re

# Sentiment & optional wordcloud
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    _VADER = SentimentIntensityAnalyzer()
except Exception:
    _VADER = None

try:
    from wordcloud import WordCloud
    _WC_AVAILABLE = True
except Exception:
    _WC_AVAILABLE = False

import matplotlib.pyplot as plt

st.set_page_config(page_title="Internal HR", layout="wide")

# ---------- Paths ----------
DB_PATH = "backend/hr_app.db"
UPLOAD_DIR = "uploads"
POLICY_DIR = "policies"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(POLICY_DIR, exist_ok=True)

# ---------- SQLite ----------
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    # users
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','employee')),
      email TEXT,
      job_role TEXT,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      last_seen_at TEXT
    )""")
    # user prefs (language, dark mode, saved filters)
    cur.execute("""CREATE TABLE IF NOT EXISTS user_prefs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_full_name TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL
    )""")
    # tasks
    cur.execute("""
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('Low','Medium','High')) DEFAULT 'Medium',
      due_date TEXT,
      status TEXT CHECK(status IN ('To-Do','In-Progress','Done')) DEFAULT 'To-Do',
      assignee TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    )""")
    # task comments
    cur.execute("""
    CREATE TABLE IF NOT EXISTS task_comments(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )""")
    # task attachments
    cur.execute("""
    CREATE TABLE IF NOT EXISTS task_files(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )""")
    # templates + items
    cur.execute("""CREATE TABLE IF NOT EXISTS templates(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS template_items(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      task_text TEXT NOT NULL,
      priority TEXT,
      offset_days INTEGER,
      FOREIGN KEY(template_id) REFERENCES templates(id) ON DELETE CASCADE
    )""")
    # timesheets
    cur.execute("""CREATE TABLE IF NOT EXISTS timesheets(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      day TEXT NOT NULL,
      clock_in TEXT,
      clock_out TEXT,
      notes TEXT
    )""")
    # leave
    cur.execute("""CREATE TABLE IF NOT EXISTS leave_requests(
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      approver TEXT,
      decision_note TEXT
    )""")
    # feedback
    cur.execute("""CREATE TABLE IF NOT EXISTS feedback(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      is_anonymous INTEGER DEFAULT 0,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sentiment_score REAL,
      sentiment_label TEXT
    )""")
    # feedback tags
    cur.execute("""CREATE TABLE IF NOT EXISTS tags(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS feedback_tags(
      feedback_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY(feedback_id, tag_id),
      FOREIGN KEY(feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )""")
    # settings (smtp)
    cur.execute("""CREATE TABLE IF NOT EXISTS settings(
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )""")
    # documents (policies)
    cur.execute("""CREATE TABLE IF NOT EXISTS documents(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      required_read INTEGER DEFAULT 0,
      audience TEXT DEFAULT 'all',        -- 'all' or 'role'
      audience_value TEXT,                -- job_role if audience='role'
      uploaded_by TEXT NOT NULL,
      uploaded_at TEXT NOT NULL
    )""")
    # acknowledgements
    cur.execute("""CREATE TABLE IF NOT EXISTS document_acks(
      doc_id INTEGER NOT NULL,
      user_full_name TEXT NOT NULL,
      acknowledged_at TEXT NOT NULL,
      PRIMARY KEY(doc_id, user_full_name),
      FOREIGN KEY(doc_id) REFERENCES documents(id) ON DELETE CASCADE
    )""")

    conn.commit()
    # default admin
    cur.execute("SELECT COUNT(*) AS c FROM users WHERE role='admin'")
    if cur.fetchone()["c"] == 0:
        salt = secrets.token_hex(8)
        pwd_hash = hashlib.sha256(("admin123" + salt).encode("utf-8")).hexdigest()
        cur.execute("""INSERT INTO users(full_name, role, email, job_role, password_hash, salt, last_seen_at)
                       VALUES (?,?,?,?,?,?,?)""",
                    ("Administrator", "admin", None, None, pwd_hash, salt, datetime.now().isoformat(timespec="seconds")))
        conn.commit()
    conn.close()

init_db()

# ---------- Schema helpers ----------
def _ensure_column(table, name, type_sql):
    conn = get_conn(); cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({table})")
    cols = [r[1] for r in cur.fetchall()]
    if name not in cols:
        try:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {name} {type_sql}")
            conn.commit()
        except Exception:
            pass
    conn.close()

_ensure_column("users", "email", "TEXT")
_ensure_column("users", "job_role", "TEXT")
_ensure_column("template_items", "priority", "TEXT DEFAULT 'Medium'")
_ensure_column("template_items", "offset_days", "INTEGER DEFAULT 0")
_ensure_column("feedback", "sentiment_score", "REAL")
_ensure_column("feedback", "sentiment_label", "TEXT")

# ---------- Prefs ----------
def set_pref(user_full_name, key, value_obj):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("DELETE FROM user_prefs WHERE user_full_name=? AND key=?", (user_full_name, key))
    cur.execute("INSERT INTO user_prefs(user_full_name, key, value) VALUES (?,?,?)",
                (user_full_name, key, json.dumps(value_obj)))
    conn.commit(); conn.close()

def get_pref(user_full_name, key, default=None):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT value FROM user_prefs WHERE user_full_name=? AND key=?", (user_full_name, key))
    row = cur.fetchone(); conn.close()
    if not row: return default
    try:
        return json.loads(row["value"])
    except Exception:
        return default

# ---------- i18n (EN / SQ) ----------
I18N = {
    "en": {
        "portal": "Company Portal",
        "signin": "Sign in to continue",
        "full_name": "Full Name",
        "password": "Password",
        "login": "Log in",
        "invalid": "Invalid name or password.",
        "employee_portal": "Employee Portal",
        "my_tasks": "My Tasks",
        "my_time": "My Time",
        "leave": "Leave",
        "feedback": "Feedback",
        "documents": "Documents",
        "profile": "Profile",
        "dashboard": "Dashboard",
        "checklists": "Checklist Builder",
        "tasks": "Tasks",
        "time_att": "Time & Attendance",
        "feedback_admin": "Feedback (Analyzer)",
        "docs_admin": "Documents",
        "insights": "AI Insights",
        "notifications": "Notifications",
        "new": "new",
        "due_soon": "due soon",
    },
    "sq": {
        "portal": "Portali i Kompanisë",
        "signin": "Hyni për të vazhduar",
        "full_name": "Emri dhe Mbiemri",
        "password": "Fjalëkalimi",
        "login": "Hyr",
        "invalid": "Emri ose fjalëkalimi i pasaktë.",
        "employee_portal": "Portali i Punonjësve",
        "my_tasks": "Detyrat e mia",
        "my_time": "Koha ime",
        "leave": "Leje",
        "feedback": "Feedback",
        "documents": "Dokumente",
        "profile": "Profili",
        "dashboard": "Paneli",
        "checklists": "Modele Kontrolli",
        "tasks": "Detyrat",
        "time_att": "Koha & Pjesëmarrja",
        "feedback_admin": "Feedback (Analizues)",
        "docs_admin": "Dokumente",
        "insights": "AI Analiza",
        "notifications": "Njoftime",
        "new": "të reja",
        "due_soon": "afër afatit",
    }
}

def t(key, lang):
    return I18N.get(lang, I18N["en"]).get(key, key)

# ---------- Sentiment ----------
def _compute_sentiment(text: str):
    text = (text or "").strip()
    if not text:
        return 0.0, "Neutral"
    try:
        if _VADER is not None:
            s = _VADER.polarity_scores(text)["compound"]
        else:
            pos = sum(text.lower().count(w) for w in ["good","great","love","excellent","happy","positive","helpful"])
            neg = sum(text.lower().count(w) for w in ["bad","terrible","hate","awful","unhappy","negative","issue","problem","bug"])
            s = (pos - neg)/max(1, pos+neg)
    except Exception:
        s = 0.0
    label = "Positive" if s >= 0.2 else ("Negative" if s <= -0.2 else "Neutral")
    return float(s), label

# ---------- Auth ----------
def load_user_by_name(full_name):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE lower(full_name)=lower(?)", (full_name.strip(),))
    row = cur.fetchone(); conn.close()
    return row

def verify_password(plain, salt, stored_hash):
    return hashlib.sha256((plain + salt).encode("utf-8")).hexdigest() == stored_hash

def update_password(full_name, old_plain, new_plain):
    row = load_user_by_name(full_name)
    if not row or not verify_password(old_plain, row["salt"], row["password_hash"]):
        return False, "Old password is incorrect."
    salt = secrets.token_hex(8)
    pwd_hash = hashlib.sha256((new_plain + salt).encode("utf-8")).hexdigest()
    conn = get_conn(); cur = conn.cursor()
    cur.execute("UPDATE users SET password_hash=?, salt=? WHERE full_name=?", (pwd_hash, salt, full_name))
    conn.commit(); conn.close()
    return True, "Password updated."

def create_user(full_name, role, password, email=None, job_role=None):
    conn = get_conn(); cur = conn.cursor()
    salt = secrets.token_hex(8)
    pwd_hash = hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
    cur.execute("""INSERT INTO users(full_name, role, email, job_role, password_hash, salt, last_seen_at)
                   VALUES (?,?,?,?,?,?,?)""",
                (full_name, role, email, job_role, pwd_hash, salt, datetime.now().isoformat(timespec="seconds")))
    conn.commit(); conn.close()

# ---------- Email (SMTP) ----------
def set_setting(key, value_obj):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("REPLACE INTO settings(key, value) VALUES (?,?)", (key, json.dumps(value_obj)))
    conn.commit(); conn.close()

def get_setting(key, default=None):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT value FROM settings WHERE key=?", (key,))
    row = cur.fetchone(); conn.close()
    if not row: return default
    try:
        return json.loads(row["value"])
    except Exception:
        return default

def send_email(to_addr, subject, body):
    cfg = get_setting("smtp", None)
    if not cfg:
        return False, "SMTP not configured."
    host = cfg.get("host"); port = int(cfg.get("port", 587))
    user = cfg.get("username"); pwd = cfg.get("password")
    sender = cfg.get("sender") or user
    if not (host and port and user and pwd and sender):
        return False, "Incomplete SMTP settings."
    try:
        msg = EmailMessage()
        msg["From"] = sender
        msg["To"] = to_addr
        msg["Subject"] = subject
        msg.set_content(body)
        context = ssl.create_default_context()
        with smtplib.SMTP(host, port) as server:
            server.starttls(context=context)
            server.login(user, pwd)
            server.send_message(msg)
        return True, "Sent."
    except Exception as e:
        return False, f"Email error: {e}"

# ---------- Dark mode ----------
def apply_dark_mode(enabled: bool):
    if not enabled:
        return
    st.markdown("""
    <style>
      html, body, [data-testid="stAppViewContainer"] {
        background-color: #0f1115 !important;
        color: #e6e6e6 !important;
      }
      .stButton>button { background: #1f2937 !important; color: #e6e6e6 !important; border: 1px solid #374151 !important; }
      .stTextInput>div>div>input, textarea, select { background: #111827 !important; color: #e6e6e6 !important; border: 1px solid #374151 !important; }
      .stDataFrame, .stDataEditor { filter: invert(0.92) hue-rotate(180deg); }
    </style>
    """, unsafe_allow_html=True)

# ---------- Login Screen (Centered) ----------
if "user" not in st.session_state:
    st.markdown(
        """
        <div style="display:flex;justify-content:center;align-items:center;min-height:75vh;">
          <div style="width:360px;padding:28px;border:1px solid #e6e6e6;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.06);background-color:white;">
            <h2 style="text-align:center;margin:0 0 6px 0;">Company Portal</h2>
            <p style="text-align:center;margin:0 0 18px 0;color:#666">Sign in to continue</p>
        """,
        unsafe_allow_html=True
    )
    full = st.text_input("Full Name", placeholder="Name Surname", key="login_full_name")
    pw = st.text_input("Password", type="password", placeholder="Enter password", key="login_password")
    login_btn = st.button("Log in", use_container_width=True, key="login_btn")
    if login_btn:
        row = load_user_by_name(full)
        if row and verify_password(pw, row["salt"], row["password_hash"]):
            st.session_state["user"] = {"full_name": row["full_name"], "role": row["role"]}
            st.rerun()
        else:
            st.error("❌ Invalid name or password.")
    st.markdown("</div></div>", unsafe_allow_html=True)
    st.stop()

# ---------- Sidebar (only after login) ----------
with st.sidebar:
    u = st.session_state["user"]
    # language & dark mode
    lang_pref = get_pref(u["full_name"], "lang", "en")
    lang = st.selectbox("Language / Gjuha", ["en","sq"], index=0 if lang_pref=="en" else 1, key="sidebar_lang")
    if lang != lang_pref:
        set_pref(u["full_name"], "lang", lang); st.rerun()
    dm_pref = get_pref(u["full_name"], "dark_mode", False)
    dark_mode = st.toggle("🌙 Dark mode", value=bool(dm_pref), key="sidebar_darkmode")
    if dark_mode != dm_pref:
        set_pref(u["full_name"], "dark_mode", bool(dark_mode))
    apply_dark_mode(bool(dark_mode))

    st.write(f"**{u['full_name']}** ({u['role']})")
    if u["role"] == "admin":
        with st.expander("User Management (Admin)"):
            st.caption("Create a user. Full name must be unique.")
            name = st.text_input("Full name", key="um_full_name")
            email = st.text_input("Email (optional)", key="um_email")
            jobr = st.text_input("Job role (optional)", key="um_job_role", placeholder="e.g., Sales, Backend, HR")
            role = st.selectbox("Role", ["employee","admin"], key="um_role")
            pw_new = st.text_input("Temp password", type="password", key="um_password")
            if st.button("Create user", key="um_create_btn"):
                if not name or not pw_new:
                    st.error("Enter full name and password.")
                else:
                    try:
                        create_user(name, role, pw_new, email=email or None, job_role=jobr or None)
                        st.success("User created.")
                    except Exception as e:
                        st.error(f"Error: {e}")

        with st.expander("Email Settings (SMTP)"):
            cfg = get_setting("smtp", {"host":"", "port":587, "username":"", "password":"", "sender":""})
            c1,c2 = st.columns(2)
            host = c1.text_input("SMTP host", value=str(cfg.get("host","")), key="smtp_host")
            port = c2.number_input("SMTP port", min_value=1, max_value=65535, value=int(cfg.get("port",587)), key="smtp_port")
            username = st.text_input("Username", value=str(cfg.get("username","")), key="smtp_username")
            password = st.text_input("Password", type="password", value=str(cfg.get("password","")), key="smtp_password")
            sender = st.text_input("Sender (From email)", value=str(cfg.get("sender","")), key="smtp_sender")
            if st.button("Save SMTP", key="smtp_save"):
                set_setting("smtp", {"host":host, "port":int(port), "username":username, "password":password, "sender":sender})
                st.success("SMTP saved.")

    if st.button("Log out", key="logout_btn"):
        try:
            conn = get_conn(); cur = conn.cursor()
            cur.execute("UPDATE users SET last_seen_at=? WHERE full_name=?", (datetime.now().isoformat(timespec="seconds"), u["full_name"]))
            conn.commit(); conn.close()
        except Exception:
            pass
        del st.session_state["user"]
        st.rerun()

# ===== EMPLOYEE PORTAL =====
if st.session_state["user"]["role"] == "employee":
    lang = get_pref(st.session_state["user"]["full_name"], "lang", "en")
    st.title(t("employee_portal", lang))
    tab_tasks, tab_time, tab_leave, tab_fb, tab_docs, tab_profile = st.tabs([
        t("my_tasks", lang), t("my_time", lang), t("leave", lang), t("feedback", lang), t("documents", lang), t("profile", lang)
    ])

    conn = get_conn(); cur = conn.cursor()
    user_name = st.session_state["user"]["full_name"]

    # Notifications badge
    cur.execute("SELECT last_seen_at FROM users WHERE full_name=?", (user_name,))
    row_ls = cur.fetchone()
    last_seen = row_ls["last_seen_at"] if row_ls and row_ls["last_seen_at"] is not None else None
    cur.execute("SELECT * FROM tasks WHERE assignee=? AND status!='Done'", (user_name,))
    rows_all = [dict(r) for r in cur.fetchall()]
    now = datetime.now()
    due_soon = 0; new_count = 0
    for r in rows_all:
        try:
            if r.get("due_date") and (pd.to_datetime(r["due_date"]) - now).days <= 3:
                due_soon += 1
        except Exception:
            pass
        if last_seen:
            try:
                if pd.to_datetime(r["created_at"]) > pd.to_datetime(last_seen):
                    new_count += 1
            except Exception:
                pass
    st.caption(f"🔔 {t('notifications',lang)}: **{new_count} {t('new',lang)}** · **{due_soon} {t('due_soon',lang)}**")

    # ----- My Tasks
    with tab_tasks:
        cur.execute("SELECT * FROM tasks WHERE assignee=? ORDER BY created_at DESC", (user_name,))
        df = pd.DataFrame([dict(r) for r in cur.fetchall()])
        st.markdown("### " + t("my_tasks", lang))
        if df.empty:
            st.caption("No tasks assigned yet.")
        else:
            def _fmt_status(row):
                try:
                    dd = pd.to_datetime(row["due_date"]) if row["due_date"] else None
                    if dd:
                        if dd.date() < date.today() and row["status"] != "Done":
                            return "❗ Overdue"
                        if (dd.date() - date.today()).days <= 3 and row["status"] != "Done":
                            return "⏳ Due soon"
                except Exception:
                    pass
                return row["status"]
            df["status_view"] = df.apply(_fmt_status, axis=1)
            edited = st.data_editor(
                df, hide_index=True,
                column_config={
                    "status": st.column_config.SelectboxColumn("Status (edit)", options=["To-Do","In-Progress","Done"]),
                    "status_view": "Status",
                    "due_date": st.column_config.TextColumn("Due date"),
                    "description": st.column_config.TextColumn("Description"),
                    "title": "Title",
                    "priority": st.column_config.SelectboxColumn("Priority", options=["Low","Medium","High"]),
                    "created_at": "Assigned at",
                },
                disabled=["status_view","created_at","title","priority"],
                use_container_width=True, key="emp_tasks_editor",
            )
            if st.button("Save my task updates", key="emp_tasks_save"):
                for _, r in edited.iterrows():
                    cur.execute("UPDATE tasks SET status=?, due_date=?, description=? WHERE id=?",
                                (r["status"], str(r.get("due_date","")), r.get("description",""), int(r["id"])))
                conn.commit()
                st.success("Saved.")

            # Task comments & attachments
            st.markdown("---")
            st.subheader("Task details")
            task_ids = edited["id"].tolist() if not edited.empty else df["id"].tolist()
            sel_task = st.selectbox("Select a task", options=task_ids if task_ids else [], key="emp_sel_task")
            if sel_task:
                with st.expander("💬 Comments", expanded=True):
                    cur.execute("SELECT * FROM task_comments WHERE task_id=? ORDER BY created_at DESC", (int(sel_task),))
                    comments = [dict(r) for r in cur.fetchall()]
                    for c in comments:
                        st.markdown(f"**{c['author']}** · _{c['created_at']}_  \n{c['message']}")
                        st.markdown("---")
                    msg = st.text_area("Add a comment", key="emp_comment")
                    if st.button("Post comment", key="emp_comment_post"):
                        if msg.strip():
                            cur.execute("""INSERT INTO task_comments(task_id, author, message, created_at)
                                           VALUES (?,?,?,?)""",
                                       (int(sel_task), user_name, msg.strip(), datetime.now().isoformat(timespec="seconds")))
                            conn.commit(); st.success("Comment posted."); st.rerun()
                        else:
                            st.error("Write a message.")
                with st.expander("📎 Attachments"):
                    cur.execute("SELECT * FROM task_files WHERE task_id=? ORDER BY uploaded_at DESC", (int(sel_task),))
                    files = [dict(r) for r in cur.fetchall()]
                    if files:
                        for f in files:
                            st.markdown(f"• {f['filename']} — uploaded by {f['uploaded_by']} at {f['uploaded_at']}")
                    up = st.file_uploader("Upload a file", key="emp_file")
                    if up is not None:
                        safe_name = f"{int(sel_task)}_{uuid.uuid4().hex}_{up.name}"
                        save_path = os.path.join(UPLOAD_DIR, safe_name)
                        with open(save_path, "wb") as fp:
                            fp.write(up.read())
                        cur.execute("""INSERT INTO task_files(task_id, filename, path, uploaded_at, uploaded_by)
                                       VALUES (?,?,?,?,?)""",
                                    (int(sel_task), up.name, save_path, datetime.now().isoformat(timespec="seconds"), user_name))
                        conn.commit(); st.success("File uploaded."); st.rerun()

    # ----- My Time
    with tab_time:
        today = date.today()
        cur.execute("SELECT * FROM timesheets WHERE full_name=? AND day=?", (user_name, str(today)))
        row = cur.fetchone()
        col1, col2 = st.columns(2)
        if not row or not row["clock_in"]:
            if col1.button("🟢 Clock In", key="emp_clock_in"):
                cur.execute("INSERT INTO timesheets(full_name, day, clock_in) VALUES (?,?,?)",
                            (user_name, str(today), datetime.now().isoformat(timespec="seconds")))
                conn.commit(); st.success("Clocked in."); st.rerun()
        else:
            if not row["clock_out"]:
                if col1.button("🔴 Clock Out", key="emp_clock_out"):
                    cur.execute("UPDATE timesheets SET clock_out=? WHERE id=?",
                                (datetime.now().isoformat(timespec="seconds"), row["id"]))
                    conn.commit(); st.success("Clocked out."); st.rerun()
            else:
                col1.caption("You already clocked out today.")
        note = col2.text_input("Note (optional)", key="emp_time_note")
        if col2.button("Save note", key="emp_time_save_note"):
            if row:
                cur.execute("UPDATE timesheets SET notes=? WHERE id=?", (note, row["id"]))
                conn.commit(); st.success("Note saved.")
            else:
                st.info("Clock in first to attach a note.")
        cur.execute("SELECT * FROM timesheets WHERE full_name=? ORDER BY day DESC LIMIT 14", (user_name,))
        st.dataframe(pd.DataFrame([dict(r) for r in cur.fetchall()]), use_container_width=True, hide_index=True)

    # ----- Leave
    with tab_leave:
        l1,l2 = st.columns(2)
        with l1:
            start = st.date_input("Start date", value=date.today(), key="emp_leave_start")
        with l2:
            end = st.date_input("End date", value=date.today(), key="emp_leave_end")
        t1,t2 = st.columns(2)
        with t1:
            ltype = st.selectbox("Type", ["vacation","sick","unpaid","other"], key="emp_leave_type")
        with t2:
            reason = st.text_input("Reason (optional)", key="emp_leave_reason")
        if st.button("Submit leave request", key="emp_leave_submit"):
            rid = str(uuid.uuid4())[:8]
            cur.execute("""INSERT INTO leave_requests(id, full_name, start_date, end_date, type, reason, status, created_at)
                           VALUES (?,?,?,?,?,?, 'pending', ?)""",
                        (rid, user_name, str(start), str(end), ltype, reason, datetime.now().isoformat(timespec="seconds")))
            conn.commit(); st.success("Leave request submitted.")

    # ----- Feedback
    with tab_fb:
        st.subheader("Submit Feedback")
        is_an = st.checkbox("Submit anonymously?", key="emp_fb_anon")
        msg = st.text_area("Your message", key="emp_fb_message")
        if st.button("Send feedback", key="emp_fb_send"):
            if msg.strip():
                score, label = _compute_sentiment(msg)
                cur.execute("""INSERT INTO feedback(full_name, is_anonymous, message, created_at, sentiment_score, sentiment_label)
                               VALUES (?,?,?,?,?,?)""",
                            (None if is_an else user_name, 1 if is_an else 0, msg.strip(),
                             datetime.now().isoformat(timespec="seconds"), score, label))
                conn.commit(); st.success("Feedback sent.")
            else:
                st.error("Write a message.")

    # ----- Documents (Employee)
    with tab_docs:
        st.subheader("Company Documents")
        cur.execute("SELECT job_role FROM users WHERE full_name=?", (user_name,))
        row_role = cur.fetchone()
        my_role = row_role["job_role"] if row_role else None
        if my_role:
            cur.execute("""SELECT * FROM documents
                           WHERE audience='all' OR (audience='role' AND audience_value=?)
                           ORDER BY uploaded_at DESC""", (my_role,))
        else:
            cur.execute("""SELECT * FROM documents
                           WHERE audience='all'
                           ORDER BY uploaded_at DESC""")
        docs = [dict(r) for r in cur.fetchall()]
        if not docs:
            st.caption("No documents yet.")
        else:
            cur.execute("SELECT doc_id FROM document_acks WHERE user_full_name=?", (user_name,))
            my_acks = set([r["doc_id"] for r in cur.fetchall()])
            df_docs = pd.DataFrame(docs)
            df_docs["acknowledged"] = df_docs["id"].apply(lambda i: "✅" if i in my_acks else "—")
            st.dataframe(df_docs[["id","title","category","required_read","audience","audience_value","uploaded_at","acknowledged"]],
                         use_container_width=True, hide_index=True)
            sel = st.number_input("Open / acknowledge document ID", min_value=0, step=1, key="emp_docs_sel")
            if sel > 0:
                d = next((d for d in docs if int(d["id"])==int(sel)), None)
                if d:
                    st.markdown(f"**{d['title']}**  \nCategory: _{d.get('category') or '-'}_  \nUploaded at: {d['uploaded_at']}")
                    with open(d["path"], "rb") as fp:
                        st.download_button("Download", data=fp.read(), file_name=d["filename"], key=f"emp_doc_dl_{sel}")
                    if d.get("required_read",0)==1 and int(sel) not in my_acks:
                        if st.button("Acknowledge read", key=f"emp_doc_ack_{sel}"):
                            cur.execute("INSERT OR REPLACE INTO document_acks(doc_id, user_full_name, acknowledged_at) VALUES (?,?,?)",
                                        (int(sel), user_name, datetime.now().isoformat(timespec="seconds")))
                            conn.commit(); st.success("Acknowledged."); st.rerun()

    # ----- Profile
    with tab_profile:
        st.subheader("My Profile")
        cur.execute("SELECT * FROM users WHERE full_name=?", (user_name,))
        me = cur.fetchone()
        email = st.text_input("Email", value=me["email"] or "", key="emp_profile_email")
        jobr = st.text_input("Job role", value=me["job_role"] or "", key="emp_profile_jobrole")
        if st.button("Save profile", key="emp_profile_save"):
            cur.execute("UPDATE users SET email=?, job_role=? WHERE full_name=?", (email or None, jobr or None, user_name))
            conn.commit(); st.success("Profile saved.")
        st.markdown("---")
        st.markdown("#### Change Password")
        oldp = st.text_input("Old password", type="password", key="emp_profile_oldpw")
        newp = st.text_input("New password", type="password", key="emp_profile_newpw")
        newp2 = st.text_input("Confirm new password", type="password", key="emp_profile_newpw2")
        if st.button("Update password", key="emp_profile_updatepw"):
            if not newp or newp != newp2:
                st.error("New passwords do not match.")
            else:
                ok, msgp = update_password(user_name, oldp, newp)
                (st.success if ok else st.error)(msgp)

    conn.close()
    st.stop()

# ===== ADMIN =====
tab_dash, tab_templates, tab_tasks, tab_time, tab_feedback, tab_docs, tab_ai = st.tabs(
    [t("dashboard", get_pref(st.session_state["user"]["full_name"], "lang", "en")),
     t("checklists", get_pref(st.session_state["user"]["full_name"], "lang", "en")),
     t("tasks", get_pref(st.session_state["user"]["full_name"], "lang", "en")),
     t("time_att", get_pref(st.session_state["user"]["full_name"], "lang", "en")),
     t("feedback_admin", get_pref(st.session_state["user"]["full_name"], "lang", "en")),
     t("docs_admin", get_pref(st.session_state["user"]["full_name"], "lang", "en")),
     t("insights", get_pref(st.session_state["user"]["full_name"], "lang", "en"))]
)

# ===== 1) DASHBOARD =====
with tab_dash:
    st.subheader("Company Dashboard")
    conn = get_conn(); cur = conn.cursor()

    # KPIs
    cur.execute("SELECT COUNT(*) AS c FROM tasks WHERE status!='Done'")
    active_tasks = (cur.fetchone() or {"c":0})["c"]
    cur.execute("SELECT COUNT(*) AS c FROM tasks WHERE date(created_at) >= date('now','-30 day')")
    created_30 = (cur.fetchone() or {"c":0})["c"]
    cur.execute("SELECT COUNT(*) AS c FROM tasks WHERE status='Done' AND date(created_at) >= date('now','-30 day')")
    done_30 = (cur.fetchone() or {"c":0})["c"]
    completion_rate = (done_30/created_30*100.0) if created_30 else 0.0
    cur.execute("""SELECT COUNT(*) AS c FROM timesheets
                   WHERE day=date('now') AND clock_in IS NOT NULL AND (clock_out IS NULL OR clock_out='')""")
    clocked_in_now = (cur.fetchone() or {"c":0})["c"]
    cur.execute("SELECT COUNT(*) AS c FROM leave_requests WHERE status='pending'")
    leave_pending = (cur.fetchone() or {"c":0})["c"]
    cur.execute("""SELECT sentiment_label, COUNT(*) c FROM feedback
                   WHERE date(created_at) >= date('now','-30 day') GROUP BY sentiment_label""")
    rows = cur.fetchall()
    pos = neu = neg = 0
    for r in rows:
        if r["sentiment_label"]=="Positive": pos = r["c"]
        elif r["sentiment_label"]=="Neutral": neu = r["c"]
        elif r["sentiment_label"]=="Negative": neg = r["c"]

    c1,c2,c3,c4 = st.columns(4)
    c1.metric("Active tasks", active_tasks)
    c2.metric("30d completion", f"{completion_rate:.0f}%")
    c3.metric("Clocked in now", clocked_in_now)
    c4.metric("Pending leave", leave_pending)

    cur.execute("SELECT status, COUNT(*) c FROM tasks GROUP BY status")
    status_df = pd.DataFrame([dict(r) for r in cur.fetchall()])
    if not status_df.empty:
        status_df = status_df.set_index("status")
        st.markdown("### Tasks by status")
        st.bar_chart(status_df)

    sent_df = pd.DataFrame({"label":["Positive","Neutral","Negative"], "count":[pos,neu,neg]}).set_index("label")
    st.markdown("### Feedback sentiment (last 30 days)")
    st.bar_chart(sent_df)

    cur.execute("""SELECT * FROM tasks WHERE status!='Done' AND due_date IS NOT NULL
                   AND date(due_date) < date('now') ORDER BY due_date ASC LIMIT 10""")
    overdue = pd.DataFrame([dict(r) for r in cur.fetchall()])
    if not overdue.empty:
        st.markdown("### Most overdue tasks (top 10)")
        st.dataframe(overdue[["title","assignee","due_date","priority"]], use_container_width=True, hide_index=True)

    cur.execute("""SELECT * FROM timesheets WHERE date(day) BETWEEN date('now','-7 day') AND date('now')""")
    ts = pd.DataFrame([dict(r) for r in cur.fetchall()])
    if not ts.empty:
        def _hours(row):
            try:
                if not row["clock_in"] or not row["clock_out"]:
                    return 0.0
                t1 = pd.to_datetime(row["clock_in"]); t2 = pd.to_datetime(row["clock_out"])
                return max(0.0, (t2 - t1).total_seconds()/3600.0)
            except Exception:
                return 0.0
        ts["hours"] = ts.apply(_hours, axis=1)
        by_emp = ts.groupby("full_name")["hours"].sum().reset_index()
        by_emp["overtime_flag"] = by_emp["hours"] > 40
        st.markdown("### Last 7 days hours (overtime flagged)")
        st.dataframe(by_emp, use_container_width=True, hide_index=True)

    conn.close()

# ===== Checklists (role assignment kept) =====
with tab_templates:
    st.subheader("Checklist Builder")
    st.caption("Create reusable checklists. Each item has priority and a due-date offset (days). Assign to employees or by job role.")
    conn = get_conn(); cur = conn.cursor()
    colL, colR = st.columns([1,2])

    with colL:
        st.markdown("##### Templates")
        cur.execute("SELECT id, name FROM templates ORDER BY name")
        tmpl_rows = cur.fetchall()
        tmpl_names = [r["name"] for r in tmpl_rows]
        name_to_id = {r["name"]: r["id"] for r in tmpl_rows}
        selected_name = st.selectbox("Select", options=tmpl_names or ["(none)"], key="tmpl_select")
        selected_id = name_to_id.get(selected_name) if tmpl_names else None

        new_name = st.text_input("New template name", key="tmpl_new_name")
        if st.button("Create", key="tmpl_create"):
            if not new_name.strip():
                st.error("Enter a name.")
            else:
                try:
                    cur.execute("INSERT INTO templates(name) VALUES (?)", (new_name.strip(),))
                    conn.commit(); st.success("Created."); st.rerun()
                except Exception as e:
                    st.error(f"Error: {e}")

        if selected_id:
            rn = st.text_input("Rename to", value=selected_name, key="tmpl_rename_to")
            if st.button("Rename", key="tmpl_rename_btn"):
                try:
                    cur.execute("UPDATE templates SET name=? WHERE id=?", (rn.strip(), selected_id))
                    conn.commit(); st.success("Renamed."); st.rerun()
                except Exception as e:
                    st.error(f"Error: {e}")

            dup = st.text_input("Duplicate as", value=f"{selected_name} (copy)", key="tmpl_dup_as")
            if st.button("Duplicate", key="tmpl_dup_btn"):
                try:
                    cur.execute("INSERT INTO templates(name) VALUES (?)", (dup.strip(),))
                    conn.commit()
                    cur.execute("SELECT id FROM templates WHERE name=?", (dup.strip(),))
                    new_id = cur.fetchone()["id"]
                    cur.execute("""SELECT task_text, COALESCE(priority,'Medium') AS priority, COALESCE(offset_days,0) AS offset_days
                                   FROM template_items WHERE template_id=?""", (selected_id,))
                    for r in cur.fetchall():
                        cur.execute("""INSERT INTO template_items(template_id, task_text, priority, offset_days)
                                      VALUES (?,?,?,?)""", (new_id, r["task_text"], r["priority"], r["offset_days"]))
                    conn.commit(); st.success("Duplicated."); st.rerun()
                except Exception as e:
                    st.error(f"Error: {e}")

            if st.button("Delete", type="secondary", key="tmpl_delete_btn"):
                try:
                    cur.execute("DELETE FROM templates WHERE id=?", (selected_id,))
                    conn.commit(); st.success("Deleted."); st.rerun()
                except Exception as e:
                    st.error(f"Error: {e}")

    with colR:
        if not selected_id:
            st.info("Create a template on the left, then select it to edit items.")
        else:
            st.markdown(f"#### {selected_name}")
            cur.execute("""SELECT id, task_text, COALESCE(priority,'Medium') AS priority, COALESCE(offset_days,0) AS offset_days
                           FROM template_items WHERE template_id=? ORDER BY id""", (selected_id,))
            items_df = pd.DataFrame([dict(r) for r in cur.fetchall()])
            if items_df.empty:
                items_df = pd.DataFrame([{"id": None, "task_text": "", "priority": "Medium", "offset_days": 0}])

            edited = st.data_editor(
                items_df, num_rows="dynamic", hide_index=True,
                column_config={
                    "task_text": st.column_config.TextColumn("Task"),
                    "priority": st.column_config.SelectboxColumn("Priority", options=["Low","Medium","High"]),
                    "offset_days": st.column_config.NumberColumn("Due offset (days)", step=1),
                    "id": st.column_config.TextColumn("ID", disabled=True),
                },
                use_container_width=True, key="tmpl_items_editor",
            )

            if st.button("Save checklist", key="tmpl_save_items"):
                try:
                    cur.execute("DELETE FROM template_items WHERE template_id=?", (selected_id,))
                    for _, r in edited.iterrows():
                        txt = (r.get("task_text") or "").strip()
                        if not txt: continue
                        pr = r.get("priority") or "Medium"
                        off = int(r.get("offset_days") or 0)
                        cur.execute("""INSERT INTO template_items(template_id, task_text, priority, offset_days)
                                       VALUES (?,?,?,?)""", (selected_id, txt, pr, off))
                    conn.commit(); st.success("Saved.")
                except Exception as e:
                    st.error(f"Error: {e}")

            st.markdown("---")
            st.markdown("#### Assign checklist")
            cur.execute("SELECT full_name FROM users WHERE role='employee' ORDER BY full_name")
            employees = [r["full_name"] for r in cur.fetchall()]
            cur.execute("SELECT DISTINCT job_role FROM users WHERE role='employee' AND job_role IS NOT NULL AND job_role!='' ORDER BY job_role")
            job_roles = [r["job_role"] for r in cur.fetchall()]
            colA, colB = st.columns(2)
            with colA:
                emps = st.multiselect("Employees", options=employees, key="tmpl_assign_emps")
            with colB:
                jr = st.selectbox("Or assign by job role", options=["(none)"] + job_roles, key="tmpl_assign_role")
            base_due = st.date_input("Base due date", value=date.today(), key="tmpl_assign_base_due")
            priority_override = st.selectbox("Optional: override priority for all", options=["(no override)","Low","Medium","High"], key="tmpl_assign_prio_override")
            if st.button("Assign now", key="tmpl_assign_now"):
                targets = set(emps)
                if jr and jr != "(none)":
                    cur.execute("SELECT full_name FROM users WHERE role='employee' AND job_role=?", (jr,))
                    targets.update([r["full_name"] for r in cur.fetchall()])
                if not targets:
                    st.error("Pick at least one employee or a job role.")
                else:
                    cur.execute("""SELECT task_text, COALESCE(priority,'Medium') AS priority, COALESCE(offset_days,0) AS offset_days
                                   FROM template_items WHERE template_id=?""", (selected_id,))
                    rows = cur.fetchall()
                    total = 0
                    for e in targets:
                        for r in rows:
                            final_due = base_due + timedelta(days=int(r["offset_days"] or 0))
                            pr = r["priority"] if priority_override=="(no override)" else priority_override
                            cur.execute("""INSERT INTO tasks(title, description, priority, due_date, status, assignee, created_by, created_at)
                                           VALUES (?,?,?,?, 'To-Do', ?, ?, ?)""",
                                        (r["task_text"], "", pr, str(final_due),
                                         e, st.session_state["user"]["full_name"], datetime.now().isoformat(timespec="seconds")))
                            total += 1
                    conn.commit()
                    st.success(f"Assigned {total} task(s) to {len(targets)} employee(s).")
    conn.close()

# ===== Tasks (Assign & Track) =====
with tab_tasks:
    st.subheader("Tasks — Assign & Track")
    conn = get_conn(); cur = conn.cursor()
    with st.expander("➕ Create task"):
        c1,c2,c3 = st.columns([2,1,1])
        title = c1.text_input("Title", key="task_create_title")
        priority = c2.selectbox("Priority", ["Low","Medium","High"], index=1, key="task_create_priority")
        due = c3.date_input("Due date", value=date.today(), key="task_create_due")
        desc = st.text_area("Description", key="task_create_desc")
        cur.execute("SELECT full_name, email FROM users WHERE role='employee' ORDER BY full_name")
        employees = [r["full_name"] for r in cur.fetchall()]
        assignee = st.selectbox("Assign to", options=employees if employees else ["(no employees yet)"], key="task_create_assignee")
        notify = st.checkbox("Send email notification (if SMTP configured)", key="task_create_notify")
        if st.button("Create task", key="task_create_btn"):
            if not title.strip() or not employees:
                st.error("Enter a title and make sure you have employees.")
            else:
                cur.execute("""INSERT INTO tasks(title, description, priority, due_date, status, assignee, created_by, created_at)
                               VALUES (?,?,?,?, 'To-Do', ?, ?, ?)""",
                            (title, desc, priority, str(due), assignee, st.session_state["user"]["full_name"], datetime.now().isoformat(timespec="seconds")))
                conn.commit(); st.success("Task created.")
                if notify:
                    cur.execute("SELECT email FROM users WHERE full_name=?", (assignee,))
                    em = cur.fetchone()
                    if em and em["email"]:
                        ok, msg = send_email(em["email"], "New Task Assigned",
                                             f"Hello {assignee},\n\nYou have a new task:\nTitle: {title}\nDue: {due}\n\nDescription:\n{desc}\n")
                        (st.success if ok else st.error)(f"Email: {msg}")
                    else:
                        st.info("No email on file for this user.")

    f1,f2 = st.columns([1,2])
    cur.execute("SELECT full_name FROM users WHERE role='employee' ORDER BY full_name")
    emp_opts = ["(all)"] + [r["full_name"] for r in cur.fetchall()]
    emp_filter = f1.selectbox("Employee", options=emp_opts, key="task_filter_emp")
    order = f2.selectbox("Sort by", options=["due_date desc","due_date asc","priority desc","priority asc","created_at desc","created_at asc"], index=0, key="task_filter_order")
    base_q = "SELECT * FROM tasks"; params = []
    if emp_filter != "(all)":
        base_q += " WHERE assignee=?"; params.append(emp_filter)
    base_q += " ORDER BY " + order.replace(" desc"," DESC").replace(" asc"," ASC")
    cur.execute(base_q, params)
    df = pd.DataFrame([dict(r) for r in cur.fetchall()])
    if df.empty:
        st.caption("No tasks yet.")
    else:
        edited = st.data_editor(
            df, hide_index=True,
            column_config={
                "priority": st.column_config.SelectboxColumn("Priority", options=["Low","Medium","High"]),
                "status": st.column_config.SelectboxColumn("Status", options=["To-Do","In-Progress","Done"]),
                "due_date": st.column_config.TextColumn("Due date"),
                "description": st.column_config.TextColumn("Description"),
                "assignee": st.column_config.TextColumn("Assignee"),
            },
            use_container_width=True, key="tasks_admin_editor"
        )
        if st.button("Save changes", key="tasks_admin_save"):
            for _, r in edited.iterrows():
                cur.execute("""UPDATE tasks SET title=?, description=?, priority=?, due_date=?, status=?, assignee=? WHERE id=?""",
                            (r["title"], r.get("description",""), r["priority"], str(r.get("due_date","")), r["status"], r["assignee"], int(r["id"])))
            conn.commit(); st.success("Saved.")

    st.markdown("---")
    st.markdown("### Task reminders")
    st.caption("Sends emails now; requires SMTP configured and user emails set.")
    colx, coly = st.columns(2)
    with colx:
        if st.button("Send reminders for overdue tasks", key="tasks_remind_overdue"):
            cur.execute("""SELECT t.*, u.email FROM tasks t
                           LEFT JOIN users u ON u.full_name=t.assignee
                           WHERE t.status!='Done' AND t.due_date IS NOT NULL
                           AND date(t.due_date) < date('now')""")
            rows = [dict(r) for r in cur.fetchall()]
            sent = 0; failed = 0
            for r in rows:
                if not r.get("email"): continue
                ok, msg = send_email(r["email"], "Overdue Task Reminder",
                                     f"Hello {r['assignee']},\n\nYour task is overdue:\nTitle: {r['title']}\nDue: {r['due_date']}\n\nPlease update the task status.")
                if ok: sent += 1
                else: failed += 1
            st.success(f"Reminders sent: {sent}, failed: {failed}")
    with coly:
        if st.button("Send reminders for tasks due in 3 days", key="tasks_remind_duesoon"):
            cur.execute("""SELECT t.*, u.email FROM tasks t
                           LEFT JOIN users u ON u.full_name=t.assignee
                           WHERE t.status!='Done' AND t.due_date IS NOT NULL
                           AND date(t.due_date) BETWEEN date('now') AND date('now','+3 day')""")
            rows = [dict(r) for r in cur.fetchall()]
            sent = 0; failed = 0
            for r in rows:
                if not r.get("email"): continue
                ok, msg = send_email(r["email"], "Upcoming Task Due",
                                     f"Hello {r['assignee']},\n\nYour task is due soon:\nTitle: {r['title']}\nDue: {r['due_date']}\n\nPlease ensure it's on track.")
                if ok: sent += 1
                else: failed += 1
            st.success(f"Reminders sent: {sent}, failed: {failed}")

    conn.close()

# ===== Time & Attendance =====
with tab_time:
    st.subheader("Time & Attendance (Admin)")
    conn = get_conn(); cur = conn.cursor()
    f1,f2,f3 = st.columns(3)
    user_filter = f1.text_input("Filter by full name (optional)", key="time_filter_name")
    start_d = f2.date_input("From", value=date.today().replace(day=1), key="time_filter_from")
    end_d = f3.date_input("To", value=date.today(), key="time_filter_to")
    cur.execute("SELECT * FROM timesheets WHERE day BETWEEN ? AND ?", (str(start_d), str(end_d)))
    ts = pd.DataFrame([dict(r) for r in cur.fetchall()])
    if user_filter:
        ts = ts[ts["full_name"].str.contains(user_filter, case=False, na=False)]
    st.markdown("### Timesheets")
    st.dataframe(ts, use_container_width=True, hide_index=True)

    def _hours(row):
        try:
            if not row["clock_in"] or not row["clock_out"]:
                return 0.0
            t1 = pd.to_datetime(row["clock_in"]); t2 = pd.to_datetime(row["clock_out"])
            return max(0.0, (t2 - t1).total_seconds()/3600.0)
        except Exception:
            return 0.0

    if not ts.empty:
        ts["hours"] = ts.apply(_hours, axis=1)
        totals = ts.groupby(["full_name"])["hours"].sum().reset_index().rename(columns={"hours":"total_hours"})
        st.markdown("### Hours by employee")
        st.dataframe(totals, use_container_width=True, hide_index=True)
        ts["week"] = pd.to_datetime(ts["day"]).dt.isocalendar().week
        ts["year"] = pd.to_datetime(ts["day"]).dt.isocalendar().year
        weekly = ts.groupby(["full_name","year","week"])["hours"].sum().reset_index()
        weekly["overtime_hours"] = (weekly["hours"] - 40).clip(lower=0)
        st.markdown("### Overtime (weekly > 40h)")
        st.dataframe(weekly, use_container_width=True, hide_index=True)
        st.download_button("Export Payroll CSV",
                           data=weekly[["full_name","year","week","hours","overtime_hours"]].to_csv(index=False).encode("utf-8"),
                           file_name="payroll_hours.csv", mime="text/csv", key="time_export_csv")

    st.markdown("---")
    st.markdown("### Leave requests")
    cur.execute("SELECT * FROM leave_requests WHERE status='pending'")
    pending = pd.DataFrame([dict(r) for r in cur.fetchall()])
    st.dataframe(pending, use_container_width=True, hide_index=True)
    if not pending.empty:
        sel = st.selectbox("Select request ID", options=pending["id"].tolist(), key="time_leave_sel")
        decision = st.radio("Decision", ["approve","reject"], horizontal=True, key="time_leave_decision")
        note = st.text_input("Decision note (optional)", key="time_leave_note")
        notify = st.checkbox("Email employee (if SMTP configured)", key="time_leave_notify")
        if st.button("Submit decision", key="time_leave_submit"):
            cur.execute("UPDATE leave_requests SET status=?, approver=?, decision_note=? WHERE id=?",
                        ("approved" if decision=="approve" else "rejected", st.session_state["user"]["full_name"], note, sel))
            if notify:
                cur.execute("SELECT full_name, email FROM leave_requests lr LEFT JOIN users u ON lr.full_name=u.full_name WHERE lr.id=?", (sel,))
                rr = cur.fetchone()
                if rr and rr["email"]:
                    ok, msg = send_email(rr["email"], f"Leave request {decision}",
                                         f"Hello {rr['full_name']},\n\nYour leave request ({sel}) was {decision}.\nNote: {note or '(no note)'}")
                    (st.success if ok else st.error)(f"Email: {msg}")
                else:
                    st.info("No email on file for this user.")
            conn.commit(); st.success("Decision saved.")
    conn.close()

# ===== Feedback (Analyzer) with Tags and Saved Filters =====
with tab_feedback:
    st.subheader("Feedback Analyzer")
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT * FROM feedback ORDER BY created_at DESC")
    df = pd.DataFrame([dict(r) for r in cur.fetchall()])

    with st.expander("🏷️ Manage Tags"):
        new_tag = st.text_input("New tag name", key="fb_tag_new")
        if st.button("Add tag", key="fb_tag_add"):
            if new_tag.strip():
                try:
                    cur.execute("INSERT INTO tags(name) VALUES (?)", (new_tag.strip(),))
                    conn.commit(); st.success("Tag added."); st.rerun()
                except Exception as e:
                    st.error(f"Error: {e}")
        cur.execute("SELECT * FROM tags ORDER BY name")
        tags_all = [dict(r) for r in cur.fetchall()]
        if tags_all:
            st.dataframe(pd.DataFrame(tags_all), use_container_width=True, hide_index=True)

    if df.empty:
        st.info("No employee feedback has been submitted yet.")
    else:
        for col in ["sentiment_label","sentiment_score","is_anonymous","full_name","message","created_at"]:
            if col not in df.columns:
                df[col] = None

        admin_name = st.session_state["user"]["full_name"]
        saved = get_pref(admin_name, "feedback_filters", {"keyword":"","label":"(all)","named_only":False,"tag_id":0})
        f1,f2,f3,f4 = st.columns([2,1,1,1])
        keyword = f1.text_input("Search text", value=saved.get("keyword",""), key="fb_filter_kw")
        label_f = f2.selectbox("Sentiment", ["(all)","Positive","Neutral","Negative"], index=["(all)","Positive","Neutral","Negative"].index(saved.get("label","(all)")), key="fb_filter_label")
        named_only = f3.checkbox("Only named", value=bool(saved.get("named_only", False)), key="fb_filter_named")
        cur.execute("SELECT id, name FROM tags ORDER BY name")
        trows = [dict(r) for r in cur.fetchall()]
        tag_options = ["(any)"] + [f"{r['id']} — {r['name']}" for r in trows]
        def _idx_for_tag(tag_id):
            if not tag_id: return 0
            for i, r in enumerate(trows, start=1):
                if r["id"] == tag_id: return i
            return 0
        tag_choice = f4.selectbox("Tag", options=tag_options, index=_idx_for_tag(saved.get("tag_id",0)), key="fb_filter_tag")
        chosen_tag_id = 0
        if tag_choice != "(any)":
            chosen_tag_id = int(tag_choice.split(" — ")[0])

        new_saved = {"keyword":keyword, "label":label_f, "named_only":bool(named_only), "tag_id":chosen_tag_id}
        if new_saved != saved:
            set_pref(admin_name, "feedback_filters", new_saved)

        view = df.copy()
        if keyword.strip():
            view = view[view["message"].str.contains(keyword, case=False, na=False)]
        if label_f != "(all)":
            view = view[view["sentiment_label"]==label_f]
        if named_only:
            view = view[view["is_anonymous"]==0]
        if chosen_tag_id:
            cur.execute("""SELECT ft.feedback_id FROM feedback_tags ft WHERE ft.tag_id=?""", (chosen_tag_id,))
            ids = [r["feedback_id"] for r in cur.fetchall()]
            view = view[view["id"].isin(ids)]

        total = len(view)
        pos = int((view["sentiment_label"]=="Positive").sum())
        neu = int((view["sentiment_label"]=="Neutral").sum())
        neg = int((view["sentiment_label"]=="Negative").sum())
        anon = int(view["is_anonymous"].fillna(0).sum())
        c1,c2,c3,c4 = st.columns(4)
        c1.metric("Total", total)
        c2.metric("Positive", pos)
        c3.metric("Neutral", neu)
        c4.metric("Negative", neg)
        st.caption(f"Anonymous: {anon}")

        try:
            view["_month"] = pd.to_datetime(view["created_at"]).dt.to_period("M").astype(str)
            trend = view.groupby(["_month","sentiment_label"]).size().reset_index(name="count")
            st.markdown("### Trend by month")
            st.dataframe(trend, use_container_width=True, hide_index=True)
        except Exception:
            pass

        st.markdown("### Topic counts (by keywords)")
        with st.expander("Set topic keywords"):
            topics_raw = st.text_area("Define topics as lines of 'Topic: keyword1, keyword2'",
"""Pay: salary, payroll, compensation, overtime
Workload: workload, overtime, hours, pressure, stress
Environment: office, remote, equipment, tools
Management: manager, leadership, communication
Benefits: vacation, leave, sick, insurance""", key="fb_topics_raw")
        topics = {}
        for line in [l for l in topics_raw.splitlines() if ":" in l]:
            name, keys = line.split(":", 1)
            topics[name.strip()] = [k.strip().lower() for k in keys.split(",") if k.strip()]
        counts = {k:0 for k in topics.keys()}
        for msg in view["message"].fillna("").str.lower().tolist():
            for tpc, keys in topics.items():
                if any(k in msg for k in keys):
                    counts[tpc] += 1
        if counts:
            st.bar_chart(pd.DataFrame({"Topic": list(counts.keys()), "Count": list(counts.values())}).set_index("Topic"))

        st.markdown("### Word Cloud")
        if _WC_AVAILABLE and not view.empty:
            txt = " ".join(view["message"].dropna().astype(str).tolist())
            try:
                wc = WordCloud(width=800, height=300, background_color="white").generate(txt)
                fig = plt.figure(figsize=(8,3)); plt.imshow(wc); plt.axis("off")
                st.pyplot(fig)
            except Exception:
                st.caption("WordCloud requires the 'wordcloud' package.")
        else:
            st.caption("Install 'wordcloud' to enable the word cloud (optional).")

        st.markdown("### Messages")
        st.dataframe(view[["id","created_at","full_name","is_anonymous","sentiment_label","sentiment_score","message"]],
                     use_container_width=True, hide_index=True)

        st.markdown("#### Tag a feedback item")
        fid = st.number_input("Feedback ID", min_value=0, step=1, key="fb_tag_fid")
        if fid > 0:
            cur.execute("SELECT id, name FROM tags ORDER BY name")
            tag_rows = cur.fetchall()
            tag_map = {f"{r['name']}": r["id"] for r in tag_rows}
            tag_sel = st.multiselect("Tags", options=list(tag_map.keys()), key="fb_tag_multiselect")
            if st.button("Apply tags", key="fb_tag_apply"):
                cur.execute("DELETE FROM feedback_tags WHERE feedback_id=?", (int(fid),))
                for name in tag_sel:
                    cur.execute("INSERT OR IGNORE INTO feedback_tags(feedback_id, tag_id) VALUES (?,?)",
                                (int(fid), tag_map[name]))
                conn.commit(); st.success("Tags updated.")

        st.download_button("Export filtered feedback (CSV)",
                           data=view.to_csv(index=False).encode("utf-8"),
                           file_name="feedback_export.csv", mime="text/csv", key="fb_export_csv")
    conn.close()

# ===== 12) DOCUMENTS (Admin) =====
with tab_docs:
    st.subheader("Documents / Policy Center (Admin)")
    conn = get_conn(); cur = conn.cursor()
    with st.expander("➕ Upload document"):
        title = st.text_input("Title", key="doc_title")
        category = st.text_input("Category", placeholder="e.g., Policy, Handbook, Safety", key="doc_category")
        required = st.checkbox("Required to read?", key="doc_required")
        audience = st.selectbox("Audience", ["all","role"], key="doc_audience")
        audience_value = None
        if audience == "role":
            audience_value = st.text_input("Target job role (exact match)", placeholder="e.g., Sales", key="doc_audience_value")
        file = st.file_uploader("File", type=None, key="doc_file")
        if st.button("Upload", key="doc_upload_btn"):
            if not (title and file):
                st.error("Title and file are required.")
            else:
                safe_name = f"{uuid.uuid4().hex}_{file.name}"
                save_path = os.path.join(POLICY_DIR, safe_name)
                with open(save_path, "wb") as fp:
                    fp.write(file.read())
                cur.execute("""INSERT INTO documents(title, category, filename, path, required_read, audience, audience_value, uploaded_by, uploaded_at)
                               VALUES (?,?,?,?,?,?,?, ?, ?)""",
                            (title, category or None, file.name, save_path, 1 if required else 0,
                             audience, audience_value, st.session_state["user"]["full_name"],
                             datetime.now().isoformat(timespec="seconds")))
                conn.commit(); st.success("Uploaded.")

    st.markdown("### Library")
    cur.execute("SELECT * FROM documents ORDER BY uploaded_at DESC")
    docs = [dict(r) for r in cur.fetchall()]
    if not docs:
        st.caption("No documents yet.")
    else:
        df = pd.DataFrame(docs)
        st.dataframe(df[["id","title","category","required_read","audience","audience_value","uploaded_by","uploaded_at"]],
                     use_container_width=True, hide_index=True)
        sel = st.number_input("Open / manage document ID", min_value=0, step=1, key="doc_admin_sel")
        if sel > 0:
            d = next((d for d in docs if int(d["id"])==int(sel)), None)
            if d:
                st.markdown(f"**{d['title']}**  \nCategory: _{d.get('category') or '-'}_  \nAudience: {d['audience']} {d.get('audience_value') or ''}")
                with open(d["path"], "rb") as fp:
                    st.download_button("Download", data=fp.read(), file_name=d["filename"], key=f"doc_admin_dl_{sel}")
                st.markdown("#### Acknowledgements")
                cur.execute("SELECT * FROM document_acks WHERE doc_id=?", (int(sel),))
                acks = pd.DataFrame([dict(r) for r in cur.fetchall()])
                st.dataframe(acks, use_container_width=True, hide_index=True)
                if st.button("Delete this document", key=f"doc_admin_delete_{sel}"):
                    try:
                        os.remove(d["path"])
                    except Exception:
                        pass
                    cur.execute("DELETE FROM documents WHERE id=?", (int(sel),))
                    cur.execute("DELETE FROM document_acks WHERE doc_id=?", (int(sel),))
                    conn.commit(); st.success("Deleted."); st.rerun()
    conn.close()

# ===== 11) AI INSIGHTS =====
with tab_ai:
    st.subheader("AI Insights (local heuristics)")
    conn = get_conn(); cur = conn.cursor()

    # --- Feedback insights ---
    st.markdown("### Feedback insights")
    cur.execute("SELECT * FROM feedback ORDER BY created_at DESC")
    fb = pd.DataFrame([dict(r) for r in cur.fetchall()])
    if not fb.empty:
        stop = set("""the a an and is are to of in for on at this that with by be or from it as we our us your you i me my they them their his her was were been being have has had do did done will would should could can not no yes""".split())
        words = []
        for m in fb["message"].dropna().astype(str).str.lower().tolist():
            tokens = re.findall(r"[a-zA-Z]{3,}", m)
            words.extend([w for w in tokens if w not in stop])
        top = Counter(words).most_common(10)
        if top:
            st.write("Top recurring words:", ", ".join([w for w,_ in top]))

        fb["d"] = pd.to_datetime(fb["created_at"], errors="coerce")
        now = pd.Timestamp.now()
        cur30 = fb[(fb["d"] >= now - pd.Timedelta(days=30))]
        prev30 = fb[(fb["d"] < now - pd.Timedelta(days=30)) & (fb["d"] >= now - pd.Timedelta(days=60))]
        def pct_pos(df_):
            if df_.empty: return 0.0
            return (df_["sentiment_label"]=="Positive").mean()*100.0
        delta = pct_pos(cur30) - pct_pos(prev30)
        st.write(f"Positive sentiment change (last 30d vs previous): **{delta:+.1f}pp**")

        hints = []
        for word, c in top[:5]:
            if word in ["overtime","pay","salary","hours","pressure","communication","manager","leadership","equipment","remote"]:
                hints.append(f"Topic spike: **{word}** ({c} mentions)")
        if hints:
            for h in hints:
                st.info(h)
    else:
        st.caption("No feedback yet.")

    st.markdown("---")
    # --- Workload insights ---
    st.markdown("### Workload insights")
    cur.execute("""SELECT assignee, COUNT(*) c FROM tasks
                   WHERE status!='Done' AND due_date IS NOT NULL AND date(due_date) < date('now')
                   GROUP BY assignee ORDER BY c DESC LIMIT 5""")
    od = [dict(r) for r in cur.fetchall()]
    if od:
        st.warning("Employees with most overdue tasks (top 5): " + ", ".join([f"{r['assignee']} ({r['c']})" for r in od]))
    else:
        st.caption("No overdue tasks right now.")

    cur.execute("""SELECT assignee, COUNT(*) c FROM tasks
                   WHERE status!='Done' AND due_date IS NOT NULL
                   AND date(due_date) BETWEEN date('now') AND date('now','+3 day')
                   GROUP BY assignee ORDER BY c DESC LIMIT 5""")
    ds = [dict(r) for r in cur.fetchall()]
    if ds:
        st.info("Employees with many tasks due in next 3 days: " + ", ".join([f"{r['assignee']} ({r['c']})" for r in ds]))

    cur.execute("""SELECT * FROM timesheets WHERE date(day) BETWEEN date('now','-7 day') AND date('now')""")
    ts = pd.DataFrame([dict(r) for r in cur.fetchall()])
    if not ts.empty:
        def _hours(row):
            try:
                if not row["clock_in"] or not row["clock_out"]:
                    return 0.0
                t1 = pd.to_datetime(row["clock_in"]); t2 = pd.to_datetime(row["clock_out"])
                return max(0.0, (t2 - t1).total_seconds()/3600.0)
            except Exception:
                return 0.0
        ts["hours"] = ts.apply(_hours, axis=1)
        agg = ts.groupby("full_name")["hours"].sum().reset_index()
        risky = agg[agg["hours"]>45]
        if not risky.empty:
            st.warning("Potential burnout risk (>45h last 7 days): " + ", ".join([f"{r['full_name']} ({r['hours']:.1f}h)" for _,r in risky.iterrows()]))
        else:
            st.caption("No overtime risk detected.")

    conn.close()

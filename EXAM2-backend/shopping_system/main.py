from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from pathlib import Path
from datetime import datetime
import sqlite3
import logging
import re

app = Flask(__name__)
app.secret_key = "dev-secret"

DB_PATH = Path(__file__).with_name("shopping_data.db")

def get_db_connection():
    if not DB_PATH.exists():
        ensure_schema()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def table_exists(conn, name:str) -> bool:
    cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,))
    return cur.fetchone() is not None

def ensure_schema():
    """確認 DB 存在即可（表格已由你手動建立）"""
    if not DB_PATH.exists():
        sqlite3.connect(DB_PATH).close()

# 依實際存在的表決定要用哪一張
def get_user_table(conn):
    return "users" if table_exists(conn, "users") else "user_table"

def get_order_table(conn):
    if table_exists(conn, "shop_list_table"):
        return "shop_list_table"
    return "orders"

def alert_and_redirect(message: str, endpoint: str):
    to = url_for(endpoint)
    safe_msg = str(message).replace('"', r'\"')
    return f"""<script>
        alert("{safe_msg}");
        window.location.href = "{to}";
    </script>"""

@app.route("/")
def index():
    if "username" not in session:
        return redirect(url_for("page_login"))
    return render_template("index.html")

@app.route("/page_login", methods=["GET", "POST"])
def page_login():
    try:
        if request.method == "GET":
            return render_template("page_login.html")  # 檔名依你的實際檔案

        data = request.get_json(silent=True) or request.form
        username = (data.get("username") or "").strip()
        password = (data.get("password") or "").strip()
        if not username or not password:
            return alert_and_redirect("請輸入帳號與密碼", "page_login")

        conn = get_db_connection()
        try:
            user_table = get_user_table(conn)
            cur = conn.execute(
                f"SELECT 1 FROM {user_table} WHERE username=? AND password=?",
                (username, password)
            )
            if cur.fetchone():
                session["username"] = username
                return alert_and_redirect("登入成功", "index")
            else:
                return alert_and_redirect("帳號或密碼錯誤", "page_login")
        finally:
            conn.close()
    except Exception as e:
        logging.exception(e)
        return alert_and_redirect("系統錯誤，請稍後再試", "page_login")

@app.route("/page_register", methods=["GET", "POST"])
def page_register():
    if request.method == "GET":
        return render_template("page_register.html")

    data = request.get_json(silent=True) or request.form
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    email    = (data.get("email") or "").strip()

    if not username or not password or not email:
        return alert_and_redirect("請完整填寫：帳號、密碼、信箱", "page_register")

    violations = []
    if len(password) < 8: violations.append("密碼需至少 8 個字元")
    if not any(c.islower() for c in password): violations.append("需包含小寫英文字母")
    if not any(c.isupper() for c in password): violations.append("需包含大寫英文字母")
    if violations:
        msg = "密碼不符合規則：\n- " + "\n- ".join(violations) + "\n請重新輸入"
        return alert_and_redirect(msg, "page_register")

    if not re.match(r"^[^@\s]+@gmail\.com$", email):
        return alert_and_redirect("Email 格式不符（需為 XXX@gmail.com），請重新輸入", "page_register")

    conn = get_db_connection()
    try:
        # ★ 固定用 users ★
        exists = conn.execute("SELECT 1 FROM users WHERE username=?", (username,)).fetchone()
        if exists:
            conn.execute("UPDATE users SET password=?, email=? WHERE username=?", (password, email, username))
            conn.commit()
            return alert_and_redirect("帳號已存在，成功修改密碼或信箱", "page_login")
        else:
            conn.execute("INSERT INTO users(username, password, email) VALUES(?,?,?)", (username, password, email))
            conn.commit()
            return alert_and_redirect("註冊成功", "page_login")
    except Exception as e:
        import traceback; traceback.print_exc()
        return alert_and_redirect("資料庫錯誤，請稍後再試", "page_register")
    finally:
        conn.close()

@app.post("/login")
def api_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    if not username or not password:
        return jsonify({"status": "error", "message": "請輸入帳號與密碼"}), 400

    conn = get_db_connection()
    try:
        user_table = get_user_table(conn)
        row = conn.execute(
            f"SELECT 1 FROM {user_table} WHERE username=? AND password=?",
            (username, password)
        ).fetchone()
        if row:
            session["username"] = username
            return jsonify({"status": "success", "message": "登入成功"})
        return jsonify({"status": "error", "message": "帳號或密碼錯誤"}), 401
    finally:
        conn.close()

@app.post("/api/order")
def api_order():
    if "username" not in session:
        return jsonify({"status": "error", "message": "未登入"}), 401

    data = request.get_json(silent=True) or {}
    items = data.get("items") or []
    date  = (data.get("date") or "").strip()
    time  = (data.get("time") or "").strip()

    if not items:
        return jsonify({"status": "error", "message": "沒有品項"}), 400
    if not date or not time:
        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        time = now.strftime("%H:%M")

    conn = get_db_connection()
    try:
        order_table = get_order_table(conn)  # 會回傳 'shop_list_table'
        with conn:
            for it in items:
                name  = it.get("name")
                price = int(it.get("price", 0))
                qty   = int(it.get("qty", 0))
                total = int(it.get("total", price * qty))
                if not name or qty <= 0:
                    continue
                # 注意這行：欄位名用雙引號，特別是 "Total Price"
                # 若已存在同名 Product，就改用 UPDATE，否則 INSERT
                exists = conn.execute(
                    f'SELECT 1 FROM {order_table} WHERE "Product"=?', (name,)
                ).fetchone()

                if exists:
                    conn.execute(
                        f'UPDATE {order_table} SET "Price"=?, "Number"=?, "Total Price"=?, "Date"=?, "Time"=? WHERE "Product"=?',
                        (price, qty, total, date, time, name)
                    )
                else:
                    conn.execute(
                        f'INSERT INTO {order_table} ("Product","Price","Number","Total Price","Date","Time") VALUES (?,?,?,?,?,?)',
                        (name, price, qty, total, date, time)
                    )
        return jsonify({"status": "success"})
    except Exception as e:
        import traceback; traceback.print_exc()
        logging.exception(e)
        return jsonify({"status": "error", "message": "寫入失敗"}), 500
    finally:
        conn.close()


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("page_login"))


if __name__ == "__main__":
    ensure_schema()
    # 方便你確認用的是同一個檔
    print("Using DB:", DB_PATH.resolve())
    app.run(debug=True)
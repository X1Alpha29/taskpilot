import smtplib
from email.mime.text import MIMEText
def send_welcome_email(to_email, username):
    print("📧 START sending email to:", to_email)

    sender_email = "richardwf7@gmail.com"
    sender_password = "dmps dait qcbn fhuu"

    subject = "Welcome to TaskPilot 🚀"
    body = f"""
Hi {username},

Welcome to TaskPilot!
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            print("🔌 Connecting to SMTP...")
            server.starttls()
            print("🔐 Logging in...")
            server.login(sender_email, sender_password)
            print("📤 Sending message...")
            server.send_message(msg)
            print("✅ Email sent successfully")

    except Exception as e:
        print("❌ EMAIL ERROR:", str(e))
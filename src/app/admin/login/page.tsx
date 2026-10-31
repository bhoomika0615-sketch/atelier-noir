import { AuthForm } from "@/components/auth-form";

export default function AdminLoginPage() {
  return (
    <main className="form-shell auth-page admin-login-page">
      <div className="eyebrow">Restricted access</div>
      <h1 className="section-title">Admin sign in</h1>
      <p className="auth-intro">For authorized Atelier Noir administrators only.</p>
      <AuthForm mode="admin" />
    </main>
  );
}
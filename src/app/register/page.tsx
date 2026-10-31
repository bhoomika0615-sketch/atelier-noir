import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="form-shell auth-page">
      <div className="eyebrow">Begin here</div>
      <h1 className="section-title">Create account</h1>
      <p className="auth-intro">Save your details and keep your orders close.</p>
      <AuthForm mode="register" />
    </main>
  );
}
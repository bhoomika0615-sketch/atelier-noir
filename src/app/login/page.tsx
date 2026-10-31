import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="form-shell auth-page">
      <div className="eyebrow">Welcome back</div>
      <h1 className="section-title">Sign in</h1>
      <p className="auth-intro">Return to your Atelier Noir account.</p>
      <AuthForm mode="login" />
    </main>
  );
}
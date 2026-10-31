 "use client";
import { useState } from "react";
export function AuthForm({mode}:{mode:"login"|"register"|"admin"}) {
 const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");
  try{const endpoint=mode==="admin"?"/api/auth/admin-login":mode==="register"?"/api/auth/register":"/api/auth/login";
   const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...(mode==="register"?{name}:{}),email,password})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Unable to sign in.");
   window.location.href=mode==="admin"?"/admin":"/account";
  }catch(err){setError(err instanceof Error?err.message:"Unable to sign in.");}finally{setBusy(false);}
 }
 return <form className="auth-form" onSubmit={submit}>
 {mode==="register"&&<label className="form-label">Full name<input className="field" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required maxLength={80}/></label>}
 <label className="form-label">Email address<input className="field" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/></label>
 <label className="form-label">Password<input className="field" type="password" autoComplete={mode==="register"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==="register"?12:1} maxLength={128}/></label>
 {error&&<p className="form-error" role="alert">{error}</p>}
 <button className="button form-submit" disabled={busy}>{busy?"Please wait…":mode==="register"?"Create account":"Sign in"} <span aria-hidden="true">↗</span></button>
 </form>;
}
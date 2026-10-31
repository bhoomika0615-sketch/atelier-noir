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
 return <form onSubmit={submit}>
 {mode==="register"&&<><label className="eyebrow">Full name</label><input className="field" value={name} onChange={e=>setName(e.target.value)} required maxLength={80}/></>}
 <label className="eyebrow">Email address</label><input className="field" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/>
 <label className="eyebrow">Password</label><input className="field" type="password" autoComplete={mode==="register"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==="register"?12:1} maxLength={128}/>
 {error&&<p role="alert" style={{fontSize:12,color:"#a12d25"}}>{error}</p>}
 <button className="button" style={{width:"100%"}} disabled={busy}>{busy?"Please wait…":mode==="register"?"Create account":"Sign in"}</button>
 </form>;
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // ✅ Add this
  const printToken = async () => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      console.log("Firebase token:", token);
    } else {
      alert("User not logged in");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Default new users to "user"
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
        });

        alert("Registered successfully!");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          console.log("User role:", role);

          if (role === "admin") {
            navigate("/admin"); // ✅ Redirect admin
          } else {
            navigate("/home"); // ✅ Redirect user
          }
        } else {
          alert("No role found for this user.");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          {isRegistering ? "Register" : "Login"}
        </button>
        <button onClick={printToken} type="button" style={{ marginTop: 10 }}>
          Get Firebase Token (for Postman)
        </button>
      </form>
      <p style={{ color: "red" }}>{error}</p>
      <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: 10 }}>
        {isRegistering ? "Have an account? Login" : "Need an account? Register"}
      </button>
    </div>
  );
}

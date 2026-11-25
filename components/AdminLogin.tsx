import { AppLink } from "@/components/AppLink";
import styles from "./AdminLogin.module.css";

export function AdminLogin() {
  return (
    <main id="main" className={styles.main}>
      <section className={styles.card}>
        <span className="eyebrow">Colgar Foundation · Staff</span>
        <h1>Admin studio</h1>
        <p>Use your approved Google account to sign in. Google authentication and multi-factor authentication are managed through Cloudflare Access.</p>
        <p className={styles.notice} role="status">
          Open the protected Admin Studio hostname to start Google sign-in. If you can see this page there, ask an administrator to verify the Google identity provider, Access application, and your staff role.
        </p>
        <AppLink className={styles.returnLink} href="/admin">Continue with Google ↗</AppLink>
      </section>
    </main>
  );
}

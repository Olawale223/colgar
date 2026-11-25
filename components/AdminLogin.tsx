import { AppLink } from "@/components/AppLink";
import styles from "./AdminLogin.module.css";

export function AdminLogin() {
  return (
    <main id="main" className={styles.main}>
      <section className={styles.card}>
        <span className="eyebrow">Colgar Foundation · Staff</span>
        <h1>Admin studio</h1>
        <p>Staff sign-in and multi-factor authentication are managed through Cloudflare Access.</p>
        <p className={styles.notice} role="status">
          Open the private Admin Studio host to start sign-in. If you can see this page there, ask an administrator to verify the Access application and your staff role.
        </p>
        <AppLink className={styles.returnLink} href="/admin">Continue to Admin Studio ↗</AppLink>
      </section>
    </main>
  );
}

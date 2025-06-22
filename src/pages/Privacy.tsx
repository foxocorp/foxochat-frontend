import { Page } from "@components/Base/Page/Page";
import * as styles from "./Privacy.module.scss";

const Privacy = () => {
	return (
		<Page>
			<div className={styles.privacy}>
				<h1>Privacy Policy for FoxoChat</h1>
				<p>Effective Date: 05/12/2024</p>

				<p>At FoxoChat, accessible from https://foxochat.app/, your privacy is of utmost importance to us. This Privacy Policy outlines the types of information we collect, how we use it, and your rights regarding your data.</p>

				<h2>1. Information We Collect</h2>
				<p>We collect information through the use of cookies. Cookies are small text files that are stored on your device to help us improve your experience on our site. Cookies may collect data such as your IP address, browser type, pages visited, and the time spent on our website.</p>

				<h2>2. Use of Information</h2>
				<p>The information we collect is used to:</p>
				<ul>
					<li>Enhance user experience by analyzing site usage.</li>
					<li>Improve our website by understanding user behavior.</li>
					<li>Provide necessary site functionality.</li>
				</ul>

				<h2>3. Cookies</h2>
				<p>Cookies can be managed through your browser settings. You can choose to accept or decline cookies. However, declining cookies may prevent you from taking full advantage of the website.</p>

				<h2>4. Data Sharing and Disclosure</h2>
				<p>We do not sell or share your personal data with third parties. However, we may disclose your information if required by law or to protect our rights.</p>

				<h2>5. Data Security</h2>
				<p>We take reasonable measures to protect your information. However, no method of transmission over the internet or method of electronic storage is completely secure. Therefore, we cannot guarantee its absolute security.</p>

				<h2>6. Your Rights</h2>
				<p>As a user, you have the right to:</p>
				<ul>
					<li>Access the information we hold about you.</li>
					<li>Request correction of any inaccurate data.</li>
					<li>Request deletion of your personal data.</li>
				</ul>
				<p>To exercise any of these rights, please contact us at <a href="mailto:legal@foxochat.app">legal@foxochat.app</a>.</p>

				<h2>7. Changes to This Privacy Policy</h2>
				<p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

				<h2>8. Contact Us</h2>
				<p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:legal@foxochat.app">legal@foxochat.app</a>.</p>

				<p>By using our website, you agree to the collection and use of information in accordance with this policy.</p>
			</div>
		</Page>
	);
};

export default Privacy; 
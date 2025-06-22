import { Page } from "@components/Base/Page/Page";
import * as styles from "./Terms.module.scss";

const Terms = () => {
	return (
		<Page>
			<div className={styles.terms}>
				<h1>Terms of Service for FoxoChat</h1>
				<p>Effective Date: 05/12/2024</p>

				<p>Welcome to FoxoChat, a new generation open-source messenger. By accessing or using our website at https://foxochat.app/ (the "Site") and the services provided through it (collectively, the "Services"), you agree to comply with and be bound by the following terms or service ("Terms"). If you do not agree to these Terms, please do not use our Services.</p>

				<h2>1. Acceptance of Terms</h2>
				<p>By using the Site and the Services, you affirm that you are of legal age to enter into these Terms or have obtained parental or guardian consent. If you are using the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.</p>

				<h2>2. Modification of Terms</h2>
				<p>FoxoChat reserves the right to modify these Terms at any time. Any changes will be effective immediately upon posting the revised Terms on the Site. Your continued use of the Services after any changes indicates your acceptance of the new Terms.</p>

				<h2>3. User Accounts</h2>
				<p>To access certain features of the Services, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

				<h2>4. User Conduct</h2>
				<p>You agree to use the Services only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use of the Services. Prohibited conduct includes, but is not limited to, harassment, impersonation, transmission of spam, or any unlawful activity.</p>

				<h2>5. Intellectual Property</h2>
				<p>All content, trademarks, and other intellectual property rights associated with the Services are owned by or licensed to FoxoChat. You are granted a limited, non-exclusive, non-transferable license to access and use the Services for personal, non-commercial use only. Any unauthorized use of the content may violate copyright, trademark, and other laws.</p>

				<h2>6. Open Source Software</h2>
				<p>FoxoChat is an open-source messenger, and we encourage contributions from the community. The use of third-party open-source software is governed by the respective licenses of those software components. Please review those licenses for more information on your rights and obligations.</p>

				<h2>7. Privacy Policy</h2>
				<p>Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your personal information. By using our Services, you consent to the collection and use of your information as outlined in our Privacy Policy.</p>

				<h2>8. Disclaimer of Warranties</h2>
				<p>The Services are provided "as is" and "as available" without any warranties of any kind, either express or implied. FoxoChat does not warrant that the Services will be uninterrupted, error-free, or free of viruses or other harmful components.</p>

				<h2>9. Limitation of Liability</h2>
				<p>To the fullest extent permitted by law, FoxoChat shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services. In no event shall FoxoChat's total liability to you for all damages exceed the amount paid by you, if any, for accessing the Services.</p>

				<h2>10. Governing Law</h2>
				<p>These Terms shall be governed by and construed in accordance with the laws of Germany, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Germany.</p>

				<h2>11. Severability</h2>
				<p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>

				<h2>12. Contact Information</h2>
				<p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@foxochat.app">legal@foxochat.app</a>.</p>

				<p>By using the Site and the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>

				<p>Last Updated: 05/12/2024</p>
			</div>
		</Page>
	);
};

export default Terms; 
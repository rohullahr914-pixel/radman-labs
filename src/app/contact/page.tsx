import { ContactCards } from "@/components/site";
export const metadata = {
  title: "Contact",
  description:
    "Connect with Rohullah Radman and Radman Labs on GitHub or WhatsApp.",
};
export default function Contact() {
  return (
    <div className="wrap">
      <div className="page-head">
        <div className="eyebrow">Open a conversation</div>
        <h1>Let’s build something useful.</h1>
        <p>
          Questions about a product, feedback, or an idea? Get in touch
          directly.
        </p>
      </div>
      <ContactCards />
    </div>
  );
}
